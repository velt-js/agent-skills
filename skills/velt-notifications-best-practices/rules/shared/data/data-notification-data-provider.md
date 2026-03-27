---
title: Use NotificationDataProvider to Fetch and Delete Notifications from Your Own Backend
impact: HIGH
impactDescription: Routes custom notification data through your backend resolver instead of Velt's storage, enabling full control over notification PII and lifecycle
tags: notification-data-provider, setDataProviders, resolver, custom, notificationSource, pipeline
---

## Use NotificationDataProvider to Fetch and Delete Notifications from Your Own Backend

Register a `NotificationDataProvider` on `VeltDataProvider.notification` via `client.setDataProviders()` to have Velt call your `get` and `delete` handlers instead of reading from Velt's storage. This applies only to notifications where `notificationSource === 'custom'`. The resolution pipeline runs in the order notification → user → comment, so resolver-enriched user references are available when the user resolver executes. Notifications enriched through this resolver gain the `isNotificationResolverUsed: true` flag on the `Notification` model.

**Incorrect (relying on Velt storage for custom notifications that contain PII):**

```jsx
// No data provider registered — Velt reads custom notifications
// directly from its own storage, exposing any PII fields to clients
client.setDataProviders({});
```

**Correct (React / Next.js — register notification get and delete handlers):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function NotificationProviderSetup() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;

    client.setDataProviders({
      notification: {
        get: async ({ organizationId, notificationIds }) => {
          // Fetch enriched notification data from your backend
          const results = await myBackend.fetchNotifications(
            organizationId,
            notificationIds
          );
          return { status: 200, data: results };
        },
        delete: async ({ notificationId, organizationId }) => {
          // Delete the notification from your backend
          await myBackend.deleteNotification(organizationId, notificationId);
          return { status: 200, data: undefined };
        },
        config: {
          // Max ms to wait for resolver response (default: 30000)
          resolveTimeout: 30000,
          getRetryConfig: {
            retryCount: 2,
            retryDelay: 500,
            revertOnFailure: false,
          },
        },
      },
    });
  }, [client]);
}
```

**Correct (Other Frameworks — Angular, Vue, Vanilla JS):**

```typescript
client.setDataProviders({
  notification: {
    get: async ({ organizationId, notificationIds }) => {
      const results = await myBackend.fetchNotifications(organizationId, notificationIds);
      return { status: 200, data: results };
    },
    delete: async ({ notificationId, organizationId }) => {
      await myBackend.deleteNotification(organizationId, notificationId);
      return { status: 200, data: undefined };
    },
  },
});
```

**NotificationDataProvider interface:**

| Field | Type | Optional | Description |
|-------|------|----------|-------------|
| `notification.get` | `(request: GetNotificationResolverRequest) => Promise<ResolverResponse<PartialNotification[]>>` | No | Handler called by Velt to fetch notification data. Receives `organizationId` and an array of `notificationIds`. |
| `notification.delete` | `(request: DeleteNotificationResolverRequest) => Promise<ResolverResponse<undefined>>` | No | Handler called by Velt to delete a single notification. Receives `notificationId` and `organizationId`. |
| `notification.config.resolveTimeout` | `number` | Yes | Max milliseconds to wait for resolver response before timing out. Defaults to `30000`. |
| `notification.config.getRetryConfig` | `{ retryCount: number; retryDelay: number; revertOnFailure: boolean }` | Yes | Retry policy for the `get` handler: number of retries, delay between retries in ms, and whether to revert the UI on final failure. |

**Key Constraints:**
- Only notifications with `notificationSource === 'custom'` are routed through this resolver. Velt-generated notifications (e.g. from comments or @mentions) are not affected.
- Resolution pipeline order is notification → user → comment. The user resolver runs after the notification resolver, ensuring resolver-enriched user references are available when the user resolver executes.
- The `Notification` model gains `isNotificationResolverUsed?: boolean` — this is `true` when the notification was enriched via this resolver, allowing downstream code to detect resolver-enriched notifications.

**Verification Checklist:**
- [ ] `setDataProviders` is called after the Velt client is initialized
- [ ] `get` handler returns `{ status: 200, data: PartialNotification[] }` for all requested `notificationIds`
- [ ] `delete` handler returns `{ status: 200, data: undefined }` on success
- [ ] `resolveTimeout` is set if your backend latency exceeds 30 seconds
- [ ] Only `notificationSource === 'custom'` notifications are expected to flow through this resolver

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior/data/overview - Notification data customization overview
- https://docs.velt.dev/api-reference/sdk/velt-client - setDataProviders API reference
- https://docs.velt.dev/api-reference/sdk/models/data-models#notification - Notification model
