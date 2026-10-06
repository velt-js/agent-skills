---
title: REST API — Comment Annotation CRUD
impact: HIGH
impactDescription: Server-side comment annotation management via REST
tags: rest, api, commentannotations, add, get, update, delete, count, server, updatedData, statusUpdatedByUserId, resolvedByUserId, progress, actions, suggestion, visibility, triggerNotification, triggerActivities, agent, agentSource, agentId, executionId, agentSuggestions, agentComments, nextPageToken
---

## REST API — Comment Annotation CRUD

Use Velt's V2 REST APIs to manage comment annotations from your backend. Every endpoint is a `POST` with a `{ data: {...} }` body and the `x-velt-api-key` and `x-velt-auth-token` headers. Update requests select annotations with filters (`annotationIds`, `locationIds`, `userIds`) and apply one `updatedData` object; there is no per-annotation `annotations[]` array.

> **Agent annotations?** If the task involves AI agents, agent comments, agent suggestions, agentSource, executionId, or accept/reject: the agent block goes on `commentData[0]` with `type: "suggestion"`, `agentName` (required for external), and a `reason` object. See `rest-agent-comments-api.md`. Use `suggestionAccepted` / `suggestionRejected` events on the client to handle reviewer decisions.

**Incorrect (invented update and count shapes):**

```javascript
// Update: there is no `annotations` array
body: JSON.stringify({ data: { organizationId: 'org-1', documentId: 'doc-1',
  annotations: [{ annotationId: 'ann-123', status: { id: 'resolved' } }] } });

// Count: requires documentIds (max 30) and userId, not a single documentId
body: JSON.stringify({ data: { organizationId: 'org-1', documentId: 'doc-1' } });
```

**Add Annotations:**

The request body uses `data.commentAnnotations`, an array of annotation objects that each contain a `commentData` array.

```javascript
// POST https://api.velt.dev/v2/commentannotations/add
const response = await fetch('https://api.velt.dev/v2/commentannotations/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN,
  },
  body: JSON.stringify({
    data: {
      organizationId: 'org-1',
      documentId: 'doc-1',
      commentAnnotations: [{
        location: { id: 'locationId', locationName: 'Page 1' },       // optional
        visibility: { type: 'restricted', userIds: ['user-1'] },       // optional, default public
        context: { access: { dashboardId: 'myDashboard' } },           // optional Access Context
        commentData: [{
          commentText: 'This needs review',
          commentHtml: '<p>This needs review</p>',
          from: { userId: 'user-1', name: 'User One' },                // required
          triggerNotification: true,  // in-app + email notifications and webhooks (default false)
          triggerActivities: true,    // activity log record (default false)
        }],
      }],
    },
  }),
});
const { result } = await response.json();
// result.data is a MAP keyed per annotation, not an array, and its order does not match your input.
for (const entry of Object.values(result.data)) {
  console.log(entry.success, entry.annotationId, entry.commentIds, entry.findingId);
}
```

Response handling:
- Read `entry.annotationId` from each value, never the map key. Keys for permission-denied entries without your own `annotationId` fall back to `__velt_denied:<index>`.
- On a failure response, `error.details` carries the same per-annotation map. Entries with `"success": true` **were created**, so treat a failed request as a partial write.
- For agent annotations, `findingId` echoes `commentData[0].agent.reason.findingId`; use it to correlate results with your own records.

**Optional annotation fields on add:**

| Field | Notes |
|-------|-------|
| `type` | `'comment'` (default) or `'suggestion'`. Use `'suggestion'` for agent findings and reviewable proposed changes. The legacy `commentType: "suggestion"` no longer drives classification. |
| `suggestion` | Proposed-change payload for `type: 'suggestion'`: `targetId`, `targetType`, `oldValue`, `newValue`, `summary`, `driftDetected`, plus any custom fields. `status` is server-owned and stamped `pending` on create. |
| `visibility` | `{ type: 'public' \| 'organizationPrivate' \| 'restricted', organizationId?, userIds? }`. `organizationPrivate` requires `organizationId`; `restricted` requires non-empty `userIds`. |
| `actions` | Annotation-level default action chips (`CommentAction[]`, max 20). See `data-comment-actions.md`. |
| `commentData[].progress` | Live progress row (`CommentProgress`, `steps` max 100). See `data-comment-progress.md`. |
| `commentData[].actions` | Row-level action chips that override the annotation default. |
| `createOrganization` / `createDocument` | Create the org or document if missing. |
| `verifyUserPermissions` | Check the author can access the document (default `false`). |

