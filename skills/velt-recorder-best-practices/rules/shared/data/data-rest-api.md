---
title: Retrieve Recordings via REST API Endpoint
impact: MEDIUM
impactDescription: Enables server-side retrieval of recording data without the client SDK
tags: REST API, recordings, GET, v2, pagination, server-side, x-velt-api-key, x-velt-auth-token
---

## Retrieve Recordings via REST API Endpoint

Use the `POST https://api.velt.dev/v2/recordings/get` REST endpoint to retrieve recordings server-side without the client SDK. This is distinct from the client-side `fetchRecordings()` / `getRecordings()` methods (see `data-fetch-subscribe` rule). The endpoint supports pagination and filtering by document or specific recording IDs.

**Incorrect (using GET method — endpoint uses POST):**

```typescript
// Wrong HTTP method — this endpoint requires POST
const response = await fetch('https://api.velt.dev/v2/recordings/get', {
  method: 'GET',
});
```

**Correct (server-side fetch with required headers and body):**

```typescript
// Server-side REST call to retrieve recordings
// Authentication: x-velt-api-key + x-velt-auth-token headers
const response = await fetch('https://api.velt.dev/v2/recordings/get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY!,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN!,
  },
  body: JSON.stringify({
    organizationId: 'YOUR_ORG_ID',   // required
    documentId: 'YOUR_DOC_ID',       // optional
    recordingIds: ['RECORDER_ID_1'], // optional — filter by specific recording IDs
    pageSize: 20,                    // optional
    pageToken: undefined,            // optional — pass nextPageToken from previous response
  }),
});

const data = await response.json();
// data.nextPageToken present when more results are available
```

<!-- TODO (v5.0.2-beta.11): Verify exact response shape for POST /v2/recordings/get. Release note confirms the endpoint path and pagination support but does not specify the response schema (field names, nesting, error format). Validate against official Velt REST API documentation before relying on field names. -->

<!-- TODO (v5.0.2-beta.11): Verify authentication mechanism. x-velt-api-key and x-velt-auth-token headers follow the pattern used by other Velt v2 REST endpoints, but this should be confirmed against the recordings endpoint documentation specifically. -->

<!-- TODO (v5.0.2-beta.11): Verify whether recordingIds is the correct filter parameter name. The release note names it but does not confirm the exact JSON body field name for filtering. -->

**Request body parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `organizationId` | `string` | Yes | Organization scope for the recordings query |
| `documentId` | `string` | No | Filter recordings to a specific document |
| `recordingIds` | `string[]` | No | Filter to specific recording IDs |
| `pageSize` | `number` | No | Number of results per page |
| `pageToken` | `string` | No | Pagination cursor from a previous response |

**Verification:**
- [ ] Using `POST` method (not `GET`) for this endpoint
- [ ] `organizationId` included in the request body
- [ ] `x-velt-api-key` and `x-velt-auth-token` headers set from server-side environment variables (never exposed to the client)
- [ ] `pageToken` threaded through for paginated result sets

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-api/recordings/get - GET /v2/recordings/get REST endpoint
