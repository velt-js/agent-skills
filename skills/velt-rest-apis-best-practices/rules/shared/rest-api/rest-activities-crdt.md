---
title: Activity Logs and CRDT Data Endpoints
impact: MEDIUM
impactDescription: Activity logs provide audit trails and CRDT endpoints enable server-side collaborative data management
tags: rest, api, activities, crdt, livestate
---

## Activity Logs and CRDT Data Endpoints

Manage activity logs for audit trails and CRDT data for real-time collaboration. All endpoints are POST with base URL `https://api.velt.dev/v2`.

**Required headers:**

```
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN
```

### Activity Log Endpoints

```bash
# Add an activity log entry
POST https://api.velt.dev/v2/activities/add
{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "activity": {
      "activityType": "comment",
      "actionType": "added",
      "actionUser": {
        "userId": "user-1",
        "name": "Alice",
        "email": "alice@example.com"
      },
      "message": "Alice added a comment on Q4 Report",
      "timestamp": 1700000000000
    }
  }
}

# Get activity logs
POST https://api.velt.dev/v2/activities/get
{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456"
  }
}

# Update an activity log
POST https://api.velt.dev/v2/activities/update
{
  "data": {
    "organizationId": "org-123",
    "activityId": "act-1",
    "activity": {
      "message": "Alice added a comment on Q4 Report (edited)"
    }
  }
}

# Delete activity logs
POST https://api.velt.dev/v2/activities/delete
{
  "data": {
    "organizationId": "org-123",
    "activityIds": ["act-1"]
  }
}
```

### CRDT Data Endpoints

CRDT (Conflict-free Replicated Data Types) endpoints let you read and write collaborative data from the server side. Supported CRDT types: `text`, `map`, `array`, `xml`.

```bash
# Add CRDT data
POST https://api.velt.dev/v2/crdt/add
{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "crdtDataType": "map",
    "key": "settings",
    "value": {
      "theme": "dark",
      "fontSize": 14
    }
  }
}

# Get CRDT data
POST https://api.velt.dev/v2/crdt/get
{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "crdtDataType": "map",
    "key": "settings"
  }
}

# Update CRDT data
POST https://api.velt.dev/v2/crdt/update
{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "crdtDataType": "map",
    "key": "settings",
    "value": {
      "theme": "light"
    }
  }
}
```

### Live State Broadcast

Push a one-time state update to all connected clients.

```bash
POST https://api.velt.dev/v2/livestate/broadcast
{
  "data": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "key": "deployStatus",
    "value": {
      "status": "success",
      "timestamp": 1700000000000
    }
  }
}
```

**Key points:**

- CRDT types: `text` for plain text, `map` for key-value objects, `array` for ordered lists, `xml` for rich text/XML fragments.
- CRDT data syncs automatically with connected frontend clients via Yjs.
- Live state broadcast is fire-and-forget — it does not persist data, only pushes to active clients.
- Activity timestamps use Unix milliseconds.
- Activity logs are append-only in typical usage; updates and deletes are for corrections.

**Verification:**
- [ ] `crdtDataType` is one of: `text`, `map`, `array`, `xml`
- [ ] `organizationId` and `documentId` are present in CRDT requests
- [ ] Activity `timestamp` is in Unix milliseconds
- [ ] Both required headers are included
- [ ] Live state broadcast is not used as a substitute for persistent CRDT storage

**Source Pointer:** `https://docs.velt.dev/api-reference/rest-api/activities` (## REST API > ### Activities & CRDT)
