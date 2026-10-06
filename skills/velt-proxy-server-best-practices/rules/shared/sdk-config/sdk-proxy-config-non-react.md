---
title: Configure proxyConfig for Angular, Vue, and HTML
impact: CRITICAL
impactDescription: proxyConfig must be passed in the initVelt() options object at init time
tags: proxyConfig, initVelt, Angular, Vue, HTML, non-react
---

## Configure proxyConfig for Angular, Vue, and HTML

For non-React frameworks, pass `proxyConfig` as part of the options object (second argument) to `initVelt()`.

**Incorrect (proxyConfig as a separate value or deprecated field):**

```js
const client = await initVelt('YOUR_API_KEY', {
  apiProxyDomain: 'https://api-proxy.yourdomain.com', // deprecated
});
```

**Correct:**

### Single Host

```js
const client = await initVelt('YOUR_API_KEY', {
  proxyConfig: {
    cdnHost: 'https://cdn.yourdomain.com',
  },
});
```

### Full Proxy Configuration

```js
const client = await initVelt('YOUR_API_KEY', {
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

### Key Points

- `proxyConfig` goes inside the second argument to `initVelt()`, not as a separate call
- Only specify the hosts you're actually proxying
- The deprecated `apiProxyDomain` should be replaced with `proxyConfig.apiHost`
- Authenticate with `client.setVeltAuthProvider({ user, generateToken })` after `initVelt()`

**Source Pointers:**
- https://docs.velt.dev/security/proxy-server#quick-start — "Quick start" (Other Frameworks tab)
- https://docs.velt.dev/api-reference/sdk/models/data-models#proxyconfig — ProxyConfig
