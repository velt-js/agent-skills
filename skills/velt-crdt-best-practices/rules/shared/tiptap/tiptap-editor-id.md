---
title: Use Unique editorId for Each Tiptap Instance
impact: HIGH
impactDescription: Prevents content cross-contamination
tags: tiptap, editorId, unique, multiple-editors
---

## Use Unique editorId for Each Tiptap Instance

Each Tiptap editor must have a unique `editorId`. If you have multiple editors in your app (or across pages), reusing the same ID causes content to merge incorrectly.

**Incorrect (same editorId for different editors):**

```tsx
// Page 1: Document editor
const { VeltCrdt } = useVeltTiptapCrdtExtension({
  editorId: 'editor',  // Generic ID
});

// Page 2: Notes sidebar
const { VeltCrdt } = useVeltTiptapCrdtExtension({
  editorId: 'editor',  // Same ID - content will merge!
});
```

**Correct (unique editorId per logical editor):**

```tsx
// Page 1: Document editor
const { VeltCrdt } = useVeltTiptapCrdtExtension({
  editorId: `document-${documentId}`,  // Unique per document
});

// Page 2: Notes sidebar
const { VeltCrdt } = useVeltTiptapCrdtExtension({
  editorId: `notes-${documentId}`,  // Different namespace
});
```

**EditorId Naming Strategies:**

| Pattern | Example | Use Case |
|---------|---------|----------|
| Feature + ID | `document-${id}` | Multiple documents |
| Section-based | `${page}-${section}` | Multi-section pages |
| Component-based | `main-editor`, `sidebar-notes` | Single-page apps |

**Verification:**
- [ ] Each editor has a unique `editorId`
- [ ] editorId consistent across page reloads for same editor
- [ ] Content doesn't appear in wrong editors
- [ ] Collaborators on same editorId see each other's changes

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (## Notes > **Unique editorId**: Use a unique `editorId` per editor instance)
