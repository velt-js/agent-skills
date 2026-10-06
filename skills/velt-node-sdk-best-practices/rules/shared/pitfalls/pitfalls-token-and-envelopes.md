---
title: Generate tokens with accessControl.generateToken, check the right envelope, and catch typed errors
impact: MEDIUM-HIGH
impactDescription: Calling the removed getToken is a runtime "is not a function"; wrong envelope checks silently misread results; untyped catches lose structured error info
tags: generateToken, sdk.api.accessControl, GenerateTokenRequest, getToken, sdk.api.token, sdk.selfHosting.token, error-classes, VeltSDKError, VeltDatabaseError, VeltValidationError, VeltTokenError, VeltApiError, instanceof, envelopes
---

## Generate tokens with accessControl.generateToken, check the right envelope, and catch typed errors

Three cross-cutting traps that come up across both backends.

### 1. Mint frontend tokens with `sdk.api.accessControl.generateToken`

The Node SDK docs no longer document `sdk.api.token.getToken` or `sdk.selfHosting.token.getToken`. Token generation is `sdk.api.accessControl.generateToken`, which calls `POST /v2/auth/generate_token`. It takes a request object like every other `sdk.api.*` method, works on a REST-only SDK (no `database` block), and returns the REST envelope.

**Incorrect (positional getToken from older docs):**

```ts
// WRONG: removed from the docs; positional args; flat { success, data } envelope.
const r = await sdk.api.token.getToken('org-123', 'user-1', 'a@b.com', false);
const r2 = await sdk.selfHosting.token.getToken('org-123', 'user-1');
```

**Correct:**

```ts
const r = await sdk.api.accessControl.generateToken({
  userId: 'user-1',
  userProperties: { name: 'John Doe', email: 'john@example.com', isAdmin: false },
  permissions: {
    resources: [
      { type: 'organization', id: 'org-123', accessRole: 'viewer' },
      { type: 'document', id: 'doc-1', organizationId: 'org-123', accessRole: 'editor' },
    ],
  },
});
const token = r.result.data.token; // { result: { status, message, data: { token } } }
```

Return the token to the frontend auth provider (`authProvider.generateToken`). Never ship `apiKey` / `authToken` to the browser.

### 2. Typed error classes: discriminate with `instanceof`

Five exports form a hierarchy: `VeltSDKError` (base) with subclasses `VeltDatabaseError` (database connection or query failures, including calling `sdk.selfHosting.*` without a `database` block), `VeltValidationError`, `VeltTokenError`, and `VeltApiError` (REST call failures). Check `instanceof`, not `err.name` or `err.message`, and order specific-to-general:

```ts
import {
  VeltDatabaseError, VeltValidationError, VeltTokenError, VeltApiError, VeltSDKError,
} from '@veltdev/node';

try {
  await sdk.api.organizations.getOrganizations({ organizationIds: ['org-123'] });
} catch (err) {
  if (err instanceof VeltValidationError) { /* fix the request */ }
  else if (err instanceof VeltDatabaseError) { /* database down or not configured */ }
  else if (err instanceof VeltApiError) { /* REST call failed */ }
  else if (err instanceof VeltTokenError) { /* token generation failed */ }
  else if (err instanceof VeltSDKError) { /* catch-all for other SDK errors */ }
  else throw err;
}
```

### 3. `sdk.selfHosting.*` failures can come back as values

Self-hosting methods also return failures in the envelope instead of throwing. Check `success` before reading `data`:

```ts
const svc = await sdk.selfHosting.getComments();
const r = await svc.getComments({ organizationId: '', documentIds: ['doc-1'] });
if (!r.success) {
  switch (r.errorCode) {
    case 'INVALID_INPUT': /* e.g. empty organizationId returns 400 on 2.x */ break;
    case 'NOT_FOUND': /* surface 404 */ break;
    case 'INTERNAL_ERROR': /* retry or log */ break;
  }
}
```

### Envelope cheat sheet

| Backend | Success | Failure |
|---|---|---|
| `sdk.api.*` | `{ result: { status: 'success', message, data, ... } }` | Throws `VeltApiError` (or another `VeltSDKError` subclass) |
| `sdk.selfHosting.*` | `{ success: true, statusCode: 200, data }` | Returns `{ success: false, statusCode, error, errorCode }` or throws a `VeltSDKError` subclass |

Symptom: `result.success is undefined` on an `sdk.api.*` call means you wrote the self-hosting check. `result.result is undefined` on an `sdk.selfHosting.*` call means you wrote the REST check.

**Verification:**
- [ ] No `getToken(...)` calls and no `sdk.api.token` / `sdk.selfHosting.token` references remain
- [ ] Tokens come from `sdk.api.accessControl.generateToken({ userId, userProperties, permissions })` and are read from `result.result.data.token`
- [ ] `instanceof` chains go specific-to-general, with `VeltSDKError` last
- [ ] `sdk.selfHosting.*` callers check `result.success` before reading `result.data`

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/node#generatetoken - "Access Control > generateToken"
- https://docs.velt.dev/backend-sdks/node#error-handling - "Error Handling"
- https://docs.velt.dev/api-reference/rest-apis/v2/auth/generate-token - "Generate Token"
