# Velt Proxy Server Best Practices

**Version 1.0.3**  
Velt  
April 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Velt Proxy Server implementation guide covering reverse-proxy (nginx) setup for all six Velt service hosts (CDN, API, persistence DB, ephemeral DB, storage, auth), the `proxyConfig` SDK configuration object, Content Security Policy (CSP) whitelisting, Subresource Integrity (SRI) hashes, and the `forceLongPolling` fallback for restricted network environments. Provides patterns for routing all Velt SDK traffic through customer-controlled infrastructure for enterprise network policies.

---

## Table of Contents

1. [Core](#1-core) — **CRITICAL**
   - 1.1 [Use authProvider for Authentication — Never useIdentify](#11-use-authprovider-for-authentication-never-useidentify)
   - 1.2 [Velt Proxy Server Overview](#12-velt-proxy-server-overview)

2. [SDK Config](#2-sdk-config) — **CRITICAL**
   - 2.1 [Configure proxyConfig for Angular, Vue, and HTML](#21-configure-proxyconfig-for-angular-vue-and-html)
   - 2.2 [Configure proxyConfig in React / Next.js](#22-configure-proxyconfig-in-react-nextjs)
   - 2.3 [Enable Subresource Integrity (SRI) for Proxied SDK](#23-enable-subresource-integrity-sri-for-proxied-sdk)

3. [Server Setup](#3-server-setup) — **HIGH**
   - 3.1 [Cloudflare Workers Configuration for Velt Proxy](#31-cloudflare-workers-configuration-for-velt-proxy)
   - 3.2 [nginx Configuration for API Proxy](#32-nginx-configuration-for-api-proxy)
   - 3.3 [nginx Configuration for Auth Proxy](#33-nginx-configuration-for-auth-proxy)
   - 3.4 [nginx Configuration for CDN Proxy](#34-nginx-configuration-for-cdn-proxy)
   - 3.5 [nginx Configuration for Ephemeral Database Proxy](#35-nginx-configuration-for-ephemeral-database-proxy)
   - 3.6 [nginx Configuration for Persistence Database Proxy](#36-nginx-configuration-for-persistence-database-proxy)
   - 3.7 [nginx Configuration for Storage Proxy](#37-nginx-configuration-for-storage-proxy)

4. [Security](#4-security) — **HIGH**
   - 4.1 [Content Security Policy (CSP) Whitelisting for Velt](#41-content-security-policy-csp-whitelisting-for-velt)
   - 4.2 [forceLongPolling for WebSocket-Incompatible Proxies](#42-forcelongpolling-for-websocket-incompatible-proxies)

5. [Debugging](#5-debugging) — **MEDIUM**
   - 5.1 [Proxy Setup Verification and Debugging](#51-proxy-setup-verification-and-debugging)

---

## 1. Core

**Impact: CRITICAL**

Foundational concepts for the Velt proxy-server setup. Covers when and why to put a reverse proxy in front of Velt, the six service hosts the SDK talks to (`cdnHost`, `apiHost`, `v1DbHost`, `v2DbHost`, `storageHost`, `authHost`), and the authentication requirement that VeltProvider's `authProvider` prop is used for identity (not the deprecated `useIdentify` hook).

### 1.1 Use authProvider for Authentication — Never useIdentify

**Impact: CRITICAL**

When setting up Velt alongside proxy configuration, authentication must use the `authProvider` callback on `VeltProvider`. The deprecated `useIdentify` hook and `client.identify()` method must never be used.

The `authProvider` callback receives a `veltUser` setter function. Call it with your user object whenever your auth state changes:

---

### 1.2 Velt Proxy Server Overview

**Impact: CRITICAL**

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

---

## 2. SDK Config

**Impact: CRITICAL**

The `proxyConfig` SDK-side configuration object that points Velt at your proxy hosts. Includes the React / Next.js form (`proxyConfig` prop on `VeltProvider`), the non-React form (`proxyConfig` field on `initVelt()`), and the Subresource Integrity (SRI) hash check for verifying the proxied SDK bundle.

### 2.1 Configure proxyConfig for Angular, Vue, and HTML

**Impact: CRITICAL**

For non-React frameworks, pass `proxyConfig` as part of the options object (second argument) to `initVelt()`.

### Single Host

---

### 2.2 Configure proxyConfig in React / Next.js

**Impact: CRITICAL**

Pass `proxyConfig` inside the `config` prop on `VeltProvider`. Each field is a base URL pointing to your reverse proxy.

### Single Host (e.g., proxy only the CDN)

---

### 2.3 Enable Subresource Integrity (SRI) for Proxied SDK

**Impact: HIGH**

When serving the Velt SDK through a proxy, enable Subresource Integrity (SRI) to verify the SDK bundle hasn't been tampered with in transit. The browser checks the fetched resource against a known hash before executing it.

This is especially important when proxying the CDN because you're adding an intermediary between Velt's CDN and the browser — SRI ensures nothing was modified along the way.

### React / Next.js

---

## 3. Server Setup

**Impact: HIGH**

Per-host nginx reverse-proxy configurations. Covers the CDN host (static SDK delivery), the API host (REST traffic), the persistence DB host (Firestore proxy), the ephemeral DB host (WebSocket + host-lock for realtime), the storage host (Firebase Storage / S3-compat), and the auth host (`identitytoolkit` + `securetoken`).

### 3.1 Cloudflare Workers Configuration for Velt Proxy

**Impact: HIGH**

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

v1Db requests carry the Firebase namespace in the `?ns=` query param. The Worker rewrites the upstream Host to the shard that owns that namespace per request. Pair with the SDK's `v1DbHost` host-lock, which prevents Firebase from redirecting subsequent traffic to a shard server (`s-gke-*.firebaseio.com`) that would bypass your proxy.

**Incorrect:**

```js
// Hard-coded upstream — works for one project, breaks once the SDK switches namespaces
const upstream = 'https://my-project.firebaseio.com' + url.pathname + url.search;
```

**Correct:**

```bash
// v1db-proxy.* handler (abbreviated)
const ns = url.searchParams.get('ns');
if (!ns) return new Response('Missing ns parameter', { status: 400 });

url.hostname = `${ns}.firebaseio.com`;

// Forward the raw Request on WebSocket upgrades so the stream survives
if (request.headers.get('Upgrade') === 'websocket') {
  return fetch(new Request(url, request));
}
curl -I https://auth-proxy.yourdomain.com/
curl -I https://v2db-proxy.yourdomain.com/
curl -I https://v1db-proxy.yourdomain.com/?ns=YOUR_PROJECT
curl -I https://storage-proxy.yourdomain.com/
```

Validate that `?ns=` is present before interpolating it into the upstream hostname — a missing or malformed value would otherwise produce a request to `https://null.firebaseio.com`. On WebSocket upgrades, forward the original `Request` object (with the rewritten URL) so the upgrade headers and stream survive end-to-end; bypassing this re-wrap can break RTDB real-time listeners.
v2Db and Storage are straight passthroughs. Forward the request to the upstream and set the upstream hostname as the `Host` header. Do not rewrite path or body.
From any machine, confirm each proxy responds:
Upstream response headers (2xx or 4xx) confirm the proxy is live and reaching the upstream.
- A single Worker handles all four services; route binding picks the handler branch by subdomain
- Auth routing is path-based (`/v1/token` vs everything else) — don't collapse it to a single upstream
- v1Db upstream must be derived from the `?ns=` query param on every request, not hard-coded
- For v1Db, detect the `Upgrade: websocket` header and forward the raw `Request` so the upgrade stream survives — Workers does not transparently preserve WebSocket framing across a `fetch(upstreamUrl)` call without it
- Pair with full `proxyConfig` ({ v2DbHost, v1DbHost, storageHost, authHost }) in your SDK config
- `cdnHost` and `apiHost` are not covered — contact Velt support if you need them

---

### 3.2 nginx Configuration for API Proxy

**Impact: HIGH**

Proxy Velt REST API calls through your domain.

---

### 3.3 nginx Configuration for Auth Proxy

**Impact: HIGH**

Proxy Velt's authentication traffic. This proxy must handle requests to two Google services based on the request path: `identitytoolkit.googleapis.com` and `securetoken.googleapis.com`.

---

### 3.4 nginx Configuration for CDN Proxy

**Impact: HIGH**

Proxy the Velt SDK bundle through your domain. The SDK appends `/lib/sdk@[VERSION]/velt.js` to `cdnHost`, so your proxy must forward the full path to `cdn.velt.dev`.

---

### 3.5 nginx Configuration for Ephemeral Database Proxy

**Impact: HIGH**

Proxy Velt's ephemeral database (v1/Firebase RTDB) traffic. This is the most complex proxy because Firebase RTDB uses WebSocket connections and has a shard redirect mechanism that must be defeated.

---

### 3.6 nginx Configuration for Persistence Database Proxy

**Impact: HIGH**

Proxy Velt's persistence database (v2/Firestore) traffic through your domain.

---

### 3.7 nginx Configuration for Storage Proxy

**Impact: HIGH**

Proxy file attachment and recording storage traffic (Firebase Storage) through your domain.

---

## 4. Security

**Impact: HIGH**

Content Security Policy (CSP) whitelist directives required for Velt traffic, and the `forceLongPolling` fallback for environments where the ephemeral-DB proxy can't pass WebSocket upgrade requests.

### 4.1 Content Security Policy (CSP) Whitelisting for Velt

**Impact: HIGH**

If your app has a Content Security Policy, whitelist these domains for Velt to function. When using a proxy, you'll also need to whitelist your proxy domains in addition to (or instead of) these defaults.

### Required CSP Directives

**script-src** (SDK scripts and API calls):

---

### 4.2 forceLongPolling for WebSocket-Incompatible Proxies

**Impact: HIGH**

If your reverse proxy doesn't support WebSocket upgrades (common with some load balancers, CDN edge proxies, or corporate proxies), set `forceLongPolling: true` to force database connections to use HTTP long-polling instead.

### React / Next.js

---

## 5. Debugging

**Impact: MEDIUM**

Verification checklist for confirming a proxy setup is routing all six hosts correctly, plus common-issue diagnostics for proxy failures.

### 5.1 Proxy Setup Verification and Debugging

**Impact: MEDIUM**

### Verification Checklist

After configuring your proxy, verify each proxied service:

- [ ] **CDN**: Open `https://your-cdn-proxy/lib/sdk@latest/velt.js` in a browser — you should see JavaScript code
- [ ] **API**: Check browser Network tab for requests to your API proxy domain with 200 responses
- [ ] **Persistence DB**: Look for Firestore requests going to your v2DbHost domain
- [ ] **Ephemeral DB**: Look for WebSocket connections (or long-poll requests if `forceLongPolling: true`) to your v1DbHost domain
- [ ] **Storage**: Upload a file attachment and verify the upload request goes to your storageHost domain
- [ ] **Auth**: Check that authentication token requests go to your authHost domain (look for `/identitytoolkit/` and `/securetoken/` paths)

### Common Issues

**CORS errors in browser console**
Your proxy must forward CORS headers from the upstream servers without modification. Do not add your own `Access-Control-Allow-Origin` headers — let the upstream response headers pass through. If you strip or override CORS headers, the browser will block requests.

**WebSocket connection drops**
- Ensure nginx has `proxy_http_version 1.1`, `proxy_set_header Upgrade $http_upgrade`, and `proxy_set_header Connection "upgrade"`
- Set long timeouts: `proxy_read_timeout 86400s` for persistent connections
- If WebSocket doesn't work, fall back to `forceLongPolling: true`

**Auth token refresh hitting Google directly**
The SDK caches the auth proxy in localStorage. If you added `authHost` after initial setup, users may have a cached config without the auth proxy. They'll need to clear localStorage or you can instruct them to open DevTools → Application → Local Storage and remove the relevant Velt keys.

**SDK not loading from CDN proxy**
- Verify the proxy forwards the full path (including `/lib/sdk@[VERSION]/velt.js`)
- Check that `proxy_set_header Host cdn.velt.dev` is set so Velt's CDN serves the correct content
- If using SRI (`integrity: true`), ensure your proxy doesn't modify the response body in any way (compression re-encoding, minification, etc.)

**413 Request Entity Too Large on file uploads**
Increase `client_max_body_size` in your storage proxy's nginx config (default is usually 1MB, Velt recordings can be much larger).

**proxyConfig not taking effect**
- Ensure `proxyConfig` is nested under `config`, not at the VeltProvider top level
- Check for typos in field names (`v1DbHost` not `v1DBHost`, `cdnHost` not `CDNHost`)
- If migrating from `apiProxyDomain`, make sure you moved it to `proxyConfig.apiHost`

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/security/proxy-server
- https://docs.velt.dev/security/content-security-policy
- https://console.velt.dev
