---
title: Use type:'array' Store for Collaborative Ordered Lists
impact: HIGH
impactDescription: Array stores use Y.Array semantics for conflict-free ordered-list merging; using a text store to serialize JSON arrays loses per-element merge granularity and causes data loss on concurrent edits
tags: crdt, core, useStore, array, Y.Array, createVeltStore, forceResetInitialContent, initialValue
---

## Use type:'array' Store for Collaborative Ordered Lists

An array store is backed by Yjs `Y.Array` and is the correct type for any ordered, list-shaped collaborative data (todo lists, item queues, ordered sequences). The `useStore` hook (React) and `createVeltStore` factory (non-React) both accept `type: 'array'`. The hook handles initialization, real-time subscriptions, and cleanup automatically.

Always guard the returned `value` with `Array.isArray()` before calling `.map()` or spreading, because the value is `null` before the store is hydrated.

Do not serialize an array to JSON and store it in a `text` store — this loses per-element merge granularity and causes entire-array replacement on concurrent edits.

**Correct (React — useStore with type:'array'):**

```tsx
import { useStore } from '@veltdev/crdt-react';

interface Item {
  id: string;
  name: string;
}

function CollaborativeList() {
  const {
    value: items,
    update: updateItems,
    store,
    isLoading,
    error,
  } = useStore<Item[]>({
    storeId: 'my-array-store',
    type: 'array',
    initialValue: [{ id: '1', name: 'First item' }],
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Guard before map/spread — value is null until the store is hydrated
  const itemList = Array.isArray(items) ? items : [];

  // Add a new item — read the latest synchronous value from store inside handlers
  const addItem = (name: string) => {
    const current = store.getValue() || [];
    if (Array.isArray(current)) {
      updateItems([...current, { id: crypto.randomUUID(), name }]);
    }
  };

  // Remove an item
  const removeItem = (id: string) => {
    const current = store.getValue() || [];
    if (Array.isArray(current)) {
      updateItems(current.filter((item) => item.id !== id));
    }
  };

  return (
    <ul>
      {itemList.map((item) => (
        <li key={item.id}>
          {item.name}
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </li>
      ))}
    </ul>
  );
}
```

**Correct (non-React — createVeltStore with type:'array'):**

```js
import { createVeltStore } from '@veltdev/crdt';

async function initStore(veltClient) {
  const store = await createVeltStore({
    id: 'my-array-store',
    type: 'array',
    initialValue: [{ id: '1', name: 'First item' }],
    veltClient,
  });
  if (!store) return;

  // Seed UI with current value
  renderItems(Array.isArray(store.getValue()) ? store.getValue() : []);

  // Subscribe to all future changes (local and remote)
  const unsubscribe = store.subscribe((newItems) => {
    renderItems(Array.isArray(newItems) ? newItems : []);
  });

  // Call unsubscribe when the component/view is torn down
  return unsubscribe;
}
```

**forceResetInitialContent (optional):**

By default, `initialValue` is only applied when the document has no existing remote state. Set `forceResetInitialContent: true` to always overwrite remote state with `initialValue` on initialization.

```tsx
const { value: items } = useStore<Item[]>({
  storeId: 'my-array-store',
  type: 'array',
  initialValue: defaultItems,
  forceResetInitialContent: true,
});
```

**Verification Checklist:**
- [ ] `type: 'array'` is set on the store config (not `'text'` or `'map'`)
- [ ] `Array.isArray(value)` guard is applied before any `.map()` or spread on the reactive value
- [ ] `store.getValue()` is used inside event handlers instead of captured closure values to avoid stale state
- [ ] `store.subscribe()` returns an unsubscribe function that is called on cleanup (non-React only)

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core-stores/array - Array store setup, read, update, subscribe, and version management
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core - Core CRDT setup (Steps 1-2 must be completed first)
