---
title: Use the authProvider Object Alongside proxyConfig
impact: CRITICAL
impactDescription: authProvider is an object of user plus generateToken, not a callback; the wrong shape leaves users unauthenticated behind the proxy
tags: authProvider, generateToken, useIdentify, identify, authentication, VeltProvider, proxyConfig, setVeltAuthProvider
---

## Use the authProvider Object Alongside proxyConfig

When you set up Velt behind a proxy, authenticate with the `authProvider` prop on `VeltProvider` (React) or `setVeltAuthProvider()` (other frameworks). `authProvider` is an object with `user` and an async `generateToken` that returns a Velt JWT from your backend. Velt calls `generateToken` on sign-in and whenever the token expires. `identify()` / `useIdentify()` still work, but you must then refresh expired tokens yourself, so prefer `authProvider`.

**Incorrect (authProvider as a callback that receives a setter):**

```jsx
// Not the VeltAuthProvider shape: Velt never calls this function
const authProvider = async ({ veltUser }) => {
  const user = await getAuthenticatedUser();
  veltUser({ userId: user.uid, organizationId: 'org-1' });
};

<VeltProvider apiKey="YOUR_API_KEY" authProvider={authProvider} config={{ proxyConfig: { /* ... */ } }} />
```

**Correct (React / Next.js):**

```jsx
import { VeltProvider } from '@veltdev/react';

function App({ user }) {
  const authProvider = {
    user: {
      userId: user.uid,
      organizationId: user.orgId,
      name: user.displayName,
      email: user.email,
      photoUrl: user.photoURL,
    },
    retryConfig: { retryCount: 3, retryDelay: 1000 },
    generateToken: async () => {
      const resp = await fetch('/api/velt/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, organizationId: user.orgId }),
      });
      const { token } = await resp.json();
      return token;
    },
  };

  return (
    <VeltProvider
      apiKey="YOUR_API_KEY"
      authProvider={authProvider}
      config={{
        proxyConfig: {
          authHost: 'https://auth-proxy.yourdomain.com',
          v2DbHost: 'https://v2db-proxy.yourdomain.com',
        },
      }}
    >
      <YourApp />
    </VeltProvider>
  );
}
```

**Correct (Other Frameworks):**

```js
const client = await initVelt('YOUR_API_KEY', {
  proxyConfig: {
    authHost: 'https://auth-proxy.yourdomain.com',
    v2DbHost: 'https://v2db-proxy.yourdomain.com',
  },
});

await client.setVeltAuthProvider({
  user,
  generateToken: async () => {
    const resp = await fetch('/api/velt/token', { method: 'POST' });
    const { token } = await resp.json();
    return token;
  },
});
```

`authProvider` and `config` are sibling props on `VeltProvider`; neither goes inside the other. If your app also calls Velt's REST APIs (for example to generate tokens) through `apiHost`, those calls still need the `x-velt-api-key` and `x-velt-auth-token` headers passed through unchanged.

**Verification:**
- [ ] `authProvider` is an object with `user` (including `userId` and `organizationId`) and `generateToken`
- [ ] `generateToken` returns a JWT string from your backend
- [ ] `authProvider` and `config.proxyConfig` are separate props on `VeltProvider`
- [ ] Token refresh requests appear on your `authHost` proxy, not on Google hosts

**Source Pointers:**
- https://docs.velt.dev/key-concepts/overview#authenticate-a-user — "Use Auth Provider"
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltauthprovider — VeltAuthProvider
- https://docs.velt.dev/security/proxy-server#quick-start — "Quick start"
