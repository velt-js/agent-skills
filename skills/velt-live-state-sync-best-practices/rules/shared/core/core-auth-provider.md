---
title: Wrap Live State Sync in VeltProvider with the authProvider object
impact: CRITICAL
impactDescription: Live State Sync APIs do nothing without an authenticated user and a set document; a wrong authProvider shape leaves the SDK unauthenticated
tags: authProvider, user, generateToken, retryConfig, setVeltAuthProvider, useIdentify, authentication, VeltProvider, setDocuments
---

## Wrap Live State Sync in VeltProvider with the authProvider object

Live state is scoped to the authenticated user's organization and the current document. The recommended authentication path is the `authProvider` **object** on `VeltProvider` (`user`, `generateToken`, optional `retryConfig`), or `Velt.setVeltAuthProvider(...)` outside React. Prefer it over the older `useIdentify()` / `client.identify()` calls in new code. Every Live State Sync example you produce, even one focused on a Redux store or a single component, should show this provider setup and a document being set.

**Incorrect (callback shape that the SDK does not accept):**

```jsx
// BUG: authProvider is an object, not a callback that receives veltUser
<VeltProvider
  apiKey="YOUR_API_KEY"
  authProvider={async ({ veltUser }) => veltUser({ userId: 'u1', organizationId: 'org-1' })}
>
  <App />
</VeltProvider>
```

**Correct (React / Next.js):**

```jsx
import { VeltProvider, useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

const user = {
  userId: 'user-123',
  organizationId: 'org-abc',
  name: 'John Doe',
  email: 'john.doe@example.com',
  photoUrl: 'https://i.pravatar.cc/300',
};

function DocumentScope({ children }) {
  const { client } = useVeltClient();
  useEffect(() => {
    if (client) client.setDocuments([{ id: 'whiteboard-42' }]);
  }, [client]);
  return children;
}

export default function Root() {
  return (
    <VeltProvider
      apiKey="YOUR_VELT_API_KEY"
      authProvider={{
        user,
        retryConfig: { retryCount: 3, retryDelay: 1000 },
        generateToken: async () => fetchVeltTokenFromYourBackend(),
      }}
    >
      <DocumentScope>
        <App />
      </DocumentScope>
    </VeltProvider>
  );
}
```

**Correct (Other Frameworks):**

```js
Velt.setVeltAuthProvider({
  user,
  retryConfig: { retryCount: 3, retryDelay: 1000 },
  generateToken: async () => fetchVeltTokenFromYourBackend(),
});
Velt.setDocuments([{ id: 'whiteboard-42' }]);
```

**Verification Checklist:**
- [ ] `authProvider` is an object with `user` (and `generateToken` for production), not a callback
- [ ] A document is set (`setDocuments` / `useSetDocument`) before reading or writing live state
- [ ] The full `VeltProvider` setup appears in generated examples, not only the store or component code

**Source Pointers:**
- https://docs.velt.dev/get-started/quickstart — "Authenticate Users" and "Initialize Document"
- https://docs.velt.dev/realtime-collaboration/live-state-sync/setup — Live State Sync APIs
