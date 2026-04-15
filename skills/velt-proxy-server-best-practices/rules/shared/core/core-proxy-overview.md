---
title: Velt Proxy Server Overview
impact: CRITICAL
tags: proxyConfig, proxy, reverse-proxy, network, enterprise, branding
---

## Velt Proxy Server Overview

The Velt SDK communicates with several backend services. You can route any combination of them through your own reverse proxy to keep all Velt network calls on your domain. This satisfies enterprise network policies that prohibit direct connections to third-party services and keeps traffic branded to your infrastructure.

### The Six Proxy Hosts

| ProxyConfig Field | What It Proxies | Upstream Target |
|-------------------|----------------|-----------------|
| `cdnHost` | SDK bundle (velt.js) | `https://cdn.velt.dev` |
| `apiHost` | Velt REST API calls | `https://api.velt.dev` |
| `v2DbHost` | Persistence database (Firestore) | Your Velt project's persistence endpoint |
| `v1DbHost` | Ephemeral database (Firebase RTDB) | `*.firebaseio.com` |
| `storageHost` | File/attachment storage | `firebasestorage.googleapis.com` |
| `authHost` | Authentication tokens | `identitytoolkit.googleapis.com` and `securetoken.googleapis.com` |

All six fields are optional — configure only the hosts you need to proxy. Omitted fields use Velt's default endpoints.

### Additional Option

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `forceLongPolling` | `boolean` | `false` | Force long-polling instead of WebSocket for database connections. Set to `true` when your proxy doesn't support WebSocket upgrades. |

### How It Works

1. You configure `proxyConfig` on `VeltProvider` (React) or `initVelt()` (other frameworks) with your proxy domain(s)
2. The SDK sends all traffic to your proxy instead of directly to Velt/Firebase services
3. Your proxy (e.g., nginx) forwards requests to the upstream targets without modifying headers or content

The proxy must be transparent — no header rewriting, no body modification, no path rewriting. It's a simple pass-through.
