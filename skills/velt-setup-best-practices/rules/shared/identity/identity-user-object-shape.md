---
title: Structure User Object with Required Fields
impact: CRITICAL
impactDescription: Authentication will fail without correct user object structure
tags: user, userid, organizationid, authentication, identity
---

## Structure User Object with Required Fields

The user object passed to Velt's identify method must include specific required fields. Missing or incorrect fields will cause authentication failures.

**Incorrect (missing required fields):**

```jsx
// Missing organizationId - will cause access control issues
const user = {
  userId: "user-123",
  name: "John Doe",
  email: "john@example.com",
};

// Missing userId - authentication will fail
const user = {
  organizationId: "org-abc",
  name: "John Doe",
};
```

**Correct (all required fields):**

```jsx
const user = {
  // Required fields
  userId: "user-123",           // Unique identifier for this user
  organizationId: "org-abc",    // Organization/workspace scope
  name: "John Doe",             // Display name for avatars and mentions
  email: "john@example.com",    // Email for notifications

  // Optional fields
  photoUrl: "https://example.com/avatar.jpg",  // Avatar image URL
  color: "#FF6B6B",             // Custom avatar background color
  textColor: "#FFFFFF",         // Custom avatar text color
};
```

**Field Reference:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | Unique user identifier (from your auth system) |
| organizationId | string | Yes | Organization/tenant for access control |
| name | string | Yes | Display name shown in UI |
| email | string | Yes | Email for @mentions and notifications |
| photoUrl | string | No | URL to user's avatar image |
| color | string | No | Hex color for avatar background |
| textColor | string | No | Hex color for avatar text/initials |

**Mapping from Common Auth Providers:**

```jsx
// Firebase Auth
const firebaseUser = auth.currentUser;
const user = {
  userId: firebaseUser.uid,
  organizationId: "your-org-id",  // From your database
  name: firebaseUser.displayName,
  email: firebaseUser.email,
  photoUrl: firebaseUser.photoURL,
};

// Auth0
const auth0User = await auth0.getUser();
const user = {
  userId: auth0User.sub,
  organizationId: auth0User['https://your-app.com/org_id'],
  name: auth0User.name,
  email: auth0User.email,
  photoUrl: auth0User.picture,
};

// NextAuth.js
const session = await getSession();
const user = {
  userId: session.user.id,
  organizationId: session.user.organizationId,
  name: session.user.name,
  email: session.user.email,
  photoUrl: session.user.image,
};
```

**Using the User Object:**

```jsx
// React with authProvider (recommended)
<VeltProvider
  apiKey="YOUR_KEY"
  authProvider={{
    user,
    generateToken: async () => { /* ... */ },
  }}
>

// React with useIdentify hook
import { useIdentify } from '@veltdev/react';
useIdentify(user);

// Angular/Vue/HTML
await client.identify(user);
```

**Common Mistakes:**

| Mistake | Issue | Fix |
|---------|-------|-----|
| Using integer IDs | May cause type mismatches | Convert to string: `String(id)` |
| Missing organizationId | Users see all docs | Always include organization scoping |
| Null email | Breaks @mentions | Provide fallback: `email \|\| 'no-email@example.com'` |
| Empty string userId | Auth fails silently | Validate userId before calling identify |

**Verification:**
- [ ] userId is a non-empty string
- [ ] organizationId is set for all users
- [ ] name and email are provided
- [ ] photoUrl is a valid URL if provided
- [ ] User object logged to console shows all fields

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 5: Authenticate Users
