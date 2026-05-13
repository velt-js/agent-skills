---
title: Use createVeltCodeMirrorStore for Non-React CodeMirror (v1 — DEPRECATED)
impact: LOW
impactDescription: v1 API retained for backwards-compatibility only. New integrations must use the v2 createCollaboration entry point (see codemirror-collaboration-manager.md and codemirror-v1-to-v2-migration.md).
tags: codemirror, vanilla, createVeltCodeMirrorStore, deprecated, v1
---

## Use createVeltCodeMirrorStore for Non-React CodeMirror (v1 — DEPRECATED)

> **DEPRECATED:** This rule documents the v1 non-React CodeMirror CRDT API and is retained for backwards-compatibility reference only. **New integrations must use `createCollaboration` from `@veltdev/codemirror-crdt`** — see `rules/shared/codemirror/codemirror-collaboration-manager.md` for the canonical v2 pattern (which covers both React and non-React) and `rules/shared/codemirror/codemirror-v1-to-v2-migration.md` for the migration table.

For vanilla JS, Vue, or Angular, the v1 API uses `createVeltCodeMirrorStore` to create the CRDT store.

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
await veltClient.setVeltAuthProvider({
  user: { userId: 'user-1', name: 'John Doe' },
  generateToken: async () => {
    const resp = await fetch('/api/velt/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user-1' }),
    });
    const { token } = await resp.json();
    return token;
  },
});

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

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (## Legacy API (v1) > Non-React: createVeltCodeMirrorCrdtExtension() (deprecated))
