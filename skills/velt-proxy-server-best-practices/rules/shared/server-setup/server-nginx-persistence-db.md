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
