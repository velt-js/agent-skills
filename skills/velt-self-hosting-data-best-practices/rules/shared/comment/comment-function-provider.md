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

### When `save` actually fires (strip rules)

The frontend strip is what makes `PartialCommentAnnotation` smaller than `CommentAnnotation` — and the same logic decides whether `save` is called at all. Get these gating conditions wrong and `save` either never runs (PII silently lost) or runs on every non-PII change (your DB churns on status / priority flips).

- **Stripped on the frontend (never sent to Velt):** per-comment `commentText` and `commentHtml`; per-comment `attachments[].name` and `attachments[].url` (only when the `attachment` resolver is active); `targetTextRange.text`; and any keys listed in `config.fieldsToRemove`. Per-comment strips set `isCommentResolverUsed = true` on the comment; attachment strips set `isAttachmentResolverUsed = true`.
- **Copied-not-moved** (sent to both your DB and Velt's DB): `from`, `assignedTo`, `resolvedByUserId`.
- **`save` is gated by `ResolverActions`.** It fires only when the PII actually changed **and** the action maps to one of `COMMENT_ANNOTATION_ADD` / `COMMENT_ADD` / `COMMENT_UPDATE` / `COMMENT_DELETE` (or a draft). Pure status, priority, or assignment changes do **not** call `save`.
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

**Verification:**
- [ ] All three functions implemented (get, save, delete)
- [ ] Each returns `{ data, success, statusCode }`
- [ ] Error cases return `success: false` with appropriate statusCode
- [ ] Get returns data keyed by annotationId
- [ ] `save` handler treats `request.event` as a `ResolverActions` value — does not assume it fires on status / priority / assignment changes
- [ ] Backend tolerates the truthy-gating contract: missing `commentText` / `commentHtml` means "no PII change for that comment", not "comment was cleared"

**Source Pointer:** https://docs.velt.dev/self-host-data/comments - Function-Based approach; https://docs.velt.dev/self-host-data/field-inventory - "Comment strip rules"
