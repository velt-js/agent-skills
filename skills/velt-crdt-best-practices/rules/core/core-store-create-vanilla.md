---
title: Use createVeltStore for Non-React CRDT Stores
impact: CRITICAL
impactDescription: Required for Vue, Angular, vanilla JS integrations
tags: vanilla, createVeltStore, vue, angular
---

## Use createVeltStore for Non-React CRDT Stores

For Vue, Angular, or vanilla JavaScript, use `createVeltStore` from `@veltdev/crdt`. You must pass the initialized `veltClient` and manually handle cleanup.

**Incorrect (missing veltClient):**

```ts
import { createVeltStore } from '@veltdev/crdt';

// Missing veltClient - will fail
const store = await createVeltStore({
  id: 'my-document',
  type: 'text',
});
```

**Correct (with veltClient and cleanup):**

```ts
import { createVeltStore } from '@veltdev/crdt';
import { initVelt } from '@veltdev/client';

// Step 1: Initialize Velt
const veltClient = await initVelt('YOUR_API_KEY');

// Step 2: Authenticate user
await veltClient.identify({ userId: 'user-1', name: 'John' });

// Step 3: Set document context
await veltClient.setDocument('my-document-id');

// Step 4: Create store
const store = await createVeltStore<string>({
  id: 'my-document',
  type: 'text',
  initialValue: 'Hello, world!',
  veltClient,
});

// Step 5: Subscribe to changes
const unsubscribe = store.subscribe((newValue) => {
  console.log('Updated value:', newValue);
});

// Step 6: Update value
store.update('Hello, collaborative world!');

// Step 7: Cleanup when done
unsubscribe();
store.destroy();
```

**Store Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the store |
| `type` | `'text'` \| `'array'` \| `'map'` \| `'xml'` | Yes | Yjs data structure type |
| `veltClient` | VeltClient | Yes | Initialized Velt client |
| `initialValue` | T | No | Initial value for new stores |
| `debounceMs` | number | No | Debounce time for updates |
| `enablePresence` | boolean | No | Enable presence tracking |

**Verification:**
- [ ] `initVelt()` called before `createVeltStore()`
- [ ] `veltClient` passed to store config
- [ ] User identified via `veltClient.identify()`
- [ ] Document set via `veltClient.setDocument()`
- [ ] `store.destroy()` called on cleanup

**Source Pointer:** `/docs/realtime-collaboration/crdt/setup/core.mdx` (### Step 3: Initialize a CRDT store > Other Frameworks)
