---
title: Manage CRDT Store Lifecycle and Cleanup with destroy()
impact: MEDIUM
impactDescription: Prevents memory leaks and stale listeners when stores are no longer needed
tags: crdt, store, lifecycle, cleanup, destroy
---

## Manage CRDT Store Lifecycle and Cleanup with destroy()

In non-React frameworks, you must manually call `store.destroy()` to clean up resources and listeners when done with a CRDT store. In React, the `useVeltCrdtStore` hook handles cleanup automatically on unmount. The store also exposes Yjs-level accessors (`getDoc()`, `getProvider()`, `getText()`, `getXml()`) for advanced integrations.

**Incorrect (no cleanup in non-React frameworks):**

```typescript
// Store is never destroyed — listeners and connections remain active
const store = await createVeltStore({ id: 'doc', type: 'text', veltClient });
// Component or page unmounts without cleanup
```

**Correct (React / Next.js — automatic cleanup via hook):**

```tsx
import { useVeltCrdtStore } from '@veltdev/crdt-react';

function Editor() {
  // Cleanup happens automatically when component unmounts
  const { store, value } = useVeltCrdtStore<string>({
    id: 'my-collab-note',
    type: 'text',
  });

  return <div>{value}</div>;
}
```

**Correct (Other Frameworks — manual destroy):**

```typescript
import { createVeltStore } from '@veltdev/crdt';

const store = await createVeltStore<string>({
  id: 'my-document',
  type: 'text',
  veltClient,
});

// When done with the store (e.g., page navigation, cleanup)
store.destroy();
```

**Yjs-Level Accessors:**

| Method | Returns | Description |
|--------|---------|-------------|
| `store.getDoc()` | `Y.Doc` | Get the underlying Yjs document |
| `store.getProvider()` | `Provider` | Get the provider instance for the store |
| `store.getText()` | `Y.Text \| null` | Get the Y.Text instance (only if store type is `text`) |
| `store.getXml()` | `Y.XmlFragment \| null` | Get the Y.XmlFragment instance (only if store type is `xml`) |

**Verification Checklist:**
- [ ] `store.destroy()` called when store is no longer needed (non-React)
- [ ] React apps use `useVeltCrdtStore` for automatic cleanup
- [ ] Yjs accessors used only after store is initialized (non-null)

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core - destroy(), getDoc(), getProvider(), getText(), getXml()
