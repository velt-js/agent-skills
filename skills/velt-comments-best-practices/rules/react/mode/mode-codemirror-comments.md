---
title: Integrate Comments with CodeMirror Editor
impact: MEDIUM
impactDescription: Text comments in CodeMirror code editor with highlight decorations
tags: codemirror, editor, text-comments, setup
---

## Integrate Comments with CodeMirror Editor

Add collaborative text comments to a CodeMirror editor using Velt's CodeMirror extension. Users can select text and add comments that persist as decorations in the editor.

**Incorrect (using default text mode instead of extension):**

```jsx
// Default text mode doesn't integrate with CodeMirror properly
<VeltComments textMode={true} />
<div ref={editorRef} />
```

**Correct (with CodeMirror extension):**

**Step 1: Install the extension**
```bash
npm install @veltdev/codemirror-velt-comments
```

**Step 2: Configure VeltComments**
```jsx
import { VeltProvider, VeltComments } from '@veltdev/react';

// Disable default text mode when using editor integration
<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={false} />
</VeltProvider>
```

**Step 3: Add extension to CodeMirror editor**
```jsx
import { useRef, useState, useEffect } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { CodemirrorVeltComments, addComment, renderComments } from '@veltdev/codemirror-velt-comments';
import { useCommentAnnotations } from '@veltdev/react';

function CodeMirrorEditorComponent() {
  const editorRef = useRef(null);
  const [editorView, setEditorView] = useState(null);
  const savedSelectionRef = useRef(null);
  const commentAnnotations = useCommentAnnotations();

  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      doc: 'Your initial content here',
      extensions: [
        basicSetup,
        CodemirrorVeltComments(),
      ],
      parent: editorRef.current,
    });

    setEditorView(view);
    return () => view.destroy();
  }, []);

  // Render comments when annotations change
  useEffect(() => {
    if (editorView && commentAnnotations?.length) {
      renderComments({
        editor: editorView,
        commentAnnotations,
      });
    }
  }, [editorView, commentAnnotations]);

  const saveSelection = () => {
    if (editorView) {
      const { from, to } = editorView.state.selection.main;
      if (from !== to) {
        savedSelectionRef.current = { from, to };
      }
    }
  };

  const handleAddComment = () => {
    if (editorView) {
      if (savedSelectionRef.current) {
        const { from, to } = savedSelectionRef.current;
        if (from !== to) {
          editorView.dispatch({
            selection: { anchor: from, head: to },
          });
        }
      }
      addComment({ editor: editorView });
      savedSelectionRef.current = null;
    }
  };

  return (
    <div>
      <button
        onClick={(e) => {
          e.preventDefault();
          saveSelection();
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
- `CodemirrorVeltComments()` - Extension to add to the editor
- `addComment({ editor })` - Create comment on selected text
- `renderComments({ editor, commentAnnotations })` - Render existing comments
- `useCommentAnnotations()` - Hook to get comment data

**Important: Selection Preservation**

When clicking a button, the browser moves focus and clears the editor selection. You must save the selection on `mousedown` (before focus changes) and restore it via `editorView.dispatch()` before adding the comment.

**With Custom Metadata (Context):**
```jsx
addComment({
  editor: editorView,
  editorId: 'my-editor-1',
  context: {
    storyId: 'story-123',
    section: 'intro',
  },
});
```

**Configure Mark Persistence:**
```jsx
const view = new EditorView({
  extensions: [
    CodemirrorVeltComments({
      persistVeltMarks: false, // Set false if storing content yourself
    }),
  ],
  parent: editorRef.current,
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
- [ ] @veltdev/codemirror-velt-comments is installed
- [ ] VeltComments has textMode={false}
- [ ] CodemirrorVeltComments() added to editor extensions
- [ ] renderComments called when annotations change
- [ ] Selection is saved on mousedown and restored before addComment

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/codemirror - Complete setup
