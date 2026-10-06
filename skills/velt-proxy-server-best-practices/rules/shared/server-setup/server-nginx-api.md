---
title: nginx Configuration for API Proxy
impact: HIGH
impactDescription: apiHost proxies must forward to api.velt.dev with all Velt headers intact
tags: nginx, API, apiHost, api.velt.dev, reverse-proxy
---

## nginx Configuration for API Proxy

Proxy Velt API calls through your domain. `proxyConfig.apiHost` replaces the deprecated `apiProxyDomain`. The official `velt-proxy-server` recipes do not cover `apiHost`; contact Velt support before proxying the Velt API in production. The config below is a generic passthrough.

**Incorrect (headers dropped):**

```nginx
location / {
    proxy_pass https://api.velt.dev;
    # Clearing Velt headers breaks every API call
    proxy_set_header x-velt-api-key "";
}
```

**Correct:**

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
- The SDK sends `x-velt-api-key` and other headers; your proxy must pass them through unmodified
- Pair with `proxyConfig.apiHost: 'https://api-proxy.yourdomain.com'` in your SDK config

**Source Pointers:**
- https://docs.velt.dev/security/proxy-server#apihost — apiHost
- https://docs.velt.dev/api-reference/sdk/models/data-models#proxyconfig — ProxyConfig (`apiHost`)
