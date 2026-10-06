---
title: Manage Per-User Notification Config via REST API
impact: MEDIUM-HIGH
impactDescription: Read and write per-user notification preferences at document or org level from your server
tags: settings, config, rest-api, getConfig, setConfig, getOrganizationConfig, documentIds, server-side
---

## Manage Per-User Notification Config via REST API

Use the Get Config and Set Config REST endpoints to read and write users' notification channel preferences from your server. Both support document-level config (scoped to specific documents) and org-level config (the user's default for all documents). Get Config takes a single `userId`; Set Config takes a `userIds` array. Both require the notification settings feature to be enabled in the [Velt Console](https://console.velt.dev/dashboard/config/notification). Available on v1 and v2 REST APIs.

**Incorrect (singular userId on Set Config, empty documentIds, missing auth token):**

```javascript
await fetch('https://api.velt.dev/v2/notifications/config/set', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-velt-api-key': 'YOUR_API_KEY' },
  body: JSON.stringify({
    data: {
      organizationId: 'your-org-id',
      userId: 'user-123',       // Set Config expects userIds: string[]
      documentIds: [],          // Omit documentIds for an org-level default
      config: { inbox: 'ALL', email: 'MINE' }
    }
  })
});
```

**Correct (use getOrganizationConfig flag and omit documentIds for org-level operations):**

```javascript
// GET CONFIG — Document-level
const docConfigResponse = await fetch('https://api.velt.dev/v2/notifications/config/get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': 'YOUR_API_KEY',
    'x-velt-auth-token': 'YOUR_AUTH_TOKEN'
  },
  body: JSON.stringify({
    data: {
      organizationId: 'your-org-id',
      userId: 'user-123',
      documentIds: ['doc-id-1', 'doc-id-2']
    }
  })
});

// GET CONFIG — Org-level (set getOrganizationConfig: true; documentIds not required)
const orgConfigResponse = await fetch('https://api.velt.dev/v2/notifications/config/get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': 'YOUR_API_KEY',
    'x-velt-auth-token': 'YOUR_AUTH_TOKEN'
  },
  body: JSON.stringify({
    data: {
      organizationId: 'your-org-id',
      userId: 'user-123',
      getOrganizationConfig: true
    }
  })
});

// SET CONFIG — Document-level
const setDocResponse = await fetch('https://api.velt.dev/v2/notifications/config/set', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': 'YOUR_API_KEY',
    'x-velt-auth-token': 'YOUR_AUTH_TOKEN'
  },
  body: JSON.stringify({
    data: {
      organizationId: 'your-org-id',
      userIds: ['user-123'],
      documentIds: ['doc-id-1'],
      config: { inbox: 'MINE', email: 'NONE' }
    }
  })
});

// SET CONFIG — Org-level default (omit documentIds entirely)
// When documentIds is omitted, config is stored as the user's default for all documents
const setOrgResponse = await fetch('https://api.velt.dev/v2/notifications/config/set', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': 'YOUR_API_KEY',
    'x-velt-auth-token': 'YOUR_AUTH_TOKEN'
  },
  body: JSON.stringify({
    data: {
      organizationId: 'your-org-id',
      userIds: ['user-123'],
      config: { inbox: 'ALL', email: 'MINE' }
    }
  })
});
```

**Parameter Reference:**

| Parameter | Type | Required | Endpoint | Description |
|-----------|------|----------|----------|-------------|
| `organizationId` | string | Yes | Both | Your organization ID. |
| `userId` | string | Yes (getConfig) | getConfig | The user whose config is read. |
| `userIds` | string[] | Yes (setConfig) | setConfig | The users whose config is set. |
| `documentIds` | string[] | No | Both | Document IDs to scope the operation (max 30 on getConfig). When omitted on `setConfig`, config is applied at org level. Not required on `getConfig` when `getOrganizationConfig` is true. |
| `getOrganizationConfig` | boolean | No | getConfig only | When true, fetches the org-level config for the user. `documentIds` is not required in this mode. |
| `config` | NotificationChannelConfig | Yes (setConfig) | setConfig | Channel preference map. Keys are channel IDs (`inbox`, `email`, etc.), values are `'ALL'` \| `'MINE'` \| `'NONE'`. |

**NotificationChannelConfig type:** `Record<string, 'ALL' | 'MINE' | 'NONE'>` — maps a channel ID to the user's preference for that channel.

**Endpoint URLs:**

```
POST https://api.velt.dev/v1/notifications/config/get
POST https://api.velt.dev/v2/notifications/config/get
POST https://api.velt.dev/v1/notifications/config/set
POST https://api.velt.dev/v2/notifications/config/set
```

**Verification:**
- [ ] `getOrganizationConfig: true` used (not `documentIds: []`) when fetching org-level config
- [ ] `documentIds` omitted (not set to `[]`) when applying org-level default via setConfig
- [ ] `config` object uses valid values: `'ALL'`, `'MINE'`, or `'NONE'` per channel
- [ ] Set Config sends `userIds` (array); Get Config sends `userId` (string)
- [ ] Auth headers (`x-velt-api-key` and `x-velt-auth-token`) included on all requests

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/notifications/get-config - "Get Config"
- https://docs.velt.dev/api-reference/rest-apis/v2/notifications/set-config - "Set Config"
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#enablesettingsatorganizationlevel - "enableSettingsAtOrganizationLevel"
