---
title: Control Current User Visibility in Presence
impact: MEDIUM
impactDescription: Include or exclude the current user from the presence avatar list
tags: self, visibility, currentUser, presence-config
---

## Include or Exclude Current User from Presence

By default, `VeltPresence` includes the current user's avatar in the presence list. You can hide it with the `self` prop when your UI already displays the current user's identity elsewhere (e.g., a profile menu or account badge).

**Why this matters:**

Showing the current user in presence is redundant when their identity is already visible in the header or navigation. Hiding it frees up an avatar slot for other collaborators and reduces visual clutter. Conversely, in apps where the toolbar is the only identity indicator, keeping it visible ensures the user knows they are connected.

**React: Hide current user**

```jsx
import { VeltPresence } from "@veltdev/react";

function Toolbar() {
  return (
    <VeltPresence self={false} />
  );
}
```

**React: Show current user (default behavior)**

```jsx
import { VeltPresence } from "@veltdev/react";

function Toolbar() {
  return (
    <VeltPresence self={true} />
  );
}
```

**HTML: Hide current user**

```html
<velt-presence self="false"></velt-presence>
```

**API: Toggle programmatically**

```javascript
const presenceElement = client.getPresenceElement();

// Hide current user from presence
presenceElement.disableSelf();

// Show current user in presence
presenceElement.enableSelf();
```

**When to hide the current user:**

- Your app has a profile avatar or account menu in the header
- You use `maxUsers` and want to maximize slots for other collaborators
- The presence bar is in a shared toolbar where self-representation is redundant

**When to keep the current user visible:**

- The presence bar is the only indicator that the user is connected
- Users need confirmation that their session is active
- The app has no other profile or identity UI

**Default:** `self={true}` — the current user is shown in the presence list.

**Verification:**
- [ ] `self` prop is set intentionally based on your UI design
- [ ] When `self={false}`, the current user's avatar does not appear in presence
- [ ] When `self={true}`, the current user's avatar is included
- [ ] The `maxUsers` overflow count adjusts correctly based on self visibility

**Source Pointers:**
- `https://docs.velt.dev/presence/customize-behavior/self-presence` - Self presence configuration
