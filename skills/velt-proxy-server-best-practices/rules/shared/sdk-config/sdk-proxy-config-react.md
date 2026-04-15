---
title: Configure proxyConfig in React / Next.js
impact: CRITICAL
tags: proxyConfig, VeltProvider, React, Next.js, config
---

## Configure proxyConfig in React / Next.js

Pass `proxyConfig` inside the `config` prop on `VeltProvider`. Each field is a base URL pointing to your reverse proxy.

### Single Host (e.g., proxy only the CDN)

```jsx
<VeltProvider
  apiKey="YOUR_API_KEY"
  authProvider={authProvider}
  config={{
    proxyConfig: {
      cdnHost: 'https://cdn.yourdomain.com',
    },
  }}
>
  <App />
</VeltProvider>
```

The SDK automatically appends `/lib/sdk@[VERSION]/velt.js` to `cdnHost` to fetch the bundle. Your proxy must forward that path to `https://cdn.velt.dev`.

### Full Proxy Configuration

```jsx
<VeltProvider
  apiKey="YOUR_API_KEY"
  authProvider={authProvider}
  config={{
    proxyConfig: {
      cdnHost: 'https://cdn-proxy.yourdomain.com',
      apiHost: 'https://api-proxy.yourdomain.com',
      v2DbHost: 'https://persistence-proxy.yourdomain.com',
      v1DbHost: 'https://rtdb-proxy.yourdomain.com',
      storageHost: 'https://storage-proxy.yourdomain.com',
      authHost: 'https://auth-proxy.yourdomain.com',
      forceLongPolling: false,
    },
  }}
>
  <App />
</VeltProvider>
```

### Key Points

- `proxyConfig` is nested under `config`, not at the top level of `VeltProvider`
- The deprecated `apiProxyDomain` top-level field still works but should be replaced with `proxyConfig.apiHost`
- Only specify the hosts you're actually proxying — omit the rest
- `authProvider` and `config` are sibling props on `VeltProvider`

### Migration from apiProxyDomain

If you have the deprecated `apiProxyDomain`, replace it:

```jsx
// Before (deprecated)
<VeltProvider config={{ apiProxyDomain: 'https://proxy.example.com/api' }} />

// After
<VeltProvider config={{ proxyConfig: { apiHost: 'https://proxy.example.com/api' } }} />
```
