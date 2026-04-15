# Velt Proxy Server Best Practices — Full Reference
|v1.0.0|Velt|April 2026
|IMPORTANT: VeltProvider requires the `authProvider` prop for authentication. Do NOT use the deprecated `useIdentify` hook or `client.identify()`.
|14 rules across 5 categories. For the Python SDK (velt-py) for self-hosting, see velt-self-hosting-data-best-practices instead.

## 1. Core — CRITICAL

### core-auth-provider.md
---
title: Use authProvider for Authentication — Never useIdentify
impact: CRITICAL
tags: authProvider, useIdentify, identify, authentication, VeltProvider
---

## Use authProvider for Authentication

When setting up Velt alongside proxy configuration, authentication must use the `authProvider` callback on `VeltProvider`. The deprecated `useIdentify` hook and `client.identify()` method must never be used.

The `authProvider` callback receives a `veltUser` setter function. Call it with your user object whenever your auth state changes:

```jsx
import { VeltProvider } from '@veltdev/react';

function App() {
  const authProvider = async ({ veltUser }) => {
    // Your auth logic (Firebase, Supabase, Auth0, etc.)
    const user = await getAuthenticatedUser();
    veltUser({
      userId: user.uid,
      name: user.displayName,
      email: user.email,
      photoUrl: user.photoURL,
      organizationId: 'your-org-id',
    });
  };

  return (
    <VeltProvider
      apiKey="YOUR_API_KEY"
      authProvider={authProvider}
      config={{
        proxyConfig: {
          // your proxy hosts here
        },
      }}
    >
      <YourApp />
    </VeltProvider>
  );
}
```

The `authProvider` prop and `config.proxyConfig` are siblings on `VeltProvider` — both go directly on the component, not nested inside each other.

**Why this matters:** `useIdentify` is deprecated and will be removed. Agents that generate `useIdentify` or `client.identify()` code produce broken applications. The `authProvider` pattern is the only supported authentication method.

### core-proxy-overview.md
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

## 2. SDK Config — CRITICAL

### sdk-proxy-config-react.md
---
title: Configure proxyConfig in React / Next.js
impact: CRITICAL
tags: proxyConfig, VeltProvider, React, Next.js, config
---

## Configure proxyConfig in React / Next.js

Pass `proxyConfig` inside the `config` prop on `VeltProvider`. Each field is a base URL pointing to your reverse proxy.

### Single Host (e.g., proxy only the CDN)

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
```

The SDK automatically appends `/lib/sdk@[VERSION]/velt.js` to `cdnHost` to fetch the bundle. Your proxy must forward that path to `https://cdn.velt.dev`.

### Full Proxy Configuration

```jsx
<VeltProvider
  apiKey="YOUR_API_KEY"
  authProvider={authProvider}
  config={{
    proxyConfig: {
      cdnHost: 'https://cdn-proxy.yourdomain.com',
      apiHost: 'https://api-proxy.yourdomain.com',
      v2DbHost: 'https://persistence-proxy.yourdomain.com',
      v1DbHost: 'https://rtdb-proxy.yourdomain.com',
      storageHost: 'https://storage-proxy.yourdomain.com',
      authHost: 'https://auth-proxy.yourdomain.com',
      forceLongPolling: false,
    },
  }}
>
  <App />
</VeltProvider>
```

### Key Points

- `proxyConfig` is nested under `config`, not at the top level of `VeltProvider`
- The deprecated `apiProxyDomain` top-level field still works but should be replaced with `proxyConfig.apiHost`
- Only specify the hosts you're actually proxying — omit the rest
- `authProvider` and `config` are sibling props on `VeltProvider`

### Migration from apiProxyDomain

If you have the deprecated `apiProxyDomain`, replace it:

```jsx
// Before (deprecated)
<VeltProvider config={{ apiProxyDomain: 'https://proxy.example.com/api' }} />

// After
<VeltProvider config={{ proxyConfig: { apiHost: 'https://proxy.example.com/api' } }} />
```

