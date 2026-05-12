---
title: nginx Configuration for Ephemeral Database Proxy
impact: HIGH
tags: nginx, ephemeral, v1DbHost, Firebase RTDB, WebSocket, host-lock, reverse-proxy
---

## nginx Configuration for Ephemeral Database Proxy

Proxy Velt's ephemeral database (v1/Firebase RTDB) traffic. This is the most complex proxy because Firebase RTDB uses WebSocket connections and has a shard redirect mechanism that must be defeated.

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

This means your proxy only needs to forward to the primary `*.firebaseio.com` host — you don't need to handle shard redirects.

### Dynamic Upstream from `?ns=` (multi-project / multi-namespace)

The static-upstream config above pins one project's RTDB host into the proxy. If you serve more than one Velt project or otherwise need the upstream to vary per request, derive the upstream host from the `?ns=` query param the SDK already sends. Three things are required when building the upstream dynamically: a `resolver` directive (nginx needs runtime DNS for non-static upstream hostnames), input validation on `?ns=` (refuse anything that wouldn't form a safe hostname), and the WebSocket upgrade headers so RTDB streams open:

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

The `Host` header and `proxy_ssl_name` must follow the same `$v1db_host` value so Firebase serves the correct namespace and the upstream TLS handshake uses the correct SNI. SDK host-lock still applies — the SDK keeps `?ns=` on every subsequent request, so `$v1db_host` re-evaluates per request and the proxy stays the only path RTDB traffic takes.

### If Your Proxy Doesn't Support WebSocket

If your proxy infrastructure can't handle WebSocket upgrades, set `forceLongPolling: true` in your SDK config. This forces the SDK to use HTTP long-polling instead of WebSocket for both v1 and v2 database connections. The nginx WebSocket headers above become unnecessary, but there will be higher latency.

### Key Points

- WebSocket support (`Upgrade` and `Connection` headers) is required unless you use `forceLongPolling: true`
- Set long read/send timeouts — RTDB connections are persistent and long-lived
- The SDK's host-lock prevents Firebase shard redirects, so your proxy only needs to handle the primary host
- Use the static-upstream form for single-project setups; use the dynamic `$arg_ns` form when the upstream must vary per request, and always pair it with a `resolver` directive, a regex guard on `$arg_ns`, and `proxy_ssl_server_name on` + `proxy_ssl_name $v1db_host`
- Pair with `proxyConfig.v1DbHost: 'https://v1db-proxy.yourdomain.com'` in your SDK config
