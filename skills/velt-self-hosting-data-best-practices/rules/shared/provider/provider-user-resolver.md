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

**⚠️ CRITICAL: The user provider has a DIFFERENT interface from all other providers.**

| | Comment/Reaction/Attachment providers | User provider |
|---|---|---|
| **Input** | Request object `{ organizationId, ... }` | Plain `string[]` array of userIds |
| **Return** | `{ data, success, statusCode }` | `Record<string, User>` directly |

DO NOT wrap the user provider's return in `{ data, success, statusCode }` — the SDK expects `Record<string, User>` directly.

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

const USERS_URL = '/api/velt/users';

// SDK calls this with a plain string[] of userIds
// Must return Record<string, User> DIRECTLY — NOT { data, success, statusCode }
const fetchUsersFromDB = async (userIds: string[]): Promise<Record<string, User>> => {
  try {
    const response = await fetch(`${USERS_URL}/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds }),
    });
    if (!response.ok) return {};
    const data = await response.json();
    return data.result || {};
  } catch (error) {
    console.error('[Velt Self-Host] Error fetching users:', error);
    return {};
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

**User seeding — users MUST be in the database BEFORE Velt tries to resolve them:**

When Velt renders a comment thread, it calls the user provider to resolve names and avatars. If the user data isn't in your database yet, comments show generic "U" / "Me" labels instead of names.

For demo apps with hardcoded users, seed them on app startup:
```tsx
// In your app initialization or a /api/velt/init-db route:
const DEMO_USERS = [
  { userId: "user-1", name: "Alice Johnson", email: "alice@example.com", photoUrl: "https://i.pravatar.cc/150?u=alice" },
  { userId: "user-2", name: "Bob Smith", email: "bob@example.com", photoUrl: "https://i.pravatar.cc/150?u=bob" },
];
for (const user of DEMO_USERS) {
  await saveUser(user); // UPSERT into users table
}
```

For production apps, persist user data when users log in:
```tsx
// In VeltInitializeUser.tsx or your auth flow:
useEffect(() => {
  if (user?.userId) {
    saveCurrentUserToDB(user);
  }
}, [user]);
```

**Important:** The SDK only calls `get` — it never calls save/delete for users. However, your app MUST have a `users/save` route so that when users log in, their PII (name, email, photoUrl) is persisted to your database. Call `saveCurrentUserToDB()` from your auth flow. For demos, also seed users into the DB at startup.

**Key details:**
- Only `get` is supported — the SDK uses this to hydrate user data in comment threads, notifications, and presence UIs
- `get` receives a plain `string[]` of userIds — NOT a request object
- `get` must return `Record<string, User>` directly — NOT `{ data, success, statusCode }`
- Must be set before `identify()` is called
- Users must already exist in your database when Velt calls `get` — seed demo users or persist on login
- Without this provider, user PII (name, email, photo URL) is stored on Velt servers by default

**Verification:**
- [ ] Only `get` implemented (no save/delete)
- [ ] `get` receives `string[]` and returns `Record<string, User>` directly (NO `{ data, success, statusCode }` wrapper)
- [ ] All requested userIds resolved (missing users show as "Unknown")
- [ ] Provider set before `identify()` is called
- [ ] Demo users seeded into database at startup
- [ ] `saveCurrentUserToDB()` called from auth flow to persist user PII on login

**Source Pointer:** https://docs.velt.dev/self-host-data/users
