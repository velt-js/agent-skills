---
title: Manage Organizations, Documents, Folders, and User Groups via REST API
impact: MEDIUM
impactDescription: The resource hierarchy must exist with the right access type before comments, presence, or agents can use it
tags: rest, api, organizations, documents, folders, usergroups, accessType, disablestate, migrate, domains
---

## Manage Organizations, Documents, Folders, and User Groups via REST API

Organizations contain folders and documents. The add and update endpoints take **arrays of objects** (`organizations[]`, `documents[]`, `folders[]`), and access is set with `accessType` (`public`, `organizationPrivate`, or `restricted`) through dedicated `access/update` endpoints. All endpoints are `POST` with the API-key-level headers.

**Incorrect (single-object bodies, invented `accessMode` / `allowedUserIds`, wrong path):**

```bash
POST https://api.velt.dev/v2/organizations/documents/add
{ "data": { "organizationId": "org-123", "documentId": "doc-456", "documentName": "Q4 Report" } }

POST https://api.velt.dev/v2/organizations/documents/update-access
{ "data": { "organizationId": "org-123", "documentId": "doc-456", "accessMode": "private", "allowedUserIds": ["user-1"] } }
```

**Correct (arrays of objects, `accessType` on the access endpoint):**

```bash
POST https://api.velt.dev/v2/organizations/documents/add
{ "data": {
    "organizationId": "org-123",
    "createOrganization": true,
    "folderId": "folder-789",
    "documents": [ { "documentId": "doc-456", "documentName": "Q4 Report" } ]
} }

POST https://api.velt.dev/v2/organizations/documents/access/update
{ "data": { "organizationId": "org-123", "documentIds": ["doc-456"], "accessType": "restricted" } }
```

With `restricted`, grant individual users through `/v2/users/add` with a `documentId`, or `/v2/auth/permissions/add` (see `rest-users`).

### Organizations

```bash
POST https://api.velt.dev/v2/organizations/add
{ "data": { "organizations": [ { "organizationId": "org-123", "organizationName": "Acme Corp" } ] } }

# Requires advanced queries. Omit organizationIds to list all; max 30 IDs per call.
POST https://api.velt.dev/v2/organizations/get
{ "data": { "organizationIds": ["org-123"], "pageSize": 1000 } }

POST https://api.velt.dev/v2/organizations/update
{ "data": { "organizations": [ { "organizationId": "org-123", "organizationName": "Acme Inc" } ] } }

POST https://api.velt.dev/v2/organizations/delete
{ "data": { "organizationIds": ["org-123"] } }

# Disable read and write access for a whole organization (creates it if missing)
POST https://api.velt.dev/v2/organizations/access/disablestate/update
{ "data": { "organizationIds": ["org-123"], "disabled": true } }
```

### Documents

```bash
# Requires advanced queries. documentIds max 30; or filter by folderId; paginate with pageToken.
POST https://api.velt.dev/v2/organizations/documents/get
{ "data": { "organizationId": "org-123", "documentIds": ["doc-456"] } }

POST https://api.velt.dev/v2/organizations/documents/update
{ "data": { "organizationId": "org-123", "documents": [ { "documentId": "doc-456", "documentName": "Q4 Report v2" } ] } }

POST https://api.velt.dev/v2/organizations/documents/delete
{ "data": { "organizationId": "org-123", "documentIds": ["doc-456"] } }

# Move up to 30 documents into a folder
POST https://api.velt.dev/v2/organizations/documents/move
{ "data": { "organizationId": "org-123", "documentIds": ["doc-456"], "folderId": "folder-789" } }

# Disable read and write access to specific documents
POST https://api.velt.dev/v2/organizations/documents/access/disablestate/update
{ "data": { "organizationId": "org-123", "documentIds": ["doc-456"], "disabled": true } }

# Migrate a document to a new document ID (async), then poll
POST https://api.velt.dev/v2/organizations/documents/migrate
{ "data": { "organizationId": "org-123", "documentId": "doc-456", "newDocumentId": "doc-456-v2" } }
# -> result.data.migrationId
POST https://api.velt.dev/v2/organizations/documents/migrate/status
{ "data": { "organizationId": "org-123", "migrationId": "yourMigrationId" } }
# -> result.data.status: pending | in_progress | completed | failed
```

Bulk document endpoints report per-item failures with a `code`; on v2 a partial failure arrives as HTTP 500. See `rest-documents-partial-failures` before writing retry logic.

### Folders

All folder endpoints require advanced queries enabled in the Console.

