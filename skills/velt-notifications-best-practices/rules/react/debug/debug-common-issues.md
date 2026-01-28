---
title: Debug Common Notification Issues
impact: LOW-MEDIUM
impactDescription: Troubleshoot notification problems quickly
tags: debug, troubleshooting, issues, verification
---

## Debug Common Notification Issues

Common problems and solutions when implementing Velt notifications.

**Issue 1: Notifications not appearing**

```jsx
// Problem: Tool added but no notifications show
<VeltNotificationsTool />
```

**Solution:**
1. Verify notifications enabled in [Velt Console](https://console.velt.dev)
2. Check user is authenticated with `identify()`
3. Confirm document is set with `setDocument()`
4. Check browser console for errors

```jsx
// Verify setup
import { useVeltClient } from '@veltdev/react';

function DebugNotifications() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (client) {
      console.log('Velt client initialized');

      // Check if notifications element exists
      const notifElement = client.getNotificationElement();
      console.log('Notification element:', notifElement);
    }
  }, [client]);
}
```

**Issue 2: Unread count not updating**

```jsx
// Problem: Badge shows stale count
const count = useUnreadNotificationsCount();
// count is undefined or doesn't change
```

**Solution:**
- Ensure hook is used within VeltProvider
- Verify document context is set
- Check if user has any notifications

```jsx
// Debug unread count
function DebugUnreadCount() {
  const unreadCount = useUnreadNotificationsCount();

  useEffect(() => {
    console.log('Unread count updated:', unreadCount);
  }, [unreadCount]);

  return <div>ForYou: {unreadCount?.forYou}, All: {unreadCount?.all}</div>;
}
```

**Issue 3: Email notifications not sending**

**Checklist:**
- [ ] SendGrid API key configured in Velt Console
- [ ] Sender email verified in SendGrid
- [ ] User has email preference set to ALL or MINE
- [ ] User email is valid in `identify()` call
- [ ] Comment contains @mention (for MINE setting)

**Issue 4: Custom notifications not appearing**

```javascript
// Problem: REST API returns success but notification not visible
const response = await fetch('https://api.velt.dev/v2/notifications/add', ...);
// Returns success but notification doesn't show
```

**Solution:**
- Verify `notifyUsers` contains valid user IDs
- Check `organizationId` and `documentId` match current context
- Ensure user is on the correct document
- Wait for real-time sync (may take a few seconds)

**Issue 5: Settings not persisting**

```jsx
// Problem: User settings reset on page refresh
```

**Solution:**
- `setSettingsInitialConfig` only sets defaults for new users
- Use `setSettings` to update existing user preferences
- Check if user ID is consistent across sessions

**Issue 6: Notification click not navigating**

```jsx
// Problem: Clicking notification doesn't do anything
```

**Solution:**
Use the `onNotificationClick` prop on the component:

```jsx
import { VeltNotificationsTool } from '@veltdev/react';

function NotificationNavigation() {
  const handleNotificationClick = (notification) => {
    // Navigate to document
    if (notification.documentId) {
      router.push(`/documents/${notification.documentId}`);
    }

    // Or use custom data
    if (notification.notificationSourceData?.url) {
      router.push(notification.notificationSourceData.url);
    }
  };

  return (
    <VeltNotificationsTool
      onNotificationClick={handleNotificationClick}
    />
  );
}
```

**Verification:**
- [ ] Velt Console: Notifications feature enabled
- [ ] VeltProvider: API key correct
- [ ] User: `identify()` called with valid user object
- [ ] Document: `setDocument()` called with document ID
- [ ] Network: No CORS or auth errors in console
- [ ] Hooks: Used within VeltProvider context
- [ ] Email: SendGrid configured (for email notifications)

**Debug Logging:**

```jsx
// Enable verbose logging
<VeltProvider apiKey="API_KEY" debug={true}>
```

**Source Pointer:** `/docs/async-collaboration/notifications/setup.mdx` (Setup requirements)
