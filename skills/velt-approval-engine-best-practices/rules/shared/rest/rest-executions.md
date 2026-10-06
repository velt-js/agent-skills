---
title: Dispatch executions with idempotencyKey and use get, list, cancel, and getEvents with sinceSeq correctly
impact: HIGH
impactDescription: Missing idempotencyKey on dispatch duplicates runs on retry; list items carry no steps and cancel is a no-op on terminal runs, so code written for the old shapes misreads both
tags: approval-engine, rest, executions, dispatch, idempotencyKey, correlationId, triggerContext, organizationId, documentId, folderId, webhookUrl, webhookSecret, get, list, cursor, cancel, getEvents, sinceSeq, pageSize, deduplicated, tombstoned
---

## Dispatch executions with idempotencyKey and use get, list, cancel, and getEvents with sinceSeq correctly

An execution is one run of a definition. Five `POST` endpoints under `/v2/workflow/executions/*`. Always dispatch with an `idempotencyKey`, and use `getEvents` with `sinceSeq` to catch up after missed webhooks.

**Incorrect:**

```json
{
  "data": {
    "definitionId": "marketing-copy-approval",
    "triggerContext": { "assetId": "asset_8f3" },
    "webhookUrl": "https://hooks.acme.com/velt/approvals"
  }
}
```

No `idempotencyKey` (a network retry starts a second run), and `webhookUrl` without `webhookSecret` is rejected with `webhookUrl and webhookSecret must be provided together`.

**Correct:**

```json
{
  "data": {
    "definitionId": "marketing-copy-approval",
    "idempotencyKey": "campaign-42-dispatch",
    "correlationId": "corr_campaign_42",
    "triggerContext": { "assetId": "asset_8f3", "documentUrl": "https://app.acme.com/assets/8f3" },
    "organizationId": "org_acme",
    "webhookUrl": "https://hooks.acme.com/velt/approvals",
    "webhookSecret": "whsec_9a8fS2l0b3x7k1qz"
  }
}
// { "result": { "executionId": "exec_1777374504255_xzy43k9q", "correlationId": "corr_campaign_42", "deduplicated": false } }
```

**Dispatch** (`/executions/dispatch`):

| Field | Notes |
|---|---|
| `definitionId` | Required. Must be `active`. |
| `idempotencyKey` | `^[A-Za-z0-9:_\-.]{1,200}$`. Replays (including concurrent races) return the original `executionId` with `deduplicated: true`; treat that as success. |
| `correlationId` | Same pattern. Server-generated if omitted. |
| `triggerContext` | Free-form; read as `execution.input.*` in predicates, by agent `urlPath`, and by notification templates as `execution.triggerContext`. |
| `organizationId` / `documentId` | Used by agent nodes when they call the agent. Not validated against `scope` and never returned by a read (write-only). |
| `folderId` | Optional folder association. |
| `webhookUrl` + `webhookSecret` | Paired. `https` only, secret 16 to 512 chars. Validated at the schema boundary and re-checked at delivery (DNS re-resolved, no redirects). Overrides the definition's `webhookConfig` for this run. |

Errors: `NOT_FOUND` (no such definition), `FAILED_PRECONDITION` (definition tombstoned, or it has no root nodes), `INVALID_ARGUMENT` (schema, including an unpaired webhook field). A soft-deleted definition returns `FAILED_PRECONDITION`, not `NOT_FOUND`.

**Get** (`/executions/get`): `{ executionId }` returns `ExecutionView` with every step's view model (`steps[]`). Use it to find waiting steps and to read `steps[].error`.

**List (`/executions/list`):**

```json
{ "data": { "definitionId": "marketing-copy-approval", "status": "running", "pageSize": 50, "cursor": "1777374504364" } }
// { "result": { "items": [ /* ExecutionView, each with steps: [] */ ], "nextCursor": "1777374504364" } }
```

Filters: `definitionId`, `status` (`pending` / `running` / `completed` / `failed` / `cancelled`). `pageSize` 1 to 500 (default 50). `cursor` is the previous `nextCursor` string, passed back unchanged; `nextCursor` is `null` when the page is not full. No `organizationId` / `documentId` filters. List items return `steps: []`; call `/executions/get` for step detail.

**Cancel** (`/executions/cancel`): `{ executionId, reason? }` (`reason` up to 500 chars, surfaced on `execution.cancelled`). Returns `{ cancelled: true, executionId }`. Cancelling a run that is already terminal is a no-op. Successors of cancelled steps are never scheduled. Errors: `NOT_FOUND`, `INVALID_ARGUMENT`.

**Get events (`/executions/getEvents`):**

```json
{ "data": { "executionId": "exec_1777374504255_xzy43k9q", "sinceSeq": 5, "pageSize": 100 } }
// { "result": { "executionId": "...", "events": [ApprovalEventView], "nextCursor": 12, "hasMore": false } }
```

Returns external events with `seq > sinceSeq` (default 0), `pageSize` 1 to 500 (default 100). Page while `hasMore` is true. Only the 12 external event types are returned (see `webhooks-delivery`); internal events consume `seq` numbers, so gaps are normal. The run is done when you see `execution.completed`, `execution.failed`, or `execution.cancelled`.

**Recovery pattern:** store the highest processed `seq` per execution; after an outage call `getEvents` with it and feed the events through the same idempotent handler as your webhook receiver, keyed on `(executionId, seq)`.

**Verification Checklist:**
- [ ] Every dispatch sends an `idempotencyKey` derived from a stable upstream id; `deduplicated: true` is success
- [ ] `webhookUrl` and `webhookSecret` (16+ chars) are sent together, or neither
- [ ] Dispatch passes `organizationId` / `documentId` when agent nodes need them, and nothing reads them back
- [ ] `FAILED_PRECONDITION` on dispatch is handled as "definition tombstoned or has no roots"
- [ ] List callers read `result.items`, pass `nextCursor` back as a string, stop at `null`, and call get for steps
- [ ] Cancel callers do not expect an error for already-terminal runs
- [ ] Event catch-up pages with `pageSize` / `hasMore` and tolerates `seq` gaps

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/executions/dispatch-execution
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/executions/get-execution
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/executions/list-executions
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/executions/cancel-execution
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/executions/get-execution-events
- https://docs.velt.dev/ai/approval-engine/setup#step-2-dispatch-an-execution — dispatch walkthrough
