---
title: Use Unique editorId for Each CodeMirror Instance
impact: HIGH
impactDescription: Prevents content cross-contamination
tags: codemirror, editorId, unique
---

## Use Unique editorId for Each CodeMirror Instance

Each CodeMirror editor must have a unique `editorId`. Reusing IDs causes code from different editors to merge incorrectly.

**Incorrect (same ID for different files):**

```tsx
// file1.tsx
const { primitives } = useCollaboration({ editorId: 'code' });

// file2.tsx
const { primitives } = useCollaboration({ editorId: 'code' });
// Content will merge between files!
```

**Correct (unique ID per file/editor — v2 hook):**

```tsx
import { useCollaboration } from '@veltdev/codemirror-crdt-react';

const { primitives, manager } = useCollaboration({
  editorId: `code-${fileId}`,  // Unique per file
});
```

The same rule applies to the deprecated v1 hook `useVeltCodeMirrorCrdtExtension` and the deprecated non-React `createVeltCodeMirrorStore` — every editor instance, regardless of API version, needs a unique `editorId`.

**EditorId Strategies:**

| Pattern | Example | Use Case |
|---------|---------|----------|
| File-based | `file-${fileId}` | Multi-file editor |
| Tab-based | `tab-${tabId}` | Tabbed editor |
| Path-based | `code-${filePath}` | File browser |

**Verification:**
- [ ] Each editor has unique `editorId`
- [ ] ID consistent across page reloads
- [ ] Code doesn't appear in wrong files

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (## Notes > **Unique editorId**)
