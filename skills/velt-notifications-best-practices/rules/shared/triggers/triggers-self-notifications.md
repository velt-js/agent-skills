---
title: Enable Self-Notifications for Own Actions
impact: MEDIUM
impactDescription: Controls whether users receive notifications for their own actions
tags: notifications, triggers, self-notifications
---

## Enable Self-Notifications for Own Actions

By default, Velt excludes notifications where the current user is the action user. Enable self-notifications if users need to see confirmations of their own actions (e.g., audit trails, confirmation flows).

**Incorrect (expecting self-notifications without enabling them):**

```jsx
// Default behavior: user does NOT receive notifications for their own actions
<VeltNotificationsTool />
// User comments on a thread — no notification generated for themselves
```

**Correct (React / Next.js — using props):**

```jsx
import { VeltNotificationsTool, VeltNotificationsPanel } from '@veltdev/react';

// Enable via prop on the tool or panel
<VeltNotificationsTool selfNotifications={true} />
<VeltNotificationsPanel selfNotifications={true} />
```

**Correct (React / Next.js — using API):**

```jsx
import { useNotificationUtils } from '@veltdev/react';
import { useEffect } from 'react';

function SelfNotificationSetup() {
  const notificationElement = useNotificationUtils();

  useEffect(() => {
    if (!notificationElement) return;

    // Enable self notifications
    notificationElement.enableSelfNotifications();

    // To disable:
    // notificationElement.disableSelfNotifications();
  }, [notificationElement]);
}
```

**Correct (Other Frameworks — using attributes):**

```html
<velt-notifications-tool self-notifications="true"></velt-notifications-tool>
<velt-notifications-panel self-notifications="true"></velt-notifications-panel>
```

**Correct (Other Frameworks — using API):**

```jsx
const notificationElement = Velt.getNotificationElement();
notificationElement.enableSelfNotifications();

// To disable:
notificationElement.disableSelfNotifications();
```

**Verification Checklist:**
- [ ] Self-notifications explicitly enabled if users need to see their own actions
- [ ] Disabled by default for typical use cases to reduce noise
- [ ] Consistent setting across Tool and Panel components

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior - enableSelfNotifications
