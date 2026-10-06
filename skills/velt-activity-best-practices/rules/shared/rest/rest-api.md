---
title: Use REST APIs for Server-Side Activity Log Management
impact: LOW-MEDIUM
impactDescription: Programmatic server-side access to activity records for backend integrations
tags: rest-api, server, get, add, update, delete, activities, backend
---

## Use REST APIs for Server-Side Activity Log Management

Four REST API endpoints allow managing activity logs from your backend: Get, Add, Update, and Delete. These require your API key and are independent of the client-side SDK.

**Incorrect (using client SDK for server-side operations):**

```js
// Server-side code should NOT use the client SDK
// The client SDK requires browser context and user authentication
import { Velt } from '@veltdev/client';
// This won't work in a Node.js backend
```

**Correct (Get activities via REST API):**

```js
// GET activities with filters
const response = await fetch('https://api.velt.dev/v2/activities/get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': authToken,
  },
  body: JSON.stringify({
    data: {
      organizationId: 'org-123',
      documentId: 'doc-456',           // Optional: filter by document
      featureTypes: ['comment'],        // Optional: filter by feature
      pageSize: 50,                     // Optional: pagination
      order: 'desc',                    // Optional: 'asc' or 'desc'
    }
  }),
});

const { result } = await response.json();
const activities = result.data;      // ActivityRecord[]
const nextPage = result.pageToken;   // pass back as pageToken
```

**Correct (Add custom activities via REST API):**

Adding activities requires `activityServiceConfig` to be enabled for the workspace (Velt Console or the Update Activity Config workspace API).

```js
// Add activities from backend (e.g., CI/CD pipeline, cron jobs)
const response = await fetch('https://api.velt.dev/v2/activities/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': authToken,
  },
  body: JSON.stringify({
    data: {
      organizationId: 'org-123',
      documentId: 'doc-456',
      activities: [{
        id: 'build-789-unique',       // optional: an existing record with this ID is overwritten
        featureType: 'custom',         // one of: comment | reaction | recorder | crdt | custom
        actionType: 'custom',
        actionUser: { userId: 'system', name: 'CI Bot' },
        targetEntityId: 'build-789',   // required for 'custom'; optional for built-in types
        displayMessageTemplate: '{{actionUser.name}} completed build {{buildId}}',
        displayMessageTemplateData: { buildId: '#789' },
      }]
    }
  }),
});
```

**Correct (Update activities via REST API):**

```js
await fetch('https://api.velt.dev/v2/activities/update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': authToken,
  },
  body: JSON.stringify({
    data: {
      organizationId: 'org-123',
      activities: [{
        id: 'activity-1',                 // required
        displayMessageTemplate: '{{actionUser.name}} completed build {{buildId}}',
        displayMessageTemplateData: { buildId: '#790' },
      }],
    }
  }),
});
```

**Correct (Delete activities via REST API):**

```js
// Delete by activity IDs
const response = await fetch('https://api.velt.dev/v2/activities/delete', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': authToken,
  },
  body: JSON.stringify({
    data: {
      organizationId: 'org-123',
      activityIds: ['activity-1', 'activity-2'],
    }
  }),
});
```

**REST API endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v2/activities/get` | POST | Retrieve activities with filters and pagination |
| `/v2/activities/add` | POST | Create new activity records server-side |
| `/v2/activities/update` | POST | Update existing records (fails if immutable) |
| `/v2/activities/delete` | POST | Delete records by document, entity, or IDs (fails if immutable) |

**Key details:**
- All endpoints use POST method with JSON body
- Require `x-velt-api-key` and `x-velt-auth-token` headers
- Delete accepts `documentId`, `targetEntityId`, or `activityIds` (at least one required)
- Update and Delete fail for immutable records (see `config-immutability` rule)
- Get filters: `documentId`, `targetEntityId`, `featureTypes`, `actionTypes`, `userId`, `activityIds`; pagination via `pageSize` (default 1000), `pageToken`, and `order` (default `desc`)
- Add requires `organizationId`, `documentId`, and per activity `featureType`, `actionType`, `actionUser`
- Update accepts `changes`, `entityData`, `entityTargetData`, `displayMessageTemplate`, `displayMessageTemplateData`, `actionIcon` per activity `id`
- Set `isActivityResolverUsed: true` on Add when you self-host activity PII with an activity data provider
- `featureType` is validated against `'comment' | 'reaction' | 'recorder' | 'crdt' | 'custom'` — invalid values are rejected by the API
- `targetEntityId` is required in activity objects only when `featureType` is `'custom'`; it is optional for built-in featureTypes
- `id` (optional): provide a stable ID to control the record ID; if a record with that ID already exists it is overwritten

**Verification:**
- [ ] API key stored securely (environment variable, not client-side)
- [ ] Auth token generated server-side
- [ ] Correct endpoint URL and headers
- [ ] Immutability considered before update/delete operations
- [ ] Workspace `activityServiceConfig` enabled before calling Add
- [ ] Response read from `result.data` / `result.pageToken`

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/activities/get-activities - "Get Activity Logs"
- https://docs.velt.dev/api-reference/rest-apis/v2/activities/add-activities - "Add Activity Logs"
- https://docs.velt.dev/api-reference/rest-apis/v2/activities/update-activities - "Update Activity Logs"
- https://docs.velt.dev/api-reference/rest-apis/v2/activities/delete-activities - "Delete Activity Logs"