**Get Annotations (with filters):**

```javascript
// POST https://api.velt.dev/v2/commentannotations/get
body: JSON.stringify({
  data: {
    organizationId: 'org-1',          // required
    documentIds: ['doc-1'],           // optional, max 30; or documentId
    locationIds: ['locationx'],       // optional
    annotationIds: ['ann-1'],         // optional
    userIds: ['user-1'],              // optional: authors
    mentionedUserIds: ['user-2'],     // optional: annotations that tag these users
    resolvedBy: 'user-3',             // optional: matches resolvedByUserId
    statusIds: ['OPEN'],              // optional
    updatedAfter: 1700000000000,      // optional, ms
    order: 'desc',                    // 'asc' | 'desc' on lastUpdated
    pageSize: 50,                     // default 1000
    pageToken: 'next-token',
  },
}),
// Response: { result: { status, message, data: CommentAnnotation[], nextPageToken } }
```

Agent filters (`agentId`, `executionId`, `agentType`, `agentSource`, `agentSuggestions`, `agentComments`) are covered in `rest-agent-comments-api.md`; only one agent filter is allowed per Get request.

**Update Annotations:**

```javascript
// POST https://api.velt.dev/v2/commentannotations/update
body: JSON.stringify({
  data: {
    organizationId: 'org-1',
    documentId: 'doc-1',
    annotationIds: ['ann-123', 'ann-456'],   // and/or locationIds, userIds
    updatedData: {
      status: { id: 'resolved', name: 'Resolved', type: 'terminal' },
      statusUpdatedByUserId: 'user-1',       // who made the status change; null clears it
      resolvedByUserId: 'user-1',            // matched by the Get `resolvedBy` filter
      priority: { id: 'P1', name: 'P1' },
    },
  },
}),
```

- A non-`terminal` status automatically clears `resolvedByUserId` and `resolvedByUser`; `statusUpdatedByUserId` is kept so you still know who reopened it. Omit a field to leave it unchanged.
- `updatedData.suggestion` **replaces** the stored `suggestion` object; include existing fields when changing one value. Unlike create, `status` (`pending` / `accepted` / `rejected`) is honored here.
- `updatedData.actions` replaces the stored array outright.
- `updateUsers: [{ oldUser, newUser }]` rewrites user references.

**Delete Annotations:**

```javascript
// POST https://api.velt.dev/v2/commentannotations/delete
body: JSON.stringify({
  data: {
    organizationId: 'org-1',
    documentId: 'doc-1',                     // required
    annotationIds: ['ann-123', 'ann-456'],   // optional; also locationIds, userIds
  },
}),
```

With only `organizationId` + `documentId`, every annotation on the document is deleted. The combinable agent filters (`agentId`, `agentSuggestions`, `agentUrls`) are covered in `rest-agent-comments-api.md`.

**Get Counts (total + unread):**

```javascript
// POST https://api.velt.dev/v2/commentannotations/count/get
// Requires advanced queries enabled in the Velt Console
body: JSON.stringify({
  data: {
    organizationId: 'org-1',
    documentIds: ['doc-1', 'doc-2'],   // required, max 30
    userId: 'user-1',                  // required: whose unread count
    statusIds: ['OPEN'],               // optional
  },
}),
// Response: { result: { data: { 'doc-1': { total: 4, unread: 2 }, 'doc-2': { total: 2, unread: 0 } } } }
```

**Verification:**
- [ ] API key and auth token read from server-side environment variables
- [ ] Add responses iterated with `Object.values(result.data)` and `entry.annotationId`, and failed requests checked for partial writes in `error.details`
- [ ] Updates use `annotationIds` / filters plus a single `updatedData` object
- [ ] Status changes send `statusUpdatedByUserId` (and `resolvedByUserId` for terminal statuses)
- [ ] Count requests send `documentIds` (max 30) and `userId`
- [ ] Pagination reads `nextPageToken` and sends it back as `pageToken`

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/add-comment-annotations - Add Comment Annotations
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/get-comment-annotations-v2 - Get Comment Annotations
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/update-comment-annotations - Update Comment Annotations
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/delete-comment-annotations - Delete Comment Annotations
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/get-comment-annotations-count - Get Comment Annotations Count
