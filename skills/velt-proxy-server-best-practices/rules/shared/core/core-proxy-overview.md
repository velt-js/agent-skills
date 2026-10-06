---
title: Velt Proxy Server Overview
impact: CRITICAL
impactDescription: Maps each proxyConfig field to the upstream host it replaces; a wrong upstream (for example on v2DbHost) breaks that service behind the proxy
tags: proxyConfig, proxy, reverse-proxy, network, enterprise, branding, velt-proxy-server, firestore, firebaseio
---

## Velt Proxy Server Overview

The Velt SDK talks to several backend services. You can route any combination of them through reverse proxies on your own domain for egress control, compliance, custom domains, or geo-routing. Each proxy is a transparent pass-through to a fixed upstream.

**Incorrect (guessing the upstream):**

```nginx
# v2DbHost proxied to a made-up "project persistence endpoint"
location / {
    proxy_pass https://my-velt-project.example-persistence.com;
}
```

**Correct (forward each service to its documented upstream):**

| ProxyConfig Field | What It Proxies | Upstream Target |
|-------------------|-----------------|-----------------|
| `cdnHost` | SDK bundle (velt.js) | `cdn.velt.dev` |
| `apiHost` | Velt API calls | `api.velt.dev` |
| `v2DbHost` | Persistence database (Velt v2) | `firestore.googleapis.com` |
| `v1DbHost` | Ephemeral realtime database (Velt v1) | `*.firebaseio.com`, picked per request from `?ns=` |
| `storageHost` | File/attachment storage, recordings | `firebasestorage.googleapis.com` |
| `authHost` | Authentication token endpoints | `identitytoolkit.googleapis.com` + `securetoken.googleapis.com`, routed by path |

All fields are optional. Configure only the hosts you proxy; omitted fields talk to the default upstream directly.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `forceLongPolling` | `boolean` | `false` | Use long-polling instead of WebSockets for the persistence and ephemeral database connections. Set `true` only when your proxy can't pass WebSocket upgrades. |

### How It Works

1. Deploy proxy endpoints under subdomains you control (for example `auth-proxy.`, `v2db-proxy.`, `v1db-proxy.`, `storage-proxy.`)
2. Set `proxyConfig` on `VeltProvider` (React) or `initVelt()` (other frameworks)
3. The SDK sends traffic for those services to your proxies, which forward it upstream without rewriting headers, body, or path

### Deployment Recipes

The open-source `velt-js/velt-proxy-server` repository ships ready-to-deploy configs for Cloudflare Workers and nginx covering the four services most teams proxy: Auth, v2Db, v1Db, and Storage. `cdnHost` and `apiHost` are not covered by these recipes; contact Velt support if you need to proxy the SDK CDN or the Velt API. The repo also includes agent instructions, so an AI coding agent opened in the cloned repo can generate the deployment config for your subdomains.

**Verification:**
- [ ] Each proxied field forwards to the upstream in the table above
- [ ] Proxies do not rewrite headers, body, or path
- [ ] Only proxied hosts are listed in `proxyConfig`

**Source Pointers:**
- https://docs.velt.dev/security/proxy-server#how-it-works — "How it works"
- https://docs.velt.dev/security/proxy-server#deploy-the-proxy-server — "Deploy the proxy server"
- https://docs.velt.dev/api-reference/sdk/models/data-models#proxyconfig — ProxyConfig
