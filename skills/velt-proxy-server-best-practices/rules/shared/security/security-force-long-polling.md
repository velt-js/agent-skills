---
title: forceLongPolling for WebSocket-Incompatible Proxies
impact: HIGH
tags: forceLongPolling, WebSocket, long-polling, proxy, database
---

## forceLongPolling for WebSocket-Incompatible Proxies

If your reverse proxy doesn't support WebSocket upgrades (common with some load balancers, CDN edge proxies, or corporate proxies), set `forceLongPolling: true` to force database connections to use HTTP long-polling instead.

### React / Next.js

```jsx
<VeltProvider
  apiKey="YOUR_API_KEY"
  authProvider={authProvider}
  config={{
    proxyConfig: {
      v1DbHost: 'https://rtdb-proxy.yourdomain.com',
      v2DbHost: 'https://persistence-proxy.yourdomain.com',
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
    v1DbHost: 'https://rtdb-proxy.yourdomain.com',
    v2DbHost: 'https://persistence-proxy.yourdomain.com',
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
