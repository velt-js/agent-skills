---
title: Authenticate Resolver Endpoints Before Touching Your Database
impact: HIGH
impactDescription: Unauthenticated resolver routes let any caller read or overwrite self-hosted comments and user PII
tags: verifyToken, resolverAuth, resolver_auth, VerifyTokenResult, headers, credentials, endpoint, jwt, jwks, security, node, python
---

## Authenticate Resolver Endpoints Before Touching Your Database

Endpoint-based data providers (`getConfig` / `saveConfig` / `deleteConfig`) are plain HTTPS routes called from the browser. Send a credential from the frontend with `headers`, and verify it on the backend before any read or write. Both backend SDKs ship a fail-closed verifier, `sdk.selfHosting.verifyToken`, that is authentication only: it never authorizes, so you still check the tenant yourself.

**Incorrect (route trusts the request body):**

```js
app.post('/api/velt/comments/get', async (req, res) => {
  // Anyone who can reach this URL can read any organization's comments.
  const comments = await db.getComments(req.body);
  res.json({ data: comments, success: true, statusCode: 200 });
});
```

**Correct (frontend sends a fresh token; backend verifies, then authorizes):**

```jsx
// Frontend: async headers are resolved on every request, including retries
const commentDataProvider = {
  config: {
    getConfig: {
      url: 'https://api.example.com/api/velt/comments/get',
      headers: async () => ({ Authorization: `Bearer ${await getFreshToken()}` }),
    },
  },
};
```

```ts
// Node backend (@veltdev/node): configure resolverAuth once at initialize()
const sdk = VeltSDK.initialize({
  database: { connection_string: process.env.VELT_DB_URL! },
  resolverAuth: { jwt: { algorithms: ['RS256'], jwksUrl: 'https://idp.example.com/.well-known/jwks.json' } },
});

app.post('/api/velt/comments/get', async (req, res) => {
  const auth = await sdk.selfHosting.verifyToken({ headers: req.headers });
  if (!auth.verified) return res.status(401).json({ error: auth.error, code: auth.errorCode });
  if (auth.claims?.org !== req.body.organizationId) return res.status(403).end(); // your authorization
  const svc = await sdk.selfHosting.getComments();
  res.json(await svc.getComments(req.body));
});
```

```python
# Python backend (velt-py): 'resolver_auth' config block; pip install 'velt-py[auth]' for the JWT path
sdk = VeltSDK.initialize({
    'database': {'connection_string': os.environ['VELT_DB_URL']},
    'resolver_auth': {'jwt': {'jwks_url': 'https://idp.example.com/.well-known/jwks.json', 'algorithms': ['RS256']}},
})

result = sdk.selfHosting.verifyToken(headers=request.headers)  # or token='<raw_jwt>'
if not result.verified:
    return HttpResponse(status=401)  # result.errorCode says why
```

**Key details:**
- Neither verifier raises for a failed verification; branch on `verified` and read `errorCode` (`MISSING_TOKEN`, `EXPIRED`, `INVALID_SIGNATURE`, `CLAIM_MISMATCH`, `ALGORITHM_NOT_ALLOWED`, `KEY_RESOLUTION_FAILED`, `VERIFICATION_FAILED`, `NOT_CONFIGURED`, `DEPENDENCY_MISSING`).
- Without `resolverAuth` / `resolver_auth`, `verifyToken` returns `NOT_CONFIGURED`; it never passes silently.
- The JWT path needs `jose@^5` (Node) or `velt-py[auth]` (Python); a custom `verify` callback needs neither and takes priority over `jwt`.
- The algorithm allowlist is required; `alg=none` and mixed HS/RS allowlists are rejected; JWKS must be HTTPS.
- For cookie sessions instead of bearer tokens, set `credentials: 'include'` on the endpoint config and validate the session server-side.

**Verification:**
- [ ] Every resolver route verifies the forwarded credential and returns 401 on failure
- [ ] Authorization (tenant or user) is checked against the verified claims, not against the request body alone
- [ ] Short-lived tokens are sent with an async `headers` function, not a static object captured once
- [ ] The verifier's optional dependency is installed for the JWT path

**Source Pointers:**
- https://docs.velt.dev/self-hosting/partial/overview - "Async headers and credentials"
- https://docs.velt.dev/backend-sdks/node#verifytoken - "verifyToken"
- https://docs.velt.dev/backend-sdks/python#resolver-token-verification - "Resolver Token Verification"
