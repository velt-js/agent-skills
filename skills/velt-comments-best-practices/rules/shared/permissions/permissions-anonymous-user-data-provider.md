---
title: Register an Anonymous User Data Provider to Resolve Tagged Contact Emails to User IDs
impact: LOW
impactDescription: Enables Velt to automatically map email addresses to userIds at comment save time, so anonymous contacts tagged in comments are correctly associated with their accounts
tags: anonymous, data-provider, setAnonymousUserDataProvider, setDataProviders, email, userId, resolver, AnonymousUserDataProvider, ResolveUserIdsByEmailRequest, permissions
---

## Register an Anonymous User Data Provider to Resolve Tagged Contact Emails to User IDs

When a user tags a contact in a comment who has an email address but no userId, Velt automatically calls the registered anonymous user data provider at comment save time to resolve the email to a userId. Without a provider, the tagged contact cannot be correctly associated with their account.

Register the provider once at initialization using `client.setAnonymousUserDataProvider()` (React) or `Velt.setAnonymousUserDataProvider()` (other frameworks). The equivalent `setDataProviders({ anonymousUser: resolver })` form may be used interchangeably.

**Incorrect (no provider registered — tagged contacts with only an email remain unresolved):**

```jsx
// No anonymous user data provider registered.
// Comments that tag contacts by email will not resolve to a userId at save time.
const { client } = useVeltClient();
useEffect(() => {
  if (!client) return;
  // Missing: client.setAnonymousUserDataProvider(...)
}, [client]);
```

**Correct (React — register via setAnonymousUserDataProvider):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function AnonymousUserProviderSetup() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;

    client.setAnonymousUserDataProvider({
      resolveUserIdsByEmail: async (request) => {
        // request: { organizationId: string; emails: string[]; documentId?: string; folderId?: string; }
        const map = {};
        for (const email of request.emails) {
          map[email] = await lookupUserId(email); // your internal lookup
        }
        // Return shape: ResolverResponse<Record<string, string>> (email → userId)
        return { statusCode: 200, success: true, data: map };
      },
    });
  }, [client]);

  return null;
}
```

**Correct (React — equivalent form using setDataProviders):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function AnonymousUserProviderSetup() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;

    client.setDataProviders({
      anonymousUser: {
        resolveUserIdsByEmail: async (request) => {
          const map = {};
          for (const email of request.emails) {
            map[email] = await lookupUserId(email);
          }
          return { statusCode: 200, success: true, data: map };
        },
      },
    });
  }, [client]);

  return null;
}
```

**Correct (HTML / Other Frameworks):**

```typescript
Velt.setAnonymousUserDataProvider({
  resolveUserIdsByEmail: async (request) => {
    const map = {};
    for (const email of request.emails) {
      map[email] = await lookupUserId(email);
    }
    return { statusCode: 200, success: true, data: map };
  },
});

// Equivalent alternative
Velt.setDataProviders({
  anonymousUser: {
    resolveUserIdsByEmail: async (request) => { /* ... */ },
  },
});
```

**Type Definitions:**

```typescript
interface AnonymousUserDataProvider {
  resolveUserIdsByEmail: (
    request: ResolveUserIdsByEmailRequest
  ) => Promise<ResolverResponse<Record<string, string>>>;
  config?: AnonymousUserDataProviderConfig;
}

interface ResolveUserIdsByEmailRequest {
  organizationId: string;
  emails: string[];
  documentId?: string;
  folderId?: string;
}

interface AnonymousUserDataProviderConfig {
  resolveTimeout?: number;
  getRetryConfig?: RetryConfig;
}

interface RetryConfig {
  retryCount: number;
  retryDelay: number;
}

interface ResolverResponse<T> {
  statusCode: number;
  success: boolean;
  data: T;
}
```

**Key Behaviors:**

- The provider is called automatically at comment save time — not on every keystroke or mention.
- `resolveUserIdsByEmail` receives all unresolved emails for the annotation in a single batch call.
- `setAnonymousUserDataProvider(resolver)` and `setDataProviders({ anonymousUser: resolver })` are equivalent; use whichever fits your initialization pattern.

**Verification Checklist:**
- [ ] `setAnonymousUserDataProvider()` or `setDataProviders({ anonymousUser })` is called once at initialization inside a `useEffect` that depends on `client`
- [ ] `resolveUserIdsByEmail` returns `{ statusCode: number, success: boolean, data: Record<string, string> }` mapping each input email to its userId
- [ ] The provider handles the case where an email cannot be resolved (e.g., returns an empty string or omits the key)
- [ ] Subscription/cleanup is not needed — this is a one-time registration, not an observable

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior/visibility - Anonymous user data provider registration
- https://docs.velt.dev/api-reference/sdk/api/models/data-models - AnonymousUserDataProvider and related type definitions
