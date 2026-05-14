---
title: Approval Engine REST foundations — auth headers, envelope, canonical error codes, and schema-validation messages
impact: HIGH
impactDescription: Every endpoint shares the same auth header convention, request/response envelope, and error code set; getting these wrong looks endpoint-specific but isn't
tags: approval-engine, rest, auth, headers, envelope, error-codes, UNAUTHENTICATED, PERMISSION_DENIED, NOT_FOUND, INVALID_ARGUMENT, FAILED_PRECONDITION, ALREADY_EXISTS, RESOURCE_EXHAUSTED, DEADLINE_EXCEEDED, schema-validation
---

## Approval Engine REST foundations — auth, envelope, errors

All 14 Approval Engine endpoints share the same auth model, request/response envelope, and error vocabulary. Everything here applies to every other `rest-*` rule in this skill.

**Base URL:**

```
POST https://api.velt.dev/v2/workflow/*
```

Every endpoint is `POST` (yes, even reads like `definitions/get`). The HTTP method is constant; the path identifies the operation. `/v1/...` and `/v2/...` are active aliases for the same controllers — new integrations should use V2.

**Auth headers (every request):**

```
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN
content-type: application/json
```

Do **not** duplicate `apiKey` or `authToken` in the request body — auth is read from headers only. Putting credentials in the body is a confused-with-other-vendors mistake; the body's `data` field is reserved for resource fields.

**Request / response envelope:**

```json
// Request — endpoint-specific fields go inside data
{ "data": { /* endpoint-specific fields */ } }

// Success — endpoint-specific payload inside result
{ "result": { /* ... */ } }

// Error — never both result and error
{ "error": { "message": "...", "status": "INVALID_ARGUMENT", "details": {} } }
```

The `data` / `result` / `error` envelope is universal. When debugging "my request was rejected," parse `error.status` first — it identifies the failure class deterministically.

### Canonical error codes

**Error code reference:**

```
INVALID_ARGUMENT       Schema or linter failure. Missing field, wrong type, value out of
                       range, linter rule violation (see rest-definitions for 16 codes).
UNAUTHENTICATED        Missing or invalid x-velt-auth-token.
PERMISSION_DENIED      Auth token valid but lacks the required scope.
                       e.g. non-admin attempting /steps/cancel or /steps/resolve.
NOT_FOUND              Unknown executionId, definitionId, or stepId.
ALREADY_EXISTS         Creating a definition with a definitionId already in use.
FAILED_PRECONDITION    Optimistic-lock or state-machine violation.
                       ifVersion mismatch on update; cancelling a terminal execution/step;
                       deleting a definition with in-flight executions.
RESOURCE_EXHAUSTED     Rate limit exceeded. Per-IP or per-API-key quota.
                       Retry with exponential backoff + idempotencyKey.
DEADLINE_EXCEEDED      Internal timeout. Retry with idempotencyKey for safety.
```

`INVALID_ARGUMENT` from a definitions endpoint frequently carries a linter code in `error.details` — see `rest-definitions` for the full 16-rule reference.

### Schema-level validation messages

These are `INVALID_ARGUMENT` errors with specific human-readable `message` strings. Stable; safe to string-match for end-user-friendly tooling.

**Schema validation messages:**

```
"webhookUrl and webhookSecret must be provided together"
    → Dispatch supplied one but not the other.

"webhookUrl must use https scheme"
    → Non-HTTPS scheme on dispatch's webhookUrl.

"webhookUrl host resolves to a private, loopback, or link-local address"
    → Literal private IP, localhost, metadata.google.internal, *.internal.

"at least one of reviewerIds or reviewers must be provided"
    → Human node with no reviewers configured.

"cannot set both reviewerIds and reviewers — use one"
    → Both legacy and new forms populated; pick reviewers[].

"reviewer userIds must be unique"
    → Duplicate userId in reviewers[].

"reviewers must include at least one mandatory reviewer
    (allMandatoryApproved would otherwise never resolve)"
    → Every reviewer.mandatory === false.

"resolutionPolicy required when blocking === true"
    → Blocking agent node missing resolutionPolicy.

"minCount required when kind === \"minResolved\""
    → resolutionPolicy.kind === "minResolved" with no minCount.
```

**Correct (Node.js — minimal call wrapper that handles the envelope and surfaces codes):**

```javascript
async function workflowApi(path, dataPayload, { apiKey, authToken }) {
  const res = await fetch(`https://api.velt.dev/v2/workflow/${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-velt-api-key': apiKey,
      'x-velt-auth-token': authToken,
      // do NOT duplicate the credentials in the body
    },
    body: JSON.stringify({ data: dataPayload }),
  });
  const json = await res.json();
  if (json.error) {
    const e = new Error(json.error.message);
    e.status = json.error.status;        // 'INVALID_ARGUMENT' etc.
    e.details = json.error.details;
    throw e;
  }
  return json.result;
}
```

**Verification Checklist:**
- [ ] All three headers (`x-velt-api-key`, `x-velt-auth-token`, `content-type: application/json`) on every request
- [ ] Request body always wraps fields in `data: { ... }` — never bare fields at the top level
- [ ] Response handling distinguishes `result` (success) and `error` (failure); never reads `result` when `error` is present
- [ ] `error.status` is inspected as a string code (not HTTP status alone); codes drive retry vs. surface-to-user
- [ ] `DEADLINE_EXCEEDED` and `RESOURCE_EXHAUSTED` are retried (with `idempotencyKey` on dispatch); `INVALID_ARGUMENT`/`UNAUTHENTICATED`/`PERMISSION_DENIED`/`NOT_FOUND`/`ALREADY_EXISTS`/`FAILED_PRECONDITION` are terminal

**Source Pointers:**
- https://docs.velt.dev/ai/approval-engine/setup — auth headers and envelope
- https://docs.velt.dev/ai/approval-engine/customize-behavior — canonical error codes + schema-validation messages
