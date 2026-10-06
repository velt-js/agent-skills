---
title: Structure User Object with Required Fields
impact: CRITICAL
impactDescription: Authentication will fail without correct user object structure
tags: user, userid, organizationid, authentication, identity
---

## Structure User Object with Required Fields

The user object passed to Velt authentication must include `userId` and `organizationId`. The quickstart also asks for `name`, `email`, and `photoUrl`: without them Velt shows a random avatar name and image, and email or Slack notifications cannot reach the user.

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
  organizationId: "org-abc",    // Organization the user belongs to

  // Recommended fields (quickstart user object)
  name: "John Doe",             // Display name for avatars and mentions
  email: "john@example.com",    // Needed for email/Slack notifications
  photoUrl: "https://example.com/avatar.jpg",  // Avatar image URL

  // Optional fields
  color: "#FF6B6B",             // Session color: avatar border, live cursor, selection
  textColor: "#FFFFFF",         // Initial's text color when photoUrl is absent
};
```

**Field Reference:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | Unique user identifier (from your auth system) |
| organizationId | string | Yes | Organization the user belongs to, used for access control |
| name | string | Recommended | Display name; defaults to a random avatar name if missing |
| email | string | Recommended | Required for email or Slack notifications about comments and mentions |
| photoUrl | string | Recommended | Avatar image URL; defaults to a random avatar image if missing |
| color | string | No | Hex color for avatar border, live cursor, selection |
| textColor | string | No | Hex color for the initial when `photoUrl` is absent |
| isAdmin | boolean | No | Admin user; the JWT you generate must also set `isAdmin: true` |

Access roles (`viewer` / `editor`) are not set on the frontend `User` object. Assign them per resource in the JWT `permissions.resources[]` or with the v2 Users / Auth Permissions REST APIs.

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
// React (recommended)
<VeltProvider
  apiKey="YOUR_KEY"
  authProvider={{
    user,
    retryConfig: { retryCount: 3, retryDelay: 1000 },
    generateToken: async () => {
      const resp = await fetch("/api/velt/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.userId, organizationId: user.organizationId }),
      });
      const { token } = await resp.json();
      return token;
    },
  }}
>

// Angular/Vue/HTML
await client.setVeltAuthProvider({
  user,
  generateToken: async () => {
    // Fetch JWT from your backend
    const resp = await fetch("/api/velt/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.userId, organizationId: user.organizationId }),
    });
    const { token } = await resp.json();
    return token;
  },
});
```

**Common Mistakes:**

| Mistake | Issue | Fix |
|---------|-------|-----|
| Using integer IDs | May cause type mismatches | Convert to string: `String(id)` |
| Missing organizationId | Users see all docs | Always include organization scoping |
| Null email | No email/Slack notifications for that user | Pass the real email from your auth system |
| Empty string userId | Auth fails silently | Validate userId before authentication |

**Verification:**
- [ ] userId is a non-empty string
- [ ] organizationId is set for all users
- [ ] name, email, and photoUrl are provided where available
- [ ] photoUrl is a valid URL if provided
- [ ] User object logged to console shows all fields

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 5: Authenticate Users
- `https://docs.velt.dev/api-reference/sdk/models/data-models#user` - User
