---
title: Use authProvider on VeltProvider — Never Use identify() or useIdentify()
impact: CRITICAL
impactDescription: Using deprecated auth methods causes silent failures and breaks token refresh
tags: authProvider, authentication, VeltProvider, identify, useIdentify, deprecated
---

## Use authProvider on VeltProvider — Never Use identify() or useIdentify()

VeltProvider requires the `authProvider` prop for user authentication. The `useIdentify()` hook and `client.identify()` method are deprecated — they lack automatic token refresh, retry logic, and proper error handling. Code using these deprecated methods will silently fail in production when tokens expire.

`client.identify()` and `useIdentify()` still exist as exports from `@veltdev/react` but should never be used. Always use `authProvider` on VeltProvider instead.

**Correct (authProvider on VeltProvider):**

```tsx
"use client";

import { useMemo } from "react";
import { VeltProvider } from "@veltdev/react";
import type { VeltAuthProvider } from "@veltdev/types";
import { useAppUser } from "@/app/userAuth/AppUserContext";

function useVeltAuthProvider() {
  const { user } = useAppUser();
  const authProvider: VeltAuthProvider | undefined = useMemo(() => {
    if (!user) return undefined;
    return {
      user: {
        userId: user.userId,
        organizationId: user.organizationId,
        name: user.name,
        email: user.email,
      },
      retryConfig: { retryCount: 3, retryDelay: 1000 },
      generateToken: async () => {
        const resp = await fetch("/api/velt/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.userId,
            organizationId: user.organizationId,
          }),
        });
        const { token } = await resp.json();
        return token;
      },
    };
  }, [user]);
  return { authProvider };
}

export default function DocumentPage() {
  const { authProvider } = useVeltAuthProvider();
  if (!authProvider) return <div>Loading...</div>;

  return (
    <VeltProvider
      apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY!}
      authProvider={authProvider}
    >
      {/* Recorder and other Velt components go here */}
    </VeltProvider>
  );
}
```

**Why authProvider matters for recordings:** Recordings are tied to authenticated users. Without proper auth via `authProvider`, recording data may not persist correctly, webhook payloads may lack user context, and token expiration will silently break recording uploads in long sessions.

**Verification:**
- [ ] VeltProvider uses `authProvider` prop (not `useIdentify` hook or `client.identify()` method)
- [ ] `authProvider` includes `user` object with `userId`, `organizationId`, `name`, `email`
- [ ] No imports of `useIdentify` from `@veltdev/react`
- [ ] No calls to `client.identify()` anywhere in the codebase

**Source Pointers:**
- https://docs.velt.dev/get-started/quickstart - Step 5: Authenticate Users
