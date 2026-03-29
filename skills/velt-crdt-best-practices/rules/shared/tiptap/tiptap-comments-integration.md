---
title: Integrate TiptapVeltComments Extension When Using Comments with CRDT
impact: CRITICAL
impactDescription: Without the TiptapVeltComments extension in the editor, the app will FREEZE when users try to add comments
tags: tiptap, comments, crdt, freeze, extension, TiptapVeltComments
---

## Integrate TiptapVeltComments Extension When Using Comments with CRDT

When both Comments and CRDT features are selected for a Tiptap editor, the `TiptapVeltComments` extension **must** be added to the editor's extensions array. The global `<VeltComments>` component alone is not sufficient — it initializes the comment infrastructure but the editor needs the extension to handle comment creation and rendering. Without it, the app freezes when a user tries to add a comment.

**Required integration (3 parts):**

### Part 1: Add the extension to the editor

```tsx
import { TiptapVeltComments, triggerAddComment, highlightComments } from "@veltdev/tiptap-velt-comments";
import { useCommentAnnotations } from "@veltdev/react";

const editor = useEditor({
  extensions: [
    StarterKit.configure({ undoRedo: false }),
    TiptapVeltComments,              // MUST be before CRDT extension
    ...(VeltCrdt ? [VeltCrdt] : []), // CRDT extension last
  ],
  immediatelyRender: false,
}, [VeltCrdt]);
```

### Part 2: Render comment highlights

```tsx
const commentAnnotations = useCommentAnnotations();

useEffect(() => {
  if (editor && commentAnnotations?.length) {
    highlightComments(editor, commentAnnotations);
  }
}, [editor, commentAnnotations]);
```

### Part 3: Add a comment trigger button

```tsx
<button onClick={() => triggerAddComment(editor)}>💬 Comment</button>
```

**API version note:**
- v4.x exports: `TiptapVeltComments`, `triggerAddComment`, `highlightComments`
- v5.x exports: `TiptapVeltComments`, `addComment`, `renderComments`

Check your installed version's actual exports if unsure.

**Common mistake — causes FREEZE:**

```tsx
// WRONG: VeltComments wrapper without editor extension
<VeltComments textMode={false} />  // Global wrapper — necessary but NOT sufficient
<TiptapEditor /> // Editor WITHOUT TiptapVeltComments in extensions — FREEZE on comment

// CORRECT: Both global wrapper AND editor extension
<VeltComments textMode={false} />  // Global wrapper
<TiptapEditor /> // Editor WITH TiptapVeltComments in extensions array
```

**Verification:**
- [ ] `TiptapVeltComments` is in the editor's extensions array
- [ ] `useCommentAnnotations()` is called and wired to `highlightComments`
- [ ] Comment button calls `triggerAddComment(editor)` (v4) or `addComment({ editor })` (v5)
- [ ] Selecting text and clicking comment does NOT freeze the page
- [ ] Comment highlights appear on annotated text

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap`
