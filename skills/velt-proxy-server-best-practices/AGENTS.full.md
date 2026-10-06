# Velt Proxy Server Best Practices

**Version 1.0.4**  
Velt  
October 2026

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
   - 1.1 [Use the authProvider Object Alongside proxyConfig](#11-use-the-authprovider-object-alongside-proxyconfig)
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

Foundational concepts for the Velt proxy-server setup. Covers when and why to put a reverse proxy in front of Velt, the six service hosts the SDK talks to (`cdnHost`, `apiHost`, `v1DbHost`, `v2DbHost`, `storageHost`, `authHost`) and their upstreams, and authenticating with the `authProvider` object (`user` + `generateToken`) alongside `proxyConfig`.

### 1.1 Use the authProvider Object Alongside proxyConfig

**Impact: CRITICAL (authProvider is an object of user plus generateToken, not a callback; the wrong shape leaves users unauthenticated behind the proxy)**

When you set up Velt behind a proxy, authenticate with the `authProvider` prop on `VeltProvider` (React) or `setVeltAuthProvider()` (other frameworks). `authProvider` is an object with `user` and an async `generateToken` that returns a Velt JWT from your backend. Velt calls `generateToken` on sign-in and whenever the token expires. `identify()` / `useIdentify()` still work, but you must then refresh expired tokens yourself, so prefer `authProvider`.

**Incorrect (authProvider as a callback that receives a setter):**

```jsx
// Not the VeltAuthProvider shape: Velt never calls this function
const authProvider = async ({ veltUser }) => {
  const user = await getAuthenticatedUser();
  veltUser({ userId: user.uid, organizationId: 'org-1' });
};

<VeltProvider apiKey="YOUR_API_KEY" authProvider={authProvider} config={{ proxyConfig: { /* ... */ } }} />
```

**Correct (React / Next.js):**

```jsx
import { VeltProvider } from '@veltdev/react';

function App({ user }) {
  const authProvider = {
    user: {
      userId: user.uid,
      organizationId: user.orgId,
      name: user.displayName,
      email: user.email,
      photoUrl: user.photoURL,
    },
    retryConfig: { retryCount: 3, retryDelay: 1000 },
    generateToken: async () => {
      const resp = await fetch('/api/velt/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, organizationId: user.orgId }),
      });
      const { token } = await resp.json();
      return token;
    },
  };

  return (
    <VeltProvider
      apiKey="YOUR_API_KEY"
      authProvider={authProvider}
      config={{
        proxyConfig: {
          authHost: 'https://auth-proxy.yourdomain.com',
          v2DbHost: 'https://v2db-proxy.yourdomain.com',
        },
      }}
    >
      <YourApp />
    </VeltProvider>
  );
}
```

**Correct (Other Frameworks):**

```js
const client = await initVelt('YOUR_API_KEY', {
  proxyConfig: {
    authHost: 'https://auth-proxy.yourdomain.com',
    v2DbHost: 'https://v2db-proxy.yourdomain.com',
  },
});

await client.setVeltAuthProvider({
  user,
  generateToken: async () => {
    const resp = await fetch('/api/velt/token', { method: 'POST' });
    const { token } = await resp.json();
    return token;
  },
});
```

`authProvider` and `config` are sibling props on `VeltProvider`; neither goes inside the other. If your app also calls Velt's REST APIs (for example to generate tokens) through `apiHost`, those calls still need the `x-velt-api-key` and `x-velt-auth-token` headers passed through unchanged.

---

### 1.2 Velt Proxy Server Overview

**Impact: CRITICAL (Maps each proxyConfig field to the upstream host it replaces; a wrong upstream (for example on v2DbHost) breaks that service behind the proxy)**

The Velt SDK talks to several backend services. You can route any combination of them through reverse proxies on your own domain for egress control, compliance, custom domains, or geo-routing. Each proxy is a transparent pass-through to a fixed upstream.

**Incorrect (guessing the upstream):**

```nginx
# v2DbHost proxied to a made-up "project persistence endpoint"
location / {
    proxy_pass https://my-velt-project.example-persistence.com;
}
```

---

## 2. SDK Config

**Impact: CRITICAL**

The `proxyConfig` SDK-side configuration object that points Velt at your proxy hosts. Includes the React / Next.js form (`proxyConfig` inside the `config` prop on `VeltProvider`), the non-React form (`proxyConfig` field on `initVelt()`), and the Subresource Integrity (SRI) hash check for verifying the proxied SDK bundle.

### 2.1 Configure proxyConfig for Angular, Vue, and HTML

**Impact: CRITICAL (proxyConfig must be passed in the initVelt() options object at init time)**

For non-React frameworks, pass `proxyConfig` as part of the options object (second argument) to `initVelt()`.

**Incorrect (proxyConfig as a separate value or deprecated field):**

```js
const client = await initVelt('YOUR_API_KEY', {
  apiProxyDomain: 'https://api-proxy.yourdomain.com', // deprecated
});
```

**Correct:**

```js
const client = await initVelt('YOUR_API_KEY', {
  proxyConfig: {
    cdnHost: 'https://cdn.yourdomain.com',
  },
});
const client = await initVelt('YOUR_API_KEY', {
  proxyConfig: {
    cdnHost: 'https://cdn-proxy.yourdomain.com',
    apiHost: 'https://api-proxy.yourdomain.com',
    v2DbHost: 'https://v2db-proxy.yourdomain.com',
    v1DbHost: 'https://v1db-proxy.yourdomain.com',
    storageHost: 'https://storage-proxy.yourdomain.com',
    authHost: 'https://auth-proxy.yourdomain.com',
    forceLongPolling: false,
  },
});
```

- `proxyConfig` goes inside the second argument to `initVelt()`, not as a separate call
- Only specify the hosts you're actually proxying
- The deprecated `apiProxyDomain` should be replaced with `proxyConfig.apiHost`
- Authenticate with `client.setVeltAuthProvider({ user, generateToken })` after `initVelt()`

---

### 2.2 Configure proxyConfig in React / Next.js

**Impact: CRITICAL (proxyConfig must sit inside VeltProvider's config prop; a top-level prop is ignored)**

Pass `proxyConfig` inside the `config` prop on `VeltProvider`. Each field is a base URL pointing to your reverse proxy.

**Incorrect (top-level prop):**

```jsx
<VeltProvider apiKey="YOUR_API_KEY" proxyConfig={{ cdnHost: 'https://cdn.yourdomain.com' }}>
  <App />
</VeltProvider>
```

**Correct:**

```jsx
<VeltProvider
  apiKey="YOUR_API_KEY"
  authProvider={authProvider}
  config={{
    proxyConfig: {
      cdnHost: 'https://cdn.yourdomain.com',
    },
  }}
>
  <App />
</VeltProvider>
<VeltProvider
  apiKey="YOUR_API_KEY"
  authProvider={authProvider}
  config={{
    proxyConfig: {
      cdnHost: 'https://cdn-proxy.yourdomain.com',
      apiHost: 'https://api-proxy.yourdomain.com',
      v2DbHost: 'https://v2db-proxy.yourdomain.com',
      v1DbHost: 'https://v1db-proxy.yourdomain.com',
      storageHost: 'https://storage-proxy.yourdomain.com',
      authHost: 'https://auth-proxy.yourdomain.com',
      forceLongPolling: false,
    },
  }}
>
  <App />
</VeltProvider>
// Before (deprecated)
<VeltProvider config={{ apiProxyDomain: 'https://proxy.example.com/api' }} />

// After
<VeltProvider config={{ proxyConfig: { apiHost: 'https://proxy.example.com/api' } }} />
```

The SDK automatically appends `/lib/sdk@[VERSION]/velt.js` to `cdnHost` to fetch the bundle. Your proxy must forward that path to `https://cdn.velt.dev`.
- `proxyConfig` is nested under `config`, not at the top level of `VeltProvider`
- The deprecated `apiProxyDomain` top-level field still works but should be replaced with `proxyConfig.apiHost`
- Only specify the hosts you're actually proxying; omit the rest
- `authProvider` and `config` are sibling props on `VeltProvider`
If you have the deprecated `apiProxyDomain`, replace it:

---

### 2.3 Enable Subresource Integrity (SRI) for Proxied SDK

**Impact: HIGH (Lets the browser verify the SDK bundle served through your CDN proxy; off by default)**

When serving the Velt SDK through a proxy, enable Subresource Integrity (SRI) to verify the SDK bundle hasn't been tampered with in transit. The browser checks the fetched resource against a known hash before executing it.

This matters most when proxying the CDN, because you add an intermediary between Velt's CDN and the browser. SRI ensures nothing was modified along the way.

**Incorrect (integrity nested inside proxyConfig):**

```jsx
<VeltProvider apiKey="YOUR_API_KEY" config={{ proxyConfig: { cdnHost: 'https://cdn-proxy.yourdomain.com', integrity: true } }}>
  <App />
</VeltProvider>
```

**React / Next.js:**

```jsx
<VeltProvider
  apiKey="YOUR_API_KEY"
  authProvider={authProvider}
  config={{
    integrity: true,
    proxyConfig: {
      cdnHost: 'https://cdn-proxy.yourdomain.com',
    },
  }}
>
  <App />
</VeltProvider>
```

**Other Frameworks:**

```js
const client = await initVelt('YOUR_API_KEY', {
  integrity: true,
  proxyConfig: {
    cdnHost: 'https://cdn-proxy.yourdomain.com',
  },
});
```

- `integrity` is a sibling of `proxyConfig` inside the `config` object, not nested inside `proxyConfig`
- Default is `false`; you must explicitly enable it
- Most valuable when proxying the CDN (`cdnHost`), but applies to the SDK bundle regardless of proxy setup
- Your CDN proxy must not alter the bundle (no re-compression or minification), or the integrity check fails

---

## 3. Server Setup

**Impact: HIGH**

Reverse-proxy deployment on Cloudflare Workers (one Worker per service) and nginx, based on the `velt-js/velt-proxy-server` recipes. Covers the auth host (path-based `securetoken` / `identitytoolkit` routing), the persistence DB host (`firestore.googleapis.com`), the ephemeral DB host (WebSocket, `?ns=` dynamic upstream, host-lock), the storage host (`firebasestorage.googleapis.com`), and generic passthroughs for the CDN and API hosts.

### 3.1 Cloudflare Workers Configuration for Velt Proxy

**Impact: HIGH (Edge-deployed proxies for Auth, v2Db, v1Db, and Storage; wrong auth path routing or a hard-coded v1Db upstream breaks token refresh or realtime)**

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

v1Db requests carry the Firebase namespace in the `?ns=` query param. The Worker rewrites the upstream Host to the shard that owns that namespace per request. Pair with the SDK's `v1DbHost` host-lock, which prevents Firebase from redirecting subsequent traffic to a shard server (`s-gke-*.firebaseio.com`) that would bypass your proxy.

**Incorrect:**

```js
// Hard-coded upstream: works for one project, breaks once the SDK switches namespaces
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

Validate that `?ns=` is present before interpolating it into the upstream hostname: a missing or malformed value would otherwise produce a request to `https://null.firebaseio.com`. On WebSocket upgrades, forward the original `Request` object (with the rewritten URL) so the upgrade headers and stream survive end-to-end; bypassing this re-wrap can break RTDB real-time listeners.
v2Db and Storage are straight passthroughs. Forward the request to the upstream and set the upstream hostname as the `Host` header. Do not rewrite path or body.
From any machine, confirm each proxy responds:
Upstream response headers (2xx or 4xx) confirm the proxy is live and reaching the upstream. Then point the SDK at the four subdomains with `proxyConfig`; WebSockets are on by default, so no extra SDK configuration is required.
- One Worker per service, each bound to its own subdomain as a Custom Domain
- Auth routing is path-based (`/v1/token` and `/v2/token` vs everything else); don't collapse it to a single upstream
- v1Db upstream must be derived from the `?ns=` query param on every request, not hard-coded
- For v1Db, detect the `Upgrade: websocket` header and forward the raw `Request` so the upgrade stream survives
- Pair with `proxyConfig` `{ authHost, v2DbHost, v1DbHost, storageHost }` in your SDK config
- `cdnHost` and `apiHost` are not covered; contact Velt support if you need them

---

### 3.2 nginx Configuration for API Proxy

**Impact: HIGH (apiHost proxies must forward to api.velt.dev with all Velt headers intact)**

Proxy Velt API calls through your domain. `proxyConfig.apiHost` replaces the deprecated `apiProxyDomain`. The official `velt-proxy-server` recipes do not cover `apiHost`; contact Velt support before proxying the Velt API in production. The config below is a generic passthrough.

**Incorrect (headers dropped):**

```nginx
location / {
    proxy_pass https://api.velt.dev;
    # Clearing Velt headers breaks every API call
    proxy_set_header x-velt-api-key "";
}
```

**Correct:**

```nginx
server {
    listen 443 ssl;
    server_name api-proxy.yourdomain.com;

    ssl_certificate     /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    location / {
        proxy_pass https://api.velt.dev;
        proxy_ssl_server_name on;
        proxy_set_header Host api.velt.dev;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- Forward all requests to `https://api.velt.dev` without modifying headers or content
- The SDK sends `x-velt-api-key` and other headers; your proxy must pass them through unmodified
- Pair with `proxyConfig.apiHost: 'https://api-proxy.yourdomain.com'` in your SDK config

---

### 3.3 nginx Configuration for Auth Proxy

**Impact: HIGH (Auth must split by path between securetoken and identitytoolkit; a single upstream breaks token refresh)**

Proxy Velt's authentication traffic. Auth is path-based: token-refresh requests (`/v1/token`, `/v2/token`) go to `securetoken.googleapis.com`, and everything else goes to `identitytoolkit.googleapis.com`. Follow the documented path split; prefix-based locations such as `/securetoken/` do not match the documented token paths.

**Incorrect (prefix-based locations the SDK never requests, or one upstream for everything):**

```nginx
# Token refreshes arrive on /v1/token, not /securetoken/, so they fall through to identitytoolkit
location /securetoken/ {
    proxy_pass https://securetoken.googleapis.com/securetoken/;
}
location / {
    proxy_pass https://identitytoolkit.googleapis.com;
}
```

**Correct (route token paths to securetoken, everything else to identitytoolkit):**

```nginx
server {
    listen 443 ssl;
    server_name auth-proxy.yourdomain.com;

    ssl_certificate     /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    # Token refresh
    location /v1/token {
        proxy_pass https://securetoken.googleapis.com;
        proxy_set_header Host securetoken.googleapis.com;
        proxy_ssl_server_name on;
        proxy_ssl_name securetoken.googleapis.com;
    }

    location /v2/token {
        proxy_pass https://securetoken.googleapis.com;
        proxy_set_header Host securetoken.googleapis.com;
        proxy_ssl_server_name on;
        proxy_ssl_name securetoken.googleapis.com;
    }

    # Everything else: identity
    location / {
        proxy_pass https://identitytoolkit.googleapis.com;
        proxy_set_header Host identitytoolkit.googleapis.com;
        proxy_ssl_server_name on;
        proxy_ssl_name identitytoolkit.googleapis.com;
    }
}
```

The `proxy_ssl_*` directives are required so the upstream TLS handshake uses the correct SNI. The `velt-js/velt-proxy-server` repo ships the full config as `nginx/conf.d/*.conf` with a Docker Compose setup.
The SDK caches the auth proxy host in `localStorage` during `initConfig()`. On later page loads the cached value is applied synchronously, before Auth can fire an internal token refresh, so the refresh goes through your proxy instead of directly to Google. Since v6.0.0-beta.7 the boot-time auth request on page reload also routes through `authHost`; no configuration change is required.
This means:
- Once set, the auth proxy applies across page loads automatically
- If you change the auth proxy URL, users may need to clear the cached value for it to take effect immediately
- Route `/v1/token` and `/v2/token` to `securetoken.googleapis.com`; everything else to `identitytoolkit.googleapis.com`
- Pair `proxy_ssl_server_name on` with `proxy_ssl_name <upstream>` for correct SNI
- Don't modify headers or content
- Pair with `proxyConfig.authHost: 'https://auth-proxy.yourdomain.com'` in your SDK config

---

### 3.4 nginx Configuration for CDN Proxy

**Impact: HIGH (cdnHost proxies must forward the full /lib/sdk@VERSION/velt.js path to cdn.velt.dev unmodified)**

Proxy the Velt SDK bundle through your domain. The SDK appends `/lib/sdk@[VERSION]/velt.js` to `cdnHost`, so your proxy must forward the full path to `https://cdn.velt.dev` without modifying headers or content. The official `velt-proxy-server` recipes do not cover `cdnHost`; contact Velt support before proxying the SDK CDN in production. The config below is a generic passthrough.

**Incorrect (path rewritten):**

```nginx
location /velt/ {
    # Strips the /lib/sdk@[VERSION]/velt.js path the SDK requests
    proxy_pass https://cdn.velt.dev/;
}
```

**Correct:**

```nginx
server {
    listen 443 ssl;
    server_name cdn-proxy.yourdomain.com;

    ssl_certificate     /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    location / {
        proxy_pass https://cdn.velt.dev;
        proxy_ssl_server_name on;
        proxy_set_header Host cdn.velt.dev;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- The `Host` header must be set to `cdn.velt.dev` so Velt's CDN serves the correct content
- `proxy_ssl_server_name on` enables SNI for the upstream TLS connection
- Do not rewrite paths; the SDK constructs the full URL and your proxy just forwards it
- Pair with `proxyConfig.cdnHost: 'https://cdn-proxy.yourdomain.com'` in your SDK config
- Consider enabling SRI (`integrity: true` in SDK config) when proxying the CDN for tamper detection

---

### 3.5 nginx Configuration for Ephemeral Database Proxy

**Impact: HIGH (v1Db needs WebSocket upgrade headers and a per-request upstream from ?ns=; without them realtime listeners fail)**

Proxy Velt's ephemeral database (Velt v1 / Firebase RTDB) traffic. This is the most complex proxy because RTDB uses WebSocket connections and the upstream host varies by namespace. The documented recipe derives the upstream from the `?ns=` query param (see "Dynamic Upstream" below); the static form that follows only fits a single known namespace.

Prerequisites: nginx 1.18+ (1.25+ for the `http2 on;` directive used in the repo configs) built with `ngx_http_proxy_module` and WebSocket support, or Docker, plus TLS certificates covering your proxy subdomains (a wildcard certificate is simplest).

**Incorrect (no WebSocket upgrade headers):**

```nginx
location / {
    # Missing proxy_http_version 1.1 + Upgrade/Connection headers:
    # RTDB WebSocket connections fail and realtime listeners never open
    proxy_pass https://YOUR_NAMESPACE.firebaseio.com;
}
```

**Correct:**

```nginx
server {
    listen 443 ssl;
    server_name v1db-proxy.yourdomain.com;

    ssl_certificate     /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    # WebSocket upgrade support
    location / {
        proxy_pass https://YOUR_PROJECT.firebaseio.com;
        proxy_ssl_server_name on;
        proxy_set_header Host YOUR_PROJECT.firebaseio.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket headers
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Longer timeouts for persistent connections
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
server {
    listen 443 ssl;
    server_name v1db-proxy.yourdomain.com;

    ssl_certificate     /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    # Required for dynamic upstream hostnames
    resolver 8.8.8.8 1.1.1.1 valid=300s;
    resolver_timeout 5s;

    location / {
        # Reject malformed ns values before interpolating into the hostname
        if ($arg_ns !~ "^[a-z0-9-]+$") {
            return 400 "Invalid or missing ns parameter\n";
        }

        set $v1db_host "$arg_ns.firebaseio.com";

        proxy_pass https://$v1db_host;
        proxy_set_header Host $v1db_host;
        proxy_ssl_server_name on;
        proxy_ssl_name $v1db_host;

        # WebSocket upgrade — required for real-time listeners
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

When `v1DbHost` is set, the SDK overrides Firebase's internal host property setter to prevent shard redirects. Normally, Firebase's handshake redirects traffic to a shard server (`s-gke-*.firebaseio.com`), which would bypass your proxy. The host-lock keeps all RTDB requests on your proxy domain for the lifetime of the connection.
This means your proxy only needs to forward to the primary `*.firebaseio.com` host; you don't need to handle shard redirects.
The static-upstream config above pins one RTDB host into the proxy. The documented nginx recipe instead derives the upstream host from the `?ns=` query param the SDK already sends. Three things are required when building the upstream dynamically: a `resolver` directive (nginx needs runtime DNS for non-static upstream hostnames), input validation on `?ns=` (refuse anything that wouldn't form a safe hostname), and the WebSocket upgrade headers so RTDB streams open:
The `Host` header and `proxy_ssl_name` must follow the same `$v1db_host` value so Firebase serves the correct namespace and the upstream TLS handshake uses the correct SNI. SDK host-lock still applies: the SDK keeps `?ns=` on every subsequent request, so `$v1db_host` re-evaluates per request and the proxy stays the only path RTDB traffic takes.
If your proxy infrastructure can't handle WebSocket upgrades, set `forceLongPolling: true` in your SDK config. This forces the SDK to use HTTP long-polling instead of WebSocket for both v1 and v2 database connections. The nginx WebSocket headers above become unnecessary, but there will be higher latency.
- WebSocket support (`Upgrade` and `Connection` headers) is required unless you use `forceLongPolling: true`
- Set long read/send timeouts: RTDB connections are persistent and long-lived
- The SDK's host-lock prevents Firebase shard redirects, so your proxy only needs to handle the primary host
- Prefer the dynamic `$arg_ns` form (the documented recipe); always pair it with a `resolver` directive, a regex guard on `$arg_ns`, and `proxy_ssl_server_name on` + `proxy_ssl_name $v1db_host`
- Pair with `proxyConfig.v1DbHost: 'https://v1db-proxy.yourdomain.com'` in your SDK config

---

### 3.6 nginx Configuration for Persistence Database Proxy

**Impact: HIGH (v2DbHost must forward to firestore.googleapis.com unchanged; any other upstream breaks persistent features)**

Proxy Velt's persistence database (Velt v2 database) traffic through your domain. `v2DbHost` replaces `firestore.googleapis.com` for all persistence requests, and the proxy is a straight passthrough.

**Incorrect (project-specific or guessed upstream):**

```nginx
location / {
    # Wrong: v2DbHost traffic is Firestore traffic
    proxy_pass https://YOUR_PROJECT.api.velt.dev;
}
```

**Correct:**

```nginx
server {
    listen 443 ssl;
    server_name v2db-proxy.yourdomain.com;

    ssl_certificate     /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    location / {
        proxy_pass https://firestore.googleapis.com;
        proxy_set_header Host firestore.googleapis.com;
        proxy_ssl_server_name on;
        proxy_ssl_name firestore.googleapis.com;
    }
}
```

- The upstream is `firestore.googleapis.com`
- Forward requests without modifying headers, body, or path
- See `nginx/conf.d/v2db-proxy.conf` in the `velt-js/velt-proxy-server` repo for the full server block (SNI, timeouts)
- Pair with `proxyConfig.v2DbHost: 'https://v2db-proxy.yourdomain.com'` in your SDK config

---

### 3.7 nginx Configuration for Storage Proxy

**Impact: HIGH (Storage proxy must pass large uploads through to firebasestorage.googleapis.com)**

Proxy file attachment and recording storage traffic (Firebase Storage) through your domain.

**Incorrect (no upload size limit raised):**

```nginx
location / {
    # nginx default client_max_body_size (1m) rejects recordings with 413
    proxy_pass https://firebasestorage.googleapis.com;
}
```

**Correct:**

```nginx
server {
    listen 443 ssl;
    server_name storage-proxy.yourdomain.com;

    ssl_certificate     /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    # Increase max body size for file uploads
    client_max_body_size 100m;

    location / {
        proxy_pass https://firebasestorage.googleapis.com;
        proxy_ssl_server_name on;
        proxy_set_header Host firebasestorage.googleapis.com;
        proxy_ssl_name firebasestorage.googleapis.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- The upstream target is `firebasestorage.googleapis.com`
- Increase `client_max_body_size` to accommodate file uploads (recordings, attachments)
- Forward requests without modifying headers or content
- Pair with `proxyConfig.storageHost: 'https://storage-proxy.yourdomain.com'` in your SDK config
- See `nginx/conf.d/storage-proxy.conf` in the `velt-js/velt-proxy-server` repo for the full server block

---

## 4. Security

**Impact: HIGH**

Content Security Policy (CSP) whitelist directives required for Velt traffic, and the `forceLongPolling` fallback for environments where the ephemeral-DB proxy can't pass WebSocket upgrade requests.

### 4.1 Content Security Policy (CSP) Whitelisting for Velt

**Impact: HIGH (Without these CSP entries the browser blocks Velt requests; proxy domains must be added too)**

If your app has a Content Security Policy, whitelist these domains for Velt to function. When using a proxy, also whitelist your proxy domains in addition to (or instead of) these defaults.

**Incorrect (connect-src without WebSocket entries):**

```typescript
Content-Security-Policy: connect-src 'self' *.velt.dev *.googleapis.com
# Realtime WebSocket connections to wss://*.firebaseio.com are blocked
*.velt.dev
*.api.velt.dev
*.firebaseio.com
*.googleapis.com
wss://*.firebaseio.com
wss://*.firebasedatabase.app
*.velt.dev
*.api.velt.dev
*.firebaseio.com
*.googleapis.com
wss://*.firebaseio.com
wss://*.firebasedatabase.app
storage.googleapis.com
firebasestorage.googleapis.com
storage.googleapis.com
firebasestorage.googleapis.com
script-src: *.yourdomain.com;
connect-src: *.yourdomain.com wss://*.yourdomain.com;
img-src: *.yourdomain.com;
media-src: *.yourdomain.com;
```

**Correct:** include every directive below.
**script-src** (SDK scripts and API calls):
**connect-src** (network connections):
**img-src** (user avatars, attachments):
**media-src** (recordings, audio/video):
If you're proxying all traffic through your own domain, you can replace the third-party domains with your proxy domains. For example, if all proxy subdomains are under `*.yourdomain.com`:
If you're only proxying some services, include both your proxy domains and the default Velt domains for the un-proxied services.
- Without these CSP entries, the browser blocks Velt SDK requests; check the browser console for CSP violation reports
- The `wss://` entries are needed for WebSocket connections to the ephemeral database; omit them only if you're using `forceLongPolling: true`
- When proxying storage, update `img-src` and `media-src` to include your storage proxy domain

---

### 4.2 forceLongPolling for WebSocket-Incompatible Proxies

**Impact: HIGH (Keeps database connections working through proxies that block WebSocket upgrades, at the cost of latency)**

If your reverse proxy doesn't support WebSocket upgrades (common with some load balancers, CDN edge proxies, or corporate proxies), set `forceLongPolling: true` to force the persistence and ephemeral database connections to use long-polling instead. It is a `proxyConfig` field.

**Incorrect (top-level config key):**

```jsx
<VeltProvider apiKey="YOUR_API_KEY" config={{ forceLongPolling: true }}>
  <App />
</VeltProvider>
```

**Correct:**

```js
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
const client = await initVelt('YOUR_API_KEY', {
  proxyConfig: {
    v1DbHost: 'https://v1db-proxy.yourdomain.com',
    v2DbHost: 'https://v2db-proxy.yourdomain.com',
    forceLongPolling: true,
  },
});
```

- **Pros:** Works with any proxy, no WebSocket support required, simpler nginx config (no `Upgrade`/`Connection` headers needed)
- **Cons:** Higher latency for real-time updates, more HTTP requests, slightly higher bandwidth usage
- Your proxy infrastructure doesn't support WebSocket upgrades
- You're behind a corporate proxy/firewall that blocks WebSocket
- You see connection errors or dropped WebSocket connections through your proxy
- You want the simplest possible proxy setup
Default is `false` (WebSocket preferred). Only set `true` when WebSocket isn't an option.

---

## 5. Debugging

**Impact: MEDIUM**

Verification checklist for confirming a proxy setup is routing all six hosts correctly, plus common-issue diagnostics for proxy failures.

### 5.1 Proxy Setup Verification and Debugging

**Impact: MEDIUM (Confirms every proxied host is actually used and catches the common CORS, WebSocket, auth-cache, and upload-size failures)**

After configuring your proxies, confirm each one is live and that the browser actually uses it. A proxy that responds to `curl` but is missing from `proxyConfig` silently leaves traffic on the default upstream.

**Incorrect (only checking that the app loads):**

```text
App renders, comments work → assume the proxy is in use
(Traffic may still go directly to Google/Velt hosts if proxyConfig is wrong)
```

**Correct (check each proxy, then the browser's Network tab):**

```bash
# Each should return upstream response headers (2xx or 4xx both mean the proxy is live)
curl -I https://auth-proxy.yourdomain.com/
curl -I https://v2db-proxy.yourdomain.com/
curl -I "https://v1db-proxy.yourdomain.com/?ns=YOUR_NAMESPACE"
curl -I https://storage-proxy.yourdomain.com/
```

- [ ] **CDN**: `https://your-cdn-proxy/lib/sdk@latest/velt.js` returns JavaScript
- [ ] **API**: Network tab shows API requests to your `apiHost` domain with 200 responses
- [ ] **Persistence DB**: Firestore requests go to your `v2DbHost` domain
- [ ] **Ephemeral DB**: WebSocket connections (or long-poll requests with `forceLongPolling: true`) go to your `v1DbHost` domain and carry `?ns=`
- [ ] **Storage**: uploading an attachment sends the request to your `storageHost` domain
- [ ] **Auth**: sign-in and token-refresh requests (for example `/v1/token`) go to your `authHost` domain, including after a page reload
**CORS errors in browser console**
Forward upstream CORS headers unchanged. Do not add your own `Access-Control-Allow-Origin` headers or strip the upstream ones, or the browser blocks requests.
**WebSocket connection drops**
- Ensure nginx has `proxy_http_version 1.1`, `proxy_set_header Upgrade $http_upgrade`, and `proxy_set_header Connection "upgrade"`
- Set long timeouts such as `proxy_read_timeout 86400s` for persistent connections
- If WebSocket can't work through your infrastructure, set `forceLongPolling: true`
**Auth token refresh hitting Google directly**
The SDK caches the auth proxy host in `localStorage` at init so refreshes on reload use your proxy. Since v6.0.0-beta.7 the boot-time auth request also routes through `authHost`; upgrade if you see it bypass the proxy on reload. If you added or changed `authHost` after users already loaded the app, they may need to clear the cached value (DevTools → Application → Local Storage) for the new host to apply immediately.
**SDK not loading from CDN proxy**
- Verify the proxy forwards the full path (including `/lib/sdk@[VERSION]/velt.js`)
- Set `proxy_set_header Host cdn.velt.dev` so the CDN serves the correct content
- With SRI (`integrity: true`), make sure the proxy doesn't modify the response body (re-compression, minification)
**413 Request Entity Too Large on file uploads**
Increase `client_max_body_size` in the storage proxy's nginx config; recordings can be much larger than the nginx default.
**proxyConfig not taking effect**
- `proxyConfig` must be nested under `config` (React) or the second `initVelt()` argument, not a top-level `VeltProvider` prop
- Check field-name casing (`v1DbHost` not `v1DBHost`, `cdnHost` not `CDNHost`)
- If migrating from `apiProxyDomain`, move it to `proxyConfig.apiHost`

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/security/proxy-server
- https://docs.velt.dev/security/content-security-policy
- https://console.velt.dev
- https://docs.velt.dev/api-reference/sdk/models/data-models#proxyconfig
