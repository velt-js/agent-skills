# Velt Self Hosting Data Best Practices

**Version 1.0.3**  
Velt  
March 2026

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
   - 5.1 [Implement Database Storage with Upsert and Proper Indexing](#51-implement-database-storage-with-upsert-and-proper-indexing)
   - 5.2 [Store and Delete Attachments in S3-Compatible Object Storage](#52-store-and-delete-attachments-in-s3-compatible-object-storage)
   - 5.3 [Structure Backend API Routes for Data Provider Endpoints](#53-structure-backend-api-routes-for-data-provider-endpoints)

6. [Data Types](#6-data-types) — **MEDIUM**
   - 6.1 [Self-Hosting Data Type Reference — Provider Interfaces, Config, Request/Response Types](#61-self-hosting-data-type-reference-provider-interfaces-config-requestresponse-types)

7. [Python SDK](#7-python-sdk) — **HIGH**
   - 7.1 [Attachment Upload and Delete via Python SDK with S3](#71-attachment-upload-and-delete-via-python-sdk-with-s3)
   - 7.2 [Comments CRUD Operations via Python SDK](#72-comments-crud-operations-via-python-sdk)
   - 7.3 [Django, Flask, and FastAPI Integration Patterns](#73-django-flask-and-fastapi-integration-patterns)
   - 7.4 [Generate Auth Tokens via sdk.selfHosting.token.getToken](#74-generate-auth-tokens-via-sdkselfhostingtokengettoken)
   - 7.5 [Use sdk.api.* for REST API Operations Without a Database](#75-use-sdkapi-for-rest-api-operations-without-a-database)
   - 7.6 [Users and Reactions Management via Python SDK](#76-users-and-reactions-management-via-python-sdk)

8. [Debugging](#8-debugging) — **LOW-MEDIUM**
   - 8.1 [Monitor Data Provider Events for Troubleshooting](#81-monitor-data-provider-events-for-troubleshooting)

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
  recording: recordingDataProvider,
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

**SDK methods:**

```tsx
// Method 1: Via VeltProvider prop (recommended for React)
<VeltProvider apiKey={KEY} authProvider={auth} dataProviders={dataProviders}>

// Method 2: Via client API (for non-React or dynamic setup)
client.setDataProviders(dataProviders);

// Anonymous user resolution (resolve tagged contact emails to userIds at save time)
client.setAnonymousUserDataProvider({
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

Reference: https://docs.velt.dev/self-host-data/overview; https://docs.velt.dev/self-host-data/comments - Important Notes

---

### 1.2 Install and Initialize the Velt Python SDK

**Impact: CRITICAL (Without proper SDK initialization, all backend operations will fail)**

The `velt-py` package provides two independent backends: `sdk.selfHosting.*` for self-hosting Velt data in your own MongoDB + S3, and `sdk.api.*` for calling Velt's REST APIs directly with no database required. MongoDB config is only needed for `sdk.selfHosting.*`.

Do not use the old class-based `VeltSdk(VeltSdkConfig(...))` pattern — it no longer exists. The correct entry point is always `VeltSDK.initialize({...})` with a config dict.

**Install the package:**

```bash
pip install velt-py
```

**Correct (REST API only — no database needed):**

```python
from velt_py import VeltSDK

# Minimal config for sdk.api.* services only
sdk = VeltSDK.initialize({
    'apiKey': 'YOUR_VELT_API_KEY',
    'authToken': 'YOUR_VELT_AUTH_TOKEN'
})

# All sdk.api.* services are now available
result = sdk.api.organizations.getOrganizations(...)
```

**Correct (self-hosting with MongoDB connection string):**

```python
from velt_py import VeltSDK

sdk = VeltSDK.initialize({
    'apiKey': 'YOUR_VELT_API_KEY',
    'authToken': 'YOUR_VELT_AUTH_TOKEN',
    'database': {
        'connection_string': 'mongodb+srv://user:pass@cluster.mongodb.net/velt-db'
    }
})
```

**Correct (self-hosting with individual MongoDB fields and S3):**

```python
from velt_py import VeltSDK

sdk = VeltSDK.initialize({
    'apiKey': 'YOUR_VELT_API_KEY',
    'authToken': 'YOUR_VELT_AUTH_TOKEN',
    'database': {
        'host': 'localhost:27017',
        'username': 'db_user',
        'password': 'db_password',
        'auth_database': 'admin',
        'database_name': 'velt-db'
    },
    'aws': {
        'bucket_name': 'velt-attachments',
        'region': 'us-east-1',
        'access_key_id': 'AKIA...',
        'secret_access_key': 'secret...'
    }
})
```

**Correct (production pattern using environment variables):**

```python
import os
from velt_py import VeltSDK

# The SDK reads VELT_API_KEY and VELT_AUTH_TOKEN automatically from the environment.
# Pass an empty dict (or omit apiKey/authToken) when env vars are set.
sdk = VeltSDK.initialize({})
```

**Source Pointers:**

```python
# Error response format
{
    'success': False,
    'statusCode': 400,       # or 500, 404
    'error': 'Description of what went wrong',
    'errorCode': 'INVALID_INPUT'   # or INTERNAL_ERROR, NOT_FOUND
}
```

| Error Code | Status Code | Description |
|------------|-------------|-------------|
| `INVALID_INPUT` | 400 | Malformed request data — check required fields |
| `NOT_FOUND` | 404 | Resource not found — verify IDs |
| `INTERNAL_ERROR` | 500 | Server-side error — retry or contact support |
**Python exception classes for `sdk.api.*`:**
The SDK raises typed exceptions for `sdk.api.*` calls. All exceptions extend `VeltSDKError`.
| Exception | When raised |
|-----------|-------------|
| `VeltSDKError` | Base class; catch for any SDK-level error |
| `VeltValidationError` | SDK-level validation (e.g., missing required config); `sdk.api.*` methods do not validate request payloads locally |
| `VeltTokenError` | Token generation or authentication failure |
| `VeltApiError` | REST API errors (network failures, unexpected responses) |

**Correct (exception handling for sdk.api.* calls):**

```python
from velt_py import VeltSDK
from velt_py.exceptions import VeltSDKError, VeltValidationError, VeltTokenError, VeltApiError

sdk = VeltSDK.initialize({
    'apiKey': 'YOUR_VELT_API_KEY',
    'authToken': 'YOUR_VELT_AUTH_TOKEN'
})

try:
    result = sdk.api.organizations.getOrganizations(...)
except VeltValidationError as e:
    # Request dataclass had invalid or missing fields
    print('Validation error:', e)
except VeltTokenError as e:
    # apiKey or authToken is invalid or expired
    print('Auth error:', e)
except VeltApiError as e:
    # Velt API returned a non-2xx response
    print('API error:', e)
except VeltSDKError as e:
    # Catch-all for any other SDK error
    print('SDK error:', e)
from velt_py import VeltSDK

sdk = VeltSDK.initialize({
    'apiKey': 'YOUR_VELT_API_KEY',
    'authToken': 'YOUR_VELT_AUTH_TOKEN',
    'database': {
        'connection_string': 'mongodb+srv://user:pass@cluster.mongodb.net/velt-db',
    },
    'collections': {
        'comments': 'velt_comment_annotations',
        'reactions': 'velt_reactions',
        'users': 'app_users',
        'attachments': 'velt_attachments',
    }
})
from velt_py import VeltSDK

sdk = VeltSDK.initialize({
    'apiKey': 'YOUR_VELT_API_KEY',
    'authToken': 'YOUR_VELT_AUTH_TOKEN',
    'database': {
        'connection_string': 'mongodb+srv://user:pass@cluster.mongodb.net/velt-db',
    },
    'user_schema': {
        'userId': '_id',           # Your DB field for user ID
        'name': 'display_name',   # Your DB field for user name
        'email': 'email_address', # Your DB field for email
        'photoUrl': 'avatar_url', # Your DB field for avatar
    }
})
```

---
Map Velt data to custom MongoDB collection names if your database has existing naming conventions:
---
Map your database's user fields to Velt's expected field names:
This mapping ensures the SDK can resolve user data from your existing user collection without requiring schema changes.

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

Reference: https://docs.velt.dev/self-host-data/comments; https://docs.velt.dev/self-host-data/attachments; https://docs.velt.dev/self-host-data/reactions

---

### 1.4 Use authProvider on VeltProvider with dataProviders — Never Use identify()

**Impact: CRITICAL (Using deprecated auth methods breaks data provider initialization ordering)**

VeltProvider requires the `authProvider` prop for authentication. The `useIdentify()` hook and `client.identify()` method are deprecated — they lack automatic token refresh and retry logic. For self-hosting, `dataProviders` must also be set on VeltProvider so that data providers are initialized before authentication occurs.

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

**PII control with additionalFields and fieldsToRemove:**

```jsx
const commentDataProvider = {
  config: {
    // ...endpoint configs above...
    additionalFields: ['status', 'priority'],      // Extra fields to include
    fieldsToRemove: ['email', 'phone'],            // PII fields to strip
  }
};
```

Reference: https://docs.velt.dev/self-host-data/comments - Endpoint-Based approach

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

Reference: https://docs.velt.dev/self-host-data/comments - Function-Based approach

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

**Delete handler metadata contract (v5.0.2-beta.11+):**

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

Reference: https://docs.velt.dev/self-host-data/attachments - Endpoint-Based, Function-Based

---

## 4. Additional Providers

**Impact: MEDIUM**

User, reaction, and recording data providers. User provider is read-only (get only) for PII protection. Reaction and recording providers support full CRUD following the same pattern as comments. All providers share retry and timeout configuration options.

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
  recording: recordingDataProvider,
}} />
```

**What each provider stores:**

```js
// Get: { organizationId, documentIds?, reactionAnnotationIds? }
// Save: { annotations: Record<string, Annotation>, context: { documentId, organizationId } }
// Delete: { annotationId, metadata: { documentId, organizationId } }
```

Reference: https://docs.velt.dev/self-host-data/reactions; https://docs.velt.dev/self-host-data/recordings

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
  additionalFields?: string[];       // Extra fields to include
  fieldsToRemove?: string[];         // PII fields to strip
}

interface RetryConfig {
  retryCount: number;                // Max retry attempts
  retryDelay: number;                // Delay between retries (ms)
}
```

Reference: https://docs.velt.dev/self-host-data/comments - Configuration Options; https://docs.velt.dev/self-host-data/attachments - Configuration Options

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
DO NOT wrap the user provider's return in `{ data, success, statusCode }` — the SDK expects `Record<string, User>` directly.

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

Reference: https://docs.velt.dev/self-host-data/users

---

### 4.4 Self-Host Activity Log Data for Custom Activities

**Impact: MEDIUM (Route activity log PII, entity snapshots, and custom fields through your own infrastructure)**

The activity data provider handles PII for activity log records — comment text embedded in change history, feature-specific entity snapshots (e.g., PR titles, deployment metadata), and arbitrary custom fields. The SDK strips configured fields before writing to Velt and re-hydrates them on read via your `get` handler.

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
  fieldsToRemove?: string[]; // Extra fields to strip beyond defaults
}
```

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

Entity snapshots (`entityData`, `entityTargetData`), display message templates and their data, and any fields listed in `config.fieldsToRemove` are NOT stored on Velt — they live exclusively on your database and are merged back via `get` at render time.

Reference: https://docs.velt.dev/self-host-data/activity ("Sample Data")

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

Reference: https://docs.velt.dev/self-host-data/notifications ("Sample Data")

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
  folderId?: string;
  allDocuments?: boolean;
}

interface SaveRecorderResolverRequest {
  recorderAnnotations: Record<string, PartialRecorderAnnotation>;
  metadata?: BaseMetadata;
  event?: ResolverActions;
}

interface SaveRecorderResolverData {
  recorderAnnotation: Record<string, PartialRecorderAnnotation>;
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

Reference: https://docs.velt.dev/self-host-data/recordings

---

## 5. Backend Implementation

**Impact: MEDIUM**

Server-side patterns for handling data provider requests. Covers API route structure, database storage with upsert operations and indexing, and S3-compatible object storage for attachments.

### 5.1 Implement Database Storage with Upsert and Proper Indexing

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

Reference: https://docs.velt.dev/self-host-data/comments - Backend Example (MongoDB, PostgreSQL)

---

### 5.2 Store and Delete Attachments in S3-Compatible Object Storage

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

Reference: https://docs.velt.dev/self-host-data/attachments - Backend Example

---

### 5.3 Structure Backend API Routes for Data Provider Endpoints

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
    const { organizationId, documentIds, annotationIds } = req.body;
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
async function handleSave(req, res, collection) {
  try {
    const { annotations, context } = req.body;
    for (const [id, annotation] of Object.entries(annotations)) {
      await collection.upsert(
        { annotationId: id },
        { ...annotation, annotationId: id,
          documentId: context?.documentId,
          organizationId: context?.organizationId }
      );
    }
    res.json({ success: true, statusCode: 200 });
  } catch (error) {
    res.json({ data: null, success: false, statusCode: 500 });
  }
}

// DELETE handler (comments, reactions, recordings)
async function handleDelete(req, res, collection) {
  try {
    const { annotationId } = req.body;
    await collection.deleteOne({ annotationId });
    res.json({ success: true, statusCode: 200 });
  } catch (error) {
    res.json({ data: null, success: false, statusCode: 500 });
  }
}
```

Reference: https://docs.velt.dev/self-host-data/comments - Backend Example; https://docs.velt.dev/self-host-data/reactions - Backend Example

---

## 6. Data Types

**Impact: MEDIUM**

Reference for the TypeScript shapes a data provider hands to / receives from the SDK — comment payloads, attachment uploads, reaction records, recording metadata, user contacts. Documents the contract between the SDK and your backend so provider responses don't drift from the SDK's expected shapes.

### 6.1 Self-Hosting Data Type Reference — Provider Interfaces, Config, Request/Response Types

**Impact: MEDIUM (Complete type definitions for all data provider interfaces and resolver types)**

Complete type definitions for all data provider interfaces, configuration types, request/response shapes, and resolver enums.

### VeltDataProvider (top-level)

Reference: https://docs.velt.dev/api-reference/sdk/models/data-models - Self-Hosting Types

---

## 7. Python SDK

**Impact: HIGH**

Patterns for implementing data-provider backends in Python using the `velt-py` SDK. Covers the `sdk.api.*` REST API backend (no database required), comments / attachments / users / reactions self-hosting handlers, framework integrations (FastAPI / Flask / Django), and the same response-format contract the JS SDK enforces. Use when your provider backend is Python rather than Node.

### 7.1 Attachment Upload and Delete via Python SDK with S3

**Impact: HIGH (Missing S3 configuration or incorrect file parameters cause upload failures)**

Attachment operations require S3 to be configured during SDK initialization. The save method accepts file data alongside the request object, while delete removes files from both the database and S3.

Do not attempt attachment operations without providing `aws` config in `VeltSDK.initialize`. Without S3 configuration, `sdk.selfHosting.attachments.saveAttachment(...)` will raise an error at runtime.

**Correct (SDK init with S3 for attachments):**

```python
from velt_py import VeltSDK

sdk = VeltSDK.initialize({
    'apiKey': 'YOUR_VELT_API_KEY',
    'authToken': 'YOUR_VELT_AUTH_TOKEN',
    'database': {
        'connection_string': 'mongodb+srv://user:pass@cluster.mongodb.net/velt-db'
    },
    'aws': {
        'bucket_name': 'velt-attachments',
        'region': 'us-east-1',
        'access_key_id': 'AKIA...',
        'secret_access_key': 'secret...'
    }
})
```

**Correct (upload an attachment):**

```python
from velt_py import SaveAttachmentResolverRequest

# Read file data as bytes
with open("report.pdf", "rb") as f:
    file_data = f.read()

request = SaveAttachmentResolverRequest(
    organization_id="org_123",
    document_id="doc_456",
    attachment_id="attachment_789"
)

response = sdk.selfHosting.attachments.saveAttachment(
    request,
    file_data=file_data,
    file_name="report.pdf",
    mime_type="application/pdf"
)

if response['success']:
    attachment_url = response['data']
    print(f"Uploaded: {attachment_url}")
else:
    print(f"Upload failed: {response['error']}")
```

**Correct (delete an attachment):**

```python
from velt_py import DeleteAttachmentResolverRequest

request = DeleteAttachmentResolverRequest(
    organization_id="org_123",
    document_id="doc_456",
    attachment_id="attachment_789"
)

response = sdk.selfHosting.attachments.deleteAttachment(request)

if response['success']:
    print("Attachment deleted from database and S3")
```

Reference: `https://docs.velt.dev/api-reference/sdk/python/attachments` (## Python SDK > ### Attachments)

---

### 7.2 Comments CRUD Operations via Python SDK

**Impact: HIGH (Incorrect request types or response handling causes silent data loss or failed queries)**

The Python SDK provides methods to get, save, and delete comments through the `sdk.selfHosting.comments` namespace. Each method requires its own request type.

**Incorrect (passing raw dicts instead of request objects):**

```python
# This will fail — methods require typed request objects
comments = sdk.selfHosting.comments.getComments({
    "organizationId": "org_123",
    "documentId": "doc_456"
})
```

**Correct (get comments):**

```python
from velt_py import GetCommentResolverRequest

request = GetCommentResolverRequest(
    organization_id="org_123",
    document_id="doc_456"
)

response = sdk.selfHosting.comments.getComments(request)

# response is a plain dict with camelCase keys
if response['success']:
    comments = response['data']
    print(f"Retrieved {len(comments)} comments")
else:
    print(f"Error {response['errorCode']}: {response['error']}")
```

**Correct (save comments):**

```python
from velt_py import SaveCommentResolverRequest

request = SaveCommentResolverRequest(
    organization_id="org_123",
    document_id="doc_456",
    comment_annotations=[
        {
            "annotationId": "annotation_1",
            "commentData": [
                {
                    "commentText": "This needs review",
                    "from": {"userId": "user_789"}
                }
            ]
        }
    ]
)

response = sdk.selfHosting.comments.saveComments(request)

if response['success']:
    print(f"Saved successfully, status: {response.get('statusCode', 200)}")
```

**Correct (delete comment):**

```python
from velt_py import DeleteCommentResolverRequest

request = DeleteCommentResolverRequest(
    organization_id="org_123",
    document_id="doc_456",
    annotation_id="annotation_1",
    comment_id=1
)

response = sdk.selfHosting.comments.deleteComment(request)

if response['success']:
    print("Comment deleted")
```

**Response format:**

```python
# VeltSelfHostingResponse is a plain Python dict with camelCase keys

# Success
response = {'success': True, 'statusCode': 200, 'data': {...}}

# Error
response = {'success': False, 'statusCode': 500, 'error': 'Comment not found', 'errorCode': 'INTERNAL_ERROR'}

# Access pattern
if response['success']:
    data = response['data']
else:
    print(f"Error {response['errorCode']}: {response['error']}")

# Safe optional field access
status = response.get('statusCode', 200)
```

**Verification:**

```python
from velt_py import (
    # Comments
    GetCommentResolverRequest,
    SaveCommentResolverRequest,
    DeleteCommentResolverRequest,
    # Reactions
    GetReactionResolverRequest,
    SaveReactionResolverRequest,
    DeleteReactionResolverRequest,
    # Users
    GetUserResolverRequest,
    # Attachments
    SaveAttachmentResolverRequest,
    DeleteAttachmentResolverRequest,
)
```

| Module | Request Type | SDK Method |
|--------|-------------|------------|
| Comments | `GetCommentResolverRequest` | `sdk.selfHosting.comments.getComments()` |
| Comments | `SaveCommentResolverRequest` | `sdk.selfHosting.comments.saveComments()` |
| Comments | `DeleteCommentResolverRequest` | `sdk.selfHosting.comments.deleteComment()` |
| Reactions | `GetReactionResolverRequest` | `sdk.selfHosting.reactions.getReactions()` |
| Reactions | `SaveReactionResolverRequest` | `sdk.selfHosting.reactions.saveReactions()` |
| Reactions | `DeleteReactionResolverRequest` | `sdk.selfHosting.reactions.deleteReaction()` |
| Users | `GetUserResolverRequest` | `sdk.selfHosting.users.getUsers()` |
| Attachments | `SaveAttachmentResolverRequest` | `sdk.selfHosting.attachments.saveAttachment()` |
| Attachments | `DeleteAttachmentResolverRequest` | `sdk.selfHosting.attachments.deleteAttachment()` |

Reference: `https://docs.velt.dev/api-reference/sdk/python/comments` (## Python SDK > ### Comments)

---

### 7.3 Django, Flask, and FastAPI Integration Patterns

**Impact: MEDIUM (Incorrect framework integration causes SDK reinitialization on every request or missing CSRF handling)**

Initialize the Velt SDK once at application startup, then use it across request handlers. Each framework has its own conventions for initialization and request handling.

**Django — Initialize in apps.py, use in views.py:**

```python
# myapp/apps.py
import os
from django.apps import AppConfig
from velt_py import VeltSDK

class MyAppConfig(AppConfig):
    name = 'myapp'
    velt_sdk = None

    def ready(self):
        MyAppConfig.velt_sdk = VeltSDK.initialize({
            'database': {
                'connection_string': os.environ["MONGODB_URI"]
            }
        })
        # VELT_API_KEY and VELT_AUTH_TOKEN are read from environment automatically
# myapp/views.py
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from velt_py import GetCommentResolverRequest
from .apps import MyAppConfig

@csrf_exempt
def get_comments(request):
    if request.method != 'POST':
        return JsonResponse({"error": "POST required"}, status=405)

    body = json.loads(request.body)
    sdk = MyAppConfig.velt_sdk

    resolver_request = GetCommentResolverRequest(
        organization_id=body["organizationId"],
        document_id=body["documentId"]
    )

    response = sdk.selfHosting.comments.getComments(resolver_request)

    # response is a plain dict with camelCase keys
    if response['success']:
        return JsonResponse({"data": response['data']})
    return JsonResponse({"error": response['error']}, status=response.get('statusCode', 500))
```

**Flask — Initialize at module level:**

```python
import os
from flask import Flask, request, jsonify
from velt_py import VeltSDK, GetCommentResolverRequest

app = Flask(__name__)

sdk = VeltSDK.initialize({
    'database': {
        'connection_string': os.environ["MONGODB_URI"]
    }
})
# VELT_API_KEY and VELT_AUTH_TOKEN are read from environment automatically

@app.route("/api/comments/get", methods=["POST"])
def get_comments():
    body = request.json

    resolver_request = GetCommentResolverRequest(
        organization_id=body["organizationId"],
        document_id=body["documentId"]
    )

    response = sdk.selfHosting.comments.getComments(resolver_request)

    if response['success']:
        return jsonify({"data": response['data']})
    return jsonify({"error": response['error']}), response.get('statusCode', 500)
```

**FastAPI — Initialize at module level, use async endpoints:**

```python
import os
from fastapi import FastAPI, Request
from velt_py import VeltSDK, GetCommentResolverRequest

app = FastAPI()

sdk = VeltSDK.initialize({
    'database': {
        'connection_string': os.environ["MONGODB_URI"]
    }
})
# VELT_API_KEY and VELT_AUTH_TOKEN are read from environment automatically

@app.post("/api/comments/get")
async def get_comments(req: Request):
    body = await req.json()

    resolver_request = GetCommentResolverRequest(
        organization_id=body["organizationId"],
        document_id=body["documentId"]
    )

    response = sdk.selfHosting.comments.getComments(resolver_request)

    if response['success']:
        return {"data": response['data']}
    return {"error": response['error']}
```

Reference: `https://docs.velt.dev/api-reference/sdk/python/overview` (## Python SDK > ### Framework Integration)

---

### 7.4 Generate Auth Tokens via sdk.selfHosting.token.getToken

**Impact: HIGH (Issuing auth tokens server-side with the self-hosting variant ensures token generation works within your own infrastructure without a separate REST call)**

The Python SDK exposes `sdk.selfHosting.token.getToken` to generate a Velt auth token for a user on the server side. This is the self-hosting variant of token generation — use it when your backend already has MongoDB + AWS configured via `sdk.selfHosting.*`. The generated token is passed to the frontend `authProvider` prop so the client can authenticate without exposing your API credentials.

Do not call the Velt REST auth endpoint directly with `requests` or `httpx` and do not attempt to construct the JWT manually. Unlike other `sdk.selfHosting.*` methods, `getToken` does **not** accept a typed request dataclass — pass arguments as keyword arguments directly.

**Correct (generate token and return to frontend):**

```python
from velt_py import VeltSDK

sdk = VeltSDK.initialize({
    'apiKey': 'YOUR_VELT_API_KEY',
    'authToken': 'YOUR_VELT_AUTH_TOKEN',
    'database': {
        'mongoURI': 'YOUR_MONGO_URI',
        'dbName': 'YOUR_DB_NAME'
    }
})

result = sdk.selfHosting.token.getToken(
    organizationId='org-123',
    userId='user-1',
    email='user@example.com',   # optional
    isAdmin=False                # optional, defaults to False
)

if result['success']:
    token = result['data']['token']   # JWT string — pass to frontend authProvider
else:
    print(f"Token error {result.get('errorCode')}: {result.get('error')}")
```

**Response shape:**

```python
# Success
{'success': True, 'statusCode': 200, 'data': {'token': 'eyJhbGciOi...'}}

# Error
{'success': False, 'statusCode': 500, 'error': '...', 'errorCode': 'INTERNAL_ERROR'}
```

---

### 7.5 Use sdk.api.* for REST API Operations Without a Database

**Impact: HIGH (Using sdk.api.* eliminates the need for MongoDB/AWS setup when calling Velt APIs directly, reducing backend complexity significantly)**

The `sdk.api.*` namespace provides direct access to Velt's REST APIs from Python. It has feature parity with the Velt Node SDK and requires no MongoDB or AWS configuration — only `apiKey` and `authToken`. Use it when you need to manage Velt data server-side without self-hosting.

Do not call the Velt REST API directly with `requests` or `httpx` — the typed request dataclasses and the `sdk.api.*` namespace handle authentication headers, serialization, and error propagation for you.

**Correct (initialize for REST API use and call services):**

```python
from velt_py import VeltSDK
from velt_py.models.organization import AddOrganizationsRequest, GetOrganizationsRequest
from velt_py.models.document import AddDocumentsRequest

sdk = VeltSDK.initialize({
    'apiKey': 'YOUR_VELT_API_KEY',
    'authToken': 'YOUR_VELT_AUTH_TOKEN'
})

# Add an organization
result = sdk.api.organizations.addOrganizations(
    AddOrganizationsRequest(
        organizations=[{'organizationId': 'org-123', 'organizationName': 'My Org'}]
    )
)
if 'error' in result:
    print('Failed:', result['error'])
else:
    print('Success:', result['result'])

# Add documents to an organization
result = sdk.api.documents.addDocuments(
    AddDocumentsRequest(
        organizationId='org-123',
        documents=[{'documentId': 'doc-1', 'documentName': 'My Doc'}]
    )
)
```

**Available services under `sdk.api.*`:**
| Service | Namespace |
|---------|-----------|
| Organizations | `sdk.api.organizations` |
| Folders | `sdk.api.folders` |
| Documents | `sdk.api.documents` |
| Users | `sdk.api.users` |
| User Groups | `sdk.api.userGroups` |
| Notifications | `sdk.api.notifications` |
| Comment Annotations | `sdk.api.commentAnnotations` |
| Activities | `sdk.api.activities` |
| Access Control | `sdk.api.accessControl` |
| CRDT | `sdk.api.crdt` |
| Presence | `sdk.api.presence` |
| Livestate | `sdk.api.livestate` |
| Recordings | `sdk.api.recordings` |
| Rewriter | `sdk.api.rewriter` |
| GDPR | `sdk.api.gdpr` |
| Workspace | `sdk.api.workspace` |
| Token | `sdk.api.token` |

---

### 7.6 Users and Reactions Management via Python SDK

**Impact: MEDIUM (Incorrect request types prevent user lookups and reaction sync)**

The Python SDK provides methods to manage users and reactions through `sdk.selfHosting.users` and `sdk.selfHosting.reactions`. Each operation uses a typed request object.

**Incorrect (missing request type imports):**

```python
# This will throw an error — request types are required
users = sdk.selfHosting.users.getUsers({
    "organizationId": "org_123"
})
```

**Correct (get users):**

```python
from velt_py import GetUserResolverRequest

request = GetUserResolverRequest(
    organization_id="org_123"
)

response = sdk.selfHosting.users.getUsers(request)

# response is a plain dict with camelCase keys
if response['success']:
    users = response['data']
    for user in users:
        print(f"User: {user['userId']} - {user['email']}")
else:
    print(f"Error: {response['error']}")
```

**Correct (get reactions):**

```python
from velt_py import GetReactionResolverRequest

request = GetReactionResolverRequest(
    organization_id="org_123",
    document_id="doc_456"
)

response = sdk.selfHosting.reactions.getReactions(request)

if response['success']:
    reactions = response['data']
    print(f"Found {len(reactions)} reactions")
```

**Correct (save reactions):**

```python
from velt_py import SaveReactionResolverRequest

request = SaveReactionResolverRequest(
    organization_id="org_123",
    document_id="doc_456",
    reactions=[
        {
            "reactionId": "reaction_1",
            "emoji": "thumbsup",
            "userId": "user_789"
        }
    ]
)

response = sdk.selfHosting.reactions.saveReactions(request)

if response['success']:
    print("Reactions saved")
```

**Correct (delete reaction):**

```python
from velt_py import DeleteReactionResolverRequest

request = DeleteReactionResolverRequest(
    organization_id="org_123",
    document_id="doc_456",
    reaction_id="reaction_1"
)

response = sdk.selfHosting.reactions.deleteReaction(request)

if response['success']:
    print("Reaction deleted")
```

**Available request type imports:**

```python
from velt_py import (
    GetUserResolverRequest,
    GetReactionResolverRequest,
    SaveReactionResolverRequest,
    DeleteReactionResolverRequest
)
```

Reference: `https://docs.velt.dev/api-reference/sdk/python/users` (## Python SDK > ### Users & Reactions)

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
      console.log('Data Provider Event:', {
        type: event.type,           // 'get', 'save', 'delete'
        provider: event.moduleName, // 'comment', 'attachment', etc.
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

Reference: https://docs.velt.dev/self-host-data/comments - Debugging, Email Notifications

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/self-host-data/overview
- https://docs.velt.dev/self-host-data/comments
- https://docs.velt.dev/self-host-data/attachments
- https://docs.velt.dev/self-host-data/reactions
- https://docs.velt.dev/self-host-data/recordings
- https://docs.velt.dev/self-host-data/users
- https://console.velt.dev
- https://docs.velt.dev/self-host-data/activity
- https://docs.velt.dev/self-host-data/notifications
