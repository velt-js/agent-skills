---
title: Subscribe to Store Changes for Remote Updates
impact: HIGH
impactDescription: Enables real-time collaboration visibility
tags: subscribe, realtime, updates, sync
---

## Subscribe to Store Changes for Remote Updates

To see changes from other collaborators, subscribe to store updates. In React, the hook's `value` is reactive. In vanilla JS, use `store.subscribe()`.

**Incorrect (not subscribing - missing remote updates):**

```ts
const store = await createVeltStore({ id: 'doc', type: 'text', veltClient });
const value = store.getValue(); // Only gets current value once
// Remote changes won't be visible
```

**Correct (React - reactive value):**

```tsx
import { useEffect } from 'react';
import { useVeltCrdtStore } from '@veltdev/crdt-react';

function Editor() {
  const { value } = useVeltCrdtStore<string>({ id: 'my-collab-note', type: 'text' });

  useEffect(() => {
    console.log('Updated value:', value);
  }, [value]);

  return <div>{value}</div>;
}
```

**Correct (Vanilla JS - manual subscription):**

```ts
const store = await createVeltStore<string>({
  id: 'doc',
  type: 'text',
  veltClient,
});

// Subscribe to all changes (local and remote)
const unsubscribe = store.subscribe((newValue) => {
  console.log('Updated value:', newValue);
  document.getElementById('output').textContent = newValue;
});

// Cleanup when done
unsubscribe();
```

**Alternative: One-time read with getValue():**

```ts
// For one-time read (not reactive)
const currentValue = store.getValue();
```

**Verification:**
- [ ] React: `value` from hook updates when remote peers change data
- [ ] Vanilla: `subscribe()` callback fires on remote changes
- [ ] Unsubscribe called on cleanup to prevent leaks

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (### Step 5: Listen for changes)
