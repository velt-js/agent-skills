---
title: Configure Notification Delivery Channels
impact: MEDIUM-HIGH
impactDescription: Set up where users receive notifications (Inbox, Email, Slack, etc.)
tags: settings, channels, inbox, email, slack, setSettingsInitialConfig
---

## Configure Notification Delivery Channels

Configure which channels users can receive notifications through. Default channels are Inbox (ALL) and Email (MINE). Users can customize their preferences. Settings are off by default: first enable the settings feature in the [Velt Console](https://console.velt.dev/dashboard/config/notification), then turn on the `settings` prop (or `enableSettings()`). Custom channels such as Slack only appear in the UI; you deliver to them yourself from webhooks.

**Incorrect (no channel configuration):**

```jsx
// Missing channel config - users get defaults only
<VeltNotificationsTool />
```

**Correct (configuring notification channels):**

```jsx
import { useVeltClient } from '@veltdev/react';

function NotificationSetup() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;

    const notificationElement = client.getNotificationElement();

    // Configure available channels and defaults
    notificationElement.setSettingsInitialConfig([
      {
        id: 'inbox',
        name: 'Inbox',
        enable: true,
        default: 'ALL',         // Default selection for new users
        values: [
          { id: 'ALL', name: 'All Updates' },
          { id: 'MINE', name: 'Mentions Only' },
          { id: 'NONE', name: 'None' }
        ]
      },
      {
        id: 'email',
        name: 'Email',
        enable: true,
        default: 'MINE',        // Only email on mentions
        values: [
          { id: 'ALL', name: 'All Updates' },
          { id: 'MINE', name: 'Mentions Only' },
          { id: 'NONE', name: 'None' }
        ]
      },
      {
        id: 'slack',
        name: 'Slack',
        enable: true,           // Enable Slack channel
        default: 'MINE',
        values: [
          { id: 'ALL', name: 'All Updates' },
          { id: 'MINE', name: 'Mentions Only' },
          { id: 'NONE', name: 'None' }
        ]
      }
    ]);
  }, [client]);

  return <VeltNotificationsTool />;
}
```

**Channel Value Options:**

| Value | Description |
|-------|-------------|
| `ALL` | Receive all notifications |
| `MINE` | Only notifications where user is directly involved (@mentions, replies) |
| `NONE` | Do not receive notifications on this channel |

**Managing Settings Programmatically:**

```jsx
import { useNotificationSettings } from '@veltdev/react';

function SettingsManager() {
  // useNotificationSettings returns { setSettingsInitialConfig, setSettings, settings }
  const { setSettingsInitialConfig, setSettings, settings } = useNotificationSettings();

  // settings: current user settings (initially null, updates when fetched)
  console.log('Current settings:', settings);

  // Update specific channel
  const updateEmailSetting = () => {
    setSettings({
      email: 'NONE'  // Disable email notifications
    });
  };

  return null;
}

// Or via API using useNotificationUtils
function UpdateSettings() {
  const { client } = useVeltClient();

  const updateEmailSetting = () => {
    const notificationElement = client?.getNotificationElement();

    // Update specific channel
    notificationElement?.setSettings({
      email: 'NONE'  // Disable email notifications
    });
  };

  const muteAll = () => {
    const notificationElement = client?.getNotificationElement();
    notificationElement?.muteAllNotifications();
  };
}
```

**Settings UI Layout:**

```jsx
// Change settings display from accordion (default) to dropdown using component prop
<VeltNotificationsTool settingsLayout="dropdown" />
<VeltNotificationsPanel settingsLayout="dropdown" />
```

**Enable/Disable Settings Panel:**

```jsx
const notificationElement = client.getNotificationElement();

// Hide settings gear icon
notificationElement.disableSettings();

// Show settings gear icon
notificationElement.enableSettings();
```

**Organization-Level Settings:**

By default, settings apply to the current user on the current document (with multiple documents or folders, they apply to the root document). Organization-level mode applies the user's settings to all documents in the organization.

```jsx
// Settings apply to all documents in the organization
notificationElement.enableSettingsAtOrganizationLevel();

// Revert to per-document settings
notificationElement.disableSettingsAtOrganizationLevel();

// Or via component prop:
<VeltNotificationsTool enableSettingsAtOrganizationLevel={true} />
```

**Read Notifications on For You Tab:**

```jsx
// By default, read notifications are hidden in the For You tab.
// Enable to show them:
notificationElement.enableReadNotificationsOnForYouTab();

// Disable again:
notificationElement.disableReadNotificationsOnForYouTab();

// Or via component prop:
<VeltNotificationsTool readNotificationsOnForYouTab={true} />
```

**Verification:**
- [ ] Settings feature enabled in the Velt Console and `settings` prop / `enableSettings()` turned on
- [ ] setSettingsInitialConfig called before user interaction
- [ ] Each channel has id, name, enable, default, and values
- [ ] Default values are valid (ALL, MINE, or NONE)

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#setsettingsinitialconfig - "setSettingsInitialConfig"
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#enablesettings - "enableSettings"
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#enablesettingsatorganizationlevel - "enableSettingsAtOrganizationLevel"
- https://docs.velt.dev/async-collaboration/notifications/setup - "(optional) Enable Notification Settings for Users"
