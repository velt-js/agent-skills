---
title: Configure proxyConfig for Angular, Vue, and HTML
impact: CRITICAL
tags: proxyConfig, initVelt, Angular, Vue, HTML, non-react
---

## Configure proxyConfig for Angular, Vue, and HTML

For non-React frameworks, pass `proxyConfig` as part of the options object (second argument) to `initVelt()`.

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
    v2DbHost: 'https://persistence-proxy.yourdomain.com',
    v1DbHost: 'https://rtdb-proxy.yourdomain.com',
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
