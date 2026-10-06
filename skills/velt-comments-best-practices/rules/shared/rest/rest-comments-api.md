---
title: REST API — Individual Comment CRUD Within Annotations
impact: HIGH
impactDescription: Server-side individual comment management via REST
tags: rest, api, comments, add, get, update, delete, server, progress, actions, triggerNotification, taggedUserContacts, attachments, agent
---

## REST API — Individual Comment CRUD Within Annotations

Manage individual comments inside an existing annotation thread from your backend. The endpoints live under `/v2/commentannotations/comments/*` (not `/v2/comments/*`). All require `x-velt-api-key` and `x-velt-auth-token` headers and a `{ data: {...} }` body.

**Incorrect (wrong path, missing `from` on update, notification flag in the wrong place):**

```javascript
await fetch('https://api.velt.dev/v2/comments/update', {   // wrong path
  method: 'POST',
  body: JSON.stringify({ data: { organizationId: 'org-1', documentId: 'doc-1', annotationId: 'ann-123',
    commentIds: [1],
    updatedData: { commentText: 'Done', triggerNotification: true } } }), // `from` missing; flag must be at data root
});
```

**Add Comments to an Annotation:**

```javascript
// POST https://api.velt.dev/v2/commentannotations/comments/add
const response = await fetch('https://api.velt.dev/v2/commentannotations/comments/add', {
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
      annotationId: 'ann-123',
      commentData: [{
        commentText: 'Looks good to me {{user-2}}',
        commentHtml: '<p>Looks good to me {{user-2}}</p>',
        from: { userId: 'user-1' },                         // required
        context: { reviewType: 'approval' },
        taggedUserContacts: [{
          text: '@Jane',
          userId: 'user-2',
          contact: { userId: 'user-2', name: 'Jane', email: 'jane@example.com' },
        }],
        attachments: [{
          attachmentId: 1001,                                // number
          name: 'screenshot.png',
          url: 'https://example.com/screenshot.png',
          mimeType: 'image/png',
          size: 102400,
        }],
        triggerNotification: true,                           // one notification for this reply; never persisted
      }],
    },
  }),
});
// Response: { result: { status, message, data: [778115] } }  // new commentIds
```

`commentData[]` also accepts `progress` (live progress row, `steps` max 100), `actions` (row-level action chips, max 20), and an `agent` block for agent replies. Annotation-level fields such as `type` are not accepted here; the reply inherits its annotation's type.

**Get Comments:**

```javascript
// POST https://api.velt.dev/v2/commentannotations/comments/get
body: JSON.stringify({
  data: {
    organizationId: 'org-1',
    documentId: 'doc-1',
    annotationId: 'ann-123',
    userIds: ['user-1'],       // required
    commentIds: [1, 2, 3],     // optional
  },
}),
```

**Update Comments:**

```javascript
// POST https://api.velt.dev/v2/commentannotations/comments/update
body: JSON.stringify({
  data: {
    organizationId: 'org-1',
    documentId: 'doc-1',
    annotationId: 'ann-123',
    commentIds: [153783],                 // required
    triggerNotification: true,            // root level only; sends exactly one notification
    updatedData: {
      from: { userId: 'agent-1' },        // required
      commentText: 'Here is the answer.',
      progress: { state: 'completed' },   // replaces stored progress outright
      actions: [{ id: 'approve', label: 'Approve' }], // replaces stored actions outright
    },
  },
}),
```

Every update rewrites the whole annotation document, so keep `progress` updates to roughly one write per second per comment and send a step's final label instead of every token.

**Delete Comments:**

```javascript
// POST https://api.velt.dev/v2/commentannotations/comments/delete
body: JSON.stringify({
  data: {
    organizationId: 'org-1',
    documentId: 'doc-1',
    annotationId: 'ann-123',
    commentIds: [1, 2],  // optional: omit to delete all comments in the annotation
  },
}),
```

**Key details:**
- `commentIds` and `attachmentId` are numbers, not strings.
- `userIds` is required on Get; `from` is required in `updatedData` on Update.
- `triggerNotification` on Update must sit at the `data` root, not inside `updatedData`; on Add it sits on each `commentData` entry.
- `progress` and `actions` in `updatedData` replace the stored values; they are not deep-merged.

**Verification:**
- [ ] Paths use `/v2/commentannotations/comments/{add|get|update|delete}`
- [ ] `organizationId`, `documentId`, and `annotationId` included in every request
- [ ] Update payload includes `updatedData.from` and puts `triggerNotification` at the root
- [ ] Delete without `commentIds` understood as "delete all comments in the annotation"
- [ ] Tagged users appear as `{{userId}}` in text/HTML with a matching `taggedUserContacts` entry

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/add-comments - Add Comments
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/get-comments - Get Comments
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/update-comments - Update Comments
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/delete-comments - Delete Comments
