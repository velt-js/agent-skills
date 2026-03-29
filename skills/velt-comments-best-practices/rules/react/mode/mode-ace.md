---
title: Integrate Comments with Ace Editor
impact: MEDIUM
impactDescription: Text comments in Ace code editor with highlight marks
tags: ace, editor, text-comments, setup
---

## Integrate Comments with Ace Editor

Add collaborative text comments to an Ace editor using Velt's Ace extension. Users can select text and add comments that persist as marks in the editor.

**Incorrect (using default text mode instead of extension):**

```jsx
// Default text mode doesn't integrate with Ace properly
<VeltComments textMode={true} />
<AceEditor ... />
```

**Correct (with Ace extension):**

**Step 1: Install the extension**
```bash
npm install @veltdev/ace-velt-comments
```

**Step 2: Configure VeltComments**
```jsx
import { VeltProvider, VeltComments } from '@veltdev/react';

// Disable default text mode when using editor integration
<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={false} />
</VeltProvider>
```

**Step 3: Initialize Ace editor with Velt extension**
```jsx
import { useEffect, useRef, useCallback } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-markdown';
import 'ace-builds/src-noconflict/theme-github';
import { AceVeltComments, addComment, renderComments } from '@veltdev/ace-velt-comments';
import { useCommentAnnotations } from '@veltdev/react';

function AceEditorComponent() {
  const editorRef = useRef(null);
  const cleanupRef = useRef(null);
  const commentAnnotations = useCommentAnnotations();

  const handleLoad = useCallback((editor) => {
    editorRef.current = editor;
    // Initialize Velt comments - returns a cleanup function
    cleanupRef.current = AceVeltComments(editor);
  }, []);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  // Render comments when annotations change
  useEffect(() => {
    if (editorRef.current && commentAnnotations?.length) {
      renderComments({
        editor: editorRef.current,
        commentAnnotations,
      });
    }
  }, [commentAnnotations]);

  return (
    <div>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          if (editorRef.current) {
            addComment({ editor: editorRef.current });
          }
        }}
      >
        Add Comment
      </button>
      <AceEditor
        mode="markdown"
        theme="github"
        name="ace-editor"
        defaultValue="Your initial content here"
        onLoad={handleLoad}
        width="100%"
        height="100%"
      />
    </div>
  );
}
```

**Key Functions:**
- `AceVeltComments(editor)` - Initialize extension, returns cleanup function
- `addComment({ editor })` - Create comment on selected text
- `renderComments({ editor, commentAnnotations })` - Render existing comments
- `useCommentAnnotations()` - Hook to get comment data

**With Custom Metadata (Context):**
```jsx
addComment({
  editor: editorRef.current,
  editorId: 'my-editor-1',
  context: {
    storyId: 'story-123',
    section: 'intro',
  },
});
```

**Configure Mark Persistence:**
```jsx
const cleanup = AceVeltComments(editor, {
  persistVeltMarks: false, // Set false if storing content yourself
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
- [ ] @veltdev/ace-velt-comments is installed
- [ ] VeltComments has textMode={false}
- [ ] AceVeltComments() called with editor instance on load
- [ ] Cleanup function called on component unmount
- [ ] renderComments called when annotations change

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/ace - Complete setup