```bash
POST https://api.velt.dev/v2/organizations/folders/add
{ "data": {
    "organizationId": "org-123",
    "folders": [ { "folderId": "folder-789", "folderName": "Reports", "parentFolderId": "root-folder", "accessType": "restricted" } ]
} }

# Omit folderId to list all folders; maxDepth returns nested subFolders
POST https://api.velt.dev/v2/organizations/folders/get
{ "data": { "organizationId": "org-123", "folderId": "folder-789", "maxDepth": 3 } }

# Rename, or move by changing parentFolderId (ancestors and accessType propagate to subfolders)
POST https://api.velt.dev/v2/organizations/folders/update
{ "data": { "organizationId": "org-123", "folders": [ { "folderId": "folder-789", "folderName": "Quarterly Reports" } ] } }

# Deletes the folder and all its documents and subfolders
POST https://api.velt.dev/v2/organizations/folders/delete
{ "data": { "organizationId": "org-123", "folderId": "folder-789" } }

POST https://api.velt.dev/v2/organizations/folders/access/update
{ "data": { "organizationId": "org-123", "folderIds": ["folder-789"], "accessType": "organizationPrivate" } }

# Or inherit access from the parent folder
POST https://api.velt.dev/v2/organizations/folders/access/update
{ "data": { "organizationId": "org-123", "folderIds": ["folder-789"], "inheritFromParent": true } }
```

### User groups

```bash
POST https://api.velt.dev/v2/organizations/usergroups/add
{ "data": { "organizationId": "org-123", "organizationUserGroups": [ { "groupId": "engineering", "groupName": "Engineering" } ] } }

POST https://api.velt.dev/v2/organizations/usergroups/users/add
{ "data": { "organizationId": "org-123", "organizationUserGroupId": "engineering", "userIds": ["user-1", "user-2"] } }

# Remove specific users, or all users with deleteAll: true
POST https://api.velt.dev/v2/organizations/usergroups/users/delete
{ "data": { "organizationId": "org-123", "organizationUserGroupId": "engineering", "userIds": ["user-2"] } }
```

### Allowed domains

```bash
# Max 100 entries; protocol and www are stripped, so "https://www.example.com" is stored as "example.com"
POST https://api.velt.dev/v2/workspace/domains/add
{ "data": { "domains": ["https://www.example.com", "https://*.firebase.com"] } }
# -> result.data.domainsAdded

POST https://api.velt.dev/v2/workspace/domains/get
{ "data": {} }
# -> result.data.allowedDomains

POST https://api.velt.dev/v2/workspace/domains/delete
{ "data": { "domains": ["example.com"] } }
# -> result.data.domainsRemoved
```

**Verification Checklist:**
- [ ] Add and update bodies use `organizations[]`, `documents[]`, `folders[]`, and `organizationUserGroups[]` arrays
- [ ] Access is set with `accessType` (`public`, `organizationPrivate`, `restricted`) on `/documents/access/update` or `/folders/access/update`
- [ ] Get endpoints for organizations, documents, folders, and users run only with advanced queries enabled
- [ ] ID lists stay within 30 per call where documented (`organizationIds` on get, `documentIds` on get/move)
- [ ] Document migration sends `newDocumentId` and polls `migrate/status` by `migrationId`
- [ ] User group membership uses `organizationUserGroupId`, not `userGroupId`
- [ ] Domain endpoints send a `domains` array to `/v2/workspace/domains/add|get|delete`
- [ ] Both API-key-level headers are included

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/organizations/add-organizations - "Add Organizations"
- https://docs.velt.dev/api-reference/rest-apis/v2/organizations/get-organizations-v2 - "Get Organizations"
- https://docs.velt.dev/api-reference/rest-apis/v2/organizations/update-organization-disable-state - "Update Organization Disable State"
- https://docs.velt.dev/api-reference/rest-apis/v2/documents/add-documents - "Add Documents"
- https://docs.velt.dev/api-reference/rest-apis/v2/documents/get-documents-v2 - "Get Documents"
- https://docs.velt.dev/api-reference/rest-apis/v2/documents/update-document-access - "Update Access for Documents"
- https://docs.velt.dev/api-reference/rest-apis/v2/documents/move-documents - "Move Documents"
- https://docs.velt.dev/api-reference/rest-apis/v2/documents/migrate-documents - "Migrate Documents"
- https://docs.velt.dev/api-reference/rest-apis/v2/documents/migrate-documents-status - "Migrate Documents Status"
- https://docs.velt.dev/api-reference/rest-apis/v2/folders/add-folder - "Add Folder"
- https://docs.velt.dev/api-reference/rest-apis/v2/folders/get-folders - "Get Folders"
- https://docs.velt.dev/api-reference/rest-apis/v2/folders/update-folder-access - "Update Folder Access"
- https://docs.velt.dev/api-reference/rest-apis/v2/user-groups/add-groups - "Add User Groups"
- https://docs.velt.dev/api-reference/rest-apis/v2/user-groups/add-users-to-group - "Add Users to Group"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/add-domain - "Add Domains"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/domains-get - "Get Domains"
