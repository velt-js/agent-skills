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

**Notification Model:**

```typescript
interface Notification {
  id: string;                          // Unique notification ID
  notificationSource: string;          // 'comment', 'huddle', 'crdt', 'custom'
  actionType?: string;                 // e.g., 'added'
  isUnread?: boolean;                  // Read/unread state
  actionUser?: User;                   // User who triggered the notification
  timestamp?: number;                  // Unix timestamp
  displayHeadlineMessage?: string;     // Resolved headline text
  displayBodyMessage?: string;         // Body text
  displayHeadlineMessageTemplate?: string;  // Template with {variables}
  displayHeadlineMessageTemplateData?: object; // Template variable values
  forYou?: boolean;                    // Appears in For You tab
  targetAnnotationId?: string;         // Related annotation ID
  notificationSourceData?: any;        // Custom data from source
  metadata?: NotificationMetadata;     // Document/org context
  notifyUsers?: Record<string, boolean>;       // Users by email hash
  notifyUsersByUserId?: Record<string, boolean>; // Users by user ID hash
  isNotificationResolverUsed?: boolean; // True when resolver handled PII
}
```

**SettingsUpdatedEvent:**

```typescript
interface SettingsUpdatedEvent {
  settings: NotificationSettingsConfig; // Updated channel settings
  isMutedAll: boolean;                  // True if all channels muted
}
```

**GetNotificationsDataQuery:**

```typescript
interface GetNotificationsDataQuery {
  type?: 'all' | 'forYou' | 'documents'; // Filter by tab type
}
```

**NotificationMetadata:**

```typescript
interface NotificationMetadata {
  apiKey?: string;                     // Velt API key
  organizationId?: string;             // Organization ID
  clientOrganizationId?: string;       // Client-side org ID
  documentId?: string;                 // Document ID
  clientDocumentId?: string;           // Client-side document ID
  locationId?: number;                 // Location within document
  location?: Location;                 // Location object
  folderId?: string;                   // Folder ID
  veltFolderId?: string;               // Velt folder ID
  documentMetadata?: object;           // Custom document metadata
  organizationMetadata?: object;       // Custom org metadata
  sdkVersion?: string | null;          // SDK version that created notification
}
```

**Notification Sources:**

| Source | Description | Triggered by |
|--------|-------------|-------------|
| `'comment'` | Comment-related notifications | Adding comments, @mentions, replies |
| `'huddle'` | Huddle/call notifications | Starting or joining huddles |
| `'crdt'` | CRDT editing notifications | Collaborative editing events |
| `'custom'` | Custom notifications | REST API `/v2/notifications/add` — routed through Notification Resolver if configured |

**Verification:**
- [ ] Hooks imported from @veltdev/react
- [ ] Component re-renders when data changes
- [ ] Type parameter used correctly for filtered data

**Source Pointer:** https://docs.velt.dev/async-collaboration/notifications/customize-behavior - Data, Events
