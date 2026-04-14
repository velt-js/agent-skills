---
title: Authenticate All Velt REST API Calls with Required Headers
impact: CRITICAL
impactDescription: Missing authentication headers cause 401 errors on every API call
tags: rest, api, authentication, headers, curl, fetch
---

## Authenticate All Velt REST API Calls with Required Headers

Every Velt REST API v2 call requires two authentication headers. Without both, the request will be rejected.

**Required headers for ALL endpoints:**

- `x-velt-api-key` — Your API key from the Velt console
- `x-velt-auth-token` — Auth token from Velt console (Configuration > Auth Token)

**Base URL:** `https://api.velt.dev/v2`

**All endpoints use POST method** — even for read and delete operations. Do not use GET or DELETE.

**Incorrect (missing auth token header):**

```bash
curl -X POST https://api.velt.dev/v2/organizations/get \
  -H 'Content-Type: application/json' \
  -H 'x-velt-api-key: your_api_key' \
  -d '{"data": {"organizationId": "org_123"}}'
```

**Correct (curl with both headers):**

```bash
curl -X POST https://api.velt.dev/v2/organizations/get \
  -H 'Content-Type: application/json' \
  -H 'x-velt-api-key: your_api_key' \
  -H 'x-velt-auth-token: your_auth_token' \
  -d '{"data": {"organizationId": "org_123"}}'
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
- The auth token is separate from JWT tokens used for frontend user authentication.
- All endpoints accept POST regardless of whether the operation is a read, create, update, or delete.
- Request bodies use a `{ data: { ... } }` wrapper format.
- Never expose `x-velt-auth-token` in client-side code; make API calls from your server only.

**Verification:**
- [ ] Both `x-velt-api-key` and `x-velt-auth-token` headers are set
- [ ] Request method is POST
- [ ] Base URL is `https://api.velt.dev/v2`
- [ ] Auth token is kept server-side only, never sent to the browser
- [ ] Request body uses the `{ data: { ... } }` wrapper format

**Source Pointer:** `https://docs.velt.dev/api-reference/rest-apis/overview` (## REST API > ### Authentication)
