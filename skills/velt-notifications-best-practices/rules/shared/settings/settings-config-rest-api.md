---
title: Manage Per-User Notification Config via REST API
impact: MEDIUM-HIGH
impactDescription: Read and write per-user notification preferences at document or org level from your server
tags: settings, config, rest-api, getConfig, setConfig, getOrganizationConfig, documentIds, server-side
---

## Manage Per-User Notification Config via REST API

Use the `getConfig` and `setConfig` REST endpoints to read and write a user's notification channel preferences from your server. Both endpoints support document-level config (scoped to specific documents) and org-level config (applied as the user's default for all documents). Available on v1 and v2 REST APIs.

**Incorrect (assuming documentIds is always required):**

```javascript
// setConfig without documentIds fails to apply org-level default
await fetch('https://api.velt.dev/v2/notifications/config/set', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-velt-api-key': 'YOUR_API_KEY' },
  body: JSON.stringify({
    data: {
      organizationId: 'your-org-id',
      userId: 'user-123',
      documentIds: [],          // Empty array is not the same as omitting
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
      userId: 'user-123',
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
      userId: 'user-123',
      config: { inbox: 'ALL', email: 'MINE' }
    }
  })
});
```

**Parameter Reference:**

| Parameter | Type | Required | Endpoint | Description |
|-----------|------|----------|----------|-------------|
| `organizationId` | string | Yes | Both | Your organization ID. |
| `userId` | string | Yes | Both | The user whose config is being read or set. |
| `documentIds` | string[] | No | Both | Document IDs to scope the operation. When omitted on `setConfig`, config is applied at org level. Not required on `getConfig` when `getOrganizationConfig` is true. |
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
- [ ] Auth headers (`x-velt-api-key` and `x-velt-auth-token`) included on all requests

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior - Notification settings and config
- https://docs.velt.dev/api-reference/rest-api/notifications - Notifications REST API reference
