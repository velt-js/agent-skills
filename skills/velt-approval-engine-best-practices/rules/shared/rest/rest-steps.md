---
title: Drive steps with recordReviewerDecision, cancel, and action-based resolve (recordAgentResolution is unavailable in beta)
impact: HIGH
impactDescription: recordReviewerDecision reports most problems as recorded false instead of an error, and resolve actions differ in allowed states, node types, and whether they feed loop predicates
tags: approval-engine, rest, steps, recordReviewerDecision, recorded, rejectionReason, unknown-responder, idempotent, already-terminal, aggregator-missing, aggregatorStatus, resumeScheduled, recordAgentResolution, responseId, cancel, resolve, actorId, force-approve, force-reject, force-complete, force-fail, reviewer-approve, reviewer-reject, step.overridden, overriddenAt
---

## Drive steps with recordReviewerDecision, cancel, and action-based resolve (recordAgentResolution is unavailable in beta)

Four `POST` endpoints under `/v2/workflow/steps/*`. `recordReviewerDecision` is the normal path for human steps. `cancel` and `resolve` are operator overrides that today gate only on the standard auth token (workspace-admin RBAC is post-GA), so restrict who can call them inside your own application.

**Incorrect:**

```javascript
const r = await workflowApi('steps/recordReviewerDecision', {
  executionId, stepId, reviewerId: 'someone-not-on-the-node', decision: 'APPROVED',
}, creds);
// assumes success because no error was thrown
```

`decision` must be `approve` or `reject`. An undeclared `reviewerId` does not throw: the result is `recorded: false` with `rejectionReason: "unknown-responder"`, and the step keeps waiting.

**Correct:**

```javascript
const r = await workflowApi('steps/recordReviewerDecision', {
  executionId, stepId, reviewerId: 'u_legal_01', decision: 'reject', reason: 'compliance issue on line 3',
}, creds);

if (!r.recorded && r.rejectionReason !== 'idempotent') {
  throw new Error(`Decision not applied: ${r.rejectionReason}`); // unknown-responder | already-terminal | aggregator-missing
}
```

**recordReviewerDecision** (`/steps/recordReviewerDecision`): `executionId`, `stepId` (a human step in `waiting`), `reviewerId` (must match a declared `userId`), `decision` (`approve` / `reject`), optional `reason` (up to 2000 chars).
- Response `{ recorded, aggregatorStatus, resumeScheduled, rejectionReason? }`. `aggregatorStatus` is `pending`, `resolved`, or `rejected` (`null` with `aggregator-missing`). `resumeScheduled: true` means this decision triggered the resume; wait for the webhook rather than polling.
- `recorded: false` reasons: `idempotent` (already recorded, safe to ignore), `already-terminal`, `unknown-responder`, `aggregator-missing`.
- Errors: `FAILED_PRECONDITION` (step not `waiting`, not a human node, or the legacy comment-resolution variant), `NOT_FOUND`, `INVALID_ARGUMENT`.
- This is the only path that sets `rejectedBy` / `rejectorMandatory`, which reject loop-backs need.

**recordAgentResolution** (`/steps/recordAgentResolution`): not usable in beta. It resolves blocking agent steps, but `blocking: true` agents are rejected at run time with `agent-blocking-not-supported`, so no step ever parks for it. Documented fields for reference: `executionId`, `stepId`, `responseId` (idempotent per `(stepId, responseId)`), `resolution` (`resolved` / `rejected`), `actorId`, optional `reason`. Use a downstream `human` node and `recordReviewerDecision` instead.

**cancel** (`/steps/cancel`): `executionId`, `stepId`, required `actorId` (1 to 256 chars, recorded on the `step.cancelled` event), optional `reason` (up to 500 chars). Returns `{ cancelled: true, executionId, stepId }`. No downstream edges fire from a cancelled step. Errors: `INVALID_ARGUMENT`, `FAILED_PRECONDITION` (already terminal), `NOT_FOUND`. To stop the whole run use `/executions/cancel`.

**resolve** (`/steps/resolve`): `executionId`, `stepId`, required `action`, required `actorId` (1 to 256), optional `output`, optional `reason` (up to 2000). Returns `{ resolved: true, executionId, stepId, action }`. Every resolve writes an internal `step.overridden` audit event.

| `action` | Allowed step states | Result | Notes |
|---|---|---|---|
| `force-approve` | `waiting`, any node type | `completed`, `decision: "approve"` | Also resolves waiting agent and async webhook steps. |
| `force-reject` | `waiting`, any node type | `completed`, `decision: "reject"` | Same scope as `force-approve`. |
| `force-complete` | `running` or `waiting` | `completed` | Your `output` is written through plus `overriddenAt`. |
| `force-fail` | `running` or `waiting` | `failed` | Fires edges that route on `failed` (for example `on: "always"`). |
| `reviewer-approve` | `waiting`, human only | `completed` | `actorId` must be a declared reviewer or `PERMISSION_DENIED`. Audit-distinct from `force-approve`. |
| `reviewer-reject` | `waiting`, human only | `completed` | Same gate; audit-distinct from `force-reject`. |

- For approve / reject actions the engine computes `decision`, `approved`, and `approvalReply` (and `overriddenAt`) itself; caller-supplied keys with those names are overwritten, other `output` keys pass through.
- `reviewer-reject` and `force-reject` do NOT set `output.rejectedBy` / `output.rejectorMandatory`, so the fixed loop predicate does not fire and a reject loop-back will not iterate.
- Errors: `INVALID_ARGUMENT`, `PERMISSION_DENIED` (reviewer actions), `FAILED_PRECONDITION` (terminal step, disallowed state, reviewer action on a non-human step, CAS conflict, and for `force-*` also a nonexistent step: `resolveStep not applied: step-not-found`), `NOT_FOUND` (reviewer actions only).

**Choosing the endpoint**

| Situation | Endpoint |
|---|---|
| Reviewer acts in your UI | `recordReviewerDecision` |
| Admin acts on a reviewer's behalf, visible as such in the audit log | `resolve` with `reviewer-approve` / `reviewer-reject` |
| Step is hung (agent, async webhook, or human) | `resolve` with a `force-*` action |
| Step with no approve / reject concept must finish | `resolve` with `force-complete` or `force-fail` |
| Stop one step, leave siblings running | `/steps/cancel` |
| Stop the whole run | `/executions/cancel` |

**Verification Checklist:**
- [ ] `decision` is lowercase `approve` or `reject`; `reviewerId` is declared on the node
- [ ] Every `recordReviewerDecision` response checks `recorded` and `rejectionReason`
- [ ] No production code depends on `recordAgentResolution`
- [ ] `/steps/cancel` and `/steps/resolve` always send `actorId`; access is restricted in your app
- [ ] `force-approve` / `force-reject` / reviewer actions only target `waiting` steps
- [ ] Loop-back workflows never rely on `/steps/resolve` reject actions
- [ ] `output` sent to resolve does not try to set `decision`, `approved`, or `approvalReply`
- [ ] Missing steps on `force-*` are detected via `FAILED_PRECONDITION`, not only `NOT_FOUND`

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/steps/record-reviewer-decision
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/steps/record-agent-resolution
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/steps/cancel-step
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/steps/resolve-step
- https://docs.velt.dev/ai/approval-engine/customize-behavior#cancelling-and-overriding — which endpoint to use
