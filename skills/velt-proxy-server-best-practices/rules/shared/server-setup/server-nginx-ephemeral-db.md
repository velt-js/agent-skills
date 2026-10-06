---
title: nginx Configuration for Ephemeral Database Proxy
impact: HIGH
impactDescription: v1Db needs WebSocket upgrade headers and a per-request upstream from ?ns=; without them realtime listeners fail
tags: nginx, ephemeral, v1DbHost, Firebase RTDB, WebSocket, host-lock, reverse-proxy
---

## nginx Configuration for Ephemeral Database Proxy

Proxy Velt's ephemeral database (Velt v1 / Firebase RTDB) traffic. This is the most complex proxy because RTDB uses WebSocket connections and the upstream host varies by namespace. The documented recipe derives the upstream from the `?ns=` query param (see "Dynamic Upstream" below); the static form that follows only fits a single known namespace.

Prerequisites: nginx 1.18+ (1.25+ for the `http2 on;` directive used in the repo configs) built with `ngx_http_proxy_module` and WebSocket support, or Docker, plus TLS certificates covering your proxy subdomains (a wildcard certificate is simplest).

**Incorrect (no WebSocket upgrade headers):**

```nginx
location / {
    # Missing proxy_http_version 1.1 + Upgrade/Connection headers:
    # RTDB WebSocket connections fail and realtime listeners never open
    proxy_pass https://YOUR_NAMESPACE.firebaseio.com;
}
```

**Correct:**

```nginx
server {
    listen 443 ssl;
    server_name v1db-proxy.yourdomain.com;

    ssl_certificate     /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    # WebSocket upgrade support
    location / {
        proxy_pass https://YOUR_PROJECT.firebaseio.com;
        proxy_ssl_server_name on;
        proxy_set_header Host YOUR_PROJECT.firebaseio.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket headers
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Longer timeouts for persistent connections
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

### Host-Lock Behavior

When `v1DbHost` is set, the SDK overrides Firebase's internal host property setter to prevent shard redirects. Normally, Firebase's handshake redirects traffic to a shard server (`s-gke-*.firebaseio.com`), which would bypass your proxy. The host-lock keeps all RTDB requests on your proxy domain for the lifetime of the connection.

This means your proxy only needs to forward to the primary `*.firebaseio.com` host; you don't need to handle shard redirects.

### Dynamic Upstream from `?ns=` (documented recipe)

The static-upstream config above pins one RTDB host into the proxy. The documented nginx recipe instead derives the upstream host from the `?ns=` query param the SDK already sends. Three things are required when building the upstream dynamically: a `resolver` directive (nginx needs runtime DNS for non-static upstream hostnames), input validation on `?ns=` (refuse anything that wouldn't form a safe hostname), and the WebSocket upgrade headers so RTDB streams open:

```nginx
server {
    listen 443 ssl;
    server_name v1db-proxy.yourdomain.com;

    ssl_certificate     /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    # Required for dynamic upstream hostnames
    resolver 8.8.8.8 1.1.1.1 valid=300s;
    resolver_timeout 5s;

    location / {
        # Reject malformed ns values before interpolating into the hostname
        if ($arg_ns !~ "^[a-z0-9-]+$") {
            return 400 "Invalid or missing ns parameter\n";
        }

        set $v1db_host "$arg_ns.firebaseio.com";

        proxy_pass https://$v1db_host;
        proxy_set_header Host $v1db_host;
        proxy_ssl_server_name on;
        proxy_ssl_name $v1db_host;

        # WebSocket upgrade — required for real-time listeners
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

The `Host` header and `proxy_ssl_name` must follow the same `$v1db_host` value so Firebase serves the correct namespace and the upstream TLS handshake uses the correct SNI. SDK host-lock still applies: the SDK keeps `?ns=` on every subsequent request, so `$v1db_host` re-evaluates per request and the proxy stays the only path RTDB traffic takes.

### If Your Proxy Doesn't Support WebSocket

If your proxy infrastructure can't handle WebSocket upgrades, set `forceLongPolling: true` in your SDK config. This forces the SDK to use HTTP long-polling instead of WebSocket for both v1 and v2 database connections. The nginx WebSocket headers above become unnecessary, but there will be higher latency.

### Key Points

- WebSocket support (`Upgrade` and `Connection` headers) is required unless you use `forceLongPolling: true`
- Set long read/send timeouts: RTDB connections are persistent and long-lived
- The SDK's host-lock prevents Firebase shard redirects, so your proxy only needs to handle the primary host
- Prefer the dynamic `$arg_ns` form (the documented recipe); always pair it with a `resolver` directive, a regex guard on `$arg_ns`, and `proxy_ssl_server_name on` + `proxy_ssl_name $v1db_host`
- Pair with `proxyConfig.v1DbHost: 'https://v1db-proxy.yourdomain.com'` in your SDK config

**Source Pointers:**
- https://docs.velt.dev/security/proxy-server#v1dbhost — v1DbHost (host-lock)
- https://docs.velt.dev/security/proxy-server#nginx — "Dynamic upstream for v1Db", "Prereqs"
- https://docs.velt.dev/security/proxy-server#force-long-polling — Force long polling
