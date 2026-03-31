---
title: Use getAllActivities API for Real-Time Activity Subscriptions
impact: HIGH
impactDescription: Framework-agnostic real-time activity feed with subscription cleanup
tags: getAllActivities, subscribe, observable, unsubscribe, cleanup, activityElement, getActivityElement
---

## Use getAllActivities API for Real-Time Activity Subscriptions

For non-React frameworks or when you need manual subscription control, use `getActivityElement().getAllActivities()` which returns an Observable. Subscriptions must be cleaned up to prevent memory leaks.

**Incorrect (subscription without cleanup):**

```jsx
import { useVeltClient } from '@veltdev/react';

function ActivityFeed() {
  const { client } = useVeltClient();

  useEffect(() => {
    const activityElement = client.getActivityElement();
    // Memory leak — subscription never cleaned up
    activityElement.getAllActivities().subscribe((activities) => {
      console.log(activities);
    });
  }, [client]);
}
```

**Correct (React API with proper cleanup):**

```jsx
import { useVeltClient } from '@veltdev/react';

function ActivityFeed() {
  const { client } = useVeltClient();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const activityElement = client.getActivityElement();
    const subscription = activityElement.getAllActivities().subscribe((data) => {
      if (data === null) return; // Loading
      setActivities(data);
    });

    // Clean up subscription on unmount
    return () => subscription?.unsubscribe();
  }, [client]);

  return activities.map(a => <div key={a.id}>{a.displayMessage}</div>);
}
```

**Correct (with filters):**

```jsx
useEffect(() => {
  const activityElement = client.getActivityElement();
  const subscription = activityElement.getAllActivities({
    documentIds: ['my-document-id'],
    featureTypes: ['comment', 'reaction'],
  }).subscribe((data) => {
    if (data !== null) setActivities(data);
  });

  return () => subscription?.unsubscribe();
}, [client]);
```

**For non-React frameworks (vanilla JS, Vue, Angular):**

```js
const activityElement = Velt.getActivityElement();

// Org-wide subscription
const subscription = activityElement.getAllActivities().subscribe((activities) => {
  if (activities === null) return; // Loading
  renderActivityFeed(activities);
});

// Document-scoped subscription
const subscription = activityElement.getAllActivities({
  documentIds: ['doc-123'],
  featureTypes: ['comment'],
}).subscribe((activities) => {
  if (activities !== null) renderActivityFeed(activities);
});

// Cleanup when done
subscription.unsubscribe();
```

**Key details:**
- `getAllActivities()` returns `Observable<ActivityRecord[] | null>`
- Must call `.subscribe()` — it returns an Observable, not a Promise
- Emits `null` while loading, `[]` when no activities
- Emits the full list on every change
- In React, prefer `useAllActivities()` hook for simpler code (see `data-subscribe-hook` rule)

**Verification:**
- [ ] Subscription stored in variable for cleanup
- [ ] `.unsubscribe()` called on component unmount or when done
- [ ] Null emissions handled (loading state)
- [ ] Using `getActivityElement()` not `getActivityElement` (must call the function)

**Source Pointer:** https://docs.velt.dev/async-collaboration/activity/customize-behavior - getAllActivities (Using API)
