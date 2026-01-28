---
title: Use React Hooks to Access Notification Data
impact: HIGH
impactDescription: Real-time access to notification data in React components
tags: hooks, useNotificationsData, useUnreadNotificationsCount, react
---

## Use React Hooks to Access Notification Data

Velt provides React hooks for accessing notification data reactively. Use these for custom notification displays or badges.

**Incorrect (polling or manual fetching):**

```jsx
// Wrong: Manually fetching notifications
const [notifications, setNotifications] = useState([]);

useEffect(() => {
  const interval = setInterval(async () => {
    const data = await fetchNotifications();
    setNotifications(data);
  }, 5000);
  return () => clearInterval(interval);
}, []);
```

**Correct (using Velt hooks):**

```jsx
import {
  useNotificationsData,
  useUnreadNotificationsCount
} from '@veltdev/react';

function NotificationBadge() {
  // Get all notification data
  const notificationData = useNotificationsData();

  // Get data for specific tab
  const forYouData = useNotificationsData({ type: 'forYou' });
  const allData = useNotificationsData({ type: 'all' });

  // Get unread counts
  const unreadCount = useUnreadNotificationsCount();
  // Returns: { forYou: number, all: number }

  return (
    <div className="notification-badge">
      <span className="count">{unreadCount?.forYou || 0}</span>
      <span>unread notifications</span>
    </div>
  );
}
```

**Available Hooks:**

| Hook | Returns | Description |
|------|---------|-------------|
| `useNotificationsData()` | `Notification[]` | All notifications |
| `useNotificationsData({ type: 'forYou' })` | `Notification[]` | Filtered by tab type |
| `useUnreadNotificationsCount()` | `{ forYou: number, all: number }` | Unread counts |
| `useNotificationUtils()` | Utility functions | Panel control methods |
| `useNotificationEventCallback('settingsUpdated')` | Settings event | Fires when user updates settings |

**Handling Notification Click Events:**

```jsx
import { VeltNotificationsTool, VeltNotificationsPanel } from '@veltdev/react';

function NotificationHandler() {
  // Handle notification clicks via component prop
  const handleNotificationClick = (notification) => {
    console.log('Notification clicked:', notification);
    // Navigate to the relevant content
    router.push(`/document/${notification.documentId}`);
  };

  return (
    <VeltNotificationsTool
      onNotificationClick={handleNotificationClick}
    />
    // Or for embedded panel:
    // <VeltNotificationsPanel onNotificationClick={handleNotificationClick} />
  );
}
```

**Handling Settings Update Events:**

```jsx
import { useNotificationEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function SettingsHandler() {
  // Hook is specifically for settings update events
  const settingsUpdatedEvent = useNotificationEventCallback('settingsUpdated');

  useEffect(() => {
    console.log('Settings updated:', settingsUpdatedEvent);
  }, [settingsUpdatedEvent]);

  return null;
}
```

**SDK API Alternative:**

```jsx
import { useVeltClient } from '@veltdev/react';

function NotificationData() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;

    const notificationElement = client.getNotificationElement();

    // Subscribe to notifications
    const subscription = notificationElement
      .getNotificationsData()
      .subscribe((notifications) => {
        console.log('Notifications:', notifications);
      });

    // Subscribe to unread count
    const countSub = notificationElement
      .getUnreadNotificationsCount()
      .subscribe((count) => {
        console.log('Unread:', count);
      });

    return () => {
      subscription.unsubscribe();
      countSub.unsubscribe();
    };
  }, [client]);
}
```

**Verification:**
- [ ] Hooks imported from @veltdev/react
- [ ] Component re-renders when data changes
- [ ] Type parameter used correctly for filtered data

**Source Pointer:** https://docs.velt.dev/async-collaboration/notifications/customize-behavior - Data, Events
