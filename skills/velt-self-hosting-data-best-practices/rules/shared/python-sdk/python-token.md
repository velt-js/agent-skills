---
title: Generate Auth Tokens via sdk.api.accessControl.generateToken
impact: HIGH
impactDescription: The positional getToken helpers are gone from the Python SDK docs; minting tokens with generateToken keeps frontend auth working without exposing API credentials
tags: python, token, auth, generateToken, GenerateTokenRequest, accessControl, jwt, authentication, authProvider, permissions
---

## Generate Auth Tokens via sdk.api.accessControl.generateToken

Mint the JWT that the frontend `authProvider.generateToken` returns with `sdk.api.accessControl.generateToken`. It calls `POST /v2/auth/generate_token`, takes a `GenerateTokenRequest` dataclass like every other `sdk.api.*` method, needs only `apiKey` and `authToken` (no database), and returns the raw REST envelope. The `sdk.selfHosting.token.getToken` and `sdk.api.token.getToken` sections were removed from the Python SDK docs.

Do not call the Velt REST auth endpoint with `requests` / `httpx`, and never build the JWT yourself.

**Incorrect (removed keyword-argument getToken and a flat envelope):**

```python
# WRONG: no longer documented; also reads the self-hosting envelope shape
result = sdk.selfHosting.token.getToken(organizationId='org-123', userId='user-1')
token = result['data']['token']
```

**Correct:**

```python
from velt_py import VeltSDK
from velt_py.models.access_control import GenerateTokenRequest

sdk = VeltSDK.initialize({
    'apiKey': 'YOUR_VELT_API_KEY',
    'authToken': 'YOUR_VELT_AUTH_TOKEN',
})

result = sdk.api.accessControl.generateToken(
    GenerateTokenRequest(
        userId='user-1',
        userProperties={'name': 'John Doe', 'email': 'john@example.com', 'isAdmin': False},
        permissions={'resources': [
            {'type': 'organization', 'id': 'org-123', 'accessRole': 'viewer'},
            {'type': 'document', 'id': 'doc-1', 'organizationId': 'org-123', 'accessRole': 'editor'},
        ]},
    )
)

if 'error' in result:
    raise RuntimeError(result['error']['message'])
token = result['result']['data']['token']  # return this to the frontend authProvider
```

**Response shape:**

```python
{'result': {'status': 'success', 'message': 'Token generated successfully.',
            'data': {'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}}}
```

**Key points:**

- `userId`, `userProperties` (with `name` and `email`; optional `isAdmin`), and `permissions` are required.
- Each resource has `type`, `id`, optional `accessRole`, optional `expiresAt`, and `organizationId` (required for `document` and `folder` resources).
- Read the token from `result['result']['data']['token']`; check for an `error` key first.
- Return the token only to the authenticated user's session; never log it.

**Verification Checklist:**
- [ ] No `getToken` calls and no `sdk.selfHosting.token` / `sdk.api.token` references remain
- [ ] `GenerateTokenRequest` is imported from `velt_py.models.access_control`
- [ ] `userProperties` includes `name` and `email`; document and folder resources include `organizationId`
- [ ] The response is read as a dict with `error` checked before `result`

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/python#generatetoken - "Access Control > generateToken"
- https://docs.velt.dev/api-reference/sdk/models/data-models#generatetokenrequest - "GenerateTokenRequest"
- https://docs.velt.dev/api-reference/rest-apis/v2/auth/generate-token - "Generate Token"
