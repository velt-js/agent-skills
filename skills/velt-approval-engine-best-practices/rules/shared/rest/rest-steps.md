---
title: Steps endpoints — recordReviewerDecision, recordAgentResolution, cancel (admin), resolve (admin)
impact: HIGH
impactDescription: Steps endpoints drive forward progress on parked human/blocking-agent steps; admin-only endpoints (cancel/resolve) require admin-scoped auth tokens or they 403
tags: approval-engine, rest, steps, recordReviewerDecision, recordAgentResolution, cancel, resolve, admin, PERMISSION_DENIED, decision, approve, reject, aggregatorStatus, resumeScheduled
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

`decision` is `"approve"` or `"reject"` (strings, lowercase). `reviewerId` must be one of the node's configured `reviewers[].userId` values — anyone else returns `INVALID_ARGUMENT`.

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
{ "data": { "executionId": "exec_1777...", "stepId": "step_...", "reason": "escalated" } }
```

Cancels a single step (not the whole execution). Requires an admin-scoped auth token; non-admin tokens receive `PERMISSION_DENIED`.

**resolve (admin override):**

```bash
POST https://api.velt.dev/v2/workflow/steps/resolve
{ "data": { "executionId": "exec_1777...", "stepId": "step_...", "output": { "decision": "approve" } } }
```

Admin force-complete. Bypasses reviewer-decision aggregation, agent runtime, and quorum checks. Same admin-scope requirement.

### Choosing the right endpoint

| Situation | Endpoint |
|---|---|
| Human reviewer is acting through your UI | `recordReviewerDecision` |
| Out-of-band system completed a `blocking: true` agent step | `recordAgentResolution` |
| Operator escalates / aborts a single step | `cancel` (admin) |
| Operator force-completes a stuck step | `resolve` (admin) |
| Operator aborts the whole workflow | `/executions/cancel` (NOT `/steps/cancel`) |

**Verification Checklist:**
- [ ] `decision` is the literal string `"approve"` or `"reject"` (lowercase)
- [ ] `reviewerId` matches a configured `reviewers[].userId` on the target node — otherwise `INVALID_ARGUMENT`
- [ ] `recordAgentResolution` is only called for `blocking: true` agent steps, with a stable idempotent `resolutionId`
- [ ] `/steps/cancel` and `/steps/resolve` callers use admin-scoped tokens; non-admin failures are handled gracefully
- [ ] Cancelling the whole workflow uses `/executions/cancel`, not `/steps/cancel`
- [ ] Code does NOT poll for completion after a step record — the webhook (or `/executions/getEvents`) is the signal

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/steps/record-reviewer-decision
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/steps/record-agent-resolution
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/steps/cancel-step
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/steps/resolve-step
