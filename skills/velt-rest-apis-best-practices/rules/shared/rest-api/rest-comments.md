---
title: Comment Annotations and Comments CRUD via REST API
impact: HIGH
impactDescription: Comments are the most-used collaboration primitive — incorrect API calls block core functionality
tags: rest, api, comments, annotations, crud
---

## Comment Annotations and Comments CRUD via REST API

All Velt REST API v2 endpoints use POST and require two headers. Base URL: `https://api.velt.dev/v2`.

**Required headers for every request:**

```
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN
```

### Comment Annotation Endpoints

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

### Individual Comment Endpoints

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

**Key points:**

- Every endpoint is POST — there are no GET, PUT, or DELETE HTTP methods in the Velt REST API.
- `organizationId` and `documentId` are required on all comment endpoints.
- Annotation-level operations use `annotationIds` (array). Comment-level operations use `annotationId` (singular) plus `commentId`/`commentIds`.
- The `/count/get` endpoint returns the total number of annotations for a document.

### GET Response Shapes

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

**`reactionAnnotationIds` vs. `reactionAnnotations` — both are returned, with different shapes:**

`reactionAnnotationIds` is a flat array of strings (bare IDs). `reactionAnnotations` is a parallel array of full reaction objects. Pick the one matching your consumer.

**Incorrect:** Treating `reactionAnnotations` as a bare ID array (it changed shape — it is now an array of objects, not strings).

```typescript
// WRONG — older shape, no longer accurate
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
- `createdAt` and `lastUpdated` use **milliseconds since epoch** for annotations and reaction annotations (e.g. `1777973713421`), but **ISO 8601** for individual comments (e.g. `"2026-05-05T09:35:15.048Z"`). Parse them differently.
- `hasDraftComments` is a boolean indicating whether the annotation contains any draft comments.
- `context.access` / `context.accessFields` are access-control metadata (e.g. `{ "default": "velt" }`).

**Key points:**

- Annotation-level envelope now exposes `annotationId`, `annotationNumber`, `annotationIndex`, `hasDraftComments`, `locationId`, `location`, `context.*`, `visibilityConfig`, `metadata`, `recorders` directly.
- `reactionAnnotationIds` (strings) and `reactionAnnotations` (objects) are both returned — they are different shapes, not aliases.
- The `null` sentinel inside `data` indicates a requested ID that did not exist; check for it before dereferencing.
- Mixed timestamp formats: ms-epoch on annotations/reactions, ISO 8601 on comments.

**Verification:**
- [ ] Using POST method for all endpoints
- [ ] Both `x-velt-api-key` and `x-velt-auth-token` headers are included
- [ ] `organizationId` and `documentId` are present in every request body
- [ ] Annotation IDs use the correct singular/plural form per endpoint
- [ ] Response status is checked for success before processing data
- [ ] Consumer binds to `reactionAnnotationIds` (strings) or `reactionAnnotations` (objects) — not both interchangeably
- [ ] Timestamp parsing handles ms-epoch (annotations/reactions) vs. ISO 8601 (comments)
- [ ] `null` entries inside `result.data` are handled (missing IDs)
- [ ] No code depends on `viewedBy` being present on GET responses

**Source Pointer:** `https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/get-comment-annotations-v2` and `https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/get-comments`
