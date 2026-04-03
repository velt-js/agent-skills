---
title: Call enableFirestorePersistentCache Before identify to Enable Offline and Multi-Tab Sync
impact: HIGH
impactDescription: Enables offline reads and multi-tab sync via Firestore persistent local cache
tags: enableFirestorePersistentCache, disableFirestorePersistentCache, offline, multi-tab, cache, identify, firestore
---

## Call enableFirestorePersistentCache Before identify to Enable Offline and Multi-Tab Sync

`client.enableFirestorePersistentCache()` initializes Firestore with `persistentLocalCache` and `persistentMultipleTabManager`, enabling offline reads and cross-tab data sync. It **must** be called before `identify()` — calling it after authentication has no effect.

**Incorrect (called after identify):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function App() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    // Wrong: identify runs before cache is configured
    client.identify(user);
    client.enableFirestorePersistentCache({ ha: true }); // Too late — ignored
  }, [client]);
}
```

**Correct (called before identify):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function VeltAuth({ user }) {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client || !user) return;

    async function init() {
      // Must be called before identify()
      client.enableFirestorePersistentCache({ ha: true });
      await client.identify(user);
    }

    init();
  }, [client, user]);

  return null;
}
```

**Correct (non-React / vanilla JS):**

```js
import { initVelt } from '@veltdev/client';

const client = await initVelt('YOUR_API_KEY');

// Call before identify
client.enableFirestorePersistentCache({ ha: true });
await client.identify(user);
```

**Disabling the cache:**

```js
// Also must be called before identify()
client.disableFirestorePersistentCache({ ha: true });
await client.identify(user);
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
- [ ] `enableFirestorePersistentCache()` called before `identify()`
- [ ] Not called after identify — reorder if needed
- [ ] `ha: true` set when multi-tab sync is required

**Source Pointers:**
- https://docs.velt.dev/get-started/setup - Firestore Persistent Cache
