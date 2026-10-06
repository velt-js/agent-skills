---
title: Configure authProvider on VeltProvider
impact: CRITICAL
impactDescription: Recommended authentication method; Velt calls generateToken on sign-in and whenever the 48-hour JWT expires
tags: authprovider, authentication, jwt, token, veltprovider, generatetoken, retryconfig, forcereset, throwerror, identify
---

## Configure authProvider on VeltProvider

The `authProvider` prop on `VeltProvider` is the recommended way to authenticate users. You pass the user plus a `generateToken` function, and Velt calls it automatically during the initial sign-in and whenever the token expires (Velt JWTs expire after 48 hours).

`identify()` / `useIdentify()` still exist, but with them you must pass the JWT yourself and re-authenticate on the `token_expired` error event. Prefer `authProvider` unless you need that manual control.

**Incorrect (identify without token refresh):**

```jsx
"use client";
import { useIdentify } from "@veltdev/react";

function AuthComponent({ user, token }) {
  // Works until the token expires (48h); nothing re-generates it
  useIdentify(user, { authToken: token });
  return null;
}
```

**Correct (authProvider on VeltProvider):**

```jsx
"use client";
import { VeltProvider } from "@veltdev/react";

export default function App() {
  // User from your app's auth system
  const user = {
    userId: "user-123",
    organizationId: "org-abc",
    name: "John Doe",
    email: "john@example.com",
  };

  const authProvider = {
    // The user object to authenticate
    user,

    // Retry configuration for token generation
    retryConfig: {
      retryCount: 3,
      retryDelay: 1000,  // milliseconds
    },

    // Function to generate JWT token from your backend
    generateToken: async () => {
      const response = await fetch("/api/velt/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          organizationId: user.organizationId,
          email: user.email,
        }),
      });
      const { token } = await response.json();
      return token;  // Return the JWT string
    },
  };

  return (
    <VeltProvider
      apiKey="YOUR_VELT_API_KEY"
      authProvider={authProvider}
    >
      {/* Your app content */}
    </VeltProvider>
  );
}
```

**authProvider Structure (`VeltAuthProvider`):**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| user | `User` | Yes | User object with `userId` and `organizationId` (plus `name`, `email`, `photoUrl`) |
| generateToken | `() => Promise<string>` | Production | Async function returning a Velt JWT from your backend |
| retryConfig | `{ retryCount?: number, retryDelay?: number }` | No | Retries for token generation (delay in ms) |
| options | `Options` | No | `forceReset`, `throwError`, `authToken` (see below) |

**Useful `options`:**

- `forceReset: true`: Velt preserves the authenticated session in the browser and does not generate a new token until you sign the user out. Set `forceReset` when you changed the user's metadata or default access in the Console and need it applied now.
- `throwError: true`: authentication methods return `null` on failure by default. With `throwError: true` they throw, so you can catch and handle the error.

**Extracting to Custom Hook (Recommended Pattern):**

```jsx
// components/velt/VeltInitializeUser.tsx
"use client";
import { useMemo } from "react";
import type { VeltAuthProvider } from "@veltdev/types";
import { useAppUser } from "@/app/userAuth/AppUserContext";

// Call your backend API to generate a JWT token for the user
async function getVeltJwtFromBackend(user: {
  userId: string;
  organizationId: string;
  email?: string;
}) {
  const resp = await fetch("/api/velt/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user.userId,
      organizationId: user.organizationId,
      email: user.email,
      isAdmin: false,
    }),
    cache: "no-store",  // Don't cache token requests
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(`Token API failed: ${err?.error || resp.statusText}`);
  }
  const { token } = await resp.json();
  if (!token) throw new Error("No token in response");
  return token as string;
}

export function useVeltAuthProvider() {
  const { user } = useAppUser();

  const authProvider: VeltAuthProvider | undefined = useMemo(() => {
    if (!user) return undefined;

    return {
      user,
      retryConfig: { retryCount: 3, retryDelay: 1000 },
      generateToken: async () => {
        return await getVeltJwtFromBackend({
          userId: user.userId as string,
          organizationId: user.organizationId as string,
          email: user.email,
        });
      },
    };
  }, [user]);

  return { authProvider };
}
```

**Using the Custom Hook:**

```jsx
// app/page.tsx
"use client";
import { VeltProvider } from "@veltdev/react";
import { useVeltAuthProvider } from "@/components/velt/VeltInitializeUser";

export default function Home() {
  const { authProvider } = useVeltAuthProvider();

  // Don't render VeltProvider until authProvider is ready
  if (!authProvider) {
    return <div>Loading...</div>;
  }

  return (
    <VeltProvider
      apiKey="YOUR_VELT_API_KEY"
      authProvider={authProvider}
    >
      {/* Your app content */}
    </VeltProvider>
  );
}
```

**Switching users:** to change the signed-in user in the same tab, call `client.signOutUser()` first, then authenticate the new user. This cleans up the previous session.

**When to Omit generateToken:**

- Development/testing only (the docs allow omitting it during development)
- Prototyping before the backend endpoint exists

For production apps, always implement `generateToken` and enable "Require JWT Token" in the Velt Console.

**Verification:**
- [ ] authProvider includes a user object with `userId` and `organizationId`
- [ ] generateToken fetches the token from your backend (never generated in the browser)
- [ ] Token endpoint validates the user session on the server
- [ ] VeltProvider waits until authProvider is defined
- [ ] If `identify()` is used instead, a `token_expired` handler re-authenticates with a fresh token
- [ ] No token-related errors in browser console

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 5: Authenticate Users
- `https://docs.velt.dev/key-concepts/overview#authenticate-a-user` - "Use Auth Provider", "Sign in with force reset", "Sign out a User"
- `https://docs.velt.dev/get-started/advanced#token-refresh` - Token Refresh
- `https://docs.velt.dev/get-started/advanced#error-handling-in-authentication` - Error Handling in Authentication
- `https://docs.velt.dev/api-reference/sdk/models/data-models#veltauthprovider` - VeltAuthProvider
