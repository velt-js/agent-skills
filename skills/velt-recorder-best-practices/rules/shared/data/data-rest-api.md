---
title: Retrieve Recordings via REST API Endpoint
impact: MEDIUM
impactDescription: Enables server-side retrieval of recording data without the client SDK
tags: REST API, recordings, v2, pagination, server-side, x-velt-api-key, x-velt-auth-token, recordingIds
---

## Retrieve Recordings via REST API Endpoint

Use `POST https://api.velt.dev/v2/recordings/get` to retrieve recorder annotations server-side without the client SDK. This is distinct from the client-side `fetchRecordings()` / `getRecordings()` methods (see `data-fetch-subscribe`). Like other v2 REST APIs, the parameters go inside a top-level `data` object, and the response is wrapped in `result`.

**Incorrect (GET method, unwrapped body, wrong pagination field):**

```typescript
const response = await fetch('https://api.velt.dev/v2/recordings/get', {
  method: 'GET',                                   // Must be POST
  body: JSON.stringify({ organizationId: 'org-123' }), // Must be wrapped in { data: { ... } }
});
const { nextPageToken } = await response.json();   // Not a field; use result.pageToken
```

**Correct (server-side POST with headers and `data` body):**

```typescript
const response = await fetch('https://api.velt.dev/v2/recordings/get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY!,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN!,
  },
  body: JSON.stringify({
    data: {
      organizationId: 'org-123',          // required
      documentId: 'doc-456',              // optional
      recordingIds: ['rec-1', 'rec-2'],   // optional
      pageSize: 10,                       // optional, minimum 1
      // pageToken: previousResult.pageToken,
    },
  }),
});

const { result } = await response.json();
for (const recording of result.data) {
  // recorder annotation: annotationId, recordingType, mode, recordedTime, displayName,
  // attachments[] (url, mimeType, name, type, size), latestVersion, metadata
  console.log(recording.annotationId, recording.attachments?.[0]?.url);
}
const nextPageToken = result.pageToken; // present when more results exist
```

**Request body (`data`):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `organizationId` | `string` | Yes | Organization ID |
| `documentId` | `string` | No | Filter to a specific document |
| `recordingIds` | `string[]` | No | Filter to specific recording IDs |
| `pageSize` | `number` | No | Results per page (minimum 1) |
| `pageToken` | `string` | No | Cursor from a previous response's `result.pageToken` |

Errors return `{ error: { status, message } }` (for example `INVALID_ARGUMENT`). The Node and Python backend SDKs wrap the same endpoint.

**Verification:**
- [ ] `POST` method with parameters inside `data`
- [ ] `organizationId` included
- [ ] `x-velt-api-key` and `x-velt-auth-token` read from server-side environment variables
- [ ] Results read from `result.data`; pagination continues with `result.pageToken`

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/recordings/get-recordings - "Get Recordings"
