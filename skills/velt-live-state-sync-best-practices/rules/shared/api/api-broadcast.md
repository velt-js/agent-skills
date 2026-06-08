---
title: REST API — Broadcast Live State Data
impact: MEDIUM
tags: REST, broadcast, API, server-side, v1, v2
---

## REST API — Broadcast Live State Data

Use the broadcast endpoint to set live state from your backend (e.g., server-driven updates, cron jobs, admin actions). This is the server-side equivalent of `setLiveStateData`.

### Endpoint

```
POST https://api.velt.dev/v1/livestate/broadcast
```

(Also available at `v2`: `POST https://api.velt.dev/v2/livestate/broadcast`)

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `x-velt-api-key` | Yes | Your Velt API key |
| `x-velt-auth-token` | Yes | Your Velt auth token |

### Request Body

```json
{
  "organizationId": "your-org-id",
  "documentId": "doc-123",
  "liveStateDataId": "editor-theme",
  "data": { "mode": "dark", "fontSize": 14 },
  "merge": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `organizationId` | `string` | Yes | Organization scope |
| `documentId` | `string` | Yes | Document scope |
| `liveStateDataId` | `string` | Yes | Live state data identifier |
| `data` | `any` | Yes | Serializable JSON data to broadcast |
| `merge` | `boolean` | No | Merge with existing data (default: false) |

### Key Points

- This endpoint writes to the same data store as the client-side hooks — clients subscribed to the same `liveStateDataId` receive the update in real time
- Use `merge: true` to update specific keys without overwriting the entire object
- The `organizationId` and `documentId` must match what the client-side `VeltProvider` and document setup use
- Both v1 and v2 endpoints accept the same parameters
