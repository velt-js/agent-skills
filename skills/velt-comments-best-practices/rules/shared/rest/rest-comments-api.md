---
title: REST API — Individual Comment CRUD Within Annotations
impact: HIGH
impactDescription: Server-side individual comment management via REST
tags: rest, api, comments, add, get, update, delete, server
---

## REST API — Individual Comment CRUD Within Annotations

Manage individual comments within annotation threads from your backend. All endpoints require `x-velt-api-key` and `x-velt-auth-token` headers.

**Add Comments to Annotation:**

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
        commentText: 'Looks good to me',
        commentHtml: '<p>Looks good to me</p>',
        from: { userId: 'user-1' },
        context: { reviewType: 'approval' },
        taggedUserContacts: [],
        attachments: [{
          attachmentId: 'att-1',
          name: 'screenshot.png',
          url: 'https://example.com/screenshot.png',
          mimeType: 'image/png',
          size: 102400,
        }],
      }],
    },
  }),
});
```

**Get Comments:**

```javascript
// POST https://api.velt.dev/v2/commentannotations/comments/get
const response = await fetch('https://api.velt.dev/v2/commentannotations/comments/get', {
  method: 'POST',
  headers: { /* same headers */ },
  body: JSON.stringify({
    data: {
      organizationId: 'org-1',
      documentId: 'doc-1',
      annotationId: 'ann-123',
      userIds: ['user-1'],       // Required
      commentIds: [1, 2, 3],     // Optional: specific comment IDs
    },
  }),
});
// Response includes: commentHtml, commentText, status, reactionAnnotations[]
```

**Update Comments:**

```javascript
// POST https://api.velt.dev/v2/commentannotations/comments/update
const response = await fetch('https://api.velt.dev/v2/commentannotations/comments/update', {
  method: 'POST',
  headers: { /* same headers */ },
  body: JSON.stringify({
    data: {
      organizationId: 'org-1',
      documentId: 'doc-1',
      annotationId: 'ann-123',
      commentIds: [1],
      updatedData: {
        commentText: 'Updated review text',
        commentHtml: '<p>Updated review text</p>',
        context: { reviewType: 'revision' },
      },
    },
  }),
});
```

**Delete Comments:**

```javascript
// POST https://api.velt.dev/v2/commentannotations/comments/delete
const response = await fetch('https://api.velt.dev/v2/commentannotations/comments/delete', {
  method: 'POST',
  headers: { /* same headers */ },
  body: JSON.stringify({
    data: {
      organizationId: 'org-1',
      documentId: 'doc-1',
      annotationId: 'ann-123',
      commentIds: [1, 2],  // Optional — if omitted, deletes all comments in annotation
    },
  }),
});
```

**Key details:**
- `commentIds` are numbers, not strings
- Omitting `commentIds` in delete request removes ALL comments in the annotation
- `userIds` is required for the get endpoint
- Attachments in add request use the same Attachment type as the SDK

**Verification:**
- [ ] organizationId, documentId, annotationId included in every request
- [ ] commentIds are numbers (not strings)
- [ ] Auth headers present
- [ ] Delete without commentIds understood as "delete all"

**Source Pointer:** https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/
