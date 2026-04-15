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
