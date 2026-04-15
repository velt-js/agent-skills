# Sections Index

## 1. Core (2 rules)
- `core/core-auth-provider.md` — Use authProvider, never useIdentify
- `core/core-proxy-overview.md` — The 6 proxy hosts, when/why to use proxy

## 2. SDK Config (3 rules)
- `sdk-config/sdk-proxy-config-react.md` — proxyConfig on VeltProvider for React/Next.js
- `sdk-config/sdk-proxy-config-non-react.md` — proxyConfig on initVelt() for Angular/Vue/HTML
- `sdk-config/sdk-integrity-check.md` — Subresource Integrity (SRI) for proxied SDK

## 3. Server Setup (6 rules)
- `server-setup/server-nginx-cdn.md` — nginx for CDN proxy (cdn.velt.dev)
- `server-setup/server-nginx-api.md` — nginx for API proxy (api.velt.dev)
- `server-setup/server-nginx-persistence-db.md` — nginx for persistence DB proxy
- `server-setup/server-nginx-ephemeral-db.md` — nginx for ephemeral DB proxy (WebSocket + host-lock)
- `server-setup/server-nginx-storage.md` — nginx for storage proxy (firebasestorage.googleapis.com)
- `server-setup/server-nginx-auth.md` — nginx for auth proxy (identitytoolkit + securetoken)

## 4. Security (2 rules)
- `security/security-csp-whitelist.md` — CSP whitelist directives for Velt
- `security/security-force-long-polling.md` — forceLongPolling for WebSocket-less proxies

## 5. Debugging (1 rule)
- `debugging/debug-proxy-verification.md` — Verification checklist and common issues
