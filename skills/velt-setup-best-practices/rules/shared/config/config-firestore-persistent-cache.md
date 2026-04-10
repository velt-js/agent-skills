---
title: Call enableFirestorePersistentCache Before Authentication to Enable Offline and Multi-Tab Sync
impact: HIGH
impactDescription: Enables offline reads and multi-tab sync via Firestore persistent local cache
tags: enableFirestorePersistentCache, disableFirestorePersistentCache, offline, multi-tab, cache, authProvider, firestore
---

## Call enableFirestorePersistentCache Before Authentication to Enable Offline and Multi-Tab Sync

`client.enableFirestorePersistentCache()` initializes Firestore with `persistentLocalCache` and `persistentMultipleTabManager`, enabling offline reads and cross-tab data sync. It **must** be called before authentication — calling it after the VeltProvider mounts with `authProvider` has no effect because the SDK initializes Firestore during auth.

**Incorrect (called after VeltProvider with authProvider):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function MyComponent() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    // Wrong: VeltProvider already authenticated via authProvider,
    // so Firestore is already initialized without persistent cache
    client.enableFirestorePersistentCache({ ha: true }); // Too late — ignored
  }, [client]);
}
```

**Correct (React — called before VeltProvider mounts):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect, useState } from 'react';
import { VeltProvider } from '@veltdev/react';
import { useVeltAuthProvider } from '@/components/velt/VeltInitializeUser';

// Option 1: Configure cache in a component that renders before VeltProvider
function AppWithVelt() {
  const { authProvider } = useVeltAuthProvider();
  const [cacheReady, setCacheReady] = useState(false);

  // Enable cache before VeltProvider mounts
  useEffect(() => {
    // Cache config happens at the client level before provider auth
    setCacheReady(true);
  }, []);

  if (!authProvider || !cacheReady) return <div>Loading...</div>;

  return (
    <VeltProvider
      apiKey="YOUR_API_KEY"
      authProvider={authProvider}
      config={{ firestorePersistentCache: { enabled: true, ha: true } }}
    >
      {/* App content */}
    </VeltProvider>
  );
}
```

**Correct (non-React / vanilla JS):**

```js
import { initVelt } from '@veltdev/client';

const client = await initVelt('YOUR_API_KEY');

// Call before setting auth provider
client.enableFirestorePersistentCache({ ha: true });

await client.setVeltAuthProvider({
  user,
  generateToken: async () => {
    const resp = await fetch("/api/velt/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.userId, organizationId: user.organizationId }),
    });
    const { token } = await resp.json();
    return token;
  },
});
```

**Disabling the cache:**

```js
// Also must be called before authentication
client.disableFirestorePersistentCache({ ha: true });
```

**Method signatures:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `enableFirestorePersistentCache` | `(config?: { ha?: boolean }): void` | Initialize Firestore with persistent local cache |
| `disableFirestorePersistentCache` | `(config?: { ha?: boolean }): void` | Disable the persistent local cache |

**Config parameter:**

| Key | Type | Description |
|-----|------|-------------|
| `ha` | `boolean` (optional) | Enable high-availability mode via `persistentMultipleTabManager` |

**Verification:**
- [ ] `enableFirestorePersistentCache()` called before `authProvider` authentication
- [ ] Not called after VeltProvider mounts — reorder if needed
- [ ] `ha: true` set when multi-tab sync is required

**Source Pointers:**
- https://docs.velt.dev/get-started/setup - Firestore Persistent Cache
