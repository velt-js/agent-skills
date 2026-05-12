---
title: Cloudflare Workers Configuration for Velt Proxy
impact: HIGH
tags: cloudflare, workers, edge, authHost, v1DbHost, v2DbHost, storageHost, reverse-proxy
---

## Cloudflare Workers Configuration for Velt Proxy

Cloudflare Workers is an edge-distributed alternative to a self-hosted nginx proxy. A single Worker (bound to four subdomains as routes) can cover the four user-proxyable Velt services: Auth, v2Db, v1Db, and Storage. WebSocket upgrade is handled automatically by the Workers runtime, so v1Db works without extra config. `cdnHost` and `apiHost` are not covered by the Workers recipe — contact Velt support if you need to proxy those.

### Subdomain Layout

Create CNAME records for four subdomains under a domain you control, attach them to your Cloudflare zone, and bind them as routes on the Worker:

| Subdomain | Service | Upstream |
|-----------|---------|----------|
| `auth-proxy.yourdomain.com` | Auth | `identitytoolkit.googleapis.com` + `securetoken.googleapis.com` (path-based) |
| `v2db-proxy.yourdomain.com` | v2Db | Your Velt project's persistence endpoint |
| `v1db-proxy.yourdomain.com` | v1Db | `<ns>.firebaseio.com` (dynamic per request) |
| `storage-proxy.yourdomain.com` | Storage | `firebasestorage.googleapis.com` |

### Path-Based Auth Routing

The Auth proxy splits on URL path: `/v1/token` and `/v2/token` requests go to the token-refresh upstream (`securetoken.googleapis.com`), everything else goes to the identity upstream (`identitytoolkit.googleapis.com`).

**Incorrect:**

```js
// Sends every Auth request to identitytoolkit — token refreshes will 404
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
// Hard-coded upstream — works for one project, breaks once the SDK switches namespaces
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

Validate that `?ns=` is present before interpolating it into the upstream hostname — a missing or malformed value would otherwise produce a request to `https://null.firebaseio.com`. On WebSocket upgrades, forward the original `Request` object (with the rewritten URL) so the upgrade headers and stream survive end-to-end; bypassing this re-wrap can break RTDB real-time listeners.

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

Upstream response headers (2xx or 4xx) confirm the proxy is live and reaching the upstream.

### Key Points

- A single Worker handles all four services; route binding picks the handler branch by subdomain
- Auth routing is path-based (`/v1/token` vs everything else) — don't collapse it to a single upstream
- v1Db upstream must be derived from the `?ns=` query param on every request, not hard-coded
- For v1Db, detect the `Upgrade: websocket` header and forward the raw `Request` so the upgrade stream survives — Workers does not transparently preserve WebSocket framing across a `fetch(upstreamUrl)` call without it
- Pair with full `proxyConfig` ({ v2DbHost, v1DbHost, storageHost, authHost }) in your SDK config
- `cdnHost` and `apiHost` are not covered — contact Velt support if you need them
