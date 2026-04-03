---
title: Configure Firebase Reverse Proxy via proxyConfig
impact: HIGH
impactDescription: Enables routing all Velt SDK traffic through a Firebase reverse proxy for enterprise network control
tags: proxyConfig, proxy, cdnHost, apiHost, v2DbHost, v1DbHost, storageHost, authHost, forceLongPolling, apiProxyDomain, firebase, reverse-proxy
---

## Configure Firebase Reverse Proxy via proxyConfig

Use the `proxyConfig` field on the `VeltProvider` config prop (React) or the second argument to `initVelt()` (non-React) to route all Velt SDK traffic through a Firebase reverse proxy. This replaces the deprecated `apiProxyDomain` top-level field added in earlier versions.

**Incorrect (deprecated top-level apiProxyDomain field):**

```jsx
// DEPRECATED — still functional but will be removed in a future version
<VeltProvider
  apiKey="YOUR_API_KEY"
  config={{ apiProxyDomain: 'https://proxy.example.com/api' }}
>
  {/* app */}
</VeltProvider>
```

**Correct (React — nested proxyConfig object):**

```jsx
import { VeltProvider } from '@veltdev/react';

function App() {
  return (
    <VeltProvider
      apiKey="YOUR_API_KEY"
      config={{
        proxyConfig: {
          cdnHost: 'https://proxy.example.com/cdn',
          apiHost: 'https://proxy.example.com/api',
          v2DbHost: 'https://proxy.example.com/rtdb-v2',
          v1DbHost: 'https://proxy.example.com/rtdb-v1',
          storageHost: 'https://proxy.example.com/storage',
          authHost: 'https://proxy.example.com/auth',
          forceLongPolling: true,
        },
      }}
    >
      {/* app */}
    </VeltProvider>
  );
}
```

**Correct (non-React — Angular, Vue, HTML):**

```typescript
import { initVelt } from '@veltdev/client';

const client = await initVelt('YOUR_API_KEY', {
  proxyConfig: {
    cdnHost: 'https://proxy.example.com/cdn',
    apiHost: 'https://proxy.example.com/api',
    v2DbHost: 'https://proxy.example.com/rtdb-v2',
    v1DbHost: 'https://proxy.example.com/rtdb-v1',
    storageHost: 'https://proxy.example.com/storage',
    authHost: 'https://proxy.example.com/auth',
    forceLongPolling: true,
  },
});
```

**ProxyConfig interface (v5.0.2-beta.11+):**

| Field | Type | Description |
|-------|------|-------------|
| `cdnHost` | `string` | Proxy host for Velt CDN asset requests |
| `apiHost` | `string` | Proxy host for Velt REST API requests. Replaces deprecated `apiProxyDomain` |
| `v2DbHost` | `string` | Proxy host for Firestore (v2 database) connections |
| `v1DbHost` | `string` | Proxy host for Firebase RTDB (v1 database). Host-lock prevents Firebase SDK shard redirect |
| `storageHost` | `string` | Proxy host for Firebase Storage requests |
| `authHost` | `string` | Proxy host for Firebase Auth. Cached in localStorage at `initConfig()` time for pre-Auth-SDK initialization |
| `forceLongPolling` | `boolean` | Force long-polling transport instead of WebSocket for RTDB. Default: `false`. Required for proxies that do not support WebSocket upgrades |

**Migrating from apiProxyDomain (v5.0.2-beta.11+):**

```jsx
// BEFORE — deprecated (still functional, removal timeline not yet announced)
<VeltProvider config={{ apiProxyDomain: 'https://proxy.example.com/api' }} />

// AFTER — use proxyConfig.apiHost
<VeltProvider config={{ proxyConfig: { apiHost: 'https://proxy.example.com/api' } }} />
```

All seven `ProxyConfig` fields are optional. Configure only the hosts you need to proxy; omitted fields use Velt's default endpoints.

**Verification:**
- [ ] `proxyConfig` is nested under `config` prop on `VeltProvider`, not at the top level
- [ ] `apiProxyDomain` replaced with `proxyConfig.apiHost` in all environments
- [ ] `forceLongPolling: true` set if the reverse proxy does not support WebSocket upgrades
- [ ] Only the hosts being proxied are specified; unused fields are omitted

**Source Pointers:**
- https://docs.velt.dev/get-started/setup - VeltProvider config prop
- https://docs.velt.dev/get-started/setup/advance-features - Firebase Reverse Proxy
