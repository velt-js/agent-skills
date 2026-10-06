---
title: Initialize Velt Client Before Creating CRDT Stores
impact: CRITICAL
impactDescription: Prevents CRDT store creation failures
tags: setup, initialization, veltprovider, initVelt
---

## Initialize Velt Client Before Creating CRDT Stores

CRDT stores require a properly initialized Velt client with a document context and an authenticated user. React apps wrap with `VeltProvider` and set the document; other frameworks call `initVelt()`, set the document, identify the user, and wait for `getVeltInitState()` before creating stores.

**Incorrect (store created without Velt initialization):**

```tsx
// React - missing VeltProvider
function App() {
  // This will fail - no Velt client available
  const { store } = useStore({ storeId: 'note', type: 'text' });
  return <div>{/* ... */}</div>;
}
```

**Correct (React / Next.js):**

```tsx
import { VeltProvider, useSetDocument } from '@veltdev/react';

function App() {
  return (
    <VeltProvider apiKey="YOUR_API_KEY" authProvider={authProvider}>
      <CollaborativeEditor />
    </VeltProvider>
  );
}

function CollaborativeEditor() {
  useSetDocument('my-document-id', { documentName: 'My Document' });
  // Now works - VeltProvider initialized the client
  const { store } = useStore({ storeId: 'note', type: 'text' });
  return <div>{/* ... */}</div>;
}
```

**Correct (Other Frameworks):**

```ts
import { createVeltStore } from '@veltdev/crdt';
import { initVelt } from '@veltdev/client';

// Step 1: Initialize Velt client first
const veltClient = await initVelt('YOUR_API_KEY');

// Step 2: Set the document scope and authenticate the user
veltClient.setDocument('my-document-id', { documentName: 'My Document' });
await veltClient.identify({ userId: 'user-1', name: 'John Doe', email: 'john@example.com' });

// Step 3: Wait for the SDK, then create the store with veltClient
veltClient.getVeltInitState().subscribe(async (isReady) => {
  if (!isReady) return;
  const store = await createVeltStore({
    id: 'my-store',
    type: 'text',
    veltClient,  // Required - pass the initialized client
  });
});
```

**v6 modular SDK note:** each feature loads as its own chunk. If you pass `featureAllowList` at init, include `'crdt'` so the CRDT chunk preloads (for example `['comment', 'presence', 'crdt']`), or call `await client.preloadCrdt()` before first use. Per the docs, calling `getCrdtElement()` or `preloadCrdt()` for a feature omitted from the list auto-enables it. Omitting `featureAllowList` preloads every chunk, as before.

**Verification:**
- [ ] VeltProvider wraps app at root (React)
- [ ] initVelt() called before createVeltStore (non-React)
- [ ] Document set (`useSetDocument` / `setDocument`) and user authenticated before the store is created
- [ ] Non-React store creation gated on `getVeltInitState()` emitting `true`
- [ ] When `featureAllowList` is used (v6), it includes `'crdt'` or `preloadCrdt()` runs before first use
- [ ] API key is valid and domain is safelisted in Velt Console
- [ ] No console errors about missing Velt client

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core#step-2-initialize-velt-in-your-app - "Step 2: Initialize Velt in your app"
- https://docs.velt.dev/api-reference/sdk/api/api-methods#modular-sdk--chunk-preloading - "Modular SDK / Chunk Preloading" and `preloadCrdt()`
- https://docs.velt.dev/api-reference/sdk/models/data-models#config - `featureAllowList`
