---
title: Write Activity Logs, CRDT Data, and Live State via REST API
impact: MEDIUM
impactDescription: Activity, CRDT, and live-state writes use array and editorId shapes; the wrong shape is rejected or lands on no editor
tags: rest, api, activities, featureType, crdt, editorId, yjs, livestate, broadcast
---

## Write Activity Logs, CRDT Data, and Live State via REST API

Activity writes take an `activities[]` array with a required `featureType`. CRDT writes target one editor with `editorId`, a `type`, and a `data` value of the matching shape. Live state broadcasts target a `liveStateDataId`. All endpoints are `POST` with the API-key-level headers.

**Incorrect (single `activity` object, `crdtDataType` / `key` / `value` instead of the documented fields):**

```json
{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "activity": { "activityType": "comment", "actionType": "added", "message": "Alice commented" }
  }
}
```

**Correct (activities array with `featureType`, `actionType`, `actionUser`):**

```bash
POST https://api.velt.dev/v2/activities/add

{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "activities": [
      {
        "id": "deploy-2026-10-06",
        "featureType": "custom",
        "actionType": "deploy.completed",
        "actionUser": { "userId": "user-1", "name": "Alice", "email": "alice@example.com" },
        "targetEntityId": "release-42",
        "displayMessageTemplate": "{{user}} deployed release 42",
        "displayMessageTemplateData": { "user": { "userId": "user-1", "name": "Alice" } }
      }
    ]
  }
}
```

### Activity logs

- Adding activity logs through REST requires `activityServiceConfig` enabled at the workspace level in the Velt Console (also settable with `/v2/workspace/activityconfig/update`).
- `featureType` is one of `comment`, `reaction`, `recorder`, `crdt`, `custom`. `targetEntityId` is required when `featureType` is `custom`.
- Pass your own `id` for idempotent writes; an existing activity with that `id` is overwritten.
- `changes` is a map of `field -> { from, to }`. Templates use `{{variable}}` syntax.
- `isActivityResolverUsed: true` marks a record whose PII lives on your infrastructure (self-hosted activity data).

```bash
# Get with filters: documentId, targetEntityId, featureTypes, actionTypes, userId, activityIds, order, pageSize, pageToken
POST https://api.velt.dev/v2/activities/get
{ "data": { "organizationId": "org-123", "documentId": "doc-456", "featureTypes": ["comment"], "order": "desc", "pageSize": 50 } }

# Update: activities[] items keyed by id
POST https://api.velt.dev/v2/activities/update
{ "data": { "organizationId": "org-123", "activities": [ { "id": "deploy-2026-10-06", "displayMessageTemplate": "{{user}} redeployed release 42" } ] } }

# Delete: at least one of documentId, targetEntityId, activityIds
POST https://api.velt.dev/v2/activities/delete
{ "data": { "organizationId": "org-123", "activityIds": ["deploy-2026-10-06"] } }
```

### CRDT data (Yjs editors)

```bash
# Create editor data (fails if data already exists for this editorId)
POST https://api.velt.dev/v2/crdt/add
{ "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "editorId": "my-rich-text-editor",
    "type": "xml",
    "data": "<paragraph>Hello World</paragraph>",
    "contentKey": "default"
} }

# Read one editor, or omit editorId for every editor on the document
POST https://api.velt.dev/v2/crdt/get
{ "data": { "organizationId": "org-123", "documentId": "doc-456", "editorId": "my-rich-text-editor" } }
# -> result.data[]: { data, id, lastUpdate, lastUpdatedBy, sessionId }

# Replace existing editor data (fails if no data exists for this editorId)
POST https://api.velt.dev/v2/crdt/update
{ "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "editorId": "my-flow-editor",
    "type": "map",
    "data": { "nodes": { "node-1": { "label": "Updated" } }, "edges": {} }
} }
```

- `type` is `text`, `map`, `array`, or `xml`, and `data` must match: a string for `text`/`xml`, an object for `map`, an array for `array`.
- `contentKey` defaults to `content`. Use `default` for TipTap.
- `update` writes proper CRDT operations on the existing state, so connected clients pick up the change.
- Use `add` for a new editor and `update` for an existing one; they are not interchangeable upserts.

### Live state broadcast

```bash
POST https://api.velt.dev/v2/livestate/broadcast
{ "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "liveStateDataId": "deploy-status",
    "data": { "status": "success", "build": 42 },
    "merge": true
} }
```

`merge: true` merges into the existing live state data; the default `false` replaces it. Clients read it with the Live State Sync APIs (see `velt-live-state-sync-best-practices`).

**Verification Checklist:**
- [ ] Activity writes send `activities[]` with `featureType`, `actionType`, and `actionUser`; `targetEntityId` is set for `custom`
- [ ] Activity service is enabled at the workspace level before adding activities via REST
- [ ] Activity deletes include at least one of `documentId`, `targetEntityId`, `activityIds`
- [ ] CRDT calls send `editorId`, `type`, and a `data` value matching `type`; TipTap uses `contentKey: "default"`
- [ ] New editors use `/v2/crdt/add`; existing editors use `/v2/crdt/update`
- [ ] Live state broadcasts send `liveStateDataId` and `data`, and set `merge` deliberately
- [ ] Both API-key-level headers are included

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/activities/add-activities - "Add Activities"
- https://docs.velt.dev/api-reference/rest-apis/v2/activities/get-activities - "Get Activities"
- https://docs.velt.dev/api-reference/rest-apis/v2/activities/update-activities - "Update Activities"
- https://docs.velt.dev/api-reference/rest-apis/v2/activities/delete-activities - "Delete Activities"
- https://docs.velt.dev/api-reference/rest-apis/v2/crdt/add-crdt-data - "Add CRDT Data"
- https://docs.velt.dev/api-reference/rest-apis/v2/crdt/get-crdt-data - "Get CRDT Data"
- https://docs.velt.dev/api-reference/rest-apis/v2/crdt/update-crdt-data - "Update CRDT Data"
- https://docs.velt.dev/api-reference/rest-apis/v2/livestate/broadcast-event - "Broadcast Event"
