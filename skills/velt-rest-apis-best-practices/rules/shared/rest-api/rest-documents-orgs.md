---
title: Document, Organization, and Folder Management via REST API
impact: MEDIUM
impactDescription: Proper resource hierarchy setup is required before comments or presence can function
tags: rest, api, documents, organizations, folders, usergroups
---

## Document, Organization, and Folder Management via REST API

Manage the resource hierarchy: organizations contain folders and documents. All endpoints are POST with base URL `https://api.velt.dev/v2`.

**Required headers:**

```
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN
```

### Organization Endpoints

```bash
# Add organization
POST https://api.velt.dev/v2/organizations/add
{ "data": { "organizationId": "org-123", "organizationName": "Acme Corp" } }

# Get organizations
POST https://api.velt.dev/v2/organizations/get
{ "data": { "organizationIds": ["org-123"] } }

# Update organization
POST https://api.velt.dev/v2/organizations/update
{ "data": { "organizationId": "org-123", "organizationName": "Acme Inc" } }

# Delete organization
POST https://api.velt.dev/v2/organizations/delete
{ "data": { "organizationIds": ["org-123"] } }
```

### Document Endpoints

```bash
# Add document
POST https://api.velt.dev/v2/organizations/documents/add
{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "documentName": "Q4 Report"
  }
}

# Get documents
POST https://api.velt.dev/v2/organizations/documents/get
{ "data": { "organizationId": "org-123", "documentIds": ["doc-456"] } }

# Update document
POST https://api.velt.dev/v2/organizations/documents/update
{ "data": { "organizationId": "org-123", "documentId": "doc-456", "documentName": "Q4 Report v2" } }

# Delete documents
POST https://api.velt.dev/v2/organizations/documents/delete
{ "data": { "organizationId": "org-123", "documentIds": ["doc-456"] } }

# Move document to a folder
POST https://api.velt.dev/v2/organizations/documents/move
{ "data": { "organizationId": "org-123", "documentId": "doc-456", "folderId": "folder-789" } }

# Update document access
POST https://api.velt.dev/v2/organizations/documents/update-access
{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "accessMode": "private",
    "allowedUserIds": ["user-1", "user-2"]
  }
}

# Migrate document between organizations
POST https://api.velt.dev/v2/organizations/documents/migrate
{ "data": { "sourceOrganizationId": "org-123", "targetOrganizationId": "org-456", "documentId": "doc-456" } }
```

### Folder Endpoints

```bash
# Add folder
POST https://api.velt.dev/v2/organizations/folders/add
{ "data": { "organizationId": "org-123", "folderId": "folder-789", "folderName": "Reports" } }

# Get folders
POST https://api.velt.dev/v2/organizations/folders/get
{ "data": { "organizationId": "org-123", "folderIds": ["folder-789"] } }

# Update folder
POST https://api.velt.dev/v2/organizations/folders/update
{ "data": { "organizationId": "org-123", "folderId": "folder-789", "folderName": "Quarterly Reports" } }

# Delete folders
POST https://api.velt.dev/v2/organizations/folders/delete
{ "data": { "organizationId": "org-123", "folderIds": ["folder-789"] } }

# Update folder access
POST https://api.velt.dev/v2/organizations/folders/update-access
{ "data": { "organizationId": "org-123", "folderId": "folder-789", "accessMode": "private", "allowedUserIds": ["user-1"] } }
```

### User Group Endpoints

```bash
# Add user group
POST https://api.velt.dev/v2/organizations/usergroups/add
{ "data": { "organizationId": "org-123", "userGroupId": "group-1", "userGroupName": "Engineering" } }

# Add users to group
POST https://api.velt.dev/v2/organizations/usergroups/users/add
{ "data": { "organizationId": "org-123", "userGroupId": "group-1", "userIds": ["user-1", "user-2"] } }

# Remove users from group
POST https://api.velt.dev/v2/organizations/usergroups/users/delete
{ "data": { "organizationId": "org-123", "userGroupId": "group-1", "userIds": ["user-2"] } }
```

**Key points:**

- Organizations are the top-level container. Documents and folders belong to an organization.
- `accessMode` can be `private` (only allowed users) or `public` (all org members).
- Document migration moves a document and all its data between organizations.
- User groups allow bulk @mention and permission assignment.

**Verification:**
- [ ] Organization is created before adding documents or folders
- [ ] `organizationId` is present in all document/folder requests
- [ ] Access mode is set appropriately for sensitive documents
- [ ] Both required headers are included

**Source Pointer:** `https://docs.velt.dev/api-reference/rest-api/organizations` (## REST API > ### Organizations, Documents, Folders)

---

## Workspace Domain Management

Manage custom domains for your Velt workspace.

**Add Domain:**

```bash
curl -X POST https://api.velt.dev/v2/workspace/domains/add \
  -H "x-velt-api-key: YOUR_API_KEY" \
  -H "x-velt-auth-token: YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "data": { "domainName": "app.yourcompany.com" } }'
```

**Delete Domain:**

```bash
curl -X POST https://api.velt.dev/v2/workspace/domains/delete \
  -H "x-velt-api-key: YOUR_API_KEY" \
  -H "x-velt-auth-token: YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "data": { "domainName": "app.yourcompany.com" } }'
```

**Source Pointer:** `https://docs.velt.dev/api-reference/rest-api/workspace`
