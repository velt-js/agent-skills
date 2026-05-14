# Velt Rest Apis Best Practices

**Version 1.0.2**  
Velt  
May 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Comprehensive guide for integrating Velt's server-side surface: the Velt REST API v2, JWT-based authentication for the frontend SDK, and webhook event handling. Covers the required `x-velt-api-key` and `x-velt-auth-token` header contract, JWT token generation and refresh flows (48h expiry), full CRUD over comment annotations, comments, notifications, users (including GDPR data export/delete), documents, organizations, folders, activity logs and CRDT documents via REST. Also covers v1 webhook setup plus v2 / Svix enterprise webhooks with retries and transformations, payload shapes for comment, huddle and CRDT events, and signature verification. All guidance is evidence-backed from official Velt documentation. For the self-hosted Python SDK (`velt-py`) used to store data on your own infrastructure, see `velt-self-hosting-data-best-practices`.

---

## Table of Contents

1. [Core Setup](#1-core-setup) — **CRITICAL**
   - 1.1 [Authenticate All Velt REST API Calls with Required Headers](#11-authenticate-all-velt-rest-api-calls-with-required-headers)
   - 1.2 [Generate JWT Tokens for Frontend User Authentication](#12-generate-jwt-tokens-for-frontend-user-authentication)

2. [REST API Endpoints](#2-rest-api-endpoints) — **HIGH**
   - 2.1 [Activity Logs and CRDT Data Endpoints](#21-activity-logs-and-crdt-data-endpoints)
   - 2.2 [Approval Engine REST API — moved to its own skill](#22-approval-engine-rest-api-moved-to-its-own-skill)
   - 2.3 [Comment Annotations and Comments CRUD via REST API](#23-comment-annotations-and-comments-crud-via-rest-api)
   - 2.4 [Document, Organization, and Folder Management via REST API](#24-document-organization-and-folder-management-via-rest-api)
   - 2.5 [Notification Management via REST API](#25-notification-management-via-rest-api)
   - 2.6 [User Management via REST API](#26-user-management-via-rest-api)

3. [Webhooks](#3-webhooks) — **MEDIUM**
   - 3.1 [Webhook v1 Setup and Event Handling](#31-webhook-v1-setup-and-event-handling)
   - 3.2 [Webhook v2 (Enterprise) with Svix](#32-webhook-v2-enterprise-with-svix)

4. [Debugging](#4-debugging) — **LOW-MEDIUM**
   - 4.1 [Troubleshooting Common Backend Integration Issues](#41-troubleshooting-common-backend-integration-issues)

---

## 1. Core Setup

**Impact: CRITICAL**

Foundational requirements for every server-side Velt integration. Covers JWT token generation for frontend authentication (signing key, 48h expiry, refresh flow) and the mandatory REST API auth contract — every request must include both `x-velt-api-key` and `x-velt-auth-token` headers. Get these wrong and every subsequent call fails.

### 1.1 Authenticate All Velt REST API Calls with Required Headers

**Impact: CRITICAL (Missing authentication headers cause 401 errors on every API call)**

Every Velt REST API v2 call requires two authentication headers. Without both, the request will be rejected.

**Incorrect (missing auth token header):**

```bash
curl -X POST https://api.velt.dev/v2/organizations/get \
  -H 'Content-Type: application/json' \
  -H 'x-velt-api-key: your_api_key' \
  -d '{"data": {"organizationId": "org_123"}}'
```

**Correct (curl with both headers):**

```bash
curl -X POST https://api.velt.dev/v2/organizations/get \
  -H 'Content-Type: application/json' \
  -H 'x-velt-api-key: your_api_key' \
  -H 'x-velt-auth-token: your_auth_token' \
  -d '{"data": {"organizationId": "org_123"}}'
```

**Incorrect (using GET method):**

```javascript
const response = await fetch('https://api.velt.dev/v2/organizations/get', {
  method: 'GET',
  headers: {
    'x-velt-api-key': 'your_api_key',
    'x-velt-auth-token': 'your_auth_token'
  }
});
```

**Correct (JavaScript fetch with POST):**

```javascript
const response = await fetch('https://api.velt.dev/v2/organizations/get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN
  },
  body: JSON.stringify({
    data: {
      organizationId: 'org_123'
    }
  })
});

const result = await response.json();
```

Reference: `https://docs.velt.dev/api-reference/rest-apis/overview` (## REST API > ### Authentication)

---

### 1.2 Generate JWT Tokens for Frontend User Authentication

**Impact: CRITICAL (Without server-generated JWT tokens, frontend users cannot authenticate with Velt)**

JWT tokens authenticate frontend users with the Velt SDK. Generate them server-side to keep your auth token secret. Tokens expire after 48 hours and must be regenerated.

**Incorrect (generating token on client — exposes auth token):**

```javascript
// NEVER do this in client-side code
const response = await fetch('https://api.velt.dev/v2/auth/token/get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': 'your_api_key',
    'x-velt-auth-token': 'your_auth_token' // EXPOSED to browser
  },
  body: JSON.stringify({
    data: { userId: 'user_1', apiKey: 'your_api_key', authToken: 'your_auth_token' }
  })
});
```

**Correct (Next.js API route — server-side only):**

```typescript
// app/api/velt-token/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  const response = await fetch('https://api.velt.dev/v2/auth/token/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-velt-api-key': process.env.VELT_API_KEY!,
      'x-velt-auth-token': process.env.VELT_AUTH_TOKEN!
    },
    body: JSON.stringify({
      data: {
        userId: userId,
        apiKey: process.env.VELT_API_KEY!,
        authToken: process.env.VELT_AUTH_TOKEN!,
        userProperties: {
          isAdmin: false,
          organizationId: 'org_123',
          email: 'user@example.com'
        }
      }
    })
  });

  const result = await response.json();
  // result.result.data.token contains the JWT string
  return NextResponse.json({ token: result.result.data.token });
}
```

**Response format:**

```json
{
  "result": {
    "data": {
      "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Correct (client-side token usage and refresh):**

```typescript
// On the frontend — fetch token from YOUR server, not Velt directly
const res = await fetch('/api/velt-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: currentUser.id })
});
const { token } = await res.json();

// Pass token to Velt identify
await client.identify(user, { authToken: token });

// Listen for token expiration (48-hour lifetime)
client.on('token_expired', async () => {
  const refreshRes = await fetch('/api/velt-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: currentUser.id })
  });
  const { token: newToken } = await refreshRes.json();
  await client.setAuthToken(newToken);
});
```

**Add Permissions:**

```bash
curl -X POST https://api.velt.dev/v2/auth/permissions/add \
  -H "x-velt-api-key: YOUR_API_KEY" \
  -H "x-velt-auth-token: YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "userId": "user-123",
      "permissions": {
        "resources": [
          { "type": "organization", "id": "org-abc", "accessRole": "editor" },
          { "type": "document", "id": "doc-456", "accessRole": "viewer" }
        ]
      }
    }
  }'
```

**Get Permissions:**

```bash
curl -X POST https://api.velt.dev/v2/auth/permissions/get \
  -H "x-velt-api-key: YOUR_API_KEY" \
  -H "x-velt-auth-token: YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "data": { "userId": "user-123", "organizationId": "org-abc" } }'
```

**Remove Permissions:**

```bash
curl -X POST https://api.velt.dev/v2/auth/permissions/remove \
  -H "x-velt-api-key: YOUR_API_KEY" \
  -H "x-velt-auth-token: YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "userId": "user-123",
      "permissions": {
        "resources": [
          { "type": "document", "id": "doc-456" }
        ]
      }
    }
  }'
```

**Generate Signature:**

```bash
curl -X POST https://api.velt.dev/v2/auth/generate_signature \
  -H "x-velt-api-key: YOUR_API_KEY" \
  -H "x-velt-auth-token: YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "data": { "userId": "user-123" } }'
```

References:
- `https://docs.velt.dev/api-reference/rest-apis/auth/get-token` (## Auth > ### Get Token)
- `https://docs.velt.dev/api-reference/rest-apis/auth/permissions`

---

## 2. REST API Endpoints

**Impact: HIGH**

CRUD patterns for the Velt REST API v2 surface — comment annotations and comments, notifications and notification config, users (add / get / update / delete plus GDPR data operations), documents / organizations / folders, activity logs / CRDT documents, and the Approval Engine (14 `/v2/workflow/` endpoints covering definitions, executions, and steps). All endpoints are POST and use the `https://api.velt.dev/v2` base URL; endpoint identity is verbatim (path and version prefix matter). Includes request and response shape guidance, including the GET response envelope (annotation-level fields, expanded `reactionAnnotations` objects vs. `reactionAnnotationIds`, timestamp formats), idempotency guidance for execution dispatch, and webhook signature verification patterns.

### 2.1 Activity Logs and CRDT Data Endpoints

**Impact: MEDIUM (Activity logs provide audit trails and CRDT endpoints enable server-side collaborative data management)**

Manage activity logs for audit trails and CRDT data for real-time collaboration. All endpoints are POST with base URL `https://api.velt.dev/v2`.

**Required headers:**

```bash
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN
# Add an activity log entry
POST https://api.velt.dev/v2/activities/add
{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "activity": {
      "activityType": "comment",
      "actionType": "added",
      "actionUser": {
        "userId": "user-1",
        "name": "Alice",
        "email": "alice@example.com"
      },
      "message": "Alice added a comment on Q4 Report",
      "timestamp": 1700000000000
    }
  }
}

# Get activity logs
POST https://api.velt.dev/v2/activities/get
{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456"
  }
}

# Update an activity log
POST https://api.velt.dev/v2/activities/update
{
  "data": {
    "organizationId": "org-123",
    "activityId": "act-1",
    "activity": {
      "message": "Alice added a comment on Q4 Report (edited)"
    }
  }
}

# Delete activity logs
POST https://api.velt.dev/v2/activities/delete
{
  "data": {
    "organizationId": "org-123",
    "activityIds": ["act-1"]
  }
}
# Add CRDT data
POST https://api.velt.dev/v2/crdt/add
{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "crdtDataType": "map",
    "key": "settings",
    "value": {
      "theme": "dark",
      "fontSize": 14
    }
  }
}

# Get CRDT data
POST https://api.velt.dev/v2/crdt/get
{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "crdtDataType": "map",
    "key": "settings"
  }
}

# Update CRDT data
POST https://api.velt.dev/v2/crdt/update
{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "crdtDataType": "map",
    "key": "settings",
    "value": {
      "theme": "light"
    }
  }
}
POST https://api.velt.dev/v2/livestate/broadcast
{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "key": "deployStatus",
    "value": {
      "status": "success",
      "timestamp": 1700000000000
    }
  }
}
```

CRDT (Conflict-free Replicated Data Types) endpoints let you read and write collaborative data from the server side. Supported CRDT types: `text`, `map`, `array`, `xml`.
Push a one-time state update to all connected clients.

Reference: `https://docs.velt.dev/api-reference/rest-api/activities` (## REST API > ### Activities & CRDT)

---

### 2.2 Approval Engine REST API — moved to its own skill

**Impact: MEDIUM (Pointer rule — full Approval Engine REST + webhook coverage now lives in velt-approval-engine-best-practices)**

The Approval Engine REST API (all 14 `/v2/workflow/*` endpoints — definitions, executions, steps — plus webhook delivery, quorum policies, and idempotency guidance) now lives in its own skill:

**Use `velt-approval-engine-best-practices` instead.**

Why split: the Approval Engine has its own concept surface (workflow DAGs, quorum policies, edge expression language, webhook signature contract) that's heavier than a CRUD API. Pulling it into a dedicated skill keeps general REST-API context (Comments, Users, Documents, Notifications) lighter when you're not working on workflows, and gives the Approval Engine room to grow as its frontend SDK surface lands.

---

### 2.3 Comment Annotations and Comments CRUD via REST API

**Impact: HIGH (Comments are the most-used collaboration primitive — incorrect API calls block core functionality)**

All Velt REST API v2 endpoints use POST and require two headers. Base URL: `https://api.velt.dev/v2`.

**Required headers for every request:**

```typescript
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN
```

**Add a comment annotation:**

```bash
POST https://api.velt.dev/v2/commentannotations/add

{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "targetAnnotationId": "ann-789",
    "annotation": {
      "comments": [
        {
          "commentText": "This needs review",
          "commenterId": "user-1",
          "commenterName": "Alice"
        }
      ]
    }
  }
}
```

**Get comment annotations:**

```bash
POST https://api.velt.dev/v2/commentannotations/get

{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "annotationIds": ["ann-789"]
  }
}
```

**Update a comment annotation:**

```bash
POST https://api.velt.dev/v2/commentannotations/update

{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "annotationId": "ann-789",
    "annotation": {
      "status": "resolved"
    }
  }
}
```

**Delete comment annotations:**

```bash
POST https://api.velt.dev/v2/commentannotations/delete

{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "annotationIds": ["ann-789"]
  }
}
```

**Get annotation count:**

```bash
POST https://api.velt.dev/v2/commentannotations/count/get

{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456"
  }
}
```

These operate on comments within an existing annotation.

**Add a comment to an annotation:**

```bash
POST https://api.velt.dev/v2/commentannotations/comments/add

{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "annotationId": "ann-789",
    "comment": {
      "commentText": "Agreed, let's fix this",
      "commenterId": "user-2",
      "commenterName": "Bob"
    }
  }
}
```

**Get, update, and delete comments:**

```bash
# Get comments
POST https://api.velt.dev/v2/commentannotations/comments/get
{ "data": { "organizationId": "org-123", "documentId": "doc-456", "annotationId": "ann-789" } }

# Update a comment
POST https://api.velt.dev/v2/commentannotations/comments/update
{ "data": { "organizationId": "org-123", "documentId": "doc-456", "annotationId": "ann-789", "commentId": "cmt-1", "comment": { "commentText": "Updated text" } } }

# Delete a comment
POST https://api.velt.dev/v2/commentannotations/comments/delete
{ "data": { "organizationId": "org-123", "documentId": "doc-456", "annotationId": "ann-789", "commentIds": ["cmt-1"] } }
```

**Top-level annotation envelope (returned for each annotation):**

```json
{
  "annotationId": "yourAnnotationId",
  "annotationNumber": 2,
  "annotationIndex": 1,
  "type": "comment",
  "createdAt": 1777973713421,
  "lastUpdated": 1777978714209,
  "hasDraftComments": false,
  "locationId": 5509827173770816,
  "location": {
    "version": { "id": "v1", "name": "Version 1" }
  },
  "context": {
    "access": { "default": "velt" },
    "accessFields": ["default:velt"]
  },
  "visibilityConfig": { "type": "public" },
  "metadata": {
    "apiKey": "yourApiKey",
    "organizationId": "yourOrganizationId",
    "documentId": "yourDocumentId",
    "sdkVersion": "5.0.2-beta.45"
  },
  "recorders": [],
  "status": { "id": "OPEN", "name": "Open" },
  "from": { "userId": "user123" },
  "comments": [ /* see below */ ]
}
```

Newly-surfaced fields consumers will see at the annotation level: `annotationId`, `annotationNumber`, `annotationIndex`, `hasDraftComments`, `locationId`, `location`, `context.access`, `context.accessFields`, `visibilityConfig`, `metadata`, `recorders`.

**`reactionAnnotationIds` vs. `reactionAnnotations` — both are returned, with different shapes:**

```json
// WRONG — older shape, no longer accurate
const ids: string[] = comment.reactionAnnotations; // type error at runtime
{
  "annotationId": "reactionAnnotationId1",
  "type": "reaction",
  "icon": "RAISED_HANDS",
  "commentAnnotationId": "yourAnnotationId",
  "locationId": 5509827173770816,
  "location": { "version": { "id": "v1", "name": "Version 1" } },
  "context": {
    "access": { "default": "velt" },
    "accessFields": ["default:velt"]
  },
  "lastUpdated": 1777978712656,
  "fromUsers": [
    {
      "lastUpdated": 1777978709472,
      "from": { "userId": "user123", "name": "John Doe", "email": "john.doe@example.com" }
    }
  ]
}
```

**Correct:** Each entry in `reactionAnnotations` is a full reaction object:
If you only need IDs (e.g. to fan out a follow-up fetch), read `reactionAnnotationIds`. If you need icon, who reacted (`fromUsers`), or when (`lastUpdated`), read `reactionAnnotations`.

Reference: `https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/get-comment-annotations-v2` and `https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/get-comments`

---

### 2.4 Document, Organization, and Folder Management via REST API

**Impact: MEDIUM (Proper resource hierarchy setup is required before comments or presence can function)**

Manage the resource hierarchy: organizations contain folders and documents. All endpoints are POST with base URL `https://api.velt.dev/v2`.

**Required headers:**

```bash
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN
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

References:
- `https://docs.velt.dev/api-reference/rest-api/organizations` (## REST API > ### Organizations, Documents, Folders)
- `https://docs.velt.dev/api-reference/rest-api/workspace`

---

### 2.5 Notification Management via REST API

**Impact: MEDIUM (Notifications keep users informed of collaboration events — misconfigured templates produce broken messages)**

Send custom notifications and manage notification configuration. All endpoints are POST with base URL `https://api.velt.dev/v2`.

**Required headers:**

```typescript
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN
```

Use `displayHeadlineMessageTemplate` with template variables to create dynamic notification messages.

**Required vs. optional fields on `POST /v2/notifications/add`:**

```bash
POST https://api.velt.dev/v2/notifications/add

{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "notification": {
      "notificationSource": "custom",
      "displayHeadlineMessageTemplate": "{actionUser} assigned you to {taskName}",
      "displayHeadlineMessageTemplateData": {
        "actionUser": "Alice",
        "taskName": "Fix login bug"
      },
      "actionUser": {
        "userId": "user-1",
        "name": "Alice",
        "email": "alice@example.com"
      },
      "notifyUsers": [
        {
          "userId": "user-2",
          "name": "Bob",
          "email": "bob@example.com"
        }
      ]
    }
  }
}
```

**Correct (resolver-eligible write — minimal payload):**

```json
POST https://api.velt.dev/v2/notifications/add
{
  "data": {
    "organizationId": "yourOrganizationId",
    "documentId": "yourDocumentId",
    "actionUser": {
      "userId": "yourUserId",
      "name": "User Name",
      "email": "user@example.com"
    },
    "notificationId": "custom-notif-001",
    "isNotificationResolverUsed": true,
    "notificationSource": "custom",
    "notifyUsers": [
      {
        "userId": "recipientUserId",
        "email": "recipient@example.com"
      }
    ],
    "notifyAll": false
  }
}
```

**Incorrect (resolver flag set but `notificationSource` missing — will NOT route through your data provider):**

```json
{
  "data": {
    "organizationId": "yourOrganizationId",
    "documentId": "yourDocumentId",
    "notificationId": "custom-notif-001",
    "isNotificationResolverUsed": true,
    "notifyUsers": [{ "userId": "recipientUserId" }]
  }
}
```

**Incorrect (resolver mode but templates also included — wastes payload; templates are ignored when the resolver hydrates):**

```bash
{
  "data": {
    "notificationId": "custom-notif-001",
    "isNotificationResolverUsed": true,
    "notificationSource": "custom",
    "displayHeadlineMessageTemplate": "{actionUser} did a thing",
    "displayBodyMessage": "Stored on Velt — defeats the purpose of self-hosting"
  }
}
# Get notifications for a user
POST https://api.velt.dev/v2/notifications/get
{
  "data": {
    "organizationId": "org-123",
    "userId": "user-2",
    "documentId": "doc-456"
  }
}

# Update a notification (e.g., mark as read)
POST https://api.velt.dev/v2/notifications/update
{
  "data": {
    "organizationId": "org-123",
    "notificationId": "notif-1",
    "notification": {
      "isRead": true
    }
  }
}

# Delete notifications
POST https://api.velt.dev/v2/notifications/delete
{
  "data": {
    "organizationId": "org-123",
    "notificationIds": ["notif-1"]
  }
}
# Get notification config
POST https://api.velt.dev/v2/notifications/get-config
{
  "data": {
    "organizationId": "org-123"
  }
}

# Set notification config
POST https://api.velt.dev/v2/notifications/set-config
{
  "data": {
    "organizationId": "org-123",
    "config": {
      "emailNotifications": true,
      "inAppNotifications": true,
      "emailDelay": 300
    }
  }
}
```

Reference: `https://docs.velt.dev/api-reference/rest-api/notifications` (## REST API > ### Notifications)

---

### 2.6 User Management via REST API

**Impact: HIGH (User provisioning and GDPR compliance are critical for production deployments)**

Manage users, access roles, and GDPR data operations. All endpoints are POST with base URL `https://api.velt.dev/v2`.

**Required headers:**

```bash
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN
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

Users can be assigned roles (`viewer` or `editor`) scoped to resource types (`organization`, `document`, or `folder`).
Export or delete all data associated with a user for GDPR compliance.

Reference: `https://docs.velt.dev/api-reference/rest-api/users` (## REST API > ### Users)

---

## 3. Webhooks

**Impact: MEDIUM**

Inbound webhook event handlers for comment events, huddle events, and CRDT updates. Covers v1 webhook setup (basic) and v2 / Svix enterprise webhooks (advanced) with retries, transformations, and signature verification. Payload shape is versioned — never silently upgrade a v1 example to v2 prose.

### 3.1 Webhook v1 Setup and Event Handling

**Impact: HIGH (Webhooks are the primary way to react to collaboration events server-side — missing events means broken workflows)**

Webhooks deliver real-time event notifications from Velt to your server.

### Configuration

Configure webhooks in the Velt Console: **Configurations > Webhook Service**.

1. Enter your webhook endpoint URL.
2. Optionally set an auth token for request verification.
3. Select which event types to receive.

### Comment Events

| Action Type | Trigger |
|------------|---------|
| `newlyAdded` | First comment in a new annotation |
| `added` | Reply added to existing annotation |
| `updated` | Comment text edited |
| `deleted` | Comment deleted |
| `approved` | Comment marked as approved |
| `assigned` | Comment assigned to a user |
| `statusChanged` | Comment status changed (e.g., open to resolved) |
| `priorityChanged` | Comment priority changed |
| `reactionAdded` | Reaction emoji added to a comment |
| `reactionDeleted` | Reaction emoji removed from a comment |

### Huddle Events

| Action Type | Trigger |
|------------|---------|
| `created` | New huddle session started |
| `joined` | User joined an existing huddle |

### CRDT Events

| Action Type | Trigger |
|------------|---------|
| `updateData` | CRDT data changed (5-second debounce) |

### Payload Format

Every webhook POST delivers this structure:

Reference: `https://docs.velt.dev/webhooks/overview` (## Webhooks > ### Setup & Events)

---

### 3.2 Webhook v2 (Enterprise) with Svix

**Impact: MEDIUM (Enterprise webhooks provide reliability guarantees and debugging tools essential for production integrations)**

Velt Webhook v2 is an enterprise feature powered by Svix. It provides multiple endpoints, event filtering, retries, transformations, and a testing playground.

### Key Differences from v1

- Multiple endpoint URLs per organization
- Per-endpoint event type filtering
- Automatic retry with exponential backoff
- JavaScript transformation middleware
- Testing playground for debugging

### Event Types (v2 Format)

v2 uses dot-notation event type names:

| Event Type | Description |
|-----------|-------------|
| `comment_annotation.add` | New comment annotation created |
| `comment.add` | Comment added to annotation |
| `comment.update` | Comment text updated |
| `comment.delete` | Comment deleted |
| `comment_annotation.status_change` | Annotation status changed |
| `comment_annotation.priority_change` | Priority changed |
| `comment.reaction_add` | Reaction added |
| `comment.reaction_delete` | Reaction removed |
| `huddle.create` | Huddle session started |
| `huddle.join` | User joined huddle |
| `crdt.update_data` | CRDT data changed (5s debounce) |

### Retry Schedule

Failed deliveries are retried on this schedule:

1. Immediately
2. 5 seconds
3. 5 minutes
4. 30 minutes
5. 2 hours
6. 5 hours
7. 10 hours
8. 10 hours

After all retries are exhausted, the event is marked as failed. Your endpoint must return a 2xx status code within **15 seconds** or the delivery is considered failed.

### Transformations

Transformations are JavaScript functions that modify the webhook payload before delivery. Configure them per endpoint in the Svix dashboard.

Reference: `https://docs.velt.dev/webhooks/webhook-v2` (## Webhooks > ### Webhook v2 Enterprise)

---

## 4. Debugging

**Impact: LOW-MEDIUM**

Troubleshooting for common backend integration failures — missing or swapped auth headers, expired JWT tokens, wrong endpoint version prefix, webhook signature mismatch, and response-shape drift after API updates.

### 4.1 Troubleshooting Common Backend Integration Issues

**Impact: LOW-MEDIUM (Fast diagnosis of common errors prevents extended debugging sessions)**

### Issue 1: 401 Unauthorized on REST API Calls

**Incorrect:**

```bash
# Missing required headers
curl -X POST https://api.velt.dev/v2/commentannotations/get \
  -H "Content-Type: application/json" \
  -d '{"data": {"organizationId": "org-123", "documentId": "doc-456"}}'
```

**Correct:**

```bash
curl -X POST https://api.velt.dev/v2/commentannotations/get \
  -H "Content-Type: application/json" \
  -H "x-velt-api-key: YOUR_API_KEY" \
  -H "x-velt-auth-token: YOUR_AUTH_TOKEN" \
  -d '{"data": {"organizationId": "org-123", "documentId": "doc-456"}}'
```

**Fix:** Ensure both `x-velt-api-key` and `x-velt-auth-token` headers are present on every request. Get values from Velt Console > Configuration.
**Symptom:** Frontend authentication fails after working initially. Error event `token_expired` fires.
**Cause:** JWT tokens expire after 48 hours.

**Correct (regenerate on expiry):**

```javascript
const veltClient = useVeltClient();

useEffect(() => {
  if (veltClient) {
    veltClient.on("token_expired", async () => {
      const response = await fetch("/api/velt/token", {
        method: "POST",
        body: JSON.stringify({ userId: currentUser.id })
      });
      const { token } = await response.json();
      veltClient.setAuthToken(token);
    });
  }
}, [veltClient]);
```

**Fix:** Listen for the `token_expired` event on the frontend and call your backend to generate a fresh JWT token. Tokens last 48 hours from creation.
**Symptom:** Python SDK operations return an `INVALID_INPUT` error.
**Cause:** Request type imports do not match the operation being performed.

**Incorrect:**

```python
from velt import GetCommentsRequest

# Wrong request type for saving
request = GetCommentsRequest(
    organization_id="org-123",
    document_id="doc-456"
)
sdk.save_comments(request)  # INVALID_INPUT — wrong request type
```

**Correct:**

```python
from velt import SaveCommentsRequest

request = SaveCommentsRequest(
    organization_id="org-123",
    document_id="doc-456",
    comments=[...]
)
sdk.save_comments(request)
```

**Fix:** Verify that the imported request type matches the SDK method. Each method has a corresponding request class: `GetCommentsRequest` for `get_comments()`, `SaveCommentsRequest` for `save_comments()`, etc.
**Symptom:** Your webhook endpoint never receives events.
**Cause:** URL not configured or endpoint not returning 2xx.

**Correct (minimal endpoint that always returns 200):**

```javascript
app.post("/velt/webhook", (req, res) => {
  console.log("Received webhook:", JSON.stringify(req.body));
  res.status(200).send("OK");
});
```

**Symptom:** Attachment uploads fail or return permission errors.
**Cause:** AWS credentials in SDK config are invalid or missing required S3 permissions.

**Correct (S3 config with env vars):**

```python
from velt import S3Config

s3 = S3Config(
    region=os.environ["AWS_REGION"],
    access_key=os.environ["AWS_ACCESS_KEY_ID"],
    secret_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    bucket=os.environ["VELT_S3_BUCKET"]
)
```

Reference: `https://docs.velt.dev/api-reference/rest-api/overview` (## REST API > ### Authentication & Troubleshooting)

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/api-reference/rest-apis/v2
- https://docs.velt.dev/security/jwt-tokens
- https://docs.velt.dev/webhooks/basic
- https://docs.velt.dev/webhooks/advanced
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/get-comment-annotations-v2
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/get-comments
- https://console.velt.dev
- https://docs.velt.dev/api-reference/rest-apis/v2/notifications/add-notifications
