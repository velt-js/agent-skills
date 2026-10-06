---
title: Use React Hooks for Presence Data
impact: HIGH
impactDescription: React hooks provide the simplest way to subscribe to real-time presence data with automatic cleanup
tags: presence, hooks, react, usePresenceData, usePresenceUtils, usePresenceEventCallback, useHeartbeat, data
---

## Use React Hooks for Presence Data

Velt provides three presence hooks: `usePresenceData` (filtered presence users), `usePresenceEventCallback` (latest presence event), and `usePresenceUtils` (the `PresenceElement` for imperative calls). The hooks manage subscription cleanup for you.

**Why this matters:**

`usePresenceEventCallback` does **not** take a callback. It returns the latest event object, which you react to in `useEffect`. Passing a function as the second argument does nothing.

**Incorrect (callback-style usage):**

```jsx
// The second argument is ignored; nothing is logged
usePresenceEventCallback("userStateChange", (event) => {
  console.log(event.user.name, event.state);
});
```

**Correct (usePresenceEventCallback returns the event):**

```jsx
"use client";
import { useEffect } from "react";
import { usePresenceEventCallback } from "@veltdev/react";

function PresenceLogger() {
  const userStateChangeEvent = usePresenceEventCallback("userStateChange");

  useEffect(() => {
    if (!userStateChangeEvent) return;
    // { user: PresenceUser, state: 'online' | 'away' | 'offline' }
    console.log(`${userStateChangeEvent.user.name} is now ${userStateChangeEvent.state}`);
  }, [userStateChangeEvent]);

  return null;
}
```

**Correct (usePresenceData returns `{ data: PresenceUser[] | null }`):**

```jsx
"use client";
import { usePresenceData } from "@veltdev/react";

function OnlineUsers() {
  const presenceData = usePresenceData({ statuses: ["online"] }); // omit the query for all users

  if (!presenceData?.data) return <div>Loading presence...</div>;

  return (
    <ul>
      {presenceData.data.map((user) => (
        <li key={user.userId}>
          <img src={user.photoUrl} alt={user.name} />
          {user.name}
        </li>
      ))}
    </ul>
  );
}
```

**Correct (usePresenceUtils for imperative calls):**

```jsx
"use client";
import { useEffect } from "react";
import { usePresenceUtils } from "@veltdev/react";

function PresenceController() {
  const presenceElement = usePresenceUtils();

  useEffect(() => {
    if (!presenceElement) return;
    presenceElement.setInactivityTime(60000);
  }, [presenceElement]);

  return null;
}
```

**Heartbeat (optional):** `useHeartbeat()` (API: `client.getHeartbeat()`) returns `{ data: Heartbeat[] | null }` for the current user, or for any user when you pass `{ userId }`. Use it to monitor active sessions.

**Key patterns:**

- `usePresenceData` returns `{ data }`; `data` is `null` while loading
- `usePresenceEventCallback(eventType)` returns the latest event; handle it in `useEffect`
- `usePresenceUtils()` may return `null` before init; guard it
- Hooks must run in a component rendered inside `VeltProvider`

### Verification Checklist

- [ ] Component is inside `VeltProvider` with a valid `authProvider`
- [ ] `setDocuments` has been called to scope presence to a document
- [ ] Null check exists before reading `presenceData.data`
- [ ] `usePresenceEventCallback` is used with one argument and handled in `useEffect`
- [ ] Manual subscriptions made through `usePresenceUtils()` are cleaned up

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior#getdata - "getData" (Using Hook)
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior#on - "Event Subscription" (Using Hook)
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#usepresenceeventcallback - `usePresenceEventCallback()`
- https://docs.velt.dev/realtime-collaboration/presence/overview#heartbeat-monitoring - "Heartbeat Monitoring"
