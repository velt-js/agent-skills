---
title: Executions endpoints — dispatch (idempotencyKey, webhookUrl), get, list, cancel, getEvents
impact: HIGH
impactDescription: Missing idempotencyKey on dispatch creates duplicate executions on retry; missing sinceSeq recovery after a webhook outage leaves your state permanently behind
tags: approval-engine, rest, executions, dispatch, idempotencyKey, webhookUrl, webhookSecret, get, list, cancel, getEvents, sinceSeq, deduplicated
---

## Executions endpoints — dispatch, get, list, cancel, getEvents

An **execution** is a single run of a definition. Five POST endpoints under `/v2/workflow/executions/*`. The two operations that have non-obvious failure modes are **dispatch** (always supply `idempotencyKey`) and **getEvents** (use `sinceSeq` to recover missed webhooks).

**Dispatch — always supply `idempotencyKey`:**

```bash
POST https://api.velt.dev/v2/workflow/executions/dispatch
```

```json
{
  "data": {
    "definitionId": "marketing-copy-approval",
    "idempotencyKey": "campaign-42-dispatch",
    "correlationId": "corr_campaign_42",
    "triggerContext": { "assetId": "asset_8f3" },
    "webhookUrl": "https://hooks.acme.com/velt/approvals",
    "webhookSecret": "whsec_9a8fS2l..."
  }
}

// Response
// { "result": { "executionId": "exec_1777...", "correlationId": "...", "deduplicated": false } }
```

**Idempotency rules:**
- Replaying with the same `idempotencyKey` (including in concurrent races) returns the original `executionId` rather than spawning a duplicate.
- `deduplicated: true` means the key was already used — treat it as success, do **not** re-dispatch.
- Omitting `idempotencyKey` is technically allowed but unsafe: any retry on a 5xx or network error risks duplicate workflows. Always set it to something derived from your trigger (campaign ID, asset ID + version, etc.).

**Webhook config rules:**
- `webhookUrl` and `webhookSecret` are paired — provide both or neither. Just `webhookUrl` is rejected.
- The URL must be `https://`. Private, loopback, or link-local IPs are rejected at delivery time (not at dispatch time).
- The secret is used by Velt to sign each delivery; your receiver verifies with HMAC-SHA256 (see `webhooks-delivery`).

**Get:**

```bash
POST https://api.velt.dev/v2/workflow/executions/get
{ "data": { "executionId": "exec_1777..." } }
// Response: { "result": ExecutionView }   // includes steps[]
```

**List — cursor pagination:**

```bash
POST https://api.velt.dev/v2/workflow/executions/list
{ "data": { "definitionId": "marketing-copy-approval", "status": "running", "pageSize": 50 } }
// Response: { "result": { "items": ExecutionView[], "nextCursor": "...", "hasMore": true } }
```

**v1 filter limitation:** `/executions/list` does NOT accept `organizationId` or `documentId` as filter parameters. To fetch executions scoped to an organization or document, filter client-side after paginating all results by `definitionId`. Cross-scope filtering is not supported in the current release.

**Cancel:**

```bash
POST https://api.velt.dev/v2/workflow/executions/cancel
{ "data": { "executionId": "exec_1777...", "reason": "campaign paused" } }
```

Rejected with `FAILED_PRECONDITION` if the execution is already terminal (`completed`, `failed`, `cancelled`). Idempotent for already-cancelled executions in the same sense — re-cancelling a terminal one is rejected, not silently no-op'd.

**Get events — recover missed webhooks with `sinceSeq`:**

```bash
POST https://api.velt.dev/v2/workflow/executions/getEvents
{ "data": { "executionId": "exec_1777...", "sinceSeq": 5 } }
// Response: { "result": { "events": ApprovalEventView[] } }
```

Returns all externally-visible events with `seq > sinceSeq`, in order. The recovery pattern:

1. Your webhook receiver durably stores the last `seq` it processed per execution.
2. After an outage, call `/executions/getEvents` with that `seq` to fetch the gap.
3. Re-apply the events idempotently using `(executionId, seq)` as the dedup key.

**`seq` values can be non-contiguous** — internal-only events (`step.scheduled`, `step.started`, `step.retried`, `step.resumed`, `step.response-recorded`, `step.overridden`, `parallel-group.completed`, `idempotency.suppressed`) fill gaps but are never delivered externally. Do not treat a missing seq as a problem; treat the externally-visible events as the source of truth.

**Externally-visible event types returned by `getEvents`:** the complete catalog of types that appear in the stream matches the webhook event catalog (see `webhooks-delivery`), including the loop events `loop.iteration-started` and `loop.exhausted`. Any type not in that catalog is an internal-only event and is filtered out of this endpoint's response. Use the `webhooks-delivery` rule as the authoritative enumeration — `getEvents` and the webhook stream emit the same externally-visible event set.

**Verification Checklist:**
- [ ] Every `/executions/dispatch` call includes an `idempotencyKey` derived from a stable upstream identifier
- [ ] `deduplicated: true` responses are treated as success (NOT retried)
- [ ] `webhookUrl` and `webhookSecret` are provided together; URL is `https://`, not a private host
- [ ] `/executions/cancel` callers handle `FAILED_PRECONDITION` for already-terminal executions
- [ ] Webhook receivers store the last processed `seq` per execution and use `/executions/getEvents?sinceSeq=N` after outages
- [ ] Receivers do NOT treat non-contiguous `seq` values as an error — internal events fill the gaps

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/executions/dispatch-execution
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/executions/get-execution
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/executions/list-executions
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/executions/cancel-execution
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/executions/get-execution-events
