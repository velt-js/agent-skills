---
title: getToken is positional, token service is sync, errors are typed classes
impact: MEDIUM-HIGH
impactDescription: Wrong getToken shape returns undefined token; wrong envelope check silently misreads results; untyped catch loses structured error info
tags: getToken, sdk.api.token, sdk.selfHosting.token, positional-args, error-classes, VeltSDKError, VeltDatabaseError, VeltValidationError, VeltTokenError, VeltApiError, instanceof
---

## getToken is positional, token service is sync, errors are typed classes

Three cross-cutting traps that come up across both backends.

### 1. `getToken` is positional on BOTH backends

Signature: `getToken(organizationId: string, userId: string, email?: string, isAdmin?: boolean)`.

```ts
// REST backend
const r1 = await sdk.api.token.getToken('org-123', 'user-1', 'a@b.com', false);
const token1 = r1.result.data.token;  // REST envelope

// Self-hosting backend (note: token is a SYNC property, no loader)
const r2 = await sdk.selfHosting.token.getToken('org-123', 'user-1', 'a@b.com', false);
const token2 = (r2.data as { token: string }).token;  // flat envelope

// WRONG — request-object form
await sdk.api.token.getToken({ organizationId: 'org-123', userId: 'user-1' });  // wrong shape

// WRONG — invented loader
await sdk.selfHosting.getToken();  // no such method
```

### 2. `sdk.selfHosting.token` is a synchronous property

Every other `sdk.selfHosting.*` service uses `await sdk.selfHosting.getXxx()`. The token service breaks the pattern — it's a direct property. There is no `getToken` loader on `sdk.selfHosting`.

### 3. Typed error classes — discriminate with `instanceof`

Five exports form a hierarchy: `VeltSDKError` (base) → `VeltDatabaseError`, `VeltValidationError`, `VeltTokenError`, `VeltApiError`. Always check `instanceof` (not `err.name` or `err.message`), and order specific-to-general so the base class doesn't swallow subclasses:

```ts
import {
  VeltSDK, VeltDatabaseError, VeltValidationError,
  VeltTokenError, VeltApiError, VeltSDKError,
} from '@veltdev/node';

try {
  await sdk.api.organizations.getOrganizations({ organizationIds: ['org-123'] });
} catch (err) {
  if (err instanceof VeltValidationError) { /* fix the request */ }
  else if (err instanceof VeltDatabaseError) { /* retry with backoff */ }
  else if (err instanceof VeltApiError)      { /* REST call failed */ }
  else if (err instanceof VeltTokenError)    { /* token generation failed */ }
  else if (err instanceof VeltSDKError)      { /* catch-all for future subclass */ }
  else throw err;
}
```

For `sdk.selfHosting.*` you also need to check the envelope — failures can come back as `{ success: false, errorCode, error }` rather than throwing:

```ts
const r = await svc.saveComments({ /* ... */ });
if (!r.success) {
  switch (r.errorCode) {
    case 'INVALID_INPUT':  /* fix the request */ break;
    case 'NOT_FOUND':       /* surface 404 */ break;
    case 'INTERNAL_ERROR':  /* retry / log */ break;
  }
  return;
}
```

### Envelope cheat sheet

| Backend | Success | Failure |
|---|---|---|
| `sdk.api.*` | `{ result: { status: 'success', message, data, ... } }` | Throws `VeltApiError` (or `VeltValidationError`) |
| `sdk.selfHosting.*` | `{ success: true, statusCode: 200, data }` | Returns `{ success: false, statusCode, error, errorCode }` OR throws `VeltSDKError` subclass |

Symptom: `result.success is undefined` on a `sdk.api.*` call → you wrote the self-hosting check. `result.result.status is undefined` on a `sdk.selfHosting.*` call → you wrote the REST check.

**Verification:**
- [ ] No `getToken(...)` call passes a request object — always positional, max 4 args
- [ ] No `await sdk.selfHosting.getToken()` — use `sdk.selfHosting.token` directly
- [ ] `instanceof` chains go specific-to-general (subclasses first, `VeltSDKError` last)
- [ ] `sdk.selfHosting.*` callers check `result.success === false` before reading `result.data`

**Source Pointer:** `backend-sdks/node.mdx` (Self-Hosting Backend → Token; REST API Backend → Token; Error Handling)
