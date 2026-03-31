---
title: Use Action Type Constants for Type-Safe Activity Filtering
impact: MEDIUM
impactDescription: Prevent typos and ensure valid filter values with exported constants
tags: actionTypes, CommentActivityActionTypes, RecorderActivityActionTypes, ReactionActivityActionTypes, CrdtActivityActionTypes, filter, constants
---

## Use Action Type Constants for Type-Safe Activity Filtering

Velt exports constant objects for each feature's action types. Use these instead of raw strings to avoid typos, get IDE autocomplete, and ensure filters reference valid action types.

**Incorrect (raw strings prone to typos):**

```jsx
const activities = useAllActivities({
  featureTypes: ['comment'],
  // Typo: 'comment_add' instead of correct value — silently returns no results
  actionTypes: ['comment_add'],
});
```

**Correct (imported constants with autocomplete):**

```jsx
import {
  useAllActivities,
  CommentActivityActionTypes,
  ReactionActivityActionTypes,
} from '@veltdev/react';

function CommentActivityFeed() {
  const activities = useAllActivities({
    featureTypes: ['comment'],
    actionTypes: [
      CommentActivityActionTypes.COMMENT_ADDED,
      CommentActivityActionTypes.COMMENT_UPDATED,
      CommentActivityActionTypes.COMMENT_DELETED,
    ],
  });

  if (activities === null) return null;
  return activities.map(a => <div key={a.id}>{a.displayMessage}</div>);
}
```

**Filtering reactions:**

```jsx
import { ReactionActivityActionTypes } from '@veltdev/react';

const activities = useAllActivities({
  featureTypes: ['reaction'],
  actionTypes: [
    ReactionActivityActionTypes.REACTION_ADDED,
    ReactionActivityActionTypes.REACTION_REMOVED,
  ],
});
```

**Filtering across feature types:**

```jsx
import {
  CommentActivityActionTypes,
  RecorderActivityActionTypes,
} from '@veltdev/react';

const activities = useAllActivities({
  featureTypes: ['comment', 'recorder'],
  actionTypes: [
    CommentActivityActionTypes.COMMENT_ADDED,
    RecorderActivityActionTypes.RECORDING_STARTED,
  ],
});
```

**Available constant objects:**

| Constant Object | Feature | Example Values |
|-----------------|---------|----------------|
| `CommentActivityActionTypes` | Comments | `COMMENT_ADDED`, `COMMENT_UPDATED`, `COMMENT_DELETED`, `STATUS_CHANGED`, `MENTION_ADDED` |
| `RecorderActivityActionTypes` | Recorder | `RECORDING_STARTED`, `RECORDING_STOPPED` |
| `ReactionActivityActionTypes` | Reactions | `REACTION_ADDED`, `REACTION_REMOVED` |
| `CrdtActivityActionTypes` | CRDT | `CRDT_EDITED` |

**For non-React frameworks:**

```js
// Import constants from the Velt client SDK
const activityElement = Velt.getActivityElement();
activityElement.getAllActivities({
  featureTypes: ['comment'],
  actionTypes: ['commentAdded', 'commentUpdated'],
}).subscribe((activities) => {
  // Handle activities
});
```

**Key details:**
- Constants are exported from `@veltdev/react` (React) or available on the Velt client SDK
- Using constants enables IDE autocomplete and catches typos at compile time
- Combine `featureTypes` and `actionTypes` filters for precise scoping
- Custom activities use `featureType: 'custom'` and `actionType: 'custom'` (no constants needed)

**Verification:**
- [ ] Action type constants imported from SDK (not using raw strings)
- [ ] Filters match the intended feature and action types
- [ ] Activity feed returns expected results with filters applied

**Source Pointer:** https://docs.velt.dev/async-collaboration/activity/overview - Activity Log Action Types
