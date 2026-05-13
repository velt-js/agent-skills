---
title: Use useVeltCrdtStore Hook for React CRDT Stores (v1 — DEPRECATED)
impact: LOW
impactDescription: v1 API retained for backwards-compatibility only. New integrations must use the v2 useStore hook (see core-store-v2-api.md and core-v1-to-v2-migration.md).
tags: react, hook, useVeltCrdtStore, store, deprecated, v1
---

## Use useVeltCrdtStore Hook for React CRDT Stores (v1 — DEPRECATED)

> **DEPRECATED:** This rule documents the v1 React CRDT store hook and is retained for backwards-compatibility reference only. **New integrations must use `useStore` from `@veltdev/crdt-react`** — see `rules/shared/core/core-store-v2-api.md` for the canonical v2 pattern and `rules/shared/core/core-v1-to-v2-migration.md` for the migration table. The v1 `useVeltCrdtStore` hook internally delegates to v2 `useStore` via a compatibility wrapper.

In React, the v1 API uses `useVeltCrdtStore` for automatic lifecycle management. The hook handles subscriptions, updates, and cleanup on unmount — but **does not surface** `isLoading`, `isSynced`, `status`, or `error` reactive state; those are only available in the v2 `useStore` hook.

**Incorrect (manual store creation in React):**

```tsx
import { createVeltStore } from '@veltdev/crdt';

function Editor() {
  const [store, setStore] = useState(null);

  useEffect(() => {
    // Manual creation misses cleanup and reactive updates
    createVeltStore({ id: 'doc', type: 'text' }).then(setStore);
  }, []);

  return <div>{/* ... */}</div>;
}
```

**Correct (v1 useVeltCrdtStore hook — deprecated; prefer v2 useStore):**

```tsx
import { useVeltCrdtStore } from '@veltdev/crdt-react';

function Editor() {
  const { value, update, store } = useVeltCrdtStore<string>({
    id: 'my-collab-note',
    type: 'text',
    initialValue: 'Hello, world!',
  });

  return (
    <textarea
      value={value ?? ''}
      onChange={(e) => update(e.target.value)}
    />
  );
}
```

**Hook Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Unique identifier for the store (v2: renamed to `storeId`) |
| `type` | `'text'` \| `'array'` \| `'map'` \| `'xml'` | Yjs data structure type |
| `initialValue` | T (optional) | Initial value for new stores |
| `debounceMs` | number (optional) | Debounce time for updates |
| `enablePresence` | boolean (optional) | Enable presence tracking (default: true) |

**Hook Returns:**

| Property | Description |
|----------|-------------|
| `value` | Current reactive store value |
| `versions` | Reactive list of all saved versions |
| `store` | Underlying store instance |
| `update` | Function to update the store |
| `saveVersion` | Save a named checkpoint |
| `getVersions` | Get all saved versions (async) |
| `getVersionById` | Fetch a specific version by ID |
| `restoreVersion` | Restore store to a version by ID (convenience method) |
| `setStateFromVersion` | Restore from a version object |

**Verification:**
- [ ] **New code uses v2 `useStore` instead** — see `core-store-v2-api.md`
- [ ] Existing v1 call sites are scheduled for migration — see `core-v1-to-v2-migration.md`
- [ ] Hook is called inside VeltProvider
- [ ] Store `id` is unique per collaborative instance
- [ ] `value` updates when remote peers make changes

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (## Legacy API (v1) > useVeltCrdtStore() (deprecated))
