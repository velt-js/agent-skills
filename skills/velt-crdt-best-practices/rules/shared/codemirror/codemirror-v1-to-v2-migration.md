---
title: Migrate CodeMirror CRDT Integrations from v1 to v2
impact: HIGH
impactDescription: v1 APIs (useVeltCodeMirrorCrdtExtension, createVeltCodeMirrorStore / createVeltCodeMirrorCrdtExtension) are deprecated; new integrations must use the v2 useCollaboration / createCollaboration entry points
tags: codemirror, crdt, migration, v1, v2, useCollaboration, createCollaboration, deprecated, useVeltCodeMirrorCrdtExtension, createVeltCodeMirrorStore, createVeltCodeMirrorCrdtExtension
---

## Migrate CodeMirror CRDT Integrations from v1 to v2

The v1 CodeMirror CRDT API (`useVeltCodeMirrorCrdtExtension` for React, `createVeltCodeMirrorStore` / `createVeltCodeMirrorCrdtExtension` for non-React) is deprecated and remains exported only for backward compatibility. All new integrations must use the v2 entry points (`useCollaboration` / `createCollaboration`), which return a `CollaborationManager` with reactive status, sync state, version management, and richer Yjs escape hatches. When editing existing user code, migrate the call sites; do not leave v1 and v2 interleaved.

### React: v1 → v2

| Aspect | v1 (deprecated) | v2 (current) |
|---|---|---|
| Entry point | `useVeltCodeMirrorCrdtExtension(config)` | `useCollaboration(config)` |
| Yjs access | `store.getYText()`, `store.getAwareness()` | `primitives.ytext`, `primitives.awareness` |
| Undo manager | `store.getUndoManager()` | `primitives.undoManager` |
| Manager access | `response.store` (`VeltCodeMirrorStore`) | `response.manager` (`CollaborationManager`) |
| Version management | `store.getEncodedState()`, `store.setStateFromVersion(v)` | `manager.saveVersion()`, `manager.getVersions()`, `manager.restoreVersion(versionId)` |
| Status tracking | Not available | `response.status`, `response.isSynced` (reactive) |
| Error handling | Not available | `onError` callback + `response.error` state |
| Cleanup | Automatic on unmount | Automatic on unmount |

**Incorrect (v1 — deprecated):**

```tsx
import { useVeltCodeMirrorCrdtExtension } from '@veltdev/codemirror-crdt-react';
import { yCollab } from 'y-codemirror.next';
import { EditorState } from '@codemirror/state';
import { basicSetup, EditorView } from 'codemirror';

const { store, isLoading } = useVeltCodeMirrorCrdtExtension({
  editorId: 'my-doc',
  initialContent: 'console.log("Hello!");',
});

if (store) {
  const state = EditorState.create({
    doc: store.getYText()?.toString() ?? '',
    extensions: [
      basicSetup,
      yCollab(store.getYText()!, store.getAwareness(), {
        undoManager: store.getUndoManager(),
      }),
    ],
  });
}

// Versions
const encoded = store.getEncodedState();
await store.setStateFromVersion(someVersion);
```

**Correct (v2):**

```tsx
import { useCollaboration } from '@veltdev/codemirror-crdt-react';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { yCollab } from 'y-codemirror.next';
import { useEffect, useRef } from 'react';

const editorElRef = useRef<HTMLDivElement>(null);

const { primitives, isLoading, isSynced, status, error, manager } = useCollaboration({
  editorId: 'my-doc',
  initialContent: 'console.log("Hello!");',
  onError: (err) => console.error(err),
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

// Versions
const versions = await manager.getVersions();
await manager.restoreVersion(versions[0].versionId);

// Status (new)
if (error) return <div>Error: {error.message}</div>;
if (isLoading) return <div>Connecting...</div>;
```

### Non-React: v1 → v2

