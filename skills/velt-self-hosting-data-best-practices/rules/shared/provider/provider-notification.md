---
title: Self-Host Notification Data for Custom Notifications
impact: MEDIUM
impactDescription: Route custom notification PII through your own infrastructure
tags: notification, NotificationDataProvider, NotificationResolverConfig, get, delete, self-hosting, custom
---

## Self-Host Notification Data for Custom Notifications

The notification data provider handles PII for **custom notifications only** (where `notificationSource === 'custom'`). Built-in notifications from comments, huddle, and CRDT are not routed through this provider.

**NotificationDataProvider interface:**

```typescript
interface NotificationDataProvider {
  get?: (request: GetNotificationResolverRequest) => Promise<ResolverResponse<Record<string, PartialNotification>>>;
  delete?: (request: DeleteNotificationResolverRequest) => Promise<ResolverResponse<undefined>>;
  config?: NotificationResolverConfig;
}

interface GetNotificationResolverRequest {
  organizationId: string;
  notificationIds?: string[];
  documentId?: string;
}

interface DeleteNotificationResolverRequest {
  notificationId: string;
  metadata?: BaseMetadata;
  event?: ResolverActions;
}

interface NotificationResolverConfig {
  resolveTimeout?: number;
  getRetryConfig?: RetryConfig;
  deleteRetryConfig?: RetryConfig;
  getConfig?: ResolverEndpointConfig;     // Endpoint-based alternative
  deleteConfig?: ResolverEndpointConfig;  // Endpoint-based alternative
}
```

**Function-based example:**

```tsx
const notificationDataProvider: NotificationDataProvider = {
  get: async (request) => {
    const response = await fetch('/api/velt/notifications/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const data = await response.json();
    return { data: data.result || {}, success: true, statusCode: 200 };
  },
  delete: async (request) => {
    await fetch('/api/velt/notifications/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return { data: undefined, success: true, statusCode: 200 };
  },
  config: {
    resolveTimeout: 10000,
    getRetryConfig: { retryCount: 3, retryDelay: 2000 },
    deleteRetryConfig: { retryCount: 2, retryDelay: 1000 },
  },
};

// Wire into VeltProvider
<VeltProvider apiKey={KEY} authProvider={auth} dataProviders={{
  notification: notificationDataProvider,
}}>
```

**Resolution pipeline order:** notification → user → comment. The notification provider resolves first, then user PII is resolved, then comment content if applicable.

**Key details:**
- Only `get` and `delete` — no `save` (notifications are created via REST API, not the SDK)
- Only custom notifications (`notificationSource === 'custom'`) are routed through this provider
- `Notification.isNotificationResolverUsed` is `true` when PII was stripped
- Pair with the REST API `POST /v2/notifications/add` with `isNotificationResolverUsed: true` to create custom notifications that use the resolver

**Verification:**
- [ ] Only used for custom notifications (notificationSource === 'custom')
- [ ] get returns `Record<string, PartialNotification>`
- [ ] delete returns `ResolverResponse<undefined>`
- [ ] Provider set before identify()

**Source Pointer:** https://docs.velt.dev/self-host-data/notifications
