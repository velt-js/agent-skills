---
title: Control Avatar Overflow with maxUsers
impact: MEDIUM
impactDescription: Limits displayed avatars and shows overflow count badge
tags: maxUsers, overflow, avatars, display, presence-config
---

## Control Avatar Overflow Display

When many users are present in a document, showing all avatars can overwhelm your toolbar layout. The `maxUsers` prop limits the visible avatars and displays an overflow count badge (e.g., "+5") for the remaining users.

**Why this matters:**

In collaborative apps with large teams, 20+ avatars in a row will break your layout and provide no useful information at a glance. Capping visible avatars keeps the UI clean while still communicating the total number of active users.

**React: Set maxUsers**

```jsx
import { VeltPresence } from "@veltdev/react";

function Toolbar() {
  return (
    <VeltPresence maxUsers={3} />
  );
}
```

This displays 3 avatar icons plus a "+N" badge showing how many additional users are present.

**HTML: Set max-users attribute**

```html
<velt-presence max-users="3"></velt-presence>
```

**Choosing the right value:**

| Context | Recommended maxUsers |
|---------|---------------------|
| Narrow toolbar or mobile | 3 |
| Standard desktop header | 5 |
| Wide collaboration bar | 8-10 |

The default is `5`. Non-numeric values are rejected and the default holds. When `self` is `true` (the default), the current user counts toward the cap.

**Overflow badge behavior:**

The "+N" badge renders only when the filtered user count is greater than `maxUsers`. If `maxUsers` is 3 and there are 8 active users, the badge shows "+5". `maxUsers` only affects rendering; presence data (`getData`, `usePresenceData`) still returns every user.

**Incorrect (relying on an undocumented API method):**

```javascript
// setMaxUsers() is not a documented PresenceElement method; use the prop/attribute
presenceElement.setMaxUsers(3);
```

**Verification:**
- [ ] `maxUsers` is set on `VeltPresence` or `<velt-presence>`
- [ ] Only the specified number of avatars renders in the toolbar
- [ ] An overflow count badge appears when active users exceed `maxUsers`
- [ ] Layout does not break when many users are present simultaneously
- [ ] No calls to `setMaxUsers()` (configure via `maxUsers` / `max-users`)

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior#maxusers - "maxUsers"
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - `maxUsers` default and overflow behavior
