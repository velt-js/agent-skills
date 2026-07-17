# Velt Rest Apis Best Practices

**Version 1.0.8**  
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
   - 2.5 [Manage Advanced Webhooks via REST API](#25-manage-advanced-webhooks-via-rest-api)
   - 2.6 [Manage agents, executions, versions, and groups through the Agents REST API](#26-manage-agents-executions-versions-and-groups-through-the-agents-rest-api)
   - 2.7 [Notification Management via REST API](#27-notification-management-via-rest-api)
   - 2.8 [Use Memory REST APIs for judgments, knowledge, alerts, and suggestions](#28-use-memory-rest-apis-for-judgments-knowledge-alerts-and-suggestions)
   - 2.9 [User Management via REST API](#29-user-management-via-rest-api)

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

Every Velt REST API v2 call requires two authentication headers. Without both, the request will be rejected. The header *pair* depends on the endpoint's scope — api-key-level vs. workspace-level. Sending the wrong pair fails with a 401, even if both headers are present.

**API-key-level endpoints (most of the v2 surface — `/organizations/*`, `/users/*`, `/comments/*`, `/notifications/*`, `/workspace/add-domain`, `/workspace/emailconfig-update`, etc.):**

- `x-velt-api-key` — Your API key from the Velt console
- `x-velt-auth-token` — Auth token from Velt console (Configuration > Auth Token), or retrieved via `POST https://api.velt.dev/v2/workspace/authtokens-get`

**Incorrect (api-key-level endpoint, missing auth token header):**

```bash
curl -X POST https://api.velt.dev/v2/organizations/get \
  -H 'Content-Type: application/json' \
  -H 'x-velt-api-key: your_api_key' \
  -d '{"data": {"organizationId": "org_123"}}'
```

**Correct (api-key-level endpoint, curl with both headers):**

```bash
curl -X POST https://api.velt.dev/v2/organizations/get \
  -H 'Content-Type: application/json' \
  -H 'x-velt-api-key: your_api_key' \
  -H 'x-velt-auth-token: your_auth_token' \
  -d '{"data": {"organizationId": "org_123"}}'
```

**Incorrect (workspace-level endpoint called with the api-key-level pair):**

```bash
curl -X POST https://api.velt.dev/v2/workspace/get \
  -H 'Content-Type: application/json' \
  -H 'x-velt-api-key: your_api_key' \
  -H 'x-velt-auth-token: your_auth_token' \
  -d '{"data": {}}'
```

**Correct (workspace-level endpoint with workspace-id + workspace-auth-token):**

```bash
curl -X POST https://api.velt.dev/v2/workspace/get \
  -H 'Content-Type: application/json' \
  -H 'x-velt-workspace-id: workspace_abc123' \
  -H 'x-velt-workspace-auth-token: your_workspace_auth_token' \
  -d '{"data": {}}'
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

CRUD patterns for the Velt REST API v2 surface — comment annotations and comments, notifications and notification config, users (add / get / update / delete plus GDPR data operations), documents / organizations / folders, activity logs / CRDT documents, agent execution listing, Memory judgments / knowledge / alerts, and the Approval Engine pointer. All endpoints are POST and use the `https://api.velt.dev/v2` base URL; endpoint identity is verbatim (path and version prefix matter). Includes request and response shape guidance, including the GET response envelope (annotation-level fields, expanded `reactionAnnotations` objects vs. `reactionAnnotationIds`, timestamp formats), idempotency guidance, and webhook signature verification patterns.

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

**Required fields inside `agent`:**

```bash
{
  "agent": {
    "agentSource": "external",
    "agentName": "Accessibility Bot",
    "reason": {
      "title": "Low color contrast",
      "description": "Contrast ratio is 2.1:1, below the 4.5:1 WCAG AA threshold.",
      "severity": "high"
    }
  }
}
POST https://api.velt.dev/v2/commentannotations/add

{
  "data": {
    "organizationId": "acme-corp",
    "documentId": "design-mockup-v2",
    "commentAnnotations": [
      {
        "type": "suggestion",
        "commentData": [
          {
            "commentText": "This button has insufficient color contrast.",
            "from": { "userId": "a11y-bot" },
            "agent": {
              "agentSource": "external",
              "agentId": "a11y-bot",
              "agentName": "Accessibility Bot",
              "reason": {
                "title": "Low color contrast",
                "description": "Contrast ratio is 2.1:1, below the 4.5:1 WCAG AA threshold.",
                "severity": "high",
                "findingType": "pin"
              }
            }
          }
        ]
      }
    ]
  }
}
POST https://api.velt.dev/v2/commentannotations/comments/add

{
  "data": {
    "organizationId": "yourOrganizationId",
    "documentId": "yourDocumentId",
    "annotationId": "yourAnnotationId",
    "commentData": [
      {
        "commentText": "I fixed the spelling. Please re-review.",
        "from": { "userId": "spell-check", "name": "Spell Check Agent" },
        "agent": {
          "agentSource": "velt",
          "agentId": "spell-check",
          "executionId": "exec_124",
          "reason": {
            "title": "Spelling corrected",
            "description": "Updated 'Welcom' to 'Welcome'.",
            "severity": "info",
            "findingType": "text"
          }
        }
      }
    ]
  }
}
```

**Correct:** Supply `agentId` on every agent block. For `external`, also supply `agentName`:
For a Velt built-in or verified custom agent, drop `agentName` and set `agentSource: "velt"`:

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

### 2.5 Manage Advanced Webhooks via REST API

**Impact: MEDIUM (Programmatically enable advanced webhooks and manage delivery endpoints, signing secrets, and per-endpoint event/channel filters)**

Advanced Webhooks add multiple delivery endpoints, per-endpoint event/channel filtering, rate limiting, and signed payloads on top of basic webhooks. These management endpoints live under `https://api.velt.dev/v2/workspace/` — all are POST, all use **API-key-level auth** (both `x-velt-api-key` and `x-velt-auth-token` headers), and all wrap the payload in `{ "data": { ... } }`. This rule covers *managing* advanced webhooks; for receiving and verifying the delivered events, see `webhooks-advanced` (Svix).

**Required headers (every request):**

```bash
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN
# Get config (no body params required)
POST https://api.velt.dev/v2/workspace/advancedwebhookconfig/get
{ "data": {} }
# → data: { isEnabled, encryptData, encodeData, publicKey, enableDataProtection }

# Update config (partial; at least one field required; first call must set isEnabled:true)
POST https://api.velt.dev/v2/workspace/advancedwebhookconfig/update
{ "data": { "isEnabled": true, "encryptData": false, "encodeData": false } }
# Create an endpoint — url is required and must be a valid http(s) URL.
# The signing secret is ALWAYS generated server-side; never pass it in the request.
POST https://api.velt.dev/v2/workspace/advancedwebhook/endpoints/create
{ "data": {
    "url": "https://example.com/webhooks/velt",
    "description": "Primary endpoint",
    "filterTypes": ["comment.add", "comment.update"],   // optional; non-empty when provided; omit = all events
    "channels": ["channel-a"],                            // optional; non-empty when provided; omit = all channels
    "disabled": false,                                    // optional; default false
    "rateLimit": 10,                                      // optional; max deliveries/sec (positive integer)
    "uid": "my-endpoint-1",                               // optional caller-assigned id
    "metadata": { "team": "platform" }                   // optional string-valued key/value pairs
} }
# → data: { id: "ep_...", url, description, filterTypes, channels, disabled, rateLimit, uid, createdAt, updatedAt }

# List endpoints — paginated via opaque iterator cursor (limit 1–250)
POST https://api.velt.dev/v2/workspace/advancedwebhook/endpoints/get
{ "data": { "limit": 50, "iterator": "" } }
# → data: { endpoints: [...], iterator, prevIterator, done }
# When done === false, pass the returned iterator to fetch the next page.

# Update an endpoint — endpointId required; at least one other field; partial (omitted fields unchanged)
POST https://api.velt.dev/v2/workspace/advancedwebhook/endpoints/update
{ "data": { "endpointId": "ep_...", "description": "Updated", "disabled": false } }

# Delete an endpoint — permanent; immediately stops deliveries and invalidates the signing secret
POST https://api.velt.dev/v2/workspace/advancedwebhook/endpoints/delete
{ "data": { "endpointId": "ep_..." } }
# → data: { endpointId, deleted: true }
POST https://api.velt.dev/v2/workspace/advancedwebhook/endpoints/secret/get
{ "data": { "endpointId": "ep_..." } }
# → data: { endpointId, secret: "whsec_..." }
```

**Response envelope:** success responses return `{ "result": { "status": "success", "message", "data" } }`; failures return `{ "error": { "status", "message" } }` where `status` is one of `INVALID_ARGUMENT`, `FAILED_PRECONDITION`, or `NOT_FOUND`.
Advanced webhooks must be provisioned before any endpoint can be created. The **first** `update` call must include `isEnabled: true` — this provisions the underlying webhook application. Until then, the endpoint-management APIs return `FAILED_PRECONDITION`.
If advanced webhooks are not available for the workspace at all, `advancedwebhookconfig/get` returns `FAILED_PRECONDITION` ("Advanced webhooks are not available for this workspace.") — contact Velt to enable the feature.
All four endpoint operations require advanced webhooks to already be enabled (else `FAILED_PRECONDITION`).
The signing secret is generated at creation and fetched separately. Use it to verify the signature on delivered webhook payloads (see `webhooks-advanced`). Treat it like a credential.

**Incorrect (creating an endpoint before enabling advanced webhooks, or trying to supply your own secret):**

```bash
# BUG 1: no prior advancedwebhookconfig/update with { isEnabled: true } →
#         { "error": { "status": "FAILED_PRECONDITION", "message": "Advanced webhooks are disabled for this workspace..." } }
# BUG 2: "secret" is ignored — the signing secret is always server-generated and only readable via endpoints/secret/get.
POST https://api.velt.dev/v2/workspace/advancedwebhook/endpoints/create
{ "data": { "url": "https://example.com/webhooks/velt", "secret": "whsec_mine" } }
```

**Correct (enable once, then create the endpoint and read back the generated secret):**

```bash
# 1) Enable advanced webhooks for the workspace (first call must set isEnabled:true)
POST https://api.velt.dev/v2/workspace/advancedwebhookconfig/update
{ "data": { "isEnabled": true } }

# 2) Create the delivery endpoint
POST https://api.velt.dev/v2/workspace/advancedwebhook/endpoints/create
{ "data": { "url": "https://example.com/webhooks/velt", "filterTypes": ["comment.add"] } }
# → data.id = "ep_..."

# 3) Fetch the server-generated signing secret to verify payloads
POST https://api.velt.dev/v2/workspace/advancedwebhook/endpoints/secret/get
{ "data": { "endpointId": "ep_..." } }
# → data.secret = "whsec_..."
```

---

### 2.6 Manage agents, executions, versions, and groups through the Agents REST API

**Impact: HIGH (Full lifecycle control over custom agents (CRUD + versioning), async executions with polling, and group-based fan-out; misuse either invents versions or leaks per-URL results behind the wrong endpoint)**

Use the `/v2/agents/*` REST API family to author custom agents, run and poll executions, walk version history, and manage groups. All endpoints are `POST`, use the standard `https://api.velt.dev/v2` base URL, and require both `x-velt-api-key` and `x-velt-auth-token` headers. Endpoint identity is verbatim — the `/v2/` prefix and the exact path segments matter and are part of the URL.

**Incorrect (fetching per-URL results via the list endpoint, or omitting the poll loop):**

```bash
# Wrong: /v2/agents/execution/list never returns the per-URL findings subcollection,
# and calling it right after /v2/agents/execution/run can return an incomplete run.
POST https://api.velt.dev/v2/agents/execution/list
{ "data": { "agentId": "abc123def456" } }
```

**Correct (start an async execution, poll Get Execution until status leaves `"running"`):**

```bash
POST https://api.velt.dev/v2/agents/execution/run
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{
  "data": {
    "agentId": "abc123def456",
    "url": "https://example.com/pricing",
    "organizationId": "org_001",
    "documentId": "doc_001",
    "ranBy": { "userId": "user_123" }
  }
}

# Response: { "result": { "data": { "executionId": "exec_..." } } }

POST https://api.velt.dev/v2/agents/execution/get
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{
  "data": {
    "executionId": "exec_1711900000000_abc123def456",
    "includeResults": true
  }
}
POST https://api.velt.dev/v2/agents/create
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{
  "data": {
    "name": "Brand Consistency Checker",
    "instructions": "Check that all headings use the brand font 'Inter'.",
    "contextGathering": { "strategies": ["web-page-text", "web-page-html"] },
    "execution": { "executionStrategy": "ai" }
  }
}
# → { "result": { "data": { "agentId": "abc123def456" } } }

POST https://api.velt.dev/v2/agents/execution/run
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{
  "data": {
    "agentId": "abc123def456",
    "url": "https://example.com",
    "crossPageExecute": true,
    "maxUrlsToProcess": 25,
    "organizationId": "org_001",
    "documentId": "doc_001"
  }
}

POST https://api.velt.dev/v2/agents/version/update
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{
  "data": {
    "agentId": "abc123def456",
    "instructions": "Check headings use 'Inter' font. Verify #1A73E8 on all CTAs and links."
  }
}
# → { "result": { "data": { "version": 4 } } }

POST https://api.velt.dev/v2/agents/versions/restore
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{ "data": { "agentId": "abc123def456" } }
# → { "result": { "data": { "version": 3 } } }
# 1. All executions of one agent across the workspace.
POST https://api.velt.dev/v2/agents/execution/list
{ "data": { "agentId": "abc123def456", "pageSize": 20 } }

# 2. All executions on one document (any agent).
POST https://api.velt.dev/v2/agents/execution/list
{ "data": { "organizationId": "org_001", "documentId": "doc_001" } }

# 3. All three narrows a single agent to a single document.
POST https://api.velt.dev/v2/agents/execution/list
{
  "data": {
    "agentId": "abc123def456",
    "organizationId": "org_001",
    "documentId": "doc_001",
    "pageSize": 50
  }
}
POST https://api.velt.dev/v2/agents/execution/count
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{
  "data": {
    "agentIds": ["abc123def456", "spell-check"],
    "status": "running"
  }
}
# → { "result": { "data": { "counts": { "abc123def456": 2, "spell-check": 0 } } } }
# Create a group with initial members and immutable metadata.
POST https://api.velt.dev/v2/agents/groups/create
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{
  "data": {
    "name": "Brand QA",
    "description": "All brand-quality agents",
    "agentIds": ["abc123def456", "spell-check"],
    "metadata": { "clientOrganizationId": "org_001" }
  }
}

# Membership changes go through add-agents / remove-agents, never through /update.
POST https://api.velt.dev/v2/agents/groups/add-agents
{ "data": { "groupId": "grp_9f3ac2", "agentIds": ["xyz789ghi012"] } }

POST https://api.velt.dev/v2/agents/groups/remove-agents
{ "data": { "groupId": "grp_9f3ac2", "agentIds": ["spell-check"] } }

# Filter an agent list to a group's members.
POST https://api.velt.dev/v2/agents/get
{ "data": { "groupId": "grp_9f3ac2" } }
# 1. Check whether a raw prompt is specific enough.
POST https://api.velt.dev/v2/agents/prompt/enhance
{ "data": { "prompt": "Check that the page uses our brand colors" } }
# → { "enhancedPrompt": { "requirement": "Please specify which brand colors..." } }

# 2. Expand a simple instruction into a structured task.
POST https://api.velt.dev/v2/agents/prompt/validate
{ "data": { "prompt": "Make sure there are no broken links on the page" } }
# → { "validationResult": { "analysis_prompt": "## Objective\n...", "demos": { ... } } }

# 3. Iterate the analysis prompt against demo failures.
POST https://api.velt.dev/v2/agents/prompt/refine
{
  "data": {
    "analysisPrompt": "## Objective\nIdentify all broken links...",
    "demoFeedback": [
      {
        "demoId": "demo-1",
        "demoTitle": "Mailto link with malformed address",
        "demoHtml": "<a href=\"mailto:invalid email@\">Email us</a>",
        "demoExpected": "detected",
        "feedback": "Malformed mailto links should also count as broken."
      }
    ]
  }
}

# 4. Recommend contextGathering / execution strategies for the final instructions.
POST https://api.velt.dev/v2/agents/config/resolve
{ "data": { "instructions": "Verify all CTAs use the primary brand color #1A73E8." } }
# → { "resolvedConfig": { "extraction_strategies": [...], "execution_strategy": "ai" } }
POST https://api.velt.dev/v2/agents/extract
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{
  "data": {
    "fileBase64": "QWdlbnQgTmFtZSxEZXNjcmlwdGlvbixJbnN0cnVjdGlvbnMK...",
    "mimeType": "text/csv",
    "fileName": "qa-checklist.csv"
  }
}
POST https://api.velt.dev/v2/agents/analytics/get
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{ "data": { "agentId": "abc123def456", "year": "2026", "month": "03" } }
```

Poll `/v2/agents/execution/get` until `execution.status !== "running"`. Only this endpoint returns the per-URL `results` subcollection (when `includeResults: true`); `/v2/agents/execution/list` never does.
| Group | Endpoints | Notes |
|-------|-----------|-------|
| Agent CRUD | `/v2/agents/create`, `/v2/agents/get`, `/v2/agents/update`, `/v2/agents/delete` | `create` writes version 1 automatically. `update` edits identity only (`name`, `description`, `enabled`); behavioral changes use `/v2/agents/version/update`. `get` returns a single agent when `agentId` is provided, otherwise a list; `filter` and `groupId` narrow the list. |
| Executions | `/v2/agents/execution/run`, `/v2/agents/execution/get`, `/v2/agents/execution/list`, `/v2/agents/execution/count` | `run` is async — the response returns `executionId` immediately; poll `get` until `status !== "running"`. `get` is the only way to read the per-URL `results` subcollection (`includeResults: true`); `list` and `count` never include results. `list` accepts exactly three filter shapes: `{ agentId }`, `{ organizationId, documentId }`, or all three. |
| Versioning | `/v2/agents/version/update`, `/v2/agents/versions/list`, `/v2/agents/versions/restore` | Every behavioral edit creates a new version N+1. `versions/list` returns snapshots newest-first with secrets redacted. `versions/restore` is a single-step undo that walks back to N-1 and cannot go below version 1. |
| Prompt authoring | `/v2/agents/prompt/enhance`, `/v2/agents/prompt/validate`, `/v2/agents/prompt/refine`, `/v2/agents/config/resolve`, `/v2/agents/extract` | `enhance` checks a prompt for missing context (returns a clarification `requirement` or `null`). `validate` expands a one-line instruction into a structured task. `refine` iterates a prompt against demo failures. `config/resolve` recommends `contextGathering.strategies` and `execution.executionStrategy`. `extract` parses a CSV/PDF/XLSX file into agent configs ready for `/v2/agents/create`. |
| Groups | `/v2/agents/groups/create`, `get`, `list`, `update`, `delete`, `add-agents`, `remove-agents` | Groups bundle custom and built-in agents (max 100 members per group, max 50 groups per workspace). `update` only edits `name`/`description` — `metadata` is immutable after creation and membership uses `add-agents` / `remove-agents`. `list` strips `agentIds` and returns `agentCount` per row; call `get` for the full membership. |
| Analytics | `/v2/agents/analytics/get` | Per-agent, per-model, per-month token usage and execution counts. Omit `agentId` for a workspace-wide aggregate. Model keys are sanitised as `provider_model`. |
Create → run → check results → edit behavior (new version) → roll back if needed:
Server-managed fields (`id`, `version`, `createdAt`, `updatedAt`, `managedBy`, `metadata.type`, `metadata.category`, `metadata.internal`, `metadata.apiKey`) are rejected with `INVALID_ARGUMENT` if sent on `/v2/agents/create` or `/v2/agents/version/update`. Auth secrets in `contextGathering.strategyOptions["rest-api"]` and `execution.mcpServers[].auth` are encrypted at rest and returned as `"__redacted__"` on `get` / `versions/list`; rotate by sending the new plaintext, keep by omitting the field.
`/v2/agents/execution/list` rejects every filter combination outside this whitelist:
Pagination continues via `pageToken = data.nextPageToken`; the `nextPageToken` key is omitted entirely (not `null`) when the result set is exhausted. `pageSize` is `1..100` (default 20).
`agentIds` accepts a single string or an array of 1–200 ids. Failed per-agent counts return the integer sentinel `-1` (not `null`); unknown agent ids return `0`. Omit `agentIds` for a single workspace-wide `total`.
`add-agents` and `remove-agents` are idempotent (`arrayUnion` / `arrayRemove`); re-adding a member or removing a non-member is a silent success. The membership cap of 100 is enforced atomically. Deleting a group (`/v2/agents/groups/delete`) removes the group document only — member agents are untouched.
`/v2/agents/prompt/*` and `/v2/agents/config/resolve` are pure design tools — they do not create or modify agents:
`/v2/agents/extract` bulk-imports an existing checklist (CSV / PDF / XLSX / plain text) into a list of agent configs that can be passed straight into `/v2/agents/create`:
Response `analytics.tokenUsage` is broken down by `allTime`, `yearly[year][provider_model]`, `monthly[month][provider_model]`, and `byModel[provider_model]`. `year` must match `^\d{4}$`; `month` must match `^(0[1-9]|1[0-2])$`.

---

### 2.7 Notification Management via REST API

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

### 2.8 Use Memory REST APIs for judgments, knowledge, alerts, and suggestions

**Impact: HIGH (Memory endpoints provide grounded search and knowledge workflows; wrong retrieval mode or ingest path creates misleading AI results)**

Use the `/v2/memory/*` REST API family for grounded review memory: semantic search over judgments, Q&A and decision suggestions, knowledge ingestion/search, profile/pattern/stat insights, and proactive alerts. These endpoints use the standard REST envelope and the same `x-velt-api-key` / `x-velt-auth-token` headers as the rest of v2.

**Incorrect (treating Memory as a chat completion endpoint):**

```bash
# Do not invent an answer when Memory has no grounding context.
POST https://api.velt.dev/v2/memory/ask
{ "data": { "question": "What policy do we follow for medical claims?" } }
```

**Correct (handle empty grounded results explicitly):**

```bash
POST https://api.velt.dev/v2/memory/ask
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{
  "data": {
    "question": "What policy do we follow for medical claims?",
    "organizationId": "org_123"
  }
}
```

If retrieval finds no relevant context, `answer` is an empty string with `confidence: 0`. Treat that as "Memory has nothing to say yet", not as a model failure to patch over.
| Group | Endpoints | Notes |
|-------|-----------|-------|
| Judgments | `/v2/memory/search`, `/v2/memory/judgments/query` | `search` is semantic; `judgments/query` is structured listing. `filters.annotationId` requires `organizationId`. |
| Q&A and decisions | `/v2/memory/ask`, `/v2/memory/suggest` | `ask` returns grounded answers with citations; `suggest` returns `primary` and optional `conflict` recommendations. |
| Knowledge | `/v2/memory/knowledge/ingest`, `upload-url`, `ingest-status`, `update`, `delete`, `search`, `list`, `download`, `rules` | Ingestion is async. Inline files are up to 5 MB decoded; by-reference files use `upload-url` and support up to 30 MB. |
| Insights | `/v2/memory/profiles/get`, `/v2/memory/patterns/get`, `/v2/memory/stats/get` | Derived reviewer/profile/pattern/stat views over remembered judgments. |
| Alerts | `/v2/memory/alerts/list`, `dismiss`, `action`, `config/get`, `config/update` | Alerts are proactive signals; list is capped at 50 active alerts. |

**Knowledge ingest pattern:**

```bash
# Inline file, up to 5 MB decoded.
POST https://api.velt.dev/v2/memory/knowledge/ingest
{
  "data": {
    "source": "inline",
    "file": {
      "base64": "JVBERi0xLjQK...",
      "mimeType": "application/pdf",
      "fileName": "brand-guidelines.pdf",
      "fileSize": 184320
    },
    "organizationId": "org_123"
  }
}

# Poll until terminal.
POST https://api.velt.dev/v2/memory/knowledge/ingest-status
{ "data": { "sourceId": "source_123" } }
```

**Search pattern:**

```bash
POST https://api.velt.dev/v2/memory/search
{
  "data": {
    "query": "marketing copy with unsupported medical claims",
    "scope": "organization",
    "organizationId": "org_123",
    "limit": 5,
    "filters": { "decision": "reject" }
  }
}
```

---

### 2.9 User Management via REST API

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
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/create
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/advancedwebhookconfig-update
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/execution/list
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/alerts/action
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/alerts/config/get
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/alerts/config/update
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/alerts/dismiss
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/alerts/list
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/ask
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/judgments/query
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/delete
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/download
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/ingest-status
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/ingest
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/list
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/rules
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/search
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/update
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/upload-url
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/patterns/get
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/profiles/get
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/search
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/stats/get
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/suggest
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/apikey-create
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/create
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/get
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/update
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/delete
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/extract
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/execution/run
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/execution/get
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/execution/count
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/config/resolve
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/analytics/get
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/prompt/enhance
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/prompt/validate
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/prompt/refine
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/version/update
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/versions/list
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/versions/restore
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/create
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/get
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/list
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/update
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/delete
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/add-agents
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/remove-agents
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/add-comment-annotations
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/add-comments
