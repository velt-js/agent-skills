---
title: Authenticate Users Before Using Comments
impact: CRITICAL
impactDescription: Required - SDK will not work without user authentication
tags: authentication, auth, user, identify, authprovider
---

## Authenticate Users Before Using Comments

Users must be authenticated with Velt before they can view or create comments. The SDK will not function properly without authentication.

**Incorrect (missing authentication):**

```jsx
// SDK won't work without authenticated user
import { VeltProvider, VeltComments } from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="YOUR_API_KEY">
      <VeltComments />  {/* Users can't interact with comments */}
    </VeltProvider>
  );
}
```

**Correct (using authProvider - recommended):**

```jsx
import { VeltProvider, VeltComments } from '@veltdev/react';

const user = {
  userId: 'user-123',
  organizationId: 'org-abc',
  name: 'John Doe',
  email: 'john.doe@example.com',
  photoUrl: 'https://i.pravatar.cc/300',
};

export default function App() {
  return (
    <VeltProvider
      apiKey="YOUR_API_KEY"
      authProvider={{
        user,
        retryConfig: { retryCount: 3, retryDelay: 1000 },
        generateToken: async () => {
          // Fetch JWT token from your backend
          const token = await fetchVeltTokenFromBackend();
          return token;
        }
      }}
    >
      <VeltComments />
    </VeltProvider>
  );
}
```

**Alternative (using useIdentify hook):**

```jsx
import { VeltProvider, VeltComments, useIdentify } from '@veltdev/react';

function AuthComponent() {
  const user = {
    userId: 'user-123',
    organizationId: 'org-abc',
    name: 'John Doe',
    email: 'john.doe@example.com',
    photoUrl: 'https://i.pravatar.cc/300',
  };

  useIdentify(user);
  return null;
}

export default function App() {
  return (
    <VeltProvider apiKey="YOUR_API_KEY">
      <AuthComponent />
      <VeltComments />
    </VeltProvider>
  );
}
```

**Required User Object Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | Unique user identifier |
| `organizationId` | string | Yes | Organization identifier |
| `name` | string | Yes | Display name |
| `email` | string | Yes | User email |
| `photoUrl` | string | No | Avatar URL |
| `color` | string | No | User color (e.g., "#FF6B6B") |
| `textColor` | string | No | Text color for contrast |

**Verification Checklist:**
- [ ] User object includes userId, organizationId, name, email
- [ ] authProvider or useIdentify is configured
- [ ] Token generation is set up for production
- [ ] Authentication happens before document setup

**Source Pointers:**
- `/docs/get-started/quickstart.mdx` - "Step 5: Authenticate Users"
- `/sample-apps/apps/react/comments/tables/tanstack/comment-aggregation/components/velt/VeltInitializeUser.tsx` - Auth implementation
