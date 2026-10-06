---
title: nginx Configuration for Auth Proxy
impact: HIGH
impactDescription: Auth must split by path between securetoken and identitytoolkit; a single upstream breaks token refresh
tags: nginx, auth, authHost, identitytoolkit, securetoken, localStorage, reverse-proxy, sni, proxy_ssl_name
---

## nginx Configuration for Auth Proxy

Proxy Velt's authentication traffic. Auth is path-based: token-refresh requests (`/v1/token`, `/v2/token`) go to `securetoken.googleapis.com`, and everything else goes to `identitytoolkit.googleapis.com`. Follow the documented path split; prefix-based locations such as `/securetoken/` do not match the documented token paths.

**Incorrect (prefix-based locations the SDK never requests, or one upstream for everything):**

```nginx
# Token refreshes arrive on /v1/token, not /securetoken/, so they fall through to identitytoolkit
location /securetoken/ {
    proxy_pass https://securetoken.googleapis.com/securetoken/;
}
location / {
    proxy_pass https://identitytoolkit.googleapis.com;
}
```

**Correct (route token paths to securetoken, everything else to identitytoolkit):**

```nginx
server {
    listen 443 ssl;
    server_name auth-proxy.yourdomain.com;

    ssl_certificate     /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    # Token refresh
    location /v1/token {
        proxy_pass https://securetoken.googleapis.com;
        proxy_set_header Host securetoken.googleapis.com;
        proxy_ssl_server_name on;
        proxy_ssl_name securetoken.googleapis.com;
    }

    location /v2/token {
        proxy_pass https://securetoken.googleapis.com;
        proxy_set_header Host securetoken.googleapis.com;
        proxy_ssl_server_name on;
        proxy_ssl_name securetoken.googleapis.com;
    }

    # Everything else: identity
    location / {
        proxy_pass https://identitytoolkit.googleapis.com;
        proxy_set_header Host identitytoolkit.googleapis.com;
        proxy_ssl_server_name on;
        proxy_ssl_name identitytoolkit.googleapis.com;
    }
}
```

The `proxy_ssl_*` directives are required so the upstream TLS handshake uses the correct SNI. The `velt-js/velt-proxy-server` repo ships the full config as `nginx/conf.d/*.conf` with a Docker Compose setup.

### localStorage Caching Behavior

The SDK caches the auth proxy host in `localStorage` during `initConfig()`. On later page loads the cached value is applied synchronously, before Auth can fire an internal token refresh, so the refresh goes through your proxy instead of directly to Google. Since v6.0.0-beta.7 the boot-time auth request on page reload also routes through `authHost`; no configuration change is required.

This means:
- Once set, the auth proxy applies across page loads automatically
- If you change the auth proxy URL, users may need to clear the cached value for it to take effect immediately

### Key Points

- Route `/v1/token` and `/v2/token` to `securetoken.googleapis.com`; everything else to `identitytoolkit.googleapis.com`
- Pair `proxy_ssl_server_name on` with `proxy_ssl_name <upstream>` for correct SNI
- Don't modify headers or content
- Pair with `proxyConfig.authHost: 'https://auth-proxy.yourdomain.com'` in your SDK config

**Source Pointers:**
- https://docs.velt.dev/security/proxy-server#nginx — "nginx" ("Route Auth by path")
- https://docs.velt.dev/security/proxy-server#cloudflare-workers — "Route Auth by path" (`/v1/token` and `/v2/token`)
- https://docs.velt.dev/security/proxy-server#authhost — authHost (localStorage caching)
