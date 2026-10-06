# Velt Rest Apis Best Practices

**Version 1.0.10**  
Velt  
October 2026

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
   - 1.2 [Generate JWT Tokens Server-Side with /v2/auth/generate_token](#12-generate-jwt-tokens-server-side-with-v2authgeneratetoken)

2. [REST API Endpoints](#2-rest-api-endpoints) — **HIGH**
   - 2.1 [Branch on the Per-Item code When Bulk Document Calls Partially Fail](#21-branch-on-the-per-item-code-when-bulk-document-calls-partially-fail)
   - 2.2 [Comment Annotations and Comments CRUD via REST API](#22-comment-annotations-and-comments-crud-via-rest-api)
   - 2.3 [Create, Update, and Version Review Agents with the Agents REST API](#23-create-update-and-version-review-agents-with-the-agents-rest-api)
   - 2.4 [Ingest and Manage Memory Knowledge Sources Asynchronously](#24-ingest-and-manage-memory-knowledge-sources-asynchronously)
   - 2.5 [Manage Advanced Webhooks via REST API](#25-manage-advanced-webhooks-via-rest-api)
   - 2.6 [Manage Notifications and Notification Config via REST API](#26-manage-notifications-and-notification-config-via-rest-api)
   - 2.7 [Manage Organizations, Documents, Folders, and User Groups via REST API](#27-manage-organizations-documents-folders-and-user-groups-via-rest-api)
   - 2.8 [Manage Users and GDPR Data via REST API](#28-manage-users-and-gdpr-data-via-rest-api)
   - 2.9 [Provision Workspaces and API Keys with Workspace-Level Auth](#29-provision-workspaces-and-api-keys-with-workspace-level-auth)
   - 2.10 [Query Memory with Search, Ask, Suggest, and Judgments Query](#210-query-memory-with-search-ask-suggest-and-judgments-query)
   - 2.11 [Read Memory Insights and Manage Alerts with Their Real Limits](#211-read-memory-insights-and-manage-alerts-with-their-real-limits)
   - 2.12 [Run Agent Executions Asynchronously and Read Results Correctly](#212-run-agent-executions-asynchronously-and-read-results-correctly)
   - 2.13 [Run Built-in Review Agents by ID with Issue Types and Per-Run Options](#213-run-built-in-review-agents-by-id-with-issue-types-and-per-run-options)
   - 2.14 [Use Agent Groups, Prompt Tools, Extract, and Analytics Correctly](#214-use-agent-groups-prompt-tools-extract-and-analytics-correctly)
   - 2.15 [Use the Approval Engine Skill for Review Workflow Builder REST APIs](#215-use-the-approval-engine-skill-for-review-workflow-builder-rest-apis)
   - 2.16 [Write Activity Logs, CRDT Data, and Live State via REST API](#216-write-activity-logs-crdt-data-and-live-state-via-rest-api)

3. [Webhooks](#3-webhooks) — **MEDIUM**
   - 3.1 [Set Up Basic Webhooks and Handle Their Payloads](#31-set-up-basic-webhooks-and-handle-their-payloads)
   - 3.2 [Verify and Handle Advanced (Svix) Webhooks](#32-verify-and-handle-advanced-svix-webhooks)

4. [Debugging](#4-debugging) — **LOW-MEDIUM**
   - 4.1 [Troubleshoot Common Velt Backend Integration Failures](#41-troubleshoot-common-velt-backend-integration-failures)

---

## 1. Core Setup

**Impact: CRITICAL**

Foundational requirements for every server-side Velt integration. Covers the REST auth contract (API-key-level `x-velt-api-key` + `x-velt-auth-token` vs. workspace-level `x-velt-workspace-id` + `x-velt-workspace-auth-token`, the `{ data }` request wrapper, and the `result` / `error` response envelope) and JWT generation with `/v2/auth/generate_token` (permissions resources, `accessRole`, 48h expiry, `authProvider` refresh) plus the permissions endpoints. Get these wrong and every subsequent call fails.

### 1.1 Authenticate All Velt REST API Calls with Required Headers

**Impact: CRITICAL (Missing or mismatched authentication headers reject every API call)**

Every Velt REST API v2 call needs a header pair, and the pair depends on the endpoint's scope: API-key-level or workspace-level. Sending the wrong pair is rejected even when both headers are present.

**API-key-level endpoints (most of the v2 surface: `/organizations/*`, `/users/*`, `/commentannotations/*`, `/notifications/*`, `/agents/*`, `/memory/*`, `/workspace/domains/*`, `/workspace/webhookconfig/*`, `/workspace/apikeyconfig/*`, `/workspace/advancedwebhook*`, and similar):**

- `x-velt-api-key`: your API key from the Velt Console
- `x-velt-auth-token`: an auth token for that API key, generated in the Velt Console or read with `POST https://api.velt.dev/v2/workspace/authtokens/get`

**Workspace-level endpoints (`/v2/workspace/get`, `/v2/workspace/apikey/create`, `/v2/workspace/apikey/update`, `/v2/workspace/apikeys/get`, `/v2/workspace/authtokens/get`, `/v2/workspace/authtoken/reset`):**

- `x-velt-workspace-id`: the workspace ID (`result.data.id` from `POST https://api.velt.dev/v2/workspace/create`)
- `x-velt-workspace-auth-token`: the workspace auth token (`result.data.authToken` from `POST https://api.velt.dev/v2/workspace/create`)

`/v2/workspace/create`, `/v2/workspace/email/status`, and `/v2/workspace/email/send-login-link` are public endpoints and take no auth headers.

**Base URL:** `https://api.velt.dev/v2`. **Every endpoint is `POST`**, including reads and deletes. Request bodies are wrapped in `{ "data": { ... } }`.

**Incorrect (api-key-level endpoint, missing auth token header):**

```bash
curl -X POST https://api.velt.dev/v2/organizations/get \
  -H 'Content-Type: application/json' \
  -H 'x-velt-api-key: your_api_key' \
  -d '{"data": {"organizationIds": ["org_123"]}}'
```

**Correct (api-key-level endpoint, both headers):**

```bash
curl -X POST https://api.velt.dev/v2/organizations/get \
  -H 'Content-Type: application/json' \
  -H 'x-velt-api-key: your_api_key' \
  -H 'x-velt-auth-token: your_auth_token' \
  -d '{"data": {"organizationIds": ["org_123"]}}'
```

**Incorrect (workspace-level endpoint called with the api-key-level pair):**

```bash
curl -X POST https://api.velt.dev/v2/workspace/apikeys/get \
  -H 'Content-Type: application/json' \
  -H 'x-velt-api-key: your_api_key' \
  -H 'x-velt-auth-token: your_auth_token' \
  -d '{"data": {}}'
```

**Correct (workspace-level endpoint with workspace ID and workspace auth token):**

```bash
curl -X POST https://api.velt.dev/v2/workspace/apikeys/get \
  -H 'Content-Type: application/json' \
  -H 'x-velt-workspace-id: workspace_abc123' \
  -H 'x-velt-workspace-auth-token: your_workspace_auth_token' \
  -d '{"data": {}}'
```

**Incorrect (GET method, no `data` wrapper):**

```javascript
const response = await fetch('https://api.velt.dev/v2/organizations/get', {
  method: 'GET',
  headers: {
    'x-velt-api-key': 'your_api_key',
    'x-velt-auth-token': 'your_auth_token'
  }
});
```

**Correct (server-side fetch with POST and the `data` wrapper):**

```javascript
const response = await fetch('https://api.velt.dev/v2/organizations/get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN
  },
  body: JSON.stringify({
    data: { organizationIds: ['org_123'] }
  })
});

const json = await response.json();
if (json.error) {
  // { error: { status: 'INVALID_ARGUMENT' | 'NOT_FOUND' | ..., message, details? } }
  throw new Error(`${json.error.status}: ${json.error.message}`);
}
const payload = json.result; // most endpoints: { status, message, data }
```

**Response envelope:**

- Success: `{ "result": { "status": "success", "message": "...", "data": ... } }` on most endpoints. Memory endpoints (`/v2/memory/*`) are the exception: their fields sit directly on `result` (for example `result.answer`, `result.results`), with no `data` key.
- Failure: `{ "error": { "status": "<CODE>", "message": "...", "details"?: ... } }`. Status codes are gRPC-style strings: `INVALID_ARGUMENT`, `NOT_FOUND`, `ALREADY_EXISTS`, `PERMISSION_DENIED`, `FAILED_PRECONDITION`, `RESOURCE_EXHAUSTED`, `INTERNAL`, and others. Branch on `error.status`, not only on the HTTP status.

**Key points:**

- The workspace auth token (`result.data.authToken` from `/v2/workspace/create`) is distinct from the per-API-key auth tokens returned by `/v2/workspace/authtokens/get`. They are not interchangeable.
- The API auth token is separate from the JWT tokens used to authenticate frontend users (see `core-jwt-tokens`).
- Never expose `x-velt-auth-token` or `x-velt-workspace-auth-token` in client-side code; call the REST API from your server only.
- Several read endpoints (`/v2/organizations/get`, `/v2/organizations/documents/get`, `/v2/organizations/folders/*`, `/v2/users/get`, `/v2/notifications/get`, `/v2/commentannotations/get`) require **advanced queries** to be enabled in the Velt Console and the v4+ SDK deployed.
- For Node.js backends, `@veltdev/node` exposes the same surface as typed `sdk.api.*` methods (see `velt-node-sdk-best-practices`).

**Verification Checklist:**
- [ ] Header pair matches the endpoint scope: api-key-level uses `x-velt-api-key` + `x-velt-auth-token`; workspace-level uses `x-velt-workspace-id` + `x-velt-workspace-auth-token`
- [ ] Workspace endpoint paths use slashes (`/v2/workspace/authtokens/get`, `/v2/workspace/apikey/create`), not hyphens
- [ ] Request method is POST and the base URL is `https://api.velt.dev/v2`
- [ ] Request body uses the `{ data: { ... } }` wrapper
- [ ] Error handling reads `error.status` and `error.message`; Memory responses are read from `result` directly
- [ ] Auth tokens are kept server-side only
- [ ] Advanced queries are enabled in the Console before calling the `get` endpoints that require them

**Source Pointers:**
- https://docs.velt.dev/security/auth-tokens - "Generating Auth Tokens"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/create - "Next Steps" (workspace-level vs. api-key-level header pairs)
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/authtokens-get - "Get Auth Tokens"
- https://docs.velt.dev/api-reference/rest-apis/v2/organizations/get-organizations-v2 - "Get Organizations" (advanced queries prerequisite)
- https://docs.velt.dev/ai/memory/overview - "Quickstart" (Memory response shape)

---

### 1.2 Generate JWT Tokens Server-Side with /v2/auth/generate_token

**Impact: CRITICAL (A wrong endpoint, body shape, or client-side call breaks frontend authentication or leaks the auth token)**

JWT tokens authenticate frontend users with the Velt SDK. Generate them on your server with `POST https://api.velt.dev/v2/auth/generate_token`, authenticated with the `x-velt-api-key` and `x-velt-auth-token` headers. Tokens expire after 48 hours. Turn on **Require JWT Token** in the Velt Console (or `requireJwtToken: true` via `/v2/workspace/apikeyconfig/update`) to enforce them.

**Incorrect (legacy body shape, organization in `userProperties`, called from the browser):**

```javascript
// Runs in the browser: exposes the auth token.
// Puts apiKey/authToken in the body and organizationId in userProperties.
const response = await fetch('https://api.velt.dev/v2/auth/generate_token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: {
      userId: 'user_1',
      apiKey: 'your_api_key',
      authToken: 'your_auth_token',
      userProperties: { organizationId: 'org_123' }
    }
  })
});
```

**Correct (Next.js route handler, server-side only):**

```typescript
// app/api/velt-token/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { userId, name, email, organizationId } = await req.json();

  const response = await fetch('https://api.velt.dev/v2/auth/generate_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-velt-api-key': process.env.VELT_API_KEY!,
      'x-velt-auth-token': process.env.VELT_AUTH_TOKEN!
    },
    body: JSON.stringify({
      data: {
        userId,
        userProperties: { name, email, isAdmin: false },
        permissions: {
          resources: [
            { type: 'organization', id: organizationId, accessRole: 'editor' },
            { type: 'document', id: 'doc_456', organizationId, accessRole: 'viewer' }
          ]
        }
      }
    })
  });

  const json = await response.json();
  // { result: { status: 'success', message, data: { token } } }
  return NextResponse.json({ token: json?.result?.data?.token });
}
```

**Request body (`data`):**

| Field | Required | Notes |
|-------|----------|-------|
| `userId` | Yes | Your user's ID |
| `userProperties.name` | Yes | Display name |
| `userProperties.email` | Yes | Email |
| `userProperties.isAdmin` | No | Default `false`. Sets the user as a Velt admin |
| `permissions.resources[]` | Yes | `{ type: 'organization' \| 'folder' \| 'document', id, organizationId?, accessRole?, expiresAt? }` |

- `organizationId` belongs in `permissions.resources[]` as a `type: 'organization'` entry, never in `userProperties`.
- `organizationId` is required on `document` and `folder` resources.
- `accessRole` is `viewer` or `editor` (default `editor`). It can only be set through the v2 Users and Auth Permissions REST APIs, never from frontend SDK methods.
- Posting the body without the top-level `data` wrapper returns `INVALID_ARGUMENT`.

**Correct (frontend: let the auth provider refresh tokens):**

```jsx
// React: Velt calls generateToken on sign-in and whenever the token expires.
<VeltProvider
  apiKey="YOUR_API_KEY"
  authProvider={{
    user,
    retryConfig: { retryCount: 3, retryDelay: 1000 },
    generateToken: async () => {
      const res = await fetch('/api/velt-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId, name: user.name, email: user.email, organizationId: user.organizationId })
      });
      const { token } = await res.json();
      return token;
    }
  }}
>
  {children}
</VeltProvider>
```

```javascript
// Other frameworks
Velt.setVeltAuthProvider({
  user,
  retryConfig: { retryCount: 3, retryDelay: 1000 },
  generateToken: async () => (await (await fetch('/api/velt-token', { method: 'POST' })).json()).token
});
```

**Correct (frontend: `identify()` users must handle `token_expired` themselves):**

```javascript
// Other frameworks: subscribe to the error event and re-identify with a fresh token.
const subscription = Velt.on('error').subscribe(async (error) => {
  if (error?.code === 'token_expired') {
    const { token } = await (await fetch('/api/velt-token', { method: 'POST' })).json();
    await Velt.identify(user, { authToken: token });
  }
});
// Later: subscription?.unsubscribe();
```

In React, read the same event with `useVeltEventCallback('error')` and re-identify when `code === 'token_expired'`. With an auth provider, refresh is automatic and no listener is needed.

#### Permissions endpoints

Grant, read, and revoke resource access server-side. All are `POST` with the API-key-level header pair.

```bash
# Add permissions: note the nested "user" object
POST https://api.velt.dev/v2/auth/permissions/add
{ "data": {
    "user": { "userId": "user-123" },
    "permissions": { "resources": [
      { "type": "organization", "id": "org-abc", "accessRole": "editor" },
      { "type": "document", "id": "doc-456", "organizationId": "org-abc", "accessRole": "viewer", "expiresAt": 1728902400 }
    ] }
} }

# Get permissions: organizationId + userIds (plus optional documentIds / folderIds)
POST https://api.velt.dev/v2/auth/permissions/get
{ "data": { "organizationId": "org-abc", "userIds": ["user-123"], "documentIds": ["doc-456"] } }

# Remove permissions: top-level userId
POST https://api.velt.dev/v2/auth/permissions/remove
{ "data": {
    "userId": "user-123",
    "permissions": { "resources": [ { "type": "document", "id": "doc-456", "organizationId": "org-abc" } ] }
} }

# Sign Permission Provider responses (backend only)
POST https://api.velt.dev/v2/auth/generate_signature
{ "data": { "permissions": [
    { "userId": "user-123", "resourceId": "doc-456", "type": "document", "hasAccess": true, "accessRole": "viewer", "expiresAt": 1759745729823 }
] } }
# -> { "result": { "data": { "signature": "..." } } }
```

- `expiresAt` is **Unix seconds** on `permissions/add` and `generate_token` resources, but **milliseconds** on `generate_signature`.
- `permissions/get` returns `result.data[userId]` with `organization`, `folders`, `documents` maps of `{ accessRole, accessType, expiresAt?, error?, errorCode? }`, plus `context.accessFields` when Access Context is used.
- `generate_signature` is for the real-time Permission Provider: sign your permission decisions before returning them to Velt.

**Verification Checklist:**
- [ ] Token generation calls `https://api.velt.dev/v2/auth/generate_token` from the server, with `x-velt-api-key` and `x-velt-auth-token` headers (no `apiKey`/`authToken` in the body)
- [ ] Body is wrapped in `data` and includes `userId`, `userProperties.name`, `userProperties.email`, and `permissions.resources[]`
- [ ] `organizationId` is sent as a `type: 'organization'` resource, not in `userProperties`
- [ ] Token is read from `result.data.token`
- [ ] Frontend uses `authProvider` / `setVeltAuthProvider` with `generateToken`, or listens for the `error` event with `code === 'token_expired'` when using `identify()`
- [ ] `permissions/add` uses `user.userId`; `permissions/remove` uses top-level `userId`; `permissions/get` uses `organizationId` + `userIds`
- [ ] `expiresAt` units match the endpoint (seconds on add/generate_token, milliseconds on generate_signature)

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/auth/generate-token - "Generate Token"
- https://docs.velt.dev/get-started/advanced#jwt-authentication-tokens - "JWT Authentication Tokens"
- https://docs.velt.dev/get-started/advanced#token-refresh - "Token Refresh"
- https://docs.velt.dev/key-concepts/overview#access-control - "Access Control"
- https://docs.velt.dev/api-reference/rest-apis/v2/auth/add-permissions - "Add Permissions"
- https://docs.velt.dev/api-reference/rest-apis/v2/auth/get-permissions - "Get Permissions"
- https://docs.velt.dev/api-reference/rest-apis/v2/auth/remove-permissions - "Remove Permissions"
- https://docs.velt.dev/api-reference/rest-apis/v2/auth/generate-signature - "Generate Signature"

---

## 2. REST API Endpoints

**Impact: HIGH**

CRUD patterns for the Velt REST API v2 surface: comment annotations and comments, notifications and per-user notification config, users and GDPR data operations, organizations / documents / folders / user groups / domains (with per-item `code` partial-failure handling), activity logs / CRDT data / live state, workspace and API key provisioning (production keys, data residency regions), advanced webhook management, review agents (CRUD and versions, async executions with page lists and multi-agent runs, built-in agents and per-run options, groups and prompt tools), and Memory (search / ask / suggest / judgments, knowledge ingestion, insights and alerts), plus the Approval Engine pointer. All endpoints are POST under `https://api.velt.dev/v2`; endpoint paths and payload shapes are verbatim.

### 2.1 Branch on the Per-Item code When Bulk Document Calls Partially Fail

**Impact: HIGH (Retrying a v2 bulk document 500 on status alone loops forever on not-found or already-exists items)**

The bulk document endpoints (add, update, delete, get with `documentIds`) report each item separately. On **v2**, if any item fails, the whole call returns **HTTP 500 `INTERNAL`** and the per-item breakdown sits in `error.details`, even when nothing broke on the server (for example, the document does not exist). Each failed entry carries a `code`; retry only items whose `code` is `internal`.

**Incorrect (retry on HTTP status):**

```javascript
async function deleteDocs(ids) {
  const res = await veltPost('/v2/organizations/documents/delete', {
    organizationId: 'org-123',
    documentIds: ids
  });
  if (res.status === 500) {
    // Loops forever when one of the IDs simply does not exist ("not-found").
    return deleteDocs(ids);
  }
}
```

**Correct (read `error.details` and retry only `internal` items):**

```javascript
async function deleteDocs(ids, attempt = 0) {
  const res = await fetch('https://api.velt.dev/v2/organizations/documents/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-velt-api-key': process.env.VELT_API_KEY,
      'x-velt-auth-token': process.env.VELT_AUTH_TOKEN
    },
    body: JSON.stringify({ data: { organizationId: 'org-123', documentIds: ids } })
  });
  const json = await res.json();
  if (!json.error) return json.result.data; // every item succeeded

  // v2 add/update/delete: details is a map keyed by the document IDs you sent
  const details = json.error.details ?? {};
  const retryable = Object.entries(details)
    .filter(([, item]) => item.success === false && item.code === 'internal')
    .map(([id]) => id);
  const permanent = Object.entries(details)
    .filter(([, item]) => item.success === false && item.code !== 'internal');

  permanent.forEach(([id, item]) => console.warn(`Skipping ${id}: ${item.code}`));
  if (retryable.length && attempt < 3) return deleteDocs(retryable, attempt + 1);
}
```

#### Where the per-item result lives

| Endpoint | v2 (`/v2/organizations/documents/*`) | v1 (`/v1/organizations/documents/*`) |
|----------|--------------------------------------|--------------------------------------|
| `add` | HTTP 500; `error.details` map keyed by document ID | Not documented |
| `update` | HTTP 500; `error.details` map keyed by document ID | HTTP 200; per-item entries in `result.data` |
| `delete` | HTTP 500; `error.details` map keyed by document ID | HTTP 200; per-item entries in `result.data` |
| `get` (with `documentIds`) | HTTP 500; `error.details` **array** in request order | Not documented |

A v2 success response contains only successful items. On v1 update and delete, check `success` on every entry because the HTTP status stays 200.

#### Per-item `code` values

| `code` | Endpoints | Meaning | Retry? |
|--------|-----------|---------|--------|
| `already-exists` | add | A document with this ID already exists | No |
| `not-found` | update, delete, get | The document does not exist | No |
| `internal` | all | A genuine server-side failure | Yes |

Because a missing document makes v2 `get` return 500, `get` is not a clean existence check: read the per-item `code` to tell "does not exist" from a real failure.

**Verification Checklist:**
- [ ] Bulk document callers parse `error.details` on v2 instead of treating every 500 as transient
- [ ] `get` with `documentIds` reads `error.details` as an array in request order; add/update/delete read it as a map keyed by document ID
- [ ] Only items with `code: "internal"` are retried, with a bounded attempt count
- [ ] `not-found` and `already-exists` items are logged or reconciled, never retried
- [ ] v1 update/delete callers check `success` on every `result.data` entry even on HTTP 200

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/documents/add-documents - "Partial Failures"
- https://docs.velt.dev/api-reference/rest-apis/v2/documents/update-documents - "Partial Failures"
- https://docs.velt.dev/api-reference/rest-apis/v2/documents/delete-documents - "Partial Failures"
- https://docs.velt.dev/api-reference/rest-apis/v2/documents/get-documents-v2 - "Partial Failures"
- https://docs.velt.dev/api-reference/rest-apis/v1/documents/delete-documents - "Per-Item Failures"
- https://docs.velt.dev/api-reference/rest-apis/v1/documents/update-documents - "Per-Item Failures"

---

### 2.2 Comment Annotations and Comments CRUD via REST API

**Impact: HIGH (Comments are the most-used collaboration primitive; wrong payload shapes are rejected or silently write the wrong data)**

The comment REST endpoints live under `https://api.velt.dev/v2/commentannotations/*`. All are `POST` with the API-key-level headers (`x-velt-api-key`, `x-velt-auth-token`). Annotations (threads) are created with a `commentAnnotations[]` array whose items carry `commentData[]`; updates use `updatedData`. For the full comments feature (frontend APIs, agent-authoring guidance, progress rows, action chips), see `velt-comments-best-practices`.

**Incorrect (invented payload keys: `annotation`, `comments`, `commenterId`):**

```json
{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "annotation": {
      "comments": [{ "commentText": "This needs review", "commenterId": "user-1" }]
    }
  }
}
```

**Correct (`commentAnnotations[]` with `commentData[]` and a `from` user):**

```bash
POST https://api.velt.dev/v2/commentannotations/add

{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "commentAnnotations": [
      {
        "location": { "id": "section-2", "locationName": "Pricing" },
        "targetElement": { "elementId": "pricing-table", "targetText": "Pro plan", "occurrence": 1 },
        "commentData": [
          {
            "commentText": "This needs review",
            "commentHtml": "<p>This needs review</p>",
            "from": { "userId": "user-1", "name": "Alice", "email": "alice@example.com" },
            "triggerNotification": true
          }
        ]
      }
    ]
  }
}
```

#### Comment annotation endpoints

```bash
# Get annotations (requires advanced queries enabled in the Console)
POST https://api.velt.dev/v2/commentannotations/get
{ "data": { "organizationId": "org-123", "documentId": "doc-456", "annotationIds": ["ann-789"], "pageSize": 50 } }

# Update annotations: filters select annotations, updatedData holds the change
POST https://api.velt.dev/v2/commentannotations/update
{ "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "annotationIds": ["ann-789"],
    "updatedData": { "status": { "id": "inprogress", "name": "In Progress", "type": "ongoing" } }
} }

# Delete annotations (documentId required; narrow with annotationIds, locationIds, userIds)
POST https://api.velt.dev/v2/commentannotations/delete
{ "data": { "organizationId": "org-123", "documentId": "doc-456", "annotationIds": ["ann-789"] } }

# Count annotations for a user across documents
POST https://api.velt.dev/v2/commentannotations/count/get
{ "data": { "organizationId": "org-123", "documentIds": ["doc-456"], "userId": "user-1", "statusIds": ["OPEN", "IN_PROGRESS"] } }
```

- `get` filters include `documentIds` + `groupByDocumentId`, `locationIds`, `folderId`, `annotationIds`, `userIds`, `mentionedUserIds`, `resolvedBy`, `statusIds`, created/updated time ranges, `order`, and `pageSize` / `pageToken`. Agent filters (`agentId`, `executionId`, `agentType`, `agentSource`, `agentSuggestions`, `agentComments`) are one per request.
- On `update`, `annotationIds` / `locationIds` / `userIds` are optional filters on top of the document. Without them the update targets the document's annotations, so always narrow it to the threads you mean to change.

**Delete comment annotations: agent filters (AND-combined):**

`/v2/commentannotations/delete` accepts three agent-scoped filters: `agentId` (annotations authored by a specific agent), `agentSuggestions: true` (still-pending suggestions only; accepted suggestions are never matched), and `agentUrls` (annotations stamped for any of the listed page URLs). Unlike the one-per-request agent filters on Get Comment Annotations, these three are **AND-combined** on delete, and they also intersect with `annotationIds` when both are supplied.

```bash
# Delete only the spell-check agent's still-pending suggestions on named pages.
POST https://api.velt.dev/v2/commentannotations/delete

{
  "data": {
    "organizationId": "yourOrganizationId",
    "documentId": "yourDocumentId",
    "agentId": "spell-check",
    "agentSuggestions": true,
    "agentUrls": ["https://example.com/pricing"]
  }
}
```

Scope collapses as filters drop:

- `{ agentId, agentSuggestions, agentUrls }`: one agent's still-pending suggestions on those pages only.
- `{ agentSuggestions: true }` alone: all still-pending suggestions on the document.
- `{ agentId }` alone: all of that agent's annotations on the document.
- `{ agentUrls }` alone: all agent annotations stamped for those pages.

Annotations created before URL stamping existed are never matched by `agentUrls`.

**Preconditions and error modes for agent filters:**

- **Advanced queries must be enabled on the workspace** to use any of `agentId` / `agentSuggestions` / `agentUrls`. Without it, the request fails with `NOT_FOUND` (`Advanced queries are not enabled...`) rather than widening the delete to the whole document.
- If none of the supplied `agentUrls` resolves to a valid page (blank strings or fragment-only URLs), the request fails with `INVALID_ARGUMENT`. Sanitize `agentUrls` before dispatch.

Review agents run through `/v2/agents/execution/run` already replace their own pending suggestions on re-run (see `rest-agents-execution`); use these delete filters for manual cleanup.

#### Individual comment endpoints

These operate on comments inside one existing annotation (`annotationId`, singular). Comment IDs are numbers.

```bash
# Add comments to an annotation
POST https://api.velt.dev/v2/commentannotations/comments/add
{ "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "annotationId": "ann-789",
    "commentData": [
      { "commentText": "Agreed, let's fix this", "from": { "userId": "user-2", "name": "Bob" } }
    ]
} }

# Get comments of an annotation
POST https://api.velt.dev/v2/commentannotations/comments/get
{ "data": { "organizationId": "org-123", "documentId": "doc-456", "annotationId": "ann-789", "commentIds": [153783] } }

# Update comments: commentIds + updatedData
POST https://api.velt.dev/v2/commentannotations/comments/update
{ "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "annotationId": "ann-789",
    "commentIds": [153783],
    "updatedData": { "commentText": "Updated text", "commentHtml": "<p>Updated text</p>" }
} }

# Delete comments
POST https://api.velt.dev/v2/commentannotations/comments/delete
{ "data": { "organizationId": "org-123", "documentId": "doc-456", "annotationId": "ann-789", "commentIds": [153783] } }
```

**Key points:**

- Every endpoint is `POST`; there are no GET, PUT, or DELETE HTTP methods.
- `organizationId` and `documentId` are present on every comment request (`delete` lists `organizationId` as optional, but send it).
- Annotation-level operations use `annotationIds` (array) or the `commentAnnotations[]` array on add; comment-level operations use `annotationId` (singular) plus numeric `commentIds`.
- `createOrganization` / `createDocument` on add create missing containers; `verifyUserPermissions` limits writes to users with document access.
- `commentData[]` also accepts `progress`, `actions`, `triggerNotification`, `taggedUserContacts`, and `context`; see `velt-comments-best-practices` for those.

#### Agent block on comment annotations

Both `/v2/commentannotations/add` (via the root `commentData[0]`) and `/v2/commentannotations/comments/add` accept an `agent` block that marks a comment as agent-authored. When the block is attached, the server stamps `sourceType: "agent"` on the comment; when attached to the root comment on `/v2/commentannotations/add`, the server also generates the annotation-level agent block and stamps `sourceType: "agent"` on the annotation.

**Required fields inside `agent`:**

- `agentSource`: must be `"velt"` or `"external"`.
- `agentId`: must be non-empty **for both sources**. When `agentSource` is `"velt"`, it is a built-in agent like `spell-check` or a custom agent ID that is verified server-side, and **unknown IDs return `NOT_FOUND`** instead of being silently accepted. When `agentSource` is `"external"`, it is your own opaque identifier, never validated against any registry, even if the string happens to collide with a real Velt agent name. Both `/v2/commentannotations/add` and `/v2/commentannotations/comments/add` share this validation contract.
- `reason`: finding details object. `reason.title`, `reason.description`, and `reason.severity` (one of `critical`, `high`, `medium`, `low`, `info`) are all required.

**Conditionally required:** `agentName` must be supplied when `agentSource` is `"external"` (it is the only source of truth for an external agent's display name). It is not used for `velt` agents, which resolve their name server-side.

**Incorrect:** Omitting `agentId` for an external-agent finding (the request is rejected because `agentId` is required regardless of source):

```json
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
```

**Correct:** Supply `agentId` on every agent block. For `external`, also supply `agentName`:

```bash
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
```

For a Velt built-in or verified custom agent, drop `agentName` and set `agentSource: "velt"`:

```bash
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

**Key points:**

- `agentId` is required on every agent block; the previous "optional for external" allowance is gone. Backfill any prior client that omitted it for `external` findings.
- `agentName` is required only when `agentSource` is `"external"`; do not send it for `velt` agents.
- Setting `type: "suggestion"` at the annotation level plus an `agent` block on `commentData[0]` is the canonical shape for an agent finding. The annotation-level `type` is the source of truth for the suggestion classification; the legacy `commentType: "suggestion"` no longer drives it.
- `reason` is required, and inside it `title`, `description`, and `severity` are required.

#### GET Response Shapes

The `/commentannotations/get` and `/commentannotations/comments/get` endpoints return more data than older docs suggested. Bind your consumers to the current shape, not the older one.

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

**`reactionAnnotationIds` vs. `reactionAnnotations`: both are returned, with different shapes:**

`reactionAnnotationIds` is a flat array of strings (bare IDs). `reactionAnnotations` is a parallel array of full reaction objects. Pick the one matching your consumer.

**Incorrect:** Treating `reactionAnnotations` as a bare ID array (it changed shape: it is now an array of objects, not strings).

```typescript
// WRONG: older shape, no longer accurate
const ids: string[] = comment.reactionAnnotations; // type error at runtime
```

**Correct:** Each entry in `reactionAnnotations` is a full reaction object:

```json
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

If you only need IDs (e.g. to fan out a follow-up fetch), read `reactionAnnotationIds`. If you need icon, who reacted (`fromUsers`), or when (`lastUpdated`), read `reactionAnnotations`.

**Response field notes (per the docs page):**

- `viewedBy` is **not** currently returned by `/commentannotations/get` or `/commentannotations/comments/get`. Do not depend on it being present.
- Annotation and reaction timestamps are **milliseconds since epoch** (e.g. `1777973713421`). On individual comments the docs state ISO 8601, and the documented sample shows a numeric `createdAt` next to an ISO `lastUpdated` (`"2026-05-05T09:35:15.048Z"`). Accept both a number and an ISO string when parsing comment timestamps.
- `hasDraftComments` is a boolean indicating whether the annotation contains any draft comments.
- `context.access` / `context.accessFields` are access-control metadata (e.g. `{ "default": "velt" }`).
- Legacy `from` keys (`userSnippylyId`, `clientOrganizationId`, `clientGroupId`) are gone from documented example payloads on both `/v2/commentannotations/get` and `/v2/commentannotations/comments/get` (and from every nested `from` block, including reaction `fromUsers[].from`). Do not parse or depend on them; use `userId`, `organizationId`, and `groupId` on the `from` object instead.

**Key points:**

- Annotation-level envelope now exposes `annotationId`, `annotationNumber`, `annotationIndex`, `hasDraftComments`, `locationId`, `location`, `context.*`, `visibilityConfig`, `metadata`, `recorders` directly.
- `reactionAnnotationIds` (strings) and `reactionAnnotations` (objects) are both returned; they are different shapes, not aliases.
- The `null` sentinel inside `data` indicates a requested ID that did not exist; check for it before dereferencing.
- Mixed timestamp formats: ms-epoch on annotations/reactions; comment timestamps can be ISO 8601 strings, so parse both forms.
- `from` blocks no longer include `userSnippylyId`, `clientOrganizationId`, or `clientGroupId`; use `userId`, `organizationId`, `groupId`.

**Verification Checklist:**
- [ ] Using POST method for all endpoints, with both `x-velt-api-key` and `x-velt-auth-token` headers
- [ ] Add requests send `commentAnnotations[]` with `commentData[]` items that carry a `from` user (no `annotation`, `comments`, or `commenterId` keys)
- [ ] Update requests send changes in `updatedData` and narrow the target with `annotationIds` (or `commentIds` for comments)
- [ ] `organizationId` and `documentId` are present in every request body
- [ ] Annotation IDs use the correct singular/plural form per endpoint; comment IDs are numbers
- [ ] Advanced queries are enabled before calling `/v2/commentannotations/get`
- [ ] Consumer binds to `reactionAnnotationIds` (strings) or `reactionAnnotations` (objects), not both interchangeably
- [ ] Timestamp parsing accepts ms-epoch numbers and ISO 8601 strings
- [ ] `null` entries inside `result.data` are handled (missing IDs)
- [ ] No code depends on `viewedBy` being present on GET responses
- [ ] Every `agent` block includes a non-empty `agentId`, for both `velt` and `external` sources
- [ ] `agentName` is present whenever `agentSource` is `"external"`
- [ ] `reason.title`, `reason.description`, and `reason.severity` are set on every agent block
- [ ] `agentSource: "velt"` callers handle `NOT_FOUND` on unknown `agentId` values; `agentSource: "external"` callers understand `agentId` is never validated
- [ ] Delete requests that use `agentId` / `agentSuggestions` / `agentUrls` gate on workspace advanced queries (else the call fails `NOT_FOUND` rather than widening the delete)
- [ ] `agentUrls` on delete requests are sanitized; blank or fragment-only URLs trigger `INVALID_ARGUMENT`
- [ ] Consumers of `from` blocks do not read `userSnippylyId`, `clientOrganizationId`, or `clientGroupId`

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/add-comment-annotations - "Add Comment Annotations"
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/get-comment-annotations-v2 - "Get Comment Annotations"
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/update-comment-annotations - "Update Comment Annotations"
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/delete-comment-annotations - "Delete Comment Annotations"
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/get-comment-annotations-count - "Get Comment Annotations Count"
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/add-comments - "Add Comments"
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/get-comments - "Get Comments"
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/update-comments - "Update Comments"
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/delete-comments - "Delete Comments"

---

### 2.3 Create, Update, and Version Review Agents with the Agents REST API

**Impact: HIGH (Agent configs are validated strictly and versioned; a wrong endpoint or a fetch-modify-send of redacted secrets silently breaks agents)**

Review agents review a URL and post findings as comment annotations. The `/v2/agents/*` family is all `POST` under `https://api.velt.dev/v2` with the API-key-level headers. **Identity** (`name`, `description`, `enabled`) is edited with `/v2/agents/update` and creates no version; **behavior** (instructions, context gathering, execution, post-processing, input, scope, setup) is edited with `/v2/agents/version/update`, which writes version N+1. Built-in agents (`spell-check`, `broken-links`, and others) are pre-registered: run them by ID without creating anything (see `rest-agents-builtin-options`).

**Incorrect (behavioral change sent to the identity endpoint):**

```bash
# /v2/agents/update silently drops instructions and execution, and still returns 200.
POST https://api.velt.dev/v2/agents/update
{ "data": { "agentId": "abc123def456", "instructions": "Also check footer links." } }
```

**Correct (behavioral change creates a new version):**

```bash
POST https://api.velt.dev/v2/agents/version/update
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{ "data": { "agentId": "abc123def456", "instructions": "Check headings use 'Inter'. Also check footer links." } }
# -> { "result": { "data": { "version": 4 } } }
```

#### Create Agent: required fields

`/v2/agents/create` requires `name`, `description`, `enabled`, `contextGathering` (with at least one entry in `strategies`), and `execution`. Send `"execution": {}` to accept the default `"ai"` strategy. `instructions` is required for every strategy that consumes a prompt (`ai`, `service+ai`, `stagehand-agent`, `mcp-tools`); only pure `service` agents may omit it.

```json
{
  "data": {
    "name": "Brand Color Checker",
    "description": "Verifies CTAs use the primary brand color",
    "enabled": true,
    "instructions": "Verify all CTAs use the primary brand color #1A73E8.",
    "contextGathering": { "strategies": ["web-page-text", "web-page-screenshot"] },
    "execution": {},
    "metadata": { "team": "growth" }
  }
}
```

Returns `result.data.agentId`. The workspace has a cap on custom agents; `RESOURCE_EXHAUSTED` means it is reached. Server fields (`id`, `version`, `createdAt`, `updatedAt`) are never accepted on create or version update. `metadata` is free-form client metadata.

**Config blocks to get right:**

- `contextGathering.strategies`: `web-page-text`, `web-page-screenshot`, `web-page-html`, `web-page-css`, `web-page-links`, `web-page-accessibility`, `computed-styles` (needs `strategyOptions["computed-styles"].selectors`), `robots-txt`, `sitemap-data`, `lighthouse`, `rest-api` (needs `strategyOptions["rest-api"].endpoints`, 1 to 10), `none`.
- `execution.executionStrategy`: `ai` (default), `service` / `service+ai` (need `serviceId`: `broken-links`, `crawler`, `screenshot`, `accessibility-checker`, `og-image-checker`), `stagehand-agent` (browser agent; set `contextGathering.strategies: ["none"]`), or `mcp-tools` (needs `instructions` and 1 to 5 `execution.mcpServers`, each `{ id, url, transport: "http", auth?, allowedTools?, timeoutMs? }`).
- `execution.knowledge`: only `useMemory`, `maxChunks`, `maxPatterns`, `maxActivities` (each 1 to 20). Any other key, including the removed `sourceIds`, returns `INVALID_ARGUMENT`.
- `postProcess` rejects unknown keys. Use `deletePreviousSuggestions: { enabled }` for re-run dedup (on by default). `matchAndMerge` is accepted but inert. `pinResolution` is not configurable and is rejected. `guardrails` deduplicates findings and sanitizes HTML/XSS; it is not a confidence filter. `findingEnrichment.commentFormat` is `"plain"` or `"legacy"` (default for custom agents).
- `aiConfig` on `contextGathering` / `execution` / `response` persists only `provider` (`gemini`, `claude`, `openai`) and `execution.aiConfig.maxToolTurns` (integer 1 to 16, default 8). `model` and `responseMimeType` are accepted and discarded: to pin a model, send `aiConfig` on Run Execution instead.
- `response.useAiFormatting`, `formattingPrompt`, and `response.aiConfig` are stored but have no runtime effect yet.
- `input.userContextFields[]`: `{ id, title, type: "string" | "number" | "boolean", required?, example?, defaultValue? }`. The IDs `focusIssueTypes`, `sourceAnnotationId`, `sourcePageUrl`, and `sourceElementXpath` are reserved for run scope and rejected.
- `input.supportedVariables` is response-only and server-computed; anything you send is discarded.
- `scope.crossPage`, when present, requires `enabled`, `targetProperty`, and `pageDiscovery` (`"auto"` or `"manual"`).

#### Get, update, and delete

```bash
# Single agent (custom: identity + behavioral fields; built-in: identity fields)
POST https://api.velt.dev/v2/agents/get
{ "data": { "agentId": "spell-check" } }

# List: filter "defaultOnly" | "customOnly", and/or groupId
POST https://api.velt.dev/v2/agents/get
{ "data": { "filter": "customOnly" } }

# Built-in agents accept only enabled
POST https://api.velt.dev/v2/agents/update
{ "data": { "agentId": "spell-check", "enabled": false } }

POST https://api.velt.dev/v2/agents/delete
{ "data": { "agentId": "abc123def456" } }
```

- List rows are identity-only. `executionCount` and `lastExecutedAt` appear **only on list responses**. Built-in rows carry `system: true` and `essentialDefault` (Velt's recommended default set; nothing runs automatically because of it).
- Agents marked `metadata.internal: true` are omitted from every list response but stay fetchable by `agentId`, so a list is not a complete inventory of resolvable IDs.
- Identify built-in agents by `id`; display names can change between releases.
- `update` with no recognized field is a silent no-op for custom agents and `INVALID_ARGUMENT` for built-in agents (which need `enabled`; `name`/`description` are ignored for them). Updating a non-existent agent returns `INTERNAL`, not `NOT_FOUND`.
- `delete` is idempotent (200 for an unknown ID) and first removes the agent from every group; if that cleanup fails, the delete aborts and can be retried.

#### Version updates: one-level merge and redacted secrets

`/v2/agents/version/update` merges each top-level block you send onto the stored one, but **anything nested is replaced wholesale**. Sending `scope.crossPage` with only some keys discards the stored `pages`; sending `execution.mcpServers` replaces the whole array.

`get` and `versions/list` return stored secrets (`rest-api` endpoint `auth`, `mcpServers[].auth`) as the literal `"__redacted__"`. **Sending that string back stores it as the real credential**, and the agent starts failing at execution time.

**Incorrect (fetch-modify-send round trip):**

```javascript
// veltPost(path, data): server-side POST to https://api.velt.dev with { data } and the API-key-level headers
const { agent } = (await veltPost('/v2/agents/get', { agentId })).result.data;
agent.execution.knowledge = { useMemory: true, maxChunks: 10 };
// mcpServers[].auth.token is "__redacted__" and is now saved as the token.
await veltPost('/v2/agents/version/update', { agentId, execution: agent.execution });
```

**Correct (omit secret-bearing blocks, or resend real plaintext secrets):**

```javascript
await veltPost('/v2/agents/version/update', {
  agentId,
  execution: {
    executionStrategy: 'mcp-tools',
    mcpServers: [
      { id: 'docs', url: 'https://docs.example.com/mcp', auth: { type: 'bearer', token: process.env.DOCS_MCP_TOKEN } }
    ],
    knowledge: { useMemory: true, maxChunks: 10 }
  }
});
```

- `instructions` is re-validated against the merged result; blanking it on an AI agent is rejected.
- In-flight executions stay pinned to the version they started on.
- `versions/list` returns the full history newest first, with no pagination. `versions[].id` is `"v{N}"` (for example `"v3"`) and `versions[].version` is the integer. Snapshots are behavioral only; read `name`/`description`/`enabled` from `/v2/agents/get`. An unknown agent returns an empty `versions` array, not an error.
- `versions/restore` is a single-step undo from N to N-1 with no target parameter. At version 1 it returns `FAILED_PRECONDITION`.

**Verification Checklist:**
- [ ] Every request is `POST` with `{ "data": { ... } }` and both API-key-level headers
- [ ] Create payloads include `name`, `description`, `enabled`, `contextGathering.strategies` (at least one), `execution`, and `instructions` for prompt-consuming strategies
- [ ] Identity edits go to `/v2/agents/update`; behavioral edits go to `/v2/agents/version/update`
- [ ] `postProcess` uses `deletePreviousSuggestions`, never relies on `matchAndMerge`, and never sends `pinResolution`
- [ ] Model pinning is done per run (Run Execution `aiConfig`), not on the agent config
- [ ] `knowledge` sends only the four allowed keys; `userContextFields` IDs avoid the four reserved run-scope names
- [ ] Version updates send complete nested objects and never resend `"__redacted__"` secrets
- [ ] List consumers read `executionCount` / `lastExecutedAt` from list rows and expect `metadata.internal` agents to be absent
- [ ] `versions[].id` is treated as a `v{N}` string; restore is not called at version 1
- [ ] Missing-agent handling accounts for `INTERNAL` on update and `200` on delete

**Source Pointers:**
- https://docs.velt.dev/ai/agents/overview - "Review Agents"
- https://docs.velt.dev/ai/agents/setup - "Setup"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/create - "Create Agent"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/get - "Get Agent(s)"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/update - "Update Agent"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/delete - "Delete Agent"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/version/update - "Update Agent Version"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/versions/list - "List Agent Versions"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/versions/restore - "Restore Agent Version"

---

### 2.4 Ingest and Manage Memory Knowledge Sources Asynchronously

**Impact: MEDIUM-HIGH (Ingestion is async and strictly validated; skipping the status poll, oversize inline files, or stray fields produce empty search results or rejected calls)**

Knowledge sources (guidelines, standards, policy docs) feed Memory `ask` and agent knowledge retrieval. `knowledge/ingest` returns `status: "processing"` and a `sourceId` immediately; poll `knowledge/ingest-status` until `completed` or `failed` before relying on the source. Supported types: PDF, CSV, Excel (`.xlsx`), and plain text. Inline uploads go up to 5 MB decoded; larger files up to 30 MB go through a signed upload URL.

**Incorrect (large file inline, misspelled field, no status poll):**

```json
{
  "data": {
    "source": "inline",
    "file": { "bas64": "JVBERi0xLjQK...", "mimeType": "application/pdf", "fileName": "handbook.pdf" }
  }
}
```

**Correct (by-reference flow for a large file, then poll):**

```bash
# 1. Mint a signed URL (15-minute expiry). Repeat the same org/doc scope on ingest.
POST https://api.velt.dev/v2/memory/knowledge/upload-url
{ "data": { "mimeType": "application/pdf", "fileSize": 8421376, "fileName": "brand-guidelines.pdf", "organizationId": "org_eu" } }
# -> result: { uploadUrl, fileRef: "gs://...", expiresAt }

# 2. PUT the raw bytes with the same Content-Type
curl -X PUT "$UPLOAD_URL" -H "Content-Type: application/pdf" --data-binary @brand-guidelines.pdf

# 3. Ingest by reference
POST https://api.velt.dev/v2/memory/knowledge/ingest
{ "data": { "source": "fileRef", "fileRef": "gs://bucket/path/original.pdf", "mimeType": "application/pdf", "organizationId": "org_eu" } }
# -> result: { status: "processing", sourceId: "src_9a8...", message }

# 4. Poll until terminal
POST https://api.velt.dev/v2/memory/knowledge/ingest-status
{ "data": { "sourceId": "src_9a8..." } }
# -> result: { status: "completed", extractedRulesCount, chunkCount, originalDownloadUrl, canonicalMdDownloadUrl, ... }
```

Inline ingest for files up to 5 MB:

```json
{
  "data": {
    "source": "inline",
    "file": { "base64": "JVBERi0xLjQK...", "mimeType": "application/pdf", "fileName": "brand-guidelines.pdf", "fileSize": 184320 }
  }
}
```

#### Ingestion rules

- `file` needs all four keys: `base64`, `mimeType`, `fileName` (1 to 255 chars), `fileSize` (decoded bytes, max 5,242,880). The server checks `mimeType` against the bytes; CSV and text must be valid UTF-8.
- `documentId` requires `organizationId` on `ingest` and `upload-url`. A `fileRef` ingested with a different scope than its upload URL, or from another workspace, returns `PERMISSION_DENIED`.
- Each `fileRef` can be ingested once. An expired, missing, or already-ingested object returns `FAILED_PRECONDITION`. A workspace can hold at most 50 outstanding upload URLs (`RESOURCE_EXHAUSTED` past that).
- `ingest`, `upload-url`, `ingest-status`, `delete`, and `knowledge/search` reject unknown fields with `INVALID_ARGUMENT`.
- Duplicate uploads set `dedupOf` and mirror the original's status, so a duplicate can report `processing` until the original finishes.
- On `failed`, `failureReason` is one of `pdf-llm-conversion-failed`, `storage-upload-failed`, `cloud-tasks-enqueue-failed`, `embedding-failed`, `unsupported-mime-detected-post-validation`, `workspace-deleted-mid-flow`.
- Download URLs from `ingest-status` and `list` are signed for 15 minutes. Do not store them; call again for fresh ones.

#### Search, list, rules, update, download, delete

```bash
# Search ingested content (workspace-scoped: organizationId/documentId are rejected)
POST https://api.velt.dev/v2/memory/knowledge/search
{ "data": { "query": "image format requirements", "sourceId": ["src_9a8...", "src_2b1..."], "includeRules": true, "limit": 5 } }
# -> result: { results: [{ kind?, ruleId?, sourceId?, text, score?, category? }], recordsSearched }

POST https://api.velt.dev/v2/memory/knowledge/list   { "data": {} }                          # -> result: [ up to 100 sources, newest first ]
POST https://api.velt.dev/v2/memory/knowledge/rules  { "data": { "sourceId": "src_9a8..." } }  # -> result: [{ id, content, category, index }]
POST https://api.velt.dev/v2/memory/knowledge/update { "data": { "sourceId": "src_9a8...", "newContent": "# Brand Guidelines v2\n- Always cite medical claims" } }
POST https://api.velt.dev/v2/memory/knowledge/download { "data": { "sourceId": "src_9a8..." } }  # -> result: markdown string or null
POST https://api.velt.dev/v2/memory/knowledge/delete { "data": { "sourceId": "src_9a8..." } }
```

- `knowledge/search` reads ingested files; `/v2/memory/search` reads judgments. `score` is cosine **distance**: lower is more relevant. `sourceId` is one id or an array of 2 to 30. `includeRules` must be a real boolean. On embedding failure it falls back to the most recent items with no `score`.
- `list` has no pagination: only the 100 most recent sources are reachable.
- `update` works only on rule-based sources (checklists and guideline docs); others return `FAILED_PRECONDITION`. It returns a rule diff and `newVersion`.
- `download` returns `null` with HTTP 200 for unknown, foreign, or still-processing sources; use `ingest-status` to tell them apart.
- `delete` returns `ABORTED` (409) while the source is processing or has dedup dependents (`details.dependentCount`); unknown ids return `NOT_FOUND`.

**Rate limits per API key per minute:** `ingest-status` 600, `knowledge/search` 120, `upload-url` 100, `ingest` 30, `delete` 30. Over the limit returns `RESOURCE_EXHAUSTED`; back off, and pace bulk imports and status polling.

**Verification Checklist:**
- [ ] Every ingest is followed by an `ingest-status` poll until `completed` or `failed`
- [ ] Inline files send `base64`, `mimeType`, `fileName`, and `fileSize`, and stay at or under 5 MB decoded; larger files use `upload-url` + `PUT` + `source: "fileRef"`
- [ ] The upload `PUT` uses the same `Content-Type` as the requested `mimeType`, and ingest repeats the same `organizationId` / `documentId`
- [ ] No unknown or misspelled fields are sent to the strict knowledge endpoints
- [ ] `knowledge/search` never sends `organizationId` / `documentId`, and ranks by ascending `score`
- [ ] Signed download URLs are fetched fresh, not cached
- [ ] `delete` handles `ABORTED` by waiting for a terminal status or removing dependents first
- [ ] Callers stay under the per-minute rate limits

**Source Pointers:**
- https://docs.velt.dev/ai/memory/overview - "Memory (Beta)"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/ingest - "Ingest Knowledge"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/upload-url - "Get Upload URL"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/ingest-status - "Get Ingest Status"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/search - "Search Knowledge Base"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/list - "List Knowledge Sources"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/rules - "List Extracted Rules"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/update - "Update Knowledge"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/download - "Download Canonical Markdown"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/delete - "Delete Knowledge"

---

### 2.5 Manage Advanced Webhooks via REST API

**Impact: MEDIUM (Programmatically enable advanced webhooks and manage delivery endpoints, signing secrets, and per-endpoint event/channel filters)**

Advanced Webhooks add multiple delivery endpoints, per-endpoint event/channel filtering, rate limiting, and signed payloads on top of basic webhooks. These management endpoints live under `https://api.velt.dev/v2/workspace/`. All are POST, all use **API-key-level auth** (both `x-velt-api-key` and `x-velt-auth-token` headers), and all wrap the payload in `{ "data": { ... } }`. This rule covers *managing* advanced webhooks; for receiving and verifying the delivered events, see `webhooks-advanced` (Svix).

**Required headers (every request):**

```
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN
```

**Response envelope:** success responses return `{ "result": { "status": "success", "message", "data" } }`; failures return `{ "error": { "status", "message" } }` where `status` is one of `INVALID_ARGUMENT`, `FAILED_PRECONDITION`, or `NOT_FOUND`.

#### Enable first: workspace config

Advanced webhooks must be provisioned before any endpoint can be created. The **first** `update` call must include `isEnabled: true`, which provisions the underlying webhook application. Until then, the endpoint-management APIs return `FAILED_PRECONDITION`.

```bash
# Get config (no body params required)
POST https://api.velt.dev/v2/workspace/advancedwebhookconfig/get
{ "data": {} }
# → data: { isEnabled, encryptData, encodeData, publicKey, enableDataProtection }

# Update config (partial; at least one field required; first call must set isEnabled:true)
POST https://api.velt.dev/v2/workspace/advancedwebhookconfig/update
{ "data": { "isEnabled": true, "encryptData": false, "encodeData": false } }
```

If advanced webhooks are not available for the workspace at all, `advancedwebhookconfig/get` returns `FAILED_PRECONDITION` ("Advanced webhooks are not available for this workspace."). Contact Velt to enable the feature.

#### Manage delivery endpoints

All four endpoint operations require advanced webhooks to already be enabled (else `FAILED_PRECONDITION`).

```bash
# Create an endpoint: url is required and must be a valid http(s) URL.
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

# List endpoints: paginated via opaque iterator cursor (limit 1 to 250). Omit iterator on the first page.
POST https://api.velt.dev/v2/workspace/advancedwebhook/endpoints/get
{ "data": { "limit": 50 } }
# → data: { endpoints: [...], iterator, prevIterator, done }
# When done === false, pass the returned iterator to fetch the next page.

# Update an endpoint: endpointId required; at least one other field; partial (omitted fields unchanged)
POST https://api.velt.dev/v2/workspace/advancedwebhook/endpoints/update
{ "data": { "endpointId": "ep_...", "description": "Updated", "disabled": false } }

# Delete an endpoint: permanent; immediately stops deliveries and invalidates the signing secret
POST https://api.velt.dev/v2/workspace/advancedwebhook/endpoints/delete
{ "data": { "endpointId": "ep_..." } }
# → data: { endpointId, deleted: true }
```

#### Retrieve the signing secret

The signing secret is generated at creation and fetched separately. Use it to verify the signature on delivered webhook payloads (see `webhooks-advanced`). Treat it like a credential.

```bash
POST https://api.velt.dev/v2/workspace/advancedwebhook/endpoints/secret/get
{ "data": { "endpointId": "ep_..." } }
# → data: { endpointId, secret: "whsec_..." }
```

**Incorrect (creating an endpoint before enabling advanced webhooks, or trying to supply your own secret):**

```bash
# BUG 1: no prior advancedwebhookconfig/update with { isEnabled: true } →
#         { "error": { "status": "FAILED_PRECONDITION", "message": "Advanced webhooks are disabled for this workspace..." } }
# BUG 2: "secret" is ignored; the signing secret is always server-generated and only readable via endpoints/secret/get.
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

**Verification Checklist:**
- [ ] Both `x-velt-api-key` and `x-velt-auth-token` headers sent on every request (API-key-level auth)
- [ ] Advanced webhooks enabled via `advancedwebhookconfig/update` with `{ isEnabled: true }` before any endpoint call
- [ ] Endpoint URLs used verbatim including the `/v2/workspace/advancedwebhook/...` path (basic-webhook config endpoints `webhookconfig-get/update` are separate)
- [ ] `filterTypes` / `channels` are non-empty arrays when provided (omit them to receive all events / all channels)
- [ ] Signing secret is never sent in `create`; it is read back from `endpoints/secret/get` and stored securely (never client-side)
- [ ] `FAILED_PRECONDITION` handled as "feature disabled/not provisioned"; `INVALID_ARGUMENT` as validation failure; `NOT_FOUND` as unknown endpoint
- [ ] List pagination loops on `data.iterator` while `data.done === false`

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/advancedwebhookconfig-get - "Get Advanced Webhook Config"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/advancedwebhookconfig-update - "Update Advanced Webhook Config"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/advancedwebhook-endpoints-create - "Create Advanced Webhook Endpoint"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/advancedwebhook-endpoints-secret-get - "Get Advanced Webhook Endpoint Secret"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/advancedwebhook-endpoints-get - "Get Advanced Webhook Endpoints"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/advancedwebhook-endpoints-update - "Update Advanced Webhook Endpoint"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/advancedwebhook-endpoints-delete - "Delete Advanced Webhook Endpoint"

---

### 2.6 Manage Notifications and Notification Config via REST API

**Impact: MEDIUM (Wrong payload nesting or a missing notifyAll false sends notifications to the whole organization or drops them)**

Notification fields sit **directly under `data`** (there is no `notification` wrapper object). `notifyAll` **defaults to `true`**, which sends the notification to every user in the organization; set `notifyAll: false` to target only `notifyUsers`. All endpoints are `POST` with the API-key-level headers.

**Incorrect (nested `notification` object, `notifyAll` left at its default):**

```json
{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "notification": {
      "displayHeadlineMessageTemplate": "{actionUser} assigned you to {taskName}",
      "actionUser": { "userId": "user-1" },
      "notifyUsers": [{ "userId": "user-2" }]
    }
  }
}
```

**Correct (top-level fields, explicit `notifyAll: false`):**

```bash
POST https://api.velt.dev/v2/notifications/add

{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "notificationId": "task-assigned-42",
    "actionUser": { "userId": "user-1", "name": "Alice", "email": "alice@example.com" },
    "displayHeadlineMessageTemplate": "{actionUser} assigned you to {taskName}",
    "displayHeadlineMessageTemplateData": {
      "actionUser": { "userId": "user-1", "name": "Alice", "email": "alice@example.com" },
      "taskName": "Fix login bug"
    },
    "displayBodyMessage": "Due Friday",
    "notifyUsers": [{ "userId": "user-2", "name": "Bob", "email": "bob@example.com" }],
    "notifyAll": false,
    "notificationSourceData": { "taskId": "42" }
  }
}
```

**Fields on `POST /v2/notifications/add`:**

| Field | Required | Notes |
|-------|----------|-------|
| `organizationId`, `documentId` | Yes | `createOrganization` / `createDocument` create them if missing |
| `actionUser` | Yes | User who took the action |
| `notifyUsers` | Yes | Recipients |
| `notifyAll` | No | Default `true` (whole organization). Set `false` to notify only `notifyUsers` |
| `displayHeadlineMessageTemplate` | Conditional | Required unless `isNotificationResolverUsed` is `true`. Variables use `{name}` syntax |
| `displayHeadlineMessageTemplateData` | No | Values for template variables: `actionUser`, `recipientUser`, or any custom string field |
| `displayBodyMessage` | Conditional | Required unless `isNotificationResolverUsed` is `true` |
| `notificationId` | No | Auto-generated when omitted. Set it to prevent duplicates. Only `_` and `-` special characters |
| `verifyUserPermissions` | No | Default `false`. When `true`, only users with access to the document are notified |
| `notificationSource` | No | `'custom'` routes through the Notification Resolver; other values include `'comment'`, `'huddle'`, `'crdt'` |
| `notificationSourceData` | No | Any object; returned in the click callback |
| `context` | No | `{ access: { key: value } }` for Access Context filtering |

#### Resolver-eligible notifications (self-hosted content)

When notification content lives on your infrastructure and is resolved at read time by the Notification Resolver, omit `displayHeadlineMessageTemplate` and `displayBodyMessage`, and set both `isNotificationResolverUsed: true` and `notificationSource: 'custom'`. Only `notificationSource === 'custom'` notifications are routed through the resolver.

```json
{
  "data": {
    "organizationId": "yourOrganizationId",
    "documentId": "yourDocumentId",
    "actionUser": { "userId": "yourUserId", "name": "User Name", "email": "user@example.com" },
    "notificationId": "custom-notif-001",
    "isNotificationResolverUsed": true,
    "notificationSource": "custom",
    "notifyUsers": [{ "userId": "recipientUserId", "email": "recipient@example.com" }],
    "notifyAll": false
  }
}
```

Setting only `isNotificationResolverUsed: true` without `notificationSource: 'custom'` does not route through your data provider.

#### Get, update, and delete notifications

```bash
# Get (requires advanced queries). Pass documentId or userId; notificationIds max 30.
POST https://api.velt.dev/v2/notifications/get
{ "data": { "organizationId": "org-123", "userId": "user-2", "pageSize": 20, "order": "desc" } }
# -> result.data[], result.pageToken

# Update: notifications[] items keyed by id; mark read with readByUserIds
POST https://api.velt.dev/v2/notifications/update
{ "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "notifications": [
      { "id": "task-assigned-42", "readByUserIds": ["user-2"], "persistReadForUsers": true }
    ]
} }

# Delete by organizationId plus any of documentId, locationId, userId, notificationIds
POST https://api.velt.dev/v2/notifications/delete
{ "data": { "organizationId": "org-123", "documentId": "doc-456", "notificationIds": ["task-assigned-42"] } }
```

- `update` and `delete` return `result.data[notificationId] = { success, message }`; check every entry.
- `get` filters results by comment visibility: a notification for a private comment is returned only to users who can see that comment.
- `delete` with only `organizationId` + `documentId` deletes every notification on that document. Narrow it with `notificationIds` when you mean specific ones.

#### Notification preferences (per user)

```bash
# Set preferences for users; omit documentIds to set the organization-level default
POST https://api.velt.dev/v2/notifications/config/set
{ "data": {
    "organizationId": "org-123",
    "userIds": ["user-2"],
    "documentIds": ["doc-456"],
    "config": { "inbox": "ALL", "email": "MINE", "slack": "NONE" }
} }

# Get preferences for one user (documentIds max 30, or getOrganizationConfig: true)
POST https://api.velt.dev/v2/notifications/config/get
{ "data": { "organizationId": "org-123", "userId": "user-2", "getOrganizationConfig": true } }
```

Channel values are `ALL`, `MINE`, or `NONE`. These endpoints require the notifications feature enabled in the Velt Console. For frontend notification setup, see `velt-notifications-best-practices`.

**Verification Checklist:**
- [ ] Notification fields are top-level under `data`, with no `notification` wrapper
- [ ] `notifyAll: false` is set whenever only `notifyUsers` should receive it
- [ ] Template variables in `displayHeadlineMessageTemplate` match keys in `displayHeadlineMessageTemplateData`
- [ ] Resolver-mode writes set both `isNotificationResolverUsed: true` and `notificationSource: 'custom'` and omit the templates
- [ ] Updates send `notifications: [{ id, ... }]`; read state uses `readByUserIds`
- [ ] Preference endpoints are `/v2/notifications/config/set` and `/v2/notifications/config/get` with `ALL` / `MINE` / `NONE`
- [ ] Per-item `success: false` entries are handled on update and delete
- [ ] Both API-key-level headers are included

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/notifications/add-notifications - "Add Notifications"
- https://docs.velt.dev/api-reference/rest-apis/v2/notifications/get-notifications-v2 - "Get Notifications"
- https://docs.velt.dev/api-reference/rest-apis/v2/notifications/update-notifications - "Update Notifications"
- https://docs.velt.dev/api-reference/rest-apis/v2/notifications/delete-notifications - "Delete Notifications"
- https://docs.velt.dev/api-reference/rest-apis/v2/notifications/set-config - "Set Config"
- https://docs.velt.dev/api-reference/rest-apis/v2/notifications/get-config - "Get Config"
- https://docs.velt.dev/self-hosting/partial/notifications - "Notification Resolver"

---

### 2.7 Manage Organizations, Documents, Folders, and User Groups via REST API

**Impact: MEDIUM (The resource hierarchy must exist with the right access type before comments, presence, or agents can use it)**

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

#### Organizations

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

#### Documents

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

#### Folders

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

#### User groups

```bash
POST https://api.velt.dev/v2/organizations/usergroups/add
{ "data": { "organizationId": "org-123", "organizationUserGroups": [ { "groupId": "engineering", "groupName": "Engineering" } ] } }

POST https://api.velt.dev/v2/organizations/usergroups/users/add
{ "data": { "organizationId": "org-123", "organizationUserGroupId": "engineering", "userIds": ["user-1", "user-2"] } }

# Remove specific users, or all users with deleteAll: true
POST https://api.velt.dev/v2/organizations/usergroups/users/delete
{ "data": { "organizationId": "org-123", "organizationUserGroupId": "engineering", "userIds": ["user-2"] } }
```

#### Allowed domains

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

---

### 2.8 Manage Users and GDPR Data via REST API

**Impact: HIGH (User provisioning and GDPR deletion are production-critical; the wrong scope field grants or revokes access at the wrong level)**

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

#### Get, update, and delete users

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

#### GDPR data operations

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

---

### 2.9 Provision Workspaces and API Keys with Workspace-Level Auth

**Impact: MEDIUM (Production keys are gated and region choice is fixed at creation; the wrong auth pair or region string fails the call)**

`/v2/workspace/create` is public and returns a workspace ID and workspace auth token. API key management (`apikey/create`, `apikey/update`, `apikeys/get`, `authtokens/get`, `authtoken/reset`) uses those as **workspace-level** headers (`x-velt-workspace-id`, `x-velt-workspace-auth-token`). Per-key settings (`apikeyconfig/*`, `domains/*`, `webhookconfig/*`, `emailconfig/*`) then use the **API-key-level** pair.

**Incorrect (API-key headers on a workspace-level endpoint, region on a testing key):**

```bash
curl -X POST https://api.velt.dev/v2/workspace/apikey/create \
  -H 'Content-Type: application/json' \
  -H 'x-velt-api-key: velt_api_key_1' \
  -H 'x-velt-auth-token: your_auth_token' \
  -d '{ "data": { "ownerEmail": "owner@example.com", "type": "testing", "persistenceDBRegion": "eur3" } }'
```

**Correct (workspace-level headers; region only on a production key):**

```bash
curl -X POST https://api.velt.dev/v2/workspace/apikey/create \
  -H 'Content-Type: application/json' \
  -H 'x-velt-workspace-id: workspace_abc123' \
  -H 'x-velt-workspace-auth-token: your_workspace_auth_token' \
  -d '{
    "data": {
      "ownerEmail": "owner@example.com",
      "type": "production",
      "apiKeyName": "EU Production Key",
      "persistenceDBRegion": "eur3",
      "createAuthToken": true
    }
  }'
# -> { "result": { "status": "success", "data": { "apiKey": "your_new_api_key" } } }
```

#### Create a workspace (public)

```bash
POST https://api.velt.dev/v2/workspace/create
{ "data": { "ownerEmail": "owner@example.com", "name": "John Doe", "workspaceName": "My Workspace" } }
# -> result.data: { id, name, owner, authToken, apiKeyList: { "velt_api_key_1": { id, apiKeyName, type: "testing" } } }
```

- `apiKeyList` is a keyed object, not an array: read the first key with `Object.keys(result.data.apiKeyList)[0]`.
- Disposable email domains are blocked and the endpoint is IP rate limited. One email can own up to 5 workspaces; additional workspaces require the root workspace to be on a paid plan.
- Read that key's auth token with `/v2/workspace/authtokens/get` (`{ "data": { "apiKey": "velt_api_key_1" } }`) before calling API-key-level endpoints.

#### API keys: testing vs. production

| Field | Notes |
|-------|-------|
| `ownerEmail`, `type` | Required. `type` is `"testing"` or `"production"` |
| `persistenceDBRegion` | Production only. Any region from Supported Regions, such as `us-central1`, `europe-west1`, or the multi-regions `eur3` / `nam5`. Omit for the default North America region |
| `createAuthToken` | Recommended `true` |
| `apiKeyName`, `allowedDomains`, `addLocalHostToAllowedDomains` | Optional setup |
| `useEmailService`, `useWebhookService`, `useNotificationService` | Service toggles, with `emailServiceConfig` / `webhookServiceConfig` |
| `setDefaultNotificationTriggers`, `setDefaultEmailTriggers` | Seed default triggers when enabling those services |
| `enablePrivateComments`, `requireAutoOrgUser` | Initial flags |

Production key creation is gated: the workspace must be enabled for self-serve production keys and be on a paid plan. Errors to handle:

| Status | When |
|--------|------|
| `INVALID_ARGUMENT` | Missing or invalid `ownerEmail` / `type`, or an unsupported (or empty-string) region |
| `PERMISSION_DENIED` | Invalid workspace credentials, or the workspace is not allowed to create production keys |
| `FAILED_PRECONDITION` | Production key requested before the workspace is on a paid plan |
| `RESOURCE_EXHAUSTED` | The workspace reached its maximum number of production keys |

Choose the region when you create the production key; persistent data (Comments, Notifications, Recordings, and so on) is stored there.

#### Other workspace-level calls

```bash
POST https://api.velt.dev/v2/workspace/apikeys/get     { "data": { "pageSize": 50 } }        # paginate with nextPageToken
POST https://api.velt.dev/v2/workspace/apikey/update   { "data": { "apiKey": "velt_api_key_1", "apiKeyName": "Renamed" } }
POST https://api.velt.dev/v2/workspace/authtokens/get  { "data": { "apiKey": "velt_api_key_1" } }
POST https://api.velt.dev/v2/workspace/authtoken/reset { "data": { "apiKey": "velt_api_key_1" } }   # -> data.newAuthToken
```

#### Per-key app config (API-key-level)

```bash
POST https://api.velt.dev/v2/workspace/apikeyconfig/update
{ "data": {
    "requireJwtToken": true,
    "defaultDocumentAccessType": "restricted",
    "aiModelApiKey": [ { "provider": "anthropic", "customerApiKey": "sk-ant-..." } ]
} }
```

- At least one field is required and unknown fields are rejected. Writes merge; nothing is removed.
- `aiModelApiKey[].provider` is `openai`, `anthropic`, or `gemini`. Keys are encrypted at rest and returned only masked under `aiModelsConfig`. Review agents then run model calls on your own provider keys (see `rest-agents-execution`).
- `defaultDocumentAccessType` is `public`, `restricted`, or `organizationPrivate`.

**Verification Checklist:**
- [ ] `apikey/create`, `apikey/update`, `apikeys/get`, `authtokens/get`, `authtoken/reset` use `x-velt-workspace-id` + `x-velt-workspace-auth-token`
- [ ] `apikeyconfig/*`, `domains/*`, `webhookconfig/*`, `emailconfig/*` use `x-velt-api-key` + `x-velt-auth-token`
- [ ] `persistenceDBRegion` is only sent with `type: "production"` and uses a name from Supported Regions
- [ ] Production key errors (`PERMISSION_DENIED`, `FAILED_PRECONDITION`, `RESOURCE_EXHAUSTED`) are surfaced, not retried
- [ ] `apiKeyList` from `/workspace/create` is read as an object, not an array
- [ ] Workspace and API auth tokens are stored server-side only

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/create - "Create Workspace"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/apikey-create - "Create API Key"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/apikeys-get - "Get API Keys"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/apikey-update - "Update API Key"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/authtokens-get - "Get Auth Tokens"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/authtoken-reset - "Reset Auth Token"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/apikeyconfig-update - "Update API Key Config"
- https://docs.velt.dev/security/supported-regions - "Supported Regions"

---

### 2.10 Query Memory with Search, Ask, Suggest, and Judgments Query

**Impact: HIGH (Memory responses have no data wrapper and its filters match stored values exactly; wrong decision values or scope ids silently return nothing or the whole workspace)**

Memory (Beta) records every review decision as a read-only **judgment** and lets you query them over REST: `search` returns raw decision records, `ask` returns a written answer with citations, `suggest` recommends approve or reject for a new item, and `judgments/query` lists by metadata. All are `POST` under `https://api.velt.dev/v2/memory/` with the API-key-level headers. Unlike most v2 endpoints, **Memory responses put fields directly on `result`** (no `result.data`).

**Incorrect (`data` wrapper on the read, invented decision value, lone `documentId`):**

```javascript
const res = await veltPost('/v2/memory/search', {
  query: 'unsupported medical claim',
  documentId: 'pricing-page',          // ignored without organizationId: searches the whole workspace
  filters: { decision: 'reject' }      // stored value is "rejected": matches nothing
});
const hits = res.result.data.results;  // undefined: Memory has no data wrapper
```

**Correct (scoped by organization, exact decision value, read `result` directly):**

```javascript
// veltPost(path, data): server-side POST to https://api.velt.dev with { data } and the API-key-level headers
const res = await veltPost('/v2/memory/search', {
  query: 'unsupported medical claim',
  organizationId: 'org_eu',
  documentIds: ['pricing-page', 'homepage-redesign'],
  limit: 5,
  filters: { decision: 'rejected', judgeType: 'human' }
});
const { results, totalInScope } = res.result;
// results[]: { recordId, reasoning, decision, confidence, actionUser, createdAt, similarity, scope, agent }
```

#### Scoping (search, ask, judgments/query)

| Field | Rule |
|-------|------|
| `organizationId` | Limits the read to one organization (`orgId` alias on search/ask) |
| `documentId` | Applied **only with `organizationId`**; alone it is ignored and the read stays workspace-wide |
| `documentIds` | 1 to 25 ids, only with `organizationId`. `documentId` wins when both are sent. Empty arrays, more than 25 ids, or empty ids return `INVALID_ARGUMENT` |
| `filters.decision` | Exact stored value: `comment`, `resolve`, `approved`, `rejected`, `in_progress`, `agree`, `disagree`, `endorse`, `document_approved`, `document_rejected` |
| `filters.judgeType` | `human` or `agent` |
| `filters.dateRange` | `{ start, end }` as ISO-8601 strings or epoch ms; `start` must not be after `end` |
| `filters.excludeDocumentIds` | 1 to 20 ids to leave out |
| `filters.annotationId` | Reads one comment thread oldest-first. **Requires `organizationId`** |
| `recencyDays` | 1 to 365. Returns the last N complete UTC days instead of a semantic match (good for digests); today's activity is excluded |

`search` also takes `limit` (1 to 50, default 10), `embeddingType` (`review` default, or `content`), and an explicit `scope` (`document`, `organization`, `apiKey`). Filters run after retrieval over the top `limit * 3` matches, so a selective filter can return fewer results than exist: use `judgments/query` for exhaustive metadata lookups. `totalInScope` is the count returned, not a workspace total.

#### Ask

```bash
POST https://api.velt.dev/v2/memory/ask
{ "data": { "question": "How do we handle copy that makes medical claims?", "organizationId": "org_eu" } }
# -> result: { answer, citations: [{ recordId, snippet }], confidence, recordsSearched }
```

- An empty `answer` with `confidence: 0` means Memory has no grounding context yet (a new workspace starts empty). Show "nothing yet"; do not substitute a model-generated answer.
- `citations[].recordId` is not verified against the retrieved set; handle ids that do not resolve.
- `ask` ignores `limit`. With `documentIds`, an answer comes back empty when none of those documents has activity. Reviewer profiles, patterns, and alerts stay workspace-wide inputs even when you exclude documents.

#### Suggest

```bash
POST https://api.velt.dev/v2/memory/suggest
{ "data": { "query": "Ad copy: clinically proven to reduce wrinkles", "organizationId": "org_eu" } }
# -> result: { primary: { recommendation: "approve" | "reject", confidence, basedOn, scope, scopeLabel, topReasons, uniqueReviewers, caveats } | null, conflict: {...} | null }
```

- `primary` is `null` when nothing matched or fewer than 2 records support the leading decision. Handle it as "no recommendation".
- `conflict` is set only when both sides have 2 or more records; show it as reviewer disagreement.
- Only `approved`, `agree`, `endorse`, `document_approved` count toward approve, and only `rejected`, `disagree`, `document_rejected` toward reject.
- `suggest` takes `query`, `organizationId`, and `documentId` (no `documentIds`).

#### Judgments query

```bash
POST https://api.velt.dev/v2/memory/judgments/query
{ "data": { "organizationId": "org_eu", "documentIds": ["checkout-flow-v3"], "decision": "rejected", "limit": 20 } }
# -> result: { results[], total }
```

Filters here are top-level fields (`decision`, `judgeType`, `contentType`, `reviewerId`, `annotationId`), not a `filters` object. `limit` is 1 to 100 (default 20). Returned `organizationId` / `documentId` are Velt's internal ids, not the ids you sent. There is no "create judgment" endpoint: judgments come from your users' review activity and your agents' findings.

#### Errors

Validation errors return `INVALID_ARGUMENT` with `details.issues` listing every failing field. A missing `x-velt-auth-token` is `INVALID_ARGUMENT`; an auth token that does not match the API key is `PERMISSION_DENIED`. `RESOURCE_EXHAUSTED` means rate limited.

**Verification Checklist:**
- [ ] Memory responses are read from `result` directly, never `result.data`
- [ ] `documentId` / `documentIds` are always sent with `organizationId`; `documentIds` has 1 to 25 non-empty ids
- [ ] `filters.decision` uses exact stored values (`approved`, `rejected`, ...), not `approve` / `reject`
- [ ] `filters.annotationId` (or `annotationId` on judgments/query) is sent with `organizationId`
- [ ] `ask` callers handle `answer: ""` with `confidence: 0`, and unresolved citation ids
- [ ] `suggest` callers handle `primary: null` and a non-null `conflict`
- [ ] Exhaustive listings use `judgments/query`, not filtered `search`
- [ ] `details.issues` is surfaced on validation errors

**Source Pointers:**
- https://docs.velt.dev/ai/memory/overview - "Memory (Beta)"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/search - "Search Judgments"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/ask - "Ask Memory"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/suggest - "Suggest Decision"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/judgments/query - "Query Judgments"

---

### 2.11 Read Memory Insights and Manage Alerts with Their Real Limits

**Impact: LOW-MEDIUM (Insight endpoints return capped counts and nullable results, and alert config is stored but not applied; misreading them shows wrong numbers or broken settings)**

Memory derives reviewer profiles, decision patterns, stats, and alerts from accumulated judgments. These endpoints return their payload directly on `result`, often with caps, nulls, or Velt-internal ids. Treat them as approximate dashboards, not exact ledgers.

**Incorrect (profile without a target, capped stat shown as exact):**

```javascript
const profile = (await veltPost('/v2/memory/profiles/get', {})).result;   // null: no targetUserId
const { totalActivities } = (await veltPost('/v2/memory/stats/get', {})).result;
render(`${totalActivities} reviews`);                                       // 10000 means "at least 10000"
```

**Correct (send `targetUserId`, handle null, label capped counts):**

```javascript
// veltPost(path, data): server-side POST to https://api.velt.dev with { data } and the API-key-level headers
const profile = (await veltPost('/v2/memory/profiles/get', { targetUserId: 'u_sarah' })).result;
if (!profile) renderEmpty('Not enough review history yet');

const stats = (await veltPost('/v2/memory/stats/get', {})).result;
const fmt = (n, cap) => (n >= cap ? `${cap}+` : `${n}`);
render(`${fmt(stats.totalActivities, 10000)} reviews, ${fmt(stats.totalPatterns, 100)} patterns`);
```

#### Insights

- **`profiles/get`**: always send `targetUserId`; the reviewer is not inferred from the auth token. Returns `null` when no profile exists. `avgReviewTimeSeconds` is always `0`. `orgBreakdown` is keyed by Velt's internal organization id; match on `clientOrganizationId` to map back to your id.
- **`patterns/get`** (`{ "data": {} }`): up to 100 patterns, most recently updated first, no paging. `scope` is `apiKey` or `org`, and `organizationId` is internal. Rows with `confidence` below 0.1, or `category` of `no-data` / `uncategorized`, are untagged activity counts that `ask` does not reason from. Optional `enforcementRate`, `uniqueReviewers`, `topSourceRecordIds`.
- **`stats/get`** (`{ "data": {} }`): `totalActivities` caps at 10000, `totalProfiles` at 500, `totalPatterns` at 100; `totalKnowledgeSources` is exact.

#### Alerts

```bash
POST https://api.velt.dev/v2/memory/alerts/list    { "data": {} }
# -> result: [ up to 50 active alerts: { id, alertType, severity, title, description, evidence, suggestedAction?, actionUrl?, status, createdAt, dedupKey? } ]

POST https://api.velt.dev/v2/memory/alerts/dismiss { "data": { "alertId": "alert_1", "user": { "uid": "user_1" } } }
POST https://api.velt.dev/v2/memory/alerts/action  { "data": { "alertId": "alert_1" } }
# -> result: { success: true }

POST https://api.velt.dev/v2/memory/alerts/config/update
{ "data": { "config": { "enabled": true, "maxAlertsPerWeek": 3, "severityThreshold": "medium", "enabledAlertTypes": ["anomaly"] } } }
POST https://api.velt.dev/v2/memory/alerts/config/get { "data": {} }
```

- `alertType` is `anomaly`, `configuration_drift`, `emerging_standard`, or `standards_drift`; `evidence.metric` names the trend (`approvalRate`, `volume`, `staleReferences`, `enforcementRate`, `violationRate`). `severity` is `high`, `medium`, or `low`.
- Dismissed and actioned alerts leave the list. Actioned alerts cannot be restored. Omitting `user` on dismiss stores `dismissedBy` as an empty string.
- An unknown `alertId` on dismiss or action returns `INTERNAL` (HTTP 500), not `NOT_FOUND`.
- Alert config values are **stored and returned but not applied** to alert generation today. Alerts are capped at 3 per rolling 7 days per workspace whatever you configure. Unknown keys and alert types are stored as sent.

**Verification Checklist:**
- [ ] `profiles/get` always sends `targetUserId` and handles a `null` result
- [ ] Capped stats (`totalActivities`, `totalProfiles`, `totalPatterns`) are displayed as lower bounds at their cap
- [ ] Internal `organizationId` values on patterns and profiles are not compared with your own ids
- [ ] Low-confidence or `no-data` / `uncategorized` patterns are not presented as findings
- [ ] Dismiss and action callers validate `alertId` first, since unknown ids return `INTERNAL`
- [ ] UI copy does not promise that alert config changes alert generation

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/profiles/get - "Get Reviewer Profile"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/patterns/get - "Get Patterns"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/stats/get - "Get Stats"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/alerts/list - "List Alerts"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/alerts/dismiss - "Dismiss Alert"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/alerts/action - "Mark Alert Actioned"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/alerts/config/get - "Get Alert Config"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/alerts/config/update - "Update Alert Config"

---

### 2.12 Run Agent Executions Asynchronously and Read Results Correctly

**Impact: HIGH (Executions are async and their statuses are counter-intuitive; treating failed as broken or skipping the poll loop misreports every run)**

`POST /v2/agents/execution/run` returns an `executionId` immediately. Poll `POST /v2/agents/execution/get` until `execution.status !== "running"`, and read per-URL findings only from `get` with `includeResults: true`. Status names describe findings, not health: **`passed` means no findings, `failed` means findings were found**, `partial` means some pages errored, and `error` means nothing usable was produced.

**Incorrect (treats `failed` as a broken run and reads results from the list endpoint):**

```javascript
const { executionId } = (await veltPost('/v2/agents/execution/run', { agentId, url })).result.data;
const list = await veltPost('/v2/agents/execution/list', { agentId });
const run = list.result.data.executions[0];
if (run.status === 'failed') retry(); // Wrong: "failed" means the agent found issues.
// Also wrong: run is missing organizationId/documentId, and list rows never include results.
```

**Correct (required IDs, poll Get Execution, branch on status):**

```javascript
// veltPost(path, data): server-side POST to https://api.velt.dev with { data } and the API-key-level headers
const run = await veltPost('/v2/agents/execution/run', {
  agentId: 'abc123def456',
  url: 'https://example.com/pricing',
  organizationId: 'org_001',
  documentId: 'doc_001',     // must already exist; findings land here as comment annotations
  ranBy: { userId: 'user_123' }
});
const { executionId } = run.result.data;

let execution;
do {
  await new Promise((r) => setTimeout(r, 5000));
  execution = (await veltPost('/v2/agents/execution/get', { executionId })).result.data.execution;
} while (execution.status === 'running');

switch (execution.status) {
  case 'passed':  /* clean: no findings */ break;
  case 'failed':  /* findings found: fetch them */ break;
  case 'partial': /* some pages errored: see resultsSummary.erroredUrls */ break;
  case 'error':   /* see execution.error.code and error.retryable */ break;
  case 'skipped': /* precondition not met */ break;
}

const { results } = (await veltPost('/v2/agents/execution/get', { executionId, includeResults: true })).result.data;
const findings = results.flatMap((row) => row.agentResult.findings);
```

#### Run Execution request

| Field | Notes |
|-------|-------|
| `agentId` or `agentIds` | One is required. `agentIds` runs 1 to 10 distinct agents; when both are sent, `agentId` wins and `agentIds` is ignored |
| `url` | Required. Public `http(s)` seed URL. Loopback, link-local, metadata, private-network, `*.local` and `*.internal` hosts are refused |
| `organizationId`, `documentId` | Required. Unknown document returns `NOT_FOUND` |
| `urls` | Optional page list, max 500: absolute URLs or site-relative paths on the same host as `url`. Skips the crawl |
| `pageListTotal` | Optional, with `urls`: size of the source list before you cut it. Larger than the run's pages adds a `pages-truncated` warning |
| `crossPageExecute`, `maxUrlsToProcess` | Crawl mode (default `false`, max default 50). Ignored and derived when `urls` is sent |
| `deviceType` | `"desktop"` (default) or `"mobile"`. `mobile-inspector` always runs as mobile |
| `annotationVisibility` | `"private"` (default, organization members only) or `"public"` |
| `trigger`, `workflowExecutionId` | `"standalone"` (default) or `"workflow"` with the parent workflow execution ID |
| `ranBy` | `{ userId, name?, email? }` |
| `userContext` | Values for the agent's `userContextFields`, built-in per-run options, and the four run-scope keys below |
| `aiConfig` | Per-run model override, validated against an allowlist (see below) |

**Page lists.** `urls` entries are normalized: blank entries skipped, `#fragment` dropped, review toolbar query params removed, other query params kept, off-host or non-URL entries and repeats dropped. More than 500 entries, or a list where nothing survives, returns `INVALID_ARGUMENT`. The execution then reports `config.pageSource: "list"`, `config.seedUrl` as the first page, and `crawlerResults.status: "skipped"`.

**Several agents (`agentIds`).** Each agent gets its own execution and every other field applies to all of them. On several pages, the page list is resolved once and each page loads once for all agents. The response differs from a single run:

```json
{ "result": { "status": "success", "message": "Agent suite created successfully", "data": {
  "executions": [ { "agentId": "spell-check", "executionId": "exec_..._spellcheck" } ],
  "failed": [ { "agentId": "broken-links", "code": "already-exists", "message": "Agent execution is already running ... Execution ID: exec_..." } ]
} } }
```

Poll every `executionId` in `data.executions`. Per-agent problems (`already-exists`, `invalid-argument`, `not-found`, `permission-denied`, `resource-exhausted`, `internal`) land in `data.failed` and the others still start. The request fails only when no agent could start; then `error.details.failed` lists every agent.

**Run-scope `userContext` keys (any agent):**

| Key | Effect |
|-----|--------|
| `focusIssueTypes` | 1 to 50 issue types. Reports only those, and replaces only the agent's earlier pending suggestions of those types (a focused recheck) |
| `sourceAnnotationId` | The comment that asked for the run; copied to each finding's `agent.reason` |
| `sourcePageUrl` | Page of that comment; copied with `sourceAnnotationId` |
| `sourceElementXpath` | XPath of the element the comment is pinned on; findings on that element of `sourcePageUrl` are dropped |

A malformed run-scope key returns `INVALID_ARGUMENT` before any run starts, with `error.details.issues`. Re-run dedup follows `postProcess.deletePreviousSuggestions` and never touches suggestions a user already resolved.

**Per-run `aiConfig`.** Unknown keys are rejected and an empty object is rejected. Fields: `provider` (`gemini`, `claude`, `openai`), `model` (allowlisted), `defaultModels` (per-provider map), `maxToolTurns` (1 to 16), `modelChecks` (only `"image-crop"` today). Send `provider` with `model`: a `model` without `provider` that does not match the agent's resolved provider is silently dropped and the run still returns 200. Get Execution reports the answering model in `llmModel` and any provider fallbacks in `providerFallbacks`. If the workspace stored its own provider keys (`aiModelApiKey` on `/v2/workspace/apikeyconfig/update`), runs prefer those providers.

**Run errors:** `INVALID_ARGUMENT` (bad URL, missing IDs, bad `urls`, `aiConfig`, run-scope key, or `userContext` field; `agentIds` outside 1 to 10), `NOT_FOUND` (document missing), `ALREADY_EXISTS` (same agent already running on this document; the message includes the running execution ID; a stalled run is ended with `STALE_RUN` instead), `RESOURCE_EXHAUSTED` (AI credits), `INTERNAL` (`Failed to dispatch agent execution task.`; the created executions end with `TASK_DISPATCH_FAILED`; resend).

#### Reading an execution

- `execution.metadata.organizationId` / `documentId` echo the run IDs (not `clientOrganizationId`).
- `resultsSummary`: `totalFindings`, `totalAnnotationsCreated` (fresh annotations after delete-and-recreate), `urlsProcessed`, `urlsWithFindings`, `urlsErrored`, `erroredUrls` (max 50), `severityCounts` (sparse; missing key means 0), `findings` (top 50 sample). `matchResult` is legacy and absent on new runs.
- `error.code` includes `TIMEOUT`, `LLM_ERROR`, `CRAWLER_ERROR`, and run-level codes `TASK_DISPATCH_FAILED`, `STALE_RUN`, `SUITE_TIMEOUT`, `RUN_ATTEMPTS_EXHAUSTED`, `MALFORMED_TASK`. Check `error.retryable`.
- Per-URL rows (`includeResults: true`) nest findings under `results[i].agentResult.findings`, not on the row. Test page failure with `agentResult.status === "failed"`; `agentResult.error` is always present (null on success).
- Each finding has `severity`, `targetText`, `occurrence`, `suggestion`, `suggestedFix?`, `htmlSelector`, `targetElementXpath`, `isPageLevel`, `issueType`, `confidence` (0 to 100, not filtered), `reasonExtras`, `metadata`, and `evidence`. Render `evidence.html` as text, never as markup.

#### List and count

```bash
# Exactly one of three filter shapes: { agentId }, { organizationId, documentId }, or all three
POST https://api.velt.dev/v2/agents/execution/list
{ "data": { "organizationId": "org_001", "documentId": "doc_001", "pageSize": 20 } }
# -> data.executions[] (newest first), data.nextPageToken (key absent on the last page)

# Poll-friendly counters
POST https://api.velt.dev/v2/agents/execution/count
{ "data": { "agentIds": ["abc123def456", "spell-check"], "status": "running" } }
# -> data.counts: { "abc123def456": 2, "spell-check": 0 }   (-1 means that count failed)
```

`list` and `count` reject unknown top-level fields. `pageSize` is 1 to 100. Omit `agentIds` on `count` for a single `data.total`.

**Verification Checklist:**
- [ ] Run requests include `organizationId` and `documentId` for an existing document, plus `agentId` or `agentIds`
- [ ] Callers poll `/v2/agents/execution/get` until `status !== "running"` and read findings from `results[].agentResult.findings` with `includeResults: true`
- [ ] Status handling treats `failed` as "findings found" and `passed` as "no findings", and handles `partial`, `error`, and `skipped`
- [ ] `agentIds` runs poll every ID in `data.executions` and surface `data.failed`
- [ ] `urls` lists stay within 500 same-host entries; `crossPageExecute` / `maxUrlsToProcess` are not sent alongside them
- [ ] Run-scope keys (`focusIssueTypes`, `sourceAnnotationId`, `sourcePageUrl`, `sourceElementXpath`) are well-formed
- [ ] `aiConfig.model` is always paired with `provider` (or `defaultModels` is used)
- [ ] `ALREADY_EXISTS`, `RESOURCE_EXHAUSTED`, `NOT_FOUND`, and `INTERNAL` are handled on run
- [ ] `list` uses one of the three filter shapes and paginates until `nextPageToken` is absent
- [ ] `count` consumers treat `-1` as a failed count

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/execution/run - "Run Execution"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/execution/get - "Get Execution"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/execution/list - "List Executions"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/execution/count - "Count Executions"
- https://docs.velt.dev/ai/agents/overview#execution-statuses - "Execution statuses"
- https://docs.velt.dev/ai/agents/setup - "Setup"

---

### 2.13 Run Built-in Review Agents by ID with Issue Types and Per-Run Options

**Impact: MEDIUM-HIGH (Built-in agents cover most review needs without a custom agent; wrong IDs, missing required options, or option keys sent to the wrong agent fail or are ignored)**

Built-in agents are pre-registered in every workspace. Run one by passing its ID as `agentId` (or in `agentIds`) to `/v2/agents/execution/run`; there is nothing to create. Tune a run through `userContext`: each agent reads only its own keys, a key you leave out keeps its default, and a value of the wrong type is ignored.

**Incorrect (display name as the ID, missing required option):**

```json
{
  "data": {
    "agentId": "Proofreader",
    "url": "https://new.example.com/about",
    "organizationId": "org_001",
    "documentId": "doc_001"
  }
}
```

**Correct (built-in IDs, shared `userContext` with each agent's own keys):**

```json
{
  "data": {
    "agentIds": ["spell-check", "broken-links", "migration-parity"],
    "url": "https://new.example.com/about",
    "organizationId": "org_001",
    "documentId": "doc_001",
    "userContext": {
      "brandNames": ["AcmeCloud"],
      "clickTest": false,
      "liveSiteUrl": "old.example.com"
    }
  }
}
```

#### Built-in agent IDs

| ID | Reviews |
|----|---------|
| `spell-check` | Proofreader: typos, doubled words, punctuation slips, brand casing, placeholder text. No grammar (use `grammar-check`); `aiConfig` does not apply |
| `grammar-check` | Grammar |
| `broken-links` | Link Checker: links, images, forms, dead buttons, staging links, unlinked contacts, social icons, tab targets |
| `image-inspector` | Broken, blurry, stretched, empty, and missing-alt images; optional bad-crop check |
| `mobile-inspector` | Phone and tablet layout problems; always runs as `"mobile"` |
| `consistency-checker` | Contact details, prices, and names that differ across the site; cross-page casing and visual style mismatches |
| `ai-visibility` | Whether AI answer engines can reach, read, and cite the page |
| `migration-parity` | Content the new page lost compared with the live or old site. Requires `liveSiteUrl` |
| `content-request-list` | One checklist finding per page of content still owed by the client |
| `pii-detection`, `profanity-filter`, `sensitive-data`, `lorem-ipsum` | Content safety and placeholder checks |
| `lighthouse`, `accessibility-checker`, `og-image-checker` | Lighthouse audit, WCAG audit, Open Graph image validation |

Identify agents by ID; display names can change between releases. `/v2/agents/get` with `{ "filter": "defaultOnly" }` lists them, and `essentialDefault: true` marks Velt's recommended default set.

#### Issue types and focused rechecks

These agents tag every finding with a fixed `issueType`. Pass some of them in `userContext.focusIssueTypes` to recheck only those issues; the run replaces only the earlier pending suggestions of those types.

| Agent | Issue types |
|-------|-------------|
| `spell-check` | `spelling`, `doubled-word`, `punctuation`, `placeholder`, `brand-casing`, `inconsistent-casing` |
| `broken-links` | `broken-link`, `broken-image`, `dead-button`, `dead-form`, `staging-link`, `malformed-link`, `unlinked-logo`, `unlinked-phone`, `unlinked-email`, `unlinked-contact`, `social-link-mismatch`, `same-tab-link`, `new-tab-internal-link` |
| `image-inspector` | `broken-image`, `empty-image`, `blurry-image`, `stretched-image`, `missing-alt`, `bad-crop` |
| `mobile-inspector` | `desktop-layout-on-phone`, `horizontal-scroll`, `overflowing-element`, `overflowing-text`, `cut-off-button`, `cut-off-text`, `small-tap-target`, `wrapped-button-label`, `hidden-under-sticky-bar`, `broken-mobile-menu`, `missing-on-mobile` |
| `consistency-checker` | `inconsistent-phone`, `inconsistent-address`, `inconsistent-hours`, `inconsistent-email`, `inconsistent-price`, `inconsistent-service-name`, `inconsistent-business-name`, `cross-page-casing`, `style-mismatch`, `missing-hover`, `hover-invisible` |
| `migration-parity` | `missing-bio`, `missing-review`, `missing-faq`, `missing-phone`, `missing-email`, `missing-address`, `missing-list-item`, `missing-page-title`, `missing-main-heading` |
| `content-request-list` | `content-requests` |

To report only broken links, run `broken-links` with `focusIssueTypes: ["broken-link"]`. To stop it checking a category at all, use its options below.

#### Per-run options (`userContext` keys)

- **`broken-links`**: `clickTest` (default `true`; `false` means no `dead-button` findings), `pageLinkChecks`, `checkLogo`, `checkContacts`, `checkSocialIcons`, `checkTabTargets`, `checkStagingLinks`, `checkMalformedLinks`, `checkImageUrls`, `checkFormActions`, `checkInternalLinks`, `checkExternalLinks` (all default `true`), `maxLinksToCheck` (default 500, 1 to 1000), `stagingNoindexSignal`, `stagingWords`, `ambiguousStagingWords`, `notStagingWords`, `ignoreOverlaySelectors`, `skipClickLabels`.
- **`spell-check`**: `rulesOnly` (default `false`; sends no page text to the verification model and skips spelling), `acceptedWords`, `brandNames`, `skipChecks` (issue types to skip), `keepAtOrAbove` (default 0.6), `useGuidelines` (default `true`; reads brand terms from the Memory knowledge base), `loremIpsumOnSamePages`.
- **`consistency-checker`**: `consistencyCasingCheck`, `consistencyVisualCheck`, `consistencyExactValues` (default `true`), `consistencyMaxPages` (default 6, max 12), `consistencyMaxCharsPerPage` (default 6000, max 20000).
- **`image-inspector`**: `blurMinNaturalRatio`, `blurHighScale`, `blurMinRenderedWidthPx`, `stretchTolerance`, `stretchMinWidthPx`, `stretchMinHeightPx`, `emptyMinSidePx`, `altMinSidePx`, `maxPerCategory`, `linkCheckerOnSamePages`, `cropCheck` (turns on the bad-crop model check; also enabled by run `aiConfig.modelChecks: ["image-crop"]`, and `cropCheck: false` always wins).
- **`mobile-inspector`**: `phoneWidthPx` (320 to 480, default 375), `minTapTargetPx` (default 24), `maxScreenshots` (0 to 10, default 7), `tabletWidthPx` (600 to 1024 or `0`, default 768), `skipChecks` (`tablet`, `sticky-bar`, `wrapped-label`, `menu`, `missing-on-mobile`).
- **`migration-parity`**: `liveSiteUrl` (**required**; full address or bare domain, must differ from the run's site), `maxFindings` (1 to 20, default 6), `useSitemap` (default `true`). Without a usable `liveSiteUrl` the run returns `INVALID_ARGUMENT`; in an `agentIds` run it appears in `data.failed` while the others start.
- **`content-request-list`**: `includeThreads` (default `true`), `maxItems` (1 to 50, default 25), `minBioWords`, `clientUserIds`, `clientEmailDomains`, `audienceLabel`.

**Duplicate handling between agents.** In one `agentIds` run, `spell-check` + `lorem-ipsum` sets `loremIpsumOnSamePages: true` for you, and a one-page run with `broken-links` + `image-inspector` sets `linkCheckerOnSamePages: true`. When you run these pairs in separate requests, or `image-inspector` with `broken-links` over several pages, set those keys yourself.

Findings with an exact correction carry `suggestedFix` (also on the annotation as `agent.reason.suggestedFix`). `migration-parity` and `content-request-list` also return a per-page `agentResult.report` on Get Execution.

#### Fix It Everywhere estimate

`POST /v2/agents/fix-it-everywhere/estimate` estimates how many pages a `fix-it-everywhere` run would touch before you start it. Send `url`, optional `urls`, and `userContext` (`findText` required, 2 to 200 characters; optional `replaceWith`, `editMode` of `replace` / `delete` / `comment`, `matchCase`, `sourcePageUrl`, `sourceText`), plus optional `maxPages` (1 to 20, default 8). The schema is strict: do not send `agentId` or `documentId`. Nothing runs or is billed; `data.estimate` is `null` when no page could be read.

**Verification Checklist:**
- [ ] Built-in agents are referenced by ID (`spell-check`, `broken-links`, ...), never by display name
- [ ] `migration-parity` runs always send `userContext.liveSiteUrl` for a different site
- [ ] Option keys match the agent they target; shared `userContext` in `agentIds` runs is fine because each agent reads only its own keys
- [ ] `focusIssueTypes` values come from the documented issue-type list
- [ ] Separate-request runs of `spell-check`/`lorem-ipsum` or `broken-links`/`image-inspector` set the `*OnSamePages` keys to avoid duplicate findings
- [ ] The bad-crop check is enabled deliberately (`cropCheck: true` or `aiConfig.modelChecks: ["image-crop"]`), since it sends screenshots to a model
- [ ] Fix It Everywhere estimates send only `url`, `urls`, `userContext`, `maxPages`, and `organizationId`

**Source Pointers:**
- https://docs.velt.dev/ai/agents/overview#built-in-agents - "Built-in agents"
- https://docs.velt.dev/ai/agents/overview#issue-types - "Issue types"
- https://docs.velt.dev/ai/agents/overview#per-run-options - "Per-run options"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/execution/run - "Run Execution"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/fix-it-everywhere/estimate - "Estimate Fix It Everywhere"

---

### 2.14 Use Agent Groups, Prompt Tools, Extract, and Analytics Correctly

**Impact: MEDIUM (Groups have hard limits and immutable metadata, and the prompt tools return drafts that need mapping before Create Agent accepts them)**

Groups bundle custom and built-in agents for filtering. The prompt tools (`prompt/enhance`, `prompt/validate`, `prompt/refine`, `config/resolve`) and `extract` are design helpers: they never create or modify agents, and their outputs must be mapped onto the Create Agent shape. All are `POST` with the API-key-level headers.

**Incorrect (membership and metadata changes through the update endpoint):**

```bash
# Rejected: update is .strict() and only accepts name and description.
POST https://api.velt.dev/v2/agents/groups/update
{ "data": { "groupId": "K3mR7pQxN2vB9wLdT4sY", "agentIds": ["spell-check"], "metadata": { "team": "growth" } } }
```

**Correct (metadata at creation, membership through add/remove):**

```bash
POST https://api.velt.dev/v2/agents/groups/create
{ "data": {
    "name": "Brand QA",
    "description": "All brand-quality agents",
    "agentIds": ["abc123def456", "spell-check"],
    "metadata": { "organizationId": "org_001", "documentId": "doc_001", "team": "growth" }
} }

POST https://api.velt.dev/v2/agents/groups/add-agents
{ "data": { "groupId": "K3mR7pQxN2vB9wLdT4sY", "agentIds": ["broken-links"] } }

POST https://api.velt.dev/v2/agents/groups/remove-agents
{ "data": { "groupId": "K3mR7pQxN2vB9wLdT4sY", "agentIds": ["spell-check"] } }

# List the agents of one group
POST https://api.velt.dev/v2/agents/get
{ "data": { "groupId": "K3mR7pQxN2vB9wLdT4sY" } }
```

#### Group rules

- Limits: 50 groups per workspace and 100 agents per group. The 50 includes up to 5 auto-provisioned **system groups** (`copy-qa`, `seo`, `design-checks`, `performance`, `brand-checks`), so `RESOURCE_EXHAUSTED` can arrive at 45 of your own groups.
- `metadata` is immutable after creation; the workspace `apiKey` is merged in as `metadata.apiKey`.
- On create, more than 100 `agentIds` (counted before dedup) is `INVALID_ARGUMENT`; unknown custom-agent IDs are `NOT_FOUND`; built-in IDs are accepted without lookup.
- `add-agents` and `remove-agents` are idempotent. `add-agents` returns `RESOURCE_EXHAUSTED` past 100 members.
- `groups/list` takes an empty `data` and returns `agentCount` instead of `agentIds`; call `groups/get` for full membership. System groups carry `system: true`.
- `groups/update` changes only `name` / `description` (at least one). System groups can be renamed and deleted; a deleted system group is re-provisioned the next time an agent classifies into it.
- Deleting a group never deletes its agents. Deleting an agent removes it from every group.

#### Prompt tools

```bash
# 1. Is the prompt specific enough? requirement is null when it is.
POST https://api.velt.dev/v2/agents/prompt/enhance
{ "data": { "prompt": "Check that the page uses our brand colors" } }
# -> data.enhancedPrompt: { requirement, context?, suggestion?, suggestion_type? }

# 2. Expand a one-line instruction into a structured task with demos
POST https://api.velt.dev/v2/agents/prompt/validate
{ "data": { "prompt": "Make sure there are no broken links on the page" } }
# -> data.validationResult: { analysis_prompt, requires_tool, response_descriptions, demos, suggested_required_inputs }

# 3. Iterate the analysis prompt against demo feedback
POST https://api.velt.dev/v2/agents/prompt/refine
{ "data": { "analysisPrompt": "## Objective\n...", "demoFeedback": [
    { "demoId": "demo-1", "demoTitle": "Malformed mailto", "demoHtml": "<a href=\"mailto:bad@\">Email</a>", "demoExpected": "detected", "feedback": "Malformed mailto links count as broken." }
] } }
# -> data.refinerResult: { analysis_prompt, response_descriptions }

# 4. Recommend strategies for the final instructions
POST https://api.velt.dev/v2/agents/config/resolve
{ "data": { "instructions": "Verify all CTAs use #1A73E8.", "rawInstructions": "Check CTA colors" } }
# -> data.resolvedConfig: { extraction_strategies, execution_strategy, reasoning, strategy_options? }
```

- Map `suggested_required_inputs[]` (`{ name, description, example, reason }`) to `userContextFields` (`{ id: name, title: description, example, type }`) before Create Agent; sending them verbatim is rejected.
- Map `config/resolve` output: `extraction_strategies` to `contextGathering.strategies`, `strategy_options` to `contextGathering.strategyOptions` (dropping it leaves `computed-styles` inert), `execution_strategy` to `execution.executionStrategy`.
- `config/resolve` never surfaces a model failure: it returns 200 with a fallback whose `reasoning` is exactly `"Default configuration applied"`. Check for that string.
- The `provider` field on these tools accepts `gemini`, `claude`, or `openai`; other values fail with `INTERNAL` (or the fallback, on `config/resolve`).

#### Extract agents from a checklist file

```bash
POST https://api.velt.dev/v2/agents/extract
{ "data": { "fileBase64": "QWdlbnQgTmFtZSxEZXNjcmlwdGlvbgo...", "mimeType": "text/csv", "fileName": "qa-checklist.csv" } }
# -> data.extractionResult: { agents[{ name, description, prompt, sourceTasks, userContextFields? }], summary, skipped, totalTasksParsed?, memory: { sourceId } }
```

Extracted agents are **drafts**, not Create Agent payloads: map `prompt` to `instructions`, and add `enabled`, `contextGathering`, and `execution` yourself (use `config/resolve`). At most 50 agents per file; files over 5 MB decoded are rejected. Every uploaded file is also stored as a Memory knowledge source (`memory.sourceId`). Handle `DEADLINE_EXCEEDED` and `UNAVAILABLE` (retry).

#### Analytics

```bash
POST https://api.velt.dev/v2/agents/analytics/get
{ "data": { "agentId": "abc123def456", "year": "2026", "month": "03" } }
# -> data.analytics: { tokenUsage: { allTime, yearly?, monthly?, byModel? }, executionCounts }
```

Only `tokenUsage.allTime` and `executionCounts` are guaranteed. `monthly` appears only when `year` is sent. Model keys are `provider_model` with dots and slashes replaced by underscores (`gemini/gemini-3.6-flash` becomes `gemini_gemini-3_6-flash`). The `model` filter takes the full `provider/model` ID and narrows `byModel` only.

**Verification Checklist:**
- [ ] Group membership changes use `add-agents` / `remove-agents`; `groups/update` sends only `name` / `description`
- [ ] Group `metadata` is set at creation and never expected to change
- [ ] Group limits account for system groups; `system: true` rows are filtered when only your groups are wanted
- [ ] `suggested_required_inputs` and `extract` drafts are mapped to the Create Agent shape before use
- [ ] `config/resolve` responses with `reasoning === "Default configuration applied"` are treated as a fallback
- [ ] `strategy_options` from `config/resolve` is carried into `contextGathering.strategyOptions`
- [ ] Analytics consumers read only `allTime` and `executionCounts` unconditionally and send `year` when they need `monthly`

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/create - "Create Agent Group"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/get - "Get Agent Group"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/list - "List Agent Groups"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/update - "Update Agent Group"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/delete - "Delete Agent Group"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/add-agents - "Add Agents to Group"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/remove-agents - "Remove Agents from Group"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/prompt/enhance - "Enhance Prompt"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/prompt/validate - "Validate Prompt"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/prompt/refine - "Refine Prompt"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/config/resolve - "Resolve Config"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/extract - "Extract Agents from File"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/analytics/get - "Get Agent Analytics"

---

### 2.15 Use the Approval Engine Skill for Review Workflow Builder REST APIs

**Impact: MEDIUM (Pointer rule; full Approval Engine (Review Workflow Builder) REST and webhook coverage lives in velt-approval-engine-best-practices)**

The Approval Engine REST API, documented as the Review Workflow Builder (the 14 `/v2/workflow/*` endpoints for definitions, executions, and steps, plus webhook delivery, quorum policies, and idempotency guidance), lives in its own skill.

**Incorrect (guessing workflow endpoints from this skill):**

```bash
# No such endpoint family in this skill; the paths and payloads are documented elsewhere.
POST https://api.velt.dev/v2/approvals/create
```

**Correct (load the dedicated skill):**

```text
Use velt-approval-engine-best-practices for /v2/workflow/* definitions, executions, steps, and their webhook events.
```

The Approval Engine has its own concept surface (workflow DAGs, quorum policies, edge expressions, webhook signature contract). Keeping it separate keeps this skill focused on Comments, Users, Documents, Notifications, Agents, Memory, and webhooks. Its webhook event types (`execution.*`, `step.*`, `group.quorum-met`, `loop.*`) arrive through advanced webhooks (see `webhooks-advanced`).

**Source Pointers:**
- https://docs.velt.dev/ai/approval-engine/overview - "Review Workflow Builder (Beta)"
- https://docs.velt.dev/webhooks/advanced#review-workflow-builder - "Review Workflow Builder" webhook events

---

### 2.16 Write Activity Logs, CRDT Data, and Live State via REST API

**Impact: MEDIUM (Activity, CRDT, and live-state writes use array and editorId shapes; the wrong shape is rejected or lands on no editor)**

Activity writes take an `activities[]` array with a required `featureType`. CRDT writes target one editor with `editorId`, a `type`, and a `data` value of the matching shape. Live state broadcasts target a `liveStateDataId`. All endpoints are `POST` with the API-key-level headers.

**Incorrect (single `activity` object, `crdtDataType` / `key` / `value` instead of the documented fields):**

```json
{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "activity": { "activityType": "comment", "actionType": "added", "message": "Alice commented" }
  }
}
```

**Correct (activities array with `featureType`, `actionType`, `actionUser`):**

```bash
POST https://api.velt.dev/v2/activities/add

{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "activities": [
      {
        "id": "deploy-2026-10-06",
        "featureType": "custom",
        "actionType": "deploy.completed",
        "actionUser": { "userId": "user-1", "name": "Alice", "email": "alice@example.com" },
        "targetEntityId": "release-42",
        "displayMessageTemplate": "{{user}} deployed release 42",
        "displayMessageTemplateData": { "user": { "userId": "user-1", "name": "Alice" } }
      }
    ]
  }
}
```

#### Activity logs

- Adding activity logs through REST requires `activityServiceConfig` enabled at the workspace level in the Velt Console (also settable with `/v2/workspace/activityconfig/update`).
- `featureType` is one of `comment`, `reaction`, `recorder`, `crdt`, `custom`. `targetEntityId` is required when `featureType` is `custom`.
- Pass your own `id` for idempotent writes; an existing activity with that `id` is overwritten.
- `changes` is a map of `field -> { from, to }`. Templates use `{{variable}}` syntax.
- `isActivityResolverUsed: true` marks a record whose PII lives on your infrastructure (self-hosted activity data).

```bash
# Get with filters: documentId, targetEntityId, featureTypes, actionTypes, userId, activityIds, order, pageSize, pageToken
POST https://api.velt.dev/v2/activities/get
{ "data": { "organizationId": "org-123", "documentId": "doc-456", "featureTypes": ["comment"], "order": "desc", "pageSize": 50 } }

# Update: activities[] items keyed by id
POST https://api.velt.dev/v2/activities/update
{ "data": { "organizationId": "org-123", "activities": [ { "id": "deploy-2026-10-06", "displayMessageTemplate": "{{user}} redeployed release 42" } ] } }

# Delete: at least one of documentId, targetEntityId, activityIds
POST https://api.velt.dev/v2/activities/delete
{ "data": { "organizationId": "org-123", "activityIds": ["deploy-2026-10-06"] } }
```

#### CRDT data (Yjs editors)

```bash
# Create editor data (fails if data already exists for this editorId)
POST https://api.velt.dev/v2/crdt/add
{ "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "editorId": "my-rich-text-editor",
    "type": "xml",
    "data": "<paragraph>Hello World</paragraph>",
    "contentKey": "default"
} }

# Read one editor, or omit editorId for every editor on the document
POST https://api.velt.dev/v2/crdt/get
{ "data": { "organizationId": "org-123", "documentId": "doc-456", "editorId": "my-rich-text-editor" } }
# -> result.data[]: { data, id, lastUpdate, lastUpdatedBy, sessionId }

# Replace existing editor data (fails if no data exists for this editorId)
POST https://api.velt.dev/v2/crdt/update
{ "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "editorId": "my-flow-editor",
    "type": "map",
    "data": { "nodes": { "node-1": { "label": "Updated" } }, "edges": {} }
} }
```

- `type` is `text`, `map`, `array`, or `xml`, and `data` must match: a string for `text`/`xml`, an object for `map`, an array for `array`.
- `contentKey` defaults to `content`. Use `default` for TipTap.
- `update` writes proper CRDT operations on the existing state, so connected clients pick up the change.
- Use `add` for a new editor and `update` for an existing one; they are not interchangeable upserts.

#### Live state broadcast

```bash
POST https://api.velt.dev/v2/livestate/broadcast
{ "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "liveStateDataId": "deploy-status",
    "data": { "status": "success", "build": 42 },
    "merge": true
} }
```

`merge: true` merges into the existing live state data; the default `false` replaces it. Clients read it with the Live State Sync APIs (see `velt-live-state-sync-best-practices`).

**Verification Checklist:**
- [ ] Activity writes send `activities[]` with `featureType`, `actionType`, and `actionUser`; `targetEntityId` is set for `custom`
- [ ] Activity service is enabled at the workspace level before adding activities via REST
- [ ] Activity deletes include at least one of `documentId`, `targetEntityId`, `activityIds`
- [ ] CRDT calls send `editorId`, `type`, and a `data` value matching `type`; TipTap uses `contentKey: "default"`
- [ ] New editors use `/v2/crdt/add`; existing editors use `/v2/crdt/update`
- [ ] Live state broadcasts send `liveStateDataId` and `data`, and set `merge` deliberately
- [ ] Both API-key-level headers are included

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/activities/add-activities - "Add Activities"
- https://docs.velt.dev/api-reference/rest-apis/v2/activities/get-activities - "Get Activities"
- https://docs.velt.dev/api-reference/rest-apis/v2/activities/update-activities - "Update Activities"
- https://docs.velt.dev/api-reference/rest-apis/v2/activities/delete-activities - "Delete Activities"
- https://docs.velt.dev/api-reference/rest-apis/v2/crdt/add-crdt-data - "Add CRDT Data"
- https://docs.velt.dev/api-reference/rest-apis/v2/crdt/get-crdt-data - "Get CRDT Data"
- https://docs.velt.dev/api-reference/rest-apis/v2/crdt/update-crdt-data - "Update CRDT Data"
- https://docs.velt.dev/api-reference/rest-apis/v2/livestate/broadcast-event - "Broadcast Event"

---

## 3. Webhooks

**Impact: MEDIUM**

Inbound webhook handling for comment, huddle, CRDT, recorder, and workflow events. Covers basic webhooks (`Basic` auth token header, action types, base64 encoding, RSA-wrapped AES payload encryption, private-comment `accessDeniedUsers`) and advanced Svix webhooks (dot-notation event types, HMAC-SHA256 signature verification, retries, transformations). Payload shape is versioned; never silently upgrade a basic example to the advanced format.

### 3.1 Set Up Basic Webhooks and Handle Their Payloads

**Impact: HIGH (Basic webhooks are the main server-side signal for comments, huddles, and CRDT; wrong action names or decryption code drop events)**

Basic webhooks POST a `WebhookV1Payload` to one endpoint URL for Comments, Huddle, and CRDT events. Enable them in the Velt Console (Configurations > Webhook Service) or with `POST /v2/workspace/webhookconfig/update`. Each payload carries `webhookId`, `actionType`, `notificationSource` (`comment`, `huddle`, `crdt`, or `recorder`), and optional `actionUser`, `metadata`, and `platform`.

**Incorrect (wrong auth header check, wrong huddle action, single-key decryption):**

```javascript
app.post('/velt/webhook', (req, res) => {
  if (req.headers.authorization !== process.env.VELT_WEBHOOK_TOKEN) return res.sendStatus(401); // missing "Basic " prefix
  if (req.body.notificationSource === 'huddle' && req.body.actionType === 'joined') { /* never fires */ }
  res.sendStatus(200);
});
```

**Correct (`Basic` token, documented action types, acknowledge fast):**

```javascript
const express = require('express');
const app = express();
app.use(express.json({ limit: '5mb' }));

app.post('/velt/webhook', (req, res) => {
  if (req.headers.authorization !== `Basic ${process.env.VELT_WEBHOOK_TOKEN}`) {
    return res.status(401).send('Unauthorized');
  }
  res.status(200).send('OK'); // acknowledge first, process asynchronously

  const { actionType, notificationSource, metadata, accessDeniedUsers = [] } = req.body;
  if (notificationSource === 'comment' && (actionType === 'newlyAdded' || actionType === 'added')) {
    enqueueCommentFanout(req.body, { skipUserIds: accessDeniedUsers });
  } else if (notificationSource === 'huddle' && actionType === 'join') {
    enqueueHuddleJoin(metadata);
  } else if (notificationSource === 'crdt' && actionType === 'updateData') {
    enqueueCrdtSync(req.body);
  }
});
```

#### Action types

**Comments:** `newlyAdded` (first comment in a thread), `added` (later comments), `updated`, `deleted`, `approved`, `accepted`, `rejected` (Moderator Mode), `assigned`, `statusChanged`, `priorityChanged`, `accessModeChanged`, `reactionAdded`, `reactionDeleted`, `subscribed`, `unsubscribed`, `suggestionAccepted`, `suggestionRejected`. The two suggestion events are opt-in and off by default.

**Huddle:** `created`, `join`.

**CRDT:** `updateData`, debounced at 5 seconds.

When notification settings are configured, payloads also include `usersOrganizationNotificationsConfig` or `usersDocumentNotificationsConfig`.

#### Enable and configure via REST

```bash
POST https://api.velt.dev/v2/workspace/webhookconfig/update
{ "data": {
    "useWebhookService": true,
    "webhookServiceConfig": {
      "authToken": "webhook_auth_token_here",
      "rawNotificationUrl": "https://example.com/webhooks/raw",
      "processedNotificationUrl": "https://example.com/webhooks/processed"
    }
} }
```

On first enable, default triggers are seeded: standard comment and all huddle triggers on, **CRDT and recorder triggers off**, and the suggestion triggers off until you enable them. Turn on the ones you need through `webhookServiceConfig.triggers`.

#### Security: auth token, encoding, encryption

- **Auth token:** when set, Velt sends it in the `Authorization` header as `Basic YOUR_AUTH_TOKEN`.
- **Encoding (optional):** the payload arrives as `{ "encodedPayload": "<base64>" }`; decode with `JSON.parse(Buffer.from(encodedPayload, 'base64').toString('utf-8'))`.
- **Encryption (optional):** the payload arrives as `{ encryptedData, encryptedKey, iv }`. The AES-256-CBC key is itself encrypted with your RSA public key (PKCS1 OAEP, SHA-256). Provide the public key as a base64 string without PEM headers (2048-bit recommended).

```javascript
const crypto = require('crypto');

function decryptVeltWebhook({ encryptedData, encryptedKey, iv }, privateKeyBase64) {
  const symmetricKey = crypto.privateDecrypt(
    {
      key: `-----BEGIN RSA PRIVATE KEY-----\n${privateKeyBase64}\n-----END RSA PRIVATE KEY-----`,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    Buffer.from(encryptedKey, 'base64')
  );
  const decipher = crypto.createDecipheriv('aes-256-cbc', symmetricKey, Buffer.from(iv, 'base64'));
  let json = decipher.update(encryptedData, 'base64', 'utf8');
  json += decipher.final('utf8');
  return JSON.parse(json);
}
```

#### Private comments: `visibility` and `accessDeniedUsers`

Notifications for private comments carry a `visibility` object (`type`: `public`, `organizationPrivate`, or `restricted`, plus `userIds` / `organizationIds` / `organizationId`) and an `accessDeniedUsers` list of client user IDs denied by your Permission Provider or by the comment's visibility. Drop those users from your own fan-out. Never use these fields to widen who you forward to. Public comments carry no `visibility` key.

**Verification Checklist:**
- [ ] Webhook is enabled in the Console or via `/v2/workspace/webhookconfig/update`, and CRDT / recorder / suggestion triggers are turned on explicitly if needed
- [ ] The `Authorization` header is compared against `Basic <token>`
- [ ] Handlers branch on `notificationSource` + `actionType` using the documented names (`newlyAdded`, `join`, `updateData`, ...)
- [ ] Encoded payloads are base64-decoded; encrypted payloads decrypt `encryptedKey` with RSA-OAEP (SHA-256) before AES-256-CBC
- [ ] `accessDeniedUsers` are removed from any downstream fan-out
- [ ] The endpoint returns 2xx quickly and processes work asynchronously
- [ ] CRDT handlers expect 5-second debounced updates, not every keystroke

**Source Pointers:**
- https://docs.velt.dev/webhooks/basic - "Basic Webhooks"
- https://docs.velt.dev/webhooks/basic#comment-visibility - "Comment Visibility"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/webhookconfig-update - "Update Webhook Config"
- https://docs.velt.dev/api-reference/sdk/models/data-models#webhookv1payload - "WebhookV1Payload"

---

### 3.2 Verify and Handle Advanced (Svix) Webhooks

**Impact: MEDIUM (Advanced webhooks are signed and retried; skipping signature checks or slow responses lets forged or duplicate events through)**

Advanced webhooks (Enterprise) deliver `WebhookV2Payload` messages with dot-notation event types to multiple endpoints, with per-endpoint filters, rate limits, retries, transformations, and signatures. Every delivery carries `webhook-id`, `webhook-timestamp`, and `webhook-signature` headers. Verify the signature against the **raw request body** with the endpoint's `whsec_` secret, then return 2xx within 15 seconds. Manage endpoints and secrets with the REST endpoints in `rest-advanced-webhooks`.

**Incorrect (parsed body, no signature check, slow handler):**

```javascript
app.post('/velt/webhooks', express.json(), async (req, res) => {
  await processEverything(req.body); // can exceed 15 s and trigger retries
  res.sendStatus(200);                // no verification: anyone can forge events
});
```

**Correct (raw body, HMAC-SHA256 check, timestamp tolerance, fast ack):**

```javascript
const crypto = require('crypto');

app.post('/velt/webhooks', express.raw({ type: 'application/json' }), (req, res) => {
  const id = req.header('webhook-id');
  const timestamp = req.header('webhook-timestamp');
  const signatures = (req.header('webhook-signature') || '').split(' ');
  const body = req.body.toString('utf8'); // raw string, never re-stringified JSON

  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return res.sendStatus(400);

  const secret = Buffer.from(process.env.VELT_WEBHOOK_SECRET.split('_')[1], 'base64');
  const expected = crypto.createHmac('sha256', secret).update(`${id}.${timestamp}.${body}`).digest('base64');
  const valid = signatures.some((sig) => {
    const value = sig.split(',')[1] || '';
    return value.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(value), Buffer.from(expected));
  });
  if (!valid) return res.sendStatus(401);

  res.sendStatus(200);                          // acknowledge within 15 seconds
  enqueue(id, JSON.parse(body));                // dedupe on webhook-id; retries reuse it
});
```

#### Event types

| Area | Events |
|------|--------|
| Comment threads | `comment_annotation.add`, `.assign`, `.status_change`, `.priority_change`, `.custom_list_change`, `.subscribe`, `.unsubscribe`, `.accept`, `.reject`, `.approve`, `.suggestion_accept`, `.suggestion_reject` (suggestion events are opt-in) |
| Comments | `comment.add`, `comment.update`, `comment.delete`, `comment.reaction_add`, `comment.reaction_delete` |
| Huddle | `huddle.create`, `huddle.join` |
| CRDT | `crdt.update_data` (5-second debounce) |
| Recorder | `recorder.done` (on by default; toggle with `triggers.recorder.done`) |
| Review Workflow Builder | `execution.dispatched`, `execution.completed`, `execution.failed`, `execution.cancelled`, `step.awaiting-approval`, `step.completed`, `step.failed`, `step.breached`, `step.cancelled`, `group.quorum-met`, `loop.iteration-started`, `loop.exhausted` |

An endpoint with no event types receives everything; subscribe each endpoint to the subset it needs (`filterTypes` on the endpoint). Payloads look like `{ event, actionType, data: { actionUser, metadata, ... }, source, platform, webhookId }`. Private comments carry a `visibility` object inside `data`; treat it as informational only.

#### Delivery, retries, and recovery

- Any non-2xx response, including 3xx redirects, or no response within 15 seconds is a failure.
- Retries back off: immediately, 5 s, 5 min, 30 min, 2 h, 5 h, 10 h, 10 h. After that the message is marked failed and a `message.attempt.exhausted` event is sent.
- An endpoint that fails for 5 days is disabled; re-enable it in the webhook dashboard. Failed messages can be resent one by one or recovered from a point in time.
- Retries resend the same `webhook-id`, so make handlers idempotent.
- Rate limits are per endpoint (messages per second) and can briefly be exceeded.
- Deliveries come from static IPs (`44.228.126.217`, `50.112.21.217`, `52.24.126.164`, `54.148.139.208`, `2600:1f24:64:8000::/56`) for firewall allowlists. HTTP Basic auth in the URL and custom headers are also supported.
- Disable CSRF protection on the webhook route.

#### Transformations

A transformation is JavaScript on the endpoint that declares `handler(webhook)` and **returns the whole `WebhookObject`** (`method` of `POST` or `PUT`, `url`, `payload`, `cancel`). Returning only a new payload breaks delivery. Canceled messages show as successful.

```javascript
function handler(webhook) {
  if (webhook.payload.customUrl) {
    webhook.url = webhook.payload.customUrl;
  }
  return webhook;
}
```

Optional payload encoding (base64) and encryption (AES-256-CBC with an RSA-OAEP SHA-256 wrapped key) work as in basic webhooks; toggle them with `encodeData` / `encryptData` / `publicKey` on `/v2/workspace/advancedwebhookconfig/update`.

**Verification Checklist:**
- [ ] Signature is computed over `${webhook-id}.${webhook-timestamp}.${rawBody}` with HMAC-SHA256 and the base64-decoded part of the `whsec_` secret
- [ ] The `v1,` prefix is stripped from each space-delimited signature and compared in constant time
- [ ] `webhook-timestamp` is checked against a tolerance window
- [ ] The raw body is used for verification (no `JSON.stringify` round trip)
- [ ] The endpoint returns 2xx within 15 seconds and processes work asynchronously
- [ ] Handlers are idempotent on `webhook-id`
- [ ] Each endpoint subscribes to an explicit event subset
- [ ] Transformations return the full `WebhookObject`

**Source Pointers:**
- https://docs.velt.dev/webhooks/advanced - "Advanced Webhooks"
- https://docs.velt.dev/webhooks/advanced#verifying-webhook-signatures - "Verifying webhook signatures"
- https://docs.velt.dev/webhooks/advanced#retries - "Retries"
- https://docs.velt.dev/webhooks/advanced#transformations - "Transformations"
- https://docs.velt.dev/api-reference/sdk/models/data-models#webhookv2payload - "WebhookV2Payload"

---

## 4. Debugging

**Impact: LOW-MEDIUM**

Troubleshooting for common backend integration failures: mismatched auth header pairs, missing advanced-queries prerequisite, bulk document partial failures, expired JWT tokens, agent status misreads, Memory response-shape and scoping mistakes, and webhooks that never arrive.

### 4.1 Troubleshoot Common Velt Backend Integration Failures

**Impact: LOW-MEDIUM (Fast diagnosis of auth, prerequisite, response-shape, and webhook errors avoids long debugging sessions)**

Most backend failures come from the wrong header pair, a missing Console prerequisite, a misread response envelope, or a webhook endpoint that answers slowly. Check the error's `status` string (`error.status`) and `message` first, then match it below.

**Incorrect (retry every failure the same way):**

```javascript
async function call(path, data) {
  const json = await (await fetch(`https://api.velt.dev${path}`, { method: 'POST', headers, body: JSON.stringify({ data }) })).json();
  if (json.error) return call(path, data); // loops on INVALID_ARGUMENT, NOT_FOUND, ALREADY_EXISTS forever
  return json.result.data;                 // undefined for Memory endpoints
}
```

**Correct (classify by `error.status`, read the right envelope):**

```javascript
const RETRYABLE = new Set(['INTERNAL', 'UNAVAILABLE', 'DEADLINE_EXCEEDED', 'RESOURCE_EXHAUSTED']);

async function call(path, data, attempt = 0) {
  const res = await fetch(`https://api.velt.dev${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-velt-api-key': process.env.VELT_API_KEY,
      'x-velt-auth-token': process.env.VELT_AUTH_TOKEN
    },
    body: JSON.stringify({ data })
  });
  const json = await res.json();
  if (json.error) {
    const { status, message, details } = json.error;
    // Bulk document endpoints report per-item codes in details; see rest-documents-partial-failures.
    if (RETRYABLE.has(status) && !details && attempt < 3) {
      await new Promise((r) => setTimeout(r, 2 ** attempt * 1000));
      return call(path, data, attempt + 1);
    }
    throw Object.assign(new Error(message), { status, details });
  }
  return path.startsWith('/v2/memory/') ? json.result : json.result.data;
}
```

#### Symptom guide

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Every call rejected | Missing header, or api-key pair sent to a workspace-level endpoint (or the reverse) | Use the pair that matches the endpoint scope (`core-rest-api-auth`) |
| `get` endpoints fail or return nothing for organizations, documents, folders, users, notifications, or comment annotations | Advanced queries not enabled | Enable advanced queries in the Console (and run the v4+ SDK) |
| Comment delete with `agentId` / `agentSuggestions` / `agentUrls` returns `NOT_FOUND` | Advanced queries not enabled | Enable them; the delete never widens to the whole document |
| `/v2/organizations/documents/*` returns HTTP 500 `INTERNAL` | Per-item failure (`not-found`, `already-exists`) in `error.details` | Branch on each item's `code`; retry only `internal` |
| `generate_token` returns `INVALID_ARGUMENT` | Body not wrapped in `data`, or `organizationId` in `userProperties` | Wrap in `data`; send the organization as a `permissions.resources[]` entry |
| Frontend auth stops after about 48 hours | JWT expired and `identify()` users do not refresh | Use `authProvider` with `generateToken`, or handle the `error` event with `code === 'token_expired'` |
| Agent run returns `NOT_FOUND` | Target `documentId` does not exist yet | Create the document first (`/v2/organizations/documents/add`) |
| Agent run returns `ALREADY_EXISTS` | Same agent already running on the document | Wait for the running execution (its ID is in the message) or poll it |
| Agent status `failed` looks like an outage | `failed` means findings were found | Treat `passed` as clean and `failed` as findings; `error` is the real failure |
| Agent starts failing auth after a config edit | `"__redacted__"` secret was sent back on version update | Resend real plaintext secrets or omit the secret-bearing block |
| Memory `ask` returns `answer: ""` | No grounding context yet | Show "nothing yet"; do not fabricate an answer |
| Memory search scoped to a document returns workspace-wide results | `documentId` / `documentIds` sent without `organizationId` | Always pair them with `organizationId` |
| Memory knowledge call rejected with `INVALID_ARGUMENT` | Unknown or misspelled field on a strict endpoint | Send only documented fields |
| Notification reaches the whole organization | `notifyAll` left at its default `true` | Set `notifyAll: false` to notify only `notifyUsers` |

#### Webhooks not arriving

1. Confirm the service is enabled (Console > Configurations > Webhook Service, or `POST /v2/workspace/webhookconfig/get`).
2. Check the trigger is on: CRDT, recorder, and suggestion triggers are off by default.
3. Make the URL publicly reachable (not `localhost`) and allow Velt's static IPs for advanced webhooks.
4. Return 2xx within 15 seconds; queue heavy work.
5. For advanced webhooks, check the endpoint's `filterTypes` and whether the endpoint was disabled after 5 days of failures.
6. For signature mismatches, verify against the raw body and the correct endpoint secret (`webhooks-advanced`).

**Verification Checklist:**
- [ ] Errors are classified by `error.status`; only transient statuses are retried, with backoff and a cap
- [ ] Memory responses are read from `result`; other endpoints from `result.data`
- [ ] Advanced queries are enabled before using `get` endpoints and agent delete filters
- [ ] Bulk document errors are handled per item
- [ ] JWT refresh is wired through `authProvider` or the `token_expired` error event
- [ ] Webhook triggers, reachability, response time, and signatures are checked when events go missing

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/create - "Next Steps" (header pairs)
- https://docs.velt.dev/api-reference/rest-apis/v2/documents/delete-documents - "Partial Failures"
- https://docs.velt.dev/get-started/advanced#token-refresh - "Token Refresh"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/execution/run - "Run Execution" (errors)
- https://docs.velt.dev/ai/memory/overview#errors - "Errors"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/webhookconfig-update - "Update Webhook Config"
- https://docs.velt.dev/webhooks/advanced#troubleshooting-tips - "Troubleshooting tips"

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/api-reference/rest-apis/v2/organizations/get-organizations-v2
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
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/delete-comment-annotations
- https://docs.velt.dev/ai/agents/overview
- https://docs.velt.dev/ai/agents/setup
- https://docs.velt.dev/ai/memory/overview
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/fix-it-everywhere/estimate
- https://docs.velt.dev/api-reference/rest-apis/v2/auth/generate-token
- https://docs.velt.dev/get-started/advanced
- https://docs.velt.dev/api-reference/rest-apis/v2/users/add-users
- https://docs.velt.dev/api-reference/rest-apis/v2/documents/add-documents
- https://docs.velt.dev/api-reference/rest-apis/v2/documents/get-documents-v2
- https://docs.velt.dev/api-reference/rest-apis/v1/documents/delete-documents
- https://docs.velt.dev/api-reference/rest-apis/v2/organizations/add-organizations
- https://docs.velt.dev/api-reference/rest-apis/v2/folders/add-folder
- https://docs.velt.dev/api-reference/rest-apis/v2/activities/add-activities
- https://docs.velt.dev/api-reference/rest-apis/v2/crdt/add-crdt-data
- https://docs.velt.dev/api-reference/rest-apis/v2/livestate/broadcast-event
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/apikeyconfig-update
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/webhookconfig-update
- https://docs.velt.dev/security/supported-regions
- https://docs.velt.dev/security/auth-tokens
