---
title: Configure authProvider on VeltProvider
impact: CRITICAL
impactDescription: Recommended authentication method for production apps
tags: authprovider, authentication, jwt, token, veltprovider
---

## Configure authProvider on VeltProvider

The authProvider prop on VeltProvider is the recommended way to authenticate users. It provides automatic token refresh and proper error handling for production applications.

**Incorrect (development-only approach):**

```jsx
// Using useIdentify without tokens - OK for dev, insecure for prod
"use client";
import { VeltProvider, useIdentify } from "@veltdev/react";

function AuthComponent() {
  const user = { userId: "123", organizationId: "org", name: "John", email: "j@e.com" };
  useIdentify(user);  // No JWT token - development only
  return null;
}

export default function App() {
  return (
    <VeltProvider apiKey="YOUR_KEY">
      <AuthComponent />
    </VeltProvider>
  );
}
```

**Correct (production with authProvider):**

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

**authProvider Structure:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| user | object | Yes | User object with userId, organizationId, name, email |
| retryConfig | object | No | `{ retryCount: number, retryDelay: number }` |
| generateToken | function | Production | Async function returning JWT string |

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

**When to Omit generateToken:**

- Development/testing only
- Internal tools with trusted users
- Prototyping before backend is ready

For production apps with external users, always implement generateToken.

**Verification:**
- [ ] authProvider includes user object with all required fields
- [ ] generateToken fetches token from your backend (not client-side)
- [ ] Token endpoint validates the user on server side
- [ ] VeltProvider waits until authProvider is defined
- [ ] No token-related errors in browser console

**Source Pointers:**
- `/docs/get-started/quickstart.mdx` - "Step 5: Authenticate Users" section, authProvider configuration
- `/sample-apps/apps/react/comments/tables/tanstack/single-tool/components/velt/VeltInitializeUser.tsx` - useVeltAuthProvider hook pattern
- `/sample-apps/apps/react/comments/tables/tanstack/single-tool/app/page.tsx` - VeltProvider with authProvider
