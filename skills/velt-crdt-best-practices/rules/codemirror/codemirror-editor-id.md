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
const { store } = useVeltCodeMirrorCrdtExtension({ editorId: 'code' });

// file2.tsx
const { store } = useVeltCodeMirrorCrdtExtension({ editorId: 'code' });
// Content will merge between files!
```

**Correct (unique ID per file/editor):**

```tsx
const { store } = useVeltCodeMirrorCrdtExtension({
  editorId: `code-${fileId}`,  // Unique per file
});
```

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

**Source Pointer:** `/docs/realtime-collaboration/crdt/setup/codemirror.mdx` (## Notes > **Unique editorId**)
