---
title: Use the CollaborationManager API for Status, Versions, and Yjs Internals
impact: HIGH
impactDescription: Without using the manager API, you lose access to connection status, sync state, version management, and Yjs escape hatches in v2
tags: codemirror, crdt, CollaborationManager, manager, useCollaboration, createCollaboration, status, sync, versions, yjs
---

## Use the CollaborationManager API for Status, Versions, and Yjs Internals

In v2 of `@veltdev/codemirror-crdt(-react)`, `useCollaboration` (React) and `createCollaboration` (non-React) both surface a `CollaborationManager` instance. The manager is the single entry point for connection status, sync state, version management, and Yjs-level escape hatches. The React hook also returns the Yjs `primitives` (`ytext`, `awareness`, `undoManager`, `doc`) you pass to `yCollab()` from `y-codemirror.next`; non-React callers fetch the same shape via `manager.getCollaborationPrimitives()`.

**Correct (React — read reactive state from the hook):**

```tsx
import { useCollaboration } from '@veltdev/codemirror-crdt-react';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { yCollab } from 'y-codemirror.next';
import { useEffect, useRef } from 'react';

function CodeMirrorEditor() {
  const editorElRef = useRef<HTMLDivElement>(null);

  const { primitives, isLoading, isSynced, status, error, manager } = useCollaboration({
    editorId: 'my-codemirror-editor',
    initialContent: 'console.log("Hello!");',
    onError: (err) => console.error('Collaboration error:', err),
  });

  useEffect(() => {
    if (!primitives?.ytext || !editorElRef.current) return;
    const state = EditorState.create({
      doc: primitives.ytext.toString(),
      extensions: [
        basicSetup,
        yCollab(primitives.ytext, primitives.awareness, {
          undoManager: primitives.undoManager,
        }),
      ],
    });
    const view = new EditorView({ state, parent: editorElRef.current });
    return () => view.destroy();
  }, [primitives]);

  if (error) return <div>Error: {error.message}</div>;
  if (isLoading || !primitives) return <div>Connecting...</div>;

  return (
    <>
      <div>Status: {status} | Synced: {isSynced ? 'Yes' : 'No'}</div>
      <div ref={editorElRef} />
    </>
  );
}
```

**Correct (non-React — subscribe via the manager):**

```js
import { createCollaboration } from '@veltdev/codemirror-crdt';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { yCollab } from 'y-codemirror.next';

// Gate on Velt readiness before creating the manager
client.getVeltInitState().subscribe(async (isReady) => {
  if (!isReady) return;

  const manager = await createCollaboration({
    editorId: 'my-codemirror-editor',
    veltClient: client,
    initialContent: 'console.log("Hello!");',
    onError: (err) => console.error('Collaboration error:', err),
  });

  const { ytext, awareness, undoManager } = manager.getCollaborationPrimitives();

  const state = EditorState.create({
    doc: ytext.toString(),
    extensions: [
      basicSetup,
      yCollab(ytext, awareness, { undoManager }),
    ],
  });
  new EditorView({ state, parent: document.querySelector('#editor') });

  // Subscribe to status / sync — always store the unsubscribe and call it on teardown
  const unsubStatus = manager.onStatusChange((status) => console.log('status', status));
  const unsubSynced = manager.onSynced((synced) => console.log('synced', synced));

  // Read current values at any time
  console.log(manager.status);       // 'connecting' | 'connected' | 'disconnected'
  console.log(manager.synced);       // boolean
  console.log(manager.initialized);  // boolean

  // On teardown
  unsubStatus();
  unsubSynced();
  manager.destroy(); // safe to call multiple times; cascades to store, provider, undo manager, listeners
});
```

### Version Management

```js
// Save a named snapshot — returns a versionId
const versionId = await manager.saveVersion('Before major edit');

// List versions: [{ versionId, versionName, timestamp }, ...]
const versions = await manager.getVersions();

// Restore by versionId — pushes the restored state to all clients
await manager.restoreVersion(versions[0].versionId);

// Apply a Version object's state locally (no broadcast)
await manager.setStateFromVersion(version);
```

