---
title: Notification Management via REST API
impact: MEDIUM
impactDescription: Notifications keep users informed of collaboration events — misconfigured templates produce broken messages
tags: rest, api, notifications, templates
---

## Notification Management via REST API

Send custom notifications and manage notification configuration. All endpoints are POST with base URL `https://api.velt.dev/v2`.

**Required headers:**

```
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN
```

### Add a Notification

Use `displayHeadlineMessageTemplate` with template variables to create dynamic notification messages.

**Required vs. optional fields on `POST /v2/notifications/add`:**

| Field | Required | Notes |
|-------|----------|-------|
| `organizationId` | Yes | Always required |
| `documentId` | Yes | Always required |
| `notificationId` | Yes | Custom IDs may use `_` and `-` only |
| `actionUser` | Yes | `userId`, `name`, `email` |
| `notifyUsers` | Yes | Array of recipients |
| `displayHeadlineMessageTemplate` | Conditional | Required **unless** `isNotificationResolverUsed` is `true` |
| `displayBodyMessage` | Conditional | Required **unless** `isNotificationResolverUsed` is `true` |
| `isNotificationResolverUsed` | No | Set `true` to enable Notification Resolver mode (content resolved at read time) |
| `notificationSource` | No | `'custom'` routes through the Notification Resolver; built-in values: `'comment'`, `'huddle'`, `'crdt'` |
| `notificationSourceData` | No | Arbitrary object delivered in the click callback |

```bash
POST https://api.velt.dev/v2/notifications/add

{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "notification": {
      "notificationSource": "custom",
      "displayHeadlineMessageTemplate": "{actionUser} assigned you to {taskName}",
      "displayHeadlineMessageTemplateData": {
        "actionUser": "Alice",
        "taskName": "Fix login bug"
      },
      "actionUser": {
        "userId": "user-1",
        "name": "Alice",
        "email": "alice@example.com"
      },
      "notifyUsers": [
        {
          "userId": "user-2",
          "name": "Bob",
          "email": "bob@example.com"
        }
      ]
    }
  }
}
```

**Common template variables:**

| Variable | Description |
|----------|-------------|
| `{actionUser}` | User who triggered the action |
| `{taskName}` | Name of the task or item |
| `{documentName}` | Name of the document |
| `{commentText}` | Content of the comment |

### Writing Resolver-Eligible Notifications (Cloud Functions / Notification Resolver mode)

When notification content (headline, body) lives on your own infrastructure and is resolved at read time via the [Notification Resolver](https://docs.velt.dev/self-host-data/notifications), omit `displayHeadlineMessageTemplate` and `displayBodyMessage`, and set both `isNotificationResolverUsed: true` and `notificationSource: 'custom'` in the POST body. Only notifications where `notificationSource === 'custom'` are routed through the resolver — other sources (`'comment'`, `'huddle'`, `'crdt'`) use built-in templates and do **not** call your data provider.

**Correct (resolver-eligible write — minimal payload):**

```bash
POST https://api.velt.dev/v2/notifications/add
```

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
      {
        "userId": "recipientUserId",
        "email": "recipient@example.com"
      }
    ],
    "notifyAll": false
  }
}
```

**Incorrect (resolver flag set but `notificationSource` missing — will NOT route through your data provider):**

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

**Incorrect (resolver mode but templates also included — wastes payload; templates are ignored when the resolver hydrates):**

```json
{
  "data": {
    "notificationId": "custom-notif-001",
    "isNotificationResolverUsed": true,
    "notificationSource": "custom",
    "displayHeadlineMessageTemplate": "{actionUser} did a thing",
    "displayBodyMessage": "Stored on Velt — defeats the purpose of self-hosting"
  }
}
```

### Get, Update, Delete Notifications

```bash
# Get notifications for a user
POST https://api.velt.dev/v2/notifications/get
{
  "data": {
    "organizationId": "org-123",
    "userId": "user-2",
    "documentId": "doc-456"
  }
}

# Update a notification (e.g., mark as read)
POST https://api.velt.dev/v2/notifications/update
{
  "data": {
    "organizationId": "org-123",
    "notificationId": "notif-1",
    "notification": {
      "isRead": true
    }
  }
}

# Delete notifications
POST https://api.velt.dev/v2/notifications/delete
{
  "data": {
    "organizationId": "org-123",
    "notificationIds": ["notif-1"]
  }
}
```

### Notification Configuration

```bash
# Get notification config
POST https://api.velt.dev/v2/notifications/get-config
{
  "data": {
    "organizationId": "org-123"
  }
}

# Set notification config
POST https://api.velt.dev/v2/notifications/set-config
{
  "data": {
    "organizationId": "org-123",
    "config": {
      "emailNotifications": true,
      "inAppNotifications": true,
      "emailDelay": 300
    }
  }
}
```

**Key points:**

- Template variables in `displayHeadlineMessageTemplate` use `{variableName}` syntax.
- All variable values must be provided in `displayHeadlineMessageTemplateData`.
- The `notifyUsers` array determines who receives the notification.
- `actionUser` is the user who performed the action (shown in the notification).
- Config endpoints control org-wide notification behavior (email delay, channels).
- Resolver mode requires **both** `isNotificationResolverUsed: true` and `notificationSource: 'custom'` — setting only the boolean flag will not route the notification through your data provider.

**Verification:**
- [ ] Template variables in the message match keys in `displayHeadlineMessageTemplateData`
- [ ] `notifyUsers` array includes all intended recipients
- [ ] `actionUser` object has `userId`, `name`, and `email`
- [ ] Both required headers are included
- [ ] `organizationId` is present in every request
- [ ] For resolver-mode writes: `isNotificationResolverUsed: true` **and** `notificationSource: 'custom'` are both set; `displayHeadlineMessageTemplate` and `displayBodyMessage` are omitted

**Source Pointer:** `https://docs.velt.dev/api-reference/rest-api/notifications` (## REST API > ### Notifications)
