---
title: Use authProvider for Authentication
impact: CRITICAL
impactDescription: authProvider is the only supported authentication method for Velt
tags: auth, authProvider, VeltProvider, identity, authentication
---

## Use authProvider on VeltProvider

Always authenticate users via the `authProvider` prop on `VeltProvider`. The older `useIdentify` hook and `client.identify()` method are deprecated and must not be used. They lack automatic token refresh, built-in error handling, and retry logic that `authProvider` provides out of the box.

**Why this matters:**

Using deprecated authentication methods can cause silent session expiry, broken presence state when tokens expire, and no automatic recovery from transient network failures. The `authProvider` pattern centralizes auth and keeps Velt in sync with your app's auth lifecycle.

Do not import `useIdentify` from `@veltdev/react`. Do not call `client.identify()` anywhere in your codebase. Both patterns are deprecated and will be removed in a future release.

**Correct: authProvider on VeltProvider**

```jsx
"use client";
import { VeltProvider } from "@veltdev/react";

function AuthenticatedApp({ children }) {
  const authProvider = {
    getAuthToken: async () => {
      // Fetch a fresh JWT from your backend
      const res = await fetch("/api/velt-token");
      const { token } = await res.json();
      return token;
    },
    onAuthTokenExpire: async () => {
      // Called automatically when token expires — return a new one
      const res = await fetch("/api/velt-token");
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

**Correct: useVeltAuthProvider hook pattern**

If you need to set up the auth provider dynamically in a child component, use the `useVeltAuthProvider` hook:

```jsx
"use client";
import { useVeltAuthProvider } from "@veltdev/react";

function AuthSetup() {
  useVeltAuthProvider({
    getAuthToken: async () => {
      const res = await fetch("/api/velt-token");
      const { token } = await res.json();
      return token;
    },
    onAuthTokenExpire: async () => {
      const res = await fetch("/api/velt-token");
      const { token } = await res.json();
      return token;
    },
  });

  return null;
}
```

**Verification:**
- [ ] `authProvider` prop is set on `VeltProvider` (or `useVeltAuthProvider` is used in a child)
- [ ] No imports of `useIdentify` from `@veltdev/react` anywhere in the codebase
- [ ] No calls to `client.identify()` anywhere in the codebase
- [ ] `getAuthToken` returns a valid JWT from your backend
- [ ] `onAuthTokenExpire` is implemented for automatic token refresh

**Source Pointers:**
- `https://docs.velt.dev/get-started/setup/authenticate` - Authentication setup
