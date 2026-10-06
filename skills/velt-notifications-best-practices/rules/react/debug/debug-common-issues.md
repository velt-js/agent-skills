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
2. Check user is authenticated with `authProvider`
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
- [ ] User email is valid in authProvider user object
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

**Issue 7: Unread notification missing from For You tab and badge**

```jsx
// Problem: user has an unread @mention, but the badge shows 0
<VeltNotificationsTool />
```

**Solution:**
- By default, For You and the unread count come from the organization's 15 most recently active documents. Notifications on older documents are not fetched.
- Opt in to the user-scoped fetch (SDK 6.0.8+ API, 6.0.9+ prop):

```jsx
<VeltNotificationsTool enableUserScopedNotifications={true} />
```

- `enableCurrentDocumentOnly()` suppresses the user-scoped fetch, so turn it off for org-wide feeds.

**Issue 8: Panel or tool stuck on the loading skeleton**

**Solution:**
- If the tool or panel mounts after notification data has already resolved (for example, rendered after `identify()` completes), SDK builds before 6.0.13 can stay on the skeleton. Upgrade to 6.0.13 or later.

**Issue 9: A user does not get a notification for a private comment**

**Solution:**
- Expected behavior. A notification for a private comment only reaches the comment author and users or organizations named in its visibility, on every channel (panel tabs, webhooks, email). No redacted placeholder is sent, and Access Context filtering still applies on top. No integration change is required.

**Verification:**
- [ ] Velt Console: Notifications feature enabled
- [ ] VeltProvider: API key correct
- [ ] User: authProvider configured with valid user object
- [ ] Document: `setDocument()` called with document ID
- [ ] Network: No CORS or auth errors in console
- [ ] Hooks: Used within VeltProvider context
- [ ] Email: SendGrid configured (for email notifications)

**Debug Logging:**

```jsx
// Enable verbose logging
<VeltProvider apiKey="API_KEY" debug={true}>
```

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/setup - "Setup"
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#enableuserscopednotifications - "enableUserScopedNotifications"
- https://docs.velt.dev/async-collaboration/notifications/overview#notifications-for-private-comments - "Notifications for Private Comments"
- https://docs.velt.dev/release-notes/version-6/sdk-changelog - 6.0.13 loading-skeleton fix
