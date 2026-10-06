---
title: nginx Configuration for CDN Proxy
impact: HIGH
impactDescription: cdnHost proxies must forward the full /lib/sdk@VERSION/velt.js path to cdn.velt.dev unmodified
tags: nginx, CDN, cdnHost, cdn.velt.dev, reverse-proxy
---

## nginx Configuration for CDN Proxy

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

### Key Points

- The `Host` header must be set to `cdn.velt.dev` so Velt's CDN serves the correct content
- `proxy_ssl_server_name on` enables SNI for the upstream TLS connection
- Do not rewrite paths; the SDK constructs the full URL and your proxy just forwards it
- Pair with `proxyConfig.cdnHost: 'https://cdn-proxy.yourdomain.com'` in your SDK config
- Consider enabling SRI (`integrity: true` in SDK config) when proxying the CDN for tamper detection

**Source Pointers:**
- https://docs.velt.dev/security/proxy-server#cdnhost — cdnHost
- https://docs.velt.dev/security/proxy-server#subresource-integrity-sri — Subresource Integrity (SRI)
