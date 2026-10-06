---
title: forceLongPolling for WebSocket-Incompatible Proxies
impact: HIGH
impactDescription: Keeps database connections working through proxies that block WebSocket upgrades, at the cost of latency
tags: forceLongPolling, WebSocket, long-polling, proxy, database
---

## forceLongPolling for WebSocket-Incompatible Proxies

If your reverse proxy doesn't support WebSocket upgrades (common with some load balancers, CDN edge proxies, or corporate proxies), set `forceLongPolling: true` to force the persistence and ephemeral database connections to use long-polling instead. It is a `proxyConfig` field.

**Incorrect (top-level config key):**

```jsx
<VeltProvider apiKey="YOUR_API_KEY" config={{ forceLongPolling: true }}>
  <App />
</VeltProvider>
```

**Correct:**

### React / Next.js

```jsx
<VeltProvider
  apiKey="YOUR_API_KEY"
  authProvider={authProvider}
  config={{
    proxyConfig: {
      v1DbHost: 'https://v1db-proxy.yourdomain.com',
      v2DbHost: 'https://v2db-proxy.yourdomain.com',
      forceLongPolling: true,
    },
  }}
>
  <App />
</VeltProvider>
```

### Other Frameworks

```js
const client = await initVelt('YOUR_API_KEY', {
  proxyConfig: {
    v1DbHost: 'https://v1db-proxy.yourdomain.com',
    v2DbHost: 'https://v2db-proxy.yourdomain.com',
    forceLongPolling: true,
  },
});
```

### Trade-offs

- **Pros:** Works with any proxy, no WebSocket support required, simpler nginx config (no `Upgrade`/`Connection` headers needed)
- **Cons:** Higher latency for real-time updates, more HTTP requests, slightly higher bandwidth usage

### When to Use

- Your proxy infrastructure doesn't support WebSocket upgrades
- You're behind a corporate proxy/firewall that blocks WebSocket
- You see connection errors or dropped WebSocket connections through your proxy
- You want the simplest possible proxy setup

Default is `false` (WebSocket preferred). Only set `true` when WebSocket isn't an option.

**Source Pointers:**
- https://docs.velt.dev/security/proxy-server#force-long-polling — Force long polling
- https://docs.velt.dev/api-reference/sdk/models/data-models#proxyconfig — ProxyConfig (`forceLongPolling`)
