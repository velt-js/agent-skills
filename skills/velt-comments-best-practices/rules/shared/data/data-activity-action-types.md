---
title: Use CommentActivityActionTypes for Type-Safe Comment Activity Filtering
impact: MEDIUM
impactDescription: Eliminates raw-string action type errors when filtering comment activities
tags: activity, action-types, type-safety, filtering, comment-element
---

## Use CommentActivityActionTypes for Type-Safe Comment Activity Filtering

The `CommentActivityActionTypes` exported constant provides the canonical string values for all comment action types. Use it — and the accompanying `CommentActivityActionType` union type — instead of raw strings when building `ActivitySubscribeConfig.actionTypes` filters, so that typos are caught at compile time and the code self-documents intent.

**Incorrect (raw string values for action type filtering):**

```typescript
// Raw strings are error-prone and not refactor-safe
const activities = activityElement.getAllActivities({
  actionTypes: ['comment_annotation.add', 'comment_annotation.status_change'],
});
```

**Correct (React / Next.js — type-safe filtering with CommentActivityActionTypes):**

```jsx
import { CommentActivityActionTypes } from '@veltdev/react';
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function CommentActivityFilter() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const activityElement = client.getActivityElement();

    // Type-safe filtering of comment activities
    const subscription = activityElement.getAllActivities({
      actionTypes: [
        CommentActivityActionTypes.ANNOTATION_ADD,
        CommentActivityActionTypes.STATUS_CHANGE,
      ],
    }).subscribe((activities) => {
      console.log('Comment activities:', activities);
    });

    return () => subscription.unsubscribe();
  }, [client]);
}
```

**Correct (Other Frameworks — Angular, Vue, Vanilla JS):**

```typescript
import { CommentActivityActionTypes } from '@veltdev/types';

const activityElement = client.getActivityElement();

const subscription = activityElement.getAllActivities({
  actionTypes: [
    CommentActivityActionTypes.ANNOTATION_ADD,
    CommentActivityActionTypes.STATUS_CHANGE,
  ],
}).subscribe((activities) => {
  console.log('Comment activities:', activities);
});
```

**Full Constant Definition (v5.0.2-beta.7):**

```typescript
import { CommentActivityActionTypes, CommentActivityActionType } from '@veltdev/react';

const CommentActivityActionTypes = {
  ANNOTATION_ADD: 'comment_annotation.add',
  ANNOTATION_DELETE: 'comment_annotation.delete',
  COMMENT_ADD: 'comment.add',
  COMMENT_UPDATE: 'comment.update',
  COMMENT_DELETE: 'comment.delete',
  STATUS_CHANGE: 'comment_annotation.status_change',
  PRIORITY_CHANGE: 'comment_annotation.priority_change',
  ASSIGN: 'comment_annotation.assign',
  ACCESS_MODE_CHANGE: 'comment_annotation.access_mode_change',
  CUSTOM_LIST_CHANGE: 'comment_annotation.custom_list_change',
  APPROVE: 'comment_annotation.approve',
  ACCEPT: 'comment.accept',
  REJECT: 'comment.reject',
  REACTION_ADD: 'comment.reaction_add',
  REACTION_DELETE: 'comment.reaction_delete',
  SUBSCRIBE: 'comment_annotation.subscribe',
  UNSUBSCRIBE: 'comment_annotation.unsubscribe',
} as const;

type CommentActivityActionType =
  typeof CommentActivityActionTypes[keyof typeof CommentActivityActionTypes];
```

<!-- TODO (v5.0.2-beta.7): Verify the complete member list for CommentActivityActionTypes. Release note confirms ANNOTATION_ADD and STATUS_CHANGE and that the constant exists; all 17 members above are supplied in the release delta but should be validated against SDK source before shipping to production. -->

**Verification Checklist:**
- [ ] `CommentActivityActionTypes` imported from `@veltdev/react` (React) or `@veltdev/types` (other frameworks)
- [ ] `CommentActivityActionType` union type used for typed `actionTypes` arrays
- [ ] No raw string literals used for comment action type values
- [ ] Activity subscriptions cleaned up on unmount

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/models/data-models#activitysubscribeconfig - ActivitySubscribeConfig
- https://docs.velt.dev/async-collaboration/comments/setup/popover - Comments Setup
