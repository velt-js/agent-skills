---
title: Migrate Core CRDT Store Integrations from v1 to v2
impact: HIGH
impactDescription: v1 useVeltCrdtStore (React) is deprecated; v2 useStore is required for new integrations. Non-React createVeltStore retains its entry-point name but gains new config fields.
tags: crdt, core, migration, v1, v2, useStore, useVeltCrdtStore, createVeltStore, deprecated, storeId, isSynced, forceResetInitialContent
---

## Migrate Core CRDT Store Integrations from v1 to v2

The v1 React hook `useVeltCrdtStore` (from `@veltdev/crdt-react`) is deprecated and remains exported only for backwards-compatibility (it internally delegates to v2 `useStore` via a wrapper). All new React integrations must use `useStore`. The non-React `createVeltStore` (`@veltdev/crdt`) keeps the same entry-point name but its `StoreConfig` gains new v2 fields (`forceResetInitialContent`, `contentKey`, `userId`, `collection`, `logLevel`). When editing existing user code, migrate the call sites; do not leave v1 and v2 interleaved.

### React: v1 → v2

| Aspect | v1 (deprecated) | v2 (current) |
|---|---|---|
| Entry point | `useVeltCrdtStore(config)` | `useStore(config)` |
| Store ID field | `id` | `storeId` |
| Status tracking | Not available | `isLoading`, `isSynced`, `status` |
| Error handling | Not available | `onError` callback + `error` reactive field |
| Force reset | Not available | `forceResetInitialContent: boolean` |
| Type union | `'text' \| 'array' \| 'map' \| 'xml'` | adds `'xmltext'` |
| Awareness access | `store.getAwareness()` | `useAwareness(store)` reactive hook |
| Version management | `value, versions, saveVersion, getVersions, getVersionById, restoreVersion, setStateFromVersion` | Same names — surface unchanged |
| Cleanup | Automatic on unmount | Automatic on unmount |

**Incorrect (v1 — deprecated):**

```tsx
import { useVeltCrdtStore } from '@veltdev/crdt-react';

const { value, update, store, versions, saveVersion } = useVeltCrdtStore<string>({
  id: 'my-collab-note',         // v2: storeId
  type: 'text',
  initialValue: 'Hello, world!',
  debounceMs: 100,
});

// No way to gate UI on loading / sync / error in v1
return <textarea value={value ?? ''} onChange={(e) => update(e.target.value)} />;
```

**Correct (v2):**

```tsx
import { useStore, useAwareness } from '@veltdev/crdt-react';

const {
  value, update, store,
  isLoading, isSynced, status, error,
  versions, saveVersion,
} = useStore<string>({
  storeId: 'my-collab-note',
  type: 'text',
  initialValue: 'Hello, world!',
  debounceMs: 100,
  onError: (err) => console.error(err),
});

const { remoteStates, localState, setLocalState } = useAwareness(store);

if (error) return <div>Error: {error.message}</div>;
if (isLoading) return <div>Connecting... ({status})</div>;

return <textarea value={value ?? ''} onChange={(e) => update(e.target.value)} />;
```

### Non-React: v1 → v2

`createVeltStore` keeps the same entry-point and signature shape. v2 adds the following `StoreConfig` fields, all optional:

| Field | Type | Notes |
|---|---|---|
| `forceResetInitialContent` | `boolean` | If `true`, always reset to `initialValue` on init (template flows). Default `false`. |
| `contentKey` | `string` | Yjs shared-type content key. Default `'content'`. |
| `userId` | `string` | Update attribution. |
| `collection` | `string` | Document grouping namespace. |
| `logLevel` | `'silent' \| 'error' \| 'warn' \| 'debug'` | Default `'error'`. |

Existing v1 call sites continue to work without changes — no migration is forced. Adopt the new fields opportunistically.

**Example (v2 createVeltStore with new fields):**

```js
import { createVeltStore } from '@veltdev/crdt';

const store = await createVeltStore({
  id: 'my-array-store',
  type: 'array',
  initialValue: [{ id: '1', name: 'First item' }],
  veltClient: client,
  // v2 additions:
  forceResetInitialContent: false,
  contentKey: 'content',
  logLevel: 'warn',
});
```

### Migration Checklist

- [ ] All `useVeltCrdtStore` imports replaced with `useStore` from `@veltdev/crdt-react`
- [ ] All `id` config fields renamed to `storeId` (React only)
- [ ] UI now gates on `isLoading` / `error` / `status` before reading `value`
- [ ] `onError` callback wired for production code
- [ ] Awareness reads use `useAwareness(store)` in React (not `store.getAwareness()` directly)
- [ ] `forceResetInitialContent` adopted in template/onboarding flows where v1 had to delete-and-recreate
- [ ] Non-React `createVeltStore` call sites reviewed for opportunistic adoption of new fields (`contentKey`, `logLevel`, etc.)

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (## Migration Guide: v1 to v2; ## Legacy API (v1))
