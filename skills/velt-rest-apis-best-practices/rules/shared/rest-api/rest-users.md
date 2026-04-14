---
title: User Management via REST API
impact: HIGH
impactDescription: User provisioning and GDPR compliance are critical for production deployments
tags: rest, api, users, gdpr, permissions, roles
---

## User Management via REST API

Manage users, access roles, and GDPR data operations. All endpoints are POST with base URL `https://api.velt.dev/v2`.

**Required headers:**

```
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN
```

### Add Users with Access Roles

Users can be assigned roles (`viewer` or `editor`) scoped to resource types (`organization`, `document`, or `folder`).

```bash
POST https://api.velt.dev/v2/users/add

{
  "data": {
    "organizationId": "org-123",
    "users": [
      {
        "userId": "user-1",
        "name": "Alice Smith",
        "email": "alice@example.com",
        "photoUrl": "https://example.com/alice.jpg",
        "plan": "pro",
        "resources": [
          {
            "resourceId": "org-123",
            "resourceType": "organization",
            "role": "editor"
          },
          {
            "resourceId": "doc-456",
            "resourceType": "document",
            "role": "viewer"
          },
          {
            "resourceId": "folder-789",
            "resourceType": "folder",
            "role": "editor"
          }
        ]
      }
    ]
  }
}
```

### Get, Update, Delete Users

```bash
# Get users
POST https://api.velt.dev/v2/users/get
{
  "data": {
    "organizationId": "org-123",
    "userIds": ["user-1", "user-2"]
  }
}

# Update users
POST https://api.velt.dev/v2/users/update
{
  "data": {
    "organizationId": "org-123",
    "users": [
      {
        "userId": "user-1",
        "name": "Alice Johnson",
        "resources": [
          {
            "resourceId": "doc-456",
            "resourceType": "document",
            "role": "editor"
          }
        ]
      }
    ]
  }
}

# Delete users
POST https://api.velt.dev/v2/users/delete
{
  "data": {
    "organizationId": "org-123",
    "userIds": ["user-1"]
  }
}
```

### GDPR Data Operations

Export or delete all data associated with a user for GDPR compliance.

```bash
# Export user data
POST https://api.velt.dev/v2/users/data/get
{
  "data": {
    "organizationId": "org-123",
    "userId": "user-1"
  }
}

# Delete user data
POST https://api.velt.dev/v2/users/data/delete
{
  "data": {
    "organizationId": "org-123",
    "userId": "user-1"
  }
}

# Check deletion status (async operation)
POST https://api.velt.dev/v2/users/data/delete/status
{
  "data": {
    "organizationId": "org-123",
    "userId": "user-1"
  }
}
```

**Key points:**

- The `resources` array controls per-resource access. Each entry needs `resourceId`, `resourceType`, and `role`.
- Valid roles: `viewer` (read-only) and `editor` (read-write).
- Valid resource types: `organization`, `document`, `folder`.
- GDPR data deletion is asynchronous — poll `/users/data/delete/status` to check completion.
- `/users/data/get` returns all user-generated content (comments, reactions, recordings) for export.

**Verification:**
- [ ] `organizationId` is included in every request
- [ ] Each user in the `users` array has a `userId`
- [ ] `resources` entries use valid `role` and `resourceType` values
- [ ] GDPR deletion status is polled until complete
- [ ] Both required headers are present

**Source Pointer:** `https://docs.velt.dev/api-reference/rest-api/users` (## REST API > ### Users)
