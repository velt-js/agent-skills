---
title: Generate Auth Tokens via sdk.selfHosting.token.getToken
impact: HIGH
impactDescription: Issuing auth tokens server-side with the self-hosting variant ensures token generation works within your own infrastructure without a separate REST call
tags: python, token, auth, self-hosting, jwt, authentication
---

## Generate Auth Tokens via sdk.selfHosting.token.getToken

The Python SDK exposes `sdk.selfHosting.token.getToken` to generate a Velt auth token for a user on the server side. This is the self-hosting variant of token generation — use it when your backend already has MongoDB + AWS configured via `sdk.selfHosting.*`. The generated token is passed to the frontend `authProvider` prop so the client can authenticate without exposing your API credentials.

Do not call the Velt REST auth endpoint directly with `requests` or `httpx` and do not attempt to construct the JWT manually. Unlike other `sdk.selfHosting.*` methods, `getToken` does **not** accept a typed request dataclass — pass arguments as keyword arguments directly.

**Correct (generate token and return to frontend):**

```python
from velt_py import VeltSDK

sdk = VeltSDK.initialize({
    'apiKey': 'YOUR_VELT_API_KEY',
    'authToken': 'YOUR_VELT_AUTH_TOKEN',
    'database': {
        'mongoURI': 'YOUR_MONGO_URI',
        'dbName': 'YOUR_DB_NAME'
    }
})

result = sdk.selfHosting.token.getToken(
    organizationId='org-123',
    userId='user-1',
    email='user@example.com',   # optional
    isAdmin=False                # optional, defaults to False
)

if result['success']:
    token = result['data']['token']   # JWT string — pass to frontend authProvider
else:
    print(f"Token error {result.get('errorCode')}: {result.get('error')}")
```

**Response shape:**

```python
# Success
{'success': True, 'statusCode': 200, 'data': {'token': 'eyJhbGciOi...'}}

# Error
{'success': False, 'statusCode': 500, 'error': '...', 'errorCode': 'INTERNAL_ERROR'}
```

**Key points:**

- `organizationId` and `userId` are required; `email` and `isAdmin` are optional keyword arguments (defaults: `email=None`, `isAdmin=False`).
- Do NOT pass a dataclass to `getToken` — it uses positional/keyword arguments only.
- Access the token with `result['data']['token']` (dict key access, not attribute access).
- Always check `result['success']` before reading `result['data']`.
- The returned JWT is meant for the **frontend** `authProvider` prop on `VeltProvider` — never log or expose it to untrusted clients beyond the requesting user's session.

**Verification Checklist:**
- [ ] `organizationId` and `userId` are passed as keyword or positional arguments (not wrapped in a dataclass)
- [ ] Response is accessed as a dict: `result['success']`, `result['data']['token']`
- [ ] `result['success']` is checked before reading `result['data']`
- [ ] Token is forwarded to the frontend `authProvider` and not stored long-term server-side

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/python - Velt Python SDK > Self-hosting > Token > getToken
