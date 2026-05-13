---
title: Use createVeltTipTapStore for Non-React Tiptap (v1 — DEPRECATED)
impact: LOW
impactDescription: v1 API retained for backwards-compatibility only. New integrations must use the v2 createCollaboration entry point (see tiptap-collaboration-manager.md and tiptap-v1-to-v2-migration.md).
tags: tiptap, vanilla, createVeltTipTapStore, deprecated, v1
---

## Use createVeltTipTapStore for Non-React Tiptap (v1 — DEPRECATED)

> **DEPRECATED:** This rule documents the v1 non-React Tiptap CRDT API and is retained for backwards-compatibility reference only. **New integrations must use `createCollaboration` from `@veltdev/tiptap-crdt`** — see `rules/shared/tiptap/tiptap-collaboration-manager.md` for the canonical v2 pattern (which covers both React and non-React) and `rules/shared/tiptap/tiptap-v1-to-v2-migration.md` for the migration table.

For Vue, Angular, or vanilla JS, the v1 API uses `createVeltTipTapStore` to create the CRDT store, then get the collaboration extension.

**Correct (vanilla JS implementation):**

```js
import { initVelt } from '@veltdev/client';
import { createVeltTipTapStore } from '@veltdev/tiptap-crdt';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';

// Step 1: Initialize Velt client
const veltClient = await initVelt('YOUR_API_KEY');

// Step 2: Authenticate user
const user = { userId: 'user-1', name: 'John Doe', color: '#3b82f6' };
await veltClient.setVeltAuthProvider({
  user,
  generateToken: async () => {
    const resp = await fetch('/api/velt/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.userId }),
    });
    const { token } = await resp.json();
    return token;
  },
});

// Step 3: Set document
await veltClient.setDocument('my-document-id');

// Step 4: Create CRDT store
const store = await createVeltTipTapStore({
  editorId: 'velt-tiptap-crdt-demo',
  veltClient: veltClient,
});

// Step 5: Create TipTap editor
const editor = new Editor({
  element: document.getElementById('editor'),
  extensions: [
    StarterKit.configure({ undoRedo: false }),  // Disable history (Tiptap v3)
    store.getCollabExtension(),
    CollaborationCaret.configure({
      provider: store.getStore().getProvider(),
      user: { name: user.name, color: user.color },
    }),
  ],
  content: '',
});

// Cleanup on unmount
editor.destroy();
store.destroy();
```

**Store Methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `getCollabExtension()` | Extension | Tiptap collaboration extension |
| `getStore()` | Store | Underlying CRDT store |
| `getYDoc()` | Y.Doc | Yjs document |
| `getYXml()` | Y.XmlFragment | Yjs XML for rich text |
| `destroy()` | void | Cleanup resources |

**Verification:**
- [ ] `initVelt()` and `setVeltAuthProvider()` called first
- [ ] `veltClient.setDocument()` called
- [ ] `undoRedo: false` in StarterKit config
- [ ] `store.destroy()` called on cleanup

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (### Step 3: Initialize Velt CRDT Extension > Other Frameworks)
