---
title: Implement Read-Only User Data Provider for PII Protection
impact: MEDIUM
impactDescription: Keeps user PII (name, email, photo) off Velt servers
tags: user, PII, resolver, get, read-only, privacy, GDPR, HIPAA
---

## Implement Read-Only User Data Provider for PII Protection

The user data provider only supports `get` (no save/delete). It resolves user identity data from your system so PII never touches Velt servers — only userId identifiers are stored on Velt.

**Incorrect (providing save/delete or missing user fields):**

```jsx
// save and delete are NOT supported for users — they are ignored
const userDataProvider = {
  get: fetchUsers,
  save: saveUsers,    // Ignored — user provider is read-only
  delete: deleteUsers // Ignored
};
```

**Correct (get-only user resolver with TypeScript types):**

```tsx
type User = {
  userId: string;
  name?: string;
  email?: string;
  photoUrl?: string;
  color?: string;
  textColor?: string;
  isAdmin?: boolean;
  [key: string]: unknown;
};

type DataProviderResponse = {
  data?: unknown;
  success: boolean;
  statusCode: number;
};

const USERS_URL = '/api/velt/users';

const fetchUsersFromDB = async (userIds: string[]): Promise<DataProviderResponse> => {
  try {
    const response = await fetch(`${USERS_URL}/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds }),
    });
    if (!response.ok) return { data: {}, success: false, statusCode: response.status };
    const data = await response.json();
    return { data: data.result || {}, success: true, statusCode: response.status };
  } catch (error) {
    console.error('[Velt Self-Host] Error fetching users:', error);
    return { data: {}, success: false, statusCode: 500 };
  }
};

// Save current user to your database when they log in
// This is called by YOUR app code (not by the Velt SDK)
export const saveCurrentUserToDB = async (user: User): Promise<void> => {
  try {
    await fetch(`${USERS_URL}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user }),
    });
  } catch (error) {
    console.error('[Velt Self-Host] Error saving user:', error);
  }
};

export const userDataProvider = {
  get: fetchUsersFromDB,
};
```

**Important:** The SDK only calls `get` — it never calls save/delete for users. However, your app MUST have a `users/save` route so that when users log in, their PII (name, email, photoUrl) is persisted to your database. Call `saveCurrentUserToDB()` from your auth flow (e.g., in `VeltInitializeUser.tsx` after the user is identified).

**Or endpoint-based:**

```jsx
const userDataProvider = {
  config: {
    getConfig: {
      url: `${BACKEND_URL}/users/get`,
      headers: { 'Content-Type': 'application/json' }
    },
    resolveTimeout: 5000,
    getRetryConfig: { retryCount: 3, retryDelay: 1000 },
  }
};
```

**Backend response format** (data keyed by userId):

```js
// Request: { organizationId: "org-1", userIds: ["user-1", "user-2"] }
// Response:
{
  data: {
    "user-1": {
      userId: "user-1",
      name: "Alex Smith",
      email: "alex@example.com",
      photoUrl: "https://example.com/photos/alex.jpg",
      color: "#4A90D9",
      textColor: "#FFFFFF",
      isAdmin: false
    },
    "user-2": {
      userId: "user-2",
      name: "Sam Johnson",
      email: "sam@example.com",
      photoUrl: "https://example.com/photos/sam.jpg"
    }
  },
  success: true,
  statusCode: 200
}
```

**Key details:**
- Only `get` is supported — the SDK uses this to hydrate user data in comment threads, notifications, and presence UIs
- Request contains `userIds` array — return data for all requested users
- Response data must be keyed by `userId`
- Must be set before `identify()` is called
- Without this provider, user PII (name, email, photo URL) is stored on Velt servers by default

**Verification:**
- [ ] Only `get` implemented (no save/delete)
- [ ] Response data keyed by userId
- [ ] All requested userIds resolved (missing users may show as "Unknown")
- [ ] Provider set before `identify()` is called

**Source Pointer:** https://docs.velt.dev/self-host-data/users
