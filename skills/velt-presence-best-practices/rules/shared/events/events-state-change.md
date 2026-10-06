---
title: Subscribe to User State Change Events
impact: MEDIUM
impactDescription: React to user online/away/offline transitions for status indicators, logging, and auto-save triggers
tags: presence, events, state-change, online, away, offline, callback
---

## Subscribe to User State Change Events

Velt emits a `userStateChange` event whenever a user transitions between `online`, `away`, and `offline` states. Use this to build status indicators, activity logs, or trigger auto-save when collaborators leave.

**Why this matters:**

Knowing when users change state lets you build responsive UIs -- show "User X went away" banners, log activity for audit trails, or auto-save unsaved changes when the last active user leaves.

**Incorrect (passing a callback to the hook):**

```jsx
// usePresenceEventCallback takes only the event type; this callback never runs
usePresenceEventCallback("userStateChange", (event) => triggerAutoSave());
```

**Correct (React: the hook returns the latest event):**

```jsx
"use client";
import { useEffect } from "react";
import { usePresenceEventCallback } from "@veltdev/react";

function StateChangeHandler() {
  const event = usePresenceEventCallback("userStateChange");

  useEffect(() => {
    if (!event) return;
    // PresenceUserStateChangeEvent: { user: PresenceUser, state: 'online' | 'away' | 'offline' }
    switch (event.state) {
      case "online":
        showNotification(`${event.user.name} is back online`);
        break;
      case "away":
        console.log(`${event.user.name} went away`); // tab blur triggers 'away' immediately
        break;
      case "offline":
        triggerAutoSave();
        break;
    }
  }, [event]);

  return null;
}
```

**Correct (React: API method):**

```jsx
const presenceElement = client.getPresenceElement();
const subscription = presenceElement.on("userStateChange").subscribe((event) => {
  console.log("userStateChange", event);
});
// cleanup
subscription?.unsubscribe();
```

**Correct (Other Frameworks):**

```js
const presenceElement = Velt.getPresenceElement();

const subscription = presenceElement
  .on("userStateChange")
  .subscribe((event) => {
    // Same event shape: { user: PresenceUser, state: 'online' | 'away' | 'offline' }
    updateStatusBadge(event.user.userId, event.state);

    if (event.state === "offline") {
      logUserDeparture(event.user);
    }
  });

// Cleanup when done
// subscription.unsubscribe();
```

**State transition behavior:**

| Transition | Trigger |
|---|---|
| `online` -> `away` | Tab loses focus (immediate), or inactivity timeout reached |
| `away` -> `online` | Tab regains focus, or user activity detected |
| `online`/`away` -> `offline` | `offlineInactivityTime` reached, or the user loses their connection |

**Common use cases:**

- **Status indicators:** Update avatar badges or user list entries in real time
- **Activity logging:** Record when users join/leave for audit trails
- **Auto-save triggers:** Save document state when the last editor goes offline
- **Notifications:** Show toast messages when collaborators arrive or leave

**Key patterns:**

- The React hook cleans up on unmount; react to its return value in `useEffect`
- Tab focus loss triggers `away` immediately (not after a timeout)
- `inactivityTime` config controls the idle timeout for the online-to-away transition when the tab is focused
- Events fire for all users in the same document scope (set by `setDocuments`)

### Verification Checklist

- [ ] Component is inside `<VeltProvider>` with valid `authProvider`
- [ ] `setDocuments` has been called to scope presence to the correct document
- [ ] Event handler does not assume any particular transition order
- [ ] Vanilla JS subscriptions have cleanup via `.unsubscribe()`
- [ ] No heavy synchronous work inside the callback (use async for API calls)

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior#on - "Event Subscription"
- https://docs.velt.dev/api-reference/sdk/models/data-models#presenceuserstatechangeevent - `PresenceUserStateChangeEvent`
