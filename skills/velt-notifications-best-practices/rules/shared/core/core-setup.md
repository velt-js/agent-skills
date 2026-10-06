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
        <VeltNotificationsTool shadowDom={false} />
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

1. **Enable in Console**: Open the [Notifications section](https://console.velt.dev/dashboard/config/notification) under Configurations in the Velt Console and enable Notifications. Notifications do not work until this is on.
2. **Add Tool Component**: Place `VeltNotificationsTool` in your app's toolbar/header
3. **Embed Panel (optional)**: Use `VeltNotificationsPanel` for a dedicated page or section. The tool adds and removes its own panel automatically, so only embed the panel when you want it permanently visible.

**Component Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabConfig` | `object` | All tabs enabled | Rename or disable tabs (`forYou`, `documents`, `all`) |
| `panelOpenMode` | `'popover' \| 'sidebar'` | `'popover'` | How the tool opens its panel |
| `pageSize` | `number` | `5` | Notifications per tab page in the panel; only positive numbers are accepted |
| `maxDays` | `number` | `15` | Max age in days of fetched notifications (tool prop; also `setMaxDays()`) |
| `settings` | `boolean` | `false` | Show the settings gear (also enable settings in the Console) |
| `selfNotifications` | `boolean` | `false` | Include the user's own actions |
| `considerAllNotifications` | `boolean` | `false` | Tool only. Unread badge counts all tabs instead of only For You |
| `readNotificationsOnForYouTab` | `boolean` | `false` | Keep read notifications in the For You tab |
| `enableSettingsAtOrganizationLevel` | `boolean` | `false` | Settings apply to all documents in the organization instead of per document |
| `enableCrossOrganization` | `boolean \| object \| string` | off | Merge For You notifications from the user's other organizations |
| `enableUserScopedNotifications` | `boolean \| object \| string` | off | Fetch the user's newest notifications directly (see `config-user-scoped-notifications`) |
| `settingsLayout` | `'accordion' \| 'dropdown'` | `'accordion'` | Settings UI layout |
| `darkMode` | `boolean` | `false` | Dark mode |
| `shadowDom` | `boolean` | `true` | Component shadow DOM |
| `panelShadowDom` | `boolean` | `true` | Tool only. Shadow DOM of the panel the tool opens (set `false` for custom CSS) |
| `variant` | `string` | None | Wireframe variant for the component |
| `panelVariant` | `string` | None | Tool only. Wireframe variant for the panel the tool opens |
| `onNotificationClick` | `callback` | None | Notification click handler |

**Shared vs per-instance props:** `settings`, `selfNotifications`, `readNotificationsOnForYouTab`, `enableCrossOrganization`, `enableUserScopedNotifications`, `enableSettingsAtOrganizationLevel`, and `maxDays` write to a shared notification service. Setting one on either the tool or the panel changes the data for both, so configure each in one place. `tabConfig`, `pageSize`, `panelOpenMode`, `settingsLayout`, `variant`, and `shadowDom` stay scoped to the component they are set on.

**Default Behavior:**

- "For You" tab fetches the latest 50 notifications
- "Document" and "All" tabs fetch up to 15 notifications for each of the 15 most recently active documents the user can access (use `config-user-scoped-notifications` to keep unread items from older documents visible)
- Notifications older than 15 days are not fetched (configurable via `maxDays` / `setMaxDays`)
- Notifications are only generated and fetched for documents the user has access to; a notification for a private comment only reaches users who can see that comment

**Verification:**
- [ ] Notifications enabled in Velt Console
- [ ] VeltNotificationsTool added to app
- [ ] Tool appears in UI (bell icon)
- [ ] Clicking tool opens notification panel

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/setup - "Enable Notifications in the Velt Console", "Add the Notifications Tool component"
- https://docs.velt.dev/async-collaboration/notifications/overview#default-configuration - "Default Configuration"
- https://docs.velt.dev/ui-customization/reference/behaviors/notifications - per-prop defaults and shared-service behavior
