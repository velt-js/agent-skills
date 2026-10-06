---
name: velt-approval-engine-best-practices
description: "Best practices for the Velt Approval Engine (docs: Review Workflow Builder) for multi-step agent and human approval. Use for review workflows, /v2/workflow/ REST calls, definitions with agent, human, notification, or webhook nodes, edge on roles and reject loop-backs, quorum groups, SLAs, triggers (inbound webhook, cron, GitHub/Vercel app), agent node aiConfig, idempotent dispatch, reviewer decisions, or signed webhook delivery, even if the user does not say 'Approval Engine'."
license: MIT
metadata:
  author: velt
  version: "1.1.0"
---

# Velt Approval Engine Best Practices

Implementation guide for the Velt Approval Engine, documented on docs.velt.dev as the **Review Workflow Builder (Beta)**: a workflow runtime for multi-step agent and human review. Covers the workflow model (definitions of nodes, edges, groups, and triggers), the 14 enveloped REST endpoints under `/v2/workflow/*` plus the raw-JSON inbound trigger endpoint, webhook delivery with HMAC verification, and the patterns and anti-patterns from the docs.

## When to Apply

Reference these guidelines when:
- Authoring **definitions**: `agent` nodes (`url` / `urlPath`, `aiConfig`), `human` nodes (mandatory reviewers, required `on: "reject"` edge), `notification` nodes (email / Slack), `webhook` nodes (sync / async callback)
- Routing with **edges**: `on` roles (`approve`, `reject`, `always`, `exhausted`, `custom` with JSON-AST `when`), reject loop-backs with `loop.maxIterations`, SLA breach routes
- Using **parallel groups** with `waitAll` / `cancelOnQuorum` / `joinOnQuorum`, `requiredNodeIds`, and group edge sources
- Adding **triggers** that start runs: `inboundWebhook`, cron `schedule`, GitHub / Vercel `appTrigger`
- **Dispatching executions** with an `idempotencyKey`, and configuring `webhookConfig` or a per-dispatch `webhookUrl` + `webhookSecret`
- **Recording decisions** with `/steps/recordReviewerDecision`, or overriding with `/steps/cancel` and `/steps/resolve`
- **Building webhook receivers**: HMAC-SHA256 on raw bytes, idempotency on `(executionId, seq)`, recovery with `/executions/getEvents` and `sinceSeq`
- **Updating or copying definitions**: full-replace updates with `ifVersion`, stripping server-owned fields and nulls, write-only `webhookConfig`
- Debugging `INVALID_ARGUMENT` linter failures (`missing-breach-edge`, `loop-node-in-multiple-loops`, `group-joinonquorum-members-must-share-successors`, reject-path and URL rules)

The agents that `agent` nodes run (built-in and custom agents, Run Execution, the `aiConfig` model allowlist) are covered by `rest-agents` in `velt-rest-apis-best-practices`. Other Velt REST APIs are covered there too; only the Approval Engine domain is covered here.

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Concepts | HIGH | `concepts-` |
| 2 | REST Endpoints | HIGH | `rest-` |
| 3 | Webhooks | HIGH | `webhooks-` |
| 4 | Patterns | MEDIUM-HIGH | `patterns-` |

## Quick Reference

### Concepts (HIGH)
- `concepts-workflow-model` — definition anatomy and limits, the four node types, common node fields, lifecycles (`waiting` for agent, human, async webhook steps), deterministic step IDs, scope semantics, versioning pin, tenant partitioning, beta limitations
- `concepts-agent-node` — `agentId` plus required `url` / `urlPath`, crawl and polling fields, `aiConfig` (`provider`, `model`, `defaultModels`, `maxToolTurns`), `__mock__`, no `blocking: true`, outputs, dispatch `organizationId` / `documentId`, link to the Agents feature
- `concepts-human-node` — `reviewers[]` vs legacy `reviewerIds[]`, `reviewerEmails`, `commentBody`, resolution rule, required `on: "reject"` edge, undeclared reviewers return `recorded: false`
- `concepts-notification-webhook-nodes` — email / Slack notification config and `{{...}}` templating; webhook node sync vs async, callback token contract, `hmac` / `token` / `none` auth, outputs
- `concepts-edge-model` — `EdgeEndpoint`, `on` roles, JSON-AST `when` (custom only), reject loop-backs, `on: "exhausted"`, derived `compiled.loops`, fixed loop predicate, body shapes, `previousAttempts`, breach routing, `compiled` view
- `concepts-groups-quorum` — group fields, quorum counts approvals (passing agents count), policy behavior, `requiredNodeIds`, groups as edge sources, `joinOnQuorum` successor input
- `concepts-triggers` — trigger entries (one mechanism each), scope inheritance, cron `schedule`, GitHub / Vercel `appTrigger`, triggers now dispatch runs

