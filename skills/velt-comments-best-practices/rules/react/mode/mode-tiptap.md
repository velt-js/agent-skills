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
// BubbleMenu MUST be imported from @tiptap/react/menus (NOT @tiptap/react)
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { TiptapVeltComments, addComment, renderComments } from '@veltdev/tiptap-velt-comments';
import { useCommentAnnotations } from '@veltdev/react';

export default function TipTapComponent({ scrollContainerRef }) {
  const commentAnnotations = useCommentAnnotations();

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapVeltComments,
    ],
    content: '<p>Hello Velt!</p>',
    immediatelyRender: false,
  });

  // Render comment highlights when annotations change
  useEffect(() => {
    if (editor && commentAnnotations?.length) {
      renderComments({ editor, commentAnnotations });
    }
  }, [editor, commentAnnotations]);

  const handleAddComment = () => {
    if (!editor) return;
    // Preserve scroll position — adding comments can cause the editor to jump
    const scrollContainer = scrollContainerRef?.current;
    const scrollTop = scrollContainer?.scrollTop ?? 0;
    addComment({ editor });
    if (scrollContainer) {
      requestAnimationFrame(() => {
        scrollContainer.scrollTop = scrollTop;
      });
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

**Key Functions:**

| Function | Purpose |
|----------|---------|
| `TiptapVeltComments` | Extension to add to editor config |
| `addComment({ editor })` | Create comment on selected text |
| `renderComments({ editor, commentAnnotations })` | Render existing comment highlights |
| `useCommentAnnotations()` | Hook to get comment annotation data |

> Note: Older v4 packages exported `triggerAddComment` and `highlightComments` — these are deprecated. Use `addComment` and `renderComments` instead.

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
