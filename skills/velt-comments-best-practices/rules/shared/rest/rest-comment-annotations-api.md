---
title: REST API — Comment Annotation CRUD
impact: HIGH
impactDescription: Server-side comment annotation management via REST
tags: rest, api, commentannotations, add, get, update, delete, count, server, agent, agentSource, agentId, executionId, agentName, agentSuggestions, agentComments, suggestion, suggestionAccepted, suggestionRejected
---

## REST API — Comment Annotation CRUD

Use Velt's REST APIs to manage comment annotations from your backend. All endpoints require `x-velt-api-key` and `x-velt-auth-token` headers.

> **Agent annotations?** If the task involves AI agents, agent comments, agent suggestions, agentSource, executionId, or accept/reject — the agent block goes on `commentData[0]` with `type: "suggestion"`, `agentName` (required for external), and a `reason` object. See `rest-agent-comments-api.md` for the full reference and code examples. Use `suggestionAccepted`/`suggestionRejected` events on the client to handle reviewer decisions.

**Add Annotations:**

The request body uses `data.commentAnnotations` — an array of annotation objects, each containing a `commentData` array.

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
        commentData: [{
          commentText: 'This needs review',
          commentHtml: '<p>This needs review</p>',
          from: { userId: 'user-1' },
        }],
      }],
    },
  }),
});
```

**Add Agent Annotations (AI agent findings with Accept/Reject buttons):**

To let an AI agent leave findings as comments, set `type: "suggestion"` on the annotation and attach an `agent` object to `commentData[0]` with `agentSource`, `agentName` (required for external), and `reason`. The server stamps `sourceType: "agent"` and renders Accept/Reject buttons. See `rest-agent-comments-api.md` for the full reference.

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
      organizationId: 'acme-corp',
      documentId: 'design-mockup-v2',
      commentAnnotations: [{
        type: 'suggestion',
        commentData: [{
          commentText: 'This button has insufficient color contrast.',
          from: { userId: 'a11y-bot' },
          agent: {
            agentSource: 'external',
            agentName: 'Accessibility Bot',
            agentId: 'a11y-bot',
            executionId: 'run_8f21',
            reason: {
              title: 'Low color contrast',
              description: 'Contrast ratio is 2.1:1, below the 4.5:1 WCAG AA threshold.',
              severity: 'high',
              findingType: 'pin',
            },
          },
        }],
      }],
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

**Get Agent Annotations (agent-specific filters):**

Use these filters to query agent-created annotations. Only one agent filter per request.

| Filter | Description |
|--------|-------------|
| `agentId` | Annotations created by a specific agent. |
| `executionId` | Annotations from a specific agent run. |
| `agentSource` | `"velt"` or `"external"`. |
| `agentSuggestions` | When `true`, returns only fresh (unaccepted) agent suggestions. |
| `agentComments` | When `true`, returns all agent annotations regardless of status. |

```javascript
// Get all findings from a specific agent run
const response = await fetch('https://api.velt.dev/v2/commentannotations/get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN,
  },
  body: JSON.stringify({
    data: {
      organizationId: 'acme-corp',
      documentId: 'design-mockup-v2',
      executionId: 'run_8f21',
    },
  }),
});

// Get only pending (unaccepted) agent suggestions
const pending = await fetch('https://api.velt.dev/v2/commentannotations/get', {
  method: 'POST',
  headers: { /* same headers */ },
  body: JSON.stringify({
    data: {
      organizationId: 'acme-corp',
      documentId: 'design-mockup-v2',
      agentSuggestions: true,
    },
  }),
});
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
