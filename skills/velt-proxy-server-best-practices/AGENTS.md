# Velt Proxy Server Best Practices
|v1.0.0|Velt|April 2026
|IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for any Velt tasks.
|IMPORTANT: VeltProvider requires the `authProvider` prop for authentication. Do NOT use the deprecated `useIdentify` hook or `client.identify()`. The `authProvider` callback and `config.proxyConfig` are sibling props on VeltProvider:
|```jsx
|<VeltProvider apiKey="YOUR_API_KEY" authProvider={authProvider} config={{ proxyConfig: { cdnHost: '...', apiHost: '...' } }}>
|```
|root: ./rules

## 1. Core — CRITICAL
|shared/core:{core-auth-provider.md,core-proxy-overview.md}

## 2. SDK Config — CRITICAL
|shared/sdk-config:{sdk-proxy-config-react.md,sdk-proxy-config-non-react.md,sdk-integrity-check.md}

## 3. Server Setup — HIGH
|shared/server-setup:{server-nginx-cdn.md,server-nginx-api.md,server-nginx-persistence-db.md,server-nginx-ephemeral-db.md,server-nginx-storage.md,server-nginx-auth.md}

## 4. Security — HIGH
|shared/security:{security-csp-whitelist.md,security-force-long-polling.md}

## 5. Debugging — MEDIUM
|shared/debugging:{debug-proxy-verification.md}
