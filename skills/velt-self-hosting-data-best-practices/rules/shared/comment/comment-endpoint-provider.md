---
title: Use Endpoint-Based Config for Comment Data Provider
impact: HIGH
impactDescription: Simplest approach for standard REST backend integrations
tags: comment, endpoint, config, url, getConfig, saveConfig, deleteConfig, headers, credentials, async-headers, additionalSaveEvents, automatic
---

## Use Endpoint-Based Config for Comment Data Provider

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
