---
title: Use getActivityElement API to Create Custom Activity Records
impact: HIGH
impactDescription: Emit custom application events from any framework into the activity feed
tags: getActivityElement, createActivity, custom, api, sdk
---

## Use getActivityElement API to Create Custom Activity Records

For non-React frameworks or API-based usage, access the activity element via `client.getActivityElement()` (React) or `Velt.getActivityElement()` (other frameworks) to call `createActivity()`.

**Incorrect (calling createActivity without awaiting):**

```js
const activityElement = Velt.getActivityElement();

// Not awaiting — errors silently swallowed
activityElement.createActivity({
  featureType: 'custom',
  actionType: 'custom',
  targetEntityId: 'entity-1',
  displayMessageTemplate: '{{actionUser.name}} performed action',
});
```

**Correct (React API path):**

```jsx
import { useVeltClient } from '@veltdev/react';

function EscalationButton({ ticketId }) {
  const { client } = useVeltClient();

  const logEscalation = async () => {
    const activityElement = client.getActivityElement();
    await activityElement.createActivity({
      featureType: 'custom',
      actionType: 'custom',
      targetEntityId: ticketId,
      displayMessageTemplate: '{{actionUser.name}} escalated ticket {{ticketId}}',
      displayMessageTemplateData: { ticketId },
    });
  };

  return <button onClick={logEscalation}>Escalate</button>;
}
```

**Correct (non-React frameworks):**

```js
const activityElement = Velt.getActivityElement();

// Custom featureType — targetEntityId required; id for idempotency
await activityElement.createActivity({
  id: 'deploy-abc123',         // optional — stable ID for deduplication
  featureType: 'custom',
  actionType: 'custom',
  targetEntityId: 'deploy-v2', // required for 'custom' featureType
  displayMessageTemplate: '{{actionUser.name}} deployed version {{version}}',
  displayMessageTemplateData: { version: 'v2.3.1' },
});

// Built-in featureType — targetEntityId is optional
await activityElement.createActivity({
  featureType: 'comment',      // one of: comment | reaction | recorder | crdt | custom
  actionType: 'custom',
  displayMessageTemplate: '{{actionUser.name}} added a comment',
});
```

**Use cases for custom activities:**
- Deployments and releases
- Status transitions (draft → review → approved)
- Escalations and reassignments
- AI agent actions (for traceability and audit)
- Custom application events not covered by Velt features

**Key details:**
- `createActivity()` returns `Promise<void>` — always await for proper error handling
- `featureType` is validated against an enum: `'comment' | 'reaction' | 'recorder' | 'crdt' | 'custom'` — invalid values are rejected
- `targetEntityId` is **required** when `featureType` is `'custom'`; it is **optional** for built-in featureTypes (`comment`, `reaction`, `recorder`, `crdt`)
- `id` (optional) — provide a stable string to make the Firestore write idempotent; if the same ID is submitted twice, only one record is created
- Custom activities merge into the same feed as Velt-generated activities
- In React, prefer `useActivityUtils()` hook for simpler code (see `data-create-custom-hook` rule)

**Verification:**
- [ ] `createActivity()` awaited
- [ ] Template variables have matching keys in displayMessageTemplateData
- [ ] Activity appears in the feed after creation

**Source Pointer:** https://docs.velt.dev/async-collaboration/activity/setup - Create a Custom Activity (Using API)
