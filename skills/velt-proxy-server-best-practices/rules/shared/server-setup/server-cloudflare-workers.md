---
title: Cloudflare Workers Configuration for Velt Proxy
impact: HIGH
impactDescription: Edge-deployed proxies for Auth, v2Db, v1Db, and Storage; wrong auth path routing or a hard-coded v1Db upstream breaks token refresh or realtime
tags: cloudflare, workers, edge, authHost, v1DbHost, v2DbHost, storageHost, reverse-proxy
---

## Cloudflare Workers Configuration for Velt Proxy

Cloudflare Workers is an edge-distributed alternative to self-hosted nginx (about 15 minutes to set up). The `velt-js/velt-proxy-server` repo ships one Worker per service in its `cloudflare/` folder, covering Auth, v2Db, v1Db, and Storage. The Workers runtime handles WebSocket upgrades, so v1Db works without extra SDK configuration. `cdnHost` and `apiHost` are not covered by these recipes; contact Velt support if you need them.

### Subdomains and Deployment

Create CNAME records for four subdomains under a domain you control and attach them to your Cloudflare zone:

| Subdomain | Service | Upstream |
|-----------|---------|----------|
| `auth-proxy.yourdomain.com` | Auth | `securetoken.googleapis.com` + `identitytoolkit.googleapis.com` (path-based) |
| `v2db-proxy.yourdomain.com` | v2Db | `firestore.googleapis.com` |
| `v1db-proxy.yourdomain.com` | v1Db | `<ns>.firebaseio.com` (dynamic per request) |
| `storage-proxy.yourdomain.com` | Storage | `firebasestorage.googleapis.com` |

Deploy each Worker with Wrangler, then bind each one to its subdomain (Cloudflare dashboard → Workers & Pages → Settings → Triggers → Add Custom Domain):

```bash
cd cloudflare/auth-proxy    && wrangler deploy && cd ..
cd v2db-proxy               && wrangler deploy && cd ..
cd v1db-proxy               && wrangler deploy && cd ..
cd storage-proxy            && wrangler deploy && cd ..
```

### Path-Based Auth Routing

The Auth proxy splits on URL path: `/v1/token` and `/v2/token` requests go to the token-refresh upstream (`securetoken.googleapis.com`), everything else goes to the identity upstream (`identitytoolkit.googleapis.com`).

**Incorrect:**

```js
// Sends every Auth request to identitytoolkit; token refreshes will 404
upstream = 'https://identitytoolkit.googleapis.com';
```

**Correct:**

```js
// auth-proxy.* handler (abbreviated)
if (url.pathname.startsWith('/v1/token') || url.pathname.startsWith('/v2/token')) {
  url.hostname = 'securetoken.googleapis.com';
} else {
  url.hostname = 'identitytoolkit.googleapis.com';
}
```

### Dynamic v1Db Upstream from `?ns=`

v1Db requests carry the Firebase namespace in the `?ns=` query param. The Worker rewrites the upstream Host to the shard that owns that namespace per request. Pair with the SDK's `v1DbHost` host-lock, which prevents Firebase from redirecting subsequent traffic to a shard server (`s-gke-*.firebaseio.com`) that would bypass your proxy.

**Incorrect:**

```js
// Hard-coded upstream: works for one project, breaks once the SDK switches namespaces
const upstream = 'https://my-project.firebaseio.com' + url.pathname + url.search;
```

**Correct:**

```js
// v1db-proxy.* handler (abbreviated)
const ns = url.searchParams.get('ns');
if (!ns) return new Response('Missing ns parameter', { status: 400 });

url.hostname = `${ns}.firebaseio.com`;

// Forward the raw Request on WebSocket upgrades so the stream survives
if (request.headers.get('Upgrade') === 'websocket') {
  return fetch(new Request(url, request));
}
```

Validate that `?ns=` is present before interpolating it into the upstream hostname: a missing or malformed value would otherwise produce a request to `https://null.firebaseio.com`. On WebSocket upgrades, forward the original `Request` object (with the rewritten URL) so the upgrade headers and stream survive end-to-end; bypassing this re-wrap can break RTDB real-time listeners.

### v2Db and Storage Passthrough

v2Db and Storage are straight passthroughs. Forward the request to the upstream and set the upstream hostname as the `Host` header. Do not rewrite path or body.

### Verify

From any machine, confirm each proxy responds:

```bash
curl -I https://auth-proxy.yourdomain.com/
curl -I https://v2db-proxy.yourdomain.com/
curl -I https://v1db-proxy.yourdomain.com/?ns=YOUR_PROJECT
curl -I https://storage-proxy.yourdomain.com/
```

Upstream response headers (2xx or 4xx) confirm the proxy is live and reaching the upstream. Then point the SDK at the four subdomains with `proxyConfig`; WebSockets are on by default, so no extra SDK configuration is required.

### Key Points

- One Worker per service, each bound to its own subdomain as a Custom Domain
- Auth routing is path-based (`/v1/token` and `/v2/token` vs everything else); don't collapse it to a single upstream
- v1Db upstream must be derived from the `?ns=` query param on every request, not hard-coded
- For v1Db, detect the `Upgrade: websocket` header and forward the raw `Request` so the upgrade stream survives
- Pair with `proxyConfig` `{ authHost, v2DbHost, v1DbHost, storageHost }` in your SDK config
- `cdnHost` and `apiHost` are not covered; contact Velt support if you need them

**Source Pointers:**
- https://docs.velt.dev/security/proxy-server#cloudflare-workers — "Cloudflare Workers"
- https://docs.velt.dev/security/proxy-server#deploy-the-proxy-server — "Routing notes by service"
