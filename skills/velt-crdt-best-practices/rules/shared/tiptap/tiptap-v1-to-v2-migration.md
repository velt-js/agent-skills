---
title: Migrate Tiptap CRDT Integrations from v1 to v2
impact: HIGH
impactDescription: v1 APIs (useVeltTiptapCrdtExtension, createVeltTiptapCrdtExtension) are deprecated; new integrations must use the v2 useCollaboration / createCollaboration entry points
tags: tiptap, crdt, migration, v1, v2, useCollaboration, createCollaboration, deprecated, useVeltTiptapCrdtExtension, createVeltTiptapCrdtExtension
---

## Migrate Tiptap CRDT Integrations from v1 to v2

The v1 Tiptap CRDT API (`useVeltTiptapCrdtExtension` for React, `createVeltTiptapCrdtExtension` for non-React) is deprecated and remains exported only for backward compatibility. All new integrations must use the v2 entry points (`useCollaboration` / `createCollaboration`), which return a `CollaborationManager` with reactive status, sync state, and a richer Yjs surface. When editing existing user code, migrate the call sites; do not leave v1 and v2 interleaved.

### React: v1 → v2

| Aspect | v1 (deprecated) | v2 (current) |
|---|---|---|
| Entry point | `useVeltTiptapCrdtExtension(config)` | `useCollaboration(config)` |
| Extension access | `response.VeltCrdt` | `response.extension` |
| Store access | `response.store` (`VeltTipTapStore`) | `response.manager` (`CollaborationManager`) |
| Version management | `store.saveVersion()`, `store.getVersions()`, `store.setStateFromVersion(v)` | `manager.saveVersion()`, `manager.getVersions()`, `manager.restoreVersion(versionId)` |
| Status tracking | Not available | `response.status`, `response.isSynced` |
| Error handling | `onConnectionError` callback | `onError` callback + `response.error` state |
| Sync notification | `onSynced` callback (fires once) | `response.isSynced` (reactive) |
| Editor mounting | `useEditor` with `VeltCrdt` in deps | `new Editor(...)` inside `useEffect([extension])` |
| Cleanup | Automatic on unmount | Automatic on unmount |

**Incorrect (v1 — deprecated):**

```tsx
import { useVeltTiptapCrdtExtension } from '@veltdev/tiptap-crdt-react';

const { VeltCrdt, isLoading, store } = useVeltTiptapCrdtExtension({
  editorId: 'my-doc',
  initialContent: '<p>Hello</p>',
  onSynced: (doc) => console.log('Synced!'),
  onConnectionError: (err) => console.error(err),
});

const editor = useEditor({
  extensions: [
    StarterKit.configure({ undoRedo: false }),
    ...(VeltCrdt ? [VeltCrdt] : []),
  ],
}, [VeltCrdt]);

// Versions
const versions = await store.getVersions();
await store.setStateFromVersion(versions[0]);
```

**Correct (v2):**

```tsx
import { useCollaboration } from '@veltdev/tiptap-crdt-react';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

const editorElRef = useRef<HTMLDivElement>(null);

const { extension, isLoading, isSynced, status, error, manager } = useCollaboration({
  editorId: 'my-doc',
  initialContent: '<p>Hello</p>',
  onError: (err) => console.error(err),
});

useEffect(() => {
  if (!extension || !editorElRef.current) return;
  const editor = new Editor({
    element: editorElRef.current,
    extensions: [StarterKit.configure({ undoRedo: false }), extension],
    content: '',
  });
  return () => editor.destroy();
}, [extension]);

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
| Entry point | `createVeltTiptapCrdtExtension(config, callback)` | `await createCollaboration(config)` |
| Return value | Cleanup function | `CollaborationManager` instance |
| Extension access | Via callback: `response.VeltCrdt` | Via method: `manager.createExtension()` |
| Store access | Via callback: `response.store` | Via method: `manager.getStore()` |
| Version management | `store.saveVersion()`, `store.getVersions()`, `store.setStateFromVersion(v)` | `manager.saveVersion()`, `manager.getVersions()`, `manager.restoreVersion(versionId)` |
| Status tracking | Not available | `manager.onStatusChange()`, `manager.onSynced()` |
| Cleanup | Call returned cleanup function | `manager.destroy()` or `editor.destroy()` (triggers auto-cleanup) |
| Error handling | `onConnectionError` callback | `onError` callback |
| Sync notification | `onSynced` callback (fires once) | `manager.onSynced()` (subscribable) |
| Yjs internals | `store.getYDoc()`, `store.getYXml()` | `manager.getDoc()`, `manager.getXmlFragment()`, `manager.getAwareness()`, `manager.getProvider()` |

**Incorrect (v1 — deprecated):**

```js
import { createVeltTiptapCrdtExtension } from '@veltdev/tiptap-crdt';

const cleanup = createVeltTiptapCrdtExtension(
  {
    editorId: 'my-doc',
    veltClient: client,
    initialContent: '<p>Hello</p>',
    onSynced: (doc) => console.log('Synced!'),
    onConnectionError: (err) => console.error(err),
  },
  ({ VeltCrdt, store }) => {
    const editor = new Editor({
      extensions: [
        StarterKit.configure({ undoRedo: false }),
        ...(VeltCrdt ? [VeltCrdt] : []),
      ],
    });
  }
);

// Later: tear down
cleanup();
```

**Correct (v2):**

```js
import { createCollaboration } from '@veltdev/tiptap-crdt';

// Gate on Velt readiness before creating the manager
client.getVeltInitState().subscribe(async (isReady) => {
  if (!isReady) return;

  const manager = await createCollaboration({
    editorId: 'my-doc',
    veltClient: client,
    initialContent: '<p>Hello</p>',
    onError: (err) => console.error(err),
  });

  const editor = new Editor({
    element: document.querySelector('#editor'),
    extensions: [
      StarterKit.configure({ undoRedo: false }),
      manager.createExtension(),
    ],
    content: '',
  });

  // Subscribe to sync (replaces onSynced callback)
  manager.onSynced((synced) => synced && console.log('Synced!'));
  manager.onStatusChange((status) => console.log('Status:', status));

  // Tear down via editor (preferred) or manager.destroy()
  // editor.destroy() cascades to manager.destroy() via the extension's onDestroy hook
});
```

### Migration Checklist

- [ ] All `useVeltTiptapCrdtExtension` imports replaced with `useCollaboration`
- [ ] All `createVeltTiptapCrdtExtension` callback flows replaced with `await createCollaboration(...)`
- [ ] `VeltCrdt` references renamed to `extension`
- [ ] `store.*` version calls migrated to `manager.*` equivalents (`saveVersion`, `getVersions`, `restoreVersion`)
- [ ] `onConnectionError` callbacks renamed to `onError`
- [ ] `onSynced` one-shot callbacks replaced with `manager.onSynced(...)` subscription or `isSynced` reactive state
- [ ] React editor creation moved out of `useEditor` and into `useEffect([extension])` with `new Editor(...)`
- [ ] Non-React flow gated on `client.getVeltInitState().subscribe(...)` before calling `createCollaboration`
- [ ] Old `store.getYDoc` / `store.getYXml` calls replaced with `manager.getDoc` / `manager.getXmlFragment`
- [ ] v1 cleanup function replaced with `manager.destroy()` or relying on editor-driven auto-destroy

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (## Migration Guide: v1 to v2; ## Legacy API (v1))
