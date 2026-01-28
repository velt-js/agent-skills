---
title: Use createVeltTipTapStore for Non-React Tiptap
impact: CRITICAL
impactDescription: Required for Tiptap collaboration in Vue/Angular/vanilla
tags: tiptap, vanilla, createVeltTipTapStore
---

## Use createVeltTipTapStore for Non-React Tiptap

For Vue, Angular, or vanilla JS, use `createVeltTipTapStore` to create the CRDT store, then get the collaboration extension.

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
await veltClient.identify(user);

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
    StarterKit.configure({ history: false }),  // Disable history!
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
- [ ] `initVelt()` and `identify()` called first
- [ ] `veltClient.setDocument()` called
- [ ] `history: false` in StarterKit config
- [ ] `store.destroy()` called on cleanup

**Source Pointer:** `/docs/realtime-collaboration/crdt/setup/tiptap.mdx` (### Step 3: Initialize Velt CRDT Extension > Other Frameworks)
