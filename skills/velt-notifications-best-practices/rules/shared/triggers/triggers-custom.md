---
title: Create Custom Notifications via REST API
impact: MEDIUM
impactDescription: Send notifications from backend for custom application events
tags: custom, rest-api, add, server-side, triggers
---

## Create Custom Notifications via REST API

Use the REST API to create custom notifications for application-specific events (task completions, status changes, etc.).

**Incorrect (only relying on automatic notifications):**

```jsx
// Only comment-based notifications
// No custom event notifications
```

**Correct (creating custom notifications via API):**

```javascript
// POST https://api.velt.dev/v2/notifications/add

const response = await fetch('https://api.velt.dev/v2/notifications/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': 'YOUR_API_KEY',
    'x-velt-auth-token': 'YOUR_AUTH_TOKEN'
  },
  body: JSON.stringify({
    data: {
      organizationId: 'your-org-id',
      documentId: 'your-doc-id',

      // User who triggered the action
      actionUser: {
        userId: 'user-123',
        name: 'John Doe',
        email: 'john@example.com'
      },

      // Notification content with template variables
      displayHeadlineMessageTemplate: '{actionUser} completed task "{taskName}"',
      displayHeadlineMessageTemplateData: {
        actionUser: { userId: 'user-123', name: 'John Doe' },
        taskName: 'Review PR #42'
      },

      // Optional body message
      displayBodyMessage: 'The task has been marked as complete.',

      // Who to notify
      notifyUsers: [
        { userId: 'user-456', email: 'jane@example.com' },
        { userId: 'user-789', email: 'bob@example.com' }
      ],

      // Or notify all users on document
      notifyAll: false,

      // Check document access before notifying
      verifyUserPermissions: true
    }
  })
});
```

**Correct (resolver write-side — structural data only, PII omitted):**

```javascript
// POST https://api.velt.dev/v2/notifications/add
// When isNotificationResolverUsed: true, displayHeadlineMessageTemplate
// and displayBodyMessage are not required — the resolver supplies them at read time.

const response = await fetch('https://api.velt.dev/v2/notifications/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': 'YOUR_API_KEY',
    'x-velt-auth-token': 'YOUR_AUTH_TOKEN'
  },
  body: JSON.stringify({
    data: {
      apiKey: 'YOUR_API_KEY',
      organizationId: 'org-abc',
      documentId: 'doc-789',
      notificationSource: 'custom',
      isNotificationResolverUsed: true,
      actionUser: { userId: 'user-123' },
      notifyUsers: [{ userId: 'user-456' }]
      // displayHeadlineMessageTemplate and displayBodyMessage omitted
    }
  })
});
```

**Template Variables:**

Use curly braces `{variableName}` in templates. Built-in variables:
- `{actionUser}` - User who took the action
- `{recipientUser}` - User receiving the notification

Custom variables can be any string value in `displayHeadlineMessageTemplateData`.

**Notification Options:**

| Field | Type | Description |
|-------|------|-------------|
| `organizationId` | string | Required. Your organization |
| `documentId` | string | Required. Document context |
| `actionUser` | User | Required. Who triggered the notification |
| `displayHeadlineMessageTemplate` | string | Main message with variables. Optional when `isNotificationResolverUsed: true` |
| `displayHeadlineMessageTemplateData` | object | Variable values |
| `displayBodyMessage` | string | Secondary message text. Optional when `isNotificationResolverUsed: true` |
| `notifyUsers` | User[] | Specific users to notify |
| `notifyAll` | boolean | Notify all document users |
| `verifyUserPermissions` | boolean | Check document access (default: false) |
| `isNotificationResolverUsed` | boolean | Optional. When `true`, marks this notification as resolver-eligible. `displayHeadlineMessageTemplate` and `displayBodyMessage` are not required; the notification resolver supplies PII content at read time via the registered data provider |
| `notificationSource` | string | Optional. Must be `'custom'` for resolver routing. Only custom-source notifications are routed through the resolver pipeline |

**Example Use Cases:**

```javascript
// Task completed
{
  displayHeadlineMessageTemplate: '{actionUser} completed "{taskName}"',
  displayBodyMessage: 'All checklist items have been marked done.'
}

// Document shared
{
  displayHeadlineMessageTemplate: '{actionUser} shared "{documentName}" with you',
  displayBodyMessage: 'You now have edit access.'
}

// Status changed
{
  displayHeadlineMessageTemplate: '{actionUser} changed status to "{newStatus}"',
  displayBodyMessage: 'Previously: {oldStatus}'
}
```

**Response:**

```json
{
  "result": {
    "status": "success",
    "message": "Notification added successfully.",
    "data": {
      "id": "notification-id-123"
    }
  }
}
```

**Verification:**
- [ ] API key and auth token configured
- [ ] Required fields (organizationId, documentId, actionUser) provided
- [ ] Template variables match templateData keys
- [ ] notifyUsers or notifyAll specified

**Source Pointer:** https://docs.velt.dev/api-reference/rest-apis/v2/notifications/add-notifications - Add Notifications API
