---
title: Use authProvider for Authentication — Never useIdentify
impact: CRITICAL
tags: authProvider, useIdentify, identify, authentication, VeltProvider
---

## Use authProvider for Authentication

When setting up Velt Suggestions, authentication must use the `authProvider` callback on `VeltProvider`. The deprecated `useIdentify` hook and `client.identify()` method must never be used.

```jsx
import { VeltProvider } from '@veltdev/react';

function App() {
  const authProvider = async ({ veltUser }) => {
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
    <VeltProvider apiKey="YOUR_API_KEY" authProvider={authProvider}>
      <YourApp />
    </VeltProvider>
  );
}
```

The `authProvider` pattern is the only supported authentication method — `useIdentify` is deprecated and will be removed.
