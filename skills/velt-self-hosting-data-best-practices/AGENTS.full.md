# Velt Self Hosting Data Best Practices

**Version 1.1.0**  
Velt  
October 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Comprehensive guide for Velt self-hosting data feature, enabling storage of sensitive user-generated content (comments, attachments, reactions, recordings, user PII) on your own infrastructure. Covers endpoint-based and function-based data providers, VeltProvider dataProviders configuration, backend API route patterns, database schemas, file storage, retry and timeout configuration, and debugging. All guidance is evidence-backed from official Velt documentation and sample applications.

---

## Table of Contents

1. [Core Setup](#1-core-setup) — **CRITICAL**
   - 1.1 [Configure VeltProvider dataProviders Prop Before Calling identify](#11-configure-veltprovider-dataproviders-prop-before-calling-identify)
   - 1.2 [Install and Initialize the Velt Python SDK](#12-install-and-initialize-the-velt-python-sdk)
   - 1.3 [Return Standard Response Format from All Data Provider Handlers](#13-return-standard-response-format-from-all-data-provider-handlers)
   - 1.4 [Use authProvider on VeltProvider with dataProviders — Never Use identify()](#14-use-authprovider-on-veltprovider-with-dataproviders-never-use-identify)

2. [Comment Data Provider](#2-comment-data-provider) — **HIGH**
   - 2.1 [Use Endpoint-Based Config for Comment Data Provider](#21-use-endpoint-based-config-for-comment-data-provider)
   - 2.2 [Use Function-Based Comment Data Provider for Full Control](#22-use-function-based-comment-data-provider-for-full-control)

3. [Attachment Data Provider](#3-attachment-data-provider) — **HIGH**
   - 3.1 [Handle Attachment Uploads with multipart/form-data Not JSON](#31-handle-attachment-uploads-with-multipartform-data-not-json)

4. [Additional Providers](#4-additional-providers) — **MEDIUM**
   - 4.1 [Configure Reaction and Recording Data Providers](#41-configure-reaction-and-recording-data-providers)
   - 4.2 [Configure Retry Policies and Timeouts Per Data Provider](#42-configure-retry-policies-and-timeouts-per-data-provider)
   - 4.3 [Implement Read-Only User Data Provider for PII Protection](#43-implement-read-only-user-data-provider-for-pii-protection)
   - 4.4 [Self-Host Activity Log Data for Custom Activities](#44-self-host-activity-log-data-for-custom-activities)
   - 4.5 [Self-Host Notification Data for Custom Notifications](#45-self-host-notification-data-for-custom-notifications)
   - 4.6 [Self-Host Recording Data and Media Files](#46-self-host-recording-data-and-media-files)

5. [Backend Implementation](#5-backend-implementation) — **MEDIUM**
   - 5.1 [Authenticate Resolver Endpoints Before Touching Your Database](#51-authenticate-resolver-endpoints-before-touching-your-database)
   - 5.2 [Implement Database Storage with Upsert and Proper Indexing](#52-implement-database-storage-with-upsert-and-proper-indexing)
   - 5.3 [Store and Delete Attachments in S3-Compatible Object Storage](#53-store-and-delete-attachments-in-s3-compatible-object-storage)
   - 5.4 [Structure Backend API Routes for Data Provider Endpoints](#54-structure-backend-api-routes-for-data-provider-endpoints)

6. [Data Types](#6-data-types) — **MEDIUM**
   - 6.1 [Self-Hosting Data Type Reference — Provider Interfaces, Config, Request/Response Types](#61-self-hosting-data-type-reference-provider-interfaces-config-requestresponse-types)

7. [Python SDK](#7-python-sdk) — **HIGH**
   - 7.1 [Attachment Upload and Delete via Python SDK with S3](#71-attachment-upload-and-delete-via-python-sdk-with-s3)
   - 7.2 [Comments CRUD Operations via Python SDK](#72-comments-crud-operations-via-python-sdk)
   - 7.3 [Django, Flask, and FastAPI Integration Patterns](#73-django-flask-and-fastapi-integration-patterns)
   - 7.4 [Generate Auth Tokens via sdk.api.accessControl.generateToken](#74-generate-auth-tokens-via-sdkapiaccesscontrolgeneratetoken)
   - 7.5 [Use sdk.api.* for REST API Operations Without a Database](#75-use-sdkapi-for-rest-api-operations-without-a-database)
   - 7.6 [Users and Reactions Management via Python SDK](#76-users-and-reactions-management-via-python-sdk)

8. [Debugging](#8-debugging) — **LOW-MEDIUM**
   - 8.1 [Monitor Data Provider Events for Troubleshooting](#81-monitor-data-provider-events-for-troubleshooting)

9. [Full Self-Hosting](#9-full-self-hosting) — **HIGH**
   - 9.1 [Choose Partial or Full Self-Hosting Before Writing Any Code](#91-choose-partial-or-full-self-hosting-before-writing-any-code)
   - 9.2 [Wire the App to a Full Self-Hosted Deployment with config.selfHosted](#92-wire-the-app-to-a-full-self-hosted-deployment-with-configselfhosted)

---

## 1. Core Setup

**Impact: CRITICAL**

Essential setup patterns for enabling self-hosted data storage with Velt. Includes VeltProvider dataProviders prop configuration, initialization ordering constraints, setDocuments compatibility requirement, and the mandatory response format for all provider handlers.

### 1.1 Configure VeltProvider dataProviders Prop Before Calling identify

**Impact: CRITICAL (Required for self-hosted data to function)**

The `dataProviders` prop on `<VeltProvider>` is the entry point for all self-hosting data configuration. Data providers must be registered before user authentication, and self-hosting only works with `setDocuments` (plural), not `setDocument`.

**Incorrect (wrong initialization order or method):**

```jsx
import { VeltProvider } from '@veltdev/react';

function App() {
  // Data providers set AFTER identify — data flows to Velt servers instead
  return (
    <VeltProvider apiKey="YOUR_API_KEY">
      <AuthComponent /> {/* identify() called here */}
      <DataProviderSetup /> {/* Too late — providers missed */}
    </VeltProvider>
  );
}

// Also wrong: using setDocument (singular) instead of setDocuments
client.setDocument('doc-id'); // NOT compatible with self-hosting
```

**Correct (providers set on VeltProvider, using existing VeltInitializeDocument):**

```jsx
import { VeltProvider } from '@veltdev/react';
import VeltInitializeDocument from './VeltInitializeDocument';

// Define providers as stable references (outside component or useMemo)
const dataProviders = {
  comment: commentDataProvider,
  attachment: attachmentDataProvider,
  reaction: reactionDataProvider,
  recorder: recordingDataProvider, // the VeltDataProvider key is `recorder`, not `recording`
  user: userDataProvider,
};

function App() {
  return (
    // Data providers set BEFORE any identify/auth calls
    <VeltProvider apiKey="YOUR_API_KEY" dataProviders={dataProviders}>
      <AuthComponent />
      <VeltInitializeDocument documentId={docId} />
      <YourApp />
    </VeltProvider>
  );
}
```

**IMPORTANT:** Use the existing `VeltInitializeDocument` component from the setup skill for document identity. Do NOT create a custom `DocumentSetup` component — the existing one handles the `setDocuments` lifecycle correctly and avoids infinite render loops. The document shape is `{ id: string, metadata: { documentName: string } }` — NOT `{ documentId, documentName }`.

**ActivityAnnotationDataProvider shape:**

```typescript
const activityDataProvider = {
  get: async (req: GetActivityResolverRequest) => {
    // req: { activityIds?, documentIds?, organizationId? }
    // Re-hydrate and return activity records
    // Returns: ResolverResponse<Record<string, PartialActivityRecord>>
  },
  save: async (req: SaveActivityResolverRequest) => {
    // req: { activity: Record<string, PartialActivityRecord>, event?, metadata? }
    // Strip PII and persist; returns: ResolverResponse<undefined>
  },
  config: {
    resolveTimeout: 5000,          // ms to wait for resolver response
    fieldsToRemove: ['email', 'photoUrl'], // PII fields to strip on write
  },
};

const dataProviders = {
  comment: commentDataProvider,
  activity: activityDataProvider,
};
```

**Two registration styles (pick one — both accept the same `VeltDataProvider` object):**

```tsx
// Style 1: React — VeltProvider `dataProviders` prop (canonical for React/Next.js)
<VeltProvider apiKey={KEY} authProvider={auth} dataProviders={{
  comment:       commentDataProvider,
  reaction:      reactionDataProvider,
  recorder:      recorderDataProvider,
  notification:  notificationDataProvider,
  activity:      activityDataProvider,
  attachment:    attachmentDataProvider,
  anonymousUser: anonymousUserDataProvider,
  user:          userDataProvider,
}}>

// Style 2: Non-React frameworks — imperative setDataProviders()
await Velt.setDataProviders({
  comment:       commentDataProvider,
  reaction:      reactionDataProvider,
  recorder:      recorderDataProvider,
  notification:  notificationDataProvider,
  activity:      activityDataProvider,
  attachment:    attachmentDataProvider,
  anonymousUser: anonymousUserDataProvider,
  user:          userDataProvider,
});

// Anonymous-user resolver — also has a standalone setter if you prefer to register it
// separately. Velt calls it to map @mention emails to userIds BEFORE the comment is persisted.
Velt.setAnonymousUserDataProvider({
  resolveUserIdsByEmail: async (request) => {
    // request: { organizationId, documentId?, folderId?, emails: string[] }
    const userIdMap = await myBackend.resolveEmails(request.emails);
    return { data: userIdMap, success: true, statusCode: 200 };
    // Returns: Record<email, userId>
  },
  config: { resolveTimeout: 5000, getRetryConfig: { retryCount: 3, retryDelay: 1000 } },
});
```

**Key constraints:**

```tsx
"use client";

import { VeltProvider } from "@veltdev/react";
import { useVeltAuthProvider } from "@/components/velt/VeltInitializeUser";
import { VeltCollaboration } from "@/components/velt/VeltCollaboration";
import {
  commentDataProvider,
  userDataProvider,
  attachmentDataProvider,
  reactionDataProvider,
} from "@/components/velt/VeltDataProviders";

const VELT_API_KEY = process.env.NEXT_PUBLIC_VELT_API_KEY!;

export default function DocumentPage() {
  const { authProvider } = useVeltAuthProvider();

  return (
    <VeltProvider
      apiKey={VELT_API_KEY}
      authProvider={authProvider}
      dataProviders={{
        comment: commentDataProvider,
        user: userDataProvider,
        attachment: attachmentDataProvider,
        reaction: reactionDataProvider,
      }}
    >
      <VeltCollaboration documentId={docId} />
      {/* Your page content */}
    </VeltProvider>
  );
}
```

**The `VeltDataProviders.ts` file** must export each provider with function-based resolvers. Each resolver calls your API routes and returns `{ data, success, statusCode }`. See the `comment-function-provider`, `attachment-multipart-provider`, `provider-user-resolver`, and `provider-reaction-recording` rules for complete implementations.
**The API routes** follow the pattern `app/api/velt/{provider}/{operation}/route.ts` — see the `backend-api-routes` rule. Each route calls your database store and returns the standard response format.
**The database store** (`app/api/velt/store.ts`) handles PostgreSQL connection pooling, table initialization, and UPSERT operations — see the `backend-database-patterns` rule.

Reference: https://docs.velt.dev/self-hosting/partial/overview; https://docs.velt.dev/self-hosting/partial/comments - Important Notes

---

### 1.2 Install and Initialize the Velt Python SDK

**Impact: CRITICAL (A missing database extra fails at initialize(), and a database block on a REST-only service is unnecessary)**

The `velt-py` package exposes two independent backends: `sdk.selfHosting.*` stores Velt data in your own MongoDB or PostgreSQL (plus S3 for attachments), and `sdk.api.*` calls Velt's REST APIs with no database. Since 0.2.0 the core install carries no database driver; install the extra for the database you self-host on.

The entry point is always `VeltSDK.initialize({...})` with a config dict. The old class-based `VeltSdk(VeltSdkConfig(...))` pattern does not exist.

**Install:**

```bash
pip install velt-py                # REST API backend only
pip install 'velt-py[mongodb]'     # + self-hosting on MongoDB (MongoDB 6+)
pip install 'velt-py[postgres]'    # + self-hosting on PostgreSQL (PostgreSQL 14+)
pip install 'velt-py[auth]'        # optional: built-in JWT/JWKS path of verifyToken
```

**Incorrect (0.1.x habits):**

```python
# requirements.txt
velt-py            # WRONG for MongoDB self-hosting on 0.2.x: pymongo is no longer installed.
                   # initialize() fails with: MongoDB support requires: pip install "velt-py[mongodb]"
```

**Correct (REST API only, no database):**

```python
from velt_py import VeltSDK

sdk = VeltSDK.initialize({
    'apiKey': 'YOUR_VELT_API_KEY',
    'authToken': 'YOUR_VELT_AUTH_TOKEN',
})
# All sdk.api.* services are available. Calling a self-hosting resolver on this
# instance returns a clear error saying a 'database' block is required.
```

**Correct (self-hosting on MongoDB or PostgreSQL, plus S3):**

```python
import os
from velt_py import VeltSDK

sdk = VeltSDK.initialize({
    'database': {
        # MongoDB (default type): connection string, or host/username/password/auth_database/database_name
        'connection_string': os.environ['VELT_MONGODB_URI'],
        # PostgreSQL instead:
        # 'type': 'postgresql',
        # 'connection_string': 'postgresql://user:pass@host:5432/velt',
        # 'sslmode': 'verify-full', 'sslrootcert': '/path/to/ca.pem',  # for any non-local database
    },
    'aws': {  # only needed for attachments
        'bucket_name': os.environ['AWS_S3_BUCKET'],
        'region': os.environ.get('AWS_REGION', 'us-east-1'),
        'access_key_id': os.environ['AWS_ACCESS_KEY_ID'],
        'secret_access_key': os.environ['AWS_SECRET_ACCESS_KEY'],
    },
    'apiKey': os.environ['VELT_API_KEY'],
    'authToken': os.environ['VELT_AUTH_TOKEN'],
})
```

**Environment variables.** `VELT_API_KEY` and `VELT_AUTH_TOKEN` can replace `apiKey` / `authToken`; `VELT_WORKSPACE_ID` and `VELT_WORKSPACE_AUTH_TOKEN` scope workspace operations.
**PostgreSQL notes.** Every `sdk.selfHosting.*` method behaves the same on both backends. Each collection is a table with one JSONB `data` column. With `manage_schema: True` (default) the SDK creates the schema, tables, and indexes on first connection, so the role needs `CREATE`; for locked-down roles set `'manage_schema': False` and apply DDL from `velt_py.database.connection.postgres_schema_sql(Config({...}))`. The default `sslmode: prefer` never verifies the certificate. Multi-process servers (gunicorn, uWSGI) open one pool per worker; under uWSGI use `--enable-threads`. `database_name` overrides the database in the connection string; `pool_min_size` / `pool_max_size` apply to both backends. The SDK does not migrate data between MongoDB and PostgreSQL.

**Custom collection (table) names and user field mapping:**

```python
sdk = VeltSDK.initialize({
    'database': {'connection_string': os.environ['VELT_MONGODB_URI']},
    'collections': {
        'comments': 'comment_annotations',    # defaults shown
        'reactions': 'reaction_annotations',
        'attachments': 'attachments',
        'users': 'users',
    },
    'user_schema': {
        'userId': '_id',            # your DB field for user ID
        'name': 'display_name',
        'email': 'email_address',
        'photoUrl': 'avatar_url',
        # also: 'color', 'textColor', 'isAdmin', 'initial'
    },
})
from velt_py.exceptions import VeltSDKError, VeltValidationError, VeltTokenError, VeltApiError

try:
    result = sdk.api.organizations.getOrganizations(request)
except VeltApiError as e:
    print(f'API error: {e.message}')
except VeltSDKError as e:
    print(f'SDK error: {e.message}')
```

**Error handling.** `sdk.selfHosting.*` returns `{'success': False, 'statusCode': 400 | 404 | 500, 'error': '...', 'errorCode': 'INVALID_INPUT' | 'NOT_FOUND' | 'INTERNAL_ERROR'}` on failure. `sdk.api.*` returns a dict with either `result` or `error`, and raises typed exceptions that all extend `VeltSDKError`:
| Exception | When raised |
|-----------|-------------|
| `VeltSDKError` | Base class for any SDK-level error |
| `VeltValidationError` | SDK-level validation such as missing required config; `sdk.api.*` does not validate request payloads locally |
| `VeltTokenError` | Token generation or authentication failure |
| `VeltApiError` | REST API errors (network failures, unexpected responses) |

---

### 1.3 Return Standard Response Format from All Data Provider Handlers

**Impact: CRITICAL (SDK treats non-standard responses as failures and triggers retries)**

Every data provider handler (endpoint or function) must return `{ data, success, statusCode }`. Missing any of these fields causes the SDK to treat the response as a failure and trigger retries.

**Incorrect (missing required fields):**

```js
// Missing 'success' and 'statusCode' — SDK treats as failure
app.post('/api/velt/comments/get', async (req, res) => {
  const comments = await db.getComments(req.body);
  res.json({ data: comments }); // WRONG: missing success and statusCode
});

// Wrong field name — 'status' instead of 'statusCode'
res.json({ data: comments, success: true, status: 200 }); // WRONG field name
```

**Correct (standard response format):**

```jsx
// Success response
app.post('/api/velt/comments/get', async (req, res) => {
  try {
    const comments = await db.getComments(req.body);
    res.json({
      data: comments,      // The payload (object, array, or null)
      success: true,       // Boolean — must be true/false, not truthy/falsy
      statusCode: 200      // Number — HTTP-style status code
    });
  } catch (error) {
    res.json({
      data: null,
      success: false,
      statusCode: 500
    });
  }
});
const fetchCommentsFromDB = async (request) => {
  try {
    const response = await fetch('/api/velt/comments/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const result = await response.json();
    return {
      data: result.data,
      success: true,
      statusCode: 200
    };
  } catch (error) {
    return {
      data: null,
      success: false,
      statusCode: 500
    };
  }
};
```

**For function-based providers** (same format returned from the resolver):

Reference: https://docs.velt.dev/self-hosting/partial/comments; https://docs.velt.dev/self-hosting/partial/attachments; https://docs.velt.dev/self-hosting/partial/reactions

---

### 1.4 Use authProvider on VeltProvider with dataProviders — Never Use identify()

**Impact: CRITICAL (Using deprecated auth methods breaks data provider initialization ordering)**

VeltProvider requires the `authProvider` prop for authentication. The `useIdentify()` hook and `client.identify()` method are deprecated — they lack automatic token refresh and retry logic. For self-hosting, `dataProviders` must also be set on VeltProvider so that data providers are initialized before authentication occurs.

**Incorrect (identify() after render; providers may not be registered when Velt starts fetching):**

```tsx
function AuthGate({ user }) {
  const { client } = useVeltClient();
  useEffect(() => {
    if (client && user) client.identify(user); // deprecated; no token refresh or retry
  }, [client, user]);
  return null;
}
```

**Correct (authProvider + dataProviders on VeltProvider):**

```tsx
"use client";

import { useMemo } from "react";
import { VeltProvider } from "@veltdev/react";
import type { VeltAuthProvider } from "@veltdev/types";
import { useAppUser } from "@/app/userAuth/AppUserContext";
import { dataProviders } from "@/components/velt/VeltDataProviders";

function useVeltAuthProvider() {
  const { user } = useAppUser();
  const authProvider: VeltAuthProvider | undefined = useMemo(() => {
    if (!user) return undefined;
    return {
      user: {
        userId: user.userId,
        organizationId: user.organizationId,
        name: user.name,
        email: user.email,
      },
      retryConfig: { retryCount: 3, retryDelay: 1000 },
      generateToken: async () => {
        const resp = await fetch("/api/velt/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.userId,
            organizationId: user.organizationId,
          }),
        });
        const { token } = await resp.json();
        return token;
      },
    };
  }, [user]);
  return { authProvider };
}

export default function DocumentPage() {
  const { authProvider } = useVeltAuthProvider();
  if (!authProvider) return <div>Loading...</div>;

  return (
    <VeltProvider
      apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY!}
      authProvider={authProvider}
      dataProviders={dataProviders}
    >
      {/* Self-hosted Velt components go here */}
    </VeltProvider>
  );
}
```

**Why ordering matters for self-hosting:** Data providers must be registered on VeltProvider via the `dataProviders` prop so they are initialized before authentication. If auth happens first (via the deprecated `identify()`), the data providers may not be ready when Velt starts fetching data, causing silent failures or data going to Velt servers instead of your infrastructure.

---

## 2. Comment Data Provider

**Impact: HIGH**

Two approaches for routing comment CRUD operations through your own infrastructure. The endpoint-based approach provides URL configs and lets the SDK handle HTTP requests with automatic retry. The function-based approach gives full control via resolver functions for custom data flow logic.

### 2.1 Use Endpoint-Based Config for Comment Data Provider

**Impact: HIGH (Simplest approach for standard REST backend integrations)**

The endpoint-based approach provides URL configurations and the SDK handles HTTP requests, serialization, and retries automatically. This is the simpler approach when you have standard REST endpoints.

**Incorrect (providing URLs without proper config structure):**

```jsx
// Wrong: URLs as flat strings, not in config objects
const commentDataProvider = {
  getUrl: '/api/velt/comments/get',    // Wrong shape
  saveUrl: '/api/velt/comments/save',
};
```

**Correct (endpoint-based config):**

```jsx
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const commentDataProvider = {
  config: {
    getConfig: {
      url: `${BACKEND_URL}/comments/get`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      }
    },
    saveConfig: {
      url: `${BACKEND_URL}/comments/save`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      }
    },
    deleteConfig: {
      url: `${BACKEND_URL}/comments/delete`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      }
    },
    resolveTimeout: 15000,
    saveRetryConfig: { retryCount: 3, retryDelay: 2000 },
    deleteRetryConfig: { retryCount: 3, retryDelay: 2000 },
    getRetryConfig: { retryCount: 3, retryDelay: 2000 },
  }
};

// Pass to VeltProvider
<VeltProvider apiKey="KEY" dataProviders={{ comment: commentDataProvider }} />
```

**What the SDK sends to your endpoints:**

```js
// GET request body
{ organizationId: "org-id", documentIds: ["doc-id"], commentAnnotationIds: ["ann-id"] }

// SAVE request body
{ commentAnnotation: { "annotationId": { /* full annotation data */ } }, metadata: { documentId, organizationId } }

// DELETE request body
{ commentAnnotationId: "ann-id", metadata: { documentId, organizationId } }
```

**Custom field control with `additionalFields` and `fieldsToRemove`:**

```jsx
const commentDataProvider = {
  config: {
    // ...endpoint configs above...
    additionalFields: ['status', 'assignedTo', 'priority'],   // copy to your DB, keep in Velt's
    fieldsToRemove:   ['internalTicketId'],                    // move out of Velt's DB into yours
  }
};
const commentDataProvider = {
  config: {
    saveConfig: {
      url: `${BACKEND_URL}/comments/save`,
      headers: async () => ({ Authorization: `Bearer ${await getFreshToken()}` }),
      credentials: 'include',
    },
    // Opt into non-core events on the same save endpoint (see comment-function-provider)
    additionalSaveEvents: [{ event: 'comment_annotation.status_change' }],
  },
};
```

**Short-lived tokens and cookies.** On any endpoint config (`getConfig`, `saveConfig`, `deleteConfig`) of any provider, `headers` can be an async function that the SDK resolves on every request, including each retry, so a short-lived token stays fresh. Static header objects are captured once. Set `credentials: 'include'` to send cookies for cross-origin session auth; when unset, `fetch()` keeps its default.
Verify that credential on your backend before touching the database (see `backend-verify-resolver-auth`).
See the `provider-retry-timeout` rule for the full `additionalFields` vs `fieldsToRemove` comparison and the list of structural fields that must **never** appear in `fieldsToRemove` (identifiers, metadata, location, status, resolver flags, …).

---

### 2.2 Use Function-Based Comment Data Provider for Full Control

**Impact: HIGH (Full control over data flow for custom logic and transformations)**

The function-based approach uses resolver callbacks that receive request objects and return responses. Use this when you need custom logic — transformations, multi-system writes, conditional routing, or non-REST backends.

**Incorrect (missing operations or wrong return format):**

```jsx
// Missing delete handler — SDK can't clean up data
const commentDataProvider = {
  get: async (request) => { /* ... */ },
  save: async (request) => { /* ... */ },
  // delete: missing!
};

// Wrong: returning raw data instead of standard format
const fetchComments = async (request) => {
  const data = await db.query(request);
  return data; // WRONG: must return { data, success, statusCode }
};
```

**Correct (all three operations with TypeScript types and standard response format):**

```tsx
// Standard response format — ALL data provider functions must return this shape
type DataProviderResponse = {
  data?: unknown;
  success: boolean;
  statusCode: number;
};

// Comment provider request types
type CommentGetRequest = {
  organizationId: string;
  documentIds?: string[];
  commentAnnotationIds?: string[];
  folderId?: string;
  allDocuments?: boolean;
};

type CommentSaveRequest = {
  commentAnnotation: Record<string, {
    annotationId: string;
    metadata?: unknown;
    comments: Record<string, { commentId: string | number; commentHtml?: string; commentText?: string }>;
  }>;
};

type CommentDeleteRequest = {
  commentAnnotationId: string;
  metadata?: unknown;
};

const COMMENTS_URL = '/api/velt/comments';

const fetchCommentsFromDB = async (request: CommentGetRequest): Promise<DataProviderResponse> => {
  try {
    const response = await fetch(`${COMMENTS_URL}/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) return { data: {}, success: false, statusCode: response.status };
    const data = await response.json();
    return { data: data.result || {}, success: true, statusCode: response.status };
  } catch (error) {
    console.error('[Velt Self-Host] Error fetching comments:', error);
    return { data: {}, success: false, statusCode: 500 };
  }
};

const saveCommentsToDB = async (request: CommentSaveRequest): Promise<DataProviderResponse> => {
  try {
    const response = await fetch(`${COMMENTS_URL}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) return { success: false, statusCode: response.status };
    await response.json();
    return { success: true, statusCode: 200 };
  } catch (error) {
    console.error('[Velt Self-Host] Error saving comments:', error);
    return { success: false, statusCode: 500 };
  }
};

const deleteCommentsFromDB = async (request: CommentDeleteRequest): Promise<DataProviderResponse> => {
  try {
    const response = await fetch(`${COMMENTS_URL}/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) return { success: false, statusCode: response.status };
    await response.json();
    return { success: true, statusCode: 200 };
  } catch (error) {
    console.error('[Velt Self-Host] Error deleting comments:', error);
    return { success: false, statusCode: 500 };
  }
};

export const commentDataProvider = {
  get: fetchCommentsFromDB,
  save: saveCommentsToDB,
  delete: deleteCommentsFromDB,
  config: {
    resolveTimeout: 15000,
    saveRetryConfig: { retryCount: 3, retryDelay: 2000 },
    deleteRetryConfig: { retryCount: 2, retryDelay: 1000 },
    getRetryConfig: { retryCount: 3, retryDelay: 2000 },
  },
};
```

**Incorrect (assuming `save` fires on every annotation change — leaks status events into your audit log):**

```tsx
const saveCommentsToDB = async (request: CommentSaveRequest): Promise<DataProviderResponse> => {
  // BUG: status flips and assignee changes never call save — this audit log will be sparse and misleading
  await auditLog.append({ action: 'comment_change', payload: request });
  await db.upsertComments(request.commentAnnotation);
  return { success: true, statusCode: 200 };
};
```

**Correct (treat `save` as PII-only; key off `request.event` and let pure structural changes flow through Velt untouched):**

```tsx
const saveCommentsToDB = async (request: CommentSaveRequest & { event?: string }): Promise<DataProviderResponse> => {
  // request.event is one of: comment_annotation.add | comment.add | comment.update | comment.delete (or undefined for drafts)
  // It is the SDK's signal that PII changed — that's the only reason your handler is being called.
  await db.upsertComments(request.commentAnnotation);
  // If you need a status/priority/assignment audit log, subscribe to the SDK event stream instead — it doesn't flow through here.
  return { success: true, statusCode: 200 };
};
import type { CommentResolverSaveEvent } from '@veltdev/react';

const additionalSaveEvents: { event: CommentResolverSaveEvent }[] = [
  { event: 'comment_annotation.status_change' },
  { event: 'comment_annotation.assign' },
];

export const commentDataProvider = {
  get: fetchCommentsFromDB,
  save: async (request) => {
    // request.event is a ResolverActions value for the 4 core PII events,
    // or a CommentResolverSaveEvent string for the opted-in events.
    // request.targetComment (when present) is the comment the action happened on: context only, do not persist it.
    if (request.event === 'comment_annotation.status_change') {
      await auditLog.append({ annotationIds: Object.keys(request.commentAnnotation) });
      return { success: true, statusCode: 200 };
    }
    return saveCommentsToDB(request);
  },
  delete: deleteCommentsFromDB,
  config: { additionalSaveEvents },
};
```

Set `config.additionalSaveEvents` (an `AdditionalSaveEventConfig[]`, each `{ event: CommentResolverSaveEvent }`) to also receive annotation-level lifecycle events on the same `save` handler or `saveConfig` endpoint. `CommentResolverSaveEvent` is a string-literal union in `@veltdev/react`, so pass the string values. Values: `comment_annotation.status_change`, `comment_annotation.priority_change`, `comment_annotation.assign`, `comment_annotation.access_mode_change`, `comment_annotation.custom_list_change`, `comment_annotation.approve`, `comment.accept`, `comment.reject`, `comment_annotation.suggestion_accept`, `comment_annotation.suggestion_reject`, `comment.reaction_add`, `comment.reaction_delete`, `comment_annotation.subscribe`, `comment_annotation.unsubscribe`.
`comment.reaction_add` / `comment.reaction_delete` (comment-level reactions) are distinct from the reaction resolver's `reaction.add` / `reaction.delete`.

---

## 3. Attachment Data Provider

**Impact: HIGH**

Attachment uploads use multipart/form-data encoding, not JSON. This is the critical difference from all other data providers. Covers both endpoint-based and function-based approaches for attachment save and delete operations.

### 3.1 Handle Attachment Uploads with multipart/form-data Not JSON

**Impact: HIGH (Prevents silent upload failures from wrong content type)**

Attachment save operations use `multipart/form-data` encoding — not JSON like all other data providers. This is the most common source of self-hosting integration failures. Attachments only support save and delete (no get).

**Incorrect (expecting JSON for attachment save):**

```js
// Backend expecting JSON — will fail silently on attachment uploads
app.post('/api/velt/attachments/save', express.json(), async (req, res) => {
  const file = req.body.file; // undefined — file sent as multipart, not JSON
});
```

**Correct (endpoint-based attachment provider):**

```jsx
const attachmentDataProvider = {
  config: {
    saveConfig: {
      url: `${BACKEND_URL}/attachments/save`,
      // Do NOT set Content-Type header — browser sets it automatically
      // with correct multipart boundary parameter
      headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
    },
    deleteConfig: {
      url: `${BACKEND_URL}/attachments/delete`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      }
    },
    resolveTimeout: 30000,  // Longer timeout for file uploads
    saveRetryConfig: { retryCount: 3, retryDelay: 2000 },
    deleteRetryConfig: { retryCount: 2, retryDelay: 1000 },
  }
};

<VeltProvider apiKey="KEY" dataProviders={{ attachment: attachmentDataProvider }} />
```

**Correct (function-based attachment provider with TypeScript types):**

```tsx
type AttachmentSaveRequest = {
  attachment: {
    attachmentId?: number;
    name?: string;
    url?: string;
    mimeType?: string;
    size?: number;
    base64Data?: string;
    file?: File;
  };
  metadata?: unknown;
};

type AttachmentDeleteRequest = {
  attachmentId: number;
  metadata?: unknown;
};

type DataProviderResponse = {
  data?: unknown;
  success: boolean;
  statusCode: number;
};

const ATTACHMENTS_URL = '/api/velt/attachments';

// Helper: convert File to base64 data URL
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const saveAttachmentToDB = async (request: AttachmentSaveRequest): Promise<DataProviderResponse> => {
  try {
    const { file, ...attachmentWithoutFile } = request.attachment;
    let base64Data = request.attachment.base64Data;

    // Convert File object to base64 if present
    if (file && file instanceof File) {
      base64Data = await fileToBase64(file);
    }

    const payload = {
      attachment: { ...attachmentWithoutFile, base64Data },
      metadata: request.metadata,
    };

    const response = await fetch(`${ATTACHMENTS_URL}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return { success: false, statusCode: response.status };
    const data = await response.json();
    // data.result MUST contain { url } pointing to where the file can be fetched
    return { success: true, statusCode: 200, data: data.result };
  } catch (error) {
    console.error('[Velt Self-Host] Error saving attachment:', error);
    return { success: false, statusCode: 500 };
  }
};

const deleteAttachmentFromDB = async (request: AttachmentDeleteRequest): Promise<DataProviderResponse> => {
  try {
    const response = await fetch(`${ATTACHMENTS_URL}/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) return { success: false, statusCode: response.status };
    await response.json();
    return { success: true, statusCode: 200 };
  } catch (error) {
    console.error('[Velt Self-Host] Error deleting attachment:', error);
    return { success: false, statusCode: 500 };
  }
};

export const attachmentDataProvider = {
  save: saveAttachmentToDB,
  delete: deleteAttachmentFromDB,
  config: {
    resolveTimeout: 30000,
    saveRetryConfig: { retryCount: 3, retryDelay: 2000 },
    deleteRetryConfig: { retryCount: 2, retryDelay: 1000 },
  },
};
// app/api/velt/attachments/get/[attachmentId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAttachment } from '../../../store';

export async function GET(request: NextRequest, { params }: { params: { attachmentId: string } }) {
  const attachment = await getAttachment(Number(params.attachmentId));
  if (!attachment?.base64Data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  // Decode base64 data URL and serve as binary
  const [header, base64] = attachment.base64Data.split(',');
  const mimeType = header.match(/data:(.*?);/)?.[1] || 'application/octet-stream';
  const buffer = Buffer.from(base64, 'base64');
  return new NextResponse(buffer, {
    headers: { 'Content-Type': mimeType, 'Content-Length': String(buffer.length) },
  });
}
```

The backend attachment GET route must also exist to serve stored files:

**Backend handling (multipart parsing):**

```js
// Using multer (Express) or equivalent multipart parser
app.post('/api/velt/attachments/save', upload.single('file'), async (req, res) => {
  const file = req.file;                              // Binary file from multipart
  const metadata = JSON.parse(req.body.request);      // JSON metadata string

  // Upload to your storage (S3, GCS, etc.)
  const url = await uploadToStorage(file);

  // Save response MUST include the stored URL
  res.json({
    data: { url },     // URL where the file can be accessed
    success: true,
    statusCode: 200
  });
});
```

**Two storage scopes — keep them separate:**

```ts
await Velt.setDataProviders({
  // Comment attachments — your S3/GCS/Azure bucket A
  attachment: {
    async save({ file, name, metadata }) {
      const url = await commentBucket.put(file, name);
      return { data: { url }, success: true, statusCode: 200 };
    },
    async delete({ attachmentId, metadata }) {
      await commentBucket.remove(attachmentId);
      return { success: true, statusCode: 200 };
    },
  },

  // Recording metadata → your DB; recording binaries → bucket B (can be the same bucket)
  recorder: {
    async get(req)    { /* … */ },
    async save(req)   { /* … */ },
    async delete(req) { /* … */ },
    storage: {
      async save({ file, name }) {
        const url = await recordingBucket.put(file, name);
        return { data: { url }, success: true, statusCode: 200 };
      },
      async delete({ attachmentId }) {
        await recordingBucket.remove(attachmentId);
        return { success: true, statusCode: 200 };
      },
    },
  },
});
```

When `recorder.storage` is set, Velt uploads the entire recording to your bucket once (after the recording stops and the annotation is saved), patches the returned `url` onto the annotation, and skips its own server-side encoding/transcription post-processing — you own those files end to end. Deletes for both scopes receive the minimized metadata `{ apiKey, documentId, organizationId, folderId? }` plus the `attachmentId`.

**Delete handler metadata contract (v5.0.2-beta.11+):**

```typescript
// BEFORE v5.0.2-beta.11: metadata may have included internal Velt fields
const deleteAttachmentFromDB = async (request: AttachmentDeleteRequest) => {
  // Do NOT rely on internal fields in request.metadata
};

// AFTER v5.0.2-beta.11: metadata contains only client-set fields
const deleteAttachmentFromDB = async (request: AttachmentDeleteRequest) => {
  // Use top-level request.attachmentId — always present
  const { attachmentId } = request;
  await db.deleteAttachment(attachmentId);
  return { success: true, statusCode: 200 };
};
interface SaveAttachmentResolverRequest {
  file: File;                                            // raw binary; multipart `file` part in URL mode, provider.save arg in function mode
  attachment: {
    attachmentId: number;                                // required (random 6-digit id, also at metadata.attachmentId)
    name?: string;                                       // original file name (optional)
    mimeType?: string;                                   // MIME type (optional)
  };
  metadata: AttachmentResolverMetadata;
  event?: ResolverActions;                               // e.g. ATTACHMENT_ADD ("attachment.add") on save
}

interface AttachmentResolverMetadata {
  organizationId: string | null;                         // org scope
  documentId: string | null;                             // document scope
  folderId?: string | null;                              // folder scope; on delete only when truthy
  attachmentId: number | null;                           // mirror of top-level attachmentId
  commentAnnotationId: string | null;                    // owning comment annotation; dropped on delete
  apiKey: string | null;                                 // Velt public API key
}

// Required return shape
interface SaveAttachmentResolverData { url: string; }   // persisted back onto Attachment.url
```

The attachment provider sits **outside** the `Partial<X>` strip model used by every other provider. There is no `get` and no `Partial<Attachment>` — attachments are binary files. When Velt hands a save call to your storage provider, the payload is a fixed shape:
The JSON `request` body in URL (endpoint) mode is exactly `{ attachment: { attachmentId, name, mimeType }, metadata, event }` — the `File` is destructured out and sent as a separate multipart binary part to your storage, **never to Velt**. On delete, Velt sends `{ attachmentId, metadata: { apiKey, documentId, organizationId, folderId? }, event }` where `event` is `ATTACHMENT_DELETE` (`"attachment.delete"`).
What persists on Velt's side after a successful save (everything except the binary bytes): `attachmentId` (PK), `name`, `size`, `type`, `url` (the URL **your** storage returned), `thumbnail`, `thumbnailWithPlayIconUrl`, `metadata` (arbitrary), `mimeType`, `previewImages`, and the `isAttachmentResolverUsed` flag. The `url` is the only field that comes from your `save` response; the rest are structural.

**Incorrect (assuming `request.attachment` is a full `Attachment` object — only three sub-fields are guaranteed):**

```tsx
const saveAttachment = async (request: SaveAttachmentResolverRequest) => {
  // BUG: `size`, `thumbnail`, `previewImages` are not in `request.attachment`.
  // Velt computes those on its side from the `{ url }` you return plus the binary it just handed you.
  const { attachmentId, name, mimeType, size, thumbnail } = request.attachment as any;
  const url = await storage.put(request.file, { size }); // `size` is undefined
  return { data: { url }, success: true, statusCode: 200 };
};
```

**Correct (only `attachmentId` / `name` / `mimeType` are in the request; choose your own bucket path):**

```tsx
const saveAttachment = async (request: SaveAttachmentResolverRequest) => {
  const { attachmentId, name = 'untitled', mimeType } = request.attachment;
  const { organizationId, documentId, folderId } = request.metadata;
  const key = `attachments/${organizationId}/${documentId}/${attachmentId}-${name}`;
  const url = await storage.put(request.file, key, { contentType: mimeType });
  return { data: { url }, success: true, statusCode: 200 };
};
```

Reference: https://docs.velt.dev/self-hosting/partial/attachments - Endpoint-Based, Function-Based; https://docs.velt.dev/self-hosting/partial/overview - "Attachment & recording storage"; https://docs.velt.dev/self-hosting/partial/field-inventory - "Attachments"

---

## 4. Additional Providers

**Impact: MEDIUM**

User, reaction, recorder, notification, and activity data providers. User provider is read-only (get only) for PII protection. Reaction and recorder providers support full CRUD following the same pattern as comments. All providers share retry and timeout configuration options; `additionalFields` / `fieldsToRemove` support differs per provider.

### 4.1 Configure Reaction and Recording Data Providers

**Impact: MEDIUM (Self-host reaction emoji data and recording annotation PII)**

Reaction and recording providers follow the identical pattern as comments: get/save/delete with either endpoint-based or function-based approach. They share the same request/response contract.

**Incorrect (inconsistent response formats across providers):**

```jsx
// Comments return standard format, but reactions return different shape
const reactionDataProvider = {
  get: async (req) => {
    const data = await db.getReactions(req);
    return data; // WRONG: must return { data, success, statusCode }
  }
};
```

**Correct (both providers with consistent pattern):**

```jsx
// Reaction data provider — endpoint-based
const reactionDataProvider = {
  config: {
    getConfig: { url: `${BACKEND_URL}/reactions/get`, headers },
    saveConfig: { url: `${BACKEND_URL}/reactions/save`, headers },
    deleteConfig: { url: `${BACKEND_URL}/reactions/delete`, headers },
    resolveTimeout: 10000,
    getRetryConfig: { retryCount: 3, retryDelay: 1000 },
    saveRetryConfig: { retryCount: 2, retryDelay: 1000 },
    deleteRetryConfig: { retryCount: 2, retryDelay: 1000 },
  }
};

// Recording data provider — endpoint-based
const recordingDataProvider = {
  config: {
    getConfig: { url: `${BACKEND_URL}/recordings/get`, headers },
    saveConfig: { url: `${BACKEND_URL}/recordings/save`, headers },
    deleteConfig: { url: `${BACKEND_URL}/recordings/delete`, headers },
    resolveTimeout: 10000,
    getRetryConfig: { retryCount: 3, retryDelay: 1000 },
    saveRetryConfig: { retryCount: 2, retryDelay: 1000 },
    deleteRetryConfig: { retryCount: 2, retryDelay: 1000 },
  }
};

// Function-based reaction provider with TypeScript types (same pattern as comments)

type ReactionAnnotation = {
  annotationId: string;
  documentId?: string;
  organizationId?: string;
  metadata?: unknown;
  icon?: string;
};

type ReactionGetRequest = {
  organizationId: string;
  reactionAnnotationIds?: string[];
  documentIds?: string[];
  folderId?: string;
  allDocuments?: boolean;
};

type ReactionSaveRequest = {
  reactionAnnotation: Record<string, ReactionAnnotation>;
};

type ReactionDeleteRequest = {
  reactionAnnotationId: string;
  metadata?: unknown;
};

type DataProviderResponse = {
  data?: unknown;
  success: boolean;
  statusCode: number;
};

const REACTIONS_URL = '/api/velt/reactions';

const fetchReactionsFromDB = async (request: ReactionGetRequest): Promise<DataProviderResponse> => {
  try {
    const response = await fetch(`${REACTIONS_URL}/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) return { data: {}, success: false, statusCode: response.status };
    const data = await response.json();
    return { data: data.result || {}, success: true, statusCode: response.status };
  } catch (error) {
    return { data: {}, success: false, statusCode: 500 };
  }
};

const saveReactionsToDB = async (request: ReactionSaveRequest): Promise<DataProviderResponse> => {
  try {
    const response = await fetch(`${REACTIONS_URL}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) return { success: false, statusCode: response.status };
    await response.json();
    return { success: true, statusCode: 200 };
  } catch (error) {
    return { success: false, statusCode: 500 };
  }
};

const deleteReactionFromDB = async (request: ReactionDeleteRequest): Promise<DataProviderResponse> => {
  try {
    const response = await fetch(`${REACTIONS_URL}/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) return { success: false, statusCode: response.status };
    await response.json();
    return { success: true, statusCode: 200 };
  } catch (error) {
    return { success: false, statusCode: 500 };
  }
};

export const reactionDataProvider = {
  get: fetchReactionsFromDB,
  save: saveReactionsToDB,
  delete: deleteReactionFromDB,
  config: { resolveTimeout: 10000 },
};

<VeltProvider apiKey="KEY" dataProviders={{
  comment: commentDataProvider,
  reaction: reactionDataProvider,
  recorder: recordingDataProvider, // the VeltDataProvider key is `recorder`, not `recording`
}} />
```

**What each provider stores:**

```js
// Reaction get:    { organizationId, reactionAnnotationIds?, documentIds?, folderId?, allDocuments? }
// Reaction save:   { reactionAnnotation: Record<string, PartialReactionAnnotation>, metadata?, event? }
// Reaction delete: { reactionAnnotationId, metadata?, event? }
// Recorder get:    { organizationId, recorderAnnotationIds?, documentIds? }
// Recorder save:   { recorderAnnotation: Record<string, PartialRecorderAnnotation>, metadata?, event? }
// Recorder delete: { recorderAnnotationId, metadata?, event? }
```

The `dataProviders` key for recordings is `recorder` (there is no `recording` key).

**Incorrect (treating `iconUrl` as PII and writing it to your DB instead of Velt's):**

```jsx
// BUG: iconUrl is structural — it stays on Velt's side. Mirroring it on your end is fine but you must not depend on it being stripped.
const saveReaction = async (request) => {
  const { iconUrl, iconEmoji, icon, ...rest } = request.reactionAnnotation;
  await db.upsert({ icon, iconUrl, iconEmoji }); // assumes Velt won't see iconUrl — wrong
  return { success: true, statusCode: 200 };
};
```

**Correct (only `icon` is the relocated field; everything else is sent to Velt verbatim):**

```jsx
const saveReaction = async (request) => {
  // request.reactionAnnotation is keyed by annotationId; each value carries only what was stripped:
  // { annotationId, metadata, icon, from? }
  for (const [annotationId, partial] of Object.entries(request.reactionAnnotation)) {
    await db.upsertReactionIcon(annotationId, { icon: partial.icon, from: partial.from });
  }
  return { success: true, statusCode: 200 };
};
```

- [ ] Both providers return `{ data, success, statusCode }` format
- [ ] Get returns data keyed by annotationId
- [ ] All three operations implemented for each provider
- [ ] Backend uses same upsert pattern as comments
- [ ] `save` handler treats `icon` as the only relocated field; does not strip `iconUrl` / `iconEmoji`
- [ ] `position` is written as `null` to Velt regardless of self-hosting (do not try to round-trip its value through the resolver)
- [ ] Recordings are registered under the `recorder` key
- [ ] `fieldsToRemove` on reaction / recorder configs lists only your own custom fields, never `icon` or structural fields

---

### 4.2 Configure Retry Policies and Timeouts Per Data Provider

**Impact: MEDIUM (Prevents cascading failures and handles transient backend errors)**

Each data provider supports `resolveTimeout` and per-operation retry configs. Set these based on your backend's latency and reliability characteristics to prevent cascading failures.

**Incorrect (default timeout with slow backend):**

```jsx
// No timeout or retry config — uses SDK defaults
// Slow backends cause the UI to hang with no feedback
const commentDataProvider = {
  get: fetchComments,
  save: saveComments,
  delete: deleteComments,
  // No config — SDK uses internal defaults
};
```

**Correct (explicit timeout and retry configuration):**

```jsx
const commentDataProvider = {
  get: fetchComments,
  save: saveComments,
  delete: deleteComments,
  config: {
    // Max time to wait for any single operation to complete
    resolveTimeout: 15000,  // 15 seconds — set based on backend p99 latency

    // Per-operation retry settings
    getRetryConfig: {
      retryCount: 3,        // Retry up to 3 times on failure
      retryDelay: 2000      // Wait 2 seconds between retries
    },
    saveRetryConfig: {
      retryCount: 3,
      retryDelay: 2000
    },
    deleteRetryConfig: {
      retryCount: 2,        // Fewer retries for deletes (idempotent)
      retryDelay: 1000
    }
  }
};
```

**Config options available on ALL provider types:**

```typescript
interface DataProviderConfig {
  resolveTimeout?: number;           // Max wait time in milliseconds
  getRetryConfig?: RetryConfig;      // Retry for get operations
  saveRetryConfig?: RetryConfig;     // Retry for save operations
  deleteRetryConfig?: RetryConfig;   // Retry for delete operations
  additionalFields?: string[];       // Custom fields to COPY into your DB (kept in Velt's)
  fieldsToRemove?: string[];         // Custom fields to MOVE into your DB (deleted from Velt's)
}

interface RetryConfig {
  retryCount?: number;               // Max retry attempts
  retryDelay?: number;               // Delay between retries (ms)
  revertOnFailure?: boolean;         // Activity `saveRetryConfig` only — revert the optimistic cache
                                     // update when the save ultimately fails after all retries
}
```

**Key details:**

```jsx
const commentDataProvider = {
  get: fetchComments,
  save: saveComments,
  delete: deleteComments,
  config: {
    additionalFields: ['teamName'],                // copy: stays in Velt's DB AND sent to you
    fieldsToRemove:   ['internalTicketId'],         // move: deleted from Velt's DB, lives only in yours
  },
};
```

| Aspect | `fieldsToRemove` | `additionalFields` |
|---|---|---|
| Effect on Velt's DB | Removed | Kept |
| Sent to your backend | Yes (moved) | Yes (copied) |
| Merged back on read | Yes (restored from you) | No (already in Velt's DB) |
| Falsy values (`0`, `""`, `false`) | Moved by reaction, recorder, and activity providers (`!== undefined`); comment fields remain truthy-gated | Preserved |
| Processing order | First | Second |
| If a field is in **both** lists | `fieldsToRemove` wins (removed first) | — |

---

### 4.3 Implement Read-Only User Data Provider for PII Protection

**Impact: MEDIUM (Keeps user PII (name, email, photo) off Velt servers)**

The user data provider only supports `get` (no save/delete). It resolves user identity data from your system so PII never touches Velt servers — only userId identifiers are stored on Velt.

**Incorrect (providing save/delete or missing user fields):**

```jsx
// save and delete are NOT supported for users — they are ignored
const userDataProvider = {
  get: fetchUsers,
  save: saveUsers,    // Ignored — user provider is read-only
  delete: deleteUsers // Ignored
};
const userDataProvider = {
  config: {
    getConfig: {
      url: 'https://your-backend.com/api/velt/users/get',
      headers: { Authorization: 'Bearer YOUR_TOKEN' },
    },
    resolveUsersConfig: { organization: false, folder: false, document: true },
  },
};
```

**⚠️ CRITICAL: The user provider has a DIFFERENT interface from all other providers.**
| | Comment/Reaction/Attachment providers | User provider |
|---|---|---|
| **Input** | Request object `{ organizationId, ... }` | Plain `string[]` array of userIds |
| **Return** | `{ data, success, statusCode }` | `Record<string, User>` directly |
DO NOT wrap the function-based user provider's return in `{ data, success, statusCode }`; the SDK expects `Record<string, User>` directly.
**Endpoint-based variant is different.** With `config.getConfig`, the SDK POSTs `{ organizationId, userIds }` (a `GetUserResolverRequest`, not a bare array) and your endpoint must answer with the standard `ResolverResponse<Record<string, User>>` envelope (`{ data, success, statusCode }`). Use `config.resolveUsersConfig` (`{ organization, folder, document }` booleans) to stop user-resolver requests at scopes you do not need.

**Correct (get-only user resolver with TypeScript types):**

```tsx
type User = {
  userId: string;
  name?: string;
  email?: string;
  photoUrl?: string;
  color?: string;
  textColor?: string;
  isAdmin?: boolean;
  [key: string]: unknown;
};

const USERS_URL = '/api/velt/users';

// SDK calls this with a plain string[] of userIds
// Must return Record<string, User> DIRECTLY — NOT { data, success, statusCode }
const fetchUsersFromDB = async (userIds: string[]): Promise<Record<string, User>> => {
  try {
    const response = await fetch(`${USERS_URL}/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds }),
    });
    if (!response.ok) return {};
    const data = await response.json();
    return data.result || {};
  } catch (error) {
    console.error('[Velt Self-Host] Error fetching users:', error);
    return {};
  }
};

// Save current user to your database when they log in
// This is called by YOUR app code (not by the Velt SDK)
export const saveCurrentUserToDB = async (user: User): Promise<void> => {
  try {
    await fetch(`${USERS_URL}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user }),
    });
  } catch (error) {
    console.error('[Velt Self-Host] Error saving user:', error);
  }
};

export const userDataProvider = {
  get: fetchUsersFromDB,
};
```

**User seeding — users MUST be in the database BEFORE Velt tries to resolve them:**

```tsx
// In your app initialization or a /api/velt/init-db route:
const DEMO_USERS = [
  { userId: "user-1", name: "Alice Johnson", email: "alice@example.com", photoUrl: "https://i.pravatar.cc/150?u=alice" },
  { userId: "user-2", name: "Bob Smith", email: "bob@example.com", photoUrl: "https://i.pravatar.cc/150?u=bob" },
];
for (const user of DEMO_USERS) {
  await saveUser(user); // UPSERT into users table
}
// In VeltInitializeUser.tsx or your auth flow:
useEffect(() => {
  if (user?.userId) {
    saveCurrentUserToDB(user);
  }
}, [user]);
```

For production apps, persist user data when users log in:
**Important:** The SDK only calls `get` — it never calls save/delete for users. However, your app MUST have a `users/save` route so that when users log in, their PII (name, email, photoUrl) is persisted to your database. Call `saveCurrentUserToDB()` from your auth flow. For demos, also seed users into the DB at startup.

---

### 4.4 Self-Host Activity Log Data for Custom Activities

**Impact: MEDIUM (Route activity log PII, entity snapshots, and custom fields through your own infrastructure)**

The activity data provider handles PII for activity log records — comment text embedded in change history, feature-specific entity snapshots (e.g., PR titles, deployment metadata), and arbitrary custom fields. The SDK strips configured fields before writing to Velt and re-hydrates them on read via your `get` handler.

Both `get` and `save` can be supplied as either a **callback function** (`get` / `save`) **or** a **config endpoint URL** (`getConfig` / `saveConfig`). Each method is valid as long as one of the two forms is set; the modes can be mixed (e.g., function `get` with endpoint `saveConfig`). See [[provider-retry-timeout]] for the retry/timeout knobs shared across all providers.

**ActivityAnnotationDataProvider interface:**

```typescript
interface ActivityAnnotationDataProvider {
  get?: (request: GetActivityResolverRequest) => Promise<ResolverResponse<Record<string, PartialActivityRecord>>>;
  save?: (request: SaveActivityResolverRequest) => Promise<ResolverResponse<undefined>>;
  config?: ResolverConfig;
}

interface GetActivityResolverRequest {
  organizationId: string;
  activityIds?: string[];
  documentIds?: string[];
}

interface SaveActivityResolverRequest {
  activity: Record<string, PartialActivityRecord>;
  metadata?: BaseMetadata;
  event?: ResolverActions;
}

interface ResolverConfig {
  resolveTimeout?: number;
  getRetryConfig?: RetryConfig;         // Retry behavior for `get`
  saveRetryConfig?: RetryConfig;        // Retry behavior for `save` (supports `revertOnFailure`)
  getConfig?: ResolverEndpointConfig;   // Endpoint URL + headers for fetching activity PII
  saveConfig?: ResolverEndpointConfig;  // Endpoint URL + headers for saving stripped activity PII
  fieldsToRemove?: string[];            // Top-level keys moved to your DB (all feature types)
}

interface ResolverEndpointConfig {
  url: string;
  headers?: Record<string, string>;
}
```

Note: activity is **append-only**, so there is no `delete` / `deleteConfig`.

**Function-based example:**

```tsx
const activityDataProvider: ActivityAnnotationDataProvider = {
  get: async (request) => {
    const response = await fetch('/api/velt/activity/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return await response.json();
  },
  save: async (request) => {
    const response = await fetch('/api/velt/activity/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return await response.json();
  },
  config: {
    resolveTimeout: 60000,
    fieldsToRemove: ['customSensitiveField'],
  },
};

// Wire into VeltProvider (or via client.setDataProviders / Velt.setDataProviders)
<VeltProvider apiKey={KEY} authProvider={auth} dataProviders={{
  activity: activityDataProvider,
}}>
const activityResolverConfig = {
  getConfig: {
    url: 'https://your-backend.com/api/velt/activity/get',
    headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
  },
  saveConfig: {
    url: 'https://your-backend.com/api/velt/activity/save',
    headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
  },
  resolveTimeout: 60000,
  getRetryConfig: { retryCount: 3, retryDelay: 2000 },
  saveRetryConfig: { retryCount: 3, retryDelay: 2000, revertOnFailure: true },
  fieldsToRemove: ['customSensitiveField']
};

const activityDataProvider = {
  config: activityResolverConfig
};

<VeltProvider apiKey={KEY} authProvider={auth} dataProviders={{
  activity: activityDataProvider,
}}>
```

**Endpoint-based example** (SDK performs the POST for you; pair `getConfig` and/or `saveConfig` with retry/timeout/`fieldsToRemove` on the same `config` object):
The SDK POSTs the same `GetActivityResolverRequest` / `SaveActivityResolverRequest` bodies the function-based handlers would receive, and expects the same `ResolverResponse` shape back. Do not modify the endpoint URLs — copy them verbatim into your config. `saveRetryConfig.revertOnFailure: true` rolls back the optimistic cache update when the save retries are exhausted.
**Compatibility:** Currently only compatible with the `setDocuments` method. Providers must be set before `identify()` is called.

**Storage-boundary contract (what persists where):**

```json
{
  "id": "activityId",
  "featureType": "custom",
  "actionType": "deployment.triggered",
  "actionUser": { "userId": "user-1" },
  "timestamp": 1773241980379,
  "metadata": {
    "apiKey": "API_KEY",
    "documentId": "INTERNAL_DOC_ID",
    "organizationId": "INTERNAL_ORG_ID",
    "clientDocumentId": "DOCUMENT_ID",
    "clientOrganizationId": "ORGANIZATION_ID"
  },
  "targetEntityId": "pr-123",
  "isActivityResolverUsed": true,
  "immutable": false
}
```

This `custom` sample assumes `entityData`, `entityTargetData`, `displayMessageTemplate`, and `displayMessageTemplateData` are listed in `config.fieldsToRemove`; that is why those whole fields live only on your database and are merged back via `get` at render time. A custom activity has no automatic field-level strip, so anything you do not list stays on Velt. For built-in feature types (`comment`, `reaction`, `recorder`), Velt keeps the `entityData` / `entityTargetData` objects and removes only the PII fields inside them (see the strip rules below).

**Incorrect (assuming a custom activity's PII is stripped automatically, or listing structural keys):**

```tsx
const activityDataProvider: ActivityAnnotationDataProvider = {
  get: async (req) => ({ data: await db.getActivity(req), success: true, statusCode: 200 }),
  save: async (req) => ({ data: undefined, success: true, statusCode: 200 }),
  config: {
    // BUG 1: custom activities get no automatic field-level strip. Without listing
    // 'entityData', a custom activity's entityData (PR titles, deploy metadata) stays on Velt.
    // BUG 2: 'featureType' and 'targetEntityId' are structural; removing them breaks querying.
    fieldsToRemove: ['featureType', 'targetEntityId'],
  },
};
```

**Correct (list only your own top-level keys; built-in entity PII is stripped by the feature-aware rules):**

```tsx
const activityDataProvider: ActivityAnnotationDataProvider = {
  get: async (req) => {
    // Your DB returns: { id, metadata?, changes?, entityData?, entityTargetData?, displayMessageTemplateData?, [customFields] }
    const partials = await db.getActivity(req);
    return { data: partials, success: true, statusCode: 200 };
  },
  save: async (req) => {
    // req.activity[id] only contains keys that were stripped — fields not in the partial are still on Velt.
    await db.upsertActivityPII(req.activity);
    return { data: undefined, success: true, statusCode: 200 };
  },
  config: {
    resolveTimeout: 60000,
    // Applies to every feature type. For custom activities this is the only stripping that happens,
    // so list entityData here if a custom activity's snapshot is sensitive.
    fieldsToRemove: ['customSensitiveField', 'entityData'],
  },
};
```

---

### 4.5 Self-Host Notification Data for Custom Notifications

**Impact: MEDIUM (Route custom notification PII through your own infrastructure)**

The notification data provider handles PII for **custom notifications only** (where `notificationSource === 'custom'`). Built-in notifications from comments, huddle, and CRDT are not routed through this provider.

**NotificationDataProvider interface:**

```typescript
interface NotificationDataProvider {
  get?: (request: GetNotificationResolverRequest) => Promise<ResolverResponse<Record<string, PartialNotification>>>;
  delete?: (request: DeleteNotificationResolverRequest) => Promise<ResolverResponse<undefined>>;
  config?: NotificationResolverConfig;
}

interface GetNotificationResolverRequest {
  organizationId: string;
  notificationIds?: string[];
  documentId?: string;
}

interface DeleteNotificationResolverRequest {
  notificationId: string;
  metadata?: BaseMetadata;
  event?: ResolverActions;
}

interface NotificationResolverConfig {
  resolveTimeout?: number;
  getRetryConfig?: RetryConfig;
  deleteRetryConfig?: RetryConfig;
  getConfig?: ResolverEndpointConfig;     // Endpoint-based alternative
  deleteConfig?: ResolverEndpointConfig;  // Endpoint-based alternative
}
```

**Function-based example:**

```tsx
const notificationDataProvider: NotificationDataProvider = {
  get: async (request) => {
    const response = await fetch('/api/velt/notifications/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const data = await response.json();
    return { data: data.result || {}, success: true, statusCode: 200 };
  },
  delete: async (request) => {
    await fetch('/api/velt/notifications/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return { data: undefined, success: true, statusCode: 200 };
  },
  config: {
    resolveTimeout: 10000,
    getRetryConfig: { retryCount: 3, retryDelay: 2000 },
    deleteRetryConfig: { retryCount: 2, retryDelay: 1000 },
  },
};

// Wire into VeltProvider
<VeltProvider apiKey={KEY} authProvider={auth} dataProviders={{
  notification: notificationDataProvider,
}}>
```

**Resolution pipeline order:** notification → user → comment. The notification provider resolves first, then user PII is resolved, then comment content if applicable.

**Storage-boundary contract (what persists where):**

```json
{
  "notificationId": "custom-notif-001",
  "notificationSource": "custom",
  "isNotificationResolverUsed": true,
  "actionUser": { "userId": "user-123" },
  "notifyUsers": [{ "userId": "user-456" }]
}
```

Headline/body templates, template data, and `notificationSourceData` are NOT stored on Velt — they live exclusively on your database and are merged back via `get` at render time. Your `get` handler must return the full PII shape (headline, body, source data) for the SDK to hydrate the notification correctly.

**Correct (minimal resolver-eligible POST body to `POST https://api.velt.dev/v2/notifications/add`):**

```json
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
      { "userId": "recipientUserId", "email": "recipient@example.com" }
    ],
    "notifyAll": false
  }
}
```

**Incorrect (missing `notificationSource: 'custom'` — silently bypasses the resolver and your `get` handler is never called):**

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

See the [Add Notifications API (v2)](https://docs.velt.dev/api-reference/rest-apis/v2/notifications/add-notifications) for the full parameter reference.

**Incorrect (implementing a `save` handler that never fires — silent dead code):**

```tsx
const notificationDataProvider: NotificationDataProvider = {
  get: async (req) => ({ data: await db.getNotifications(req), success: true, statusCode: 200 }),
  // BUG: NotificationDataProvider has no save member. This function is never called by the SDK.
  // Wire your REST writer to write PII to your own DB directly instead.
  save: async (req) => ({ data: undefined, success: true, statusCode: 200 }),
  delete: async (req) => ({ data: undefined, success: true, statusCode: 200 }),
};
```

**Correct (only `get` and `delete` — your REST writer populates your own DB out-of-band before the recipient ever fetches):**

```tsx
const notificationDataProvider: NotificationDataProvider = {
  get: async (request) => {
    const partials = await db.getNotifications(request); // your DB is the source of truth for PII
    return { data: partials, success: true, statusCode: 200 };
  },
  delete: async (request) => {
    await db.deleteNotification(request.notificationId);
    return { data: undefined, success: true, statusCode: 200 };
  },
  // No save — by design.
};
```

Reference: https://docs.velt.dev/self-hosting/partial/notifications ("Sample Data"); https://docs.velt.dev/self-hosting/partial/field-inventory - "Notification strip rules"

---

### 4.6 Self-Host Recording Data and Media Files

**Impact: MEDIUM (Store recording annotations and media on your own infrastructure)**

The recorder data provider handles recording annotations (metadata, transcriptions) and optionally the media files themselves. It supports chunked uploads and a scoped storage provider for media binaries.

**RecorderAnnotationDataProvider interface:**

```typescript
interface RecorderAnnotationDataProvider {
  get?: (request: GetRecorderResolverRequest) => Promise<ResolverResponse<Record<string, PartialRecorderAnnotation>>>;
  save?: (request: SaveRecorderResolverRequest) => Promise<ResolverResponse<SaveRecorderResolverData | undefined>>;
  delete?: (request: DeleteRecorderResolverRequest) => Promise<ResolverResponse<undefined>>;
  config?: ResolverConfig;
  uploadChunks?: boolean;              // Upload recording in chunks (default: false)
  storage?: AttachmentDataProvider;    // Scoped storage for recorder media files
}

interface GetRecorderResolverRequest {
  organizationId: string;
  recorderAnnotationIds?: string[];
  documentIds?: string[];
}

interface SaveRecorderResolverRequest {
  recorderAnnotation: Record<string, PartialRecorderAnnotation>; // singular key
  metadata?: BaseMetadata;
  event?: ResolverActions;
}

interface SaveRecorderResolverData {
  transcription?: Transcription;       // updated transcription
  attachment?: Attachment | null;      // deprecated; use attachments
  attachments?: Attachment[];          // updated attachments
}

interface DeleteRecorderResolverRequest {
  recorderAnnotationId: string;
  metadata?: BaseMetadata;
  event?: ResolverActions;
}

interface PartialRecorderAnnotation {
  annotationId: string;
  from?: PartialUser;
  attachment?: ResolverAttachment;
  attachments?: ResolverAttachment[];
  transcription?: string;
  recordingEditVersions?: Record<number, PartialRecorderAnnotationEditVersion>;
}
```

**Function-based example:**

```tsx
const recorderDataProvider: RecorderAnnotationDataProvider = {
  get: async (request) => {
    const response = await fetch('/api/velt/recordings/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const data = await response.json();
    return { data: data.result || {}, success: true, statusCode: 200 };
  },
  save: async (request) => {
    const response = await fetch('/api/velt/recordings/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const data = await response.json();
    return { data: data.result, success: true, statusCode: 200 };
  },
  delete: async (request) => {
    await fetch('/api/velt/recordings/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return { data: undefined, success: true, statusCode: 200 };
  },
  config: {
    resolveTimeout: 30000, // Longer timeout for media
    saveRetryConfig: { retryCount: 3, retryDelay: 2000 },
    deleteRetryConfig: { retryCount: 2, retryDelay: 1000 },
    getRetryConfig: { retryCount: 3, retryDelay: 2000 },
  },
  uploadChunks: false, // Set true for chunked upload (large recordings)
};

// Optional: custom storage for media files (uses AttachmentDataProvider interface)
const recorderStorage: AttachmentDataProvider = {
  save: async (request) => {
    // Upload media to your S3/storage
    const url = await uploadToStorage(request.file);
    return { data: { url }, success: true, statusCode: 200 };
  },
  delete: async (request) => {
    await deleteFromStorage(request.url);
    return { data: undefined, success: true, statusCode: 200 };
  },
};

// Wire both into VeltProvider
<VeltProvider apiKey={KEY} authProvider={auth} dataProviders={{
  recorder: {
    ...recorderDataProvider,
    storage: recorderStorage, // Scoped storage for media files
  },
}}>
```

**Incorrect (treating `attachments` as fully redirected to your DB and assuming Velt has no record of the binaries):**

```tsx
const saveRecorder = async (request) => {
  // BUG: Velt still tracks { attachmentId, name } stubs for each attachment.
  // If your DB is the only source of truth for attachment IDs, you risk orphaning bucket objects
  // because Velt no longer retains a storage path back to your bucket.
  for (const partial of Object.values(request.recorderAnnotation)) {
    await db.saveAttachments(partial.attachments); // assumes Velt has nothing — wrong
  }
  return { success: true, statusCode: 200 };
};
```

**Correct (your DB stores the PII-bearing fields; Velt keeps `{ attachmentId, name }` stubs; both halves are needed):**

```tsx
const saveRecorder = async (request) => {
  for (const [annotationId, partial] of Object.entries(request.recorderAnnotation)) {
    // partial.transcription          → entire object, your DB only
    // partial.from                   → full User object (PII)
    // partial.attachments[]          → full attachment objects including url
    // partial.recordingEditVersions  → per-version PII (only versions with ≥1 PII field present)
    await db.upsertRecorderPII(annotationId, partial);
  }
  return { data: undefined, success: true, statusCode: 200 };
};
```

Reference: https://docs.velt.dev/self-hosting/partial/recordings; https://docs.velt.dev/self-hosting/partial/field-inventory - "Recorder strip rules"

---

## 5. Backend Implementation

**Impact: MEDIUM**

Server-side patterns for handling data provider requests. Covers API route structure and request body shapes, authenticating resolver endpoints (`verifyToken`), database storage with upsert operations and indexing, and S3-compatible object storage for attachments.

### 5.1 Authenticate Resolver Endpoints Before Touching Your Database

**Impact: HIGH (Unauthenticated resolver routes let any caller read or overwrite self-hosted comments and user PII)**

Endpoint-based data providers (`getConfig` / `saveConfig` / `deleteConfig`) are plain HTTPS routes called from the browser. Send a credential from the frontend with `headers`, and verify it on the backend before any read or write. Both backend SDKs ship a fail-closed verifier, `sdk.selfHosting.verifyToken`, that is authentication only: it never authorizes, so you still check the tenant yourself.

**Incorrect (route trusts the request body):**

```js
app.post('/api/velt/comments/get', async (req, res) => {
  // Anyone who can reach this URL can read any organization's comments.
  const comments = await db.getComments(req.body);
  res.json({ data: comments, success: true, statusCode: 200 });
});
```

**Correct (frontend sends a fresh token; backend verifies, then authorizes):**

```python
// Frontend: async headers are resolved on every request, including retries
const commentDataProvider = {
  config: {
    getConfig: {
      url: 'https://api.example.com/api/velt/comments/get',
      headers: async () => ({ Authorization: `Bearer ${await getFreshToken()}` }),
    },
  },
};
// Node backend (@veltdev/node): configure resolverAuth once at initialize()
const sdk = VeltSDK.initialize({
  database: { connection_string: process.env.VELT_DB_URL! },
  resolverAuth: { jwt: { algorithms: ['RS256'], jwksUrl: 'https://idp.example.com/.well-known/jwks.json' } },
});

app.post('/api/velt/comments/get', async (req, res) => {
  const auth = await sdk.selfHosting.verifyToken({ headers: req.headers });
  if (!auth.verified) return res.status(401).json({ error: auth.error, code: auth.errorCode });
  if (auth.claims?.org !== req.body.organizationId) return res.status(403).end(); // your authorization
  const svc = await sdk.selfHosting.getComments();
  res.json(await svc.getComments(req.body));
});
# Python backend (velt-py): 'resolver_auth' config block; pip install 'velt-py[auth]' for the JWT path
sdk = VeltSDK.initialize({
    'database': {'connection_string': os.environ['VELT_DB_URL']},
    'resolver_auth': {'jwt': {'jwks_url': 'https://idp.example.com/.well-known/jwks.json', 'algorithms': ['RS256']}},
})

result = sdk.selfHosting.verifyToken(headers=request.headers)  # or token='<raw_jwt>'
if not result.verified:
    return HttpResponse(status=401)  # result.errorCode says why
```

---

### 5.2 Implement Database Storage with Upsert and Proper Indexing

**Impact: MEDIUM (Idempotent saves and fast queries at scale)**

Use upsert semantics for save operations (handles retries idempotently) and create indexes on annotationId, documentId, and organizationId for query performance.

**Incorrect (INSERT without upsert — fails on retry):**

```js
// Retried saves cause duplicate key errors
await collection.insertOne({ annotationId: id, ...data });
// Error: duplicate key on retry — annotationId already exists
```

**Correct (MongoDB upsert with bulkWrite):**

```js
async function saveAnnotations(collection, annotations, context) {
  const operations = Object.entries(annotations).map(([id, annotation]) => ({
    updateOne: {
      filter: { annotationId: id },
      update: {
        $set: {
          ...annotation,
          annotationId: id,
          documentId: context?.documentId || annotation.documentId,
          organizationId: context?.organizationId || annotation.organizationId,
          updatedAt: new Date(),
        }
      },
      upsert: true  // Insert if not exists, update if exists
    }
  }));

  if (operations.length > 0) {
    await collection.bulkWrite(operations);
  }
}

// Create indexes on collection setup
await collection.createIndex({ annotationId: 1 }, { unique: true });
await collection.createIndex({ documentId: 1 });
await collection.createIndex({ organizationId: 1 });
await collection.createIndex({ documentId: 1, organizationId: 1 });
```

**Correct (PostgreSQL upsert with ON CONFLICT):**

```js
-- Table schema
CREATE TABLE comment_annotations (
  annotation_id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_doc_id ON comment_annotations(document_id);
CREATE INDEX idx_org_id ON comment_annotations(organization_id);
CREATE INDEX idx_doc_org ON comment_annotations(document_id, organization_id);
// Upsert with parameterized queries (prevents SQL injection)
async function saveAnnotations(client, annotations, context) {
  await client.query('BEGIN');
  for (const [id, annotation] of Object.entries(annotations)) {
    const data = { ...annotation, annotationId: id };
    await client.query(
      `INSERT INTO comment_annotations (annotation_id, document_id, organization_id, data, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (annotation_id)
       DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      [id, context?.documentId, context?.organizationId, JSON.stringify(data)]
    );
  }
  await client.query('COMMIT');
}
```

---

### 5.3 Store and Delete Attachments in S3-Compatible Object Storage

**Impact: MEDIUM (Proper binary file storage with deterministic object keys)**

Store attachment binary data in S3 or S3-compatible storage (MinIO, Cloudflare R2, GCS). Generate deterministic object keys from metadata and return the stored URL in the standard response format.

**Incorrect (storing binary in database or non-deterministic keys):**

```js
// Storing binary blobs in the database — bloats storage, slow queries
await db.collection('attachments').insertOne({
  data: file.buffer,  // Bad: binary data in document store
  name: file.originalname
});

// Non-deterministic key — can't reconstruct for deletion
const key = `uploads/${Math.random()}.png`;  // Random key — can't delete later
```

**Correct (S3 upload with deterministic key):**

```js
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

// SAVE: parse multipart, upload to S3
async function saveAttachment(file, metadata) {
  const { organizationId, documentId } = metadata;
  // Deterministic key — can reconstruct for deletion
  const key = `attachments/${organizationId}/${documentId}/${Date.now()}-${file.originalname}`;

  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  }));

  const url = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return {
    data: { url },        // URL must be returned for SDK to store reference
    success: true,
    statusCode: 200
  };
}

// DELETE: extract key from URL, delete from S3
async function deleteAttachment(attachmentUrl) {
  const url = new URL(attachmentUrl);
  const key = url.pathname.substring(1); // Remove leading /

  await s3.send(new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  }));

  return { success: true, statusCode: 200 };
}
```

**Object key strategy:**

```typescript
attachments/{organizationId}/{documentId}/{timestamp}-{filename}
```

This key structure:
- Groups files by organization and document for easy management
- Uses timestamp prefix to avoid name collisions
- Is deterministic enough to reconstruct from metadata for deletion
- Supports bucket lifecycle policies per organization

Reference: https://docs.velt.dev/self-hosting/partial/attachments - Backend Example

---

### 5.4 Structure Backend API Routes for Data Provider Endpoints

**Impact: MEDIUM (Consistent route structure for all data provider operations)**

Use a consistent route pattern `/api/velt/{provider}/{operation}` for all data provider endpoints. Each route must extract context metadata (documentId, organizationId) and return the standard response format.

**Incorrect (catch-all route with no structure):**

```js
// Single catch-all — hard to maintain and debug
app.post('/api/velt', async (req, res) => {
  const { type, operation, data } = req.body;
  // Complex routing logic in one handler
});
```

**Correct (structured route pattern):**

```typescript
/api/velt/
├── comments/
│   ├── get      (POST)
│   ├── save     (POST)
│   └── delete   (POST)
├── reactions/
│   ├── get      (POST)
│   ├── save     (POST)
│   └── delete   (POST)
├── attachments/
│   ├── save     (POST, multipart/form-data)
│   └── delete   (POST, application/json)
├── recordings/
│   ├── get      (POST)
│   ├── save     (POST)
│   └── delete   (POST)
└── users/
    └── get      (POST)
```

**Generic route handler pattern:**

```js
// GET handler (comments, reactions, recordings)
async function handleGet(req, res, collection) {
  try {
    // ID filter key: commentAnnotationIds | reactionAnnotationIds | recorderAnnotationIds
    const { organizationId, documentIds } = req.body;
    const annotationIds = req.body.commentAnnotationIds ?? req.body.reactionAnnotationIds ?? req.body.recorderAnnotationIds;
    const query = {};
    if (annotationIds?.length) query.annotationId = { $in: annotationIds };
    if (documentIds?.length) query.documentId = { $in: documentIds };
    if (organizationId) query.organizationId = organizationId;

    const items = await collection.find(query);
    const result = {};
    for (const item of items) {
      result[item.annotationId] = item;
    }

    res.json({ data: result, success: true, statusCode: 200 });
  } catch (error) {
    res.json({ data: null, success: false, statusCode: 500 });
  }
}

// SAVE handler (comments, reactions, recordings)
// The map key depends on the provider: commentAnnotation | reactionAnnotation | recorderAnnotation
async function handleSave(req, res, collection, mapKey) {
  try {
    const { [mapKey]: annotations = {}, metadata } = req.body;
    for (const [id, annotation] of Object.entries(annotations)) {
      await collection.upsert(
        { annotationId: id },
        { ...annotation, annotationId: id,
          documentId: metadata?.documentId,
          organizationId: metadata?.organizationId }
      );
    }
    res.json({ success: true, statusCode: 200 });
  } catch (error) {
    res.json({ data: null, success: false, statusCode: 500 });
  }
}

// DELETE handler (comments, reactions, recordings)
// The ID key depends on the provider: commentAnnotationId | reactionAnnotationId | recorderAnnotationId
async function handleDelete(req, res, collection, idKey) {
  try {
    const annotationId = req.body[idKey];
    await collection.deleteOne({ annotationId });
    res.json({ success: true, statusCode: 200 });
  } catch (error) {
    res.json({ data: null, success: false, statusCode: 500 });
  }
}
```

---

## 6. Data Types

**Impact: MEDIUM**

Reference for the TypeScript shapes a data provider hands to / receives from the SDK — comment payloads, attachment uploads, reaction records, recording metadata, user contacts. Documents the contract between the SDK and your backend so provider responses don't drift from the SDK's expected shapes.

### 6.1 Self-Hosting Data Type Reference — Provider Interfaces, Config, Request/Response Types

**Impact: MEDIUM (Complete type definitions for all data provider interfaces and resolver types)**

Complete type definitions for all data provider interfaces, configuration types, request/response shapes, and resolver enums.

### VeltDataProvider (top-level)

---

## 7. Python SDK

**Impact: HIGH**

Patterns for implementing data-provider backends in Python using the `velt-py` 0.2.x SDK (MongoDB or PostgreSQL). Covers the `sdk.api.*` REST API backend (no database required), token generation with `sdk.api.accessControl.generateToken`, comments / attachments / users / reactions self-hosting handlers built with `from_dict`, framework integrations (FastAPI / Flask / Django), and the same response-format contract the JS SDK enforces. Use when your provider backend is Python rather than Node.

### 7.1 Attachment Upload and Delete via Python SDK with S3

**Impact: HIGH (Wrong aws config keys or reading the multipart body as JSON make every attachment upload fail)**

`sdk.selfHosting.attachments.saveAttachment` uploads the file to S3 and saves its metadata; `deleteAttachment` removes the S3 object and the metadata. Configure the `aws` block at `VeltSDK.initialize`. The save endpoint receives `multipart/form-data`: the file in the `file` field and the JSON request in the `request` field.

**Incorrect:**

```python
# WRONG aws keys: the SDK reads bucket_name / region / access_key_id / secret_access_key
sdk = VeltSDK.initialize({'aws': {'bucket': 'b', 'access_key': '...', 'secret_key': '...'}})

@app.route('/api/velt/attachments/save', methods=['POST'])
def save_attachment():
    body = request.json  # WRONG: attachment saves are multipart, not JSON
    return sdk.selfHosting.attachments.saveAttachment(body)
```

**Correct (S3 config):**

```python
import os
from velt_py import VeltSDK

sdk = VeltSDK.initialize({
    'database': {'connection_string': os.environ['VELT_MONGODB_URI']},
    'aws': {
        'bucket_name': os.environ['AWS_S3_BUCKET'],
        'region': os.environ.get('AWS_REGION', 'us-east-1'),
        'access_key_id': os.environ['AWS_ACCESS_KEY_ID'],
        'secret_access_key': os.environ['AWS_SECRET_ACCESS_KEY'],
    },
})
```

**Correct (Flask save and delete):**

```python
import json
from flask import request, jsonify
from velt_py import SaveAttachmentResolverRequest, DeleteAttachmentResolverRequest

@app.route('/api/velt/attachments/save', methods=['POST'])
def save_attachment():
    file = request.files.get('file')
    request_json = request.form.get('request')
    if not file or not request_json:
        return jsonify({'success': False, 'error': 'File and request JSON are required',
                        'errorCode': 'INVALID_INPUT', 'statusCode': 400}), 400

    save_request = SaveAttachmentResolverRequest.from_dict(json.loads(request_json))
    result = sdk.selfHosting.attachments.saveAttachment(
        save_request,
        file_data=file.read(),        # bytes
        file_name=file.filename,
        mime_type=file.content_type,
    )
    return jsonify(result), result.get('statusCode', 200)

@app.route('/api/velt/attachments/delete', methods=['POST'])
def delete_attachment():
    delete_request = DeleteAttachmentResolverRequest.from_dict(request.json)  # delete is JSON
    result = sdk.selfHosting.attachments.deleteAttachment(delete_request)
    return jsonify(result), result.get('statusCode', 200)
```

In Django read `request.FILES.get('file')` and `request.POST.get('request')`; in FastAPI declare `file: UploadFile = File(...)` and `request: str = Form(...)` and `await file.read()`.

---

### 7.2 Comments CRUD Operations via Python SDK

**Impact: HIGH (Re-shaping the frontend payload or the SDK response breaks the data provider contract and silently loses comments)**

`sdk.selfHosting.comments` exposes `getComments`, `saveComments`, and `deleteComment`. The pattern is always the same: parse the raw JSON body the Velt frontend sent into the typed request with `from_dict`, pass it to the SDK, and return the SDK's response dict to the client unchanged (with its `statusCode` as the HTTP status).

**Incorrect (raw dict to the SDK, hand-built fields, re-wrapped response):**

```python
def get_comments(request):
    body = request.json
    # WRONG: methods take typed request objects, not raw dicts
    result = sdk.selfHosting.comments.getComments(body)
    # WRONG: re-wrapping drops `success` / `statusCode`, which the frontend data provider requires
    return {'comments': result['data']}
```

**Correct (get, save, delete):**

```python
from velt_py import GetCommentResolverRequest, SaveCommentResolverRequest, DeleteCommentResolverRequest

def get_comments(body: dict) -> dict:
    return sdk.selfHosting.comments.getComments(GetCommentResolverRequest.from_dict(body))

def save_comments(body: dict) -> dict:
    save_request = SaveCommentResolverRequest.from_dict(body)
    # Since v0.1.14: event may be a ResolverActions member, a CommentResolverSaveEvent member
    # (when the frontend opted in via additionalSaveEvents), or a raw string.
    # save_request.targetComment is request context only; saveComments never persists it.
    return sdk.selfHosting.comments.saveComments(save_request)

def delete_comment(body: dict) -> dict:
    return sdk.selfHosting.comments.deleteComment(DeleteCommentResolverRequest.from_dict(body))
{'success': True, 'statusCode': 200, 'data': {...}}
{'success': False, 'statusCode': 400, 'error': '...', 'errorCode': 'INVALID_INPUT'}  # or NOT_FOUND / INTERNAL_ERROR
```

**Response format.** `VeltSelfHostingResponse` is a plain dict with camelCase keys:
Use dict access (`result['success']`, `result.get('statusCode', 200)`), not attribute access.
**Data models you may touch in custom handlers** (`from velt_py.models import PartialCommentAnnotation, PartialComment, PartialTargetTextRange, BaseMetadata`):
- `PartialCommentAnnotation.from_` is the author (wire key `from`; Python keyword workaround). `assignedTo`, `targetTextRange`, and `resolvedByUserId` are typed fields since v0.1.10.
- `resolvedByUserId` is tri-state: `UNSET` (from `velt_py.models.comment`) means the field was absent and is not written; `None` means the frontend unresolved the annotation and `null` is written.
- `BaseMetadata` keeps `sdkVersion` and `documentMetadata` since v0.1.10.

**Imports:**

```python
from velt_py import (
    GetCommentResolverRequest, SaveCommentResolverRequest, DeleteCommentResolverRequest,
    GetReactionResolverRequest, SaveReactionResolverRequest, DeleteReactionResolverRequest,
    GetUserResolverRequest,
    SaveAttachmentResolverRequest, DeleteAttachmentResolverRequest,
    CommentResolverSaveEvent,
)
from velt_py.models.user import ResolveUserIdsByEmailRequest
```

| Request type | SDK method |
|---|---|
| `GetCommentResolverRequest` | `sdk.selfHosting.comments.getComments()` |
| `SaveCommentResolverRequest` | `sdk.selfHosting.comments.saveComments()` |
| `DeleteCommentResolverRequest` | `sdk.selfHosting.comments.deleteComment()` |
| `GetReactionResolverRequest` | `sdk.selfHosting.reactions.getReactions()` |
| `SaveReactionResolverRequest` | `sdk.selfHosting.reactions.saveReactions()` |
| `DeleteReactionResolverRequest` | `sdk.selfHosting.reactions.deleteReaction()` |
| `GetUserResolverRequest` | `sdk.selfHosting.users.getUsers()` |
| `ResolveUserIdsByEmailRequest` | `sdk.selfHosting.users.resolveUserIdsByEmail()` |
| `SaveAttachmentResolverRequest` | `sdk.selfHosting.attachments.saveAttachment()` |
| `DeleteAttachmentResolverRequest` | `sdk.selfHosting.attachments.deleteAttachment()` |

---

### 7.3 Django, Flask, and FastAPI Integration Patterns

**Impact: MEDIUM (Re-initializing per request opens a new connection pool each time, and re-wrapping SDK responses breaks the data provider contract)**

Initialize the SDK once per process and reuse it in every handler. Each handler parses the frontend body with `<RequestType>.from_dict(...)`, calls `sdk.selfHosting.*`, and returns the SDK's response dict with its `statusCode` as the HTTP status. Do not re-wrap the response: the frontend data provider reads `success`, `statusCode`, and `data`.

**Incorrect:**

```python
@app.route('/api/velt/comments/get', methods=['POST'])
def get_comments():
    sdk = VeltSDK.initialize(CONFIG)          # WRONG: a new SDK (and pool) per request
    result = sdk.selfHosting.comments.getComments(GetCommentResolverRequest.from_dict(request.json))
    return jsonify({'data': result['data']})  # WRONG: drops success / statusCode
```

**Django (lazy singleton + settings):**

```python
# velt_sdk.py
from django.conf import settings
from velt_py import VeltSDK

_velt_sdk = None

def get_velt_sdk():
    global _velt_sdk
    if _velt_sdk is None:
        _velt_sdk = VeltSDK.initialize(settings.VELT_SDK_CONFIG)
    return _velt_sdk
# settings.py
import os
VELT_SDK_CONFIG = {
    'database': {'connection_string': os.environ.get('VELT_MONGODB_CONNECTION_STRING')},
    'apiKey': os.environ.get('VELT_API_KEY'),
    'authToken': os.environ.get('VELT_AUTH_TOKEN'),
}
# views.py
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from velt_py import GetCommentResolverRequest
from .velt_sdk import get_velt_sdk

@csrf_exempt
@require_http_methods(["POST"])
def get_comments(request):
    try:
        comment_request = GetCommentResolverRequest.from_dict(json.loads(request.body))
        result = get_velt_sdk().selfHosting.comments.getComments(comment_request)
        return JsonResponse(result, status=result.get('statusCode', 200))
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e), 'errorCode': 'INTERNAL_ERROR',
                             'statusCode': 500}, status=500)
```

**Flask (module-level SDK):**

```python
from flask import Flask, request, jsonify
from velt_py import VeltSDK, GetCommentResolverRequest

app = Flask(__name__)
sdk = VeltSDK.initialize({'database': {'connection_string': 'mongodb+srv://...'}})

@app.route('/api/velt/comments/get', methods=['POST'])
def get_comments():
    result = sdk.selfHosting.comments.getComments(GetCommentResolverRequest.from_dict(request.json))
    return jsonify(result), result.get('statusCode', 200)
```

**FastAPI (module-level SDK):**

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from velt_py import VeltSDK, GetCommentResolverRequest

app = FastAPI()
sdk = VeltSDK.initialize({'database': {'connection_string': 'mongodb+srv://...'}})

@app.post('/api/velt/comments/get')
async def get_comments(request: Request):
    result = sdk.selfHosting.comments.getComments(GetCommentResolverRequest.from_dict(await request.json()))
    return JSONResponse(content=result, status_code=result.get('statusCode', 200))
```

---

### 7.4 Generate Auth Tokens via sdk.api.accessControl.generateToken

**Impact: HIGH (The positional getToken helpers are gone from the Python SDK docs; minting tokens with generateToken keeps frontend auth working without exposing API credentials)**

Mint the JWT that the frontend `authProvider.generateToken` returns with `sdk.api.accessControl.generateToken`. It calls `POST /v2/auth/generate_token`, takes a `GenerateTokenRequest` dataclass like every other `sdk.api.*` method, needs only `apiKey` and `authToken` (no database), and returns the raw REST envelope. The `sdk.selfHosting.token.getToken` and `sdk.api.token.getToken` sections were removed from the Python SDK docs.

Do not call the Velt REST auth endpoint with `requests` / `httpx`, and never build the JWT yourself.

**Incorrect (removed keyword-argument getToken and a flat envelope):**

```python
# WRONG: no longer documented; also reads the self-hosting envelope shape
result = sdk.selfHosting.token.getToken(organizationId='org-123', userId='user-1')
token = result['data']['token']
```

**Correct:**

```python
from velt_py import VeltSDK
from velt_py.models.access_control import GenerateTokenRequest

sdk = VeltSDK.initialize({
    'apiKey': 'YOUR_VELT_API_KEY',
    'authToken': 'YOUR_VELT_AUTH_TOKEN',
})

result = sdk.api.accessControl.generateToken(
    GenerateTokenRequest(
        userId='user-1',
        userProperties={'name': 'John Doe', 'email': 'john@example.com', 'isAdmin': False},
        permissions={'resources': [
            {'type': 'organization', 'id': 'org-123', 'accessRole': 'viewer'},
            {'type': 'document', 'id': 'doc-1', 'organizationId': 'org-123', 'accessRole': 'editor'},
        ]},
    )
)

if 'error' in result:
    raise RuntimeError(result['error']['message'])
token = result['result']['data']['token']  # return this to the frontend authProvider
```

**Response shape:**

```python
{'result': {'status': 'success', 'message': 'Token generated successfully.',
            'data': {'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}}}
```

---

### 7.5 Use sdk.api.* for REST API Operations Without a Database

**Impact: HIGH (sdk.api.* needs only apiKey and authToken, so REST-only Python services skip database and AWS setup entirely)**

The `sdk.api.*` namespace calls Velt's REST APIs from Python with typed `@dataclass` requests and returns the raw response dict. It needs only `apiKey` and `authToken`; install plain `velt-py` (no database extra). Do not call the REST API with `requests` / `httpx` directly.

**Incorrect:**

```python
# WRONG: raw dicts instead of request dataclasses, snake_case method names, and no error check
sdk.api.organizations.add_organizations({'organizations': [...]})
result = sdk.api.documents.getDocuments({'organizationId': 'org-123'})
print(result['result']['data'])  # KeyError when the call failed
```

**Correct:**

```python
from velt_py import VeltSDK
from velt_py.models.organization import AddOrganizationsRequest
from velt_py.models.document import AddDocumentsRequest

sdk = VeltSDK.initialize({'apiKey': 'YOUR_VELT_API_KEY', 'authToken': 'YOUR_VELT_AUTH_TOKEN'})

result = sdk.api.organizations.addOrganizations(
    AddOrganizationsRequest(organizations=[{'organizationId': 'org-123', 'organizationName': 'My Org'}])
)
if 'error' in result:
    print('Failed:', result['error'])
else:
    print('Success:', result['result'])

sdk.api.documents.addDocuments(
    AddDocumentsRequest(organizationId='org-123', documents=[{'documentId': 'doc-1', 'documentName': 'My Doc'}])
)
from velt_py.models.activity_api import AddActivitiesRequest

sdk.api.activities.addActivities(
    AddActivitiesRequest(
        organizationId='org-123', documentId='doc-456',
        activities=[{'featureType': 'comment', 'actionType': 'comment.add',
                     'actionUser': {'userId': 'user-1'}, 'internalTrackingId': 'abc-123'}],
    ),
    filter_unknown_fields=True,  # 'internalTrackingId' is removed before sending
)
```

**Documented services** (the docs count 19; `sdk.api.agents` and `sdk.api.memory` are hidden in commented MDX, so do not use or document them as live Python APIs):
| Service | Namespace | Notes |
|---------|-----------|-------|
| Organizations | `sdk.api.organizations` | |
| Folders | `sdk.api.folders` | |
| Documents | `sdk.api.documents` | `getDocumentsCount` |
| Users | `sdk.api.users` | invites: `addUserInvite`, `respondToInvite`, `getInvitedUsers`, `getUserInvitations`, `getInvitedPendingUsersCount`; also `getUsersCount`, `getDocUsers` |
| User Groups | `sdk.api.userGroups` | |
| Notifications | `sdk.api.notifications` | |
| Comment Annotations | `sdk.api.commentAnnotations` | agent filters |
| Activities | `sdk.api.activities` | |
| Access Control | `sdk.api.accessControl` | `generateToken` (see `python-token`) |
| CRDT | `sdk.api.crdt` | `deleteCrdtData` |
| Presence | `sdk.api.presence` | |
| Livestate | `sdk.api.livestate` | |
| Recordings | `sdk.api.recordings` | |
| Rewriter | `sdk.api.rewriter` | |
| GDPR | `sdk.api.gdpr` | |
| Workspace | `sdk.api.workspace` | includes `updateApiKeyMetadata`, domain requests, advanced webhooks |
| Workflow | `sdk.api.workflow` | Approval Engine, `/v2/workflow/*`, 14 methods |
There is no `sdk.api.token` namespace in the current docs. Python method names can differ from Node: Python uses `respondToInvite` / `getInvitedUsers` and `sdk.api.workflow` where Node uses `respondToUserInvite` / `getUserInvites` and `sdk.api.approval`.
**`filter_unknown_fields` (opt-in allowlist).** The add/update methods on `commentAnnotations` and `activities`, and `updateNotifications`, accept `filter_unknown_fields: bool = False` (backed by `velt_py.models.field_allowlists`). When `True`, unknown top-level keys in the request entity collections are dropped before sending; open-typed fields (`context`, `metadata`, `entityData`, user objects) pass through whole. It is fail-open: if filtering errors, the original payload is sent. `addNotifications` is not affected. On `updateNotifications`, `isRead` / `isArchived` are not accepted by the endpoint, so they are dropped when the flag is on.

---

### 7.6 Users and Reactions Management via Python SDK

**Impact: MEDIUM (Incorrect request types prevent user lookups and reaction sync)**

`sdk.selfHosting.users` exposes `getUsers` and `resolveUserIdsByEmail`; `sdk.selfHosting.reactions` exposes `getReactions`, `saveReactions`, and `deleteReaction`. As with comments, parse the frontend body with `from_dict`, call the SDK, and return its response dict unchanged.

**Incorrect (raw dicts and re-wrapped responses):**

```python
# WRONG: methods take typed request objects built from the frontend body
users = sdk.selfHosting.users.getUsers({"organizationId": "org_123"})

# WRONG: re-shaping the SDK response drops success/statusCode that the frontend expects
result = sdk.selfHosting.reactions.getReactions(GetReactionResolverRequest.from_dict(body))
return {"reactions": result["data"]}
```

**Correct:**

```python
from velt_py import (
    GetUserResolverRequest,
    GetReactionResolverRequest, SaveReactionResolverRequest, DeleteReactionResolverRequest,
)
from velt_py.models.user import ResolveUserIdsByEmailRequest

def get_users(body: dict) -> dict:
    return sdk.selfHosting.users.getUsers(GetUserResolverRequest.from_dict(body))

def resolve_user_ids_by_email(body: dict) -> dict:
    # Backs the frontend anonymousUser data provider.
    # data is {email: userId}; unmatched emails are absent, repeats de-duplicated,
    # blank or None entries dropped, and user_schema mappings honored.
    return sdk.selfHosting.users.resolveUserIdsByEmail(ResolveUserIdsByEmailRequest.from_dict(body))

def get_reactions(body: dict) -> dict:
    return sdk.selfHosting.reactions.getReactions(GetReactionResolverRequest.from_dict(body))

def save_reactions(body: dict) -> dict:
    return sdk.selfHosting.reactions.saveReactions(SaveReactionResolverRequest.from_dict(body))

def delete_reaction(body: dict) -> dict:
    return sdk.selfHosting.reactions.deleteReaction(DeleteReactionResolverRequest.from_dict(body))
```

**Source Pointers:**

```python
from velt_py.models.reaction import PartialReactionAnnotation
from velt_py.models.user import PartialUser

@dataclass
class PartialReactionAnnotation:
    annotationId: str
    metadata: Optional[BaseMetadata] = None
    icon: Optional[str] = None
    from_: Optional[PartialUser] = None             # 'from' on the wire; from_ avoids the Python keyword. Replaces the former 'user' field.
    extra_fields: Optional[Dict[str, Any]] = None   # Catch-all for customer-configured custom keys.
```

**Incorrect (v0.1.11-style construction; breaks on v0.1.12):**

```python
from velt_py.models.reaction import PartialReactionAnnotation
from velt_py.models.user import PartialUser

# `user=` is no longer a valid constructor kwarg in v0.1.12 — raises TypeError
ann = PartialReactionAnnotation(
    annotationId='r-1',
    icon='+1',
    user=PartialUser(userId='u-1'),
)
ann.to_dict()  # would have emitted {'user': {...}} pre-v0.1.12
```

**Correct (v0.1.12 — use `from_=`, serializes as `from`):**

```python
from velt_py.models.reaction import PartialReactionAnnotation
from velt_py.models.user import PartialUser

ann = PartialReactionAnnotation(
    annotationId='r-1',
    icon='+1',
    from_=PartialUser(userId='u-1'),
)
ann.to_dict()['from']  # {'userId': 'u-1'}  — serialized as `from`
```

**Correct (backward-compatible reads — legacy `user` documents still resolve):**

```python
# Legacy document stored under the old `user` key still resolves:
ann = PartialReactionAnnotation.from_dict({
    'annotationId': 'r-1',
    'icon': '+1',
    'user': {'userId': 'u-legacy'},
})
ann.from_.userId         # 'u-legacy'
ann.to_dict()['from']    # {'userId': 'u-legacy'}  (re-serialized as `from`)
```

Reference: https://docs.velt.dev/backend-sdks/python#partialreactionannotation - "PartialReactionAnnotation"

---

## 8. Debugging

**Impact: LOW-MEDIUM**

Monitoring and troubleshooting data provider events using the SDK subscription API.

### 8.1 Monitor Data Provider Events for Troubleshooting

**Impact: LOW-MEDIUM (Real-time visibility into SDK-to-backend data flow)**

Use `client.on('dataProvider').subscribe()` to monitor all data provider interactions in real time. This reveals timeout errors, response format issues, and multipart parsing failures.

**Incorrect (debugging with console.log in every handler):**

```jsx
// Scattered logging in every resolver function — messy and incomplete
const fetchComments = async (request) => {
  console.log('Fetching comments...', request);
  const result = await fetch('/api/comments/get', { /* ... */ });
  console.log('Got comments:', result);
  return result;
};
```

**Correct (centralized data provider monitoring):**

```javascript
import { useVeltClient } from '@veltdev/react';

function DataProviderMonitor() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;

    const subscription = client.on('dataProvider').subscribe((event) => {
      // `moduleName` identifies which module triggered the resolver call —
      // use it to trace which provider/operation any given event belongs to.
      console.log('Data Provider Event:', {
        type: event.type,           // 'get', 'save', 'delete'
        moduleName: event.moduleName, // 'comment', 'attachment', 'recorder', 'notification', 'activity', 'anonymousUser', 'user'
        status: event.status,       // Success or failure details
        data: event.data            // Request/response data
      });
    });

    return () => subscription?.unsubscribe();
  }, [client]);

  return null;
}

// Add to your app during development
<VeltProvider apiKey="KEY" dataProviders={dataProviders}>
  <DataProviderMonitor />
  <YourApp />
</VeltProvider>
const subscription = Velt.on('dataProvider').subscribe((event) => {
  console.log('Data Provider Event:', event);
  console.log('Module Name:', event.moduleName);
});

// Unsubscribe when done
subscription?.unsubscribe();
```

For non-React frameworks the subscription shape is identical — use the global `Velt` instance:

Reference: https://docs.velt.dev/self-hosting/partial/overview - "Debugging"; https://docs.velt.dev/self-hosting/partial/comments - Debugging, Email Notifications

---

## 9. Full Self-Hosting

**Impact: HIGH**

Pointers for full self-hosting, where the whole Velt stack (backend, console, SDK files) runs in your own GCP project. Covers telling it apart from partial (data provider) self-hosting, its key constraints (GCP + Firebase GA, AWS and Azure closed beta, agent-driven install, required LLM keys), and wiring the app with `config.selfHosted`. Does not duplicate the install and upgrade runbooks.

### 9.1 Choose Partial or Full Self-Hosting Before Writing Any Code

**Impact: HIGH (Partial and full self-hosting share a name but are different products; picking the wrong one means building data providers nobody needs or an infrastructure project nobody asked for)**

Velt uses "self-hosting" for two different things. **Partial self-hosting** keeps Velt's managed backend and moves only user content and PII into your storage through data providers (every other rule in this skill). **Full self-hosting** runs the entire Velt stack (backend, admin console, and SDK files) in a cloud project you own, with no runtime requests to Velt-owned hosts.

| | Partial self-hosting | Full self-hosting |
|---|---|---|
| What moves to you | User content and PII, through data providers | Backend, console, SDK hosting, and all data |
| Who runs the backend | Velt | You, on your own GCP project |
| What you set up | `dataProviders` callbacks or endpoints in your app | GCP project, Terraform, Firebase, console host, CDN |
| Requests to Velt hosts | Yes, for the collaboration backend | None |
| App-side config | `dataProviders` on `VeltProvider` (or `Velt.setDataProviders`) | `config.selfHosted` + `proxyDomain` + pinned `version` |

**Incorrect (mixing the two):**

```jsx
// WRONG: "We need zero requests to velt.dev" solved with data providers.
// Partial self-hosting still uses Velt's backend; this app keeps calling Velt hosts.
<VeltProvider apiKey="KEY" dataProviders={{ comment: commentDataProvider }}>
```

**Correct (pick by requirement):**

```jsx
// Requirement: comment text and user PII must not be stored by Velt.
// -> Partial self-hosting: register data providers; Velt keeps structural, non-PII data.
<VeltProvider apiKey="KEY" authProvider={authProvider} dataProviders={dataProviders}>

// Requirement: no Velt-operated component in the runtime path at all.
// -> Full self-hosting: deploy the stack into your GCP project, then pass the generated config.
<VeltProvider apiKey="KEY_FROM_YOUR_DEPLOYMENT" config={{ proxyDomain, version, selfHosted }}>
```

---

### 9.2 Wire the App to a Full Self-Hosted Deployment with config.selfHosted

**Impact: HIGH (Without selfHosted the SDK served from your CDN still sends data to Velt SaaS; a wrong CDN path or missing CORS stops the SDK from loading)**

Serving the SDK from your CDN only moves code. Runtime still defaults to Velt SaaS endpoints until you pass `selfHosted`. The install generates `velt-selfhosted-config.json` (Phase 5.1): public URLs, the web-app `firebaseConfig`, and the module list, with no secrets. Import it; do not hand-type endpoint URLs.

**Incorrect:**

```json
<VeltProvider
  apiKey="..."
  config={{
    proxyDomain: 'https://static.acme.com/lib/sdk@6.0.0', // WRONG: origin only; the SDK adds the path
    // WRONG: no version and no selfHosted, so data still goes to Velt SaaS
  }}
>
{ "strict": false, "deploymentProfile": ["core", "ai"] }
```

(Wrong: `strict` is off and the module list was typed by hand instead of copied from `enabledModules`.)

**Correct:**

```tsx
import selfHosted from './velt-selfhosted-config.json';

<VeltProvider
  apiKey="<production key from install Phase 3>"
  config={{
    proxyDomain: 'https://static.acme.com', // origin only; path stays /lib/sdk@<version>/velt.js
    version: '6.0.0',                       // must match the hosted folder (the manifest's tested SDK version)
    selfHosted,                             // generated in install Phase 5.1
  }}
>
```

Vanilla and Vue use `initVelt(apiKey, { proxyDomain, version, selfHosted })`.

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/self-hosting/partial/overview
- https://docs.velt.dev/self-hosting/partial/comments
- https://docs.velt.dev/self-hosting/partial/attachments
- https://docs.velt.dev/self-hosting/partial/reactions
- https://docs.velt.dev/self-hosting/partial/recordings
- https://docs.velt.dev/self-hosting/partial/users
- https://console.velt.dev
- https://docs.velt.dev/self-hosting/partial/activity
- https://docs.velt.dev/self-hosting/partial/notifications
- https://docs.velt.dev/self-hosting/partial/field-inventory
- https://docs.velt.dev/backend-sdks/python
- https://docs.velt.dev/self-hosting/full/overview
- https://docs.velt.dev/self-hosting/full/gcp/overview
- https://docs.velt.dev/self-hosting/full/gcp/reference
- https://docs.velt.dev/release-notes/version-5/velt-py-changelog
