---
title: Use Unique editorId for Each BlockNote Instance
impact: HIGH
impactDescription: Prevents content cross-contamination
tags: blocknote, editorId, unique
---

## Use Unique editorId for Each BlockNote Instance

Each BlockNote editor must have a unique `editorId`. Reusing IDs causes content from different editors to merge incorrectly.

**Incorrect (hardcoded generic ID):**

```tsx
import { useCollaboration } from '@veltdev/blocknote-crdt-react';

const { collaborationConfig } = useCollaboration({
  editorId: 'editor',  // Will conflict with other editors
});
```

**Correct (unique ID per editor):**

```tsx
import { useCollaboration } from '@veltdev/blocknote-crdt-react';

const { collaborationConfig } = useCollaboration({
  editorId: `blocknote-${documentId}`,  // Unique per document
});
```

> Both the v2 hook `useCollaboration` and the deprecated v1 hook `useVeltBlockNoteCrdtExtension` accept `editorId` with the same semantics. New code should use `useCollaboration` — see `rules/shared/blocknote/blocknote-collaboration-manager.md`.

**EditorId Strategies:**

| Pattern | Example |
|---------|---------|
| Document-based | `doc-${documentId}` |
| Feature-based | `main-editor`, `sidebar` |
| User + doc | `${userId}-${docId}` |

**Verification:**
- [ ] Each editor has unique `editorId`
- [ ] ID consistent across page reloads
- [ ] Content doesn't appear in wrong editors

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/blocknote` (## Notes > **Unique editorId**)
