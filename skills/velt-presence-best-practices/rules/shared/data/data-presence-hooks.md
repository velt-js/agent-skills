---
title: Use React Hooks for Presence Data
impact: HIGH
impactDescription: React hooks provide the simplest way to subscribe to real-time presence data with automatic cleanup
tags: presence, hooks, react, usePresenceData, usePresenceUtils, usePresenceEventCallback, data
---

## Use React Hooks for Presence Data

Velt provides three React hooks for presence data: `usePresenceData` for subscribing to filtered presence user lists, `usePresenceEventCallback` for listening to state change events, and `usePresenceUtils` for programmatic control via `PresenceElement`.

**Why this matters:**

Hooks handle subscription lifecycle automatically -- no manual cleanup needed. They re-render components only when presence data changes, keeping your UI in sync without boilerplate.

**usePresenceData -- subscribe to filtered presence users**

```jsx
"use client";
import { usePresenceData } from "@veltdev/react";

function OnlineUsers() {
  // Filter to only online users; returns { data: PresenceUser[] | null }
  const presenceData = usePresenceData({ statuses: ["online"] });

  // Always handle null (loading/initializing state)
  if (!presenceData?.data) {
    return <div>Loading presence...</div>;
  }

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

**usePresenceEventCallback -- subscribe to state change events**

```jsx
"use client";
import { usePresenceEventCallback } from "@veltdev/react";

function PresenceLogger() {
  usePresenceEventCallback("userStateChange", (event) => {
    // event: { user: PresenceUser, state: 'online' | 'away' | 'offline' }
    console.log(`${event.user.name} is now ${event.state}`);
  });

  return null;
}
```

**usePresenceUtils -- access PresenceElement for programmatic control**

```jsx
"use client";
import { usePresenceUtils } from "@veltdev/react";
import { useEffect } from "react";

function PresenceController() {
  const presenceElement = usePresenceUtils();

  useEffect(() => {
    if (!presenceElement) return;

    // Use PresenceElement methods directly
    const subscription = presenceElement
      .getData({ statuses: ["online", "away"] })
      .subscribe((response) => {
        console.log("Presence users:", response);
      });

    return () => subscription.unsubscribe();
  }, [presenceElement]);

  return null;
}
```

**Key patterns:**

- `usePresenceData` returns `{ data: PresenceUser[] | null }` -- always check for `null` before rendering
- `usePresenceEventCallback` cleanup is automatic when the component unmounts
- `usePresenceUtils` returns the `PresenceElement` instance (may be `null` initially)
- Pass `{ statuses: ['online'] }` to filter by user state
- No version numbers in imports -- use `@veltdev/react`

### Verification Checklist

- [ ] Component is inside `<VeltProvider>` with valid `authProvider`
- [ ] `setDocuments` has been called to scope presence to a document
- [ ] Null check exists before accessing `presenceData.data`
- [ ] No manual subscription cleanup needed for `usePresenceData` or `usePresenceEventCallback`
- [ ] `usePresenceUtils` subscriptions are cleaned up in `useEffect` return

> **Source:** Velt Presence React Hooks API -- `usePresenceData`, `usePresenceEventCallback`, `usePresenceUtils`
