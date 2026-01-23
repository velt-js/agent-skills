---
title: Use update() Method to Modify Store Values
impact: HIGH
impactDescription: Ensures changes sync to all collaborators
tags: update, sync, modify, collaborative
---

## Use update() Method to Modify Store Values

Always use the store's `update()` method to modify values. Direct mutation bypasses CRDT synchronization and won't propagate to other users.

**Incorrect (direct mutation - won't sync):**

```tsx
function Editor() {
  const { value } = useVeltCrdtStore<string>({ id: 'note', type: 'text' });

  const handleChange = (e) => {
    // Direct assignment - other users won't see this
    value = e.target.value;
  };

  return <input onChange={handleChange} />;
}
```

**Correct (React - using update from hook):**

```tsx
import { useVeltCrdtStore } from '@veltdev/crdt-react';

function Editor() {
  const { value, update } = useVeltCrdtStore<string>({
    id: 'my-collab-note',
    type: 'text',
  });

  const handleChange = (e) => {
    update(e.target.value); // Syncs to all collaborators
  };

  return <input value={value ?? ''} onChange={handleChange} />;
}
```

**Correct (Vanilla JS):**

```ts
const store = await createVeltStore<string>({
  id: 'doc',
  type: 'text',
  veltClient,
});

// Use store.update() for changes
store.update('Hello, collaborative world!');
```

**Verification:**
- [ ] All mutations go through `update()`
- [ ] Changes appear for other collaborators
- [ ] No direct value assignment

**Source Pointer:** `/docs/realtime-collaboration/crdt/setup/core.mdx` (### Step 4: Set or update the store value)
