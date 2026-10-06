---
name: velt-proxy-server-best-practices
description: Velt proxy server setup for routing Velt SDK traffic through your own reverse proxies on Cloudflare Workers or nginx. Use when configuring proxyConfig (cdnHost, apiHost, v2DbHost, v1DbHost, storageHost, authHost, forceLongPolling) on VeltProvider or initVelt, deploying velt-proxy-server recipes, whitelisting Velt in a Content Security Policy, enabling SRI, or debugging proxy issues. Triggers on Velt proxy, reverse proxy, CSP, or network-policy tasks, even if the user doesn't say 'proxy'.
license: MIT
metadata:
  author: velt
  version: "1.0.4"
---

# Velt Proxy Server Best Practices

Comprehensive guide for routing Velt SDK traffic through your own reverse proxy infrastructure. Contains 15 rules across 5 categories covering SDK configuration, Cloudflare Workers and nginx server setup, CSP security, and debugging.

## When to Apply

Reference these guidelines when:
- Routing Velt SDK traffic through your own domain (egress control, compliance, custom domains, geo-routing)
- Configuring `proxyConfig` on `VeltProvider` (React) or `initVelt()` (other frameworks)
- Deploying the `velt-js/velt-proxy-server` recipes on Cloudflare Workers or nginx
- Whitelisting Velt domains in Content Security Policy headers
- Enabling Subresource Integrity (SRI) for the proxied SDK bundle
- Debugging proxy connectivity issues (WebSocket upgrades, auth token refresh, CORS)

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Core | CRITICAL | `core-` |
| 2 | SDK Config | CRITICAL | `sdk-` |
| 3 | Server Setup | HIGH | `server-` |
| 4 | Security | HIGH | `security-` |
| 5 | Debugging | MEDIUM | `debug-` |

## Quick Reference

### 1. Core (CRITICAL)

- `core-proxy-overview` - The six proxyConfig hosts and their upstreams (v2DbHost forwards to firestore.googleapis.com)
- `core-auth-provider` - Authenticate with the authProvider object (user + generateToken) next to proxyConfig

### 2. SDK Config (CRITICAL)

- `sdk-proxy-config-react` - Put proxyConfig inside VeltProvider's config prop
- `sdk-proxy-config-non-react` - Pass proxyConfig in the initVelt() options object
- `sdk-integrity-check` - Enable SRI with integrity: true as a sibling of proxyConfig

### 3. Server Setup (HIGH)

- `server-cloudflare-workers` - Deploy one Worker per service (Auth, v2Db, v1Db, Storage) and bind custom domains
- `server-nginx-auth` - Route /v1/token and /v2/token to securetoken, everything else to identitytoolkit
- `server-nginx-persistence-db` - Pass v2Db traffic through to firestore.googleapis.com
- `server-nginx-ephemeral-db` - v1Db with WebSocket headers and a ?ns= dynamic upstream
- `server-nginx-storage` - Pass storage traffic to firebasestorage.googleapis.com with a large body size
- `server-nginx-cdn` - Generic CDN passthrough (not covered by official recipes)
- `server-nginx-api` - Generic API passthrough (not covered by official recipes)

### 4. Security (HIGH)

- `security-csp-whitelist` - CSP script-src, connect-src, img-src, media-src entries for Velt and your proxies
- `security-force-long-polling` - Use proxyConfig.forceLongPolling when proxies block WebSocket upgrades

### 5. Debugging (MEDIUM)

- `debug-proxy-verification` - Verify each proxy with curl and the Network tab; fix CORS, WebSocket, auth cache, and upload issues

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/core/core-proxy-overview.md
rules/shared/sdk-config/sdk-proxy-config-react.md
rules/shared/server-setup/server-cloudflare-workers.md
```

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
