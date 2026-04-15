---
title: Enable Subresource Integrity (SRI) for Proxied SDK
impact: HIGH
tags: integrity, SRI, security, CDN, proxy
---

## Enable Subresource Integrity (SRI)

When serving the Velt SDK through a proxy, enable Subresource Integrity (SRI) to verify the SDK bundle hasn't been tampered with in transit. The browser checks the fetched resource against a known hash before executing it.

This is especially important when proxying the CDN because you're adding an intermediary between Velt's CDN and the browser — SRI ensures nothing was modified along the way.

### React / Next.js

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

### Other Frameworks

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
- Default is `false` — you must explicitly enable it
- Most valuable when proxying the CDN (`cdnHost`), but applies to the SDK bundle regardless of proxy setup
