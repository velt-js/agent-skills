---
title: Use authProvider for Authentication — Never useIdentify
impact: CRITICAL
tags: authProvider, useIdentify, identify, authentication, VeltProvider
---

## Use authProvider for Authentication

When setting up Velt alongside proxy configuration, authentication must use the `authProvider` callback on `VeltProvider`. The deprecated `useIdentify` hook and `client.identify()` method must never be used.

The `authProvider` callback receives a `veltUser` setter function. Call it with your user object whenever your auth state changes:

```jsx
import { VeltProvider } from '@veltdev/react';

function App() {
  const authProvider = async ({ veltUser }) => {
    // Your auth logic (Firebase, Supabase, Auth0, etc.)
    const user = await getAuthenticatedUser();
    veltUser({
      userId: user.uid,
      name: user.displayName,
      email: user.email,
      photoUrl: user.photoURL,
      organizationId: 'your-org-id',
    });
  };

  return (
    <VeltProvider
      apiKey="YOUR_API_KEY"
      authProvider={authProvider}
      config={{
        proxyConfig: {
          // your proxy hosts here
        },
      }}
    >
      <YourApp />
    </VeltProvider>
  );
}
```

The `authProvider` prop and `config.proxyConfig` are siblings on `VeltProvider` — both go directly on the component, not nested inside each other.

**Why this matters:** `useIdentify` is deprecated and will be removed. Agents that generate `useIdentify` or `client.identify()` code produce broken applications. The `authProvider` pattern is the only supported authentication method.
