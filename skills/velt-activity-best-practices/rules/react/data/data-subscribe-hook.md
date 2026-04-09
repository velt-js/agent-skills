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
| `organizationId` | `string` | Scope feed to specific organization |
| `documentIds` | `string[]` | Filter to specific documents |
| `currentDocumentOnly` | `boolean` | Limit to current document (auto-switches on setDocument) |
| `maxDays` | `number` | Max age in days (default: 30) |
| `featureTypes` | `ActivityFeatureType[]` | Filter by feature: `'comment'`, `'reaction'`, `'recorder'`, `'crdt'`, `'custom'` |
| `excludeFeatureTypes` | `ActivityFeatureType[]` | Exclude specific feature areas |
| `actionTypes` | `string[]` | Filter by action type (use exported constants) |
| `excludeActionTypes` | `string[]` | Exclude specific action types |
| `userIds` | `string[]` | Filter by specific user IDs |
| `excludeUserIds` | `string[]` | Exclude specific user IDs |

**ActivityRecord (returned by useAllActivities):**

```typescript
interface ActivityRecord {
  id: string;                                    // Unique activity log ID
  featureType: ActivityFeatureType;              // 'comment' | 'reaction' | 'recorder' | 'crdt' | 'custom'
  actionType: string;                            // Specific action (use constants from config-action-type-filters rule)
  eventType?: string;                            // Sub-event type within the action
  actionUser: User;                              // User who performed the action
  timestamp: number;                             // Unix timestamp (ms)
  metadata: ActivityMetadata;                    // Document/org context
  targetEntityId?: string;                       // ID of entity this log targets
  targetSubEntityId?: string | null;             // ID of sub-entity within target
  changes?: ActivityChanges;                     // Before/after field changes: { [key]: { from, to } }
  entityData?: unknown;                          // Full entity object at time of action
  entityTargetData?: unknown;                    // Full target entity object at time of action
  displayMessageTemplate?: string;               // Template with {{variable}} placeholders
  displayMessageTemplateData?: Record<string, unknown>; // Data to resolve template
  displayMessage?: string;                       // Resolved human-readable message (computed client-side)
  actionIcon?: string;                           // Icon URL or identifier for action
  immutable?: boolean;                           // Cannot be updated/deleted if true
  isActivityResolverUsed?: boolean;              // True when PII was stripped by resolver
}

interface ActivityChanges {
  [key: string]: { from: unknown | null; to: unknown | null } | undefined;
}
```

**Key details:**
- Returns `null` while loading — always check before rendering
- Returns `[]` when no activities match
- Emits the full activity list on every change (not incremental diffs)
- Hook handles subscription lifecycle automatically — no cleanup needed
- `displayMessage` is the resolved string; `displayMessageTemplate` is the raw template

**Verification:**
- [ ] Null loading state handled (not rendered as empty list)
- [ ] Filters applied to reduce unnecessary data
- [ ] Hook used within a component inside VeltProvider

**Source Pointer:** https://docs.velt.dev/async-collaboration/activity/customize-behavior - getAllActivities (Using Hook)
