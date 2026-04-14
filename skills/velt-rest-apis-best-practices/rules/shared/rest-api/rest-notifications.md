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

**Verification:**
- [ ] Template variables in the message match keys in `displayHeadlineMessageTemplateData`
- [ ] `notifyUsers` array includes all intended recipients
- [ ] `actionUser` object has `userId`, `name`, and `email`
- [ ] Both required headers are included
- [ ] `organizationId` is present in every request

**Source Pointer:** `https://docs.velt.dev/api-reference/rest-api/notifications` (## REST API > ### Notifications)
