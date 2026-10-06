---
title: Authenticate with the authProvider object on VeltProvider
impact: CRITICAL
impactDescription: Suggestions need an authenticated user and a set document; a wrong authProvider shape leaves the SDK unauthenticated and nothing is captured
tags: authProvider, user, generateToken, retryConfig, setVeltAuthProvider, useIdentify, authentication, VeltProvider, setDocuments
---

## Authenticate with the authProvider object on VeltProvider

Suggestions run on top of Velt Comments, so the SDK needs an authenticated user and an initialized document before suggestion mode does anything. The recommended path is the `authProvider` **object** on `VeltProvider` (`user`, `generateToken`, optional `retryConfig`), or `Velt.setVeltAuthProvider(...)` outside React. Prefer it over the older `useIdentify()` / `client.identify()` calls in new code.

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
import { VeltProvider } from '@veltdev/react';

const user = {
  userId: 'user-123',
  organizationId: 'org-abc',
  name: 'John Doe',
  email: 'john.doe@example.com',
  photoUrl: 'https://i.pravatar.cc/300',
};

export default function Root() {
  return (
    <VeltProvider
      apiKey="YOUR_VELT_API_KEY"
      authProvider={{
        user,
        retryConfig: { retryCount: 3, retryDelay: 1000 },
        generateToken: async () => {
          const token = await fetchVeltTokenFromYourBackend();
          return token;
        },
      }}
    >
      <App />
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
```

After authentication, initialize the document (`client.setDocuments([...])` or `useSetDocument(...)`); the SDK does not work until a document is set.

**Verification Checklist:**
- [ ] `authProvider` is an object with `user` (and `generateToken` for production), not a callback
- [ ] `user` includes `userId`, `organizationId`, `name`, `email`, and `photoUrl`
- [ ] A document is set after authentication
- [ ] Comments are set up, because suggestions render on the comment dialog

**Source Pointers:**
- https://docs.velt.dev/get-started/quickstart — "Authenticate Users" (`authProvider` on `VeltProvider`, `Velt.setVeltAuthProvider`) and "Initialize Document"
- https://docs.velt.dev/async-collaboration/suggestions/overview — "Overview" (Comments prerequisite)
