---
title: Set Up Activity Logs with an Authenticated User and a Feed Surface
impact: CRITICAL
impactDescription: Activity records are scoped to the signed-in user's organization and documents; without auth and a feed surface nothing renders
tags: activity, setup, authProvider, VeltActivityLog, useAllActivities, activityServiceConfig, workspace
---

## Set Up Activity Logs with an Authenticated User and a Feed Surface

Activity Logs need an authenticated user inside `VeltProvider` and a place to show records: the prebuilt `VeltActivityLog` component or a `useAllActivities()` / `getAllActivities()` subscription. The current setup guide has no Velt Console enable step; you add the component, optionally create custom activities, and subscribe. Velt generates records for Comments, Reactions, Recorder, and CRDT automatically. Activity Logs shipped in the 5.0.2-beta line; use a current SDK.

**Incorrect (no authenticated user, no loading state):**

```jsx
import { VeltProvider, useAllActivities } from '@veltdev/react';

function App() {
  // No authProvider: there is no user/organization to scope activity to
  return (
    <VeltProvider apiKey="API_KEY">
      <ActivityFeed />
    </VeltProvider>
  );
}

function ActivityFeed() {
  const activities = useAllActivities();
  // Crashes while loading: activities is null
  return activities.map((a) => <div key={a.id}>{a.displayMessage}</div>);
}
```

**Correct (authProvider + prebuilt component or hook with null handling):**

```jsx
import { VeltProvider, VeltActivityLog, useAllActivities } from '@veltdev/react';

const authProvider = user ? {
  user: {
    userId: user.userId,
    organizationId: user.organizationId,
    name: user.name,
    email: user.email,
  },
  retryConfig: { retryCount: 3, retryDelay: 1000 },
  generateToken: async () => {
    const resp = await fetch('/api/velt/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.userId, organizationId: user.organizationId }),
    });
    const { token } = await resp.json();
    return token;
  },
} : undefined;

function App() {
  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY} authProvider={authProvider}>
      {/* Option 1: prebuilt, filterable timeline grouped by date */}
      <VeltActivityLog />
      {/* Option 2: custom UI from the subscription */}
      <ActivityFeed />
    </VeltProvider>
  );
}

function ActivityFeed() {
  const activities = useAllActivities();
  if (activities === null) return <div>Loading...</div>;
  if (activities.length === 0) return <div>No activity yet</div>;
  return activities.map((a) => <div key={a.id}>{a.displayMessage}</div>);
}
```

**For non-React frameworks:**

```html
<velt-activity-log></velt-activity-log>

<script>
  const activityElement = Velt.getActivityElement();
  const subscription = activityElement.getAllActivities().subscribe((activities) => {
    if (activities === null) return; // Loading
    console.log(activities.map((a) => a.displayMessage));
  });
  // subscription?.unsubscribe();
</script>
```

**Setup Steps:**

1. **Authenticate**: configure `VeltProvider` with `authProvider` (not the deprecated `useIdentify`)
2. **Add the feed**: render `VeltActivityLog` / `<velt-activity-log>` (use `useDummyData` only while prototyping)
3. **Create custom activities (optional)**: `createActivity()` or the Add Activities REST API
4. **Subscribe (optional)**: `useAllActivities()` / `getAllActivities()` when building your own UI

**Workspace-level activity config:** activity logging is also controlled by the workspace `activityServiceConfig` (`isEnabled`, `immutable`, `triggers`), readable and writable with the Get / Update Activity Config workspace REST APIs. If a workspace has activity disabled, `VeltActivityLog` settles to its empty state (SDK 6.0.13+) instead of loading forever, and the Add Activities REST API requires `activityServiceConfig` to be enabled.

**Verification:**
- [ ] `VeltProvider` configured with API key and `authProvider` (not `useIdentify`)
- [ ] `VeltActivityLog` rendered or a subscription created, with the `null` loading state handled
- [ ] Records appear after a comment, reaction, recording, or CRDT edit
- [ ] If the feed stays empty, workspace `activityServiceConfig.isEnabled` checked via Get Activity Config

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/activity/setup - "Add the Activity Log Component", "Create a Custom Activity", "Subscribe to Activities"
- https://docs.velt.dev/async-collaboration/activity/overview - "Automatic Activity Logging"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/activityconfig-update - "Update Activity Config"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/activityconfig-get - "Get Activity Config"
