---
title: Use agentFields on CommentRequestQuery to Filter Annotation Count by Agent
impact: MEDIUM
impactDescription: Enables precise comment count queries scoped to agent-tagged annotations, avoiding full-collection scans
tags: agent-fields, comment-request-query, getCommentAnnotationCount, agent, filter
---

## Use agentFields on CommentRequestQuery to Filter Annotation Count by Agent

`CommentRequestQuery.agentFields` filters `getCommentAnnotationCount()` to only annotations where `agent.agentFields` contains any of the provided values. This is useful when a document has a mix of human and agent-authored annotations and you want a count scoped to a specific agent. Due to a Firestore `array-contains` limitation, when `agentFields` is set the unread count query is skipped and the unread count is treated as equal to the total count.

**Incorrect (querying all annotation counts without agent scoping):**

```jsx
// Returns total + unread counts across all annotations,
// including those not authored by the target agent
const commentElement = client.getCommentElement();
commentElement.getCommentAnnotationCount({
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
    // when agentFields is set (Firestore array-contains constraint).
    const subscription = commentElement.getCommentAnnotationCount({
      organizationId: 'org-123',
      agentFields: ['agent-1', 'agent-2'],
    }).subscribe((result) => {
      setCount(result);
    });

    return () => subscription.unsubscribe();
  }, [client]);

  return <div>Agent annotations: {count?.totalCount ?? 0}</div>;
}
```

**Correct (Other Frameworks — Angular, Vue, Vanilla JS):**

```typescript
const commentElement = client.getCommentElement();

const subscription = commentElement.getCommentAnnotationCount({
  organizationId: 'org-123',
  agentFields: ['agent-1', 'agent-2'],
}).subscribe((result) => {
  console.log('Agent annotation count:', result);
});
```

**CommentRequestQuery.agentFields:**

| Field | Type | Optional | Description |
|-------|------|----------|-------------|
| `agentFields` | `string[]` | Yes | Filters count queries to annotations where `agent.agentFields` contains any of the provided values. When set, unread count is treated as equal to total count. |

**Behavioral Note:** The unread count query uses a Firestore `array-contains` constraint that cannot be combined with the filter used for unread counting. When `agentFields` is set, Velt skips the separate unread count query and returns `unreadCount === totalCount`. If your UI distinguishes read from unread, do not rely on `unreadCount` when `agentFields` is active.

**Verification Checklist:**
- [ ] `agentFields` values match the strings stored in `agent.agentFields` on the target annotations
- [ ] UI does not display a meaningful unread badge when `agentFields` is set (unread equals total)
- [ ] Subscription is cleaned up on component unmount
- [ ] `organizationId` is always provided alongside `agentFields`

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/models/data-models#commentrequestquery - CommentRequestQuery model
- https://docs.velt.dev/async-collaboration/comments/customize-behavior/data/overview - Data customization overview
