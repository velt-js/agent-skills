---
title: Use type:'map' Store for Collaborative Key-Value Objects
impact: HIGH
impactDescription: Map stores use Y.Map semantics for per-key conflict-free merging; using a text store to serialize objects loses key-level merge granularity and causes full-object replacement on concurrent edits
tags: crdt, core, useStore, map, Y.Map, createVeltStore, forceResetInitialContent, initialValue, key-value
---

## Use type:'map' Store for Collaborative Key-Value Objects

A map store is backed by Yjs `Y.Map` and is the correct type for any key-value shaped collaborative data (settings, form state, configuration objects). The `useStore` hook (React) and `createVeltStore` factory (non-React) both accept `type: 'map'`. The hook handles initialization, real-time subscriptions, and cleanup automatically.

Always guard the returned `value` with `typeof value === 'object' && value !== null && !Array.isArray(value)` before iterating with `Object.entries()` or `Object.keys()`, because the value is `null` before the store is hydrated.

Do not serialize an object to JSON and store it in a `text` store — this loses per-key merge granularity and causes entire-object replacement on concurrent edits.

**Correct (React — useStore with type:'map'):**

```tsx
import { useStore } from '@veltdev/crdt-react';

type DataMap = Record<string, string>;

function CollaborativeKVStore() {
  const {
    value: entries,
    update: updateEntries,
    store,
    isLoading,
    error,
  } = useStore<DataMap>({
    storeId: 'my-map-store',
    type: 'map',
    initialValue: { key1: 'value1' },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Guard: value is a plain object (not array, not null) before iterating
  const entriesMap =
    entries && typeof entries === 'object' && !Array.isArray(entries) ? entries : {};

  // Set or overwrite a key — read latest synchronous value from store inside handlers
  const setKey = (key: string, val: string) => {
    const current = store.getValue() || {};
    updateEntries({ ...current, [key]: val });
  };

  // Remove a key
  const deleteKey = (key: string) => {
    const current = store.getValue() || {};
    const updated = { ...current };
    delete updated[key];
    updateEntries(updated);
  };

  return (
    <ul>
      {Object.entries(entriesMap).map(([key, value]) => (
        <li key={key}>
          {key}: {value}
          <button onClick={() => deleteKey(key)}>Remove</button>
        </li>
      ))}
    </ul>
  );
}
```

**Correct (non-React — createVeltStore with type:'map'):**

```js
import { createVeltStore } from '@veltdev/crdt';

async function initStore(veltClient) {
  const store = await createVeltStore({
    id: 'my-map-store',
    type: 'map',
    initialValue: { key1: 'value1' },
    veltClient,
  });
  if (!store) return;

  // Seed UI with current value
  renderEntries(store.getValue() || {});

  // Subscribe to all future changes (local and remote)
  const unsubscribe = store.subscribe((newData) => {
    renderEntries(newData && typeof newData === 'object' && !Array.isArray(newData) ? newData : {});
  });

  return unsubscribe;
}
```

**forceResetInitialContent (optional):**

By default, `initialValue` is only applied when the document has no existing remote state. Set `forceResetInitialContent: true` to always overwrite remote state with `initialValue` on initialization.

```tsx
const { value: entries } = useStore<DataMap>({
  storeId: 'my-map-store',
  type: 'map',
  initialValue: defaultEntries,
  forceResetInitialContent: true,
});
```

**Verification Checklist:**
- [ ] `type: 'map'` is set on the store config (not `'text'` or `'array'`)
- [ ] Object guard (`typeof value === 'object' && !Array.isArray(value)`) is applied before `Object.entries()` or `Object.keys()` on the reactive value
- [ ] `store.getValue()` is used inside event handlers instead of captured closure values to avoid stale state
- [ ] `store.subscribe()` returns an unsubscribe function that is called on cleanup (non-React only)

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core-stores/map - Map store setup, read, update, subscribe, and version management
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core - Core CRDT setup (Steps 1-2 must be completed first)
