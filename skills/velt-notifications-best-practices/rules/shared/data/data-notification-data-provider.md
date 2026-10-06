---
title: Use NotificationDataProvider to Fetch and Delete Notifications from Your Own Backend
impact: HIGH
impactDescription: Routes custom notification data through your backend resolver instead of Velt's storage, enabling full control over notification PII and lifecycle
tags: notification-data-provider, setDataProviders, dataProviders, resolver, custom, notificationSource, pipeline, self-hosting, getConfig, deleteConfig
---

## Use NotificationDataProvider to Fetch and Delete Notifications from Your Own Backend

Register a `NotificationDataProvider` as `dataProviders.notification` (the `VeltProvider` `dataProviders` prop in React, `Velt.setDataProviders()` elsewhere) so Velt calls your `get` and `delete` handlers instead of storing notification content on its servers. Only notifications with `notificationSource === 'custom'` are routed through this resolver. The resolution pipeline runs notification → user → comment, and enriched notifications carry `isNotificationResolverUsed: true`.

**Incorrect (wrong response shape, provider set too late):**

```jsx
// Registered after identify(), and returns { status, data: [] }.
// ResolverResponse needs success + statusCode, and data keyed by notificationId.
client.setDataProviders({
  notification: {
    get: async ({ organizationId, notificationIds }) => {
      const rows = await myBackend.fetchNotifications(organizationId, notificationIds);
      return { status: 200, data: rows };
    },
  },
});
```

**Correct (React / Next.js, function-based provider on VeltProvider):**

```jsx
import { VeltProvider } from '@veltdev/react';

const notificationDataProvider = {
  // request: { organizationId, notificationIds }
  get: async (request) => {
    const response = await fetch('/api/velt/notifications/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    // Must resolve to ResolverResponse<Record<notificationId, PartialNotification>>:
    // { success: true, statusCode: 200, data: { 'custom-notif-001': { notificationId: 'custom-notif-001', ... } } }
    return await response.json();
  },
  // request: { notificationId, organizationId }
  delete: async (request) => {
    const response = await fetch('/api/velt/notifications/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return await response.json(); // { success: true, statusCode: 200 }
  },
  config: {
    resolveTimeout: 5000,
    getRetryConfig: { retryCount: 3, retryDelay: 2000 },
    deleteRetryConfig: { retryCount: 3, retryDelay: 2000 },
  },
};

<VeltProvider apiKey="YOUR_API_KEY" dataProviders={{ notification: notificationDataProvider }}>
  {/* app */}
</VeltProvider>
```

**Correct (Other Frameworks, endpoint-based provider):**

```js
// Let the SDK POST the request body to your endpoints
const notificationDataProvider = {
  config: {
    getConfig: {
      url: 'https://your-backend.com/api/velt/notifications/get',
      headers: { Authorization: 'Bearer YOUR_TOKEN' },
    },
    deleteConfig: {
      url: 'https://your-backend.com/api/velt/notifications/delete',
      headers: { Authorization: 'Bearer YOUR_TOKEN' },
    },
    resolveTimeout: 5000,
    getRetryConfig: { retryCount: 3, retryDelay: 2000 },
    deleteRetryConfig: { retryCount: 3, retryDelay: 2000 },
  },
};

// Call before Velt.identify()
Velt.setDataProviders({ notification: notificationDataProvider });
```

**NotificationDataProvider:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `get` | `(request: GetNotificationResolverRequest) => Promise<ResolverResponse<Record<string, PartialNotification>>>` | No | Fetch notification PII. Request: `{ organizationId, notificationIds }`. |
| `delete` | `(request: DeleteNotificationResolverRequest) => Promise<ResolverResponse<undefined>>` | No | Delete notification PII. Request: `{ notificationId, organizationId }`. |
| `config` | `NotificationResolverConfig` | No | `resolveTimeout` (ms), `getRetryConfig`, `deleteRetryConfig` (`RetryConfig`: `retryCount`, `retryDelay`, `revertOnFailure`), `getConfig` / `deleteConfig` (`ResolverEndpointConfig`: `url`, `headers`, optional `credentials`). |

`PartialNotification` requires `notificationId` and may carry `displayHeadlineMessageTemplate`, `displayHeadlineMessageTemplateData`, `displayBodyMessage`, `displayBodyMessageTemplate`, `displayBodyMessageTemplateData`, `notificationSourceData`, and custom fields.

**Key Constraints:**
- Set data providers before calling `identify` (or before `authProvider` signs the user in).
- Every handler response must include `success` (boolean) and `statusCode` (`200` for success, e.g. `500` for errors) so Velt can handle errors and retries.
- Only `notificationSource === 'custom'` notifications call your provider. Write them via the Add Notifications REST API with `notificationSource: 'custom'` and `isNotificationResolverUsed: true`, omitting `displayHeadlineMessageTemplate` / `displayBodyMessage` (see `triggers-custom`).
- Velt stores only routing identifiers (`notificationId`, `actionUser`, hashed `notifyUsers` / `notifyUsersByUserId`), `notificationSource`, and the `isNotificationResolverUsed` flag.
- If `get` fails, the notification renders without enriched PII and is retried if retries are configured.
- Function-based and endpoint-based approaches can be combined. `headers` may also be an async function resolved per request.
- Debug with `client.on('dataProvider')` (React) / `Velt.on('dataProvider')` and unsubscribe when done.

**Verification Checklist:**
- [ ] Provider registered before `identify` / sign-in
- [ ] `get` returns `{ success: true, statusCode: 200, data: { [notificationId]: PartialNotification } }`
- [ ] `delete` returns `{ success: true, statusCode: 200 }` on success
- [ ] Custom notifications are written with `notificationSource: 'custom'` and `isNotificationResolverUsed: true`
- [ ] `resolveTimeout` and retry configs tuned for your backend latency

**Source Pointers:**
- https://docs.velt.dev/self-hosting/partial/notifications - "Notifications" self-hosting (function and endpoint providers, resolver-eligible writes)
- https://docs.velt.dev/api-reference/sdk/models/data-models#notificationdataprovider - "NotificationDataProvider"
- https://docs.velt.dev/api-reference/sdk/models/data-models#resolverresponse - "ResolverResponse"
- https://docs.velt.dev/api-reference/sdk/models/data-models#notification - "Notification" (`isNotificationResolverUsed`)
