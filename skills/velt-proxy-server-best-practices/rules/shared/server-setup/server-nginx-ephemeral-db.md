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
    server_name rtdb-proxy.yourdomain.com;

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

The static-upstream config above pins one project's RTDB host into the proxy. If you serve more than one Velt project or otherwise need the upstream to vary per request, derive the upstream host from the `?ns=` query param the SDK already sends. Use an `nginx` `map` at `http` scope to compute the upstream, then reference it from the `server` block:

```nginx
map $arg_ns $v1db_upstream {
    default "${arg_ns}.firebaseio.com";
}

server {
    listen 443 ssl;
    server_name rtdb-proxy.yourdomain.com;

    ssl_certificate     /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    location / {
        proxy_pass https://$v1db_upstream;
        proxy_ssl_server_name on;
        proxy_set_header Host $v1db_upstream;

        # WebSocket upgrade
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

The `Host` header must follow the same `$v1db_upstream` value so Firebase serves the correct namespace. SDK host-lock still applies — the SDK keeps `?ns=` on every subsequent request, so the map re-evaluates per request and the proxy stays the only path RTDB traffic takes.

### If Your Proxy Doesn't Support WebSocket

If your proxy infrastructure can't handle WebSocket upgrades, set `forceLongPolling: true` in your SDK config. This forces the SDK to use HTTP long-polling instead of WebSocket for both v1 and v2 database connections. The nginx WebSocket headers above become unnecessary, but there will be higher latency.

### Key Points

- WebSocket support (`Upgrade` and `Connection` headers) is required unless you use `forceLongPolling: true`
- Set long read/send timeouts — RTDB connections are persistent and long-lived
- The SDK's host-lock prevents Firebase shard redirects, so your proxy only needs to handle the primary host
- Use the static-upstream form for single-project setups; use the `$arg_ns` map form when the upstream must vary per request
- Pair with `proxyConfig.v1DbHost: 'https://rtdb-proxy.yourdomain.com'` in your SDK config
