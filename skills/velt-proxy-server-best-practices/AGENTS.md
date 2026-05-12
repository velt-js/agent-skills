# Velt Proxy Server Best Practices
|v1.0.3|Velt|April 2026
|IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for any Velt tasks.
|root: ./rules

## 1. Core — CRITICAL
|shared/core:{core-auth-provider.md,core-proxy-overview.md}

## 2. SDK Config — CRITICAL
|shared/sdk-config:{sdk-proxy-config-non-react.md,sdk-proxy-config-react.md,sdk-integrity-check.md}

## 3. Server Setup — HIGH
|shared/server-setup:{server-cloudflare-workers.md,server-nginx-api.md,server-nginx-auth.md,server-nginx-cdn.md,server-nginx-ephemeral-db.md,server-nginx-persistence-db.md,server-nginx-storage.md}

## 4. Security — HIGH
|shared/security:{security-csp-whitelist.md,security-force-long-polling.md}

## 5. Debugging — MEDIUM
|shared/debugging:{debug-proxy-verification.md}
