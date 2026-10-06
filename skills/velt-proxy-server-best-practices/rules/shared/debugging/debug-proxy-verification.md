---
title: Proxy Setup Verification and Debugging
impact: MEDIUM
impactDescription: Confirms every proxied host is actually used and catches the common CORS, WebSocket, auth-cache, and upload-size failures
tags: debugging, verification, troubleshooting, CORS, WebSocket, network, curl, localStorage, authHost
---

## Proxy Setup Verification and Debugging

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

### Verification Checklist

- [ ] **CDN**: `https://your-cdn-proxy/lib/sdk@latest/velt.js` returns JavaScript
- [ ] **API**: Network tab shows API requests to your `apiHost` domain with 200 responses
- [ ] **Persistence DB**: Firestore requests go to your `v2DbHost` domain
- [ ] **Ephemeral DB**: WebSocket connections (or long-poll requests with `forceLongPolling: true`) go to your `v1DbHost` domain and carry `?ns=`
- [ ] **Storage**: uploading an attachment sends the request to your `storageHost` domain
- [ ] **Auth**: sign-in and token-refresh requests (for example `/v1/token`) go to your `authHost` domain, including after a page reload

### Common Issues

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

**Source Pointers:**
- https://docs.velt.dev/security/proxy-server#cloudflare-workers — "Verify" step
- https://docs.velt.dev/security/proxy-server#authhost — authHost (localStorage caching)
- https://docs.velt.dev/security/proxy-server#force-long-polling — Force long polling
