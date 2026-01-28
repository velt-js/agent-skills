---
title: Disable Tiptap History When Using CRDT
impact: CRITICAL
impactDescription: Prevents undo/redo conflicts and content desync
tags: tiptap, history, undo, redo, conflict
---

## Disable Tiptap History When Using CRDT

Tiptap's built-in history extension conflicts with CRDT's undo/redo mechanism. You MUST disable it to prevent content desync and unexpected undo behavior.

**Incorrect (history enabled - causes conflicts):**

```tsx
const editor = useEditor({
  extensions: [
    StarterKit,  // history enabled by default!
    ...(VeltCrdt ? [VeltCrdt] : []),
  ],
});
// Undo/redo will conflict with CRDT, causing desync
```

**Correct (history explicitly disabled):**

```tsx
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      history: false,  // CRITICAL: Disable history
    }),
    ...(VeltCrdt ? [VeltCrdt] : []),
  ],
  content: '',
}, [VeltCrdt]);
```

**Why this matters:**
- Tiptap history tracks local changes only
- CRDT tracks all changes (local + remote)
- Both trying to manage undo/redo causes conflicts
- CRDT's Yjs UndoManager handles collaborative undo correctly

**Symptoms of enabled history:**
- Content appears then disappears
- Undo undoes other users' changes
- Editor state becomes inconsistent
- Random content jumps

**Verification:**
- [ ] `StarterKit.configure({ history: false })` is set
- [ ] Undo/redo works correctly across collaborators
- [ ] No content flashing or jumping

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (## Notes > **Disable history**: Turn off Tiptap `history` when using collaboration)
