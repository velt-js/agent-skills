---
title: nginx Configuration for Persistence Database Proxy
impact: HIGH
impactDescription: v2DbHost must forward to firestore.googleapis.com unchanged; any other upstream breaks persistent features
tags: nginx, persistence, v2DbHost, Firestore, firestore.googleapis.com, database, reverse-proxy
---

## nginx Configuration for Persistence Database Proxy

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

### Key Points

- The upstream is `firestore.googleapis.com`
- Forward requests without modifying headers, body, or path
- See `nginx/conf.d/v2db-proxy.conf` in the `velt-js/velt-proxy-server` repo for the full server block (SNI, timeouts)
- Pair with `proxyConfig.v2DbHost: 'https://v2db-proxy.yourdomain.com'` in your SDK config

**Source Pointers:**
- https://docs.velt.dev/security/proxy-server#v2dbhost — v2DbHost
- https://docs.velt.dev/security/proxy-server#nginx — "Passthrough for v2Db and Storage"
