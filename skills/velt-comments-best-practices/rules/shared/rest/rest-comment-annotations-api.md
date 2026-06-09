---
title: REST API — Comment Annotation CRUD
impact: HIGH
impactDescription: Server-side comment annotation management via REST
tags: rest, api, commentannotations, add, get, update, delete, count, server, agent, suggestion, agentId, executionId, agentSource
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

**Agent annotations (AI agent findings — type: "suggestion"):**

Agents post comments through the same Add Comment Annotations endpoint by attaching an `agent` block to the root entry of `commentData` and setting the annotation `type` to `"suggestion"`. The server stamps `sourceType: "agent"` on both the comment and the annotation. Findings render with **Accept** and **Reject** buttons in the comment dialog; subscribe to the `suggestionAccepted` / `suggestionRejected` events to react — see [[events-comment-lifecycle]].

```javascript
// POST https://api.velt.dev/v2/commentannotations/add — agent finding
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
        type: 'suggestion',                       // required for accept/reject UI
        commentData: [{
          commentText: 'This button has insufficient color contrast.',
          from: { userId: 'a11y-bot' },
          agent: {                                // attached to commentData[0] only
            agentSource: 'external',              // 'velt' | 'external'
            agentId: 'a11y-bot',
            agentName: 'Accessibility Bot',
            executionId: 'run-2026-06-09-001',    // optional: groups one agent run
            url: 'https://agent.example.com/runs/001', // optional: deep link back
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

**Agent block fields (on `commentData[0].agent`):**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `agentSource` | `'velt' \| 'external'` | Yes | `velt` for findings authored by a Velt-hosted agent; `external` for findings authored by your own agent. |
| `agentId` | `string` | Yes | Stable identifier for the agent (also used as the `from.userId`). |
| `agentName` | `string` | Yes | Display name shown on the suggestion. |
| `executionId` | `string` | No | Identifier shared by every finding from a single agent run — used by the `executionId` filter on Get. |
| `url` | `string` | No | Deep link back to the agent run or report. |
| `reason` | `{ title, description, severity, findingType }` | No | Structured rationale shown in the suggestion body. |

**Filtering agent annotations on Get:**

Add any of the following filters to the Get Annotations request body to scope results to agent comments:

```javascript
// POST https://api.velt.dev/v2/commentannotations/get — agent-scoped filters
body: JSON.stringify({
  data: {
    organizationId: 'acme-corp',
    documentId: 'design-mockup-v2',
    agentId: 'a11y-bot',                  // single agent
    executionId: 'run-2026-06-09-001',    // one agent run
    agentSource: 'external',              // 'velt' | 'external'
    agentSuggestions: true,               // only type: 'suggestion' findings
    agentComments: true,                  // any annotation with an agent block
  },
}),
```

`agentSuggestions` and `agentComments` are mutually informative — `agentSuggestions: true` is a strict subset of `agentComments: true`. Use `agentSuggestions` when you only want accept/reject-capable findings.

**Key flags:**
- `triggerNotification: true` — sends notification to tagged users
- `triggerActivities: true` — creates activity log record
- `verifyUserPermissions: true` — checks user has document access
- `type: 'suggestion'` + `agent` block — required pair for agent findings to render Accept/Reject buttons

**Verification:**
- [ ] API key and auth token in environment variables (not client-side)
- [ ] organizationId included in every request
- [ ] Pagination handled with pageToken for large result sets
- [ ] Correct endpoint URL used
- [ ] Agent findings set `type: 'suggestion'` AND attach `agent` to `commentData[0]` (not to the annotation root)
- [ ] `agentSource` is one of `'velt'` or `'external'` — not a free-form string
- [ ] `executionId` is reused across all findings from a single agent run so the `executionId` filter returns them as a group

**Source Pointer:** https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/
**Source Pointer:** https://docs.velt.dev/async-collaboration/comments/customize-behavior - "Agent Comments"
**Source Pointer:** https://docs.velt.dev/ai/agent-comments
