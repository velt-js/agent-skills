---
title: Use createVeltCodeMirrorStore for Non-React CodeMirror
impact: CRITICAL
impactDescription: Required for CodeMirror CRDT in vanilla JS
tags: codemirror, vanilla, createVeltCodeMirrorStore
---

## Use createVeltCodeMirrorStore for Non-React CodeMirror

For vanilla JS, Vue, or Angular, use `createVeltCodeMirrorStore` to create the CRDT store.

**Correct (vanilla JS implementation):**

```js
import { initVelt } from '@veltdev/client';
import { createVeltCodeMirrorStore } from '@veltdev/codemirror-crdt';
import { yCollab } from 'y-codemirror.next';
import { EditorState } from '@codemirror/state';
import { basicSetup, EditorView } from 'codemirror';

// Step 1: Initialize Velt client
const veltClient = await initVelt('YOUR_API_KEY');

// Step 2: Authenticate user
await veltClient.identify({ userId: 'user-1', name: 'John Doe' });

// Step 3: Set document
await veltClient.setDocument('my-document-id');

// Step 4: Create CRDT store
const store = await createVeltCodeMirrorStore({
  editorId: 'velt-codemirror-crdt-demo',
  veltClient: veltClient,
});

// Step 5: Create CodeMirror editor
const startState = EditorState.create({
  doc: store.getYText()?.toString() ?? '',
  extensions: [
    basicSetup,
    yCollab(
      store.getYText(),
      store.getAwareness(),
      { undoManager: store.getUndoManager() }
    ),
  ],
});

const view = new EditorView({
  state: startState,
  parent: document.getElementById('editor'),
});

// Cleanup on unmount
view.destroy();
store.destroy();
```

**Store Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `editorId` | string | Yes | Unique editor identifier |
| `veltClient` | VeltClient | Yes | Initialized Velt client |
| `initialContent` | string | No | Initial code content |
| `debounceMs` | number | No | Debounce time |

**Verification:**
- [ ] `initVelt()` called first
- [ ] `veltClient.setDocument()` called
- [ ] `yCollab` wired with store's Yjs objects
- [ ] `store.destroy()` called on cleanup

**Source Pointer:** `/docs/realtime-collaboration/crdt/setup/codemirror.mdx` (### Step 3: Initialize Velt CRDT Extension > Other Frameworks)
