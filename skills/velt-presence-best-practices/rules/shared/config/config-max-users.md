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

**API: Set programmatically**

```javascript
const presenceElement = client.getPresenceElement();
presenceElement.setMaxUsers(3);
```

**Choosing the right value:**

| Context | Recommended maxUsers |
|---------|---------------------|
| Narrow toolbar or mobile | 3 |
| Standard desktop header | 5 |
| Wide collaboration bar | 8-10 |

When `maxUsers` is not set, all active user avatars are displayed. For most applications, a value between 3 and 5 provides a good balance between visibility and layout stability.

**Overflow badge behavior:**

The overflow badge automatically calculates the count of hidden users. If `maxUsers` is 3 and there are 8 active users, the badge shows "+5". Users can typically hover or click the badge to see the full list.

**Verification:**
- [ ] `maxUsers` is set on `VeltPresence` or `<velt-presence>`
- [ ] Only the specified number of avatars renders in the toolbar
- [ ] An overflow count badge appears when active users exceed `maxUsers`
- [ ] Layout does not break when many users are present simultaneously

**Source Pointers:**
- `https://docs.velt.dev/presence/customize-behavior/set-max-users` - Max users configuration
