---
title: Authenticate All Velt REST API Calls with Required Headers
impact: CRITICAL
impactDescription: Missing authentication headers cause 401 errors on every API call
tags: rest, api, authentication, headers, curl, fetch
---

## Authenticate All Velt REST API Calls with Required Headers

Every Velt REST API v2 call requires two authentication headers. Without both, the request will be rejected. The header *pair* depends on the endpoint's scope — api-key-level vs. workspace-level. Sending the wrong pair fails with a 401, even if both headers are present.

**API-key-level endpoints (most of the v2 surface — `/organizations/*`, `/users/*`, `/comments/*`, `/notifications/*`, `/workspace/add-domain`, `/workspace/emailconfig-update`, etc.):**

- `x-velt-api-key` — Your API key from the Velt console
- `x-velt-auth-token` — Auth token from Velt console (Configuration > Auth Token), or retrieved via `POST https://api.velt.dev/v2/workspace/authtokens-get`

**Workspace-level endpoints (e.g., `/v2/workspace/get`, `/v2/workspace/apikey-create`):**

- `x-velt-workspace-id` — The workspace ID (`result.data.id` from `POST https://api.velt.dev/v2/workspace/create`)
- `x-velt-workspace-auth-token` — The workspace auth token (`result.data.authToken` from `POST https://api.velt.dev/v2/workspace/create`)

**Base URL:** `https://api.velt.dev/v2`

**All endpoints use POST method** — even for read and delete operations. Do not use GET or DELETE.

**Incorrect (api-key-level endpoint, missing auth token header):**

```bash
curl -X POST https://api.velt.dev/v2/organizations/get \
  -H 'Content-Type: application/json' \
  -H 'x-velt-api-key: your_api_key' \
  -d '{"data": {"organizationId": "org_123"}}'
```

**Correct (api-key-level endpoint, curl with both headers):**

```bash
curl -X POST https://api.velt.dev/v2/organizations/get \
  -H 'Content-Type: application/json' \
  -H 'x-velt-api-key: your_api_key' \
  -H 'x-velt-auth-token: your_auth_token' \
  -d '{"data": {"organizationId": "org_123"}}'
```

**Incorrect (workspace-level endpoint called with the api-key-level pair):**

```bash
curl -X POST https://api.velt.dev/v2/workspace/get \
  -H 'Content-Type: application/json' \
  -H 'x-velt-api-key: your_api_key' \
  -H 'x-velt-auth-token: your_auth_token' \
  -d '{"data": {}}'
```

**Correct (workspace-level endpoint with workspace-id + workspace-auth-token):**

```bash
curl -X POST https://api.velt.dev/v2/workspace/get \
  -H 'Content-Type: application/json' \
  -H 'x-velt-workspace-id: workspace_abc123' \
  -H 'x-velt-workspace-auth-token: your_workspace_auth_token' \
  -d '{"data": {}}'
```

**Incorrect (using GET method):**

```javascript
const response = await fetch('https://api.velt.dev/v2/organizations/get', {
  method: 'GET',
  headers: {
    'x-velt-api-key': 'your_api_key',
    'x-velt-auth-token': 'your_auth_token'
  }
});
```

**Correct (JavaScript fetch with POST):**

```javascript
const response = await fetch('https://api.velt.dev/v2/organizations/get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN
  },
  body: JSON.stringify({
    data: {
      organizationId: 'org_123'
    }
  })
});

const result = await response.json();
```

**Key points:**

- Both headers must be present on every request — omitting either causes a 401.
- Header pair depends on endpoint scope: api-key-level → `x-velt-api-key` + `x-velt-auth-token`; workspace-level → `x-velt-workspace-id` + `x-velt-workspace-auth-token`. The two pairs are not interchangeable.
- The workspace auth token (`result.data.authToken` from `/v2/workspace/create`) is distinct from the per-API-key auth token returned by `/v2/workspace/authtokens-get`. Don't swap them.
- The auth token is separate from JWT tokens used for frontend user authentication.
- All endpoints accept POST regardless of whether the operation is a read, create, update, or delete.
- Request bodies use a `{ data: { ... } }` wrapper format.
- Never expose any auth token (`x-velt-auth-token` or `x-velt-workspace-auth-token`) in client-side code; make API calls from your server only.

**Verification:**
- [ ] Correct header pair for the endpoint's scope: api-key-level uses `x-velt-api-key` + `x-velt-auth-token`; workspace-level uses `x-velt-workspace-id` + `x-velt-workspace-auth-token`
- [ ] Request method is POST
- [ ] Base URL is `https://api.velt.dev/v2`
- [ ] Auth token is kept server-side only, never sent to the browser
- [ ] Request body uses the `{ data: { ... } }` wrapper format

**Source Pointers:**
- `https://docs.velt.dev/api-reference/rest-apis/overview` (## REST API > ### Authentication)
- `https://docs.velt.dev/api-reference/rest-apis/v2/workspace/create` (## Next Steps — workspace-level vs. api-key-level header pairs)
