---
title: Use React Hooks for Cursor Data
impact: HIGH
impactDescription: Access cursor user data and programmatic control via React hooks
tags: hooks, useCursorUsers, useCursorUtils, react, data
---

## React Hooks for Cursor Data

Use `useCursorUsers()` to get the list of online users with active cursors, and `useCursorUtils()` to get the `CursorElement` for programmatic control.

**Why this matters:**

Hooks provide reactive access to cursor data without manual subscriptions. Use `useCursorUsers` to build custom user lists, activity indicators, or cursor-aware UI. Use `useCursorUtils` to programmatically configure cursor behavior from any component.

**useCursorUsers: Get online users with cursors**

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
          {user.name} — position: ({user.x}, {user.y})
        </li>
      ))}
    </ul>
  );
}
```

**useCursorUtils: Programmatic cursor control**

```jsx
"use client";
import { useCursorUtils } from "@veltdev/react";
import { useEffect } from "react";

function CursorController() {
  const cursorElement = useCursorUtils();

  useEffect(() => {
    if (cursorElement) {
      // Configure cursor behavior programmatically
      cursorElement.enableAvatarMode();
      cursorElement.setInactivityTime(60000);
      cursorElement.allowedElementIds(["canvas"]);
    }
  }, [cursorElement]);

  return null;
}
```

**Combining both hooks:**

```jsx
"use client";
import { useCursorUsers, useCursorUtils } from "@veltdev/react";
import { useEffect } from "react";

function CursorDashboard() {
  const cursorUsers = useCursorUsers();
  const cursorElement = useCursorUtils();

  useEffect(() => {
    if (cursorElement) {
      cursorElement.allowedElementIds(["main-canvas"]);
    }
  }, [cursorElement]);

  return (
    <div className="cursor-dashboard">
      <p>{cursorUsers?.length ?? 0} users with active cursors</p>
    </div>
  );
}
```

**Key points:**

- `useCursorUsers()` returns `User[]` or `null` -- always check for null
- `useCursorUtils()` returns a `CursorElement` instance for programmatic control
- Both hooks must be called inside a component that is a child of `VeltProvider`
- Data updates reactively as users join, leave, or move cursors
- Use `useCursorUtils` instead of `client.getCursorElement()` in React apps

**Verification:**
- [ ] Hooks are called inside a child of `VeltProvider`
- [ ] Null checks are in place for both hook return values
- [ ] User list updates when users join or leave the document
- [ ] Programmatic config via `useCursorUtils` takes effect

**Source Pointers:**
- `https://docs.velt.dev/cursor/customize-behavior` - Cursor hooks and API
