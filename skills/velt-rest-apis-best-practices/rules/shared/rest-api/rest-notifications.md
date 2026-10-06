---
title: Manage Notifications and Notification Config via REST API
impact: MEDIUM
impactDescription: Wrong payload nesting or a missing notifyAll false sends notifications to the whole organization or drops them
tags: rest, api, notifications, templates, notifyAll, notifyUsers, resolver, config, readByUserIds, verifyUserPermissions
---

## Manage Notifications and Notification Config via REST API

Notification fields sit **directly under `data`** (there is no `notification` wrapper object). `notifyAll` **defaults to `true`**, which sends the notification to every user in the organization; set `notifyAll: false` to target only `notifyUsers`. All endpoints are `POST` with the API-key-level headers.

**Incorrect (nested `notification` object, `notifyAll` left at its default):**

```json
{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "notification": {
      "displayHeadlineMessageTemplate": "{actionUser} assigned you to {taskName}",
      "actionUser": { "userId": "user-1" },
      "notifyUsers": [{ "userId": "user-2" }]
    }
  }
}
```

**Correct (top-level fields, explicit `notifyAll: false`):**

```bash
POST https://api.velt.dev/v2/notifications/add

{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "notificationId": "task-assigned-42",
    "actionUser": { "userId": "user-1", "name": "Alice", "email": "alice@example.com" },
    "displayHeadlineMessageTemplate": "{actionUser} assigned you to {taskName}",
    "displayHeadlineMessageTemplateData": {
      "actionUser": { "userId": "user-1", "name": "Alice", "email": "alice@example.com" },
      "taskName": "Fix login bug"
    },
    "displayBodyMessage": "Due Friday",
    "notifyUsers": [{ "userId": "user-2", "name": "Bob", "email": "bob@example.com" }],
    "notifyAll": false,
    "notificationSourceData": { "taskId": "42" }
  }
}
```

**Fields on `POST /v2/notifications/add`:**

| Field | Required | Notes |
|-------|----------|-------|
| `organizationId`, `documentId` | Yes | `createOrganization` / `createDocument` create them if missing |
| `actionUser` | Yes | User who took the action |
| `notifyUsers` | Yes | Recipients |
| `notifyAll` | No | Default `true` (whole organization). Set `false` to notify only `notifyUsers` |
| `displayHeadlineMessageTemplate` | Conditional | Required unless `isNotificationResolverUsed` is `true`. Variables use `{name}` syntax |
| `displayHeadlineMessageTemplateData` | No | Values for template variables: `actionUser`, `recipientUser`, or any custom string field |
| `displayBodyMessage` | Conditional | Required unless `isNotificationResolverUsed` is `true` |
| `notificationId` | No | Auto-generated when omitted. Set it to prevent duplicates. Only `_` and `-` special characters |
| `verifyUserPermissions` | No | Default `false`. When `true`, only users with access to the document are notified |
| `notificationSource` | No | `'custom'` routes through the Notification Resolver; other values include `'comment'`, `'huddle'`, `'crdt'` |
| `notificationSourceData` | No | Any object; returned in the click callback |
| `context` | No | `{ access: { key: value } }` for Access Context filtering |

### Resolver-eligible notifications (self-hosted content)

When notification content lives on your infrastructure and is resolved at read time by the Notification Resolver, omit `displayHeadlineMessageTemplate` and `displayBodyMessage`, and set both `isNotificationResolverUsed: true` and `notificationSource: 'custom'`. Only `notificationSource === 'custom'` notifications are routed through the resolver.

```json
{
  "data": {
    "organizationId": "yourOrganizationId",
    "documentId": "yourDocumentId",
    "actionUser": { "userId": "yourUserId", "name": "User Name", "email": "user@example.com" },
    "notificationId": "custom-notif-001",
    "isNotificationResolverUsed": true,
    "notificationSource": "custom",
    "notifyUsers": [{ "userId": "recipientUserId", "email": "recipient@example.com" }],
    "notifyAll": false
  }
}
```

Setting only `isNotificationResolverUsed: true` without `notificationSource: 'custom'` does not route through your data provider.

### Get, update, and delete notifications

```bash
# Get (requires advanced queries). Pass documentId or userId; notificationIds max 30.
POST https://api.velt.dev/v2/notifications/get
{ "data": { "organizationId": "org-123", "userId": "user-2", "pageSize": 20, "order": "desc" } }
# -> result.data[], result.pageToken

# Update: notifications[] items keyed by id; mark read with readByUserIds
POST https://api.velt.dev/v2/notifications/update
{ "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "notifications": [
      { "id": "task-assigned-42", "readByUserIds": ["user-2"], "persistReadForUsers": true }
    ]
} }

# Delete by organizationId plus any of documentId, locationId, userId, notificationIds
POST https://api.velt.dev/v2/notifications/delete
{ "data": { "organizationId": "org-123", "documentId": "doc-456", "notificationIds": ["task-assigned-42"] } }
```

- `update` and `delete` return `result.data[notificationId] = { success, message }`; check every entry.
- `get` filters results by comment visibility: a notification for a private comment is returned only to users who can see that comment.
- `delete` with only `organizationId` + `documentId` deletes every notification on that document. Narrow it with `notificationIds` when you mean specific ones.

### Notification preferences (per user)

```bash
# Set preferences for users; omit documentIds to set the organization-level default
POST https://api.velt.dev/v2/notifications/config/set
{ "data": {
    "organizationId": "org-123",
    "userIds": ["user-2"],
    "documentIds": ["doc-456"],
    "config": { "inbox": "ALL", "email": "MINE", "slack": "NONE" }
} }

# Get preferences for one user (documentIds max 30, or getOrganizationConfig: true)
POST https://api.velt.dev/v2/notifications/config/get
{ "data": { "organizationId": "org-123", "userId": "user-2", "getOrganizationConfig": true } }
```

Channel values are `ALL`, `MINE`, or `NONE`. These endpoints require the notifications feature enabled in the Velt Console. For frontend notification setup, see `velt-notifications-best-practices`.

**Verification Checklist:**
- [ ] Notification fields are top-level under `data`, with no `notification` wrapper
- [ ] `notifyAll: false` is set whenever only `notifyUsers` should receive it
- [ ] Template variables in `displayHeadlineMessageTemplate` match keys in `displayHeadlineMessageTemplateData`
- [ ] Resolver-mode writes set both `isNotificationResolverUsed: true` and `notificationSource: 'custom'` and omit the templates
- [ ] Updates send `notifications: [{ id, ... }]`; read state uses `readByUserIds`
- [ ] Preference endpoints are `/v2/notifications/config/set` and `/v2/notifications/config/get` with `ALL` / `MINE` / `NONE`
- [ ] Per-item `success: false` entries are handled on update and delete
- [ ] Both API-key-level headers are included

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/notifications/add-notifications - "Add Notifications"
- https://docs.velt.dev/api-reference/rest-apis/v2/notifications/get-notifications-v2 - "Get Notifications"
- https://docs.velt.dev/api-reference/rest-apis/v2/notifications/update-notifications - "Update Notifications"
- https://docs.velt.dev/api-reference/rest-apis/v2/notifications/delete-notifications - "Delete Notifications"
- https://docs.velt.dev/api-reference/rest-apis/v2/notifications/set-config - "Set Config"
- https://docs.velt.dev/api-reference/rest-apis/v2/notifications/get-config - "Get Config"
- https://docs.velt.dev/self-hosting/partial/notifications - "Notification Resolver"
