---
title: Use the CollaborationManager API for Status, Versions, and Yjs Internals
impact: HIGH
impactDescription: Without using the manager API, you lose access to connection status, sync state, version management, and Yjs escape hatches in v2
tags: tiptap, crdt, CollaborationManager, manager, useCollaboration, createCollaboration, status, sync, versions, yjs
---

## Use the CollaborationManager API for Status, Versions, and Yjs Internals

In v2 of `@veltdev/tiptap-crdt(-react)`, `useCollaboration` (React) and `createCollaboration` (non-React) both surface a `CollaborationManager` instance. The manager is the single entry point for connection status, sync state, version management, and Yjs-level escape hatches. Wire UI state to its observables (or reactive return values) instead of trying to read Yjs internals directly from the editor.

**Correct (React — read reactive state from the hook):**

```tsx
import { useCollaboration } from '@veltdev/tiptap-crdt-react';

const { extension, isLoading, isSynced, status, error, manager } = useCollaboration({
  editorId: 'my-tiptap-editor',
  initialContent: '<p>Start typing...</p>',
  onError: (err) => console.error('Collaboration error:', err),
});

if (error) return <div>Error: {error.message}</div>;
if (isLoading || !extension) return <div>Connecting...</div>;

return (
  <>
    <div>Status: {status} | Synced: {isSynced ? 'Yes' : 'No'}</div>
    <div ref={editorElRef} />
  </>
);
```

**Correct (non-React — subscribe via the manager):**

```js
import { createCollaboration } from '@veltdev/tiptap-crdt';

const manager = await createCollaboration({
  editorId: 'my-document-id',
  veltClient: client,
  initialContent: '<p>Start typing...</p>',
  onError: (err) => console.error('Collaboration error:', err),
});

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
manager.destroy(); // safe to call multiple times; auto-fires when editor is destroyed
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

The manager exposes the underlying Yjs primitives for advanced use (custom plugins, debugging, interop with other Yjs tooling). Prefer the manager's high-level methods first; reach for these only when you actually need Yjs-level control.

```js
const doc        = manager.getDoc();         // Y.Doc
const xml        = manager.getXmlFragment(); // Y.XmlFragment | null  (TipTap content root)
const provider   = manager.getProvider();    // SyncProvider
const awareness  = manager.getAwareness();   // Awareness (Yjs awareness protocol)
const crdtStore  = manager.getStore();       // Velt CRDT Store<string>
```

**Incorrect (poking at the editor for Yjs internals):**

```tsx
// WRONG: reach for editor.storage or editor.view to find Y.Doc — undefined behaviour
const ydoc = (editor as any).storage?.collaboration?.document;
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
| `createExtension()` | `Extension` | Non-React: get the TipTap extension bundling Yjs binding + cursor rendering. The React hook returns this directly as `extension`. |
| `onStatusChange(cb)` | `(SyncStatus) => Unsubscribe` | `'connecting' \| 'connected' \| 'disconnected'` |
| `onSynced(cb)` | `(boolean) => Unsubscribe` | Fires `true` after initial backend sync. |
| `status` / `synced` / `initialized` | `SyncStatus` / `boolean` / `boolean` | Synchronous reads. |
| `saveVersion(name)` | `Promise<string>` | Returns the new `versionId`. |
| `getVersions()` | `Promise<Version[]>` | `{ versionId, versionName, timestamp }[]`. |
| `restoreVersion(versionId)` | `Promise<boolean>` | Broadcasts restored state to all clients. |
| `setStateFromVersion(v)` | `Promise<void>` | Local-only apply. |
| `getDoc / getXmlFragment / getProvider / getAwareness / getStore` | Yjs / Velt primitives | Escape hatches. |
| `destroy()` | `void` | Idempotent; auto-fires on editor destroy. |

**Verification:**
- [ ] UI reads `status` / `isSynced` from the hook return value (React) or `manager.on*` subscriptions (non-React)
- [ ] Every `manager.on*` subscription has a matching `unsubscribe()` call on teardown (non-React)
- [ ] Version save / restore uses `manager.saveVersion` / `manager.restoreVersion` — not v1 `store.*` calls
- [ ] Yjs internals (`Y.Doc`, `Y.XmlFragment`, `Awareness`) are read via `manager.get*` only when needed
- [ ] `manager.destroy()` is called manually only if the editor is not the lifecycle owner — otherwise rely on the auto-cleanup hook

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (### Step 3, 5, 6, 11; ## APIs)
