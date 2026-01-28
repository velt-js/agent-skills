---
title: Configure Notification Panel Tabs
impact: HIGH
impactDescription: Customize which notification categories users see
tags: panel, tabs, forYou, all, documents, people, tabConfig
---

## Configure Notification Panel Tabs

The notification panel has four tabs: forYou, all, documents, and people. Use `tabConfig` to rename, enable/disable, or reorder these tabs.

**Incorrect (using wrong config structure):**

```jsx
// Wrong: trying to pass tab config as separate props
<VeltNotificationsTool
  forYouTab={false}
  allTab={true}
/>
```

**Correct (using tabConfig prop):**

```jsx
import { VeltNotificationsTool } from '@veltdev/react';

<VeltNotificationsTool
  tabConfig={{
    "forYou": {
      name: 'Mentions',      // Custom display name
      enable: true           // Show this tab
    },
    "documents": {
      name: 'By Document',
      enable: true
    },
    "all": {
      name: 'All Activity',
      enable: false          // Hide this tab
    }
  }}
/>
```

**Available Tabs:**

By default, all three tabs are enabled.

| Tab Key | Description | Default |
|---------|-------------|---------|
| `forYou` | Notifications where user is directly involved (@mentions, replies) | Enabled |
| `all` | All notifications grouped by document | Enabled |
| `documents` | Notifications organized by document | Enabled |

**Note:** The `TabPeople` wireframe component exists for UI customization but is not part of the `tabConfig` API.

**For HTML:**

```html
<velt-notifications-tool
  tab-config='{"forYou":{"name":"Mentions","enable":true},"all":{"name":"Activity","enable":true},"documents":{"name":"Docs","enable":true}}'>
</velt-notifications-tool>
```

**API Method Alternative:**

```jsx
import { useVeltClient } from '@veltdev/react';

function ConfigureNotifications() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (client) {
      const notificationElement = client.getNotificationElement();
      notificationElement.setTabConfig({
        "forYou": { name: 'Mentions', enable: true },
        "documents": { name: 'Documents', enable: false },
        "all": { name: 'All', enable: true }
      });
    }
  }, [client]);
}
```

**Verification:**
- [ ] tabConfig object uses correct tab keys
- [ ] Each tab has name and enable properties
- [ ] Disabled tabs do not appear in panel

**Source Pointer:** https://docs.velt.dev/async-collaboration/notifications/customize-behavior - Tab Configuration
