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
