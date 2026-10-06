---
title: Use agentFields on CommentRequestQuery to Filter Annotation Count by Agent
impact: MEDIUM
impactDescription: Enables precise comment count queries scoped to agent-tagged annotations, avoiding full-collection scans
tags: agent-fields, comment-request-query, getCommentAnnotationsCount, agent, filter, AgentData
---

## Use agentFields on CommentRequestQuery to Filter Annotation Count by Agent

> **This rule is about QUERYING annotation counts on the frontend**, not about CREATING annotations. To create agent annotations via REST API, see `rest-agent-comments-api.md` — the creation API uses `agentName`, `reason`, `type: "suggestion"`, and `executionId` on `commentData[0].agent`. Do not confuse `agentFields` (a query-side filter) with the creation-side `agent` block fields.

`CommentRequestQuery.agentFields` filters `getCommentAnnotationsCount()` to only annotations where `agent.agentFields` contains any of the provided values. This is useful when a document has a mix of human and agent-authored annotations and you want a count scoped to a specific agent. When `agentFields` is set, the unread count equals the total count.

**Incorrect (querying all annotation counts without agent scoping):**

```jsx
// Returns total + unread counts across all annotations,
// including those not authored by the target agent
const commentElement = client.getCommentElement();
commentElement.getCommentAnnotationsCount({
  organizationId: 'org-123',
});
```

**Correct (React / Next.js — scoped count query with agentFields):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect, useState } from 'react';

function AgentCommentCount() {
  const { client } = useVeltClient();
  const [count, setCount] = useState(null);

  useEffect(() => {
    if (!client) return;
    const commentElement = client.getCommentElement();

    // Filters to annotations where agent.agentFields contains
    // 'agent-1' or 'agent-2'. Unread count equals total count
    // when agentFields is set.
    const subscription = commentElement.getCommentAnnotationsCount({
      organizationId: 'org-123',
      agentFields: ['agent-1', 'agent-2'],
    }).subscribe((response) => {
      // response.data: Record<documentId, { total, unread }>, null while loading
      setCount(response?.data);
    });

    return () => subscription.unsubscribe();
  }, [client]);

  const total = Object.values(count ?? {}).reduce((sum, c) => sum + c.total, 0);
  return <div>Agent annotations: {total}</div>;
}
```

**Correct (Other Frameworks — Angular, Vue, Vanilla JS):**

```typescript
const commentElement = Velt.getCommentElement();

const subscription = commentElement.getCommentAnnotationsCount({
  organizationId: 'org-123',
  agentFields: ['agent-1', 'agent-2'],
}).subscribe((response) => {
  console.log('Agent annotation count:', response?.data);
});
subscription?.unsubscribe();
```

React hook equivalent: `const { data } = useCommentAnnotationsCount({ organizationId: 'org-123', agentFields: ['agent-1'] });`

**CommentRequestQuery.agentFields:**

| Field | Type | Optional | Description |
|-------|------|----------|-------------|
| `agentFields` | `string[]` | Yes | Filters count queries to annotations where `agent.agentFields` contains any of the provided values. When set, unread count is treated as equal to total count. |

**Behavioral Note:** When `agentFields` is set, the returned `unread` count equals `total`. If your UI distinguishes read from unread, do not rely on `unread` when `agentFields` is active.

**AgentData (set on `Comment.agent`):**

The AI-agent identity + output payload attached to an agent-authored `Comment` (set on `Comment.agent` when `Comment.sourceType === 'agent'`). Read-only from the SDK; populated when the annotation is created via the REST API `agent` block. The `agentFields` array on this payload is the field that `CommentRequestQuery.agentFields` filters against.

```typescript
interface AgentData {
  agentName?: string;            // Agent identifier. Always retained for agent-field querying.
  name?: string;                 // Agent display name.
  avatar?: string;               // Agent avatar URL.
  result?: { title?: string };   // Structured agent output; `title` renders in the agent suggestion card.
  agentFields?: string[];        // Agent field tags used by CommentRequestQuery.agentFields.
}
```

The annotation-level `CommentAnnotationAgent` (see `data-types-reference.md`) is a sibling shape used on `CommentAnnotation.agent`; `AgentData` is its comment-level counterpart on `Comment.agent`. Both surface `agentFields` for the same query-side filter.

**Verification Checklist:**
- [ ] `agentFields` values match the strings stored in `agent.agentFields` on the target annotations
- [ ] UI does not display a meaningful unread badge when `agentFields` is set (unread equals total)
- [ ] Subscription is cleaned up on component unmount
- [ ] `organizationId` is always provided alongside `agentFields`
- [ ] When reading `Comment.agent`, use the `AgentData` shape (`agentName`, `name`, `avatar`, `result.title`, `agentFields`); do not mutate it from the client

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/models/data-models#commentrequestquery - CommentRequestQuery model
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#getcommentannotationscount - getCommentAnnotationsCount
- https://docs.velt.dev/api-reference/sdk/models/data-models#getcommentannotationscountresponse - GetCommentAnnotationsCountResponse
