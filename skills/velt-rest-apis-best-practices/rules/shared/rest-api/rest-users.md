---
title: Manage Users and GDPR Data via REST API
impact: HIGH
impactDescription: User provisioning and GDPR deletion are production-critical; the wrong scope field grants or revokes access at the wrong level
tags: rest, api, users, gdpr, accessRole, viewer, editor, permissions, organization, folder, document
---

## Manage Users and GDPR Data via REST API

The Users API adds people to an organization, a folder, or a document, and sets their `accessRole`. The **scope is chosen by request-level fields**: send only `organizationId` for organization access, add `folderId` for folder access, or add `documentId` for document access. Each user object carries its own `accessRole`.

**Incorrect (invented per-user `resources` array):**

```json
{
  "data": {
    "organizationId": "org-123",
    "users": [
      {
        "userId": "user-1",
        "resources": [{ "resourceId": "doc-456", "resourceType": "document", "role": "viewer" }]
      }
    ]
  }
}
```

**Correct (scope at the request level, `accessRole` on each user):**

```bash
# Organization-level access
POST https://api.velt.dev/v2/users/add
{ "data": {
    "organizationId": "org-123",
    "users": [
      { "userId": "user-1", "name": "Alice Smith", "email": "alice@example.com", "accessRole": "editor" }
    ]
} }

# Document-level access (user is added to the document only, not to the organization)
POST https://api.velt.dev/v2/users/add
{ "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "users": [
      { "userId": "user-1", "name": "Alice Smith", "email": "alice@example.com", "accessRole": "viewer" }
    ]
} }
```

- Provide either `documentId` or `folderId`, not both. With either, the user is added only at that level; call the API again with only `organizationId` to also add them to the organization.
- `createOrganization`, `createFolder`, and `createDocument` create the container first when it does not exist.
- `accessRole` is `viewer` (read-only) or `editor` (read/write). It can only be set through the v2 Users and Auth Permissions REST APIs, never from frontend SDK methods. For per-resource grants with expiry, use `/v2/auth/permissions/add` (see `core-jwt-tokens`).
- If `initial` is missing on a user, Velt derives it from `name`.

### Get, update, and delete users

```bash
# Get users (requires advanced queries enabled in the Console)
POST https://api.velt.dev/v2/users/get
{ "data": { "organizationId": "org-123", "documentId": "doc-456", "userIds": ["user-1", "user-2"] } }

# All document-level users of an organization, grouped by document
POST https://api.velt.dev/v2/users/get
{ "data": { "organizationId": "org-123", "allDocuments": true, "groupByDocumentId": true } }

# Update user metadata or accessRole at the same scope
POST https://api.velt.dev/v2/users/update
{ "data": {
    "organizationId": "org-123",
    "folderId": "folder-789",
    "users": [ { "userId": "user-1", "name": "Alice Johnson", "accessRole": "editor" } ]
} }

# Remove users from the organization (or from a documentId / folderId)
POST https://api.velt.dev/v2/users/delete
{ "data": { "organizationId": "org-123", "userIds": ["user-1"] } }
```

- `users/get` filters: `documentId` or `folderId`, `userIds` (max 30), `organizationUserGroupIds` (max 30), `allDocuments`, `groupByDocumentId`, `pageSize` (default 1000), `pageToken`. Continue with `result.nextPageToken`.
- `allDocuments: true` returns document-level users only, not organization-level users.
- Per-user results come back as `result.data[userId] = { success, id? }`. A `success: false` entry means that user was not found; check every entry.

### GDPR data operations

```bash
# Export a user's data (paginated, up to 100 items per feature per page)
POST https://api.velt.dev/v2/users/data/get
{ "data": { "organizationId": "org-123", "userId": "user-1", "pageToken": "..." } }
# -> result.data: { comments, reactions, recordings, notifications }, result.nextPageToken

# Delete all data for one or more users (async job)
POST https://api.velt.dev/v2/users/data/delete
{ "data": { "userIds": ["user-1"], "organizationIds": ["org-123"] } }
# -> { "data": { "jobId": "dsQuvPmIynANgPLLEhCm", "tasksCount": 5 }, "statusCode": 202 }

# Poll the deletion job by jobId
POST https://api.velt.dev/v2/users/data/delete/status
{ "data": { "jobId": "dsQuvPmIynANgPLLEhCm" } }
# -> result.data: { isDeleteCompleted, tasksLeft, lastTaskCompletedTime }
```

- `users/data/delete` takes `userIds` (array) and optional `organizationIds` to speed it up. It can take up to 5 minutes to respond with `202`, and full deletion can take up to 24 hours.
- Poll `users/data/delete/status` with the returned `jobId` (not `userId`) until `isDeleteCompleted` is `true`.
- `users/data/get` pages with `nextPageToken`; stop when it is absent.

**Verification Checklist:**
- [ ] Scope is set with request-level `organizationId` + optional `documentId` or `folderId`, never a per-user `resources` array
- [ ] Each user object sets `accessRole` to `viewer` or `editor` when access level matters
- [ ] `users/get` is only called with advanced queries enabled, and paginates with `pageToken`
- [ ] Per-user `success: false` entries are handled on add, update, and delete
- [ ] GDPR deletion sends `userIds` (array) and polls `users/data/delete/status` by `jobId`
- [ ] GDPR export loops on `nextPageToken`
- [ ] Both API-key-level headers are present

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/users/add-users - "Add Users"
- https://docs.velt.dev/api-reference/rest-apis/v2/users/get-users-v2 - "Get Users"
- https://docs.velt.dev/api-reference/rest-apis/v2/users/update-users - "Update Users"
- https://docs.velt.dev/api-reference/rest-apis/v2/users/delete-users - "Delete Users"
- https://docs.velt.dev/api-reference/rest-apis/v2/gdpr/get-all-user-data-gdpr - "Get All User Data"
- https://docs.velt.dev/api-reference/rest-apis/v2/gdpr/delete-all-user-data-gdpr - "Delete All User Data"
- https://docs.velt.dev/api-reference/rest-apis/v2/gdpr/get-delete-user-data-status-gdpr - "Get Delete User Data Status"
- https://docs.velt.dev/key-concepts/overview#access-control - "Access Control"
