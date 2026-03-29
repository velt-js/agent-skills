---
title: Use Notification Actions to Manage Read State and Click Handling
impact: MEDIUM-HIGH
impactDescription: Enables programmatic control over notification read state and custom click handlers
tags: notifications, data, actions, read-state, click-handler
---

## Use Notification Actions to Manage Read State and Click Handling

Velt provides APIs to mark individual or all notifications as read and to handle notification click events. Use these to build custom notification workflows, navigation on click, and read-state management.

**Incorrect (no read-state management or click handling):**

```jsx
// Notifications pile up with no way to mark them as read
// No custom action when user clicks a notification
<VeltNotificationsTool />
```

**Correct (mark single notification as read):**

```jsx
import { useVeltClient } from '@veltdev/react';

function MarkAsRead({ notificationId }) {
  const { client } = useVeltClient();

  const handleMarkRead = () => {
    const notificationElement = client?.getNotificationElement();
    notificationElement?.markNotificationAsReadById(notificationId);
  };

  return <button onClick={handleMarkRead}>Mark Read</button>;
}
```

**Correct (mark all notifications as read):**

```jsx
const notificationElement = client.getNotificationElement();

// Mark all notifications as read across all tabs
notificationElement.setAllNotificationsAsRead();

// Mark only "For You" tab as read
notificationElement.setAllNotificationsAsRead({ tabId: 'for-you' });

// Mark "All" or "Document" tab as read (equivalent to marking all)
notificationElement.setAllNotificationsAsRead({ tabId: 'all' });
notificationElement.setAllNotificationsAsRead({ tabId: 'document' });
```

**Correct (handle notification click events):**

```jsx
import { VeltNotificationsTool, VeltNotificationsPanel } from '@veltdev/react';

function NotificationPanel() {
  const onNotificationClickEvent = (notification) => {
    console.log('Notification clicked:', notification);
    // Navigate to the relevant part of the app
    // e.g., router.push(`/doc/${notification.documentId}`)
  };

  // Listen via Tool or Panel — but not both
  return (
    <VeltNotificationsTool
      onNotificationClick={(notification) => onNotificationClickEvent(notification)}
    />
  );
}
```

**Correct (Other Frameworks — click event):**

```html
<script>
const notificationsTool = document.querySelector('velt-notifications-tool');
notificationsTool?.addEventListener('onNotificationClick', (event) => {
  console.log('Notification clicked:', event.detail);
});
</script>
```

**API Reference:**

| Method | Description |
|--------|-------------|
| `markNotificationAsReadById(notificationId)` | Mark a single notification as read in all tabs |
| `setAllNotificationsAsRead()` | Mark all notifications as read across all tabs |
| `setAllNotificationsAsRead({ tabId })` | Mark notifications as read for a specific tab (`for-you`, `all`, `document`) |
| `onNotificationClick` (prop) | Callback fired when a notification is clicked; receives a `Notification` object |

**Verification Checklist:**
- [ ] `markNotificationAsReadById` called with a valid notification ID
- [ ] `onNotificationClick` listener set on either Tool or Panel, not both
- [ ] Click handler implements navigation or custom action as needed
- [ ] `setAllNotificationsAsRead` uses correct `tabId` values

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior - Actions (markNotificationAsReadById, setAllNotificationsAsRead, onNotificationClick)
