---
title: Use authProvider on VeltProvider with dataProviders — Never Use identify()
impact: CRITICAL
impactDescription: Using deprecated auth methods breaks data provider initialization ordering
tags: authProvider, authentication, VeltProvider, identify, useIdentify, deprecated, dataProviders
---

## Use authProvider on VeltProvider with dataProviders — Never Use identify()

VeltProvider requires the `authProvider` prop for authentication. The `useIdentify()` hook and `client.identify()` method are deprecated — they lack automatic token refresh and retry logic. For self-hosting, `dataProviders` must also be set on VeltProvider so that data providers are initialized before authentication occurs.

**Correct (authProvider + dataProviders on VeltProvider):**

```tsx
"use client";

import { useMemo } from "react";
import { VeltProvider } from "@veltdev/react";
import type { VeltAuthProvider } from "@veltdev/types";
import { useAppUser } from "@/app/userAuth/AppUserContext";
import { dataProviders } from "@/components/velt/VeltDataProviders";

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
      dataProviders={dataProviders}
    >
      {/* Self-hosted Velt components go here */}
    </VeltProvider>
  );
}
```

**Why ordering matters for self-hosting:** Data providers must be registered on VeltProvider via the `dataProviders` prop so they are initialized before authentication. If auth happens first (via the deprecated `identify()`), the data providers may not be ready when Velt starts fetching data, causing silent failures or data going to Velt servers instead of your infrastructure.

**Verification:**
- [ ] VeltProvider uses `authProvider` prop (not `useIdentify` hook or `client.identify()` method)
- [ ] VeltProvider has `dataProviders` prop set alongside `authProvider`
- [ ] No imports of `useIdentify` from `@veltdev/react`
- [ ] No calls to `client.identify()` anywhere in the codebase

**Source Pointers:**
- https://docs.velt.dev/self-hosting-data/overview - Self-Hosting Data Setup
