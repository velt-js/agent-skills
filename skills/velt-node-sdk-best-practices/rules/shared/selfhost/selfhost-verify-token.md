---
title: Authenticate resolver requests with sdk.selfHosting.verifyToken
impact: HIGH
impactDescription: Resolver endpoints that skip verification accept any caller; treating verifyToken as authorization leaks data across tenants
tags: verifyToken, resolverAuth, ResolverAuthConfig, VerifyTokenResult, jose, jwt, jwks, fail-closed, resolver endpoints, RESOLVER_AUTH_ERROR_CODES, ResolverAuthService
---

## Authenticate resolver requests with sdk.selfHosting.verifyToken

Endpoint-based data providers (`getConfig` / `saveConfig` / `deleteConfig`) call your backend from the browser. `sdk.selfHosting.verifyToken` verifies the credential the Velt frontend forwards on those calls. It never opens or queries the database, never throws for a verification outcome (every failure returns `{ verified: false }`), and is authentication only: it returns claims verbatim and makes no authorization decision.

**Incorrect (trusting the request body, or wrapping verifyToken in try/catch as if it throws):**

```ts
app.post('/api/velt/comments/save', async (req, res) => {
  // WRONG: no credential check; anyone can write to any organization.
  const svc = await sdk.selfHosting.getComments();
  res.json(await svc.saveComments(req.body));
});

app.post('/api/velt/comments/get', async (req, res) => {
  try {
    await sdk.selfHosting.verifyToken({ headers: req.headers }); // WRONG: result ignored
  } catch {
    return res.status(401).end(); // never reached: verifyToken does not throw on failure
  }
  // ...
});
```

**Correct (configure resolverAuth once, branch on result.verified, then authorize yourself):**

```ts
const sdk = VeltSDK.initialize({
  database: { connection_string: process.env.VELT_DB_URL! },
  apiKey: process.env.VELT_API_KEY!,
  authToken: process.env.VELT_AUTH_TOKEN!,
  resolverAuth: {
    jwt: {
      algorithms: ['RS256'],   // required allowlist
      jwksUrl: 'https://your-idp.example.com/.well-known/jwks.json', // or publicKey (PEM) or secret (HS*)
      issuer: 'https://your-idp.example.com/',
      audience: 'your-api-audience',
      leeway: 5,
      require: ['exp'],
    },
    // or: verify: async (token, headers) => claims  (custom callback; takes priority over jwt)
    header: 'Authorization',   // default
    scheme: 'Bearer',          // default
  },
});

app.post('/api/velt/comments/save', async (req, res) => {
  const auth = await sdk.selfHosting.verifyToken({ headers: req.headers });
  if (!auth.verified) {
    return res.status(401).json({ error: auth.error, code: auth.errorCode });
  }
  // Authorization is your job: compare claims with the payload's organization.
  if (auth.claims?.org !== req.body.metadata?.organizationId) {
    return res.status(403).end();
  }
  const svc = await sdk.selfHosting.getComments();
  res.json(await svc.saveComments(req.body));
});
```

Per-call options override `resolverAuth` (the `jwt` block is deep-merged): `verifyToken({ token: rawToken })` or `verifyToken({ headers, jwt: { leeway: 30 } })`.

**Key details:**
- `npm install jose@^5` for the built-in JWT/JWKS path (pinned to v5 for Node 18). Without it, the JWT path returns `errorCode: 'DEPENDENCY_MISSING'`; the custom `verify` callback needs no dependency.
- Error codes (`RESOLVER_AUTH_ERROR_CODES`): `NOT_CONFIGURED`, `MISSING_TOKEN`, `EXPIRED`, `INVALID_SIGNATURE`, `CLAIM_MISMATCH`, `ALGORITHM_NOT_ALLOWED`, `KEY_RESOLUTION_FAILED`, `DEPENDENCY_MISSING`, `VERIFICATION_FAILED`.
- `alg=none` is always rejected; mixed symmetric and asymmetric allowlists are refused; a PEM in `jwt.secret` is refused; JWKS is fetched over HTTPS only and cached per URL for 5 minutes.
- `result.error` is generic and never contains the token or secret, so it is safe to return to the client.
- On the frontend, send the credential with the endpoint config's `headers` (static object or an async function resolved per request).

**Verification:**
- [ ] Every resolver route calls `verifyToken` and returns 401 when `result.verified` is false
- [ ] No try/catch is used as the failure signal; the code branches on `result.verified`
- [ ] `jwt.algorithms` is set explicitly; `jose@^5` is installed for the JWT path
- [ ] Tenant or user authorization is checked against `result.claims` after verification

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/node#verifytoken - "verifyToken" (Configuration, Usage, Error codes, Security guarantees)
- https://docs.velt.dev/self-hosting/partial/overview#async-headers-and-credentials - "Async headers and credentials"
