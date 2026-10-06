---
title: Use React Hooks for Cursor Data
impact: HIGH
impactDescription: Access cursor user data and programmatic control via React hooks
tags: hooks, useCursorUsers, useCursorUtils, react, data, CursorUser
---

## Use React Hooks for Cursor Data

Use `useCursorUsers()` to get online users with cursors (the hook form of `getOnlineUsersOnCurrentDocument()`), and `useCursorUtils()` to get the `CursorElement` for programmatic configuration.

**Why this matters:**

Hooks manage the subscription for you. Read positions from `user.position` (`top` / `left`), and configure behavior only through documented methods (`setInactivityTime`, `allowedElementIds`).

**Incorrect (invented fields and methods):**

```jsx
const cursorUsers = useCursorUsers();
const cursorElement = useCursorUtils();
cursorElement?.enableAvatarMode(); // not documented; use <VeltCursor avatarMode={true} />
cursorUsers?.map((u) => `${u.x},${u.y}`); // no x / y fields
```

**Correct (useCursorUsers):**

```jsx
"use client";
import { useCursorUsers } from "@veltdev/react";

function OnlineCursorUsers() {
  const cursorUsers = useCursorUsers();

  if (!cursorUsers || cursorUsers.length === 0) {
    return <p>No other users on this document</p>;
  }

  return (
    <ul>
      {cursorUsers.map((user) => (
        <li key={user.userId}>
          {user.name}: top {user.position?.top}, left {user.position?.left}
        </li>
      ))}
    </ul>
  );
}
```

**Correct (useCursorUtils):**

```jsx
"use client";
import { useEffect } from "react";
import { useCursorUtils } from "@veltdev/react";

function CursorController() {
  const cursorElement = useCursorUtils();

  useEffect(() => {
    if (!cursorElement) return;
    cursorElement.setInactivityTime(60000);
    cursorElement.allowedElementIds(["canvas"]); // plain array in the API
  }, [cursorElement]);

  return null;
}
```

**Key points:**

- `useCursorUsers()` returns the online users with cursors, or `null` before data loads
- `useCursorUtils()` returns the `CursorElement` (may be `null` initially)
- Both hooks must run inside a component rendered within `VeltProvider`
- Avatar mode is a component prop (`avatarMode`), not a hook or API call

**Verification:**
- [ ] Hooks are called inside a child of `VeltProvider`
- [ ] Null checks are in place for both hook return values
- [ ] Positions are read from `position.top` / `position.left`
- [ ] Only documented `CursorElement` methods are called

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#usecursorusers - `useCursorUsers()`
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#usecursorutils - `useCursorUtils()`
- https://docs.velt.dev/realtime-collaboration/cursors/customize-behavior - "Customize Behavior"
