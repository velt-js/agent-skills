---
title: Control Notification Panel Display Mode
impact: HIGH
impactDescription: Choose between popover and sidebar panel layouts
tags: panel, popover, sidebar, panelOpenMode, embedded
---

## Control Notification Panel Display Mode

The notification panel can open as a popover (default) or sidebar. You can also embed it directly in your page layout.

**Incorrect (not specifying display preference):**

```jsx
// Default popover may not fit your layout
<VeltNotificationsTool />
```

**Correct (specifying panel open mode):**

```jsx
import { VeltNotificationsTool } from '@veltdev/react';

// Option 1: Popover mode (default)
<VeltNotificationsTool panelOpenMode="popover" />

// Option 2: Sidebar mode - slides in from side
<VeltNotificationsTool panelOpenMode="sidebar" />
```

**Embedded Panel (no tool button):**

```jsx
import { VeltNotificationsPanel } from '@veltdev/react';

function NotificationsSidebar() {
  return (
    <div className="sidebar">
      {/* Panel embedded directly in layout */}
      <VeltNotificationsPanel />
    </div>
  );
}
```

**Programmatic Panel Control:**

```jsx
import { useVeltClient } from '@veltdev/react';

function NotificationControls() {
  const { client } = useVeltClient();

  const openPanel = () => {
    const notificationElement = client?.getNotificationElement();
    notificationElement?.openNotificationsPanel();
  };

  const closePanel = () => {
    const notificationElement = client?.getNotificationElement();
    notificationElement?.closeNotificationsPanel();
  };

  return (
    <>
      <button onClick={openPanel}>Open Notifications</button>
      <button onClick={closePanel}>Close Notifications</button>
    </>
  );
}
```

**Using Hook for Panel Control:**

```jsx
import { useNotificationUtils } from '@veltdev/react';

function NotificationButton() {
  const notificationElement = useNotificationUtils();

  return (
    <button onClick={() => notificationElement.openNotificationsPanel()}>
      View Notifications
    </button>
  );
}
```

**For HTML:**

```html
<!-- Popover mode -->
<velt-notifications-tool panel-open-mode="popover"></velt-notifications-tool>

<!-- Sidebar mode -->
<velt-notifications-tool panel-open-mode="sidebar"></velt-notifications-tool>

<!-- Embedded panel -->
<velt-notifications-panel></velt-notifications-panel>
```

**Verification:**
- [ ] Panel mode matches application layout needs
- [ ] Embedded panels have proper container styling
- [ ] Programmatic controls work as expected

**Source Pointer:** https://docs.velt.dev/async-collaboration/notifications/customize-behavior - Panel Open Mode, Actions
