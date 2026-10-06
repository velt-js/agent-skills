---
title: Use the CursorElement API for Cursor Data
impact: HIGH
impactDescription: Access cursor data and control via getCursorElement and observables
tags: api, vanilla-js, getCursorElement, getOnlineUsersOnCurrentDocument, observable, subscribe, CursorUser, cursor-data
---

## Use the CursorElement API for Cursor Data

Get the `CursorElement` with `client.getCursorElement()` (React) or `Velt.getCursorElement()` (other frameworks). `getOnlineUsersOnCurrentDocument()` returns an Observable of `CursorUser[]` for all online users (active or inactive) on the current document.

**Why this matters:**

Cursor coordinates live in `user.position` (`{ top, left }` in the viewer's screen space), not in `x` / `y` fields. The only documented configuration methods on `CursorElement` are `setInactivityTime()` and `allowedElementIds()`.

**Incorrect (invented fields and methods):**

```js
const cursorElement = Velt.getCursorElement();
cursorElement.enableAvatarMode(); // not a documented CursorElement method; use the avatarMode prop
cursorElement.getOnlineUsersOnCurrentDocument().subscribe((users) => {
  users.forEach((u) => console.log(u.x, u.y)); // undefined: there is no x / y
});
```

**Correct:**

```js
const cursorElement = Velt.getCursorElement();

// Configuration
cursorElement.allowedElementIds(["canvas-area"]); // plain array in the API
cursorElement.setInactivityTime(60000); // milliseconds

// Data
const subscription = cursorElement.getOnlineUsersOnCurrentDocument().subscribe((cursorUsers) => {
  (cursorUsers || []).forEach((user) => {
    const { top, left } = user.position || {};
    console.log(`${user.name} (${user.onlineStatus}) at top=${top}, left=${left}`);
  });
});

// On page unload / component destroy
subscription?.unsubscribe();
```

**`CursorUser` fields you will use:**

| Field | Notes |
|---|---|
| `userId`, `name`, `email`, `photoUrl` | Identity |
| `color` | Session color used on the cursor and avatar border |
| `onlineStatus` | `active`, `inactive`, or `offline` |
| `position` | `CursorPosition`: `top`, `left`, optional `parentScaleX`, `parentScaleY`, `transformContext` |
| `location`, `locationId` | Location within the document |

**Key points:**

- The Observable emits `CursorUser[] | null`; guard against `null`
- `getLiveCursorsOnCurrentDocument()` is deprecated; use `getOnlineUsersOnCurrentDocument()`
- Always `.unsubscribe()` on cleanup
- In React, prefer `useCursorUsers()` and `useCursorUtils()`

**Verification:**
- [ ] `getCursorElement()` is called after Velt is initialized
- [ ] Positions are read from `user.position.top` / `user.position.left`
- [ ] Only documented methods are called (`setInactivityTime`, `allowedElementIds`, `getOnlineUsersOnCurrentDocument`)
- [ ] `.unsubscribe()` is called on cleanup

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/cursors/customize-behavior#getonlineusersoncurrentdocument - "getOnlineUsersOnCurrentDocument"
- https://docs.velt.dev/api-reference/sdk/api/api-methods#cursors - "Cursors" API methods
- https://docs.velt.dev/api-reference/sdk/models/data-models#cursoruser - `CursorUser`
- https://docs.velt.dev/api-reference/sdk/models/data-models#cursorposition - `CursorPosition`
