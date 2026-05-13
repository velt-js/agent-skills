---
title: Use useStore (v2) for Reactive CRDT Stores with Status, Sync, and Error State
impact: CRITICAL
impactDescription: v2 useStore hook is the canonical entry point; without it, you lose status/sync/error reactivity and forceResetInitialContent, and your code stays pinned to deprecated v1 surface
tags: crdt, core, useStore, useAwareness, UseStoreConfig, StoreConfig, UseStoreReturn, AwarenessState, status, sync, error, v2
---

## Use useStore (v2) for Reactive CRDT Stores with Status, Sync, and Error State

In v2 of `@veltdev/crdt-react`, `useStore<T>` is the canonical React hook for creating a CRDT store. It replaces the v1 `useVeltCrdtStore` hook and surfaces reactive `isLoading`, `isSynced`, `status`, and `error` state alongside the same `value` / `update` / `store` / `versions` surface. The non-React `createVeltStore` factory remains the entry point for Vue, Angular, and vanilla JS.

Wire UI state to the hook's reactive return fields (or `store.subscribe` in non-React) rather than reading Yjs internals directly. The hook handles initialization, real-time subscriptions, and cleanup automatically.

**Correct (React — read reactive state from the hook):**

```tsx
import { useStore } from '@veltdev/crdt-react';

interface Item { id: string; name: string; }

function Component() {
  const {
    value: items,
    update: updateItems,
    store,
    isLoading,
    isSynced,
    status,
    error,
  } = useStore<Item[]>({
    storeId: 'my-array-store',
    type: 'array', // 'text' | 'map' | 'array' | 'xml' | 'xmltext'
    initialValue: [{ id: '1', name: 'First item' }],
    onError: (err) => console.error('CRDT error:', err),
  });

  if (error) return <div>Error: {error.message}</div>;
  if (isLoading) return <div>Connecting... ({status})</div>;

  const list = Array.isArray(items) ? items : [];
  return <ul>{list.map((i) => <li key={i.id}>{i.name}</li>)}</ul>;
}
```

**Correct (non-React — createVeltStore with v2 config surface):**

```js
import { createVeltStore } from '@veltdev/crdt';
import { initVelt } from '@veltdev/client';

const client = await initVelt('YOUR_API_KEY');
client.setDocument('my-document-id');

// Gate on Velt readiness before creating the store
client.getVeltInitState().subscribe(async (isReady) => {
  if (!isReady) return;

  const store = await createVeltStore({
    id: 'my-array-store',
    type: 'array',
    initialValue: [{ id: '1', name: 'First item' }],
    veltClient: client,
    // v2 additions
    forceResetInitialContent: false, // if true, always reset to initialValue on init
    contentKey: 'content',           // Yjs shared-type content key
    debounceMs: 0,
    enablePresence: true,
  });

  if (!store) return;

  const unsubscribe = store.subscribe((newValue) => {
    console.log('Updated value:', newValue);
  });

  // Teardown
  unsubscribe();
  store.destroy();
});
```

**Incorrect (v1 — deprecated):**

```tsx
import { useVeltCrdtStore } from '@veltdev/crdt-react';

// v1: no isLoading / isSynced / status / error / forceResetInitialContent
const { value, update, store } = useVeltCrdtStore<string>({
  id: 'my-doc',          // v2 renamed to storeId
  type: 'text',
});
```

### useStore Signature Reference

`useStore<T>(config: UseStoreConfig<T>): UseStoreReturn<T>`

| `UseStoreConfig<T>` field | Type | Notes |
|---|---|---|
| `storeId` | `string` | Unique document identifier (renamed from v1 `id`). |
| `type` | `'text' \| 'map' \| 'array' \| 'xml' \| 'xmltext'` | Yjs shared-type. `'xmltext'` is new in v2. |
| `initialValue` | `T` | Applied only when remote state is empty (unless `forceResetInitialContent`). |
| `debounceMs` | `number` | Throttle backend writes (ms). Default `0`. |
| `enablePresence` | `boolean` | Default `true`. |
| `forceResetInitialContent` | `boolean` | **New in v2.** If `true`, always reset to `initialValue` on init (template flows). |
| `onError` | `(err) => void` | **New in v2.** Error callback. |
| `veltClient` | `VeltClient` | Optional explicit client; falls back to `VeltProvider` context. |

| `UseStoreReturn<T>` field | Type | Notes |
|---|---|---|
| `value` | `T \| null` | Current value, reactively updated. |
| `update` | `(newValue: T) => void` | Replace the entire store value. |
| `store` | `Store<T> \| null` | Underlying store instance for advanced use. |
| `isLoading` | `boolean` | **New in v2.** `true` while initializing. |
| `isSynced` | `boolean` | **New in v2.** `true` when connected and synced. |
| `status` | `'connecting' \| 'connected' \| 'disconnected'` | **New in v2.** Reactive connection status. |
| `error` | `Error \| null` | **New in v2.** Init error, if any. |
| `versions` | `Version[]` | Reactive list of saved versions. |
| `saveVersion / getVersions / getVersionById / restoreVersion / setStateFromVersion` | functions | Version management — same surface as v1. |

### useAwareness Hook (React)

`useAwareness(store)` wraps the Yjs Awareness instance from a store. It is reactive: `remoteStates` updates as peers change their awareness, `setLocalState` is a stable setter.

```tsx
import { useStore, useAwareness } from '@veltdev/crdt-react';

const { store } = useStore<Item[]>({ storeId: 'my-store', type: 'array', initialValue: [] });
const { remoteStates, localState, setLocalState } = useAwareness(store);

// Set local awareness state — broadcast to peers
setLocalState({
  user: { userId: 'user-1', name: 'John', color: '#ff0000' },
  cursor: { anchor: 0, head: 5 },
});

// Clear local awareness
setLocalState(null);
```

`useAwareness` accepts `null` safely — pair it with the `store` return value from `useStore` without a guard.

### createVeltStore (Non-React) — v2 Config Surface

`createVeltStore` (from `@veltdev/crdt`) is unchanged in entry-point name but the `StoreConfig` accepts the new v2 fields below. Returns `Promise<Store<T> | null>` (resolves to `null` on init failure).

| `StoreConfig<T>` field | Type | Notes |
|---|---|---|
| `id` / `type` / `initialValue` / `veltClient` / `debounceMs` / `enablePresence` | — | Same as v1. |
| `forceResetInitialContent` | `boolean` | **New in v2.** Default `false`. |
| `contentKey` | `string` | **New in v2.** Default `'content'`. |
| `userId` | `string` | **New in v2.** Update attribution. |
| `collection` | `string` | **New in v2.** Document grouping namespace. |
| `logLevel` | `'silent' \| 'error' \| 'warn' \| 'debug'` | **New in v2.** Default `'error'`. |

### Verification

- [ ] React code uses `useStore` (v2) — not `useVeltCrdtStore` (v1)
- [ ] `storeId` is used instead of `id` in React config
- [ ] UI gates on `isLoading` / `error` reactive fields before reading `value`
- [ ] `onError` callback is wired for production code
- [ ] Awareness state is read via `useAwareness(store)` — not by reaching for `store.getAwareness()` manually in React
- [ ] Non-React code uses the same `createVeltStore` entry point with v2 config fields where needed (`forceResetInitialContent`, `contentKey`, etc.)
- [ ] Subscriptions in non-React always pair `store.subscribe()` with the returned unsubscribe call

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (## APIs > React: useStore(), React: useAwareness(), Non-React: createVeltStore(), Store Methods)
