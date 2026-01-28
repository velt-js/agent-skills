---
title: Use VeltCrdtStoreMap for Runtime Debugging
impact: LOW
impactDescription: Enables real-time inspection of CRDT state
tags: debug, VeltCrdtStoreMap, inspection, troubleshooting
---

## Use VeltCrdtStoreMap for Runtime Debugging

`window.VeltCrdtStoreMap` is a global debugging interface automatically created by Velt CRDT. Use it in the browser console to inspect stores, monitor values, and diagnose sync issues.

**Browser Console Commands:**

```js
// Get a specific store by ID
const store = window.VeltCrdtStoreMap.get('my-store-id');
console.log('Current value:', store.getValue());

// Get the first registered store (if ID unknown)
const firstStore = window.VeltCrdtStoreMap.get();

// Get all active stores
const allStores = window.VeltCrdtStoreMap.getAll();
console.log('Total stores:', Object.keys(allStores).length);

// Subscribe to changes for debugging
store.subscribe((value) => {
  console.log('Value changed:', value);
});
```

**Monitor Store Registration Events:**

```js
// Fired when a new store is registered
window.addEventListener('veltCrdtStoreRegister', (event) => {
  console.log('Store registered:', event.detail.id);
});

// Fired when a store is destroyed
window.addEventListener('veltCrdtStoreUnregister', (event) => {
  console.log('Store unregistered:', event.detail.id);
});
```

**VeltCrdtStoreMap API:**

| Method | Returns | Description |
|--------|---------|-------------|
| `get(id?)` | Store \| undefined | Get store by ID, or first store if omitted |
| `getAll()` | { [id]: Store } | Get all registered stores |

**Store Methods (from get()):**

| Method | Description |
|--------|-------------|
| `getValue()` | Current value |
| `subscribe(cb)` | Listen for changes, returns unsubscribe function |

**Verification:**
- [ ] `window.VeltCrdtStoreMap` accessible in console
- [ ] `getAll()` shows expected stores
- [ ] `getValue()` returns current state
- [ ] Subscribe callback fires on changes

**Source Pointer:** `/docs/realtime-collaboration/crdt/setup/core.mdx` (### Debugging > #### window.VeltCrdtStoreMap)
