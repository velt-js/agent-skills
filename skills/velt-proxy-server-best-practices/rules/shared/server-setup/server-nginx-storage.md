---
title: nginx Configuration for Storage Proxy
impact: HIGH
impactDescription: Storage proxy must pass large uploads through to firebasestorage.googleapis.com
tags: nginx, storage, storageHost, Firebase Storage, attachments, recordings, reverse-proxy
---

## nginx Configuration for Storage Proxy

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

### Key Points

- The upstream target is `firebasestorage.googleapis.com`
- Increase `client_max_body_size` to accommodate file uploads (recordings, attachments)
- Forward requests without modifying headers or content
- Pair with `proxyConfig.storageHost: 'https://storage-proxy.yourdomain.com'` in your SDK config
- See `nginx/conf.d/storage-proxy.conf` in the `velt-js/velt-proxy-server` repo for the full server block

**Source Pointers:**
- https://docs.velt.dev/security/proxy-server#storagehost — storageHost
- https://docs.velt.dev/security/proxy-server#nginx — "Passthrough for v2Db and Storage"
