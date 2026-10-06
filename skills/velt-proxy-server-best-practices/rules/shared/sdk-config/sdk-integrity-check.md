---
title: Enable Subresource Integrity (SRI) for Proxied SDK
impact: HIGH
impactDescription: Lets the browser verify the SDK bundle served through your CDN proxy; off by default
tags: integrity, SRI, security, CDN, proxy
---

## Enable Subresource Integrity (SRI)

When serving the Velt SDK through a proxy, enable Subresource Integrity (SRI) to verify the SDK bundle hasn't been tampered with in transit. The browser checks the fetched resource against a known hash before executing it.

This matters most when proxying the CDN, because you add an intermediary between Velt's CDN and the browser. SRI ensures nothing was modified along the way.

**Incorrect (integrity nested inside proxyConfig):**

```jsx
<VeltProvider apiKey="YOUR_API_KEY" config={{ proxyConfig: { cdnHost: 'https://cdn-proxy.yourdomain.com', integrity: true } }}>
  <App />
</VeltProvider>
```

**Correct:**

**React / Next.js:**

```jsx
<VeltProvider
  apiKey="YOUR_API_KEY"
  authProvider={authProvider}
  config={{
    integrity: true,
    proxyConfig: {
      cdnHost: 'https://cdn-proxy.yourdomain.com',
    },
  }}
>
  <App />
</VeltProvider>
```

**Other Frameworks:**

```js
const client = await initVelt('YOUR_API_KEY', {
  integrity: true,
  proxyConfig: {
    cdnHost: 'https://cdn-proxy.yourdomain.com',
  },
});
```

### Key Points

- `integrity` is a sibling of `proxyConfig` inside the `config` object, not nested inside `proxyConfig`
- Default is `false`; you must explicitly enable it
- Most valuable when proxying the CDN (`cdnHost`), but applies to the SDK bundle regardless of proxy setup
- Your CDN proxy must not alter the bundle (no re-compression or minification), or the integrity check fails

**Source Pointers:**
- https://docs.velt.dev/security/proxy-server#subresource-integrity-sri — Subresource Integrity (SRI)
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltproviderconfig — VeltProviderConfig (`integrity`)
