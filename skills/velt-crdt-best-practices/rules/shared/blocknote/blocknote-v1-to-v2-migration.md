---
title: Migrate BlockNote CRDT Integrations from v1 to v2
impact: HIGH
impactDescription: v1 API (useVeltBlockNoteCrdtExtension) is deprecated; new integrations must use the v2 useCollaboration / createCollaboration entry points
tags: blocknote, crdt, migration, v1, v2, useCollaboration, createCollaboration, deprecated, useVeltBlockNoteCrdtExtension
---

## Migrate BlockNote CRDT Integrations from v1 to v2

The v1 BlockNote CRDT API (`useVeltBlockNoteCrdtExtension` for React) is deprecated and remains exported only for backward compatibility — it internally delegates to `useCollaboration` (v2) via a compatibility wrapper. All new integrations must use the v2 entry points (`useCollaboration` for React, `createCollaboration` for non-React), which return a `CollaborationManager` with reactive status, sync state, first-class version methods, and a richer Yjs surface. When editing existing user code, migrate the call sites; do not leave v1 and v2 interleaved.

v2 also introduces non-React BlockNote support via `@veltdev/blocknote-crdt` and `createCollaboration`. In v1, only React was supported.

### React: v1 → v2

| Aspect | v1 (deprecated) | v2 (current) |
|---|---|---|
| Entry point | `useVeltBlockNoteCrdtExtension(config)` | `useCollaboration(config)` |
| Collab config | `response.collaborationConfig` | `response.collaborationConfig` (same usage with `useCreateBlockNote`) |
| Store access | `response.store` (`VeltBlockNoteStore`) | `response.manager` (`CollaborationManager`) |
| Version management | `store.setStateFromVersion(v)` (no save/list/restore on store) | `saveVersion`, `getVersions`, `restoreVersion` returned directly from the hook (first-class) |
| Status tracking | Not available | `response.status`, `response.isSynced` |
| Error handling | Not available | `onError` callback + `response.error` state |
| Cursor labels | Not configurable | `showCursorLabels: 'activity' \| 'always'` |
| `initialContent` shape | JSON `string` (`JSON.stringify([...])`) | `PartialBlock[]` array (typed BlockNote blocks) |
| Cleanup | Automatic on unmount | Automatic on unmount |

**Incorrect (v1 — deprecated):**

```tsx
import { useVeltBlockNoteCrdtExtension } from '@veltdev/blocknote-crdt-react';
import { useCreateBlockNote } from '@blocknote/react';

const { collaborationConfig, isLoading, store } = useVeltBlockNoteCrdtExtension({
  editorId: 'my-doc',
  initialContent: JSON.stringify([{ type: 'paragraph', content: '' }]),
});

const editor = useCreateBlockNote({
  collaboration: collaborationConfig,
}, [collaborationConfig]);

// Versions via store
await store.setStateFromVersion(someVersion);
```

**Correct (v2):**

```tsx
import { useCollaboration } from '@veltdev/blocknote-crdt-react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';

const {
  collaborationConfig,
  isLoading,
  isSynced,
  status,
  error,
  manager,
  saveVersion,
  getVersions,
  restoreVersion,
} = useCollaboration({
  editorId: 'my-doc',
  initialContent: [{ type: 'paragraph', content: '' }],
  onError: (err) => console.error(err),
});

const editor = useCreateBlockNote(
  collaborationConfig ? { collaboration: collaborationConfig } : {},
  [collaborationConfig],
);

// Versions are first-class returns from the hook
await saveVersion('Draft v1');
const versions = await getVersions();
await restoreVersion(versions[0].versionId);

// Status (new)
if (error) return <div>Error: {error.message}</div>;
if (isLoading || !collaborationConfig) return <div>Connecting...</div>;

return <BlockNoteView editor={editor} theme="light" />;
```

### Non-React: v1 → v2

v1 did not document non-React BlockNote support. v2 introduces `@veltdev/blocknote-crdt` and `createCollaboration` so vanilla / Vue / Angular apps can drive BlockNote collaboration via the manager.

| Aspect | v1 (not supported) | v2 (current) |
|---|---|---|
| Entry point | — | `await createCollaboration(config)` |
| Return value | — | `CollaborationManager` instance |
| Collab config | — | `manager.getCollaborationConfig()` → pass to `BlockNoteEditor.create({ collaboration: ... })` |
| Version management | — | `manager.saveVersion()`, `manager.getVersions()`, `manager.restoreVersion(versionId)` |
| Status tracking | — | `manager.onStatusChange()`, `manager.onSynced()` |
| Cleanup | — | `manager.destroy()` (idempotent) |
| Yjs internals | — | `manager.getDoc()`, `manager.getXmlFragment()`, `manager.getAwareness()`, `manager.getProvider()` |

**Correct (v2 — non-React):**

```js
import { createCollaboration } from '@veltdev/blocknote-crdt';
import { BlockNoteEditor } from '@blocknote/core';

client.getVeltInitState().subscribe(async (isReady) => {
  if (!isReady) return;

  const manager = await createCollaboration({
    editorId: 'my-doc',
    veltClient: client,
    initialContent: [{ type: 'paragraph', content: 'Hello' }],
    onError: (err) => console.error(err),
  });

  const editor = BlockNoteEditor.create({
    collaboration: manager.getCollaborationConfig(),
  });
  editor.mount(document.getElementById('editor'));

  // Subscribe to sync / status (replaces any v1 callback pattern)
  manager.onSynced((synced) => synced && console.log('Synced!'));
  manager.onStatusChange((status) => console.log('Status:', status));

  // Versions
  await manager.saveVersion('Draft v1');
  const versions = await manager.getVersions();
  await manager.restoreVersion(versions[0].versionId);
});
```

### Migration Checklist

- [ ] All `useVeltBlockNoteCrdtExtension` imports replaced with `useCollaboration`
- [ ] `initialContent` migrated from `JSON.stringify([...])` to a `PartialBlock[]` array
- [ ] `store.*` references migrated to `manager.*` equivalents or the React first-class returns (`saveVersion`, `getVersions`, `restoreVersion`)
- [ ] `store.setStateFromVersion(v)` calls replaced with `manager.restoreVersion(versionId)` (broadcasts) or `manager.setStateFromVersion(v)` (local-only)
- [ ] `onError` callback added; UI reads `response.error` for runtime errors
- [ ] UI wired to reactive `status` / `isSynced` instead of relying on the absence of v1 indicators
- [ ] Non-React BlockNote flow gated on `client.getVeltInitState().subscribe(...)` before calling `createCollaboration`
- [ ] Old `store.getYDoc` / `store.getYXml` / `store.isConnected` calls replaced with `manager.getDoc` / `manager.getXmlFragment` / `manager.status`
- [ ] `manager.destroy()` used in place of v1 implicit cleanup when the editor is not the lifecycle owner

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/blocknote` (## Migration Guide: v1 to v2; ## Legacy API (v1))
