---
title: Broadcast live state from your backend with the REST API or backend SDKs
impact: MEDIUM
impactDescription: Server-driven updates reach every subscribed client; the body must be wrapped in a data object and scoped to the same organization, document, and liveStateDataId
tags: REST, broadcast, livestate, broadcastEvent, server-side, v2, merge, @veltdev/node, velt-py
---

## Broadcast live state from your backend with the REST API or backend SDKs

`POST https://api.velt.dev/v2/livestate/broadcast` is the server-side equivalent of `setLiveStateData`. Clients subscribed to the same `liveStateDataId` on that document receive the update. Send `x-velt-api-key` and `x-velt-auth-token` headers, and put the fields inside a top-level `data` object, as with other Velt REST APIs. A v1 endpoint (`/v1/livestate/broadcast`) with the same parameters also exists.

**Incorrect (fields at the top level, wrong scope):**

```json
{
  "organizationId": "org-123",
  "documentId": "some-other-doc",
  "liveStateDataId": "editor-theme",
  "data": { "mode": "dark" }
}
```

**Correct (REST):**

```bash
curl -X POST https://api.velt.dev/v2/livestate/broadcast \
  -H "Content-Type: application/json" \
  -H "x-velt-api-key: $VELT_API_KEY" \
  -H "x-velt-auth-token: $VELT_AUTH_TOKEN" \
  -d '{
    "data": {
      "organizationId": "org-123",
      "documentId": "whiteboard-42",
      "liveStateDataId": "editor-theme",
      "data": { "mode": "dark", "fontSize": 14 },
      "merge": true
    }
  }'
```

**Correct (Node backend SDK, `@veltdev/node`):**

```ts
import { VeltSDK } from '@veltdev/node';

const sdk = VeltSDK.initialize({ apiKey: process.env.VELT_API_KEY, authToken: process.env.VELT_AUTH_TOKEN });

await sdk.api.livestate.broadcastEvent({
  organizationId: 'org-123',
  documentId: 'whiteboard-42',
  liveStateDataId: 'editor-theme',
  data: { mode: 'dark', fontSize: 14 },
  merge: true,
});
```

**Correct (Python backend SDK, `velt-py`):**

```python
from velt_py.models.livestate import BroadcastEventRequest

result = sdk.api.livestate.broadcastEvent(
    BroadcastEventRequest(
        organizationId='org-123',
        documentId='whiteboard-42',
        liveStateDataId='editor-theme',
        data={'mode': 'dark', 'fontSize': 14},
        merge=True,
    )
)
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `organizationId` | `string` | Yes | Must match the client's organization |
| `documentId` | `string` | Yes | Must match the document clients have set |
| `liveStateDataId` | `string` | Yes | Same ID clients read |
| `data` | `object` | Yes | Any serializable JSON |
| `merge` | `boolean` | No | Merge with existing data instead of replacing (default `false`) |

**Verification Checklist:**
- [ ] The REST body wraps the fields in `data`
- [ ] `organizationId`, `documentId`, and `liveStateDataId` match what clients use
- [ ] Partial updates pass `merge: true`
- [ ] API key and auth token stay on the server

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/livestate/broadcast-event — "Broadcast Event"
- https://docs.velt.dev/backend-sdks/node — "Livestate" (`sdk.api.livestate.broadcastEvent`)
- https://docs.velt.dev/backend-sdks/python — "Livestate" (`BroadcastEventRequest`)