| Aspect | v1 (deprecated) | v2 (current) |
|---|---|---|
| Entry point | `createVeltCodeMirrorStore(config)` / `createVeltCodeMirrorCrdtExtension(config, callback)` | `await createCollaboration(config)` |
| Return value | Store / cleanup function | `CollaborationManager` instance |
| Yjs primitives | `store.getYText()`, `store.getAwareness()`, `store.getUndoManager()` | `manager.getCollaborationPrimitives()` → `{ ytext, awareness, undoManager, doc }` |
| Store access | `store` (`VeltCodeMirrorStore`) | `manager.getStore()` |
| Version management | `store.getEncodedState()`, `store.setStateFromVersion(v)` | `manager.saveVersion()`, `manager.getVersions()`, `manager.restoreVersion(versionId)` |
| Status tracking | Not available | `manager.onStatusChange()`, `manager.onSynced()` |
| Cleanup | `store.destroy()` or cleanup function | `manager.destroy()` |
| Error handling | `onConnectionError` callback | `onError` callback |
| Sync notification | `onSynced` callback (fires once) | `manager.onSynced()` (subscribable) |
| Yjs internals | `store.getYDoc()`, `store.getYText()`, `store.getAwareness()`, `store.getUndoManager()` | `manager.getDoc()`, `manager.getYText()`, `manager.getAwareness()`, `manager.getUndoManager()`, `manager.getProvider()` |

**Incorrect (v1 — deprecated):**

```js
import { createVeltCodeMirrorStore } from '@veltdev/codemirror-crdt';
import { yCollab } from 'y-codemirror.next';
import { EditorState } from '@codemirror/state';
import { basicSetup, EditorView } from 'codemirror';

const store = await createVeltCodeMirrorStore({
  editorId: 'my-doc',
  veltClient: client,
});

const state = EditorState.create({
  doc: store.getYText()?.toString() ?? '',
  extensions: [
    basicSetup,
    yCollab(store.getYText(), store.getAwareness(), {
      undoManager: store.getUndoManager(),
    }),
  ],
});
new EditorView({ state, parent: document.querySelector('#editor') });

// Later: tear down
store.destroy();
```

**Correct (v2):**

```js
import { createCollaboration } from '@veltdev/codemirror-crdt';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { yCollab } from 'y-codemirror.next';

client.getVeltInitState().subscribe(async (isReady) => {
  if (!isReady) return;

  const manager = await createCollaboration({
    editorId: 'my-doc',
    veltClient: client,
    initialContent: 'console.log("Hello!");',
    onError: (err) => console.error(err),
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

  // Subscribe to sync (replaces onSynced callback)
  manager.onSynced((synced) => synced && console.log('Synced!'));
  manager.onStatusChange((status) => console.log('Status:', status));

  // Tear down
  // manager.destroy() cascades to store, provider, undo manager, listeners
});
```

### Migration Checklist

- [ ] All `useVeltCodeMirrorCrdtExtension` imports replaced with `useCollaboration`
- [ ] All `createVeltCodeMirrorStore` / `createVeltCodeMirrorCrdtExtension` calls replaced with `await createCollaboration(...)`
- [ ] `store.getYText()` / `store.getAwareness()` / `store.getUndoManager()` references migrated to `primitives.*` (React) or `manager.getCollaborationPrimitives()` (non-React)
- [ ] `yCollab(...)` is now wired with primitives from the hook return / manager — not from a v1 `store`
- [ ] `store.*` version calls migrated to `manager.*` equivalents (`saveVersion`, `getVersions`, `restoreVersion`)
- [ ] `onConnectionError` callbacks renamed to `onError`
- [ ] `onSynced` one-shot callbacks replaced with `manager.onSynced(...)` subscription or `isSynced` reactive state
- [ ] Non-React flow gated on `client.getVeltInitState().subscribe(...)` before calling `createCollaboration`
- [ ] Old `store.getYDoc` calls replaced with `manager.getDoc()`
- [ ] v1 `store.destroy()` / cleanup function replaced with `manager.destroy()`

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (## Migration Guide: v1 to v2; ## Legacy API (v1))
