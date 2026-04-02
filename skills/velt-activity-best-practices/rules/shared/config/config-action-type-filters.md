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
      CommentActivityActionTypes.COMMENT_ADD,
      CommentActivityActionTypes.COMMENT_UPDATE,
      CommentActivityActionTypes.COMMENT_DELETE,
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
    ReactionActivityActionTypes.REACTION_ADD,
    ReactionActivityActionTypes.REACTION_DELETE,
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
    CommentActivityActionTypes.COMMENT_ADD,
    RecorderActivityActionTypes.RECORDING_STARTED,
  ],
});
```

**Available constant objects:**

**CommentActivityActionTypes** (union type: `CommentActivityActionType`):

| Constant | Value | Description |
|----------|-------|-------------|
| `ANNOTATION_ADD` | `'comment_annotation.add'` | Comment annotation added |
| `ANNOTATION_DELETE` | `'comment_annotation.delete'` | Comment annotation deleted |
| `COMMENT_ADD` | `'comment.add'` | Comment added |
| `COMMENT_UPDATE` | `'comment.update'` | Comment updated |
| `COMMENT_DELETE` | `'comment.delete'` | Comment deleted |
| `STATUS_CHANGE` | `'comment_annotation.status_change'` | Status changed |
| `PRIORITY_CHANGE` | `'comment_annotation.priority_change'` | Priority changed |
| `ASSIGN` | `'comment_annotation.assign'` | Assigned |
| `ACCESS_MODE_CHANGE` | `'comment_annotation.access_mode_change'` | Access mode changed |
| `CUSTOM_LIST_CHANGE` | `'comment_annotation.custom_list_change'` | Custom list changed |
| `APPROVE` | `'comment_annotation.approve'` | Approved |
| `ACCEPT` | `'comment.accept'` | Comment accepted |
| `REJECT` | `'comment.reject'` | Comment rejected |
| `REACTION_ADD` | `'comment.reaction_add'` | Reaction added to comment |
| `REACTION_DELETE` | `'comment.reaction_delete'` | Reaction removed from comment |
| `SUBSCRIBE` | `'comment_annotation.subscribe'` | Subscribed to annotation |
| `UNSUBSCRIBE` | `'comment_annotation.unsubscribe'` | Unsubscribed from annotation |

**Other feature constants:**

| Constant Object | Feature | Key Values |
|-----------------|---------|------------|
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
