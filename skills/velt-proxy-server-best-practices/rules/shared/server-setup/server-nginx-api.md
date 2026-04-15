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