### REST Endpoints (HIGH)
- `rest-foundations` — headers, envelope, error codes, linter codes parsed from `error.message`, Zod `error.details.issues`, literal schema messages, rate limiting
- `rest-definitions` — create, update as full replace with required `ifVersion`, round-tripping reads, get (no `webhookConfig`), list with `pageSize` / integer `cursor` / `items`, soft or `purge` delete, 19 linter codes and edge-contract rules
- `rest-executions` — dispatch fields and errors (tombstoned is `FAILED_PRECONDITION`), get, list (`items` with `steps: []`, string `cursor`), cancel (no-op on terminal runs), `getEvents` with `sinceSeq`, `pageSize`, `hasMore`
- `rest-steps` — `recordReviewerDecision` (`recorded`, `rejectionReason`, `aggregatorStatus`), `recordAgentResolution` unavailable in beta, `/steps/cancel`, `/steps/resolve` action matrix and loop-predicate caveat
- `rest-object-views` — `ExecutionView`, `StepView` (four node types), `DefinitionView` with `compiled`, `CompiledGraph`, `ApprovalEventView`, human / agent / webhook step outputs, `joinOnQuorum` successor input

### Webhooks (HIGH)
- `webhooks-delivery` — `webhookConfig` vs dispatch override, raw-byte HMAC verification, headers, retry schedule, 12-event catalog with per-node-type `data`, cancellation reasons, `(executionId, seq)` idempotency
- `webhooks-inbound-handler` — `/v2/workflow/webhook-inbound/trigger` raw-JSON contract, per-trigger secret, provider presets, `allowedEvents`, idempotency headers, 1 MB limit, no built-in rate limiting or payload URL screening

### Patterns (MEDIUM-HIGH)
- `patterns-choose-the-right-construct` — "I want X, use Y" decision table, parallel policy choice, webhooks plus polling
- `patterns-rejection-and-loops` — three rejection shapes, one group-source back-edge for parallel rewinds, anti-patterns (per-reviewer back-edges, `slaMs` with only reject, exhausted targets reachable twice)
- `patterns-copy-update-versioning` — manual copy steps, triggers and `webhookConfig` pitfalls, full-replace updates, versioning without history or rollback

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/concepts/concepts-workflow-model.md
rules/shared/concepts/concepts-agent-node.md
rules/shared/concepts/concepts-human-node.md
rules/shared/concepts/concepts-notification-webhook-nodes.md
rules/shared/concepts/concepts-edge-model.md
rules/shared/concepts/concepts-groups-quorum.md
rules/shared/concepts/concepts-triggers.md
rules/shared/rest/rest-foundations.md
rules/shared/rest/rest-definitions.md
rules/shared/rest/rest-executions.md
rules/shared/rest/rest-steps.md
rules/shared/rest/rest-object-views.md
rules/shared/webhooks/webhooks-delivery.md
rules/shared/webhooks/webhooks-inbound-handler.md
rules/shared/patterns/patterns-choose-the-right-construct.md
rules/shared/patterns/patterns-rejection-and-loops.md
rules/shared/patterns/patterns-copy-update-versioning.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect and correct request examples
- Common pitfalls and what NOT to do
- Verification checklist
- Source pointers to official docs

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
