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