### sdk-proxy-config-non-react.md
---
title: Configure proxyConfig for Angular, Vue, and HTML
impact: CRITICAL
tags: proxyConfig, initVelt, Angular, Vue, HTML, non-react
---

## Configure proxyConfig for Angular, Vue, and HTML

For non-React frameworks, pass `proxyConfig` as part of the options object (second argument) to `initVelt()`.

### Single Host

```js
const client = await initVelt('YOUR_API_KEY', {
  proxyConfig: {
    cdnHost: 'https://cdn.yourdomain.com',
  },
});
```

### Full Proxy Configuration

```js
const client = await initVelt('YOUR_API_KEY', {
  proxyConfig: {
    cdnHost: 'https://cdn-proxy.yourdomain.com',
    apiHost: 'https://api-proxy.yourdomain.com',
    v2DbHost: 'https://persistence-proxy.yourdomain.com',
    v1DbHost: 'https://rtdb-proxy.yourdomain.com',
    storageHost: 'https://storage-proxy.yourdomain.com',
    authHost: 'https://auth-proxy.yourdomain.com',
    forceLongPolling: false,
  },
});
```

### Key Points

- `proxyConfig` goes inside the second argument to `initVelt()`, not as a separate call
- Only specify the hosts you're actually proxying
- The deprecated `apiProxyDomain` should be replaced with `proxyConfig.apiHost`

### sdk-integrity-check.md
---
title: Enable Subresource Integrity (SRI) for Proxied SDK
impact: HIGH
tags: integrity, SRI, security, CDN, proxy
---

## Enable Subresource Integrity (SRI)

When serving the Velt SDK through a proxy, enable Subresource Integrity (SRI) to verify the SDK bundle hasn't been tampered with in transit. The browser checks the fetched resource against a known hash before executing it.

This is especially important when proxying the CDN because you're adding an intermediary between Velt's CDN and the browser — SRI ensures nothing was modified along the way.

### React / Next.js

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

### Other Frameworks

```js
const client = await initVelt('YOUR_API_KEY', {
  integrity: true,
  proxyConfig: {
    cdnHost: 'https://cdn-proxy.yourdomain.com',
  },
});
```

### Key Points

- `integrity` is a sibling of `proxyConfig` inside the `config` object, not nested inside `proxyConfig`
- Default is `false` — you must explicitly enable it
- Most valuable when proxying the CDN (`cdnHost`), but applies to the SDK bundle regardless of proxy setup

## 3. Server Setup — HIGH

### server-nginx-cdn.md
---
title: nginx Configuration for CDN Proxy
impact: HIGH
tags: nginx, CDN, cdnHost, cdn.velt.dev, reverse-proxy
---

## nginx Configuration for CDN Proxy

Proxy the Velt SDK bundle through your domain. The SDK appends `/lib/sdk@[VERSION]/velt.js` to `cdnHost`, so your proxy must forward the full path to `cdn.velt.dev`.

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

### Key Points

- The `Host` header must be set to `cdn.velt.dev` so Velt's CDN serves the correct content
- `proxy_ssl_server_name on` enables SNI for the upstream TLS connection
- Do not rewrite paths — the SDK constructs the full URL and your proxy just forwards it
- Pair with `proxyConfig.cdnHost: 'https://cdn-proxy.yourdomain.com'` in your SDK config
- Consider enabling SRI (`integrity: true` in SDK config) when proxying the CDN for tamper detection

### server-nginx-api.md
---
title: nginx Configuration for API Proxy
impact: HIGH
tags: nginx, API, apiHost, api.velt.dev, reverse-proxy
---

## nginx Configuration for API Proxy

Proxy Velt REST API calls through your domain.

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

### Key Points

- Forward all requests to `https://api.velt.dev` without modifying headers or content
- The SDK sends `x-velt-api-key` and other headers — your proxy must pass them through unmodified
- Pair with `proxyConfig.apiHost: 'https://api-proxy.yourdomain.com'` in your SDK config

