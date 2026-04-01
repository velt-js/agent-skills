---
title: Integrate Comments with TipTap Editor
impact: HIGH
impactDescription: Text comments in TipTap rich text editor with highlight marks
tags: tiptap, editor, rich-text, text-comments, bubble-menu
---

## Integrate Comments with TipTap Editor

Add collaborative text comments to TipTap editor using Velt's TipTap extension. Users can select text and add comments that persist as marks in the editor.

**Incorrect (using default text mode instead of extension):**

```jsx
// Default text mode doesn't integrate with TipTap properly
<VeltComments textMode={true} />
<Editor ... />
```

**Correct (with TipTap extension):**

**Step 1: Install the extension**
```bash
npm install @veltdev/tiptap-velt-comments
```

**Step 2: Configure VeltComments**
```jsx
import { VeltProvider, VeltComments } from '@veltdev/react';

// Disable default text mode when using editor integration
<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={false} />
</VeltProvider>
```

**Step 3: Add extension to TipTap editor**
```jsx
// Tiptap v3: BubbleMenu is in @tiptap/react/menus (NOT @tiptap/react)
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { TiptapVeltComments } from '@veltdev/tiptap-velt-comments';
import { useCommentAnnotations } from '@veltdev/react';

// API differs by version:
// v4: import { triggerAddComment, highlightComments } from '@veltdev/tiptap-velt-comments'
// v5: import { addComment, renderComments } from '@veltdev/tiptap-velt-comments'

export default function TipTapComponent() {
  const commentAnnotations = useCommentAnnotations();

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapVeltComments,
    ],
    content: '<p>Hello Velt!</p>',
    immediatelyRender: false,
  });

  // Render comments when annotations change
  // v4: highlightComments(editor, commentAnnotations)
  // v5: renderComments({ editor, commentAnnotations })
  useEffect(() => {
    if (editor && commentAnnotations?.length) {
      // Use whichever function your installed version exports
      highlightComments(editor, commentAnnotations);
    }
  }, [editor, commentAnnotations]);

  const handleAddComment = () => {
    if (editor) {
      // v4: triggerAddComment(editor)
      // v5: addComment({ editor })
      triggerAddComment(editor);
    }
  };

  return (
    <div>
      <EditorContent editor={editor} />

      {editor && (
        <BubbleMenu editor={editor}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddComment();
            }}
          >
            Add Comment
          </button>
        </BubbleMenu>
      )}
    </div>
  );
}
```

**Key Functions (check your installed version):**

| v4 API | v5 API | Purpose |
|--------|--------|---------|
| `TiptapVeltComments` | `TiptapVeltComments` | Extension to add to editor |
| `triggerAddComment(editor)` | `addComment({ editor })` | Create comment on selected text |
| `highlightComments(editor, annotations)` | `renderComments({ editor, commentAnnotations })` | Render existing comments |
| `useCommentAnnotations()` | `useCommentAnnotations()` | Hook to get comment data |

**Tiptap v3 notes:**
- `BubbleMenu` import: `@tiptap/react/menus` (NOT `@tiptap/react`)
- `tippyOptions` prop was removed in v3 — do not use it
- `@floating-ui/dom` is a required peer dependency for BubbleMenu

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
const editor = useEditor({
  extensions: [
    TiptapVeltComments.configure({
      persistVeltMarks: false, // Set false if storing HTML yourself
    }),
  ],
});
```

**Style Commented Text:**
```css
velt-comment-text[comment-available="true"] {
  background-color: #ffff00;
}
```

**Verification Checklist:**
- [ ] @veltdev/tiptap-velt-comments is installed
- [ ] VeltComments has textMode={false}
- [ ] TiptapVeltComments extension added to editor
- [ ] renderComments called when annotations change
- [ ] BubbleMenu has comment button

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/tiptap - Complete setup
