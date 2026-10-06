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

In `sidebar` mode the panel keeps all fetched notifications in the session list, so the list stays stable as a persistent column; `popover` keeps the leaner open-on-demand set.

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

`openNotificationsPanel()` / `closeNotificationsPanel()` do not work when you have embedded `VeltNotificationsPanel` directly in your layout; they control the panel opened by `VeltNotificationsTool`.

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

**Controlling Initial Load Count:**

```jsx
// Notifications shown per tab page (default: 5); "Load more" pages in steps of this size
<VeltNotificationsTool pageSize={20} />
<VeltNotificationsPanel pageSize={20} />
```

**For HTML:**

```html
<velt-notifications-tool page-size="20"></velt-notifications-tool>
```

**Verification:**
- [ ] Panel mode matches application layout needs
- [ ] Embedded panels have proper container styling
- [ ] Programmatic controls work as expected
- [ ] pageSize set if default load count needs adjustment

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#panelopenmode - "panelOpenMode"
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#opennotificationspanel - "openNotificationsPanel"
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#pagesize - "pageSize"
- https://docs.velt.dev/ui-customization/reference/behaviors/notifications - "panelOpenMode", "pageSize" defaults
