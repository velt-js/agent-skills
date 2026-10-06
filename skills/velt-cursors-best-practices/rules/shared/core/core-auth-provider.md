---
title: Use authProvider for Authentication
impact: CRITICAL
impactDescription: authProvider is the recommended authentication path and the only one with automatic token refresh
tags: auth, authProvider, VeltProvider, setVeltAuthProvider, generateToken, identity, authentication, cursors
---

## Use authProvider on VeltProvider

Authenticate users with the `authProvider` prop on `VeltProvider` (React) or `Velt.setVeltAuthProvider()` (other frameworks). Velt calls your `generateToken` function whenever a token is needed, including on expiry, so the session refreshes itself. The `identify()` method and `useIdentify()` hook still exist, but they require you to refresh tokens yourself; avoid them in new code.

**Why this matters:**

Cursors only works for an authenticated user. With `identify()` and no manual refresh, remote cursors stop rendering when the session expires; cursors never render for unauthenticated users.

**Incorrect (invented callback names, or identify() with no token refresh):**

```jsx
// getAuthToken / onAuthTokenExpire are NOT part of VeltAuthProvider
<VeltProvider
  apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY}
  authProvider={{ getAuthToken: fetchToken, onAuthTokenExpire: fetchToken }}
>
  {children}
</VeltProvider>

// identify() works, but you must handle token refresh yourself
await client.identify(user, { authToken });
```

**Correct (React / Next.js):**

```jsx
"use client";
import { VeltProvider } from "@veltdev/react";

function AuthenticatedApp({ user, children }) {
  const authProvider = {
    user: {
      userId: user.id,
      organizationId: user.orgId, // required for access control
      name: user.name,
      email: user.email,
      photoUrl: user.avatarUrl,
    },
    retryConfig: { retryCount: 3, retryDelay: 1000 },
    generateToken: async () => {
      // Your backend calls POST https://api.velt.dev/v2/auth/generate_token
      const res = await fetch("/api/velt-token", { method: "POST" });
      const { token } = await res.json();
      return token;
    },
  };

  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY} authProvider={authProvider}>
      {children}
    </VeltProvider>
  );
}
```

**Correct (Other Frameworks):**

```js
Velt.setVeltAuthProvider({
  user: { userId: "user-1", organizationId: "org-1", name: "Alice", email: "alice@example.com" },
  retryConfig: { retryCount: 3, retryDelay: 1000 },
  generateToken: async () => {
    const res = await fetch("/api/velt-token", { method: "POST" });
    const { token } = await res.json();
    return token;
  },
});
```

**Key details:**
- `VeltAuthProvider` fields: `user` (required), `generateToken`, `retryConfig` (`retryCount`, `retryDelay`), `options` (`authToken`, `forceReset`)
- `generateToken` can be omitted during local development, but provide it in production for security and automatic refresh
- Generate the JWT on your server; never ship your Velt auth token to the browser
- Include `organizationId` in the user object

**Verification:**
- [ ] `authProvider` prop is set on `VeltProvider` (or `Velt.setVeltAuthProvider()` is called)
- [ ] `authProvider.user` includes `userId`, `organizationId`, and `name`
- [ ] `generateToken` returns a Velt JWT from your backend
- [ ] No `getAuthToken` / `onAuthTokenExpire` keys (they do not exist)
- [ ] No `identify()` / `useIdentify()` calls unless you also implement token refresh

**Source Pointers:**
- https://docs.velt.dev/key-concepts/overview#authenticate-a-user - "Authenticate a User"
- https://docs.velt.dev/get-started/quickstart - "Step 5: Authenticate Users"
- https://docs.velt.dev/get-started/advanced#jwt-authentication-tokens - "JWT Authentication Tokens"
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltauthprovider - `VeltAuthProvider`
