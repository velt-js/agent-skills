---
title: Subscribe to Cursor User Change Events
impact: MEDIUM
impactDescription: React to cursor user changes via callback props or event listeners
tags: events, onCursorUserChange, callback, cursor-events, real-time
---

## Handle Cursor User Change Events

Use `onCursorUserChange` to react when the list of users with active cursors changes. This fires when users join, leave, move, or go inactive.

**Why this matters:**

Cursor change events let you build features on top of cursor data: activity logs, user following, cursor-aware layouts, or custom presence indicators tied to cursor movement rather than just document presence.

**Incorrect (deprecated alias and nonexistent coordinates):**

```jsx
<VeltCursor onCursorUsersChanged={(users) => users.map((u) => [u.x, u.y])} />
```

**Correct (React: onCursorUserChange callback):**

```jsx
"use client";
import { VeltCursor } from "@veltdev/react";
import { useCallback } from "react";

function CursorTracker() {
  const handleCursorChange = useCallback((users) => {
    // users is CursorUser[] with position and user data
    console.log("Active cursor users:", users.length);
    users.forEach((user) => {
      console.log(`${user.name} at (${user.position?.left}, ${user.position?.top})`);
    });
  }, []);

  // Single root-level VeltCursor; only the first instance emits this callback
  return <VeltCursor onCursorUserChange={(users) => handleCursorChange(users)} />;
}
```

**React: Update state from cursor changes**

```jsx
"use client";
import { VeltCursor } from "@veltdev/react";
import { useState, useCallback } from "react";

function CursorAwareCanvas() {
  const [activeUsers, setActiveUsers] = useState([]);

  const handleChange = useCallback((users) => {
    setActiveUsers(users || []);
  }, []);

  return (
    <div>
      <p>{activeUsers.length} users with active cursors</p>
      <VeltCursor onCursorUserChange={handleChange} />
    </div>
  );
}
```

**HTML: Event listener**

```html
<velt-cursor></velt-cursor>

<script>
  const cursorTag = document.querySelector("velt-cursor");
  cursorTag.addEventListener("onCursorUserChange", (event) => {
    const users = event.detail;
    users.forEach((user) => {
      console.log(`${user.name} at (${user.position?.left}, ${user.position?.top})`);
    });
  });
</script>
```

**Key points:**

- The callback receives `CursorUser[]`; coordinates are in `position.top` / `position.left`
- `onCursorUsersChanged` is a deprecated alias that fires at the same time; use `onCursorUserChange`
- Only the first (subscribing) `VeltCursor` instance emits this event
- Fires on: user joins document, user leaves, cursor moves, user goes inactive
- In React, wrap handlers in `useCallback` to avoid unnecessary re-renders
- In HTML, use `addEventListener` on the `velt-cursor` element
- Event detail contains the full array of current cursor users (not just the changed user)

**Verification:**
- [ ] `onCursorUserChange` callback is set on `VeltCursor`
- [ ] Callback fires when users join or leave the document
- [ ] Callback reads `position.top` / `position.left`, not `x` / `y`
- [ ] `onCursorUserChange` is used, not the deprecated `onCursorUsersChanged`
- [ ] No stale closures in React (handler wrapped in `useCallback`)
- [ ] HTML event listener is cleaned up on page unload if needed

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/cursors/customize-behavior#oncursoruserchange - "onCursorUserChange"
- https://docs.velt.dev/api-reference/sdk/models/data-models#cursoruser - `CursorUser`
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - deprecated `onCursorUsersChanged` alias
