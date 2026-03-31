---
title: Use Function-Based Comment Data Provider for Full Control
impact: HIGH
impactDescription: Full control over data flow for custom logic and transformations
tags: comment, function, resolver, get, save, delete, custom, callback
---

## Use Function-Based Comment Data Provider for Full Control

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

**Correct (all three operations with standard response format):**

```jsx
const fetchCommentsFromDB = async (request) => {
  const { organizationId, documentIds, commentAnnotationIds } = request;
  const response = await fetch('/api/velt/comments/get', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ organizationId, documentIds, commentAnnotationIds }),
  });
  const result = await response.json();
  return { data: result.data || {}, success: result.success, statusCode: response.status };
};

const saveCommentsToDB = async (request) => {
  const response = await fetch('/api/velt/comments/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  const result = await response.json();
  return { data: result.data, success: result.success, statusCode: response.status };
};

const deleteCommentsFromDB = async (request) => {
  const response = await fetch('/api/velt/comments/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  const result = await response.json();
  return { data: result.data, success: result.success, statusCode: response.status };
};

const commentDataProvider = {
  get: fetchCommentsFromDB,
  save: saveCommentsToDB,
  delete: deleteCommentsFromDB,
  config: {
    resolveTimeout: 15000,
    saveRetryConfig: { retryCount: 3, retryDelay: 2000 },
    deleteRetryConfig: { retryCount: 2, retryDelay: 1000 },
    getRetryConfig: { retryCount: 3, retryDelay: 2000 },
  }
};

<VeltProvider apiKey="KEY" dataProviders={{ comment: commentDataProvider }} />
```

**Request objects received by each function:**

```typescript
// get receives:
{ organizationId: string, documentIds?: string[], commentAnnotationIds?: string[] }

// save receives:
{ commentAnnotation: Record<string, PartialCommentAnnotation>, metadata: { documentId, organizationId } }

// delete receives:
{ commentAnnotationId: string, metadata: { documentId, organizationId } }
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

**Verification:**
- [ ] All three functions implemented (get, save, delete)
- [ ] Each returns `{ data, success, statusCode }`
- [ ] Error cases return `success: false` with appropriate statusCode
- [ ] Get returns data keyed by annotationId

**Source Pointer:** https://docs.velt.dev/self-host-data/comments - Function-Based approach