### Yjs Escape Hatches

The manager exposes the underlying Yjs primitives for advanced use (custom CodeMirror plugins, debugging, interop with other Yjs tooling). Prefer the manager's high-level methods and the `primitives` returned by the hook first; reach for these only when you actually need Yjs-level control.

```js
const doc        = manager.getDoc();           // Y.Doc
const ytext      = manager.getYText();         // Y.Text | null   (non-React)
const text       = manager.getText();          // Y.Text | null   (React)
const provider   = manager.getProvider();      // SyncProvider
const awareness  = manager.getAwareness();     // Awareness (Yjs awareness protocol)
const crdtStore  = manager.getStore();         // Velt CRDT Store<string>
const undoMgr    = manager.getUndoManager();   // Y.UndoManager | null
```

**Incorrect (constructing a second Y.Doc and binding it to CodeMirror):**

```js
// WRONG: a separate Y.Doc bypasses the manager's sync provider — edits will not propagate
import * as Y from 'yjs';
const ydoc = new Y.Doc();
const ytext = ydoc.getText('codemirror');
yCollab(ytext, /* no awareness from Velt */ null, {});
```

### Subscription Lifecycle

Every `manager.on*` method returns an `Unsubscribe` function. Treat them like event listeners — always pair `subscribe` with `unsubscribe` so listeners do not leak:

```js
// SETUP
const unsubStatus = manager.onStatusChange((s) => updateBadge(s));
const unsubSynced = manager.onSynced((synced) => updateBadge(undefined, synced));

// TEARDOWN — call before manager.destroy() and on component unmount
unsubStatus();
unsubSynced();
manager.destroy();
```

In React, the `useCollaboration` hook handles this automatically — use the returned reactive `status` / `isSynced` / `error` values instead of calling `manager.onStatusChange` manually unless you need imperative side effects.

**Signature Reference:**

| Member | Type | Notes |
|---|---|---|
| `getCollaborationPrimitives()` | `{ ytext, awareness, undoManager, doc }` | Non-React: fetch the Yjs primitives to pass into `yCollab()`. The React hook returns these directly as `primitives`. |
| `onStatusChange(cb)` | `(SyncStatus) => Unsubscribe` | `'connecting' \| 'connected' \| 'disconnected'` |
| `onSynced(cb)` | `(boolean) => Unsubscribe` | Fires `true` after initial backend sync. |
| `status` / `synced` / `initialized` | `SyncStatus` / `boolean` / `boolean` | Synchronous reads. |
| `saveVersion(name)` | `Promise<string>` | Returns the new `versionId`. |
| `getVersions()` | `Promise<Version[]>` | `{ versionId, versionName, timestamp }[]`. |
| `restoreVersion(versionId)` | `Promise<boolean>` | Broadcasts restored state to all clients. |
| `setStateFromVersion(v)` | `Promise<void>` | Local-only apply. |
| `getDoc / getYText / getText / getProvider / getAwareness / getStore / getUndoManager` | Yjs / Velt primitives | Escape hatches. |
| `destroy()` | `void` | Idempotent; cascades to store, provider, undo manager, listeners. |

**Verification:**
- [ ] UI reads `status` / `isSynced` from the hook return value (React) or `manager.on*` subscriptions (non-React)
- [ ] Every `manager.on*` subscription has a matching `unsubscribe()` call on teardown (non-React)
- [ ] Version save / restore uses `manager.saveVersion` / `manager.restoreVersion` — not v1 `store.*` calls
- [ ] `yCollab()` receives `primitives.ytext` / `primitives.awareness` / `primitives.undoManager` (or the non-React equivalent from `getCollaborationPrimitives()`) — never a separately constructed Y.Doc
- [ ] `manager.destroy()` (or the auto-cleanup on component unmount) is called on teardown

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (### Step 3, 4, 5, 10, 11; ## APIs)
