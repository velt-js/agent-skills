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

**Available provider keys (full [`VeltDataProvider`](https://docs.velt.dev/api-reference/sdk/models/data-models#veltdataprovider) shape):**

| Key | Data Type | Methods |
|-----|-----------|---------|
| `comment` | Comment content | get, save, delete |
| `reaction` | Emoji reactions | get, save, delete |
| `recorder` | Recording annotations (+ optional `storage` for files) | get, save, delete |
| `notification` | Custom notification PII | get, delete (no save) |
| `activity` | Activity log records | get, save |
| `attachment` | Comment file attachments | save, delete (no get) |
| `anonymousUser` | Email → userId resolution for @mentions | resolveUserIdsByEmail |
| `user` | User PII (name, email, photo) | get only |

Every key is optional — pass only the providers you want to self-host. Unregistered features stay fully Velt-hosted.

**ActivityAnnotationDataProvider shape:**

The `activity` provider uses `ActivityAnnotationDataProvider` with `get` for re-hydrating PII-stripped records on read and `save` for stripping PII before persisting on write:

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
- Data providers must be set **before** `identify()` is called
- Self-hosting only works with `setDocuments` (plural), **not** `setDocument` (singular)
- Each provider key is optional — only configure the data types you want to self-host
- Define providers as module-level constants or `useMemo` to avoid unnecessary re-renders
- `setDataProviders()` is the imperative counterpart to the `dataProviders` prop — use it from non-React frameworks (or any time you need to wire providers dynamically); both accept the same `VeltDataProvider` shape
- `setAnonymousUserDataProvider()` is a standalone setter for the `anonymousUser` provider — equivalent to registering it inside `setDataProviders({ anonymousUser })`; use whichever fits your code layout

#### Complete VeltProvider Wiring for Self-Hosting

This is how VeltProvider should look in the document page when self-hosting is enabled. The `dataProviders` prop MUST be set BEFORE the user is identified:

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

**Verification:**
- [ ] `dataProviders` prop set on VeltProvider before any auth/identify calls
- [ ] Using `setDocuments` (plural), not `setDocument`
- [ ] Providers defined as stable references (not recreated on every render)
- [ ] Only configuring providers for data types you want to self-host
- [ ] `VeltDataProviders.ts` exports all 4 providers (comment, user, attachment, reaction)
- [ ] All provider functions return `{ data, success, statusCode }` format
- [ ] API routes exist for all provider operations
- [ ] Database store uses UPSERT semantics (ON CONFLICT DO UPDATE)
- [ ] `DATABASE_URL` environment variable set in `.env.local`

**Source Pointer:** https://docs.velt.dev/self-hosting/partial/overview; https://docs.velt.dev/self-hosting/partial/comments - Important Notes

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
```

**Error handling.** `sdk.selfHosting.*` returns `{'success': False, 'statusCode': 400 | 404 | 500, 'error': '...', 'errorCode': 'INVALID_INPUT' | 'NOT_FOUND' | 'INTERNAL_ERROR'}` on failure. `sdk.api.*` returns a dict with either `result` or `error`, and raises typed exceptions that all extend `VeltSDKError`:

| Exception | When raised |
|-----------|-------------|
| `VeltSDKError` | Base class for any SDK-level error |
| `VeltValidationError` | SDK-level validation such as missing required config; `sdk.api.*` does not validate request payloads locally |
| `VeltTokenError` | Token generation or authentication failure |
| `VeltApiError` | REST API errors (network failures, unexpected responses) |

```python
from velt_py.exceptions import VeltSDKError, VeltValidationError, VeltTokenError, VeltApiError

try:
    result = sdk.api.organizations.getOrganizations(request)
except VeltApiError as e:
    print(f'API error: {e.message}')
except VeltSDKError as e:
    print(f'SDK error: {e.message}')
```

**Verification:**
- [ ] `velt-py[mongodb]` or `velt-py[postgres]` is in requirements whenever a `database` block is configured
- [ ] `VeltSDK.initialize({...})` is called once with a config dict (not `VeltSdk(VeltSdkConfig(...))`)
- [ ] REST-only services omit the `database` block
- [ ] `aws` uses `bucket_name`, `region`, `access_key_id`, `secret_access_key` and is present when attachments are self-hosted
- [ ] Remote PostgreSQL uses `sslmode: 'verify-full'` with `sslrootcert`
- [ ] Credentials come from environment variables or a secret store

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/python#installation - "Installation", "Upgrading from 0.1.x"
- https://docs.velt.dev/backend-sdks/python#self-hosting-configuration - Database, AWS, Collections, User Schema
- https://docs.velt.dev/backend-sdks/python#error-handling - "Error Handling"
- https://docs.velt.dev/release-notes/version-5/velt-py-changelog - "v0.2.0"

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

```js
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
```

**For function-based providers** (same format returned from the resolver):

```jsx
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

**Response format by operation:**

| Operation | `data` field contains |
|-----------|----------------------|
| get (comments/reactions/recordings) | `Record<string, Annotation>` — keyed by annotationId |
| get (users) | `Record<string, User>` — keyed by userId |
| save | Any (often `undefined` or `null`) |
| delete | Any (often `undefined` or `null`) |
| save (attachments) | `{ url: string }` — the stored file URL |

**Key details:**
- `success` must be a **boolean** (`true` or `false`), not a truthy value
- `statusCode` must be a **number** (200, 400, 500, etc.)
- For endpoint-based providers, the HTTP response body must contain these fields
- For function-based providers, the resolver function must return this object
- When using REST API to add/update comments externally, set `isCommentResolverUsed: true` and `isCommentTextAvailable: true` on the comment data

**Verification:**
- [ ] All handlers return `data`, `success`, and `statusCode` fields
- [ ] `success` is boolean, `statusCode` is number
- [ ] Error responses return `success: false` with appropriate statusCode
- [ ] Get operations return data keyed by annotationId or userId

**Source Pointer:** https://docs.velt.dev/self-hosting/partial/comments; https://docs.velt.dev/self-hosting/partial/attachments; https://docs.velt.dev/self-hosting/partial/reactions

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

**Verification:**
- [ ] VeltProvider uses `authProvider` prop (not `useIdentify` hook or `client.identify()` method)
- [ ] VeltProvider has `dataProviders` prop set alongside `authProvider`
- [ ] No imports of `useIdentify` from `@veltdev/react`
- [ ] No calls to `client.identify()` anywhere in the codebase

**Source Pointers:**
- https://docs.velt.dev/self-hosting/partial/overview - Self-Hosting Data Setup

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

The SDK automatically sends POST requests with these bodies:

```js
// GET request body
{ organizationId: "org-id", documentIds: ["doc-id"], commentAnnotationIds: ["ann-id"] }

// SAVE request body
{ commentAnnotation: { "annotationId": { /* full annotation data */ } }, metadata: { documentId, organizationId } }

// DELETE request body
{ commentAnnotationId: "ann-id", metadata: { documentId, organizationId } }
```

**Custom field control with `additionalFields` and `fieldsToRemove`:**

Both options apply to **your own custom fields** that you attach to an annotation — not to Velt's built-in PII (which is stripped automatically).

```jsx
const commentDataProvider = {
  config: {
    // ...endpoint configs above...
    additionalFields: ['status', 'assignedTo', 'priority'],   // copy to your DB, keep in Velt's
    fieldsToRemove:   ['internalTicketId'],                    // move out of Velt's DB into yours
  }
};
```

**Short-lived tokens and cookies.** On any endpoint config (`getConfig`, `saveConfig`, `deleteConfig`) of any provider, `headers` can be an async function that the SDK resolves on every request, including each retry, so a short-lived token stays fresh. Static header objects are captured once. Set `credentials: 'include'` to send cookies for cross-origin session auth; when unset, `fetch()` keeps its default.

```jsx
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

Verify that credential on your backend before touching the database (see `backend-verify-resolver-auth`).

See the `provider-retry-timeout` rule for the full `additionalFields` vs `fieldsToRemove` comparison and the list of structural fields that must **never** appear in `fieldsToRemove` (identifiers, metadata, location, status, resolver flags, …).

**Key details:**
- SDK handles all HTTP request/response serialization automatically
- All three config endpoints (get, save, delete) are optional — only implement what you need
- Your endpoints must return the standard `{ data, success, statusCode }` format
- The SDK sends context metadata (documentId, organizationId) automatically
- Choose endpoint-based when your backend has simple REST endpoints; use function-based for custom logic

**Verification:**
- [ ] All three endpoint URLs configured and reachable
- [ ] Backend returns `{ data, success, statusCode }` format
- [ ] Headers include authentication if required; short-lived tokens use an async `headers` function
- [ ] `fieldsToRemove` configured to strip sensitive PII

**Source Pointers:**
- https://docs.velt.dev/self-hosting/partial/comments - "Endpoint based DataProvider", "additionalSaveEvents"
- https://docs.velt.dev/self-hosting/partial/overview - "Async headers and credentials"

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

**When to use function-based over endpoint-based:**
- Custom data transformations before storage
- Writing to multiple systems simultaneously
- Conditional routing based on request content
- Non-REST backends (GraphQL, gRPC, direct database access)
- Custom error handling or logging

**Key details:**
- All three functions are optional but recommended for complete functionality
- Each function must return `{ data, success, statusCode }`
- The `config` object with retry/timeout settings can coexist with function callbacks
- The get function must return data keyed by annotationId: `{ "ann-1": { annotationId: "ann-1", comments: {...} } }`

#### When `save` actually fires (strip rules)

The frontend strip is what makes `PartialCommentAnnotation` smaller than `CommentAnnotation` — and the same logic decides whether `save` is called at all. Get these gating conditions wrong and `save` either never runs (PII silently lost) or runs on every non-PII change (your DB churns on status / priority flips).

- **Stripped on the frontend (never sent to Velt):** per-comment `commentText` and `commentHtml`; per-comment `attachments[].name` and `attachments[].url` (only when the `attachment` resolver is active); `targetTextRange.text`; and any keys listed in `config.fieldsToRemove`. Per-comment strips set `isCommentResolverUsed = true` on the comment; attachment strips set `isAttachmentResolverUsed = true`.
- **Copied-not-moved** (sent to both your DB and Velt's DB): `from`, `assignedTo`, `resolvedByUserId`.
- **`save` is gated by `ResolverActions` by default.** It fires only when the PII actually changed **and** the action maps to one of `COMMENT_ANNOTATION_ADD` / `COMMENT_ADD` / `COMMENT_UPDATE` / `COMMENT_DELETE` (or a draft). Pure status, priority, or assignment changes do **not** call `save` unless you opt in with `config.additionalSaveEvents` (see below).
- **Truthy-gating.** Empty strings (`commentText: ""`, `commentHtml: ""`) are **not** sent to your provider and are **not** withheld from Velt either — they fall through to Velt as the empty string. The exception is `config.additionalFields`, which uses `!== undefined`, so `0`, `""`, and `false` are copied to both sides.
- **Delete payload is minimal.** A delete sends only `{ apiKey, documentId, organizationId, folderId? }` plus the `commentAnnotationId` — no PII to strip.

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
```

#### Opting into non-core save events

Set `config.additionalSaveEvents` (an `AdditionalSaveEventConfig[]`, each `{ event: CommentResolverSaveEvent }`) to also receive annotation-level lifecycle events on the same `save` handler or `saveConfig` endpoint. `CommentResolverSaveEvent` is a string-literal union in `@veltdev/react`, so pass the string values. Values: `comment_annotation.status_change`, `comment_annotation.priority_change`, `comment_annotation.assign`, `comment_annotation.access_mode_change`, `comment_annotation.custom_list_change`, `comment_annotation.approve`, `comment.accept`, `comment.reject`, `comment_annotation.suggestion_accept`, `comment_annotation.suggestion_reject`, `comment.reaction_add`, `comment.reaction_delete`, `comment_annotation.subscribe`, `comment_annotation.unsubscribe`.

```tsx
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

`comment.reaction_add` / `comment.reaction_delete` (comment-level reactions) are distinct from the reaction resolver's `reaction.add` / `reaction.delete`.

**Verification:**
- [ ] All three functions implemented (get, save, delete)
- [ ] Each returns `{ data, success, statusCode }`
- [ ] Error cases return `success: false` with appropriate statusCode
- [ ] Get returns data keyed by annotationId
- [ ] `save` handler does not assume it fires on status / priority / assignment changes unless those events are listed in `additionalSaveEvents`
- [ ] When `additionalSaveEvents` is set, the handler branches on `request.event` and never persists `targetComment`
- [ ] Backend tolerates the truthy-gating contract: missing `commentText` / `commentHtml` means "no PII change for that comment", not "comment was cleared"

**Source Pointers:**
- https://docs.velt.dev/self-hosting/partial/comments - "Function based DataProvider", "additionalSaveEvents"
- https://docs.velt.dev/self-hosting/partial/field-inventory - "Comment strip rules"
- https://docs.velt.dev/api-reference/sdk/models/data-models#commentresolversaveevent - "CommentResolverSaveEvent"

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

For Next.js API routes, use the **base64 approach** (convert File to base64, send as JSON) since Next.js API routes don't natively support multipart parsing without extra libraries:

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
```

The backend attachment GET route must also exist to serve stored files:

```tsx
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

**Key differences from other providers:**

| Aspect | Attachments | Comments/Reactions/Recordings/Users |
|--------|-------------|-------------------------------------|
| Save format | `multipart/form-data` | `application/json` |
| Content-Type header | Auto-set by browser | Must set explicitly |
| Get operation | Not supported | Supported |
| Save response | Must include `{ url }` | Can be empty |

**Two storage scopes — keep them separate:**

`AttachmentDataProvider` is used in two distinct positions on the `VeltDataProvider` object, and they route to independent destinations. Wire each scope you need; do not consolidate them.

| Scope | Configured via | Used for |
|---|---|---|
| Comment attachments | `dataProviders.attachment` | Files attached to comments |
| Recording files | `dataProviders.recorder.storage` | Video/audio recording binaries |

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

**Key details:**
- Do **NOT** set `Content-Type` header for save requests — the browser sets it automatically with the correct multipart boundary
- The save response **must** include `{ data: { url: string } }` — the URL where the attachment can be accessed
- Delete operations use standard JSON like other providers
- Set a longer `resolveTimeout` (15-30s) for file uploads
- Attachment data is stored alongside comment data — when a comment has attachments, the URLs are embedded in the comment annotation stored on your database

**Delete handler metadata contract (v5.0.2-beta.11+):**

As of v5.0.2-beta.11, the `metadata` field passed to the attachment delete handler contains only client-facing metadata — internal Velt fields are stripped before the call. Do not rely on internal Velt fields (such as `commentAnnotationId` or `attachmentId`) being present in `metadata`; use the top-level `attachmentId` field on the request object instead.

```tsx
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
```

#### Upload payload field inventory

The attachment provider sits **outside** the `Partial<X>` strip model used by every other provider. There is no `get` and no `Partial<Attachment>` — attachments are binary files. When Velt hands a save call to your storage provider, the payload is a fixed shape:

```typescript
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

**Verification:**
- [ ] Backend parses multipart/form-data (not JSON) for save
- [ ] Content-Type header NOT manually set for save requests
- [ ] Save response includes `{ data: { url } }`
- [ ] Delete uses standard JSON format
- [ ] Timeout is longer than for other providers (file upload latency)
- [ ] Delete handler reads `attachmentId` from the top-level request field, not from `metadata`
- [ ] Comment attachments wired on `dataProviders.attachment`; recording files wired on `dataProviders.recorder.storage` — separate scopes, never collapsed
- [ ] Save handler only reads `attachmentId`, `name`, `mimeType` from `request.attachment` — does not assume `size` / `thumbnail` / `previewImages` etc. are present (Velt populates those from the returned `url` and the binary)
- [ ] `event` is treated as one of `ResolverActions` (`ATTACHMENT_ADD` / `ATTACHMENT_DELETE`); handlers gate side effects on it rather than HTTP method alone

**Source Pointer:** https://docs.velt.dev/self-hosting/partial/attachments - Endpoint-Based, Function-Based; https://docs.velt.dev/self-hosting/partial/overview - "Attachment & recording storage"; https://docs.velt.dev/self-hosting/partial/field-inventory - "Attachments"

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

| Provider | Data stored on your infrastructure |
|----------|-----------------------------------|
| Reaction | Emoji type, user who reacted, associated comment |
| Recording | Recording transcription, user identity, attachment URLs |

**Backend request shapes** (what the SDK passes to your handler or POSTs to your endpoint):

```js
// Reaction get:    { organizationId, reactionAnnotationIds?, documentIds?, folderId?, allDocuments? }
// Reaction save:   { reactionAnnotation: Record<string, PartialReactionAnnotation>, metadata?, event? }
// Reaction delete: { reactionAnnotationId, metadata?, event? }
// Recorder get:    { organizationId, recorderAnnotationIds?, documentIds? }
// Recorder save:   { recorderAnnotation: Record<string, PartialRecorderAnnotation>, metadata?, event? }
// Recorder delete: { recorderAnnotationId, metadata?, event? }
```

The `dataProviders` key for recordings is `recorder` (there is no `recording` key).

**Key details:**
- Both follow the exact same interface as the comment data provider
- Recording data contains sensitive PII (who recorded, transcription text) making self-hosting valuable for privacy compliance
- Reaction data includes the emoji icon, the user who reacted, and the associated comment annotation ID
- In-app notification content for reactions is auto-generated from the self-hosted reaction data in the frontend
- Backend CRUD operations use the same upsert pattern as comments (see backend-database-patterns rule)

#### Reaction strip rules (what crosses each side)

The reaction strip is intentionally narrow — only the emoji-code `icon` is withheld from Velt. Custom-icon variants and the per-element reaction array stay structured on Velt's side. The common mistake is to also strip `iconUrl` / `iconEmoji` — those are kept and the UI relies on them surviving the round-trip.

- **Never sent to Velt:** `icon` only — the emoji-code string. Stripped on the frontend and written to your DB; merged back on read. When stripped, the SDK sets `isReactionResolverUsed = true` on the Velt-side record.
- **Kept and sent to Velt verbatim:** `iconUrl` (custom reaction icon URL) and `iconEmoji` (custom reaction emoji character). Only the emoji-code `icon` is withheld — these custom variants are part of the structural record.
- **`from` is copied-not-moved** — both your DB and Velt's DB receive `from`. The per-element `reactions[].from` is reduced to `{ userId }` (when the `user` provider is active) **only inside Velt's DB** — it is not part of the `Partial` payload.
- **`position`'s value is never sent to Velt** — written as `null` on every write to Velt's DB regardless of self-hosting. This is independent of the reaction resolver.
- **Unchanged save short-circuits.** A deep-compare against the cache decides whether to strip at all. If nothing changed, the icon is not re-processed and `isReactionResolverUsed` is not set — your `save` handler is not called either.
- **`icon` is stripped automatically; `fieldsToRemove` is for your own custom fields.** Since v6.0.0-beta.2 the reaction and recorder resolvers support `fieldsToRemove` as well as `additionalFields`. List reaction-specific custom fields (for example `internalRef`, `tenantId`) to move them out of Velt's DB; they are merged back on read. Reaction and recorder providers match on `!== undefined`, so `0`, `false`, and `""` are moved too. You never need to list `icon`.

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

#### Reaction provider verification

- [ ] Both providers return `{ data, success, statusCode }` format
- [ ] Get returns data keyed by annotationId
- [ ] All three operations implemented for each provider
- [ ] Backend uses same upsert pattern as comments
- [ ] `save` handler treats `icon` as the only relocated field; does not strip `iconUrl` / `iconEmoji`
- [ ] `position` is written as `null` to Velt regardless of self-hosting (do not try to round-trip its value through the resolver)
- [ ] Recordings are registered under the `recorder` key
- [ ] `fieldsToRemove` on reaction / recorder configs lists only your own custom fields, never `icon` or structural fields

**Source Pointers:**
- https://docs.velt.dev/self-hosting/partial/reactions - "config" (`additionalFields`, `fieldsToRemove`)
- https://docs.velt.dev/self-hosting/partial/recordings
- https://docs.velt.dev/self-hosting/partial/field-inventory - "Reaction strip rules"
- https://docs.velt.dev/api-reference/sdk/models/data-models#savereactionresolverrequest - "SaveReactionResolverRequest"

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

**Recommended values by provider type:**

| Provider | resolveTimeout | retryCount | retryDelay |
|----------|---------------|------------|------------|
| Comments | 10-20s | 3 | 1-2s |
| Reactions | 5-10s | 2-3 | 1s |
| Recordings | 10-20s | 3 | 2s |
| Users | 5-10s | n/a (`getRetryConfig` is not supported for the user provider) | n/a |
| Activity | 30-60s | 3 | 2s |
| Attachments (save) | 20-30s | 3 | 2-3s |
| Attachments (delete) | 5-10s | 2 | 1s |

Activity feeds can fan out across many records, so prefer the longer end of the timeout range. Activity's `saveRetryConfig` also supports `revertOnFailure: true` to roll back the optimistic cache update when save retries are exhausted — see [[provider-activity]] for the full activity-specific surface.

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
- `resolveTimeout` applies to the overall operation including all retries
- Keep `retryCount` low (2-3) to avoid thundering herd on backend failures
- Set longer timeouts for attachment uploads (file transfer takes time)
- These options work with both endpoint-based and function-based providers

#### `additionalFields` vs `fieldsToRemove` — copy vs move custom fields

Velt already strips its **built-in PII** automatically (comment text, user info, transcripts, …) — you do not configure that. `additionalFields` and `fieldsToRemove` are exclusively for **your own custom fields** attached to an annotation, and they control whether those custom fields are copied or relocated.

- **`additionalFields` — replication (copy).** Each listed custom field is deep-copied into the payload sent to your backend, **and kept** in Velt's DB. On read there is nothing to merge — the field is already in Velt's record. Use this for analytics or search mirrors where you want a copy without moving the field.
- **`fieldsToRemove` — data sovereignty (move).** Each listed custom field is sent to your backend **and deleted** from Velt's DB. On read, Velt fetches it back from your provider and merges it into the record. Use this when a custom field must not be stored by Velt at all.

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

**Where each is supported (per provider):**

| Provider | `fieldsToRemove` | `additionalFields` |
|---|:---:|:---:|
| `comment` | ✅ | ✅ |
| `reaction` | ✅ | ✅ |
| `recorder` | ✅ | ✅ |
| `activity` | ✅ (all feature types) | — |
| `notification` | — | — |

> ⚠️ **`fieldsToRemove` is for your own custom fields ONLY.** Never list a field Velt relies on to query, scope, position, sync, or render an annotation. If you remove a structural field, Velt can no longer find or place the annotation, and comments/reactions/recordings will silently fail to load, appear in the wrong place, or break filtering and visibility. In particular, **do not** put any of these in `fieldsToRemove`:
>
> - **`metadata`** and its sub-fields — `apiKey`, `documentId`, `organizationId`, `folderId`, `documentMetadata`
> - **Identifiers / keys** — `annotationId`, `id`, `commentId`, `annotationNumber`, `targetEntityId`, `targetSubEntityId`, `notificationId`, `commentAnnotationId`
> - **Location & positioning** — `location`, `locationId`, `context`, `contextId`, `position`, `positionX`/`positionY`, `targetElement`, `targetElementId`, `targetTextRange`, `pageInfo`
> - **Query / filter / state fields** — `status`, `priority`, `type`, `commentType`, `featureType`, `actionType`, `from`, `assignedTo`, `resolvedByUserId`, `timestamp`, `createdAt`, `lastUpdated`, `forYou`, `notificationSource`, `targetAnnotationId`
> - **Resolver flags** — `isCommentResolverUsed`, `isReactionResolverUsed`, `isRecorderResolverUsed`, `isNotificationResolverUsed`, `isActivityResolverUsed`
>
> If in doubt, prefer `additionalFields` (which keeps the field in Velt's DB) so you never accidentally break querying.

**Verification:**
- [ ] `resolveTimeout` set based on backend p99 latency
- [ ] `retryCount` is low (2-3) to avoid cascade
- [ ] Attachment provider has longer timeout than text-based providers
- [ ] `fieldsToRemove` lists only custom fields — never structural identifiers, metadata, query/filter fields, or resolver flags
- [ ] `additionalFields` used when you only need a mirror copy (no removal from Velt's DB)
- [ ] Provider supports the chosen option (`comment`, `reaction`, and `recorder` support both; `activity` supports only `fieldsToRemove`; see the matrix above)

**Source Pointers:**
- https://docs.velt.dev/self-hosting/partial/overview - "Excluding & extending fields", "Where these are supported"
- https://docs.velt.dev/self-hosting/partial/comments - "config"
- https://docs.velt.dev/api-reference/sdk/models/data-models#resolverconfig - "ResolverConfig"

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
```

**⚠️ CRITICAL: The user provider has a DIFFERENT interface from all other providers.**

| | Comment/Reaction/Attachment providers | User provider |
|---|---|---|
| **Input** | Request object `{ organizationId, ... }` | Plain `string[]` array of userIds |
| **Return** | `{ data, success, statusCode }` | `Record<string, User>` directly |

DO NOT wrap the function-based user provider's return in `{ data, success, statusCode }`; the SDK expects `Record<string, User>` directly.

**Endpoint-based variant is different.** With `config.getConfig`, the SDK POSTs `{ organizationId, userIds }` (a `GetUserResolverRequest`, not a bare array) and your endpoint must answer with the standard `ResolverResponse<Record<string, User>>` envelope (`{ data, success, statusCode }`). Use `config.resolveUsersConfig` (`{ organization, folder, document }` booleans) to stop user-resolver requests at scopes you do not need.

```jsx
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

When Velt renders a comment thread, it calls the user provider to resolve names and avatars. If the user data isn't in your database yet, comments show generic "U" / "Me" labels instead of names.

For demo apps with hardcoded users, seed them on app startup:
```tsx
// In your app initialization or a /api/velt/init-db route:
const DEMO_USERS = [
  { userId: "user-1", name: "Alice Johnson", email: "alice@example.com", photoUrl: "https://i.pravatar.cc/150?u=alice" },
  { userId: "user-2", name: "Bob Smith", email: "bob@example.com", photoUrl: "https://i.pravatar.cc/150?u=bob" },
];
for (const user of DEMO_USERS) {
  await saveUser(user); // UPSERT into users table
}
```

For production apps, persist user data when users log in:
```tsx
// In VeltInitializeUser.tsx or your auth flow:
useEffect(() => {
  if (user?.userId) {
    saveCurrentUserToDB(user);
  }
}, [user]);
```

**Important:** The SDK only calls `get` — it never calls save/delete for users. However, your app MUST have a `users/save` route so that when users log in, their PII (name, email, photoUrl) is persisted to your database. Call `saveCurrentUserToDB()` from your auth flow. For demos, also seed users into the DB at startup.

**Key details:**
- Only `get` is supported — the SDK uses this to hydrate user data in comment threads, notifications, and presence UIs
- `get` receives a plain `string[]` of userIds — NOT a request object
- `get` must return `Record<string, User>` directly — NOT `{ data, success, statusCode }`
- Must be set before `identify()` is called
- Users must already exist in your database when Velt calls `get` — seed demo users or persist on login
- Without this provider, user PII (name, email, photo URL) is stored on Velt servers by default
- `getRetryConfig` is not supported for the user provider
- If the user provider fails or omits the logged-in user at page load, Velt (v6.0.0+) falls back to the name from `identify()`, keeps the placeholder out of the user store, and retries in the background, so new comments and notifications still carry the correct name. Still return every requested user

**Verification:**
- [ ] Only `get` implemented (no save/delete)
- [ ] Function-based `get` receives `string[]` and returns `Record<string, User>` directly (no wrapper); endpoint-based `getConfig` receives `{ organizationId, userIds }` and returns `{ data, success, statusCode }`
- [ ] All requested userIds resolved (missing users show as "Unknown")
- [ ] Provider set before `identify()` is called
- [ ] Demo users seeded into database at startup
- [ ] `saveCurrentUserToDB()` called from auth flow to persist user PII on login

**Source Pointers:**
- https://docs.velt.dev/self-hosting/partial/users - "Endpoint based DataProvider", "Function based DataProvider"
- https://docs.velt.dev/release-notes/version-6/sdk-changelog - "6.0.0" (user resolver fallback)

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
```

**Endpoint-based example** (SDK performs the POST for you; pair `getConfig` and/or `saveConfig` with retry/timeout/`fieldsToRemove` on the same `config` object):

```tsx
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

The SDK POSTs the same `GetActivityResolverRequest` / `SaveActivityResolverRequest` bodies the function-based handlers would receive, and expects the same `ResolverResponse` shape back. Do not modify the endpoint URLs — copy them verbatim into your config. `saveRetryConfig.revertOnFailure: true` rolls back the optimistic cache update when the save retries are exhausted.

**Compatibility:** Currently only compatible with the `setDocuments` method. Providers must be set before `identify()` is called.

**Storage-boundary contract (what persists where):**

When the activity resolver is active, the SDK strips PII before persisting on Velt (feature-aware for built-in types, `fieldsToRemove` keys for all types); your `save` handler receives the stripped fields and stores them in your backend. On read, the SDK merges your `get` response back into the activity record.

| Field | Stored on Velt | Stored on your DB |
|-------|----------------|-------------------|
| `id` | Yes (routing) | Yes (primary key) |
| `featureType` | Yes | — |
| `actionType` | Yes | — |
| `actionUser` | Yes (userId only) | — |
| `timestamp` | Yes | — |
| `metadata` | Yes (apiKey, internal/client doc + org IDs) | Yes (apiKey, documentId, organizationId) |
| `targetEntityId` | Yes | — |
| `isActivityResolverUsed` | Yes (boolean flag) | — |
| `immutable` | Yes (boolean flag) | — |
| `entityData` | No for `custom` activities when listed in `fieldsToRemove`; built-in types keep the object with PII fields removed | Yes (stripped PII) |
| `entityTargetData` | Same as `entityData` | Yes (stripped PII) |
| `displayMessageTemplate` | No when listed in `fieldsToRemove` | Yes when moved |
| `displayMessageTemplateData` | No when listed in `fieldsToRemove` (user objects inside are reduced to `{ userId }` when the `user` provider is active) | Yes when moved |
| Custom fields listed in `config.fieldsToRemove` | No | Yes |

Stored-on-Velt example for a `custom` activity (everything the SDK retains when the resolver is active):

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

**Key details:**
- `get` and `save` only — there is no `delete` on the activity resolver (and no `deleteConfig`)
- Each method has two equivalent forms: callback (`get` / `save`) or endpoint config (`getConfig` / `saveConfig`). At least one form per method is required; the two forms can be mixed per-method
- `fieldsToRemove` moves the listed top-level keys wholesale to your DB for every feature type (`comment`, `reaction`, `recorder`, `custom`), on top of the automatic strip. Values are matched on `!== undefined`, so `0`, `false`, and `""` are moved too
- `saveRetryConfig.revertOnFailure: true` reverts the optimistic cache update when the save ultimately fails after retries — set this on the activity resolver to avoid leaving stale PII in the UI when your backend rejects a write
- `isActivityResolverUsed: true` on `ActivityRecord` means PII has been stripped; use it to gate a loading skeleton while `get` is in flight
- The `metadata` block contains both Velt-internal IDs (`documentId`, `organizationId`) and your client-facing IDs (`clientDocumentId`, `clientOrganizationId`) — both shapes live on Velt
- Use a longer `resolveTimeout` (30–60s) than for comments since activity feeds can fan out across many records

#### Activity strip rules

Activity is append-only (no `delete`) and the strip is multi-feature: a single `ActivityRecord` can carry comment PII *and* reaction/recorder PII *and* custom-template PII at once. The rules differ by `featureType` and depend on which sibling resolvers are wired.

- **`displayMessage` is always recomputed on the client** from the template + values — stored in **neither DB**. Do not persist a rendered string; the template + data are the source of truth.
- **User reduction** (`actionUser`, users in `changes`, users in `displayMessageTemplateData`) happens **only when the `user` provider is active**. Without the user provider these stay as full `User` objects on Velt.
- **`changes['commentText']` is never sent to Velt** (→ your DB) **only** when the **activity** resolver is active. If only the *comment* resolver is active (and not the activity resolver), `commentText` is preserved on Velt — this is deliberate, to avoid unrestorable loss of audit text.
- **Reaction / recorder `entityData` PII reaches your DB only when both** the activity resolver **and** the matching feature resolver are active. With activity alone, those entity snapshots stay on Velt; with the feature resolver alone, they flow through its own store.
- **Comment `entityData` / `entityTargetData` PII is handled by the comment resolver's own store**, not duplicated here.
- **`fieldsToRemove` applies to all feature types.** Since v6.0.0-beta.2, listed top-level keys are moved wholesale to your DB for `comment`, `reaction`, `recorder`, and `custom` activities. For built-in types it runs on top of the feature-aware partial strip; for `custom` it is the only stripping that happens (there is no automatic field-level strip for custom activities). Listing `entityData` or `entityTargetData` moves the entire field.
- **Append-only: no `delete`.** `ActivityAnnotationDataProvider` has no delete member by design.

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

**Verification:**
- [ ] `get` (or `getConfig.url`) returns `Record<string, PartialActivityRecord>` with `entityData`, `entityTargetData`, and display templates hydrated from your DB
- [ ] `save` (or `saveConfig.url`) persists stripped fields to your DB and returns `ResolverResponse<undefined>`
- [ ] Each of `get` / `save` has exactly one of: callback function OR endpoint config — never both for the same method
- [ ] Endpoint URLs are copied verbatim from your backend; the SDK posts the same `GetActivityResolverRequest` / `SaveActivityResolverRequest` body the callback would receive
- [ ] No `delete` / `deleteConfig` is configured — activity is append-only
- [ ] `saveRetryConfig.revertOnFailure` set to `true` if you want optimistic cache updates rolled back when save retries are exhausted
- [ ] Provider set before `identify()` is called
- [ ] Customer DB stores entity snapshots, display templates, template data, and any `fieldsToRemove` fields; Velt stores only minimal identifiers, action metadata, resolver flag, and `targetEntityId`
- [ ] UI gates a loading skeleton on `isActivityResolverUsed === true`
- [ ] `fieldsToRemove` lists only your own top-level keys (never `id`, `featureType`, `actionType`, `targetEntityId`, `metadata`, or resolver flags) and covers custom-activity snapshots that must leave Velt
- [ ] `displayMessage` is never persisted — only the template and template data are stored

**Source Pointers:**
- https://docs.velt.dev/self-hosting/partial/activity - "What gets stripped", "Implementation Approaches", "Sample Data"
- https://docs.velt.dev/self-hosting/partial/field-inventory - "Activity strip rules"
- https://docs.velt.dev/self-hosting/partial/overview - "Excluding & extending fields"

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

When the notification resolver is in use, the SDK strips notification PII before writing to Velt and re-hydrates on read. Only a minimal routing shape persists on Velt servers:

| Field | Stored on Velt | Stored on your DB |
|-------|----------------|-------------------|
| `notificationId` | Yes (routing) | Yes (primary key) |
| `notificationSource` | Yes (always `"custom"`) | — |
| `isNotificationResolverUsed` | Yes (boolean flag) | — |
| `actionUser` | Yes (userId only) | — |
| `notifyUsers` | Yes (userId list only) | — |
| `displayHeadlineMessageTemplate` | No | Yes |
| `displayHeadlineMessageTemplateData` | No | Yes |
| `displayBodyMessage` | No | Yes |
| `notificationSourceData` | No | Yes |

Stored-on-Velt example (everything the SDK retains when the resolver is active):

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

**Writing Resolver-Eligible Notifications (REST-side):**

To create a notification whose content will be resolved from your own infrastructure at read time, the REST write must set **both** `isNotificationResolverUsed: true` **and** `notificationSource: 'custom'`, and omit `displayHeadlineMessageTemplate` and `displayBodyMessage`. Only notifications where `notificationSource === 'custom'` are routed through the notification resolver — notifications without this field will **not** call your data provider, even if `isNotificationResolverUsed` is `true`.

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

**Key details:**
- Only `get` and `delete` — no `save` (notifications are created via REST API, not the SDK)
- Only custom notifications (`notificationSource === 'custom'`) are routed through this provider
- `Notification.isNotificationResolverUsed` is `true` when PII was stripped
- Pair with the REST API `POST /v2/notifications/add` with `isNotificationResolverUsed: true` to create custom notifications that use the resolver
- Velt servers never see headline templates, body text, or `notificationSourceData` when the resolver is configured — they remain on your infrastructure

#### Notification strip rules

The notification provider is unusual: **read-only enrichment**. There is no write-side strip and no `save`. Knowing that there is no save handler is the whole rule — code that "syncs" PII back through this provider is misconfigured.

- **No write-side strip / no `save`.** For custom notifications the `PartialNotification` PII is never sent to Velt at all. The PII lives in your backend the moment your REST writer creates it, and is fetched on read via `get`. On read, the SDK merges your response into both the `notification` and its raw form, setting `isNotificationResolverUsed = true`.
- **The only write-side reduction is `actionUser → { userId }`** — and that happens only when the `user` provider is active.
- **Client-computed fields** (`isUnread`, `forYou`, the rendered `displayHeadlineMessage`) are recomputed on the client from `notificationViews` / `notifyUsers*` / the templates and stored in **neither DB**.
- **Resolution order is notification → user → comment.** Notification PII fills userIds that the user resolver then enriches.
- **Delete payload is minimal.** Velt calls your provider with `{ notificationId, organizationId }`.
- **`notifyUsers` / `notifyUsersByUserId` are keyed by hashes,** not raw emails / userIds. On Velt's DB `notifyUsers` is a map `{ [emailHash]: boolean }` and `notifyUsersByUserId` is a map `{ [userIdHash]: boolean }` — not the array-of-`{ userId, email }` shape you POST when *writing* a notification. The hash keys are kept on Velt's side; the raw identifiers are not.

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

**Verification:**
- [ ] Only used for custom notifications (notificationSource === 'custom')
- [ ] get returns `Record<string, PartialNotification>` with full PII (headline, body, source data) hydrated from your DB
- [ ] delete returns `ResolverResponse<undefined>`
- [ ] Provider set before identify()
- [ ] Customer DB stores the full notification record (templates + source data); Velt stores only routing identifiers, source flag, resolver flag, actionUser, and notifyUsers
- [ ] REST writes that should hit the resolver set **both** `isNotificationResolverUsed: true` and `notificationSource: 'custom'` (the source field is what actually routes — the boolean alone is not enough)
- [ ] No `save` handler is wired (the interface has none); PII is written to your DB by your REST writer, not by the SDK
- [ ] Client-side `isUnread` / `forYou` / rendered `displayHeadlineMessage` are not persisted to either DB

**Source Pointer:** https://docs.velt.dev/self-hosting/partial/notifications ("Sample Data"); https://docs.velt.dev/self-hosting/partial/field-inventory - "Notification strip rules"

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

**Status tracking fields:**
- `isRecorderResolverUsed: boolean` — true while PII is being fetched from resolver
- `isUrlAvailable: boolean` — true once recording media URL has been uploaded

**Key details:**
- `uploadChunks: true` sends recording data in chunks for large files
- `storage` is a scoped `AttachmentDataProvider` just for recorder media (separate from the main attachment provider)
- Recording data includes transcription text, user identity, and media URLs — all sensitive PII
- `RecorderResolverModuleName.GET_RECORDER_ANNOTATIONS` in dataProvider events for debugging
- The recorder config supports `additionalFields` and, since v6.0.0-beta.2, `fieldsToRemove` for your own custom fields (matched on `!== undefined`, so `0`, `false`, and `""` are moved too)

#### Recorder strip rules

The recorder splits along a few axes simultaneously — transcript, attachment binaries, and per-version edit history — and the rules differ for each. Important: the recorder **metadata** resolver and the recorder **file** storage (`recorder.storage`) are independent toggles. Recording files stay on Velt unless you also set `recorder.storage`.

- **`transcription`** — the entire object is **never sent to Velt** when the recorder resolver is active (→ your DB). It is present in Velt's DB **only** when no recorder resolver is set.
- **`attachment`** (deprecated single) — the value is **never sent to Velt** (written as `null` there). The full object goes to your DB.
- **`attachments[]`** — Velt's DB keeps **stubs only**: `{ attachmentId, name }`. `url` and the binary-pointing fields are stripped (Velt no longer retains `bucketPath`).
- **`from`** — **reduced** to `{ userId }` in Velt's DB; the full user object (name / email / `photoUrl`) goes to your DB only.
- **`recordingEditVersions`** — per-version PII is stripped the same way (`from` → `{ userId }`, `attachment` → `null`, `attachments` → stubs, `transcription` never sent). Non-PII per-version fields (`recordedTime`, `waveformData`, `displayName`, `boundedTrimRanges`, `boundedScaleRanges`) are **kept** in Velt's DB.
- **Top-level `displayName` / `waveformData` / `recordedTime`** — sent to Velt verbatim; not part of the `Partial` payload to your DB.
- `isRecorderResolverUsed` is set `true` whenever PII was stripped from a record.

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

**Verification:**
- [ ] get returns `Record<string, PartialRecorderAnnotation>`
- [ ] save returns `ResolverResponse<SaveRecorderResolverData | undefined>`
- [ ] delete returns `ResolverResponse<undefined>`
- [ ] Longer resolveTimeout set for media operations (20-30s)
- [ ] storage provider configured if media files should be stored on your infrastructure
- [ ] Provider set before identify()
- [ ] `attachments[]` round-trip preserves Velt-side stubs `{ attachmentId, name }` (Velt no longer stores `bucketPath`)
- [ ] `recordingEditVersions` per-version PII is treated as optional (versions without PII are absent from the payload)
- [ ] Save handlers read `request.recorderAnnotation` (singular), not `recorderAnnotations`

**Source Pointer:** https://docs.velt.dev/self-hosting/partial/recordings; https://docs.velt.dev/self-hosting/partial/field-inventory - "Recorder strip rules"

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

```jsx
// Frontend: async headers are resolved on every request, including retries
const commentDataProvider = {
  config: {
    getConfig: {
      url: 'https://api.example.com/api/velt/comments/get',
      headers: async () => ({ Authorization: `Bearer ${await getFreshToken()}` }),
    },
  },
};
```

```ts
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
```

```python
# Python backend (velt-py): 'resolver_auth' config block; pip install 'velt-py[auth]' for the JWT path
sdk = VeltSDK.initialize({
    'database': {'connection_string': os.environ['VELT_DB_URL']},
    'resolver_auth': {'jwt': {'jwks_url': 'https://idp.example.com/.well-known/jwks.json', 'algorithms': ['RS256']}},
})

result = sdk.selfHosting.verifyToken(headers=request.headers)  # or token='<raw_jwt>'
if not result.verified:
    return HttpResponse(status=401)  # result.errorCode says why
```

**Key details:**
- Neither verifier raises for a failed verification; branch on `verified` and read `errorCode` (`MISSING_TOKEN`, `EXPIRED`, `INVALID_SIGNATURE`, `CLAIM_MISMATCH`, `ALGORITHM_NOT_ALLOWED`, `KEY_RESOLUTION_FAILED`, `VERIFICATION_FAILED`, `NOT_CONFIGURED`, `DEPENDENCY_MISSING`).
- Without `resolverAuth` / `resolver_auth`, `verifyToken` returns `NOT_CONFIGURED`; it never passes silently.
- The JWT path needs `jose@^5` (Node) or `velt-py[auth]` (Python); a custom `verify` callback needs neither and takes priority over `jwt`.
- The algorithm allowlist is required; `alg=none` and mixed HS/RS allowlists are rejected; JWKS must be HTTPS.
- For cookie sessions instead of bearer tokens, set `credentials: 'include'` on the endpoint config and validate the session server-side.

**Verification:**
- [ ] Every resolver route verifies the forwarded credential and returns 401 on failure
- [ ] Authorization (tenant or user) is checked against the verified claims, not against the request body alone
- [ ] Short-lived tokens are sent with an async `headers` function, not a static object captured once
- [ ] The verifier's optional dependency is installed for the JWT path

**Source Pointers:**
- https://docs.velt.dev/self-hosting/partial/overview - "Async headers and credentials"
- https://docs.velt.dev/backend-sdks/node#verifytoken - "verifyToken"
- https://docs.velt.dev/backend-sdks/python#resolver-token-verification - "Resolver Token Verification"

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

```sql
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
```

```js
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

**Required indexes (apply to all annotation collections):**

| Index | Columns | Type | Purpose |
|-------|---------|------|---------|
| Primary | `annotationId` | Unique | Upsert and single lookups |
| Filter | `documentId` | Non-unique | Document-scoped queries |
| Filter | `organizationId` | Non-unique | Org-scoped queries |
| Compound | `documentId + organizationId` | Non-unique | Combined filter queries |

**Using a Velt backend SDK instead:** if your provider backend is Node or Python, `@veltdev/node` 2.x and `velt-py` 0.2.x implement this storage for you on MongoDB or PostgreSQL (`database.type: 'postgresql'`). On PostgreSQL they create one table per collection with a single JSONB `data` column and expression indexes, and on MongoDB they retry a concurrent save of the same annotation instead of failing with a duplicate-key error. Hand-roll the patterns below only for other stacks or custom schemas (see `core-python-sdk-setup` and the Node SDK skill).

**Key details:**
- Upsert ensures idempotency — retried saves don't create duplicates
- MongoDB `bulkWrite` with `upsert: true` handles multiple annotations efficiently
- PostgreSQL `ON CONFLICT DO UPDATE` achieves the same result
- Always use parameterized queries in PostgreSQL to prevent SQL injection
- The same pattern applies to comments, reactions, and recordings — all use `annotationId` as the primary key
- Store the full annotation as a JSON column in PostgreSQL (JSONB) for flexibility

**Verification:**
- [ ] Save operations use upsert (not plain insert)
- [ ] Unique index exists on annotationId
- [ ] Indexes on documentId and organizationId for query performance
- [ ] Parameterized queries used (no string concatenation in SQL)
- [ ] Transactions used for multi-annotation saves

**Source Pointers:**
- https://docs.velt.dev/self-hosting/partial/comments - Backend Example (MongoDB, PostgreSQL)
- https://docs.velt.dev/backend-sdks/node#self-hosting-configuration - "How PostgreSQL storage works"
- https://docs.velt.dev/backend-sdks/python#self-hosting-configuration - "How PostgreSQL storage works"

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

```
attachments/{organizationId}/{documentId}/{timestamp}-{filename}
```

This key structure:
- Groups files by organization and document for easy management
- Uses timestamp prefix to avoid name collisions
- Is deterministic enough to reconstruct from metadata for deletion
- Supports bucket lifecycle policies per organization

**Key details:**
- The save response **must** include `{ data: { url } }` — the SDK stores this URL reference in the comment annotation on your database
- Use the same key structure for both upload and delete to enable reconstruction
- Consider using pre-signed URLs for private attachments
- Works with any S3-compatible storage: AWS S3, MinIO, Cloudflare R2, Google Cloud Storage, DigitalOcean Spaces
- Keep AWS credentials in environment variables, never in client-side code

**Verification:**
- [ ] Object keys are deterministic and unique
- [ ] Save response includes `{ data: { url } }`
- [ ] Delete extracts the correct key from the stored URL
- [ ] AWS credentials stored in environment variables
- [ ] File content type preserved during upload

**Source Pointer:** https://docs.velt.dev/self-hosting/partial/attachments - Backend Example

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

```
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

**Key details:**
- All operations use POST method (not GET/PUT/DELETE) because the SDK sends JSON request bodies
- Attachment save is the exception — uses `multipart/form-data` (see attachment-multipart-provider rule)
- User endpoint only has `get` (no save/delete)
- Every response must include `{ data, success, statusCode }`
- Save bodies carry the annotation map (`commentAnnotation`, `reactionAnnotation`, or `recorderAnnotation`) plus `metadata`; delete bodies carry `commentAnnotationId` / `reactionAnnotationId` / `recorderAnnotationId` plus `metadata`. Read `documentId` and `organizationId` from `metadata`
- Authenticate every route before reading or writing (see `backend-verify-resolver-auth`)
- Node and Python backends can hand the raw body to `sdk.selfHosting.*` and return its result directly instead of hand-writing these handlers
- When using REST API to add/update comments externally, set `isCommentResolverUsed: true` and `isCommentTextAvailable: true`

**Verification:**
- [ ] Consistent route pattern across all providers
- [ ] All operations use POST method
- [ ] Context metadata (documentId, organizationId) extracted and stored
- [ ] Error responses return `success: false`
- [ ] Attachment save parses multipart/form-data

**Source Pointers:**
- https://docs.velt.dev/self-hosting/partial/comments - Backend Example
- https://docs.velt.dev/self-hosting/partial/reactions - Backend Example
- https://docs.velt.dev/api-reference/sdk/models/data-models#savecommentresolverrequest - resolver request shapes

---

## 6. Data Types

**Impact: MEDIUM**

Reference for the TypeScript shapes a data provider hands to / receives from the SDK — comment payloads, attachment uploads, reaction records, recording metadata, user contacts. Documents the contract between the SDK and your backend so provider responses don't drift from the SDK's expected shapes.

### 6.1 Self-Hosting Data Type Reference — Provider Interfaces, Config, Request/Response Types

**Impact: MEDIUM (Complete type definitions for all data provider interfaces and resolver types)**

Complete type definitions for all data provider interfaces, configuration types, request/response shapes, and resolver enums.

#### VeltDataProvider (top-level)

```typescript
interface VeltDataProvider {
  comment?: CommentAnnotationDataProvider;
  user?: UserDataProvider;
  reaction?: ReactionAnnotationDataProvider;
  attachment?: AttachmentDataProvider;
  recorder?: RecorderAnnotationDataProvider;
  activity?: ActivityAnnotationDataProvider;
  notification?: NotificationDataProvider;
  anonymousUser?: AnonymousUserDataProvider;
}

// Set via: client.setDataProviders(provider) or <VeltProvider dataProviders={provider}>
```

#### Provider Interfaces

```typescript
interface CommentAnnotationDataProvider {
  get?: (request: GetCommentResolverRequest) => Promise<ResolverResponse<Record<string, PartialCommentAnnotation>>>;
  save?: (request: SaveCommentResolverRequest) => Promise<ResolverResponse<unknown>>;
  delete?: (request: DeleteCommentResolverRequest) => Promise<ResolverResponse<undefined>>;
  config?: ResolverConfig;
}

interface ReactionAnnotationDataProvider {
  get?: (request: GetReactionResolverRequest) => Promise<ResolverResponse<Record<string, PartialReactionAnnotation>>>;
  save?: (request: SaveReactionResolverRequest) => Promise<ResolverResponse<unknown>>;
  delete?: (request: DeleteReactionResolverRequest) => Promise<ResolverResponse<undefined>>;
  config?: ResolverConfig;
}

interface UserDataProvider {
  get?: (userIds: string[]) => Promise<Record<string, User> | ResolverResponse<Record<string, User>>>;
  config?: ResolverConfig;
}

interface AttachmentDataProvider {
  save?: (request: SaveAttachmentResolverRequest) => Promise<ResolverResponse<SaveAttachmentResolverData>>;
  delete?: (request: DeleteAttachmentResolverRequest) => Promise<ResolverResponse<undefined>>;
  config?: ResolverConfig;
}

interface RecorderAnnotationDataProvider {
  get?: (request: GetRecorderResolverRequest) => Promise<ResolverResponse<Record<string, PartialRecorderAnnotation>>>;
  save?: (request: SaveRecorderResolverRequest) => Promise<ResolverResponse<SaveRecorderResolverData | undefined>>;
  delete?: (request: DeleteRecorderResolverRequest) => Promise<ResolverResponse<undefined>>;
  config?: ResolverConfig;
  uploadChunks?: boolean;
  storage?: AttachmentDataProvider;
}

interface NotificationDataProvider {
  get?: (request: GetNotificationResolverRequest) => Promise<ResolverResponse<Record<string, PartialNotification>>>;
  delete?: (request: DeleteNotificationResolverRequest) => Promise<ResolverResponse<undefined>>;
  config?: NotificationResolverConfig;
}

interface ActivityAnnotationDataProvider {
  get?: (request: GetActivityResolverRequest) => Promise<ResolverResponse<Record<string, PartialActivityRecord>>>;
  save?: (request: SaveActivityResolverRequest) => Promise<ResolverResponse<undefined>>;
  config?: ResolverConfig;
}

interface AnonymousUserDataProvider {
  resolveUserIdsByEmail: (request: ResolveUserIdsByEmailRequest) => Promise<ResolverResponse<Record<string, string>>>;
  config?: AnonymousUserDataProviderConfig;
}
```

#### Configuration Types

```typescript
interface ResolverConfig {
  resolveTimeout?: number;
  saveRetryConfig?: RetryConfig;
  deleteRetryConfig?: RetryConfig;
  getRetryConfig?: RetryConfig;
  resolveUsersConfig?: ResolveUsersConfig;
  getConfig?: ResolverEndpointConfig;
  saveConfig?: ResolverEndpointConfig;
  deleteConfig?: ResolverEndpointConfig;
  additionalFields?: string[];     // Copy fields to resolver while keeping in Velt storage
  fieldsToRemove?: string[];       // Move custom fields out of Velt DB (comment, reaction, recorder, activity)
  additionalSaveEvents?: AdditionalSaveEventConfig[]; // Comment resolver only: opt-in non-core save events
}

interface AdditionalSaveEventConfig {
  event: CommentResolverSaveEvent; // e.g. 'comment_annotation.status_change' (string-literal union)
}

interface ResolverEndpointConfig {
  url: string;
  headers?: Record<string, string> | (() => Promise<Record<string, string>>); // async fn: resolved per request and per retry
  credentials?: 'include' | 'same-origin' | 'omit';                       // forwarded to fetch()
}

interface ResolverResponse<T> {
  data?: T;
  success: boolean;
  message?: string;
  timestamp?: number;
  statusCode: number;              // Must be 200
  signature?: string;
}

interface RetryConfig {
  retryCount?: number;
  retryDelay?: number;             // Milliseconds
  revertOnFailure?: boolean;
}

interface ResolveUsersConfig {
  organization?: boolean;          // Resolve org users
  folder?: boolean;                // Resolve folder users
  document?: boolean;              // Resolve document users
}

interface NotificationResolverConfig {
  resolveTimeout?: number;
  getRetryConfig?: RetryConfig;
  deleteRetryConfig?: RetryConfig;
  getConfig?: ResolverEndpointConfig;
  deleteConfig?: ResolverEndpointConfig;
}

interface AnonymousUserDataProviderConfig {
  resolveTimeout?: number;
  getRetryConfig?: RetryConfig;
}

interface SaveAttachmentResolverData {
  url: string;                     // URL where the file can be accessed
}
```

#### Request Types

```typescript
// Comments
interface GetCommentResolverRequest {
  organizationId: string; commentAnnotationIds?: string[]; documentIds?: string[]; folderId?: string; allDocuments?: boolean;
}
interface SaveCommentResolverRequest {
  commentAnnotation: Record<string, PartialCommentAnnotation>; metadata?: BaseMetadata;
  event?: ResolverActions | CommentResolverSaveEvent | string; commentId?: string;
  targetComment?: PartialComment; // request context only; never persist it
}
interface DeleteCommentResolverRequest {
  commentAnnotationId: string; metadata?: BaseMetadata; event?: ResolverActions;
}

// Reactions
interface GetReactionResolverRequest {
  organizationId: string; reactionAnnotationIds?: string[]; documentIds?: string[]; folderId?: string; allDocuments?: boolean;
}
interface SaveReactionResolverRequest {
  reactionAnnotation: Record<string, PartialReactionAnnotation>; metadata?: BaseMetadata; event?: ResolverActions;
}
interface DeleteReactionResolverRequest {
  reactionAnnotationId: string; metadata?: BaseMetadata; event?: ResolverActions;
}

// Attachments
interface SaveAttachmentResolverRequest { file: File; metadata?: AttachmentResolverMetadata; }
interface DeleteAttachmentResolverRequest { url: string; }

// Recordings
interface GetRecorderResolverRequest {
  organizationId: string; recorderAnnotationIds?: string[]; documentIds?: string[];
}
interface SaveRecorderResolverRequest {
  recorderAnnotation: Record<string, PartialRecorderAnnotation>; metadata?: BaseMetadata; event?: ResolverActions;
}
interface DeleteRecorderResolverRequest {
  recorderAnnotationId: string; metadata?: BaseMetadata; event?: ResolverActions;
}

// Notifications
interface GetNotificationResolverRequest { organizationId: string; notificationIds?: string[]; documentId?: string; }
interface DeleteNotificationResolverRequest { notificationId: string; metadata?: BaseMetadata; event?: ResolverActions; }

// Activity
interface GetActivityResolverRequest { organizationId: string; activityIds?: string[]; documentIds?: string[]; allDocuments?: boolean; }
interface SaveActivityResolverRequest { activity: Record<string, PartialActivityRecord>; metadata?: BaseMetadata; event?: ResolverActions; }

// Users
interface GetUserResolverRequest { organizationId: string; userIds: string[]; }
interface ResolveUserIdsByEmailRequest { organizationId: string; documentId?: string; folderId?: string; emails: string[]; }
```

#### Partial Data Types (PII stored on your infrastructure)

```typescript
interface PartialCommentAnnotation {
  annotationId: string; metadata?: BaseMetadata; comments: Record<string, PartialComment>;
}
interface PartialComment {
  commentId: string | number; commentHtml?: string; commentText?: string;
  attachments?: Record<number, PartialAttachment>; from?: PartialUser;
  to?: PartialUser[]; taggedUserContacts?: PartialTaggedUserContacts[];
}
interface PartialTaggedUserContacts { userId: string; contact?: PartialUser; text?: string; }
interface PartialAttachment { url: string; name: string; attachmentId: number; }
interface PartialReactionAnnotation { annotationId: string; /* reaction data */ }
interface PartialRecorderAnnotation {
  annotationId: string; from?: PartialUser; attachment?: ResolverAttachment;
  attachments?: ResolverAttachment[]; transcription?: string;
  recordingEditVersions?: Record<number, PartialRecorderAnnotationEditVersion>;
}
interface PartialNotification { /* custom notification content fields */ }
interface PartialActivityRecord { id: string; metadata?: BaseMetadata; changes?: ActivityChanges; entityData?: unknown; entityTargetData?: unknown; displayMessageTemplateData?: Record<string, unknown>; }

interface ResolverAttachment { attachmentId: number; file: File; name?: string; metadata?: AttachmentResolverMetadata; mimeType?: string; }
interface AttachmentResolverMetadata { organizationId: string | null; documentId: string | null; folderId?: string | null; attachmentId: number | null; commentAnnotationId: string | null; apiKey: string | null; }
```

#### Resolver Enums

```typescript
enum ResolverActions {
  COMMENT_ANNOTATION_ADD = 'comment_annotation.add',
  COMMENT_ANNOTATION_DELETE = 'comment_annotation.delete',
  COMMENT_ADD = 'comment.add',
  COMMENT_DELETE = 'comment.delete',
  COMMENT_UPDATE = 'comment.update',
  REACTION_ADD = 'reaction.add',
  REACTION_DELETE = 'reaction.delete',
  ATTACHMENT_ADD = 'attachment.add',
  ATTACHMENT_DELETE = 'attachment.delete',
  RECORDER_ANNOTATION_ADD = 'recorder_annotation.add',
  RECORDER_ANNOTATION_UPDATE = 'recorder_annotation.update',
  RECORDER_ANNOTATION_DELETE = 'recorder_annotation.delete',
}

enum UserResolverModuleName { IDENTIFY = 'identify/authProvider', GET_TEMPORARY_USERS = 'getTemporaryUsers', GET_USERS = 'getUsers', GET_HUDDLE_USERS = 'getHuddleUsers', GET_SINGLE_EDITOR_USERS = 'getSingleEditorUsers' }
enum CommentResolverModuleName { SET_DOCUMENTS = 'setDocuments', GET_COMMENT_ANNOTATIONS = 'getCommentAnnotations', GET_NOTIFICATIONS = 'getNotifications' }
enum ReactionResolverModuleName { SET_DOCUMENTS = 'setDocuments', GET_REACTION_ANNOTATIONS = 'getReactionAnnotations' }
enum RecorderResolverModuleName { GET_RECORDER_ANNOTATIONS = 'getRecorderAnnotations' }
```

#### Per-Feature Field Inventory (`Partial<X>` PII payloads)

Each provider's `save` handler receives a `Partial<X>` shape — the SDK strips PII on the frontend before any write reaches Velt and hands only this payload to your DB. The note vocabulary used below: **kept** (sent to Velt verbatim), **reduced** (user → `{ userId }` before any write to Velt), **never sent to Velt** (stripped on the frontend before any request — value goes only to your DB or is recomputed on the client), **copied-not-moved** (sent to both), **@deprecated** (kept for back-compat; do not rely on it).

##### `PartialCommentAnnotation` (your DB)

```typescript
interface PartialCommentAnnotation {
  annotationId: string;                                  // join key; also in Velt's DB
  metadata?: BaseMetadata;                               // getClientMetadata(data.metadata ?? {})
  comments: Record<string | number, PartialComment>;    // re-keyed array → map; required (defaults to {})
  from?: PartialUser;                                    // { userId }; copied-not-moved
  assignedTo?: PartialUser;                              // { userId }; copied-not-moved
  targetTextRange?: { text: string };                    // only the .text sub-field is withheld from Velt
  resolvedByUserId?: string | null;                      // copied-not-moved
  // plus any keys listed in config.fieldsToRemove (truthy-gated) and config.additionalFields (!== undefined)
}

interface PartialComment {
  commentId: string | number;                            // always sent
  commentHtml?: string;                                  // PII — never sent to Velt (only-if-truthy)
  commentText?: string;                                  // PII — never sent to Velt (only-if-truthy)
  attachments?: Record<number, PartialAttachment>;       // only when the attachment resolver is also active
  from?: PartialUser;                                    // only if truthy
  to?: PartialUser[];                                    // @mentioned users
  taggedUserContacts?: { userId: string; contact?: { userId: string }; text?: string }[];
}
```

##### `PartialReactionAnnotation` (your DB)

```typescript
interface PartialReactionAnnotation {
  annotationId: string;                                  // join key
  metadata?: BaseMetadata;                               // getClientMetadata(annotation.metadata ?? {})
  icon: string;                                          // the only relocated field — never sent to Velt
  from?: PartialUser;                                    // { userId } — reaction author; copied-not-moved
}
```

The canonical field names on `PartialReactionAnnotation` are `icon` and `from`. Older docs and flow prose sometimes paraphrased these as "emoji" and "user"; that vocabulary is historical only — the wire payload, the SDK contract, and the Python `PartialReactionAnnotation` dataclass all use `icon` and `from` (`from_` on the Python side, since `from` is a keyword).

`icon` is the only field withheld from Velt; the strip operates on the emoji-code `icon` only. Per-element `Reaction` entries on the Velt-side `reactions[]` carry their own `variant` field — they are kept verbatim and are not part of the `Partial` payload.

##### `PartialRecorderAnnotation` (your DB)

```typescript
interface PartialRecorderAnnotation {
  annotationId: string;                                  // join key
  metadata?: BaseMetadata;                               // getClientMetadata(data.metadata)
  from?: User;                                           // full user object (PII); deep-cloned
  transcription?: Transcription;                         // entire object → your DB, never sent to Velt
  attachment?: Attachment | null;                        // @deprecated; value written as null on Velt's side
  attachments?: Attachment[];                            // full list incl. URLs — Velt keeps only stubs { attachmentId, name }
  recordingEditVersions?: Record<number, PartialRecorderAnnotationEditVersion>;
  isUrlAvailable?: boolean;                              // copied-not-moved
  // plus config.additionalFields
}

interface Transcription {
  from: User;                                            // required
  lastUpdated?: number;
  srtBucketPath?: string; srtUrl?: string;
  vttBucketPath?: string; vttUrl?: string;
  transcriptedText?: string;                             // PII
  transcriptionLatency?: number;
}
```

Velt keeps each `attachments[]` entry as a stub `{ attachmentId, name }`; `url` and the other PII fields are stripped.

##### `PartialNotification` (your DB — custom notifications only)

```typescript
interface PartialNotification {
  notificationId: string;                                // join key; the only non-PII field
  displayHeadlineMessageTemplate?: string;               // PII; your DB only
  displayHeadlineMessageTemplateData?: {
    actionUser?: User;
    recipientUser?: User;
    actionMessage?: string;
    [key: string]: any;
  };
  displayBodyMessage?: string;                           // PII; your DB only
  displayBodyMessageTemplate?: string;                   // PII; your DB only
  displayBodyMessageTemplateData?: { [key: string]: any };
  notificationSourceData?: any;                          // your custom source payload
  [key: string]: any;                                    // any extra custom fields merged verbatim on read
}
```

This is **read-only enrichment** — there is no write-side strip and no `save`. The PII is never written to Velt at all; it lives in your backend and is fetched on read.

##### `PartialActivityRecord` (your DB — append-only)

```typescript
interface PartialActivityRecord {
  id: string;                                            // correlation key (same as ActivityRecord.id)
  metadata?: BaseMetadata;                               // getClientMetadata subset
  changes?: ActivityChanges;                             // for comment activities: { commentText: { from, to } } only
  entityData?: unknown;                                  // PartialReaction… / PartialRecorder… — only when matching feature resolver active
  entityTargetData?: unknown;                            // sub-entity PII snapshot (e.g. comment fields)
  displayMessageTemplateData?: Record<string, unknown>;  // custom-activity template values
  [key: string]: any;                                    // top-level keys listed in fieldsToRemove (all feature types)
}
```

`displayMessage` is **always recomputed on the client** from the template + values — stored in neither DB.

##### Attachment upload payload (handed to your storage provider)

```typescript
interface SaveAttachmentResolverRequest {
  file: File;                                            // raw binary — sent only to your storage, never to Velt
  attachment: {
    attachmentId: number;                                // required
    name?: string;
    mimeType?: string;
  };
  metadata: AttachmentResolverMetadata;                  // routing context
  event?: ResolverActions;                               // e.g. ATTACHMENT_ADD / ATTACHMENT_DELETE
}

interface AttachmentResolverMetadata {
  organizationId: string | null;
  documentId: string | null;
  folderId?: string | null;                              // optional + nullable
  attachmentId: number | null;
  commentAnnotationId: string | null;                    // dropped on delete
  apiKey: string | null;
}

// Required return shape
interface SaveAttachmentResolverData { url: string; }
```

There is no `Partial<X>` strip and no `get` for attachments — they are binary files. The `file` is destructured out and sent as binary to your storage; the JSON request body is exactly `{ attachment: { attachmentId, name, mimeType }, metadata, event }`. Velt receives the returned `url` plus the structural fields on the `Attachment` record (`size`, `type`, `thumbnail`, etc.).

#### Shared building blocks

These nested types are referenced from every feature payload above.

##### `BaseMetadata`

```typescript
interface BaseMetadata {
  apiKey?: string;
  documentId?: string;                                   // Velt-internal hashed id (auto-derived)
  clientDocumentId?: string;                             // raw id you passed; dropped from the client-facing copy
  organizationId?: string;                               // Velt-internal hashed id
  clientOrganizationId?: string;                         // raw id you passed; dropped from the client-facing copy
  folderId?: string;                                     // auto-derived from veltFolderId
  veltFolderId?: string;                                 // Velt-internal; not in the client-facing copy
  documentMetadata?: DocumentMetadata;
  sdkVersion?: string | null;
}
```

`getClientMetadata` transform (used for every payload sent to your DB): `clientDocumentId → documentId`, `clientOrganizationId → organizationId`; `veltFolderId` / `parentVeltFolderId` / `pageInfo` dropped; `folderId` included only when truthy.

##### `User` / `PartialUser`

```typescript
type PartialUser = { userId: string };                   // the "reduced" shape — what Velt sees
```

The full `User` object (name / email / avatar / `photoUrl`) is **never sent to Velt** when the `user` provider is active; only `{ userId }` is written.

##### `Location` and `Version`

```typescript
interface Location {
  id?: string;
  locationName?: string;
  version?: { id: string; name: string };
  [key: string]: any;                                    // arbitrary custom keys — kept
}
```

##### `TargetElement`

```typescript
interface TargetElement {
  xpath?: string;
  fXpath?: string;                                       // full XPath
  cfXpath?: string;                                      // full XPath with class names
  topPercentage?: number;                                // default 0
  leftPercentage?: number;                               // default 0
  anchor?: AnchorRecord | null;
  targetText?: string;                                   // IS sent to Velt — the readable anchor text
}
```

Notable: `TargetElement.targetText` **IS** sent to Velt verbatim. The similarly named `targetTextRange.text` is **NOT** — see `TargetTextRange` below.

##### `TargetTextRange`

```typescript
interface TargetTextRange {
  commonAncestorContainer?: string;
  commonAncestorContainerFXpath?: string;
  commonAncestorContainerCFXpath?: string;
  commonAncestorContainerAnchor?: AnchorRecord;
  text?: string;                                         // never sent to Velt for comments (→ your DB) — only sub-field withheld
  occurrence?: number;                                   // default 1
}
```

##### `CursorPosition`

```typescript
interface CursorPosition {
  top: number;                                           // default 0
  left: number;                                          // default 0
  parentScaleX?: number;                                 // transform handling
  parentScaleY?: number;
  transformContext?: any;
}
```

##### `PageInfo`

```typescript
interface PageInfo {
  url?: string;
  path?: string;
  queryParams?: string;
  baseUrl?: string;
  title?: string;
  arrowUrl?: string; areaUrl?: string; commentUrl?: string; tagUrl?: string; recorderUrl?: string;
  screenWidth?: number;
  deviceInfo?: IDeviceInfo;
}
```

##### `CommentAnnotationViews`

```typescript
interface CommentAnnotationViews {
  views: Record<string, { timestamp: number }>;          // per-userId annotation view timestamps
  comments: Record<string | number, {
    views: Record<string, { timestamp: number }>;        // per-userId per-comment view timestamps
  }>;
  metadata?: BaseMetadata;
}
```

#### Resolver flags (set in Velt's DB; never sent from your side)

The SDK sets these on the Velt-side record whenever PII was withheld for the corresponding feature. They are signals to clients that the resolver enrichment must run before the record is fully renderable.

`isCommentResolverUsed` · `isReactionResolverUsed` · `isRecorderResolverUsed` · `isNotificationResolverUsed` · `isActivityResolverUsed` · `isAttachmentResolverUsed`

**Verification:**
- [ ] All provider interfaces match the VeltDataProvider shape
- [ ] ResolverResponse always has `success: boolean` and `statusCode: number`
- [ ] Request types match the operation (get/save/delete)
- [ ] Partial types include only the PII fields stored on your infrastructure
- [ ] `BaseMetadata` payloads sent to your DB go through `getClientMetadata` (raw `clientDocumentId` → `documentId`)
- [ ] `TargetElement.targetText` is kept (sent to Velt); `targetTextRange.text` is stripped to your DB only
- [ ] Recorder attachment stubs are reduced to `{ attachmentId, name }`; `url` is never sent to Velt

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/models/data-models#resolverconfig - "ResolverConfig", "ResolverEndpointConfig", "AdditionalSaveEventConfig"
- https://docs.velt.dev/self-hosting/partial/field-inventory - "Complete Field Inventory"

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

**Key points:**

- `saveAttachment(request, file_data=..., file_name=..., mime_type=...)`: the typed request first, then the file as keyword arguments. Read the file as bytes.
- Only the save endpoint is multipart; delete receives JSON.
- The S3 bucket must exist and the credentials need `s3:PutObject` and `s3:DeleteObject`.
- Return the SDK result dict unchanged so the frontend gets `success`, `statusCode`, and `data`.

**Verification:**
- [ ] `aws` uses `bucket_name`, `region`, `access_key_id`, `secret_access_key`
- [ ] The save route parses multipart (`file` + `request` JSON string); the delete route parses JSON
- [ ] Requests are built with `SaveAttachmentResolverRequest.from_dict(...)` / `DeleteAttachmentResolverRequest.from_dict(...)`
- [ ] `file_data` is bytes and `mime_type` comes from the upload
- [ ] The response dict is returned as-is with its `statusCode`

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/python#attachments - "Attachments" (saveAttachment, deleteAttachment; Django, Flask, FastAPI tabs)
- https://docs.velt.dev/backend-sdks/python#self-hosting-configuration - "AWS (Attachments)"

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
```

**Response format.** `VeltSelfHostingResponse` is a plain dict with camelCase keys:

```python
{'success': True, 'statusCode': 200, 'data': {...}}
{'success': False, 'statusCode': 400, 'error': '...', 'errorCode': 'INVALID_INPUT'}  # or NOT_FOUND / INTERNAL_ERROR
```

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

**Verification:**
- [ ] Every handler builds its request with `<RequestType>.from_dict(body)` from the unmodified frontend body
- [ ] The SDK response dict is returned as-is, with `statusCode` as the HTTP status
- [ ] Save handlers do not persist `targetComment`, and tolerate `event` values beyond `ResolverActions`
- [ ] Custom code distinguishes `UNSET` from `None` for `resolvedByUserId`
- [ ] Every route authenticates the caller first (see `backend-verify-resolver-auth`)

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/python#comments - "Comments"
- https://docs.velt.dev/backend-sdks/python#data-models - "Data Models" (PartialCommentAnnotation, UNSET Sentinel, SaveCommentResolverRequest)
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltselfhostingresponse - "VeltSelfHostingResponse"

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
```

```python
# settings.py
import os
VELT_SDK_CONFIG = {
    'database': {'connection_string': os.environ.get('VELT_MONGODB_CONNECTION_STRING')},
    'apiKey': os.environ.get('VELT_API_KEY'),
    'authToken': os.environ.get('VELT_AUTH_TOKEN'),
}
```

```python
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

**Key points:**

- Install the database extra your config uses (`velt-py[mongodb]` or `velt-py[postgres]`); Django 4.2.26+ is required only for the self-hosting backend.
- Multi-process servers (gunicorn, uWSGI) open one pool per worker; under uWSGI enable threads (`--enable-threads`).
- Django resolver views need `@csrf_exempt` because the Velt frontend posts to them directly; authenticate them with `sdk.selfHosting.verifyToken` instead (see `backend-verify-resolver-auth`).
- Load credentials from environment variables.

**Verification:**
- [ ] The SDK is initialized once per process (module level or a lazy singleton), never inside a handler
- [ ] Handlers return the SDK result dict unchanged with `status=result.get('statusCode', 200)`
- [ ] Django resolver views use `@csrf_exempt` and `@require_http_methods(["POST"])`
- [ ] Requests are built with `from_dict` from the raw JSON body
- [ ] The database extra matching `database.type` is installed

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/python#framework-examples - "Framework Examples"
- https://docs.velt.dev/backend-sdks/python#requirements - "Requirements"

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

**Key points:**

- `userId`, `userProperties` (with `name` and `email`; optional `isAdmin`), and `permissions` are required.
- Each resource has `type`, `id`, optional `accessRole`, optional `expiresAt`, and `organizationId` (required for `document` and `folder` resources).
- Read the token from `result['result']['data']['token']`; check for an `error` key first.
- Return the token only to the authenticated user's session; never log it.

**Verification Checklist:**
- [ ] No `getToken` calls and no `sdk.selfHosting.token` / `sdk.api.token` references remain
- [ ] `GenerateTokenRequest` is imported from `velt_py.models.access_control`
- [ ] `userProperties` includes `name` and `email`; document and folder resources include `organizationId`
- [ ] The response is read as a dict with `error` checked before `result`

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/python#generatetoken - "Access Control > generateToken"
- https://docs.velt.dev/api-reference/sdk/models/data-models#generatetokenrequest - "GenerateTokenRequest"
- https://docs.velt.dev/api-reference/rest-apis/v2/auth/generate-token - "Generate Token"

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

```python
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

**Behavior worth remembering:**
- `getCommentAnnotations` accepts agent filters (`agentId`, `executionId`, `agentType`, `agentSource`, `agentSuggestions`, `agentComments`), at most one per request; `deleteCommentAnnotations` accepts `agentId`, `agentUrls`, `agentSuggestions`, which combine. Both need advanced queries on the workspace and fail closed otherwise. Counts do not support agent filters.
- `getDocumentsCount(GetDocumentsCountRequest(...))` accepts `excludeFolderDocs`, `folderId`, or metadata `filters` (max 10); `filters` cannot be combined with `excludeFolderDocs`, and `filtersApplied: False` in the response means `count` is an unfiltered fallback.
- Workflow definitions express routing and loops as edges. Every `human` node needs an outgoing `on: 'reject'` edge. `loops` is deprecated: it is stripped before sending and raises a `DeprecationWarning`; use a reject back-edge with `{'loop': {'maxIterations': 3}}`. The delete-definition request accepts `purge` to hard-delete.
- Import request dataclasses from `velt_py.models.<domain>` (for example `organization`, `document`, `user_api`, `activity_api`, `access_control`, `workspace`, `workflow`).
- `sdk.api.*` and `sdk.selfHosting.*` can share one SDK instance when a `database` block is also configured.

**Verification Checklist:**
- [ ] `VeltSDK.initialize` has `apiKey` and `authToken` (or `VELT_API_KEY` / `VELT_AUTH_TOKEN`) and no `database` block for REST-only services
- [ ] Request dataclasses come from `velt_py.models.<domain>`; method names are camelCase and match the Python docs
- [ ] No `sdk.api.token`, `sdk.api.agents`, or `sdk.api.memory` calls
- [ ] `filter_unknown_fields=True` is passed as a keyword argument, not inside the request
- [ ] Workflow definitions use reject edges, not `loops`
- [ ] The `error` key is checked before reading `result`

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/python#rest-api-backend - "REST API Backend"
- https://docs.velt.dev/backend-sdks/python#workflow - "Workflow"
- https://docs.velt.dev/release-notes/version-5/velt-py-changelog - "v0.1.15", "v0.1.11"

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

**Key points:**

- Users are read-only through the SDK resolvers; seed your users collection (or table) yourself, using the field names mapped in `user_schema`.
- `resolveUserIdsByEmail` is new in v0.1.15; `ResolveUserIdsByEmailRequest` lives in `velt_py.models.user`.
- `VeltSelfHostingResponse` is a plain dict: use `response['success']`, `response['data']`, `response['errorCode']`.
- Return the SDK response to the client as-is so the frontend receives `success`, `statusCode`, and `data`.

**Verification:**
- [ ] Request objects are built with `from_dict(body)` from the unmodified frontend body
- [ ] The anonymous-user provider endpoint calls `resolveUserIdsByEmail`
- [ ] Responses are returned unchanged, with `statusCode` as the HTTP status
- [ ] Reaction code uses `from_` (wire key `from`), never `user` (see below)

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/python#users - "Users" (getUsers, resolveUserIdsByEmail)
- https://docs.velt.dev/backend-sdks/python#reactions - "Reactions"

---

#### PartialReactionAnnotation Model (v0.1.12)

`PartialReactionAnnotation` is the Python dataclass that resolvers emit when handing a reaction-annotation payload to your DB. Import it from `velt_py.models.reaction`. Starting in **v0.1.12**, the reaction-author field is `from_` (wire key `from`), replacing the former `user` field — aligning with the velt-sdk contract and `PartialCommentAnnotation`.

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

**Field notes:**

- `from_` — Python alias for the JSON key `from` (reserved keyword); serialized as `from`. Replaces the former `user` field (renamed in v0.1.12 to match the velt-sdk contract and the comment models).
- `icon` — the emoji code carried in the partial payload (e.g. `'+1'`).
- `extra_fields` — catch-all because the frontend contract includes `[key: string]: any` for customer-configured custom keys.

---

#### v0.1.12 Rename: `user` → `from_` (Wire: `from`) on PartialReactionAnnotation

In v0.1.12 the reaction-author field on `PartialReactionAnnotation` was renamed from `user` to `from_`. The wire key on the serialized document is now `from` (matching `PartialCommentAnnotation`). Construction with `user=` no longer works — call sites must pass `from_=`. Reads remain backward-compatible: `from_dict()` accepts either the canonical `from` key or the legacy `user` key (`from` wins when both are present) and populates `from_`. `to_dict()` always emits `from`. No data migration is required for reaction documents already stored under `user`.

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

**Key points:**

- Construction: only `from_=` works on v0.1.12. `user=` raises `TypeError`.
- Serialization (`to_dict()`): always emits `from`. Existing readers that key off `user` must be updated when they ingest newly-written documents.
- Deserialization (`from_dict()`): accepts both `from` and `user`. `from` wins when both are present. This is the back-compat hatch for documents already in your DB — no migration required.
- Attribute access: the field is exposed in Python as `from_` (with the trailing underscore), because `from` is a Python keyword.
- The rename aligns `PartialReactionAnnotation` with `PartialCommentAnnotation`, where the author field has long been `from_` / wire `from`.

**Verification:**
- [ ] All `PartialReactionAnnotation(...)` constructors use `from_=`, not `user=`
- [ ] Any consumer that reads `ann.user` is updated to read `ann.from_`
- [ ] Any consumer that reads `to_dict()['user']` is updated to read `to_dict()['from']`
- [ ] `from_dict()` paths are left as-is — they already accept the legacy `user` key
- [ ] `velt-py` is pinned to `>= 0.1.12`

**Source Pointer:** https://docs.velt.dev/backend-sdks/python#partialreactionannotation - "PartialReactionAnnotation"

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

```jsx
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
```

For non-React frameworks the subscription shape is identical — use the global `Velt` instance:

```javascript
const subscription = Velt.on('dataProvider').subscribe((event) => {
  console.log('Data Provider Event:', event);
  console.log('Module Name:', event.moduleName);
});

// Unsubscribe when done
subscription?.unsubscribe();
```

**Common issues revealed by monitoring:**

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Timeout events | `resolveTimeout` too low | Increase timeout to match backend p99 |
| Response format errors | Missing `success` or `statusCode` | Return standard `{ data, success, statusCode }` |
| Attachment save failures | Backend expecting JSON | Parse `multipart/form-data` for attachment save |
| Data not persisting | Provider set after `identify()` | Move `dataProviders` to VeltProvider prop |
| Get returns empty | Wrong query structure | Check documentId/organizationId extraction |

**Important: email notifications with self-hosted data**

When self-hosting comment data, SendGrid email notifications are not available. Instead:
1. Enable webhooks for comment events (mentions, replies)
2. Webhook payload includes annotation IDs (not content)
3. Query your database for the actual comment content
4. Assemble and send emails via your own email provider

For deeper inspection beyond log output, use the [Velt Chrome DevTools extension](https://chromewebstore.google.com/detail/velt-devtools/nfldoicbagllmegffdapcnohakpamlnl) — it surfaces the same provider events plus internal SDK state.

**Verification:**
- [ ] `dataProvider` subscription active during development
- [ ] Events log `event.moduleName` (so you can tell which provider triggered each call)
- [ ] Events show successful roundtrips for all operations
- [ ] No timeout or format errors in the logs
- [ ] Subscription cleaned up on unmount
- [ ] Webhook-based email notifications set up if needed

**Source Pointer:** https://docs.velt.dev/self-hosting/partial/overview - "Debugging"; https://docs.velt.dev/self-hosting/partial/comments - Debugging, Email Notifications

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

**Full self-hosting constraints to state up front:**
- Generally available on **GCP + Firebase only**. AWS and Azure are in closed beta (Azure added in v6.0.13); access is granted case by case.
- Deployment is agent-driven: hand an AI coding agent the GCP Install guide and Reference pages, plus your inputs (`PROJECT_ID`, `REGION`, `PROFILE`, `OPT_IN_MODULES`, owner email, console and CDN origins). Do not invent your own procedure or bake component versions into runbooks; pins come from the signed umbrella manifest (`velt-selfhost-manifest`) at run time.
- Five human steps remain: link billing, create the Google OAuth client, sign off the image scan, add DNS (custom domains only), and do the first console sign-in.
- Gemini and Anthropic API keys are required even on the `core` profile; placeholders pass install and then fail at runtime.
- Keep `velt-selfhost-state.json` after every phase so a fresh session can resume. Upgrades are deltas run from the Upgrade guide, not reinstalls.
- Features follow the deployment profile (`core`, `core+recording`, `core+ai+agents`, `full`, plus opt-in modules); features whose modules are not deployed are gated in the console and inert in the SDK.

This skill does not reproduce the install or upgrade runbooks. Point the user, or their agent, at the docs pages below.

**Verification:**
- [ ] The requirement (PII off Velt vs zero Velt runtime dependency) was identified before choosing an approach
- [ ] Partial self-hosting work uses `dataProviders` and the rules in this skill; full self-hosting work follows the GCP Install guide
- [ ] Full self-hosting plans assume GCP + Firebase unless the team has AWS or Azure closed-beta access
- [ ] Real Gemini and Anthropic keys and the five human steps are planned for

**Source Pointers:**
- https://docs.velt.dev/self-hosting/full/overview - "Full vs partial self-hosting", "Limitations", "Supported clouds"
- https://docs.velt.dev/self-hosting/full/gcp/overview - "Get Started on GCP"
- https://docs.velt.dev/self-hosting/full/gcp/install - "Install guide"
- https://docs.velt.dev/self-hosting/full/gcp/upgrade - "Upgrade guide"
- https://docs.velt.dev/self-hosting/partial/overview - "Partial self-hosting overview"

---

### 9.2 Wire the App to a Full Self-Hosted Deployment with config.selfHosted

**Impact: HIGH (Without selfHosted the SDK served from your CDN still sends data to Velt SaaS; a wrong CDN path or missing CORS stops the SDK from loading)**

Serving the SDK from your CDN only moves code. Runtime still defaults to Velt SaaS endpoints until you pass `selfHosted`. The install generates `velt-selfhosted-config.json` (Phase 5.1): public URLs, the web-app `firebaseConfig`, and the module list, with no secrets. Import it; do not hand-type endpoint URLs.

**Incorrect:**

```tsx
<VeltProvider
  apiKey="..."
  config={{
    proxyDomain: 'https://static.acme.com/lib/sdk@6.0.0', // WRONG: origin only; the SDK adds the path
    // WRONG: no version and no selfHosted, so data still goes to Velt SaaS
  }}
>
```

```json
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

**`selfHosted` semantics:**

| Field | Behavior |
|---|---|
| `strict: true` | Endpoints you did not inject resolve to an inert `velt://self-hosted-disabled/<name>` sentinel (zero egress). Required for full self-hosting. |
| `strict: false` / omitted | Unspecified endpoints fall back to Velt SaaS defaults. Not acceptable for full self-hosting. |
| `deploymentProfile` | Must equal Terraform's resolved `enabledModules` from `velt-deployment-profile.json`, copied verbatim, never re-derived. Endpoints for absent modules stay inert. |
| `cloudFunction.*` | Absolute Cloud Run base URLs; module-gated keys appear only when provisioned. |
| `firebaseConfig` | Use the Terraform-emitted web app config, not the console-patched copy whose `authDomain` points at the console host. |
| `dataRegions` | Optional. Mirror it verbatim only if tfvars set it; omitted and `[]` are different fleets. |

**CDN rules that break production if violated:**
1. Path is exactly `/lib/sdk@<version>/velt.js` (the `@` is literal), with all chunks flat in that directory.
2. Every `.js` file sends `Access-Control-Allow-Origin` (your app origin or `*`). Missing CORS is the most common failure.
3. CSP allows your CDN in `script-src`; remove `cdn.velt.dev` after cutover.

**Definition of done:** console sign-in as a seeded admin works; the app loads `velt.js` and its chunks from your CDN and `window.Velt.version` matches the pin; a new comment appears in the console data browser; a Network audit of the app and console shows no requests to `velt.dev` or other Velt-owned hosts.

**Verification:**
- [ ] `selfHosted` is imported from the generated `velt-selfhosted-config.json`
- [ ] `selfHosted.strict` is `true` and `deploymentProfile` equals the resolved `enabledModules`
- [ ] `proxyDomain` is an origin only and `version` matches the folder on the CDN
- [ ] CDN path, CORS, and CSP rules above hold
- [ ] The Network audit shows zero requests to Velt-owned hosts

**Source Pointers:**
- https://docs.velt.dev/self-hosting/full/gcp/overview - "Wire your app", "Confirm it is done", "Troubleshooting"
- https://docs.velt.dev/self-hosting/full/gcp/reference#sdk-selfhosted-config - "SDK selfHosted config"
- https://docs.velt.dev/self-hosting/full/gcp/reference#deployment-profiles - "Deployment profiles"

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
