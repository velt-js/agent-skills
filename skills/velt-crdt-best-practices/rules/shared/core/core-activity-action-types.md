---
title: Use CrdtActivityActionTypes for Type-Safe Activity Filtering
impact: MEDIUM
impactDescription: Eliminates raw-string action type errors when filtering CRDT activities
tags: activity, action-types, type-safety, filtering, crdt-element
---

## Use CrdtActivityActionTypes for Type-Safe Activity Filtering

The `CrdtActivityActionTypes` exported constant provides the canonical string values for CRDT action types. Use it — and the accompanying `CrdtActivityActionType` union type — instead of raw strings when building `ActionSubscribeConfig.actionTypes` filters, so that typos are caught at compile time and the code self-documents intent.

**Incorrect (raw string values for action type filtering):**

```typescript
// Raw strings are error-prone and not refactor-safe
const activities = activityElement.getAllActivities({
  actionTypes: ['crdt.editor_edit'],
});
```

**Correct (React / Next.js — type-safe filtering with CrdtActivityActionTypes):**

```jsx
import { CrdtActivityActionTypes } from '@veltdev/react';
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function CrdtActivityFilter() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const activityElement = client.getActivityElement();

    // Type-safe filtering of CRDT activities
    const subscription = activityElement.getAllActivities({
      actionTypes: [
        CrdtActivityActionTypes.EDITOR_EDIT,
      ],
    }).subscribe((activities) => {
      console.log('CRDT edit activities:', activities);
    });

    return () => subscription.unsubscribe();
  }, [client]);
}
```

**Correct (Other Frameworks — Angular, Vue, Vanilla JS):**

```typescript
import { CrdtActivityActionTypes } from '@veltdev/types';

const activityElement = client.getActivityElement();

const subscription = activityElement.getAllActivities({
  actionTypes: [
    CrdtActivityActionTypes.EDITOR_EDIT,
  ],
}).subscribe((activities) => {
  console.log('CRDT edit activities:', activities);
});
```

**Members:**

| Constant Key | String Value |
|--------------|--------------|
| `EDITOR_EDIT` | `'crdt.editor_edit'` |

`EDITOR_EDIT` is the only member listed in the data-models reference.

**Verification Checklist:**
- [ ] `CrdtActivityActionTypes` imported from `@veltdev/react` (React) or `@veltdev/types` (other frameworks)
- [ ] `CrdtActivityActionType` union type used for typed `actionTypes` arrays
- [ ] No raw string literals used for CRDT action type values
- [ ] Activity subscriptions cleaned up on unmount

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/models/data-models#activitysubscribeconfig - ActivitySubscribeConfig
- https://docs.velt.dev/api-reference/sdk/models/data-models#crdtactivityactiontypes - CrdtActivityActionTypes
- https://docs.velt.dev/async-collaboration/activity/overview#activity-log-action-types - Activity Log Action Types
