---
title: Enable Activity Logs in Velt Console
impact: CRITICAL
impactDescription: Required for activity logs to function
tags: activity, setup, console, enable
---

## Enable Activity Logs in Velt Console

**Requires `@veltdev/react@5.0.2-beta.13` or later.** The `useAllActivities` and `useActivityUtils` hooks are not available in earlier versions. If the installed SDK is older, upgrade: `npm install @veltdev/react@5.0.2-beta.13`

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

**VeltProvider with authProvider (required for activity logs to work):**

Activity logs require an authenticated user. Use `authProvider` on VeltProvider — not the deprecated `useIdentify` hook, which is legacy and will be removed.

```jsx
import { VeltProvider } from '@veltdev/react';

// Build authProvider from your app's user context
const authProvider = user ? {
  user: {
    userId: user.userId,
    organizationId: user.organizationId,
    name: user.name,
    email: user.email,
  },
  retryConfig: { retryCount: 3, retryDelay: 1000 },
  generateToken: async () => {
    const resp = await fetch("/api/velt/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.userId, organizationId: user.organizationId }),
    });
    const { token } = await resp.json();
    return token;
  },
} : undefined;

<VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY!} authProvider={authProvider}>
  {/* Activity log components go here */}
</VeltProvider>
```

**Setup Steps:**

1. **Enable in Console**: Go to [console.velt.dev](https://console.velt.dev) > Dashboard > Configuration > Activity Logs and toggle on
2. **Configure VeltProvider** with `authProvider` (see above)
3. **Verify**: Subscribe to activities and confirm data flows

**Verification:**
- [ ] Activity Logs enabled in Velt Console
- [ ] VeltProvider configured with API key and `authProvider` prop (not `useIdentify`)
- [ ] Basic subscription returns activity data (not perpetually null)

**Source Pointer:** https://docs.velt.dev/async-collaboration/activity/setup - Enable Activity Logs in the Velt Console
