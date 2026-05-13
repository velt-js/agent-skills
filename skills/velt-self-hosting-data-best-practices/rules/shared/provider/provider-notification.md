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

**Storage-boundary contract (what persists where):**

When the notification resolver is in use, the SDK strips notification PII before writing to Velt and re-hydrates on read. Only a minimal routing shape persists on Velt servers:

| Field | Stored on Velt | Stored on your DB |
|-------|----------------|-------------------|
| `notificationId` | Yes (routing) | Yes (primary key) |
| `notificationSource` | Yes (always `"custom"`) | — |
| `isNotificationResolverUsed` | Yes (boolean flag) | — |
| `actionUser` | Yes (userId only) | — |
| `notifyUsers` | Yes (userId list only) | — |
| `displayHeadlineMessageTemplate` | No | Yes |
| `displayHeadlineMessageTemplateData` | No | Yes |
| `displayBodyMessage` | No | Yes |
| `notificationSourceData` | No | Yes |

Stored-on-Velt example (everything the SDK retains when the resolver is active):

```json
{
  "notificationId": "custom-notif-001",
  "notificationSource": "custom",
  "isNotificationResolverUsed": true,
  "actionUser": { "userId": "user-123" },
  "notifyUsers": [{ "userId": "user-456" }]
}
```

Headline/body templates, template data, and `notificationSourceData` are NOT stored on Velt — they live exclusively on your database and are merged back via `get` at render time. Your `get` handler must return the full PII shape (headline, body, source data) for the SDK to hydrate the notification correctly.

**Writing Resolver-Eligible Notifications (REST-side):**

To create a notification whose content will be resolved from your own infrastructure at read time, the REST write must set **both** `isNotificationResolverUsed: true` **and** `notificationSource: 'custom'`, and omit `displayHeadlineMessageTemplate` and `displayBodyMessage`. Only notifications where `notificationSource === 'custom'` are routed through the notification resolver — notifications without this field will **not** call your data provider, even if `isNotificationResolverUsed` is `true`.

**Correct (minimal resolver-eligible POST body to `POST https://api.velt.dev/v2/notifications/add`):**

```json
{
  "data": {
    "organizationId": "yourOrganizationId",
    "documentId": "yourDocumentId",
    "actionUser": {
      "userId": "yourUserId",
      "name": "User Name",
      "email": "user@example.com"
    },
    "notificationId": "custom-notif-001",
    "isNotificationResolverUsed": true,
    "notificationSource": "custom",
    "notifyUsers": [
      { "userId": "recipientUserId", "email": "recipient@example.com" }
    ],
    "notifyAll": false
  }
}
```

**Incorrect (missing `notificationSource: 'custom'` — silently bypasses the resolver and your `get` handler is never called):**

```json
{
  "data": {
    "organizationId": "yourOrganizationId",
    "documentId": "yourDocumentId",
    "notificationId": "custom-notif-001",
    "isNotificationResolverUsed": true,
    "notifyUsers": [{ "userId": "recipientUserId" }]
  }
}
```

See the [Add Notifications API (v2)](https://docs.velt.dev/api-reference/rest-apis/v2/notifications/add-notifications) for the full parameter reference.

**Key details:**
- Only `get` and `delete` — no `save` (notifications are created via REST API, not the SDK)
- Only custom notifications (`notificationSource === 'custom'`) are routed through this provider
- `Notification.isNotificationResolverUsed` is `true` when PII was stripped
- Pair with the REST API `POST /v2/notifications/add` with `isNotificationResolverUsed: true` to create custom notifications that use the resolver
- Velt servers never see headline templates, body text, or `notificationSourceData` when the resolver is configured — they remain on your infrastructure

**Verification:**
- [ ] Only used for custom notifications (notificationSource === 'custom')
- [ ] get returns `Record<string, PartialNotification>` with full PII (headline, body, source data) hydrated from your DB
- [ ] delete returns `ResolverResponse<undefined>`
- [ ] Provider set before identify()
- [ ] Customer DB stores the full notification record (templates + source data); Velt stores only routing identifiers, source flag, resolver flag, actionUser, and notifyUsers
- [ ] REST writes that should hit the resolver set **both** `isNotificationResolverUsed: true` and `notificationSource: 'custom'` (the source field is what actually routes — the boolean alone is not enough)

**Source Pointer:** https://docs.velt.dev/self-host-data/notifications ("Sample Data")
