---
title: Steps endpoints — recordReviewerDecision, recordAgentResolution, cancel (admin), resolve (admin)
impact: HIGH
impactDescription: Steps endpoints drive forward progress on parked human/blocking-agent steps; admin-only endpoints (cancel/resolve) require admin-scoped auth tokens or they 403; the resolve action discriminator determines both permissions and loop-predicate behavior
tags: approval-engine, rest, steps, recordReviewerDecision, recordAgentResolution, cancel, resolve, admin, PERMISSION_DENIED, decision, approve, reject, aggregatorStatus, resumeScheduled, actorId, reason, override, force-approve, force-reject, force-complete, force-fail, reviewer-approve, reviewer-reject, unknown-responder
---

## Steps endpoints — recordReviewerDecision, recordAgentResolution, cancel, resolve

Four POST endpoints under `/v2/workflow/steps/*`. Two are for normal forward progress on parked steps; two are admin-only overrides.

**recordReviewerDecision — a human reviewer approves or rejects:**

```bash
POST https://api.velt.dev/v2/workflow/steps/recordReviewerDecision
```

```json
{
  "data": {
    "executionId": "exec_1777...",
    "stepId": "step_agent-draft_...__to__human-legal",
    "reviewerId": "u_legal_01",
    "decision": "approve",
    "reason": "looks good"
  }
}

// Response
// { "result": { "recorded": true, "aggregatorStatus": "resolved", "resumeScheduled": true } }
```

`decision` is `"approve"` or `"reject"` (strings, lowercase). `reviewerId` does NOT need to match a configured `reviewers[].userId` — if the caller is not in the declared reviewer list, the engine records them as an unknown responder and updates `aggregatorStatus` to reflect whether quorum shifted. No error is thrown. This means unknown-reviewer submissions are silently accepted and may affect aggregation; do NOT rely on `INVALID_ARGUMENT` to enforce reviewer identity.

`aggregatorStatus` tells you whether the step is now fully resolved (all required reviewers have responded) or still waiting on others. `resumeScheduled: true` means the runtime has queued the downstream fan-out — don't poll or wait, the webhook will fire.

**recordAgentResolution — external resolution for a blocking agent step:**

```bash
POST https://api.velt.dev/v2/workflow/steps/recordAgentResolution
```

```json
{
  "data": {
    "executionId": "exec_1777...",
    "stepId": "step_blocking-agent_...",
    "resolutionId": "res-001",
    "output": { "decision": "approve", "score": 0.95 }
  }
}
```

Use this when a `blocking: true` agent step's resolution comes from outside the agent (a separate review process, a manual queue, an out-of-band system). The `resolutionId` should be stable and idempotent — calling twice with the same `resolutionId` is safe.

For quorum-counting, the `output.decision` field is what matters — see `concepts-workflow-model`.

**cancel (admin scope required):**

```bash
POST https://api.velt.dev/v2/workflow/steps/cancel
```

```json
{
  "data": {
    "executionId": "exec_1777...",
    "stepId": "step_...",
    "reason": "escalated",
    "actorId": "admin_jane"
  }
}
// Response: { "result": { "cancelled": true, "stepId": "step_...", "executionId": "exec_1777..." } }
```

Cancels a single step (not the whole execution). Requires an admin-scoped auth token. `actorId` is REQUIRED (1–256 chars) and identifies the administrator initiating the cancellation — it is surfaced on the `step.cancelled` event's `data` payload. `reason` (optional, ≤ 500 chars) is surfaced on the same event.

**Error matrix for `/steps/cancel`:** `INVALID_ARGUMENT` (missing required field or constraint violation) / `FAILED_PRECONDITION` (step already terminal) / `NOT_FOUND` (execution or step does not exist). Note: `PERMISSION_DENIED` is NOT in the error matrix — token-scope enforcement is handled upstream.

**Post-GA note:** Workspace-admin RBAC will gate cancel access by workspace role; admin token scope is the control surface in the current release.

**resolve — action-discriminated step resolution:**

```bash
POST https://api.velt.dev/v2/workflow/steps/resolve
```

The `action` field (REQUIRED) is the central discriminator. It determines both the resolution semantics and the auth requirements:

