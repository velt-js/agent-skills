---
name: velt-proxy-server-best-practices
description: Velt proxy server setup and configuration best practices for routing Velt SDK traffic through your own reverse proxy (e.g., nginx). Use when configuring proxyConfig on VeltProvider or initVelt, setting up nginx reverse proxy for Velt CDN/API/database/storage/auth endpoints, whitelisting Content Security Policy (CSP) domains for Velt, enabling Subresource Integrity (SRI), or debugging proxy-related connectivity issues. Triggers on any task involving Velt proxy, reverse proxy, proxyConfig, cdnHost, apiHost, v1DbHost, v2DbHost, storageHost, authHost, forceLongPolling, CSP whitelisting for Velt, nginx configuration for Velt, or network policy compliance with Velt — even if the user doesn't explicitly say 'proxy'.
license: MIT
metadata:
  author: velt
  version: "1.0.0"
---

# Velt Proxy Server Best Practices

Comprehensive guide for routing all Velt SDK traffic through your own reverse proxy infrastructure. Contains 13 rules across 5 categories covering SDK configuration, nginx server setup, CSP security, and debugging.

## When to Apply

Reference these guidelines when:
- Routing Velt SDK traffic through your own domain (enterprise network policies, branding)
- Configuring `proxyConfig` on `VeltProvider` (React) or `initVelt()` (other frameworks)
- Setting up nginx (or another reverse proxy) to forward to Velt's backend services
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

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/core/core-proxy-overview.md
rules/shared/sdk-config/sdk-proxy-config-react.md
rules/shared/server-setup/server-nginx-cdn.md
```

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
