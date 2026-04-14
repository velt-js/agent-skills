---
title: Use Vanilla JS API for Cursor Data
impact: HIGH
impactDescription: Access cursor data and control via getCursorElement and observables
tags: api, vanilla-js, getCursorElement, observable, subscribe, cursor-data
---

## Vanilla JS API for Cursor Data

Use `getCursorElement()` from the Velt client to access cursor configuration and `getOnlineUsersOnCurrentDocument()` to observe cursor users. These APIs use RxJS-style observables that require explicit subscription and cleanup.

**Why this matters:**

In non-React environments (vanilla JS, Angular, Vue, or server-driven apps), you need the imperative API to access cursor data and configure behavior. The observable pattern ensures you receive real-time updates as users join, leave, or move.

**Get the CursorElement:**

```javascript
const client = await Velt.init("YOUR_API_KEY");
const cursorElement = client.getCursorElement();
```

**Subscribe to online users with cursors:**

```javascript
const cursorElement = client.getCursorElement();

const subscription = cursorElement.getOnlineUsersOnCurrentDocument().subscribe((users) => {
  // users is CursorUser[] with position data
  users.forEach((user) => {
    console.log(`${user.name} at (${user.x}, ${user.y})`);
  });
});

// IMPORTANT: Clean up when done to prevent memory leaks
// e.g., on component destroy or page unload
subscription.unsubscribe();
```

**Configure cursor behavior:**

```javascript
const cursorElement = client.getCursorElement();

// Restrict to specific elements
cursorElement.allowedElementIds(["canvas-area"]);

// Enable avatar mode
cursorElement.enableAvatarMode();

// Set inactivity timeout
cursorElement.setInactivityTime(60000);
```

**Full example with cleanup:**

```javascript
class CursorManager {
  constructor(client) {
    this.cursorElement = client.getCursorElement();
    this.subscription = null;
  }

  init() {
    this.cursorElement.allowedElementIds(["canvas"]);
    this.cursorElement.setInactivityTime(120000);

    this.subscription = this.cursorElement
      .getOnlineUsersOnCurrentDocument()
      .subscribe((users) => {
        this.updateUserList(users);
      });
  }

  updateUserList(users) {
    const container = document.getElementById("user-list");
    container.innerHTML = users
      .map((u) => `<span>${u.name}</span>`)
      .join("");
  }

  destroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
```

**Key points:**

- `getCursorElement()` is available after `Velt.init()` resolves
- `getOnlineUsersOnCurrentDocument()` returns an `Observable<CursorUser[]>`
- You must call `.subscribe()` to receive data -- the observable is lazy
- Always call `.unsubscribe()` on cleanup to prevent memory leaks
- In React, prefer `useCursorUsers()` and `useCursorUtils()` hooks instead

**Verification:**
- [ ] `getCursorElement()` is called after client initialization
- [ ] `.subscribe()` is called on the observable to start receiving data
- [ ] `.unsubscribe()` is called on component/page cleanup
- [ ] No memory leaks from orphaned subscriptions
- [ ] User list updates in real-time as users join and leave

**Source Pointers:**
- `https://docs.velt.dev/cursor/customize-behavior` - Cursor API reference
