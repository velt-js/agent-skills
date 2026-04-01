---
title: Integrate Comments with Plate Editor
impact: MEDIUM
impactDescription: Text comments in Plate.js rich text editor with highlight marks
tags: plate, editor, text-comments, setup
---

## Integrate Comments with Plate Editor

Add collaborative text comments to a Plate.js editor using Velt's Plate plugin. Users can select text and add comments that persist as marks in the editor.

**Incorrect (using default text mode instead of plugin):**

```jsx
// Default text mode doesn't integrate with Plate properly
<VeltComments textMode={true} />
<Plate editor={editor}>
  <PlateContent />
</Plate>
```

**Correct (with Plate plugin):**

**Step 1: Install the extension**
```bash
npm install @veltdev/plate-comments-react
```

**Step 2: Configure VeltComments**
```jsx
import { VeltProvider, VeltComments } from '@veltdev/react';

// Disable default text mode when using editor integration
<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={false} />
</VeltProvider>
```

**Step 3: Add plugin to Plate editor**
```jsx
import { Plate, PlateContent, usePlateEditor } from '@platejs/core/react';
import { VeltCommentsPlugin, addComment, renderComments } from '@veltdev/plate-comments-react';
import { useCommentAnnotations } from '@veltdev/react';

export default function PlateEditorComponent() {
  const commentAnnotations = useCommentAnnotations();

  const editor = usePlateEditor({
    plugins: [VeltCommentsPlugin],
    value: initialValue,
  });

  // Render comments when annotations change
  useEffect(() => {
    if (editor && commentAnnotations) {
      renderComments({
        editor,
        commentAnnotations,
      });
    }
  }, [editor, commentAnnotations]);

  const handleAddComment = () => {
    if (editor) {
      addComment({ editor });
    }
  };

  return (
    <div>
      <button
        onClick={(e) => {
          e.preventDefault();
          handleAddComment();
        }}
      >
        Add Comment
      </button>
      <Plate editor={editor}>
        <PlateContent placeholder="Start typing..." />
      </Plate>
    </div>
  );
}
```

**Key Functions:**
- `VeltCommentsPlugin` - Plugin to add to the Plate editor's plugins array
- `addComment({ editor })` - Create comment on selected text
- `renderComments({ editor, commentAnnotations })` - Render existing comments
- `useCommentAnnotations()` - Hook to get comment data

**With Custom Metadata (Context):**
```jsx
addComment({
  editor,
  editorId: 'my-doc-1',
  context: {
    storyId: 'story-123',
    section: 'intro',
  },
});
```

**Configure Mark Persistence:**
```jsx
const editor = usePlateEditor({
  plugins: [
    VeltCommentsPlugin.configure({
      options: {
        persistVeltMarks: false, // Set false if storing HTML yourself
      },
    }),
  ],
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
- [ ] @veltdev/plate-comments-react is installed
- [ ] VeltComments has textMode={false}
- [ ] VeltCommentsPlugin added to editor plugins
- [ ] renderComments called when annotations change
- [ ] Comment button uses onClick with preventDefault

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/plate - Complete setup
