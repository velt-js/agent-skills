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

**React: usePresenceEventCallback**

```jsx
"use client";
import { usePresenceEventCallback } from "@veltdev/react";

function StateChangeHandler() {
  usePresenceEventCallback("userStateChange", (event) => {
    // event shape: PresenceUserStateChangeEvent
    // { user: PresenceUser, state: 'online' | 'away' | 'offline' }

    switch (event.state) {
      case "online":
        showNotification(`${event.user.name} is back online`);
        break;
      case "away":
        // Tab focus loss immediately triggers 'away'
        console.log(`${event.user.name} went away`);
        break;
      case "offline":
        triggerAutoSave();
        logActivity(`${event.user.name} left the document`);
        break;
    }
  });

  return null;
}
```

**Vanilla JS: presenceElement.on()**

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
| `online`/`away` -> `offline` | Browser tab closed, network disconnected, or session timeout |

**Common use cases:**

- **Status indicators:** Update avatar badges or user list entries in real time
- **Activity logging:** Record when users join/leave for audit trails
- **Auto-save triggers:** Save document state when the last editor goes offline
- **Notifications:** Show toast messages when collaborators arrive or leave

**Key patterns:**

- The React hook automatically cleans up on unmount -- no manual unsubscribe needed
- Tab focus loss triggers `away` immediately (not after a timeout)
- `inactivityTime` config controls the idle timeout for the online-to-away transition when the tab is focused
- Events fire for all users in the same document scope (set by `setDocuments`)

### Verification Checklist

- [ ] Component is inside `<VeltProvider>` with valid `authProvider`
- [ ] `setDocuments` has been called to scope presence to the correct document
- [ ] Event handler does not assume any particular transition order
- [ ] Vanilla JS subscriptions have cleanup via `.unsubscribe()`
- [ ] No heavy synchronous work inside the callback (use async for API calls)

> **Source:** Velt Presence Events API -- `userStateChange` event, `PresenceUserStateChangeEvent` type
