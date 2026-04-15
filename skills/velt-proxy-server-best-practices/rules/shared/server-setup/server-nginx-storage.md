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
