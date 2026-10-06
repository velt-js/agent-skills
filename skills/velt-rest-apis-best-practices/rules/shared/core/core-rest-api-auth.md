---
title: Authenticate All Velt REST API Calls with Required Headers
impact: CRITICAL
impactDescription: Missing or mismatched authentication headers reject every API call
tags: rest, api, authentication, headers, curl, fetch, workspace, x-velt-api-key, x-velt-auth-token, x-velt-workspace-id
---

## Authenticate All Velt REST API Calls with Required Headers

Every Velt REST API v2 call needs a header pair, and the pair depends on the endpoint's scope: API-key-level or workspace-level. Sending the wrong pair is rejected even when both headers are present.

**API-key-level endpoints (most of the v2 surface: `/organizations/*`, `/users/*`, `/commentannotations/*`, `/notifications/*`, `/agents/*`, `/memory/*`, `/workspace/domains/*`, `/workspace/webhookconfig/*`, `/workspace/apikeyconfig/*`, `/workspace/advancedwebhook*`, and similar):**

- `x-velt-api-key`: your API key from the Velt Console
- `x-velt-auth-token`: an auth token for that API key, generated in the Velt Console or read with `POST https://api.velt.dev/v2/workspace/authtokens/get`

**Workspace-level endpoints (`/v2/workspace/get`, `/v2/workspace/apikey/create`, `/v2/workspace/apikey/update`, `/v2/workspace/apikeys/get`, `/v2/workspace/authtokens/get`, `/v2/workspace/authtoken/reset`):**

- `x-velt-workspace-id`: the workspace ID (`result.data.id` from `POST https://api.velt.dev/v2/workspace/create`)
- `x-velt-workspace-auth-token`: the workspace auth token (`result.data.authToken` from `POST https://api.velt.dev/v2/workspace/create`)

`/v2/workspace/create`, `/v2/workspace/email/status`, and `/v2/workspace/email/send-login-link` are public endpoints and take no auth headers.

**Base URL:** `https://api.velt.dev/v2`. **Every endpoint is `POST`**, including reads and deletes. Request bodies are wrapped in `{ "data": { ... } }`.

**Incorrect (api-key-level endpoint, missing auth token header):**

```bash
curl -X POST https://api.velt.dev/v2/organizations/get \
  -H 'Content-Type: application/json' \
  -H 'x-velt-api-key: your_api_key' \
  -d '{"data": {"organizationIds": ["org_123"]}}'
```

**Correct (api-key-level endpoint, both headers):**

```bash
curl -X POST https://api.velt.dev/v2/organizations/get \
  -H 'Content-Type: application/json' \
  -H 'x-velt-api-key: your_api_key' \
  -H 'x-velt-auth-token: your_auth_token' \
  -d '{"data": {"organizationIds": ["org_123"]}}'
```

**Incorrect (workspace-level endpoint called with the api-key-level pair):**

```bash
curl -X POST https://api.velt.dev/v2/workspace/apikeys/get \
  -H 'Content-Type: application/json' \
  -H 'x-velt-api-key: your_api_key' \
  -H 'x-velt-auth-token: your_auth_token' \
  -d '{"data": {}}'
```

**Correct (workspace-level endpoint with workspace ID and workspace auth token):**

```bash
curl -X POST https://api.velt.dev/v2/workspace/apikeys/get \
  -H 'Content-Type: application/json' \
  -H 'x-velt-workspace-id: workspace_abc123' \
  -H 'x-velt-workspace-auth-token: your_workspace_auth_token' \
  -d '{"data": {}}'
```

**Incorrect (GET method, no `data` wrapper):**

```javascript
const response = await fetch('https://api.velt.dev/v2/organizations/get', {
  method: 'GET',
  headers: {
    'x-velt-api-key': 'your_api_key',
    'x-velt-auth-token': 'your_auth_token'
  }
});
```

**Correct (server-side fetch with POST and the `data` wrapper):**

```javascript
const response = await fetch('https://api.velt.dev/v2/organizations/get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN
  },
  body: JSON.stringify({
    data: { organizationIds: ['org_123'] }
  })
});

const json = await response.json();
if (json.error) {
  // { error: { status: 'INVALID_ARGUMENT' | 'NOT_FOUND' | ..., message, details? } }
  throw new Error(`${json.error.status}: ${json.error.message}`);
}
const payload = json.result; // most endpoints: { status, message, data }
```

**Response envelope:**

- Success: `{ "result": { "status": "success", "message": "...", "data": ... } }` on most endpoints. Memory endpoints (`/v2/memory/*`) are the exception: their fields sit directly on `result` (for example `result.answer`, `result.results`), with no `data` key.
- Failure: `{ "error": { "status": "<CODE>", "message": "...", "details"?: ... } }`. Status codes are gRPC-style strings: `INVALID_ARGUMENT`, `NOT_FOUND`, `ALREADY_EXISTS`, `PERMISSION_DENIED`, `FAILED_PRECONDITION`, `RESOURCE_EXHAUSTED`, `INTERNAL`, and others. Branch on `error.status`, not only on the HTTP status.

**Key points:**

- The workspace auth token (`result.data.authToken` from `/v2/workspace/create`) is distinct from the per-API-key auth tokens returned by `/v2/workspace/authtokens/get`. They are not interchangeable.
- The API auth token is separate from the JWT tokens used to authenticate frontend users (see `core-jwt-tokens`).
- Never expose `x-velt-auth-token` or `x-velt-workspace-auth-token` in client-side code; call the REST API from your server only.
- Several read endpoints (`/v2/organizations/get`, `/v2/organizations/documents/get`, `/v2/organizations/folders/*`, `/v2/users/get`, `/v2/notifications/get`, `/v2/commentannotations/get`) require **advanced queries** to be enabled in the Velt Console and the v4+ SDK deployed.
- For Node.js backends, `@veltdev/node` exposes the same surface as typed `sdk.api.*` methods (see `velt-node-sdk-best-practices`).

**Verification Checklist:**
- [ ] Header pair matches the endpoint scope: api-key-level uses `x-velt-api-key` + `x-velt-auth-token`; workspace-level uses `x-velt-workspace-id` + `x-velt-workspace-auth-token`
- [ ] Workspace endpoint paths use slashes (`/v2/workspace/authtokens/get`, `/v2/workspace/apikey/create`), not hyphens
- [ ] Request method is POST and the base URL is `https://api.velt.dev/v2`
- [ ] Request body uses the `{ data: { ... } }` wrapper
- [ ] Error handling reads `error.status` and `error.message`; Memory responses are read from `result` directly
- [ ] Auth tokens are kept server-side only
- [ ] Advanced queries are enabled in the Console before calling the `get` endpoints that require them

**Source Pointers:**
- https://docs.velt.dev/security/auth-tokens - "Generating Auth Tokens"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/create - "Next Steps" (workspace-level vs. api-key-level header pairs)
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/authtokens-get - "Get Auth Tokens"
- https://docs.velt.dev/api-reference/rest-apis/v2/organizations/get-organizations-v2 - "Get Organizations" (advanced queries prerequisite)
- https://docs.velt.dev/ai/memory/overview - "Quickstart" (Memory response shape)
