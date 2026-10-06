---
title: Configure Reverse Proxy Routing via proxyConfig
impact: HIGH
impactDescription: Routes Velt SDK traffic through your own proxy hosts for enterprise network control; replaces the deprecated apiProxyDomain
tags: proxyConfig, proxy, cdnHost, apiHost, v2DbHost, v1DbHost, storageHost, authHost, forceLongPolling, apiProxyDomain, integrity, reverse-proxy
---

## Configure Reverse Proxy Routing via proxyConfig

Use the `proxyConfig` field on the `VeltProvider` `config` prop (React) or the second argument to `initVelt()` (other frameworks) to route Velt SDK traffic through reverse proxies on your own domain. It replaces the deprecated top-level `apiProxyDomain` field. For deploying the proxy servers themselves (Cloudflare Workers, nginx), use the `velt-proxy-server-best-practices` skill.

**Incorrect (deprecated top-level apiProxyDomain field):**

```jsx
// DEPRECATED: use proxyConfig.apiHost instead
<VeltProvider
  apiKey="YOUR_VELT_API_KEY"
  config={{ apiProxyDomain: 'https://proxy.example.com/api' }}
>
  {/* app */}
</VeltProvider>
```

**Correct (React: nested proxyConfig object):**

```jsx
import { VeltProvider } from '@veltdev/react';

function App() {
  return (
    <VeltProvider
      apiKey="YOUR_VELT_API_KEY"
      config={{
        proxyConfig: {
          cdnHost: 'https://cdn-proxy.yourdomain.com',
          apiHost: 'https://api-proxy.yourdomain.com',
          v2DbHost: 'https://v2db-proxy.yourdomain.com',
          v1DbHost: 'https://v1db-proxy.yourdomain.com',
          storageHost: 'https://storage-proxy.yourdomain.com',
          authHost: 'https://auth-proxy.yourdomain.com',
          forceLongPolling: false,
        },
      }}
    >
      {/* app */}
    </VeltProvider>
  );
}
```

**Correct (non-React: Angular, Vue, HTML):**

```typescript
import { initVelt } from '@veltdev/client';

const client = await initVelt('YOUR_VELT_API_KEY', {
  proxyConfig: {
    cdnHost: 'https://cdn-proxy.yourdomain.com',
    apiHost: 'https://api-proxy.yourdomain.com',
    v2DbHost: 'https://v2db-proxy.yourdomain.com',
    v1DbHost: 'https://v1db-proxy.yourdomain.com',
    storageHost: 'https://storage-proxy.yourdomain.com',
    authHost: 'https://auth-proxy.yourdomain.com',
    forceLongPolling: false,
  },
});
```

**ProxyConfig interface (v5.0.2-beta.11+):**

| Field | Type | Upstream it replaces |
|-------|------|----------------------|
| `cdnHost` | `string` | `cdn.velt.dev` (SDK bundle). Velt appends `/lib/sdk@[VERSION]/velt.js` |
| `apiHost` | `string` | `api.velt.dev`. Replaces deprecated `apiProxyDomain` |
| `v2DbHost` | `string` | `firestore.googleapis.com` (persistence database) |
| `v1DbHost` | `string` | `*.firebaseio.com` (ephemeral realtime database). The SDK host-locks RTDB so shard redirects stay on your proxy |
| `storageHost` | `string` | `firebasestorage.googleapis.com` (attachments, recordings) |
| `authHost` | `string` | `identitytoolkit.googleapis.com` + `securetoken.googleapis.com`. Cached in `localStorage` at init so token refreshes on reload go through the proxy |
| `forceLongPolling` | `boolean` | Long-polling instead of WebSockets for the database connections. Default: `false` |

All fields are optional. Configure only the hosts you proxy; omitted fields talk to the default upstream directly. Each proxy must forward requests without modifying headers or content.

Since v6.0.0-beta.7, the boot-time auth request on page reload also routes through `proxyConfig.authHost`. No configuration change is required.

**Subresource Integrity:** `integrity: true` is a sibling of `proxyConfig` in the same config object (default `false`). It lets the browser verify the SDK bundle, which matters most when `cdnHost` points at your proxy.

```jsx
<VeltProvider
  apiKey="YOUR_VELT_API_KEY"
  config={{ integrity: true, proxyConfig: { cdnHost: 'https://cdn-proxy.yourdomain.com' } }}
>
  {/* app */}
</VeltProvider>
```

**Migrating from apiProxyDomain:**

```jsx
// BEFORE: deprecated
<VeltProvider apiKey="YOUR_VELT_API_KEY" config={{ apiProxyDomain: 'https://proxy.example.com/api' }} />

// AFTER: use proxyConfig.apiHost
<VeltProvider apiKey="YOUR_VELT_API_KEY" config={{ proxyConfig: { apiHost: 'https://proxy.example.com/api' } }} />
```

**Verification:**
- [ ] `proxyConfig` is nested under the `config` prop on `VeltProvider` (or the second `initVelt()` argument), not at the top level
- [ ] `apiProxyDomain` replaced with `proxyConfig.apiHost` in all environments
- [ ] `forceLongPolling: true` set only if the reverse proxy does not support WebSocket upgrades
- [ ] Only the hosts being proxied are specified; unused fields are omitted
- [ ] CSP allows your proxy domains (see the proxy server skill)

**Source Pointers:**
- https://docs.velt.dev/security/proxy-server - "Quick start", "Configure each service"
- https://docs.velt.dev/api-reference/sdk/models/data-models#proxyconfig - ProxyConfig
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltproviderconfig - VeltProviderConfig (`integrity`, deprecated `apiProxyDomain`)
