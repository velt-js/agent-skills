---
title: Initialize Velt Client Before Creating CRDT Stores
impact: CRITICAL
impactDescription: Prevents CRDT store creation failures
tags: setup, initialization, veltprovider, initVelt
---

## Initialize Velt Client Before Creating CRDT Stores

CRDT stores require a properly initialized Velt client. React apps must wrap with `VeltProvider`; other frameworks must call `initVelt()` before creating stores.

**Incorrect (store created without Velt initialization):**

```tsx
// React - missing VeltProvider
function App() {
  // This will fail - no Velt client available
  const { store } = useVeltCrdtStore({ id: 'note', type: 'text' });
  return <div>{/* ... */}</div>;
}
```

**Correct (React / Next.js):**

```tsx
import { VeltProvider } from '@veltdev/react';

function App() {
  return (
    <VeltProvider apiKey="YOUR_API_KEY">
      <CollaborativeEditor />
    </VeltProvider>
  );
}

function CollaborativeEditor() {
  // Now works - VeltProvider initialized the client
  const { store } = useVeltCrdtStore({ id: 'note', type: 'text' });
  return <div>{/* ... */}</div>;
}
```

**Correct (Other Frameworks):**

```ts
import { createVeltStore } from '@veltdev/crdt';
import { initVelt } from '@veltdev/client';

// Step 1: Initialize Velt client first
const veltClient = await initVelt('YOUR_API_KEY');

// Step 2: Now create store with veltClient
const store = await createVeltStore({
  id: 'my-document',
  type: 'text',
  veltClient,  // Required - pass the initialized client
});
```

**Verification:**
- [ ] VeltProvider wraps app at root (React)
- [ ] initVelt() called before createVeltStore (non-React)
- [ ] API key is valid and domain is safelisted in Velt Console
- [ ] No console errors about missing Velt client

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/core` (### Step 2: Initialize Velt in your app)
