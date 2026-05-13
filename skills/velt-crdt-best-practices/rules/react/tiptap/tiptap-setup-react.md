---
title: Use useVeltTiptapCrdtExtension Hook for React Tiptap (v1 — DEPRECATED)
impact: LOW
impactDescription: v1 API retained for backwards-compatibility only. New integrations must use the v2 useCollaboration hook (see tiptap-collaboration-manager.md and tiptap-v1-to-v2-migration.md).
tags: tiptap, react, hook, useVeltTiptapCrdtExtension, deprecated, v1
---

## Use useVeltTiptapCrdtExtension Hook for React Tiptap (v1 — DEPRECATED)

> **DEPRECATED:** This rule documents the v1 React Tiptap CRDT API and is retained for backwards-compatibility reference only. **New integrations must use `useCollaboration` from `@veltdev/tiptap-crdt-react`** — see `rules/shared/tiptap/tiptap-collaboration-manager.md` for the canonical v2 pattern and `rules/shared/tiptap/tiptap-v1-to-v2-migration.md` for the migration table.

In React, the v1 API uses `useVeltTiptapCrdtExtension` to get the `VeltCrdt` extension for Tiptap. Pass it to `useEditor` extensions array.

**Incorrect (missing VeltCrdt extension):**

```tsx
const editor = useEditor({
  extensions: [StarterKit],
  content: '',
});
// No CRDT - collaboration won't work
```

**Correct (with VeltCrdt extension):**

```tsx
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useVeltTiptapCrdtExtension } from '@veltdev/tiptap-crdt-react';

function CollaborativeEditor() {
  const { VeltCrdt } = useVeltTiptapCrdtExtension({
    editorId: 'velt-tiptap-crdt-demo',
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        undoRedo: false,  // IMPORTANT: Disable history (Tiptap v3 uses undoRedo, not history)
      }),
      ...(VeltCrdt ? [VeltCrdt] : []),
    ],
    content: '',
  }, [VeltCrdt]);

  return <EditorContent editor={editor} />;
}
```

**Hook Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `editorId` | string | Unique identifier for this editor |
| `initialContent` | string (optional) | Initial HTML content |
| `debounceMs` | number (optional) | Debounce time for sync |

**Hook Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `VeltCrdt` | Extension \| null | Tiptap extension to add to editor |
| `store` | TiptapStore \| null | Underlying CRDT store |
| `isLoading` | boolean | True until store is ready |

**Next.js SSR Safety:**
In Next.js, the Tiptap editor component must be loaded with `next/dynamic` and `ssr: false`. See the `tiptap-nextjs-ssr` rule for the complete pattern. Direct imports in page components will cause server-side rendering crashes.

**Verification:**
- [ ] `editorId` is unique per editor instance
- [ ] `VeltCrdt` added to extensions array
- [ ] `undoRedo: false` set on StarterKit
- [ ] Connection status shows "Connected"
- [ ] In Next.js: editor loaded via `next/dynamic` with `ssr: false`

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (### Step 3: Initialize Velt CRDT Extension > React / Next.js)
