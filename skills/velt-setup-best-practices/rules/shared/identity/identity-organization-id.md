---
title: Include organizationId for Access Control
impact: CRITICAL
impactDescription: Required for document isolation between organizations/tenants
tags: organizationid, organization, tenant, access control, isolation
---

## Include organizationId for Access Control

The organizationId field is required in the user object and controls which documents users can access. By default, users can only see documents created within their organization.

**Incorrect (missing organizationId):**

```jsx
// Missing organizationId - users may see documents from other orgs
const user = {
  userId: "user-123",
  name: "John Doe",
  email: "john@example.com",
  // organizationId missing!
};

await client.identify(user);  // Access control won't work properly
```

**Incorrect (hardcoded for all users):**

```jsx
// Same organizationId for all users - no tenant isolation
const user = {
  userId: currentUser.id,
  organizationId: "default",  // All users in same org!
  name: currentUser.name,
  email: currentUser.email,
};
```

**Correct (organization scoped):**

```jsx
// Each organization has its own isolated document space
const user = {
  userId: currentUser.id,
  organizationId: currentUser.organizationId,  // From your auth system
  name: currentUser.name,
  email: currentUser.email,
};

await client.identify(user);
```

**Multi-Tenant Patterns:**

**Pattern 1: Organization from User Profile**

```jsx
// User has organization membership in your database
async function getUserWithOrg(userId) {
  const user = await db.users.findById(userId);
  const membership = await db.orgMemberships.findByUserId(userId);

  return {
    userId: user.id,
    organizationId: membership.organizationId,
    name: user.name,
    email: user.email,
  };
}
```

**Pattern 2: Organization from URL/Subdomain**

```jsx
// Organization determined by subdomain: acme.yourapp.com
function getOrgFromSubdomain() {
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];
  return subdomain;  // "acme"
}

const user = {
  userId: currentUser.id,
  organizationId: getOrgFromSubdomain(),
  name: currentUser.name,
  email: currentUser.email,
};
```

**Pattern 3: Organization from Route Parameter**

```jsx
// Organization in URL: /org/acme/documents/123
// Next.js App Router
function Page({ params }) {
  const { orgId } = params;

  const user = {
    userId: currentUser.id,
    organizationId: orgId,
    name: currentUser.name,
    email: currentUser.email,
  };
}
```

**Document Isolation Behavior:**

| User Org | Document Org | Can Access? |
|----------|--------------|-------------|
| org-a | org-a | Yes |
| org-a | org-b | No (default) |
| org-b | org-a | No (default) |

**Cross-Organization Access:**

If you need to share documents across organizations, use Velt's permission system with JWT tokens:

```typescript
// In your JWT token generation endpoint
const body = {
  userId,
  userProperties: {
    isAdmin: false,
  },
  permissions: {
    resources: [
      { type: "organization", id: organizationId },
      // Add cross-org access if needed
      { type: "document", id: "shared-doc-123" },
    ],
  },
};
```

**Verification:**
- [ ] organizationId is included in every user object
- [ ] organizationId comes from your auth system (not hardcoded)
- [ ] Different organizations see different documents
- [ ] Console.velt.dev shows correct organization IDs in user list

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 5: Authenticate Users
