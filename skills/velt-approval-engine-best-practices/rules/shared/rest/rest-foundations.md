---
title: Use the shared auth headers, data envelope, error codes, and linter-failure parsing on every Approval Engine endpoint
impact: HIGH
impactDescription: Every endpoint shares the same headers, envelope, and error vocabulary; linter codes arrive inside error.message (not error.details), so code that reads details sees nothing
tags: approval-engine, rest, auth, headers, envelope, error-codes, PERMISSION_DENIED, NOT_FOUND, INVALID_ARGUMENT, FAILED_PRECONDITION, ALREADY_EXISTS, RESOURCE_EXHAUSTED, DEADLINE_EXCEEDED, schema-validation, linter, zod, rate-limiting
---

## Use the shared auth headers, data envelope, error codes, and linter-failure parsing on every Approval Engine endpoint

All 14 enveloped endpoints under `https://api.velt.dev/v2/workflow/` (5 definitions, 5 executions, 4 steps) are `POST`, share the same headers and `data` / `result` / `error` envelope, and use one error vocabulary. The inbound trigger endpoint (`/v2/workflow/webhook-inbound/trigger`) is the one exception: it takes raw JSON (see `webhooks-inbound-handler`).

**Incorrect:**

```javascript
const res = await fetch('https://api.velt.dev/v2/workflow/definitions/create', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ apiKey, authToken, definitionId: 'doc-signoff', nodes, edges }),
});
const json = await res.json();
if (json.error) console.log(json.error.details.code); // linter codes are not in details
```

Credentials belong in headers, fields belong inside `data`, and linter codes are embedded in `error.message`.

**Correct:**

```javascript
async function workflowApi(path, data, { apiKey, authToken }) {
  const res = await fetch(`https://api.velt.dev/v2/workflow/${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-velt-api-key': apiKey,
      'x-velt-auth-token': authToken,
    },
    body: JSON.stringify({ data }),
  });
  const json = await res.json();
  if (json.error) {
    const err = new Error(json.error.message);
    err.status = json.error.status;               // 'INVALID_ARGUMENT', ...
    err.issues = json.error.details?.issues;      // schema failures only (Zod { code, path, message })
    const prefix = 'Definition linter failed:';
    if (json.error.message.startsWith(prefix)) {
      err.linter = JSON.parse(json.error.message.slice(prefix.length)); // [{ code: 'missing-breach-edge', ... }]
    }
    throw err;
  }
  return json.result;
}
```

**Headers (every request):** `x-velt-api-key` (workspace API key), `x-velt-auth-token` (a registered auth token), `content-type: application/json`. Never put `apiKey` / `authToken` in the body.

**Envelope:**

```json
// request
{ "data": { "definitionId": "doc-signoff" } }
// success
{ "result": { "definitionId": "doc-signoff", "version": 1 } }
// error
{ "error": { "message": "...", "status": "INVALID_ARGUMENT", "details": {} } }
```

**Reading validation failures on create / update**
- **Linter failures:** `error.message` is `Definition linter failed:` followed by a JSON array; each entry carries a `code` (such as `missing-breach-edge`). `error.details` is not set. Match on `code`, not on surrounding text.
- **Rule-based schema failures:** the message names the rule, for example `every human node must have at least one outgoing edge with on="reject" (a forward reject route or a reject back-edge): manager-approval` or `agent node requires either a static "url" or a "urlPath"`.
- **Plain schema failures:** `error.details.issues` is an array of Zod `{ code, path, message }`; a missing field returns the bare Zod message such as `Required`.
- `APPROVAL_*` names in the docs are internal rule identifiers and never appear in a response.

**Canonical error codes**

| Code | Meaning |
|---|---|
| `INVALID_ARGUMENT` | Schema, edge-contract, or linter failure, or a missing `x-velt-auth-token` (flat message `Auth token is required`). |
| `PERMISSION_DENIED` | The auth token is not one of the workspace's registered tokens, or a `reviewer-*` resolve action's `actorId` is not on the step's reviewer list. |
| `NOT_FOUND` | Unknown `executionId`, `definitionId`, or `stepId`. |
| `ALREADY_EXISTS` | An active definition already uses that `definitionId`. |
| `FAILED_PRECONDITION` | State violation: `ifVersion` mismatch, step not in an allowed state, deleting a definition with in-flight runs, dispatching a tombstoned definition. |
| `RESOURCE_EXHAUSTED` | Rate limited (per API key, with extra per-endpoint tiers). Back off exponentially. |
| `DEADLINE_EXCEEDED` | Internal timeout. Retry with an idempotency key. |

**Schema validation messages (literal `message` strings):**

```text
webhookUrl and webhookSecret must be provided together
webhookUrl must use https scheme
webhookUrl host resolves to a private, loopback, or link-local address
at least one of reviewerIds or reviewers must be provided
cannot set both reviewerIds and reviewers, use one
reviewer userIds must be unique
reviewers must include at least one mandatory reviewer
notification node with channel="email" requires a non-empty recipients array
notification node with channel="slack" requires a slackTarget (channel id or incoming-webhook URL)
webhook node with authMode="token" requires authTokenHeader to be set
inboundWebhook provider="github"/"vercel"/"custom" requires authMode="hmac"
inboundWebhook with provider="custom" and authMode="hmac" requires signatureHeader and signatureAlgorithm
schedule.cron must be a valid 5-field cron expression
schedule.timezone must be a valid IANA timezone name (e.g. America/Los_Angeles)
```

**Verification Checklist:**
- [ ] All three headers on every request; no credentials in the body
- [ ] Request fields wrapped in `data`; responses read from `result` only when `error` is absent
- [ ] Linter codes parsed from `error.message` after `Definition linter failed:`; schema issues read from `error.details.issues`
- [ ] Code never matches on `APPROVAL_*` identifiers in responses
- [ ] `RESOURCE_EXHAUSTED` and `DEADLINE_EXCEEDED` retried with backoff (dispatch with the same `idempotencyKey`); other codes surfaced, not retried
- [ ] `PERMISSION_DENIED` treated as an unregistered auth token (or reviewer mismatch on resolve), not as missing admin scope

**Source Pointers:**
- https://docs.velt.dev/ai/approval-engine/setup#before-you-start — headers and envelope
- https://docs.velt.dev/ai/approval-engine/setup#common-errors — error codes and linter message format
- https://docs.velt.dev/ai/approval-engine/customize-behavior#errors — canonical codes and schema validation messages
- https://docs.velt.dev/ai/approval-engine/customize-behavior#rate-limiting — rate limits
