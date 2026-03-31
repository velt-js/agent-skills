---
title: Enable Activity Logs in Velt Console
impact: CRITICAL
impactDescription: Required for activity logs to function
tags: activity, setup, console, enable
---

## Enable Activity Logs in Velt Console

Activity Logs are disabled by default. They must be enabled in the Velt Console before any SDK hooks, API subscriptions, or REST API calls will return data.

**Incorrect (using activity APIs without console setup):**

```jsx
import { useAllActivities } from '@veltdev/react';

function ActivityFeed() {
  // This will always return null — Activity Logs not enabled in Console
  const activities = useAllActivities();

  return (
    <div>
      {activities?.map(a => <div key={a.id}>{a.displayMessage}</div>)}
    </div>
  );
}
```

**Correct (enable in Console first, then subscribe):**

```jsx
import { useAllActivities } from '@veltdev/react';

function ActivityFeed() {
  // Step 1: Enable Activity Logs in Velt Console at
  //   console.velt.dev > Dashboard > Configuration > Activity Logs
  // Step 2: Subscribe to activity feed
  const activities = useAllActivities();

  if (activities === null) return <div>Loading...</div>;
  if (activities.length === 0) return <div>No activity yet</div>;

  return (
    <div>
      {activities.map(a => (
        <div key={a.id}>{a.displayMessage}</div>
      ))}
    </div>
  );
}
```

**For non-React frameworks:**

```js
// After enabling in Console:
const activityElement = Velt.getActivityElement();
activityElement.getAllActivities().subscribe((activities) => {
  if (activities === null) return; // Loading
  console.log('Activities:', activities);
});
```

**Setup Steps:**

1. **Enable in Console**: Go to [console.velt.dev](https://console.velt.dev) > Dashboard > Configuration > Activity Logs and toggle on
2. **Verify**: Subscribe to activities and confirm data flows

**Verification:**
- [ ] Activity Logs enabled in Velt Console
- [ ] VeltProvider configured with API key
- [ ] User authenticated via Velt
- [ ] Basic subscription returns activity data (not perpetually null)

**Source Pointer:** https://docs.velt.dev/async-collaboration/activity/setup - Enable Activity Logs in the Velt Console
