---
title: Enable Notifications and Add VeltNotificationsTool
impact: CRITICAL
impactDescription: Required for notifications to function
tags: notifications, setup, veltnotificationstool, console, enable
---

## Enable Notifications and Add VeltNotificationsTool

Notifications must be enabled in the Velt Console before adding the VeltNotificationsTool component. The tool provides the bell icon that opens the notification panel.

**Incorrect (missing console setup or tool component):**

```jsx
import { VeltProvider } from '@veltdev/react';

function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      {/* Missing VeltNotificationsTool - users won't see notifications */}
      <YourApp />
    </VeltProvider>
  );
}
```

**Correct (console enabled + tool component added):**

```jsx
import { VeltProvider, VeltNotificationsTool } from '@veltdev/react';

function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      {/* Step 1: Enable Notifications in Console at console.velt.dev */}
      {/* Step 2: Add VeltNotificationsTool in your toolbar */}
      <div className="toolbar">
        <VeltNotificationsTool />
      </div>
      <YourApp />
    </VeltProvider>
  );
}
```

**For HTML:**

```html
<velt-notifications-tool></velt-notifications-tool>
```

**Setup Steps:**

1. **Enable in Console**: Go to [console.velt.dev](https://console.velt.dev) > Dashboard > Configuration > enable Notifications feature
2. **Add Tool Component**: Place `VeltNotificationsTool` in your app's toolbar/header
3. **Embed Panel (optional)**: Use `VeltNotificationsPanel` for embedded display instead of popover

**Default Behavior:**

- Panel shows up to 50 notifications in "For You" tab
- Panel shows 15 notifications per document (max 15 documents) in other tabs
- Notifications are kept for 15 days by default (configurable via `setMaxDays`)

**Verification:**
- [ ] Notifications enabled in Velt Console
- [ ] VeltNotificationsTool added to app
- [ ] Tool appears in UI (bell icon)
- [ ] Clicking tool opens notification panel

**Source Pointer:** `/docs/async-collaboration/notifications/setup.mdx` (Enable Feature in Console, Add Notification Tool)