### server-nginx-persistence-db.md
---
title: nginx Configuration for Persistence Database Proxy
impact: HIGH
tags: nginx, persistence, v2DbHost, Firestore, database, reverse-proxy
---

## nginx Configuration for Persistence Database Proxy

Proxy Velt's persistence database (v2/Firestore) traffic through your domain.

```nginx
server {
    listen 443 ssl;
    server_name persistence-proxy.yourdomain.com;

    ssl_certificate     /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    location / {
        proxy_pass https://YOUR_PERSISTENCE_ENDPOINT;
        proxy_ssl_server_name on;
        proxy_set_header Host YOUR_PERSISTENCE_HOST;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Key Points

- The upstream target is your Velt project's specific persistence endpoint — not a generic Velt URL. Check your Velt console or network tab for the actual host.
- Forward requests without modifying headers or content
- Pair with `proxyConfig.v2DbHost: 'https://persistence-proxy.yourdomain.com'` in your SDK config

### server-nginx-ephemeral-db.md
---
title: nginx Configuration for Ephemeral Database Proxy
impact: HIGH
tags: nginx, ephemeral, v1DbHost, Firebase RTDB, WebSocket, host-lock, reverse-proxy
---

## nginx Configuration for Ephemeral Database Proxy

Proxy Velt's ephemeral database (v1/Firebase RTDB) traffic. This is the most complex proxy because Firebase RTDB uses WebSocket connections and has a shard redirect mechanism that must be defeated.

```nginx
server {
    listen 443 ssl;
    server_name rtdb-proxy.yourdomain.com;

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
```

### Host-Lock Behavior

When `v1DbHost` is set, the SDK overrides Firebase's internal host property setter to prevent shard redirects. Normally, Firebase's handshake redirects traffic to a shard server (`s-gke-*.firebaseio.com`), which would bypass your proxy. The host-lock keeps all RTDB requests on your proxy domain for the lifetime of the connection.

This means your proxy only needs to forward to the primary `*.firebaseio.com` host — you don't need to handle shard redirects.

### If Your Proxy Doesn't Support WebSocket

If your proxy infrastructure can't handle WebSocket upgrades, set `forceLongPolling: true` in your SDK config. This forces the SDK to use HTTP long-polling instead of WebSocket for both v1 and v2 database connections. The nginx WebSocket headers above become unnecessary, but there will be higher latency.

### Key Points

- WebSocket support (`Upgrade` and `Connection` headers) is required unless you use `forceLongPolling: true`
- Set long read/send timeouts — RTDB connections are persistent and long-lived
- The SDK's host-lock prevents Firebase shard redirects, so your proxy only needs to handle the primary host
- Pair with `proxyConfig.v1DbHost: 'https://rtdb-proxy.yourdomain.com'` in your SDK config

### server-nginx-storage.md
---
title: nginx Configuration for Storage Proxy
impact: HIGH
tags: nginx, storage, storageHost, Firebase Storage, attachments, recordings, reverse-proxy
---

## nginx Configuration for Storage Proxy

Proxy file attachment and recording storage traffic (Firebase Storage) through your domain.

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Key Points

- The upstream target is `firebasestorage.googleapis.com`
- Increase `client_max_body_size` to accommodate file uploads (recordings, attachments)
- Forward requests without modifying headers or content
- Pair with `proxyConfig.storageHost: 'https://storage-proxy.yourdomain.com'` in your SDK config

### server-nginx-auth.md
---
title: nginx Configuration for Auth Proxy
impact: HIGH
tags: nginx, auth, authHost, identitytoolkit, securetoken, localStorage, reverse-proxy
---

## nginx Configuration for Auth Proxy

Proxy Velt's authentication traffic. This proxy must handle requests to two Google services based on the request path: `identitytoolkit.googleapis.com` and `securetoken.googleapis.com`.

```nginx
server {
    listen 443 ssl;
    server_name auth-proxy.yourdomain.com;

    ssl_certificate     /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    # Identity Toolkit requests
    location /identitytoolkit/ {
        proxy_pass https://identitytoolkit.googleapis.com/identitytoolkit/;
        proxy_ssl_server_name on;
        proxy_set_header Host identitytoolkit.googleapis.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Secure Token requests
    location /securetoken/ {
        proxy_pass https://securetoken.googleapis.com/securetoken/;
        proxy_ssl_server_name on;
        proxy_set_header Host securetoken.googleapis.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Catch-all for other auth-related paths
    location / {
        proxy_pass https://identitytoolkit.googleapis.com;
        proxy_ssl_server_name on;
        proxy_set_header Host identitytoolkit.googleapis.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### localStorage Caching Behavior

The SDK caches the auth proxy host in `localStorage` during `initConfig()`. On subsequent page loads, the cached value is applied synchronously before the Auth SDK fires an internal token refresh. This ensures the refresh request goes through your proxy rather than directly to Google — even before your app code runs.

This means:
- Once set, the auth proxy "sticks" across page loads automatically
- If you change the auth proxy URL, users may need to clear localStorage for it to take effect immediately
- This is intentional — it prevents a race condition where a token refresh could leak to Google before your proxy config loads

### Key Points

- Must route to both `identitytoolkit.googleapis.com` and `securetoken.googleapis.com` based on path
- Don't modify headers or content
- Be aware of the localStorage caching — changing the auth proxy URL requires users to clear cached values
- Pair with `proxyConfig.authHost: 'https://auth-proxy.yourdomain.com'` in your SDK config

## 4. Security — HIGH

### security-csp-whitelist.md
---
title: Content Security Policy (CSP) Whitelisting for Velt
impact: HIGH
tags: CSP, Content-Security-Policy, whitelist, script-src, connect-src, img-src, media-src
---

## Content Security Policy (CSP) Whitelisting

If your app has a Content Security Policy, whitelist these domains for Velt to function. When using a proxy, you'll also need to whitelist your proxy domains in addition to (or instead of) these defaults.

### Required CSP Directives

**script-src** (SDK scripts and API calls):
```
*.velt.dev
*.api.velt.dev
*.firebaseio.com
*.googleapis.com
wss://*.firebaseio.com
wss://*.firebasedatabase.app
```

**connect-src** (network connections):
```
*.velt.dev
*.api.velt.dev
*.firebaseio.com
*.googleapis.com
wss://*.firebaseio.com
wss://*.firebasedatabase.app
```

**img-src** (user avatars, attachments):
```
storage.googleapis.com
firebasestorage.googleapis.com
```

**media-src** (recordings, audio/video):
```
storage.googleapis.com
firebasestorage.googleapis.com
```

### When Using a Proxy

If you're proxying all traffic through your own domain, you can replace the third-party domains with your proxy domains. For example, if all proxy subdomains are under `*.yourdomain.com`:

```
script-src: *.yourdomain.com;
connect-src: *.yourdomain.com wss://*.yourdomain.com;
img-src: *.yourdomain.com;
media-src: *.yourdomain.com;
```

If you're only proxying some services, include both your proxy domains and the default Velt domains for the un-proxied services.

### Key Points

- Without these CSP entries, the browser will block Velt SDK requests silently — check the browser console for CSP violation reports
- The `wss://` entries are needed for WebSocket connections to the ephemeral database — omit them only if you're using `forceLongPolling: true`
- When proxying storage, update `img-src` and `media-src` to include your storage proxy domain

### security-force-long-polling.md
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

## 5. Debugging — MEDIUM

### debug-proxy-verification.md
---
title: Proxy Setup Verification and Debugging
impact: MEDIUM
tags: debugging, verification, troubleshooting, CORS, WebSocket, network
---

## Proxy Setup Verification and Debugging

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
