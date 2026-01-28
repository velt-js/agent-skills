---
title: Configure Notification Delivery Channels
impact: MEDIUM-HIGH
impactDescription: Set up where users receive notifications (Inbox, Email, Slack, etc.)
tags: settings, channels, inbox, email, slack, setSettingsInitialConfig
---

## Configure Notification Delivery Channels

Configure which channels users can receive notifications through. Default channels are Inbox (ALL) and Email (MINE). Users can customize their preferences.

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
  const settings = useNotificationSettings();

  // Current user settings: { inbox: 'ALL', email: 'MINE', ... }
  console.log('Current settings:', settings);

  return null;
}

// Or via API
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
// Change settings display from accordion (default) to dropdown
<VeltNotificationsTool settingsLayout="dropdown" />

// Or via API
notificationElement.setSettingsLayout('dropdown'); // 'accordion' or 'dropdown'
```

**Enable/Disable Settings Panel:**

```jsx
const notificationElement = client.getNotificationElement();

// Hide settings gear icon
notificationElement.disableSettings();

// Show settings gear icon
notificationElement.enableSettings();
```

**Verification:**
- [ ] setSettingsInitialConfig called before user interaction
- [ ] Each channel has id, name, enable, default, and values
- [ ] Default values are valid (ALL, MINE, or NONE)

**Source Pointer:** https://docs.velt.dev/async-collaboration/notifications/customize-behavior - Settings, setSettingsInitialConfig
