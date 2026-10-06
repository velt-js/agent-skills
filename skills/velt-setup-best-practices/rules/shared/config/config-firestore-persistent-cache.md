---
title: Call enableFirestorePersistentCache Before Authentication to Enable Offline and Multi-Tab Sync
impact: HIGH
impactDescription: Enables offline reads and multi-tab sync via Firestore persistent local cache; calling it after sign-in has no effect
tags: enableFirestorePersistentCache, disableFirestorePersistentCache, offline, multi-tab, cache, authProvider, setVeltAuthProvider, identify, firestore
---

## Call enableFirestorePersistentCache Before Authentication to Enable Offline and Multi-Tab Sync

`enableFirestorePersistentCache()` enables Firestore offline persistence and multi-tab synchronization. Call it before the user is authenticated (before `identify()` / `setVeltAuthProvider()`). Once the user is signed in, enabling it no longer activates offline reads. There is no `VeltProvider` config key for this; it is a client method only.

**Incorrect (called after VeltProvider already authenticated via authProvider):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function MyComponent() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    // Wrong: the authProvider prop already signed the user in,
    // so this call comes too late to activate offline reads
    client.enableFirestorePersistentCache({ ha: true });
  }, [client]);
}
```

**Correct (React: enable the cache, then authenticate from a child component):**

When you need the persistent cache in React, do not pass `authProvider` as a prop. Authenticate with `client.setVeltAuthProvider()` from a child component so you control the order.

```jsx
// app/page.tsx
"use client";
import { VeltProvider } from '@veltdev/react';
import { VeltAuthWithCache } from '@/components/velt/VeltAuthWithCache';

export default function Page() {
  return (
    <VeltProvider apiKey="YOUR_VELT_API_KEY">
      <VeltAuthWithCache />
      {/* App content */}
    </VeltProvider>
  );
}
```

```jsx
// components/velt/VeltAuthWithCache.tsx
"use client";
import { useEffect } from 'react';
import { useVeltClient } from '@veltdev/react';
import { useAppUser } from '@/app/userAuth/AppUserContext';

export function VeltAuthWithCache() {
  const { client } = useVeltClient();
  const { user } = useAppUser();

  useEffect(() => {
    if (!client || !user) return;

    // 1. Enable the cache first
    client.enableFirestorePersistentCache({ ha: true });

    // 2. Then authenticate
    client.setVeltAuthProvider({
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
  }, [client, user]);

  return null;
}
```

**Correct (non-React / vanilla JS):**

```js
import { initVelt } from '@veltdev/client';

const client = await initVelt('YOUR_VELT_API_KEY');

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
// Revert to the default non-persistent mode
client.disableFirestorePersistentCache({ ha: true });
```

**Method signatures:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `enableFirestorePersistentCache` | `(config?: { ha?: boolean }): void` | Enable Firestore offline persistence and multi-tab synchronization |
| `disableFirestorePersistentCache` | `(config?: { ha?: boolean }): void` | Disable persistence and revert to the default non-persistent mode |

Both are client methods with no React hook. In React, call them on `client` from `useVeltClient()`; in other frameworks, call them on the client returned by `initVelt()` or on the global `Velt`.

**Verification:**
- [ ] `enableFirestorePersistentCache()` runs before `identify()` / `setVeltAuthProvider()`
- [ ] In React, the `authProvider` prop is not used together with a post-mount cache call; auth happens via `client.setVeltAuthProvider()` after enabling the cache
- [ ] No invented `config` key (such as `firestorePersistentCache`) is passed to `VeltProvider`

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/api/api-methods#enablefirestorepersistentcache - enableFirestorePersistentCache()
- https://docs.velt.dev/api-reference/sdk/api/api-methods#disablefirestorepersistentcache - disableFirestorePersistentCache()
- https://docs.velt.dev/get-started/advanced#error-handling-in-authentication - client.setVeltAuthProvider() from a React component