| `action` value | Semantics | Auth requirement |
|---|---|---|
| `force-approve` | Admin sets step to approved-complete; skips aggregator | Admin-scoped token |
| `force-reject` | Admin sets step to rejected-complete; skips aggregator | Admin-scoped token |
| `force-complete` | Admin marks step complete without approve/reject framing | Admin-scoped token |
| `force-fail` | Admin marks step as failed | Admin-scoped token |
| `reviewer-approve` | Reviewer-scoped approve; routes through aggregator | `actorId` must be in `step.reviewerIds` |
| `reviewer-reject` | Reviewer-scoped reject; routes through aggregator | `actorId` must be in `step.reviewerIds` |

```json
{
  "data": {
    "executionId": "exec_1777...",
    "stepId": "step_...",
    "action": "force-approve",
    "output": { "note": "approved by admin in emergency" },
    "reason": "Reviewer on PTO; emergency override",
    "actorId": "admin_jane"
  }
}
// Response: { "result": { "resolved": true, "executionId": "exec_1777...", "stepId": "step_...", "action": "force-approve" } }
```

`actorId` is REQUIRED (1–256 chars). `reason` is optional, ≤ 2000 chars.

**Reviewer-scoped auth:** `reviewer-approve` and `reviewer-reject` require `actorId` to be a member of `step.reviewerIds`. If it is not, the engine returns `PERMISSION_DENIED`.

**Authority-of-record:** The engine computes the canonical `decision`, `approved`, and `approvalReply` fields from the action. Any keys with those names in the caller-supplied `output` object are ignored and cannot override the engine's computed values.

**Critical — reject actions do NOT populate loop-predicate fields:** `reviewer-reject` and `force-reject` do NOT populate `output.rejectedBy` or `output.rejectorMandatory` on the step output. The default loop-region predicate `decision == 'reject' && rejectorMandatory == true` will therefore NOT fire when a step is resolved via these actions. If your loop region relies on `rejectorMandatory`, you must use `recordReviewerDecision` with a configured mandatory reviewer rather than the `/steps/resolve` reject actions. See also the loop-predicate caveat in `concepts-workflow-model`.

**Post-GA note:** Workspace-admin RBAC will further gate force-* actions by workspace role.

### Choosing the right endpoint

| Situation | Endpoint |
|---|---|
| Human reviewer is acting through your UI | `recordReviewerDecision` |
| Out-of-band system completed a `blocking: true` agent step | `recordAgentResolution` |
| Operator escalates / aborts a single step | `cancel` (admin) |
| Operator force-resolves a stuck step (choose action) | `resolve` with appropriate `action` value |
| Reviewer acting via resolve endpoint (in reviewerIds) | `resolve` with `reviewer-approve` or `reviewer-reject` |
| Operator aborts the whole workflow | `/executions/cancel` (NOT `/steps/cancel`) |

**Verification Checklist:**
- [ ] `decision` is the literal string `"approve"` or `"reject"` (lowercase) for `recordReviewerDecision`
- [ ] `reviewerId` for `recordReviewerDecision` does NOT need to match configured reviewers — unknown reviewers are silently recorded; enforce identity in your own application layer if needed
- [ ] `recordAgentResolution` is only called for `blocking: true` agent steps, with a stable idempotent `resolutionId`
- [ ] `/steps/cancel` and `/steps/resolve` callers use admin-scoped tokens; non-admin failures are handled gracefully
- [ ] `/steps/cancel` `actorId` (REQUIRED, 1–256 chars) is always set; it surfaces on `step.cancelled` event data
- [ ] `/steps/resolve` `action` field is always set — one of: `force-approve`, `force-reject`, `force-complete`, `force-fail`, `reviewer-approve`, `reviewer-reject`
- [ ] `/steps/resolve` `actorId` (REQUIRED, 1–256 chars) is set; for reviewer-scoped actions it must be in `step.reviewerIds` or `PERMISSION_DENIED` is returned
- [ ] `/steps/resolve` `reason` is ≤ 2000 chars (not 500)
- [ ] Code does NOT supply `decision` / `approved` / `approvalReply` in the `output` object on `/steps/resolve` — the engine computes these and ignores caller-supplied values
- [ ] Loop regions that rely on `rejectorMandatory` use `recordReviewerDecision` (not resolve reject actions) — reject actions do NOT populate `output.rejectedBy` / `output.rejectorMandatory`
- [ ] Cancelling the whole workflow uses `/executions/cancel`, not `/steps/cancel`
- [ ] Code does NOT poll for completion after a step record — the webhook (or `/executions/getEvents`) is the signal

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/steps/record-reviewer-decision
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/steps/record-agent-resolution
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/steps/cancel-step
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/steps/resolve-step
