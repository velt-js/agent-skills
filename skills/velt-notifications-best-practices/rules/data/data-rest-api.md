---
title: Use REST APIs for Server-Side Notification Management
impact: HIGH
impactDescription: Programmatic access to notifications from backend services
tags: rest-api, server, get, update, notifications
---

## Use REST APIs for Server-Side Notification Management

Use Velt's REST APIs to get, update, or create notifications from your backend. Requires API key and auth token.

**Incorrect (client-side only approach):**

```jsx
// Wrong: No backend notification management
// Can't send notifications from server events
```

**Correct (using REST API from backend):**

**Get Notifications:**

```javascript
// POST https://api.velt.dev/v2/notifications/get

const response = await fetch('https://api.velt.dev/v2/notifications/get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': 'YOUR_API_KEY',
    'x-velt-auth-token': 'YOUR_AUTH_TOKEN'
  },
  body: JSON.stringify({
    data: {
      organizationId: 'your-org-id',
      documentId: 'your-doc-id',      // Optional: filter by document
      userId: 'user-id',               // Optional: filter by user
      pageSize: 20,                    // Default: 1000
      order: 'desc'                    // 'asc' or 'desc'
    }
  })
});

const { result } = await response.json();
// result.data contains notification array
// result.pageToken for pagination
```

**Update Notifications (Mark as Read):**

```javascript
// POST https://api.velt.dev/v2/notifications/update

const response = await fetch('https://api.velt.dev/v2/notifications/update', {
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
      notifications: [
        {
          id: 'notification-id',
          readByUserIds: ['user-1', 'user-2'],  // Mark read for these users
          persistReadForUsers: true              // Keep in "For You" tab
        }
      ]
    }
  })
});
```

**Query Options:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `organizationId` | string | Required. Your organization ID |
| `documentId` | string | Optional. Filter by document |
| `userId` | string | Optional. Filter by user |
| `locationId` | string | Optional. Filter by location |
| `notificationIds` | string[] | Optional. Get specific notifications (max 30) |
| `pageSize` | number | Items per page (default: 1000) |
| `pageToken` | string | For pagination |
| `order` | string | 'asc' or 'desc' (default: 'desc') |

**Response Structure:**

```json
{
  "result": {
    "status": "success",
    "message": "Notification(s) retrieved successfully.",
    "data": [
      {
        "id": "notificationId",
        "notificationSource": "custom",
        "actionUser": { "userId": "...", "name": "...", "email": "..." },
        "displayHeadlineMessageTemplate": "...",
        "displayBodyMessage": "...",
        "timestamp": 1722409519944
      }
    ],
    "pageToken": "nextPageToken"
  }
}
```

**Prerequisites:**
- Enable "Advanced Queries" in [Velt Console](https://console.velt.dev/dashboard/config/appconfig)
- Deploy v4 series of Velt SDK
- Generate auth token for API access

**Verification:**
- [ ] Advanced Queries enabled in console
- [ ] API key and auth token configured
- [ ] Correct endpoint URL used
- [ ] Required headers included

**Source Pointer:** `/docs/api-reference/rest-apis/v2/notifications/get-notifications-v2.mdx` (Get Notifications API)
