# Velt REST APIs Best Practices — Full Reference

Compiled verbose guide with all 9 rules expanded inline. For Python SDK (velt-py) rules, see velt-self-hosting-data-best-practices.
All Velt REST API v2 calls require: `x-velt-api-key` + `x-velt-auth-token` headers. Base URL: `https://api.velt.dev/v2`. All endpoints use POST.

---

## Table of Contents

1. [Core Setup (CRITICAL)](#1-core-setup--critical)
2. [Python SDK (HIGH-MEDIUM)](#2-python-sdk--high-medium)
3. [REST API (HIGH-MEDIUM)](#3-rest-api--high-medium)
4. [Webhooks (HIGH-MEDIUM)](#4-webhooks--high-medium)
5. [Debugging (LOW-MEDIUM)](#5-debugging--low-medium)

---

## 1. Core Setup — CRITICAL

### 1.1 Install and Initialize the Velt Python SDK

The `velt-py` package provides server-side access to Velt collaboration features. It requires a MongoDB connection for data storage and optionally supports S3 for attachments.

```bash
pip install velt-py
```

**Incorrect (missing required MongoDB config):**

```python
from velt import VeltSdk, VeltSdkConfig

config = VeltSdkConfig(
    api_key="your_api_key",
    auth_token="your_auth_token"
)
# Missing MongoDB — SDK will fail
```

**Correct (minimal init with connection string):**

```python
import os
from velt import VeltSdk, VeltSdkConfig, MongoDBConfig

config = VeltSdkConfig(
    api_key=os.environ["VELT_API_KEY"],
    auth_token=os.environ["VELT_AUTH_TOKEN"],
    mongodb=MongoDBConfig(
        connection_string=os.environ["MONGODB_URI"]
    )
)
sdk = VeltSdk(config)
```

**Correct (full config with individual MongoDB fields and S3):**

```python
import os
from velt import VeltSdk, VeltSdkConfig, MongoDBConfig, S3Config

config = VeltSdkConfig(
    api_key=os.environ["VELT_API_KEY"],
    auth_token=os.environ["VELT_AUTH_TOKEN"],
    mongodb=MongoDBConfig(
        host="cluster.mongodb.net",
        username=os.environ["DB_USER"],
        password=os.environ["DB_PASS"],
        auth_database="admin",
        database_name="velt_db"
    ),
    s3=S3Config(
        region="us-east-1",
        access_key=os.environ["AWS_ACCESS_KEY_ID"],
        secret_key=os.environ["AWS_SECRET_ACCESS_KEY"],
        bucket="velt-attachments"
    )
)
sdk = VeltSdk(config)
```

**Key points:**
- MongoDB accepts `connection_string` OR individual fields (`host`, `username`, `password`, `auth_database`, `database_name`) — never both.
- S3 config only required for attachment features.
- Store credentials in environment variables, never hardcode them.
- API key and auth token come from Velt Console > Configuration.

**Verification:**
- [ ] `velt-py` is installed and importable
- [ ] MongoDB connection string or individual fields are provided
- [ ] API key and auth token are set from Velt console
- [ ] Credentials are loaded from environment variables
- [ ] S3 config is included if attachment features are needed

**Source:** `https://docs.velt.dev/api-reference/sdk/python/overview`

---

### 1.2 REST API Authentication

Every Velt REST API v2 call requires two authentication headers. Without both, the request will be rejected with 401.

**Required headers for ALL endpoints:**
- `x-velt-api-key` — Your API key from the Velt console
- `x-velt-auth-token` — Auth token from Velt console (Configuration > Auth Token)

**Base URL:** `https://api.velt.dev/v2`

**All endpoints use POST method** — even for read and delete operations.

**Incorrect (missing auth token, using GET):**

```javascript
const response = await fetch('https://api.velt.dev/v2/organizations/get', {
  method: 'GET',
  headers: { 'x-velt-api-key': 'your_api_key' }
});
```

**Correct (JavaScript fetch with POST and both headers):**

```javascript
const response = await fetch('https://api.velt.dev/v2/organizations/get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN
  },
  body: JSON.stringify({
    data: { organizationId: 'org_123' }
  })
});
const result = await response.json();
```

**Correct (curl):**

```bash
curl -X POST https://api.velt.dev/v2/organizations/get \
  -H 'Content-Type: application/json' \
  -H 'x-velt-api-key: your_api_key' \
  -H 'x-velt-auth-token: your_auth_token' \
  -d '{"data": {"organizationId": "org_123"}}'
```

**Key points:**
- Both headers must be present on every request — omitting either causes a 401.
- The auth token is separate from JWT tokens used for frontend user authentication.
- Request bodies use a `{ data: { ... } }` wrapper format.
- Never expose `x-velt-auth-token` in client-side code; make API calls from your server only.

**Verification:**
- [ ] Both `x-velt-api-key` and `x-velt-auth-token` headers are set
- [ ] Request method is POST
- [ ] Base URL is `https://api.velt.dev/v2`
- [ ] Auth token is kept server-side only
- [ ] Request body uses the `{ data: { ... } }` wrapper format

**Source:** `https://docs.velt.dev/api-reference/rest-apis/overview`

---

### 1.3 JWT Token Generation

JWT tokens authenticate frontend users with the Velt SDK. Generate them server-side to keep your auth token secret. Tokens expire after 48 hours.

**Endpoint:** `POST https://api.velt.dev/v2/auth/token/get`

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
  return NextResponse.json({ token: result.result.data.token });
}
```

**Frontend token usage and refresh:**

```typescript
const res = await fetch('/api/velt-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: currentUser.id })
});
const { token } = await res.json();

await client.identify(user, { authToken: token });

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

**Key points:**
- `authToken` in the request body is your Velt console auth token (same as the header value).
- `userProperties.isAdmin` controls admin privileges in Velt features.
- Tokens expire in 48 hours. Frontend SDK emits `token_expired` event.
- Response path: `result.result.data.token`.

**Verification:**
- [ ] JWT token generation runs server-side only
- [ ] `VELT_AUTH_TOKEN` is stored in environment variables
- [ ] Response is parsed correctly: `result.result.data.token`
- [ ] Token expiration handling is implemented on the frontend

**Source:** `https://docs.velt.dev/api-reference/rest-apis/auth/get-token`

---

## 2. Python SDK — HIGH-MEDIUM

### 2.1 Comments CRUD

Each method requires its own typed request object. Do not pass raw dictionaries.

```python
from velt import GetCommentResolverRequest, SaveCommentResolverRequest, DeleteCommentResolverRequest

# Get comments
request = GetCommentResolverRequest(
    organization_id="org_123",
    document_id="doc_456"
)
response = sdk.selfHosting.comments.getComments(request)
if response.success:
    comments = response.data
    print(f"Retrieved {len(comments)} comments")
else:
    print(f"Error {response.error_code}: {response.error}")

# Save comments (batch)
request = SaveCommentResolverRequest(
    organization_id="org_123",
    document_id="doc_456",
    comments=[
        {"commentId": "c1", "body": "Review this", "userId": "u1", "timestamp": 1700000000000}
    ]
)
response = sdk.selfHosting.comments.saveComments(request)

# Delete a comment
request = DeleteCommentResolverRequest(
    organization_id="org_123",
    document_id="doc_456",
    comment_id="c1"
)
response = sdk.selfHosting.comments.deleteComment(request)
```

**Verification:**
- [ ] Typed request objects used, not raw dicts
- [ ] `organization_id` and `document_id` provided
- [ ] `response.success` checked before accessing `response.data`

**Source:** `https://docs.velt.dev/api-reference/sdk/python/comments`

---

### 2.2 Attachments (S3 Required)

S3 config must be provided at SDK init time. Without it, all attachment operations fail.

```python
from velt import SaveAttachmentResolverRequest, DeleteAttachmentResolverRequest

# Upload
with open("report.pdf", "rb") as f:
    file_data = f.read()

response = sdk.selfHosting.attachments.saveAttachment(
    SaveAttachmentResolverRequest(
        organization_id="org_123",
        document_id="doc_456",
        comment_id="c1"
    ),
    file_data=file_data,
    file_name="report.pdf",
    mime_type="application/pdf"
)
if response.success:
    attachment_url = response.data

# Delete
response = sdk.selfHosting.attachments.deleteAttachment(
    DeleteAttachmentResolverRequest(
        organization_id="org_123",
        document_id="doc_456",
        comment_id="c1",
        attachment_id="a1"
    )
)
```

**Key points:**
- `saveAttachment` takes request object + `file_data` (bytes), `file_name`, `mime_type`.
- File data must be read as bytes (`"rb"` mode).
- IAM needs `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`.

**Source:** `https://docs.velt.dev/api-reference/sdk/python/attachments`

---

### 2.3 Users and Reactions

```python
from velt import (
    GetUserResolverRequest, GetReactionResolverRequest,
    SaveReactionResolverRequest, DeleteReactionResolverRequest
)

# Get users
response = sdk.selfHosting.users.getUsers(
    GetUserResolverRequest(organization_id="org_123")
)

# Get reactions
response = sdk.selfHosting.reactions.getReactions(
    GetReactionResolverRequest(
        organization_id="org_123", document_id="doc_456", comment_id="c1"
    )
)

# Save reactions (batch)
sdk.selfHosting.reactions.saveReactions(
    SaveReactionResolverRequest(
        organization_id="org_123", document_id="doc_456", comment_id="c1",
        reactions=[{"reactionId": "r1", "emoji": "thumbsup", "userId": "u1", "timestamp": 1700000000000}]
    )
)

# Delete reaction
sdk.selfHosting.reactions.deleteReaction(
    DeleteReactionResolverRequest(
        organization_id="org_123", document_id="doc_456", comment_id="c1", reaction_id="r1"
    )
)
```

**Source:** `https://docs.velt.dev/api-reference/sdk/python/users`

---

### 2.4 Framework Integration

Initialize SDK once at startup, not per-request. Reinitializing creates unnecessary MongoDB connections.

**Django — Init in apps.py, use in views.py:**

```python
# myapp/apps.py
class MyAppConfig(AppConfig):
    name = 'myapp'
    velt_sdk = None

    def ready(self):
        MyAppConfig.velt_sdk = VeltSdk(VeltSdkConfig(
            api_key=os.environ["VELT_API_KEY"],
            auth_token=os.environ["VELT_AUTH_TOKEN"],
            mongodb=MongoDBConfig(connection_string=os.environ["MONGODB_URI"])
        ))

# myapp/views.py
@csrf_exempt
def get_comments(request):
    body = json.loads(request.body)
    sdk = MyAppConfig.velt_sdk
    response = sdk.selfHosting.comments.getComments(
        GetCommentResolverRequest(organization_id=body["organizationId"], document_id=body["documentId"])
    )
    if response.success:
        return JsonResponse({"data": response.data})
    return JsonResponse({"error": response.error}, status=response.error_code)
```

**Flask:**

```python
sdk = VeltSdk(VeltSdkConfig(
    api_key=os.environ["VELT_API_KEY"], auth_token=os.environ["VELT_AUTH_TOKEN"],
    mongodb=MongoDBConfig(connection_string=os.environ["MONGODB_URI"])
))

@app.route("/api/comments/get", methods=["POST"])
def get_comments():
    body = request.json
    response = sdk.selfHosting.comments.getComments(
        GetCommentResolverRequest(organization_id=body["organizationId"], document_id=body["documentId"]))
    return jsonify({"data": response.data}) if response.success else (jsonify({"error": response.error}), response.error_code)
```

**FastAPI:**

```python
@app.post("/api/comments/get")
async def get_comments(req: Request):
    body = await req.json()
    response = sdk.selfHosting.comments.getComments(
        GetCommentResolverRequest(organization_id=body["organizationId"], document_id=body["documentId"]))
    return {"data": response.data} if response.success else {"error": response.error}
```

**Key points:**
- Django requires `@csrf_exempt` on Velt endpoints.
- Django SDK init goes in `AppConfig.ready()`.
- All frameworks should load credentials from environment variables.

**Source:** `https://docs.velt.dev/api-reference/sdk/python/overview`

---

## 3. REST API — HIGH-MEDIUM

### 3.1 Comment Annotations + Comments

Comment annotations are the containers; comments are individual messages within them.

```bash
# Add annotation
POST https://api.velt.dev/v2/commentannotations/add
{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "targetAnnotationId": "ann-789",
    "annotation": {
      "comments": [{"commentText": "Review this", "commenterId": "u1", "commenterName": "Alice"}]
    }
  }
}

# Get annotations
POST https://api.velt.dev/v2/commentannotations/get
{"data": {"organizationId": "org-123", "documentId": "doc-456", "annotationIds": ["ann-789"]}}

# Update annotation
POST https://api.velt.dev/v2/commentannotations/update
{"data": {"organizationId": "org-123", "documentId": "doc-456", "annotationId": "ann-789", "annotation": {"status": "resolved"}}}

# Delete annotations
POST https://api.velt.dev/v2/commentannotations/delete
{"data": {"organizationId": "org-123", "documentId": "doc-456", "annotationIds": ["ann-789"]}}

# Get annotation count
POST https://api.velt.dev/v2/commentannotations/count/get
{"data": {"organizationId": "org-123", "documentId": "doc-456"}}

# Add comment to annotation
POST https://api.velt.dev/v2/commentannotations/comments/add
{"data": {"organizationId": "org-123", "documentId": "doc-456", "annotationId": "ann-789", "comment": {"commentText": "Agreed", "commenterId": "u2", "commenterName": "Bob"}}}

# Get/update/delete individual comments
POST https://api.velt.dev/v2/commentannotations/comments/get    (annotationId required)
POST https://api.velt.dev/v2/commentannotations/comments/update (commentId + comment object)
POST https://api.velt.dev/v2/commentannotations/comments/delete (commentIds array)
```

Annotation-level uses `annotationIds` (array). Comment-level uses `annotationId` (singular) + `commentId`/`commentIds`.

**Source:** `https://docs.velt.dev/api-reference/rest-api/comment-annotations`

---

### 3.2 Users

```bash
# Add users with access roles (viewer/editor, scoped to organization/document/folder)
POST https://api.velt.dev/v2/users/add
{
  "data": {
    "organizationId": "org-123",
    "users": [{
      "userId": "u1", "name": "Alice", "email": "alice@example.com",
      "resources": [
        {"resourceId": "org-123", "resourceType": "organization", "role": "editor"},
        {"resourceId": "doc-456", "resourceType": "document", "role": "viewer"},
        {"resourceId": "f-789", "resourceType": "folder", "role": "editor"}
      ]
    }]
  }
}

# Get/update/delete
POST https://api.velt.dev/v2/users/get    {"data": {"organizationId": "org-123", "userIds": ["u1"]}}
POST https://api.velt.dev/v2/users/update {"data": {"organizationId": "org-123", "users": [{"userId": "u1", "name": "Alice Johnson"}]}}
POST https://api.velt.dev/v2/users/delete {"data": {"organizationId": "org-123", "userIds": ["u1"]}}

# GDPR data operations
POST https://api.velt.dev/v2/users/data/get           {"data": {"organizationId": "org-123", "userId": "u1"}}
POST https://api.velt.dev/v2/users/data/delete         {"data": {"organizationId": "org-123", "userId": "u1"}}
POST https://api.velt.dev/v2/users/data/delete/status  {"data": {"organizationId": "org-123", "userId": "u1"}}
```

Valid roles: `viewer`, `editor`. Valid resource types: `organization`, `document`, `folder`.
GDPR deletion is async — poll `/users/data/delete/status` until complete.

**Source:** `https://docs.velt.dev/api-reference/rest-api/users`

---

### 3.3 Documents, Organizations, Folders

```bash
# Organizations
POST https://api.velt.dev/v2/organizations/add    {"data": {"organizationId": "org-123", "organizationName": "Acme"}}
POST https://api.velt.dev/v2/organizations/get    {"data": {"organizationIds": ["org-123"]}}
POST https://api.velt.dev/v2/organizations/update {"data": {"organizationId": "org-123", "organizationName": "Acme Inc"}}
POST https://api.velt.dev/v2/organizations/delete {"data": {"organizationIds": ["org-123"]}}

# Documents
POST https://api.velt.dev/v2/organizations/documents/add           {"data": {"organizationId": "org-123", "documentId": "doc-456", "documentName": "Report"}}
POST https://api.velt.dev/v2/organizations/documents/get           {"data": {"organizationId": "org-123", "documentIds": ["doc-456"]}}
POST https://api.velt.dev/v2/organizations/documents/update        {"data": {"organizationId": "org-123", "documentId": "doc-456", "documentName": "Report v2"}}
POST https://api.velt.dev/v2/organizations/documents/delete        {"data": {"organizationId": "org-123", "documentIds": ["doc-456"]}}
POST https://api.velt.dev/v2/organizations/documents/move          {"data": {"organizationId": "org-123", "documentId": "doc-456", "folderId": "f-789"}}
POST https://api.velt.dev/v2/organizations/documents/update-access {"data": {"organizationId": "org-123", "documentId": "doc-456", "accessMode": "private", "allowedUserIds": ["u1"]}}
POST https://api.velt.dev/v2/organizations/documents/migrate       {"data": {"sourceOrganizationId": "org-123", "targetOrganizationId": "org-456", "documentId": "doc-456"}}

# Folders
POST https://api.velt.dev/v2/organizations/folders/add           {"data": {"organizationId": "org-123", "folderId": "f-789", "folderName": "Reports"}}
POST https://api.velt.dev/v2/organizations/folders/get           {"data": {"organizationId": "org-123", "folderIds": ["f-789"]}}
POST https://api.velt.dev/v2/organizations/folders/update        {"data": {"organizationId": "org-123", "folderId": "f-789", "folderName": "Quarterly"}}
POST https://api.velt.dev/v2/organizations/folders/delete        {"data": {"organizationId": "org-123", "folderIds": ["f-789"]}}
POST https://api.velt.dev/v2/organizations/folders/update-access {"data": {"organizationId": "org-123", "folderId": "f-789", "accessMode": "private", "allowedUserIds": ["u1"]}}

# User groups
POST https://api.velt.dev/v2/organizations/usergroups/add          {"data": {"organizationId": "org-123", "userGroupId": "g1", "userGroupName": "Engineering"}}
POST https://api.velt.dev/v2/organizations/usergroups/users/add    {"data": {"organizationId": "org-123", "userGroupId": "g1", "userIds": ["u1", "u2"]}}
POST https://api.velt.dev/v2/organizations/usergroups/users/delete {"data": {"organizationId": "org-123", "userGroupId": "g1", "userIds": ["u2"]}}
```

Organizations are top-level. `accessMode`: `private` (allowed users only) or `public` (all org members).

**Source:** `https://docs.velt.dev/api-reference/rest-api/organizations`

---

### 3.4 Notifications

```bash
# Add notification with template
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
      "actionUser": {"userId": "u1", "name": "Alice", "email": "alice@example.com"},
      "notifyUsers": [{"userId": "u2", "name": "Bob", "email": "bob@example.com"}]
    }
  }
}

# Get/update/delete
POST https://api.velt.dev/v2/notifications/get    {"data": {"organizationId": "org-123", "userId": "u2"}}
POST https://api.velt.dev/v2/notifications/update {"data": {"organizationId": "org-123", "notificationId": "n1", "notification": {"isRead": true}}}
POST https://api.velt.dev/v2/notifications/delete {"data": {"organizationId": "org-123", "notificationIds": ["n1"]}}

# Configuration
POST https://api.velt.dev/v2/notifications/get-config {"data": {"organizationId": "org-123"}}
POST https://api.velt.dev/v2/notifications/set-config {"data": {"organizationId": "org-123", "config": {"emailNotifications": true, "inAppNotifications": true, "emailDelay": 300}}}
```

Template variables: `{actionUser}`, `{taskName}`, `{documentName}`, `{commentText}`. Variables in template must match keys in `displayHeadlineMessageTemplateData`.

**Source:** `https://docs.velt.dev/api-reference/rest-api/notifications`

---

### 3.5 Activities + CRDT

```bash
# Activity logs
POST https://api.velt.dev/v2/activities/add
{
  "data": {
    "organizationId": "org-123", "documentId": "doc-456",
    "activity": {
      "activityType": "comment", "actionType": "added",
      "actionUser": {"userId": "u1", "name": "Alice", "email": "alice@example.com"},
      "message": "Alice added a comment", "timestamp": 1700000000000
    }
  }
}

POST https://api.velt.dev/v2/activities/get    {"data": {"organizationId": "org-123", "documentId": "doc-456"}}
POST https://api.velt.dev/v2/activities/update {"data": {"organizationId": "org-123", "activityId": "a1", "activity": {"message": "Updated"}}}
POST https://api.velt.dev/v2/activities/delete {"data": {"organizationId": "org-123", "activityIds": ["a1"]}}

# CRDT data (types: text, map, array, xml)
POST https://api.velt.dev/v2/crdt/add    {"data": {"organizationId": "org-123", "documentId": "doc-456", "crdtDataType": "map", "key": "settings", "value": {"theme": "dark", "fontSize": 14}}}
POST https://api.velt.dev/v2/crdt/get    {"data": {"organizationId": "org-123", "documentId": "doc-456", "crdtDataType": "map", "key": "settings"}}
POST https://api.velt.dev/v2/crdt/update {"data": {"organizationId": "org-123", "documentId": "doc-456", "crdtDataType": "map", "key": "settings", "value": {"theme": "light"}}}

# Live state broadcast (fire-and-forget, not persisted)
POST https://api.velt.dev/v2/livestate/broadcast
{"data": {"organizationId": "org-123", "documentId": "doc-456", "key": "deployStatus", "value": {"status": "success", "timestamp": 1700000000000}}}
```

CRDT types: `text` (plain text), `map` (key-value), `array` (ordered list), `xml` (rich text). CRDT data syncs with frontend via Yjs.
Live state broadcast pushes to active clients only — does not persist.
Activity timestamps use Unix milliseconds.

**Source:** `https://docs.velt.dev/api-reference/rest-api/activities`

---

## 4. Webhooks — HIGH-MEDIUM

### 4.1 Webhook v1 Setup and Event Handling

Configure in Velt Console > Configurations > Webhook Service. Enter endpoint URL, optionally set auth token, select event types.

**Comment events:** `newlyAdded`, `added`, `updated`, `deleted`, `approved`, `assigned`, `statusChanged`, `priorityChanged`, `reactionAdded`, `reactionDeleted`

**Huddle events:** `created`, `joined`

**CRDT events:** `updateData` (5-second debounce — not every keystroke)

**Payload format:**

```json
{
  "webhookId": "wh-123",
  "actionType": "added",
  "notificationSource": "comment",
  "actionUser": {
    "userId": "u1",
    "name": "Alice",
    "email": "alice@example.com"
  },
  "metadata": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "annotationId": "ann-789"
  }
}
```

**Handler with auth verification:**

```javascript
const express = require("express");
const app = express();
app.use(express.json());

app.post("/velt/webhook", (req, res) => {
  const token = req.headers["authorization"];
  if (token !== process.env.VELT_WEBHOOK_TOKEN) {
    return res.status(401).send("Unauthorized");
  }

  const { actionType, notificationSource, actionUser, metadata } = req.body;

  if (notificationSource === "comment" && actionType === "added") {
    console.log(`${actionUser.name} commented on doc ${metadata.documentId}`);
  }

  res.status(200).send("OK");
});
```

**Encrypted payloads (optional):** AES-256-CBC encryption with base64 encoding. Key and IV configured in Console.

```javascript
const crypto = require("crypto");

function decryptPayload(encrypted, key, iv) {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(key, "hex"),
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
}
```

**Verification:**
- [ ] Webhook URL configured in Velt Console
- [ ] Endpoint returns 2xx for valid requests
- [ ] Auth token verified if configured
- [ ] CRDT debounce (5s) accounted for

**Source:** `https://docs.velt.dev/webhooks/overview`

---

### 4.2 Webhook v2 (Enterprise) with Svix

Enterprise feature: multiple endpoints, event filtering, retries, transformations, testing playground.

**v2 event types (dot-notation):**

| Event Type | Description |
|-----------|-------------|
| `comment_annotation.add` | New annotation created |
| `comment.add` | Comment added |
| `comment.update` | Comment updated |
| `comment.delete` | Comment deleted |
| `comment_annotation.status_change` | Status changed |
| `comment_annotation.priority_change` | Priority changed |
| `comment.reaction_add` | Reaction added |
| `comment.reaction_delete` | Reaction removed |
| `huddle.create` | Huddle started |
| `huddle.join` | User joined huddle |
| `crdt.update_data` | CRDT data changed (5s debounce) |

**Retry schedule:** immediately, 5s, 5m, 30m, 2h, 5h, 10h, 10h

**Must return 2xx within 15 seconds.** Defer long-running processing to a queue.

**Transformation example (reshape for Slack):**

```javascript
function handler(webhook) {
  const { actionType, actionUser, metadata } = webhook.payload;
  return {
    text: `[${actionType}] ${actionUser.name} on document ${metadata.documentId}`
  };
}
```

**Per-endpoint configuration:** URL, event type filters, rate limit, channels, transformation.

**Key points:**
- Handlers must be idempotent — retries send the same payload.
- Transformations are pure JavaScript (no external imports).
- Subscribe each endpoint only to needed events to reduce noise.
- Failed events can be manually retried from the Svix dashboard.

**Verification:**
- [ ] Endpoint returns 2xx within 15 seconds
- [ ] Handler is idempotent
- [ ] Event type filters configured per endpoint
- [ ] Transformations return valid JSON
- [ ] Long-running processing deferred after 2xx response

**Source:** `https://docs.velt.dev/webhooks/webhook-v2`

---

## 5. Debugging — LOW-MEDIUM

### 5.1 Common Issues

**Issue 1: 401 Unauthorized on REST API calls**

Missing or incorrect authentication headers. Ensure both `x-velt-api-key` and `x-velt-auth-token` are present.

```bash
# Correct auth test
curl -X POST https://api.velt.dev/v2/organizations/get \
  -H "Content-Type: application/json" \
  -H "x-velt-api-key: YOUR_API_KEY" \
  -H "x-velt-auth-token: YOUR_AUTH_TOKEN" \
  -d '{"data": {"organizationIds": ["org-123"]}}'
```

**Issue 2: JWT token expired**

Tokens last 48 hours. Listen for `token_expired` event on frontend and call your backend to regenerate.

**Issue 3: Python SDK INVALID_INPUT**

Request type import does not match the method. Use `GetCommentResolverRequest` with `getComments()`, `SaveCommentResolverRequest` with `saveComments()`, etc.

**Issue 4: Webhook not firing**

1. Verify URL in Velt Console > Configurations > Webhook Service
2. Confirm URL is publicly accessible (not localhost)
3. Check endpoint returns 2xx
4. For v2, verify event type filters include expected events
5. Test with webhook.site to confirm Velt is sending events

**Issue 5: S3 upload failing**

1. Verify `S3Config` has correct `region`, `access_key`, `secret_key`, `bucket`
2. IAM needs `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`
3. Bucket must exist in specified region
4. CORS configured on bucket if browser uploads

**Quick reference table:**

| Issue | Symptom | Fix |
|-------|---------|-----|
| 401 Unauthorized | REST API rejects calls | Add both required headers |
| JWT expired | Frontend auth fails after 48h | Handle `token_expired` event |
| INVALID_INPUT | Python SDK error | Match request type to method |
| Webhook silent | No events received | Check Console URL + 2xx response |
| S3 failure | Attachment errors | Verify credentials + IAM permissions |

**Source:** `https://docs.velt.dev/api-reference/rest-api/overview`

---

*All source documentation at https://docs.velt.dev/api-reference — REST API, Python SDK, Webhooks, and Authentication sections.*
