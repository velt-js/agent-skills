---
title: Integrate Comments with Quill Editor
impact: MEDIUM
impactDescription: Text comments in Quill rich text editor with highlight marks
tags: quill, editor, text-comments, setup
---

## Integrate Comments with Quill Editor

Add collaborative text comments to a Quill editor using Velt's Quill module. Users can select text and add comments that persist as marks in the editor.

**Incorrect (using default text mode instead of module):**

```jsx
// Default text mode doesn't integrate with Quill properly
<VeltComments textMode={true} />
<div ref={editorRef} />
```

**Correct (with Quill module):**

**Step 1: Install the extension**
```bash
npm install @veltdev/quill-velt-comments
```

**Step 2: Configure VeltComments**
```jsx
import { VeltProvider, VeltComments } from '@veltdev/react';

// Disable default text mode when using editor integration
<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={false} />
</VeltProvider>
```

**Step 3: Register and configure the Quill module**
```jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import Quill from 'quill';
import { QuillVeltComments, addComment, renderComments } from '@veltdev/quill-velt-comments';
import { useCommentAnnotations } from '@veltdev/react';

// Register the module with Quill (once, outside component)
Quill.register('modules/veltComments', QuillVeltComments);

function QuillEditorComponent() {
  const editorRef = useRef(null);
  const [quill, setQuill] = useState(null);
  const savedSelectionRef = useRef(null);
  const commentAnnotations = useCommentAnnotations();

  useEffect(() => {
    if (!editorRef.current) return;

    const quillInstance = new Quill(editorRef.current, {
      theme: 'snow',
      modules: {
        veltComments: {
          persistVeltMarks: true,
        },
      },
    });

    setQuill(quillInstance);
  }, []);

  // Render comments when annotations change
  useEffect(() => {
    if (quill && commentAnnotations?.length) {
      renderComments({
        editor: quill,
        commentAnnotations,
      });
    }
  }, [quill, commentAnnotations]);

  const handleAddComment = useCallback(() => {
    if (quill) {
      if (savedSelectionRef.current) {
        quill.setSelection(savedSelectionRef.current.index, savedSelectionRef.current.length);
      }
      addComment({ editor: quill });
      savedSelectionRef.current = null;
    }
  }, [quill]);

  return (
    <div>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          const sel = quill?.getSelection();
          if (sel?.length > 0) savedSelectionRef.current = sel;
        }}
        onClick={handleAddComment}
      >
        Add Comment
      </button>
      <div ref={editorRef} />
    </div>
  );
}
```

**Key Functions:**
- `QuillVeltComments` - Module to register with Quill
- `addComment({ editor })` - Create comment on selected text
- `renderComments({ editor, commentAnnotations })` - Render existing comments
- `useCommentAnnotations()` - Hook to get comment data

**Important: Selection Preservation**

When clicking a button, the browser moves focus and clears the editor selection. You must save the selection on `mousedown` (before focus changes) and restore it before adding the comment.

**With Custom Metadata (Context):**
```jsx
addComment({
  editor: quill,
  editorId: 'my-doc-1',
  context: {
    storyId: 'story-123',
    section: 'intro',
  },
});
```

**Configure Mark Persistence:**
```jsx
const quill = new Quill(editorRef.current, {
  theme: 'snow',
  modules: {
    veltComments: {
      persistVeltMarks: false, // Set false if storing content yourself
    },
  },
});
```

**Style Commented Text:**
```css
velt-comment-text {
  background-color: rgba(255, 255, 0, 0.3);
  border-bottom: 2px solid #ffcc00;
  cursor: pointer;
}
```

**Verification Checklist:**
- [ ] @veltdev/quill-velt-comments is installed
- [ ] VeltComments has textMode={false}
- [ ] QuillVeltComments registered with Quill.register()
- [ ] renderComments called when annotations change
- [ ] Selection is saved on mousedown and restored before addComment

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/quill - Complete setup
