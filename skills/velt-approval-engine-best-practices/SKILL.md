---
name: velt-approval-engine-best-practices
description: "Best practices for the Velt Approval Engine — the declarative workflow runtime for multi-step agent + human approval processes. Use whenever the user is building approval workflows, multi-step review processes, agent-then-human approval chains, parallel reviewer quorums, SLA-aware approval steps, or any workflow that combines AI agents with human gatekeeping. Triggers on any task involving the Velt Approval Engine, /v2/workflow/ REST endpoints, workflow definitions (nodes/edges/groups), executions dispatch with idempotencyKey, recording reviewer decisions or agent resolutions, workflow webhooks (execution.dispatched/completed/failed/cancelled, step.awaiting-approval/completed/failed/breached/cancelled, group.quorum-met), HMAC-SHA256 webhook signature verification, SLA-routed breach edges, quorum policies (waitAll/cancelOnQuorum/joinOnQuorum), or recovering missed webhook events via /executions/getEvents with sinceSeq — even if the user does not explicitly say 'Approval Engine'."
license: MIT
metadata:
  author: velt
  version: "1.0.0"
---

# Velt Approval Engine Best Practices

Implementation guide for the Velt Approval Engine — a declarative workflow runtime for multi-step agent + human approval processes. Covers the workflow model (definitions = nodes + edges + groups), the 14 REST endpoints under `/v2/workflow/*` (definitions, executions, steps), webhook delivery with HMAC signature verification, and idempotency/recovery patterns.

## When to Apply

Reference these guidelines when:
- Authoring approval workflow **definitions** — nodes (`agent`, `human`, and the v1-deferred `webhook` type), edges (with optional `when` gating expressions), groups (parallel quorum)
- **Dispatching executions** — always with an `idempotencyKey`; configuring `webhookUrl` + `webhookSecret` together
- **Recording decisions** — human reviewer approvals/rejections (`/steps/recordReviewerDecision`) or external blocking-agent resolutions (`/steps/recordAgentResolution`)
- **Building webhook receivers** — HMAC-SHA256 signature verification on raw bytes, idempotency on `(executionId, seq)`, retry schedule, missed-event recovery
- Using **quorum groups** with `waitAll` / `cancelOnQuorum` / `joinOnQuorum` policies
- Configuring **SLAs** (`slaMs` on a node) and the required breach-routed outgoing edge
- Admin-scoped operations (`/steps/cancel`, `/steps/resolve`)
- Debugging `INVALID_ARGUMENT` linter rejections (cycle, dangling-edge, unreachable-node, missing-breach-edge, group-joinonquorum-members-must-share-successors)

For general Velt REST API patterns (Comments, Notifications, Activity, etc.), see `velt-rest-apis-best-practices` — only the Approval Engine domain is covered here.

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Concepts | HIGH | `concepts-` |
| 2 | REST Endpoints | HIGH | `rest-` |
| 3 | Webhooks | HIGH | `webhooks-` |

## Quick Reference

### Concepts (HIGH)
- `concepts-workflow-model` — definitions = nodes + edges + groups; node shapes (agent / human); edge `when` expressions; group quorum policies (waitAll / cancelOnQuorum / joinOnQuorum)

### REST Endpoints (HIGH)
- `rest-foundations` — auth headers, request/response envelope, canonical error codes (including `DEADLINE_EXCEEDED`), schema-level validation message reference
- `rest-definitions` — 5 endpoints: create / update (with `ifVersion` optimistic lock) / get / list / delete; **full 16-rule linter reference**
- `rest-executions` — 5 endpoints: dispatch (idempotencyKey + webhook config) / get / list / cancel / getEvents (sinceSeq recovery)
- `rest-steps` — 4 endpoints: recordReviewerDecision / recordAgentResolution / cancel (admin) / resolve (admin)
- `rest-object-views` — TypeScript shapes for `ExecutionView`, `StepView`, `DefinitionView`, `ApprovalEventView`, the human step `output` aggregator rollup, and the `joinOnQuorum` successor input

### Webhooks (HIGH)
- `webhooks-delivery` — HMAC-SHA256 signature verification on raw bytes, delivery headers, retry schedule, event-type catalog, at-least-once idempotency

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/concepts/concepts-workflow-model.md
rules/shared/rest/rest-foundations.md
rules/shared/rest/rest-definitions.md
rules/shared/rest/rest-executions.md
rules/shared/rest/rest-steps.md
rules/shared/rest/rest-object-views.md
rules/shared/webhooks/webhooks-delivery.md
```

Each rule file contains:
- Brief explanation of why it matters
- Concrete request/response examples
- Common pitfalls and what NOT to do
- Verification checklist
- Source pointers to official docs

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
