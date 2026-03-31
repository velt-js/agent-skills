---
title: Use useAllActivities Hook for Real-Time Activity Feeds
impact: HIGH
impactDescription: Real-time activity data in React components without manual subscription management
tags: hooks, useAllActivities, react, subscribe, real-time, filter, documentIds, featureTypes, actionTypes
---

## Use useAllActivities Hook for Real-Time Activity Feeds

The `useAllActivities` hook returns a reactive array of ActivityRecord objects that updates automatically when new activity occurs. It returns `null` while loading — this must be handled explicitly.

**Incorrect (not handling null loading state):**

```jsx
import { useAllActivities } from '@veltdev/react';

function ActivityFeed() {
  const activities = useAllActivities();

  // TypeError: Cannot read properties of null (reading 'map')
  return activities.map(a => <div>{a.displayMessage}</div>);
}
```

**Correct (org-wide feed with null handling):**

```jsx
import { useAllActivities } from '@veltdev/react';

function ActivityFeed() {
  // No config = org-wide feed (all documents, all features)
  const activities = useAllActivities();

  if (activities === null) return <div>Loading activities...</div>;
  if (activities.length === 0) return <div>No activity yet</div>;

  return (
    <ul>
      {activities.map(a => (
        <li key={a.id}>
          <span>{a.displayMessage}</span>
          <time>{new Date(a.timestamp).toLocaleString()}</time>
        </li>
      ))}
    </ul>
  );
}
```

**Correct (document-scoped feed with filters):**

```jsx
import { useAllActivities } from '@veltdev/react';

function DocumentActivityFeed({ documentId }) {
  // Filter to a specific document and feature types
  const activities = useAllActivities({
    documentIds: [documentId],
    featureTypes: ['comment', 'reaction'],
  });

  if (activities === null) return <div>Loading...</div>;

  return (
    <ul>
      {activities.map(a => (
        <li key={a.id}>{a.displayMessage}</li>
      ))}
    </ul>
  );
}
```

**Correct (filtered by action types):**

```jsx
import { useAllActivities } from '@veltdev/react';

function CommentActivityFeed() {
  const activities = useAllActivities({
    featureTypes: ['comment'],
    actionTypes: ['commentAdded', 'commentUpdated'],
  });

  if (activities === null) return null;

  return activities.map(a => <div key={a.id}>{a.displayMessage}</div>);
}
```

**Filter options (ActivitySubscribeConfig):**

| Property | Type | Description |
|----------|------|-------------|
| `documentIds` | `string[]` | Filter to specific documents |
| `featureTypes` | `ActivityFeatureType[]` | Filter by feature: `'comment'`, `'reaction'`, `'recorder'`, `'crdt'`, `'custom'` |
| `actionTypes` | `string[]` | Filter by action type (use exported constants) |

**Key details:**
- Returns `null` while loading — always check before rendering
- Returns `[]` when no activities match
- Emits the full activity list on every change (not incremental diffs)
- Hook handles subscription lifecycle automatically — no cleanup needed

**Verification:**
- [ ] Null loading state handled (not rendered as empty list)
- [ ] Filters applied to reduce unnecessary data
- [ ] Hook used within a component inside VeltProvider

**Source Pointer:** https://docs.velt.dev/async-collaboration/activity/customize-behavior - getAllActivities (Using Hook)
