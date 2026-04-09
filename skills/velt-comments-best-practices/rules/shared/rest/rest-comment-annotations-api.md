---
title: REST API — Comment Annotation CRUD
impact: HIGH
impactDescription: Server-side comment annotation management via REST
tags: rest, api, commentannotations, add, get, update, delete, count, server
---

## REST API — Comment Annotation CRUD

Use Velt's REST APIs to manage comment annotations from your backend. All endpoints require `x-velt-api-key` and `x-velt-auth-token` headers.

**Add Annotations:**

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
      location: { id: 1, locationName: 'Page 1' },
      targetElement: { elementId: 'element-1', targetText: 'Selected text' },
      commentData: [{
        commentText: 'This needs review',
        commentHtml: '<p>This needs review</p>',
        from: { userId: 'user-1' },
        taggedUserContacts: [{ text: '@bob', userId: 'user-2', contact: { userId: 'user-2', name: 'Bob', email: 'bob@example.com' } }],
      }],
      status: { id: 'open', name: 'Open', type: 'default' },
      priority: { id: 'high', name: 'High' },
      context: { projectId: 'proj-1', section: 'header' },
      triggerNotification: true,
      triggerActivities: true,
      verifyUserPermissions: false,
    },
  }),
});
```

**Get Annotations (with filters):**

```javascript
// POST https://api.velt.dev/v2/commentannotations/get
const response = await fetch('https://api.velt.dev/v2/commentannotations/get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN,
  },
  body: JSON.stringify({
    data: {
      organizationId: 'org-1',
      documentId: 'doc-1',           // Optional
      locationIds: [1, 2],           // Optional
      annotationIds: ['ann-1'],      // Optional
      userIds: ['user-1'],           // Optional
      statusIds: ['open'],           // Optional
      folderId: 'folder-1',         // Optional
      updatedAfter: 1700000000000,   // Optional: timestamp ms
      createdBefore: 1700100000000,  // Optional: timestamp ms
      pageSize: 50,                  // Default: 1000
      pageToken: 'next-token',      // For pagination
    },
  }),
});
// Response: { result: { status, data: CommentAnnotation[], pageToken } }
```

**Update Annotations:**

```javascript
// POST https://api.velt.dev/v2/commentannotations/update
const response = await fetch('https://api.velt.dev/v2/commentannotations/update', {
  method: 'POST',
  headers: { /* same headers */ },
  body: JSON.stringify({
    data: {
      organizationId: 'org-1',
      documentId: 'doc-1',
      annotations: [{
        annotationId: 'ann-123',
        status: { id: 'resolved', name: 'Resolved', type: 'terminal' },
        priority: { id: 'low', name: 'Low' },
      }],
    },
  }),
});
```

**Delete Annotations:**

```javascript
// POST https://api.velt.dev/v2/commentannotations/delete
const response = await fetch('https://api.velt.dev/v2/commentannotations/delete', {
  method: 'POST',
  headers: { /* same headers */ },
  body: JSON.stringify({
    data: {
      organizationId: 'org-1',
      documentId: 'doc-1',
      annotationIds: ['ann-123', 'ann-456'],
    },
  }),
});
```

**Get Counts (total + unread):**

```javascript
// POST https://api.velt.dev/v2/commentannotations/count/get
const response = await fetch('https://api.velt.dev/v2/commentannotations/count/get', {
  method: 'POST',
  headers: { /* same headers */ },
  body: JSON.stringify({
    data: {
      organizationId: 'org-1',
      documentId: 'doc-1',
    },
  }),
});
// Response: { result: { data: { total: number, unread: number } } }
```

**Key flags:**
- `triggerNotification: true` — sends notification to tagged users
- `triggerActivities: true` — creates activity log record
- `verifyUserPermissions: true` — checks user has document access

**Verification:**
- [ ] API key and auth token in environment variables (not client-side)
- [ ] organizationId included in every request
- [ ] Pagination handled with pageToken for large result sets
- [ ] Correct endpoint URL used

**Source Pointer:** https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/
