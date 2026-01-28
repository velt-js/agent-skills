---
title: Use useVeltTiptapCrdtExtension Hook for React Tiptap
impact: CRITICAL
impactDescription: Required for Tiptap collaboration in React
tags: tiptap, react, hook, useVeltTiptapCrdtExtension
---

## Use useVeltTiptapCrdtExtension Hook for React Tiptap

In React, use `useVeltTiptapCrdtExtension` to get the `VeltCrdt` extension for Tiptap. Pass it to `useEditor` extensions array.

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
        history: false,  // IMPORTANT: Disable history
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

**Verification:**
- [ ] `editorId` is unique per editor instance
- [ ] `VeltCrdt` added to extensions array
- [ ] `history: false` set on StarterKit
- [ ] Connection status shows "Connected"

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (### Step 3: Initialize Velt CRDT Extension > React / Next.js)
