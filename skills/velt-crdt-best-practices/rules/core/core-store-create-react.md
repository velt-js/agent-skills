---
title: Use useVeltCrdtStore Hook for React CRDT Stores
impact: CRITICAL
impactDescription: Provides reactive store with automatic cleanup
tags: react, hook, useVeltCrdtStore, store
---

## Use useVeltCrdtStore Hook for React CRDT Stores

In React, use `useVeltCrdtStore` for automatic lifecycle management. The hook handles subscriptions, updates, and cleanup on unmount.

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

**Correct (useVeltCrdtStore hook):**

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
| `id` | string | Unique identifier for the store |
| `type` | `'text'` \| `'array'` \| `'map'` \| `'xml'` | Yjs data structure type |
| `initialValue` | T (optional) | Initial value for new stores |
| `debounceMs` | number (optional) | Debounce time for updates |
| `enablePresence` | boolean (optional) | Enable presence tracking (default: true) |

**Hook Returns:**

| Property | Description |
|----------|-------------|
| `value` | Current reactive store value |
| `update` | Function to update the store |
| `store` | Underlying store instance |
| `saveVersion` | Save a named checkpoint |
| `getVersions` | Get all saved versions |
| `setStateFromVersion` | Restore from a version |

**Verification:**
- [ ] Hook is called inside VeltProvider
- [ ] Store `id` is unique per collaborative instance
- [ ] `value` updates when remote peers make changes
- [ ] No memory leaks on component unmount

**Source Pointer:** `/docs/realtime-collaboration/crdt/setup/core.mdx` (### Step 3: Initialize a CRDT store > React / Next.js)
