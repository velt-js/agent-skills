# Velt Approval Engine Best Practices

**Version 1.1.0**  
Velt  
October 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Velt Approval Engine implementation guide covering the declarative workflow runtime for multi-step agent + human approval processes — the 14 REST endpoints under /v2/workflow/*, the definition model (nodes + edges + parallel-quorum groups), execution dispatch with idempotency, HMAC-SHA256 webhook signature verification, missed-event recovery via getEvents+sinceSeq, SLA breach edges, and the quorum policies (waitAll / cancelOnQuorum / joinOnQuorum).

---

## Table of Contents

1. [Concepts](#1-concepts) — **HIGH**
   - 1.1 [Configure agent nodes with url or urlPath, aiConfig, and a downstream human node instead of blocking](#11-configure-agent-nodes-with-url-or-urlpath-aiconfig-and-a-downstream-human-node-instead-of-blocking)
   - 1.2 [Configure human nodes with mandatory reviewers and an outgoing reject edge](#12-configure-human-nodes-with-mandatory-reviewers-and-an-outgoing-reject-edge)
   - 1.3 [Model parallel review with groups, approval quorum, onQuorumMet policies, and group edge sources](#13-model-parallel-review-with-groups-approval-quorum-onquorummet-policies-and-group-edge-sources)
   - 1.4 [Route with edge on roles, JSON-AST when predicates, reject loop-backs, and breach-aware edges](#14-route-with-edge-on-roles-json-ast-when-predicates-reject-loop-backs-and-breach-aware-edges)
   - 1.5 [Start runs from triggers (inbound webhook, cron schedule, GitHub or Vercel app) instead of your own dispatcher](#15-start-runs-from-triggers-inbound-webhook-cron-schedule-github-or-vercel-app-instead-of-your-own-dispatcher)
   - 1.6 [Understand the workflow model of definitions, node types, lifecycles, step IDs, scope, and versioning](#16-understand-the-workflow-model-of-definitions-node-types-lifecycles-step-ids-scope-and-versioning)
   - 1.7 [Use notification nodes for email or Slack and webhook nodes for sync or async calls to your API](#17-use-notification-nodes-for-email-or-slack-and-webhook-nodes-for-sync-or-async-calls-to-your-api)

2. [REST Endpoints](#2-rest-endpoints) — **HIGH**
   - 2.1 [Dispatch executions with idempotencyKey and use get, list, cancel, and getEvents with sinceSeq correctly](#21-dispatch-executions-with-idempotencykey-and-use-get-list-cancel-and-getevents-with-sinceseq-correctly)
   - 2.2 [Drive steps with recordReviewerDecision, cancel, and action-based resolve (recordAgentResolution is unavailable in beta)](#22-drive-steps-with-recordreviewerdecision-cancel-and-action-based-resolve-recordagentresolution-is-unavailable-in-beta)
   - 2.3 [Manage definitions with create, full-replace update with ifVersion, get, list, delete, and the linter reference](#23-manage-definitions-with-create-full-replace-update-with-ifversion-get-list-delete-and-the-linter-reference)
   - 2.4 [Type responses against ExecutionView, StepView, DefinitionView with compiled, ApprovalEventView, and step output shapes](#24-type-responses-against-executionview-stepview-definitionview-with-compiled-approvaleventview-and-step-output-shapes)
   - 2.5 [Use the shared auth headers, data envelope, error codes, and linter-failure parsing on every Approval Engine endpoint](#25-use-the-shared-auth-headers-data-envelope-error-codes-and-linter-failure-parsing-on-every-approval-engine-endpoint)

3. [Webhooks](#3-webhooks) — **HIGH**
   - 3.1 [Receive webhook deliveries via webhookConfig or per-dispatch receivers with raw-byte HMAC checks, the event catalog, retries, and idempotency](#31-receive-webhook-deliveries-via-webhookconfig-or-per-dispatch-receivers-with-raw-byte-hmac-checks-the-event-catalog-retries-and-idempotency)
   - 3.2 [Send raw JSON to the inbound webhook trigger with per-trigger secrets, provider presets, and your own throttling](#32-send-raw-json-to-the-inbound-webhook-trigger-with-per-trigger-secrets-provider-presets-and-your-own-throttling)

4. [Patterns](#4-patterns) — **MEDIUM-HIGH**
   - 4.1 [Copy and update definitions safely and keep version history in source control](#41-copy-and-update-definitions-safely-and-keep-version-history-in-source-control)
   - 4.2 [Give every human node an explicit reject route and use one group-source back-edge for parallel rewinds](#42-give-every-human-node-an-explicit-reject-route-and-use-one-group-source-back-edge-for-parallel-rewinds)
   - 4.3 [Pick the construct that matches the review requirement before writing the definition](#43-pick-the-construct-that-matches-the-review-requirement-before-writing-the-definition)

---

## 1. Concepts

**Impact: HIGH**

The workflow model (documented as the Review Workflow Builder): definitions of nodes, edges, groups, and triggers; the four node types (`agent` with `url`/`urlPath` and `aiConfig`, `human` with mandatory reviewers and a required reject edge, `notification`, sync/async `webhook`); edge `on` roles (`approve`, `reject`, `always`, `exhausted`, `custom` with JSON-AST `when`), reject loop-backs and derived `compiled.loops`, SLA breach routing; group quorum and the `waitAll` / `cancelOnQuorum` / `joinOnQuorum` policies and group edge sources; triggers (`inboundWebhook`, `schedule`, `appTrigger`) that dispatch runs; lifecycles, step IDs, scope, versioning, and tenant partitioning. Read this before any REST rule.

### 1.1 Configure agent nodes with url or urlPath, aiConfig, and a downstream human node instead of blocking

**Impact: HIGH (An agent node without url/urlPath is rejected at create time, blocking agents fail every run, and an unpaired aiConfig model pin can be silently dropped)**

An `agent` node starts a run of a Velt agent (a built-in or custom agent from the Agents feature) against a URL, parks in `waiting` while the agent runs, and resumes on its own when the agent finishes. It must know which URL to review, and it can pin the AI provider and model for every run it starts through `aiConfig`.

**Incorrect:**

```json
{
  "nodeId": "brand-check",
  "type": "agent",
  "config": {
    "agentId": "brand-agent-v1",
    "blocking": true,
    "resolutionPolicy": { "kind": "allResolved" },
    "aiConfig": { "model": "claude-sonnet-5", "temperature": 0.2 }
  }
}
```

No `url` or `urlPath` (rejected with the message `agent node requires either a static "url" or a "urlPath"`), `blocking: true` passes schema validation but every run fails with `agent-blocking-not-supported`, and `aiConfig` rejects the unknown `temperature` key.

**Correct:**

```json
{
  "nodeId": "brand-check",
  "type": "agent",
  "config": {
    "agentId": "brand-agent-v1",
    "urlPath": "documentUrl",
    "aiConfig": { "provider": "claude", "model": "claude-sonnet-5" }
  },
  "slaMs": 3600000
}
```

Dispatch with `"triggerContext": { "documentUrl": "https://app.acme.com/docs/123" }` so `urlPath` resolves.
**Agent node `config` fields**
| Field | Notes |
|---|---|
| `agentId` | Required. Built-in or custom agent id. `__mock__` is reserved: it returns a synthetic pass, for demos and tests only. |
| `url` | Fixed absolute URL, up to 2000 chars. Wins when both `url` and `urlPath` are set. |
| `urlPath` | Dot-path into `triggerContext`, up to 500 chars. A value with no scheme is normalized to `https://` (for example Vercel's `payload.deployment.url`). |
| `crossPageExecute` | Let the agent crawl beyond the seed URL. Default `false`. |
| `maxUrlsToProcess` | Cap on URLs crawled per run, up to 500. |
| `userContextMapping` | `{ field: dotPath }` map that builds the agent's `userContext` from `triggerContext`. |
| `promptOverride` | Up to 8000 chars. |
| `inputMapping` | Extra step inputs passed to the agent. |
| `pollIntervalMs` | 5000 to 60000. How often the engine checks the agent's status. Default 15000. |
| `agentMaxRuntimeMs` | Hard ceiling, up to 24 hours. Default 10 minutes. |
| `aiConfig` | AI provider and model for every agent run this node starts. Same fields and rules as `aiConfig` on the Agents Run Execution endpoint. |
You must set `url` or `urlPath`. If `urlPath` resolves to nothing at run time and no static `url` is set, the step fails with `agent-url-unresolved`.
**`aiConfig` on the node**
- Applies to every run the node starts, including scheduled and triggered runs. Omit it to use the provider and model the platform resolves for the agent.
- Takes `provider`, `model`, `defaultModels`, and `maxToolTurns`, with the same validation as Run Execution: at least one field set, unknown keys rejected, models limited to the allowlist. An invalid value fails create or update with `INVALID_ARGUMENT`.
- Send `provider` alongside `model` (or use `defaultModels`). On Run Execution, a `model` without `provider` only passes a weaker check and is silently dropped if it does not match the provider the agent resolves to.
- If the allowlist later stops accepting a saved value, the step drops it and the run uses the platform default. The step does not fail, so do not rely on `aiConfig` to guarantee a model; check the agent execution if it matters.
**Outputs and routing:** the step output carries `agentExecutionStatus`, `agentResultsSummary`, `resolvedUrl`, `agentDurationMs`, and `decision: "approve"` when the agent passed. Route on any of them with an `on: "custom"` predicate. When the agent run does not pass, the step ends `failed` (an `on: "always"` edge fires on `failed`). A completed agent step with `decision: "approve"` counts toward group quorum (see `concepts-groups-quorum`).
**Organization and document:** agent nodes use the dispatch-level `organizationId` and `documentId` when they call the agent. Pass them on `/executions/dispatch` when agent findings should land in a specific organization or document; they are not validated against the definition's `scope` and are not returned by any read endpoint.
**`__mock__`:** completes inline and emits `step.completed` data `{ agentId, synthetic, decision }` instead of the production agent shape, so a webhook receiver tested only against `__mock__` sees different `data` keys in production. Swap to a real `agentId` before going live.
**Human sign-off on agent findings:** blocking agents (and therefore `/steps/recordAgentResolution`) are not available in beta. Put a `human` node downstream of the agent node instead.
**Relationship to the Agents feature:** `agentId` refers to agents documented under AI Agents. The agents themselves (built-in ids, custom agents, Run Execution, `aiConfig` allowlist) are covered by the `rest-agents` rule in `velt-rest-apis-best-practices`; this skill covers only how a workflow node invokes them.

---

### 1.2 Configure human nodes with mandatory reviewers and an outgoing reject edge

**Impact: HIGH (A human node without an on reject edge is rejected at create time, and a reviewerId that is not declared on the node is silently discarded so the step never resolves)**

A `human` node waits for reviewers to approve or reject. It carries no rejection config of its own: its reject path is an outgoing `on: "reject"` edge, and every human node (group members included) must have one. You host the reviewer UI in beta and record each decision through `/steps/recordReviewerDecision`.

**Incorrect:**

```json
{
  "nodes": [
    {
      "nodeId": "human-final-approver",
      "type": "human",
      "config": {
        "reviewers": [{ "userId": "u_1", "mandatory": false }],
        "reviewerIds": ["u_1"]
      }
    }
  ],
  "edges": []
}
```

Both `reviewers` and `reviewerIds` are set, no reviewer is mandatory, and the node has no outgoing `on: "reject"` edge (`every human node must have at least one outgoing edge with on="reject" (a forward reject route or a reject back-edge): human-final-approver`).

**Correct:**

```json
{
  "nodes": [
    {
      "nodeId": "human-final-approver",
      "type": "human",
      "config": {
        "reviewers": [{ "userId": "u_1", "mandatory": true }],
        "reviewerEmails": ["approver@acme.com"],
        "commentBody": "Please approve the Q3 launch copy."
      }
    },
    { "nodeId": "notify-rejected", "type": "notification", "config": { "channel": "email", "recipients": ["pm@acme.com"], "bodyTemplate": "Rejected by final approver." } }
  ],
  "edges": [
    { "from": "human-final-approver", "to": "notify-rejected", "on": "reject" }
  ]
}
```

If rejection should simply end the run, route the reject edge to a terminal node explicitly. The engine does not allow it to be implicit.
**Human node `config` fields**
| Field | Notes |
|---|---|
| `reviewers` | Preferred. `[{ userId, mandatory }]`. At least one `mandatory: true`; `userId`s unique. |
| `reviewerIds` | Legacy. Every entry is treated as mandatory. Set exactly one of `reviewers` or `reviewerIds`. |
| `reviewerEmails` | Up to 50 addresses. Surfaced on `output.reviewerEmails` for your notification UI. |
| `commentBody` | Up to 8000 chars. Stored on the step output for your reviewer UI to render. |
**Resolution rule:** the step resolves when every mandatory reviewer approves, or when any reviewer rejects.
**Recording decisions**
- `reviewerId` must match a `userId` declared on the node. An undeclared reviewer does not throw: the call returns `recorded: false` with `rejectionReason: "unknown-responder"`, nothing is stored, and the step keeps waiting. Check `recorded` on every response.
- Recording the same reviewer twice returns `recorded: false` with `rejectionReason: "idempotent"`.
- Find the waiting step with `/executions/get` (a step with `status: "waiting"` and `nodeType: "human"`) or from the `step.awaiting-approval` event.
**Schema messages to expect:** `at least one of reviewerIds or reviewers must be provided`, `cannot set both reviewerIds and reviewers, use one`, `reviewer userIds must be unique`, `reviewers must include at least one mandatory reviewer`.
**Run-time failure reasons:** a human step that cannot run emits `step.failed` with `data.reason` of `no-reviewers`, `no-mandatory-reviewers`, `duplicate-reviewer-user-ids`, or `exception`.

---

### 1.3 Model parallel review with groups, approval quorum, onQuorumMet policies, and group edge sources

**Impact: HIGH (Picking the wrong onQuorumMet policy duplicates downstream steps or strands reviewers; quorum counts approvals (including passing agents), not completions)**

A group declares member nodes that run in parallel and share an approval threshold. The `onQuorumMet` policy decides what happens the moment quorum is first met, and a group can itself be an edge source so it takes one collective branch instead of one fan-out per member.

**Incorrect:**

```json
{
  "groups": [{
    "groupId": "parallel-review",
    "memberNodeIds": ["human-legal", "human-brand"],
    "expectedSteps": 3,
    "quorum": 2,
    "onQuorumMet": "waitAll"
  }],
  "edges": [
    { "from": "human-legal", "to": "agent-publish" },
    { "from": "human-brand", "to": "agent-publish" }
  ]
}
```

`expectedSteps` is higher than the member count, so the group never completes. With `waitAll`, each member fans out on its own, so `agent-publish` runs twice. The human members also lack reject edges.

**Correct (publish exactly once after both approve; any rejection rewinds the stage):**

```json
{
  "groups": [{
    "groupId": "parallel-review",
    "memberNodeIds": ["human-legal", "human-brand"],
    "expectedSteps": 2,
    "quorum": 2,
    "onQuorumMet": "joinOnQuorum"
  }],
  "edges": [
    { "from": "agent-draft", "to": { "kind": "group", "groupId": "parallel-review" } },
    { "from": { "kind": "group", "groupId": "parallel-review" }, "to": "agent-publish", "on": "approve" },
    { "from": { "kind": "group", "groupId": "parallel-review" }, "to": "agent-draft", "on": "reject", "loop": { "maxIterations": 3 } },
    { "from": { "kind": "group", "groupId": "parallel-review" }, "to": "human-cco", "on": "exhausted" }
  ]
}
```

**Group fields**
| Field | Notes |
|---|---|
| `groupId` | Required. 1 to 64 chars. |
| `memberNodeIds` | Required. 1 to 500 declared nodes; a node belongs to at most one group. |
| `expectedSteps` | Required. 1 to 500. Set it equal to `memberNodeIds.length`; higher means the group never completes. |
| `quorum` | Required. 1 to `expectedSteps`. Approvals needed to fire the policy. |
| `onQuorumMet` | `waitAll` (default), `cancelOnQuorum`, or `joinOnQuorum`. |
| `requiredNodeIds` | Members that must approve. Each in `memberNodeIds`; length at most `quorum`. |
**Quorum counts approvals, not completions.** A member counts only when it ends `completed` with `output.decision === "approve"`. Rejections, failures, breaches, and cancellations advance the completion counter only.
- **Agent members do count.** An agent step that passes (or is skipped) completes with `decision: "approve"`. A failed agent step never counts, so with `quorum === expectedSteps` one agent failure blocks the group like one human rejection.
- **A reject does not block group completion;** it only stops the approval counter.
- **`requiredNodeIds`:** quorum needs every listed node approved AND the numeric `quorum` reached.
**`onQuorumMet` policies**
| Policy | On first quorum | Per-member fan-out |
|---|---|---|
| `waitAll` | Emits `group.quorum-met` only. | Each member's edges fire on its own completion; two members pointing at one node create two steps. |
| `cancelOnQuorum` | Emits `group.quorum-met`, cancels siblings still `waiting` (`actorId: "system:group-quorum"`, reason `group-quorum-met`). Requires `quorum < expectedSteps`. | Completed members still fan out; cancelled ones do not. |
| `joinOnQuorum` | Emits `group.quorum-met`, cancels waiting siblings, fires one group-owned successor per shared target. Members must share the same outgoing target set. | Suppressed. Successor step id `group_<groupId>__to__<childNodeId>`, input `{ groupOutputs, groupId, quorum, totalApproved }`. |
**Groups as edge sources (`from: { kind: "group", groupId }`)**
- `waitAll`: waits for all members, then takes one branch by unanimity (`approve` only if every member approved, else `reject`). Provide both branches. A routed collective reject is not a failed run; the rejecting member ends `completed` with `decision: "reject"`.
- `cancelOnQuorum` / `joinOnQuorum`: fire one collective approve successor on quorum. A forward `on: "reject"` from them is a dead edge and is rejected (`APPROVAL_GROUP_FROM_REJECT_REQUIRES_LOOP`).
- A group-source reject loop-back requires `joinOnQuorum` (`APPROVAL_GROUP_FROM_LOOP_REQUIRES_JOINONQUORUM`).
- Edges into a group (`to: { kind: "group", groupId }`) expand to one edge per member for every policy. Group-to-group edges are rejected.
- A per-member `on: "reject"` edge on a `joinOnQuorum` member satisfies the reject-path rule but never fires (fan-out is suppressed). For per-rejecter routing use `waitAll` or `cancelOnQuorum`.

---

### 1.4 Route with edge on roles, JSON-AST when predicates, reject loop-backs, and breach-aware edges

**Impact: HIGH (All routing (approve, reject, loop-back, exhausted, breach, custom) is expressed on edges; a JavaScript-style when string fails to compile and a slaMs node without a breach route is rejected)**

Every transition is one entry in `edges[]`: approve routing, reject routing, revision loops, loop exhaustion, breach handling, and group fan-out. Each edge carries an `on` role; only `on: "custom"` takes a hand-written `when`, and that `when` is a JSON-AST string, not an expression language.

**Incorrect:**

```json
{
  "nodes": [
    { "nodeId": "human-review", "type": "human", "slaMs": 86400000, "config": { "reviewers": [{ "userId": "u_1", "mandatory": true }] } }
  ],
  "edges": [
    { "from": "human-review", "to": "agent-publish", "when": "output.decision == 'approve'" },
    { "from": "human-review", "to": "agent-draft", "on": "reject" }
  ]
}
```

`when` without `on: "custom"` is rejected, the JavaScript string would not compile anyway, the reject edge to an ancestor has no `loop` (`APPROVAL_EDGE_REJECT_CYCLE_REQUIRES_LOOP`), and `slaMs` with no breach route fails with `missing-breach-edge`.

**Correct:**

```json
{
  "edges": [
    { "from": "agent-draft",  "to": "human-review" },
    { "from": "human-review", "to": "agent-publish", "on": "approve" },
    { "from": "human-review", "to": "agent-draft",   "on": "reject", "loop": { "maxIterations": 3 } },
    { "from": "human-review", "to": "human-escalate", "on": "exhausted" },
    { "from": "human-review", "to": "notify-breach", "on": "custom",
      "when": "{\"op\":\"eq\",\"args\":[{\"var\":\"step.status\"},\"breached\"]}" }
  ]
}
```

**Edge fields**
| Field | Required | Notes |
|---|---|---|
| `from` / `to` | yes | `EdgeEndpoint`: bare node-id string, `{ "kind": "node", "nodeId" }`, or `{ "kind": "group", "groupId" }`. |
| `on` | no (default `always`) | `approve`, `reject`, `always`, `exhausted`, or `custom`. `approve` / `reject` compile their own predicates. |
| `when` | only with `on: "custom"` | JSON-AST string, up to 1000 chars. Rejected on any other role. |
| `loop` | only on an `on: "reject"` back-edge | `{ "maxIterations": 1..20 }`. Marks the edge as a loop-back. |
Edges round-trip exactly: what you POST is what `/definitions/get` returns.
**Roles**
- `always`: fires whenever the source reaches a fan-out-eligible status: `completed`, `skipped`, `breached`, or `failed`.
- `approve` / `reject`: fire on `output.decision == 'approve'` / `'reject'`. A reject edge never fires on a breach.
- `reject` + `loop`: `to` must be an ancestor of `from`. The server derives a loop region.
- `exhausted`: sibling of a reject loop-back from the same `from`; fires when the loop hits its cap. Without it, an exhausted loop rolls the execution up to `failed`.
- `custom`: fires when `when` evaluates true.
**`when` JSON-AST shapes**
| Goal | `when` value |
|---|---|
| equality | `{"op":"eq","args":[{"var":"output.decision"},"approve"]}` |
| numeric compare | `{"op":"gt","args":[{"var":"output.score"},0.8]}` |
| boolean AND / OR | `{"op":"and","args":[<a>,<b>]}` / `{"op":"or","args":[<a>,<b>]}` |
| negation | `{"op":"not","args":[<a>]}` |
| regex | `{"op":"regex","args":[{"var":"output.body"},"^urgent"]}` |
Also supported: comparison, `includes`, `startsWith`, `endsWith`, `length`, `isEmpty`. Path roots: `output.*` (source step's terminal output), `step.*` (`stepId`, `nodeId`, `status`, `retryCount`), `execution.input.*` (the dispatch `triggerContext`). The engine parses `when` as JSON and walks it safely; it never evaluates JavaScript.
**Loop regions are derived, not declared:** there is no top-level `loops[]` input. The derived region is returned read-only in `compiled.loops[]` as `{ loopId, entryNodeId, bodyNodeIds, maxIterations, onExhausted }`, where `entryNodeId` is the reject edge's `to` and `onExhausted` is `{ routeToNodeId }` or `null`.
- The iteration predicate is fixed: `decision == 'reject' && rejectorMandatory == true`. Custom loop predicates are not supported.
- `rejectorMandatory` is only set by `/steps/recordReviewerDecision`. Rejections forced through `/steps/resolve` (`reviewer-reject`, `force-reject`) do not set it, so the loop does not iterate.
- Body shape must be single-terminal sequential (exactly one body node has edges leaving the body) or group-bounded (exit nodes are exactly the members of one `joinOnQuorum` group with `quorum === expectedSteps`); otherwise `loop-body-must-have-single-terminal`.
- The entry step of iteration N+1 receives `{ iteration, loopId, previousAttempts: [{ iteration, authorOutput, rejectedBy, rejectorMandatory, rejectionReason, rejectedAt }] }`. Feed `previousAttempts` to the drafting agent so it can address the rejection.
- A group inside a loop body gets fresh quorum state on each iteration.
- Keep `on: "exhausted"` targets as leaves with no other incoming edges, or they can run twice (see `patterns-rejection-and-loops`).
**SLA and breach handling:** `slaMs` (up to 7 days) moves an unfinished step to `breached` and emits `step.breached`. A node with `slaMs` and outgoing edges must have an edge that routes on the breach: an `on: "always"` edge, or an `on: "custom"` edge whose `when` tests for `breached`. A terminal node with no outgoing edges is accepted; if it breaches, the execution fails. Agent nodes also stop at `agentMaxRuntimeMs` (default 10 minutes).
**The compiled view:** every `DefinitionView` returns `compiled.forwardEdges` (group endpoints expanded, `on` roles compiled to predicate ASTs, with `role`, `when`, optional `fromGroupId` / `toGroupId`) and `compiled.loops`. Render workflow graphs from `compiled` instead of re-implementing the compiler client-side.

---

### 1.5 Start runs from triggers (inbound webhook, cron schedule, GitHub or Vercel app) instead of your own dispatcher

**Impact: HIGH (Triggers now dispatch runs themselves; also dispatching from your own cron or webhook handler doubles every run)**

A `triggers[]` entry on a definition makes the engine start runs for you, with no `/executions/dispatch` call. Triggers used to be descriptive metadata only; they now dispatch, so a cron job or webhook relay you built earlier must be removed when you add the equivalent trigger.

**Incorrect:**

```json
{
  "triggers": [
    {
      "triggerId": "nightly-audit",
      "schedule": { "cron": "0 2 * * *" },
      "inboundWebhook": { "authMode": "bearer", "secret": "short", "provider": "github" }
    }
  ]
}
```

One entry declares two mechanisms (`APPROVAL_APP_TRIGGER_EXCLUSIVE`), the schedule is missing the required `timezone` and `enabled`, the secret is under 16 chars, and `provider: "github"` requires `authMode: "hmac"`.

**Correct:**

```json
{
  "triggers": [
    {
      "triggerId": "nightly-audit",
      "schedule": { "cron": "0 2 * * *", "timezone": "America/Los_Angeles", "enabled": true, "payloadTemplate": { "source": "nightly" } }
    },
    {
      "triggerId": "gh-deploy-review",
      "appTrigger": { "provider": "github", "installationRef": "41234567", "repoFilter": ["acme/website"], "allowedEvents": ["push", "pull_request"] }
    }
  ]
}
```

**Trigger entry fields:** `triggerId` (required, 1 to 128 chars, also the idempotency-key prefix), `eventName` (optional label, up to 128 chars), `filters` (free-form), and at most one of `inboundWebhook`, `schedule`, `appTrigger`. A definition holds up to 50 entries.
**Scope is always inherited.** A triggered run carries the owning definition's `scope`: an organization- or document-scoped definition fires runs with the same `organizationId` / `documentId`. IDs inside a webhook body never set a run's scope.
**`schedule` (cron)**
| Field | Notes |
|---|---|
| `cron` | Required. Standard 5-field expression, validated at write time. |
| `timezone` | Required. IANA zone such as `America/Los_Angeles`. DST handled. |
| `enabled` | Required. Only enabled schedules fire; `false` removes the schedule. |
| `payloadTemplate` | Static object merged into `triggerContext` under `schedule.payload`. |
The run's `triggerContext.schedule` is `{ triggerId, scheduledAt, payload }`. A schedule fires at most once per instant, and missed runs are not replayed. Updating `triggers` replaces the stored array.
**`appTrigger` (GitHub App or Vercel Integration):** connect the installation once from the Velt dashboard to get an `installationRef` (GitHub `installation.id` or Vercel `configuration.id`), then reference it. No per-repo webhook or secret.
| Field | Notes |
|---|---|
| `provider` | Required. `github` or `vercel`. |
| `installationRef` | Required. 1 to 256 chars; must already be connected or `FAILED_PRECONDITION`. |
| `repoFilter` | GitHub `org/repo` allowlist, up to 200. |
| `projectFilter` | Vercel project id or name allowlist, up to 200. |
| `allowedEvents` | 1 to 50 names such as `push` or `deployment.succeeded`. |
| `payloadFilters` | Up to 20 `{ path, in }` entries; every filter must match. |
Deliveries are deduplicated on the provider's delivery id. App triggers require a Superflow-platform workspace; elsewhere create fails with `FAILED_PRECONDITION` (`APPROVAL_APP_PLATFORM_NOT_SUPPORTED`).
**`inboundWebhook`:** exposes the definition at `POST /v2/workflow/webhook-inbound/trigger` for external systems. See `webhooks-inbound-handler` for the contract.
**Copying a definition copies its triggers.** A duplicated definition with the same `schedule` runs twice a night; drop or rename triggers on copies (see `patterns-copy-update-versioning`).

---

### 1.6 Understand the workflow model of definitions, node types, lifecycles, step IDs, scope, and versioning

**Impact: HIGH (Every REST payload carries these shapes; authoring against the pre-refactor model (onReject, loops[], deferred webhook nodes, blocking agents) produces INVALID_ARGUMENT at create time or runs that never advance)**

The Approval Engine is documented on docs.velt.dev as the **Review Workflow Builder (Beta)**; the REST surface is still `/v2/workflow/*` and the docs still live under `/ai/approval-engine/`. You describe a review process once as a **definition** (a graph of nodes and edges), then start a **run** (an execution) against it whenever something needs review. The engine runs agents, waits for human approvals, evaluates branching, enforces SLAs, sends notifications, and reports the outcome.

The model was refactored: rejection routing now lives entirely on edges (`on: "reject"`, `loop`, `on: "exhausted"`), all four node types run, agent nodes need a URL, and triggers start runs on their own. Authoring against the old shapes is the most common source of `INVALID_ARGUMENT`.

**Incorrect (pre-refactor shapes that are now rejected or never run):**

```json
{
  "nodes": [
    {
      "nodeId": "manager-approval",
      "type": "human",
      "config": {
        "reviewers": [{ "userId": "u_manager_01", "mandatory": true }],
        "onReject": { "routeToNodeId": "rework-notice" }
      }
    },
    { "nodeId": "rework-notice", "type": "agent", "config": { "agentId": "rework-agent-v1", "blocking": true } }
  ],
  "edges": [{ "from": "manager-approval", "to": "rework-notice", "when": "output.decision == 'reject'" }],
  "loops": [{ "loopId": "rework", "entryNodeId": "rework-notice", "bodyNodeIds": ["rework-notice"], "maxIterations": 3 }]
}
```

`onReject` and top-level `loops[]` are not part of the schema (unknown fields are rejected), `when` is only valid with `on: "custom"` and must be a JSON-AST string, the agent node has neither `url` nor `urlPath`, and `blocking: true` agents are rejected at run time.

**Correct (the minimal valid workflow from the docs):**

```json
{
  "definitionId": "doc-signoff",
  "name": "Document sign-off",
  "nodes": [
    {
      "nodeId": "manager-approval",
      "type": "human",
      "config": { "reviewers": [{ "userId": "u_manager_01", "mandatory": true }] }
    },
    {
      "nodeId": "rework-notice",
      "type": "agent",
      "config": { "agentId": "rework-agent-v1", "urlPath": "documentUrl" }
    }
  ],
  "edges": [
    { "from": "manager-approval", "to": "rework-notice", "on": "reject" }
  ]
}
```

Approving has no outgoing edge, so the run completes after approval. Rejecting routes to the agent.
**Building blocks**
| Term | What it is |
|---|---|
| Definition | `nodes` (1 to 100) + `edges` (0 to 500) + optional `groups` (0 to 100), `triggers` (0 to 50), `webhookConfig`, `scope`, `tags` (0 to 20), `custom`. `definitionId` matches `^[a-z0-9][a-z0-9-]{2,63}$`. |
| Node | One step. `nodeId` (1 to 64 chars, unique), `type`, `config` (validated strictly per type; unknown fields rejected). |
| Edge | "When this node finishes, start that one." Carries an `on` role. See `concepts-edge-model`. |
| Group | Members that run in parallel and share an approval quorum. See `concepts-groups-quorum`. |
| Execution | One live run of a definition, with an `executionId` and a `steps[]` array. |
| Step | One runtime instance of a node inside an execution. |
**Fields every node accepts**
| Field | Notes |
|---|---|
| `slaMs` | Deadline for the step, up to 7 days. Needs a breach route (see `concepts-edge-model`). |
| `requireNonEmptyOutput` | Effective on sync `webhook` nodes only: fails the step with `webhook-node-empty-response` on an empty body. Accepted with no runtime effect elsewhere. |
| `name` | Cosmetic label, 1 to 200 chars. |
| `description` | Cosmetic, up to 2000 chars. |
**Node types (all four run)**
| Type | What it does | Parks in `waiting`? | Rule |
|---|---|---|---|
| `agent` | Runs a Velt agent against a URL, then routes on the result. | Yes, while the agent runs; resumes on its own. | `concepts-agent-node` |
| `human` | Waits for reviewers to approve or reject. | Yes, until you record decisions. | `concepts-human-node` |
| `notification` | Sends an email or Slack message built from the previous step's output. | No. | `concepts-notification-webhook-nodes` |
| `webhook` | Calls your own HTTPS endpoint. | Only in `mode: "async"`, until your callback. | `concepts-notification-webhook-nodes` |
The graph is a DAG. The single exception is a reject edge marked with `loop` that points back to an ancestor, which creates a bounded revision loop.

**Lifecycles:**

```text
Execution:  pending -> running -> completed | failed | cancelled
Step:       pending -> running -> (waiting) -> completed | failed | skipped | cancelled | breached
```

`waiting` applies to running agent steps (resume on their own), human steps (resume when decisions are recorded), and async webhook steps (resume on your callback).

**Step IDs (deterministic, so retries land on the same record):**

```text
Root step, no incoming edges:   step_<nodeId>_<timestamp>_<rand>
Per-edge fan-out:               <parentStepId>__to__<childNodeId>
Group-owned fan-out:            group_<groupId>__to__<childNodeId>
```

**Ways to start a run:** your backend calls `/executions/dispatch`, or a `triggers[]` entry starts runs for you (inbound webhook, cron schedule, or installed GitHub / Vercel app). See `rest-executions` and `concepts-triggers`.
**Scope:** `scope.level` is `apiKey` (default, workspace-wide), `organization` (one `organizationId`), or `document` (one `documentId` under an organization). Scope does NOT select between definitions: you always dispatch a specific `definitionId`, and `/definitions/list` returns every level. Scope sets the `organizationId` / `documentId` that trigger-started runs inherit.
**Versioning:** every update bumps `version`. A run pins the version that was current at dispatch (`definitionVersion`) and finishes on it; edits never migrate in-flight runs. Old versions cannot be read and there is no rollback (see `patterns-copy-update-versioning`).
**Tenant partitioning:** state is partitioned per tenant (`storeDbId`); each tenant's definitions, executions, and events live in that tenant's own database. Never assume an `executionId` or `definitionId` is portable across tenants or API keys.
**Beta limitations (from the overview)**
- Definitions are authored as JSON; there is no visual builder.
- You host the reviewer UI: render the waiting step and call `recordReviewerDecision`.
- `blocking: true` on an agent node is rejected at run time; put a `human` node downstream instead.
- Editing a definition affects only new runs.

---

### 1.7 Use notification nodes for email or Slack and webhook nodes for sync or async calls to your API

**Impact: MEDIUM-HIGH (Webhook nodes are a live step type with sync and async modes; treating them as deferred, or completing async steps without the callback token, leaves runs parked in waiting)**

Two node types let a workflow talk to the outside world without extra cloud functions. A `notification` node sends an email or Slack message built from the previous step's output. A `webhook` node calls your HTTPS endpoint as a workflow step, either waiting for the response (`sync`) or parking until your system calls back (`async`). Both run today; the old "webhook node is deferred" guidance no longer applies.

**Incorrect:**

```json
[
  {
    "nodeId": "notify",
    "type": "notification",
    "config": { "channel": "email", "format": "slack-blocks", "bodyTemplate": "Decision: ${input.decision}" }
  },
  {
    "nodeId": "erp-sync",
    "type": "webhook",
    "config": { "url": "http://10.0.0.5/hook", "authMode": "token", "requestHeaders": { "x-velt-signature": "x" } }
  }
]
```

Email without `recipients`, `slack-blocks` on email, `${...}` instead of `{{...}}` interpolation, a non-https private URL, `authMode: "token"` without `authTokenHeader`, and a reserved `x-velt-*` header.

**Correct:**

```json
[
  {
    "nodeId": "notify-stakeholders",
    "type": "notification",
    "config": {
      "channel": "email",
      "recipients": ["lead@acme.dev", "pm@acme.dev"],
      "subjectTemplate": "Approval {{input.decision}} for {{execution.triggerContext.page.title}}",
      "bodyTemplate": "Findings: {{input.agentResultsSummary.summary}}",
      "format": "text"
    }
  },
  {
    "nodeId": "erp-sync",
    "type": "webhook",
    "config": {
      "url": "https://erp.acme.com/hooks/approval",
      "mode": "async",
      "authMode": "token",
      "authTokenHeader": "x-erp-token",
      "timeoutMs": 15000
    }
  }
]
```

For `authMode: "token"`, pass the token at dispatch time in `triggerContext.webhookAuth["erp-sync"]` so the secret never lives in the definition.
**Notification node `config`**
| Field | Notes |
|---|---|
| `channel` | Required. `email` or `slack`. |
| `bodyTemplate` | Required. 1 to 16000 chars, `{{dot.path}}` interpolation. |
| `recipients` | Required for `email`. 1 to 50 addresses. |
| `subjectTemplate` | Email subject, up to 2000 chars. |
| `slackTarget` | Required for `slack`. Channel id (such as `C0123`) or an `https` incoming-webhook URL. |
| `format` | `text` (default), `html`, or `slack-blocks` (Slack only; the rendered body must be a JSON array of Block Kit blocks). |
Templating is dot-path substitution only, with no code execution. Missing tokens render empty; objects and arrays are JSON-stringified. Roots: `input.*` (previous step's output), `execution.*` (`executionId`, `definitionId`, `correlationId`, `triggerContext`), `step.*` (this step's metadata).
Delivery: email goes through your workspace's SendGrid configuration; delivering to at least one recipient completes the step, none fails and retries. Slack to a channel id needs a workspace bot token. Slack config errors (`channel_not_found`, `invalid_auth`) are terminal; 5xx, network errors, and `rate_limited` are retried.
**Webhook node `config`**
| Field | Notes |
|---|---|
| `url` | Required. `https` only, host-allowlisted, up to 2000 chars. |
| `mode` | `sync` (default) or `async`. |
| `method` | `GET` or `POST` (default). |
| `authMode` | `hmac` (default), `token`, or `none`. |
| `authTokenHeader` | Required when `authMode: "token"`. |
| `timeoutMs` | 1000 to 60000. Default 10000. |
| `expectedStatusCodes` | Up to 20 codes treated as success instead of 2xx. |
| `bodyTemplate` | `envelope` (default), `pass-through`, or `none` (`none` requires `method: "GET"`). |
| `requestHeaders` | Extra headers. `x-velt-*` and reserved names are rejected. |
- **`sync`:** 2xx (or a listed `expectedStatusCodes` value) completes the step. 4xx fails it terminally. 5xx, timeout, or network error fails it with retry budget remaining. Set node-level `requireNonEmptyOutput: true` to fail on an empty body (`webhook-node-empty-response`).
- **`async`:** the engine posts, then parks the step in `waiting`. The `envelope` body carries `callback.url`, `callback.token`, `callback.tokenHeader`; `pass-through` nests them as `_velt.callbackUrl`, `_velt.callbackToken`, `_velt.callbackTokenHeader`. Complete the step by POSTing to the callback URL with the token in `x-velt-callback-token` and a body of `{ "status": "completed" | "failed", "output"?: {}, "error"?: {} }`. Async mode needs a `webhookSecret` on the execution to sign the callback token.
- **`hmac`:** the engine signs the outbound body with the execution's `webhookSecret` in `x-velt-signature` (verify it the same way as outbound event deliveries, see `webhooks-delivery`).
- **Output:** `httpStatus`, allowlisted `responseHeaders`, `responseJson` for JSON responses, and `responseText` capped at 64 KB.

**Async callback from your system (Node.js):**

```javascript
// payload is the envelope body the engine POSTed to your webhook node URL
await fetch(payload.callback.url, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-velt-callback-token': payload.callback.token,
  },
  body: JSON.stringify({ status: 'completed', output: { erpRecordId: 'PO-1042' } }),
});
```

---

## 2. REST Endpoints

**Impact: HIGH**

The 14 enveloped POST endpoints under `/v2/workflow/*`: foundations (headers, `data`/`result`/`error` envelope, error codes, linter failures parsed from `error.message`, schema messages); definitions (create, update as a full replace with `ifVersion`, get with `compiled`, list with `pageSize`/`cursor`, soft or purge delete, 19 linter codes plus edge-contract rules); executions (dispatch with `idempotencyKey` and webhook pair, get, list, no-op cancel on terminal runs, `getEvents` with `sinceSeq`); steps (`recordReviewerDecision` with `recorded`/`rejectionReason`, unavailable `recordAgentResolution`, `cancel`, action-based `resolve`); and the object reference (`ExecutionView`, `StepView`, `DefinitionView`, `CompiledGraph`, `ApprovalEventView`, step outputs).

### 2.1 Dispatch executions with idempotencyKey and use get, list, cancel, and getEvents with sinceSeq correctly

**Impact: HIGH (Missing idempotencyKey on dispatch duplicates runs on retry; list items carry no steps and cancel is a no-op on terminal runs, so code written for the old shapes misreads both)**

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

---

### 2.2 Drive steps with recordReviewerDecision, cancel, and action-based resolve (recordAgentResolution is unavailable in beta)

**Impact: HIGH (recordReviewerDecision reports most problems as recorded false instead of an error, and resolve actions differ in allowed states, node types, and whether they feed loop predicates)**

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

---

### 2.3 Manage definitions with create, full-replace update with ifVersion, get, list, delete, and the linter reference

**Impact: HIGH (Update replaces the whole definition (omitted scope resets to apiKey), round-tripped nulls and server-owned fields fail validation, and 19 linter codes plus edge-contract errors reject bad graphs)**

A definition is the versioned blueprint of a workflow. Five `POST` endpoints under `/v2/workflow/definitions/*` manage it. The two traps are that update is a full replace (not a patch) and that a read response cannot be sent back verbatim. Shapes for nodes, edges, groups, and triggers are in the `concepts-*` rules.

**Incorrect (partial patch, no lock, scope silently reset):**

```json
{ "data": { "definitionId": "marketing-copy-approval", "name": "Marketing copy approval v2" } }
```

`ifVersion`, `name`, `nodes`, and `edges` are required on update, and any field you omit (including `scope`, `triggers`, and `webhookConfig`) is not preserved.

**Correct (read, edit, strip, resend everything with `ifVersion`):**

```javascript
const current = await workflowApi('definitions/get', { definitionId: 'marketing-copy-approval' }, creds);

const { version, createdAt, updatedAt, status, compiled, ...authored } = current;
const stripNulls = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null));
const body = stripNulls({ ...authored, scope: stripNulls(authored.scope) });

body.name = 'Marketing copy approval (Q2 revision)';
// webhookConfig is write-only (never returned by get); re-send it or it is cleared
body.webhookConfig = { url: 'https://hooks.acme.com/velt/approvals', secret: process.env.WF_SECRET };

await workflowApi('definitions/update', { ...body, ifVersion: version }, creds);
```

**Create** (`/definitions/create`): required `definitionId` (`^[a-z0-9][a-z0-9-]{2,63}$`), `name` (1 to 200), `nodes` (1 to 100), `edges` (0 to 500). Optional `description` (up to 2000), `scope` (default `{ level: "apiKey" }`), `groups` (0 to 100), `triggers` (0 to 50), `webhookConfig` (`{ url, secret, eventTypes? }`), `tags` (0 to 20, each up to 64 chars), `custom`, and top-level `organizationId` / `documentId` (required for `organization` / `document` scope). Returns a `DefinitionView` with `version: 1` and `status: "active"`. Errors: `INVALID_ARGUMENT`, `ALREADY_EXISTS`.
**Update** (`/definitions/update`): every create field plus required `ifVersion`. A stale `ifVersion` fails with `FAILED_PRECONDITION` (`Version conflict: expected 4, current 5`); re-read and re-apply, never blind-retry. Omitting `scope` demotes an organization- or document-scoped definition to `apiKey`. Updating `triggers` replaces the array. In-flight runs keep their pinned version. Errors: `NOT_FOUND`, `FAILED_PRECONDITION`, `INVALID_ARGUMENT`.
**Round-tripping a read:** strip `version`, `createdAt`, `updatedAt`, `status`, `compiled`, and every `null` (`description`, `groups`, `triggers`, `tags`, `custom`, and `scope.organizationId` / `scope.documentId`). A leftover null or server-owned field fails with `INVALID_ARGUMENT`. `edges` and `scope` IDs round-trip exactly as you sent them.
**Get** (`/definitions/get`): `{ definitionId }`. `organizationId` / `documentId` are accepted but ignored. Returns `DefinitionView` (including the read-only `compiled` block, excluding `webhookConfig`). Tombstoned definitions return `NOT_FOUND`.

**List (`/definitions/list`):**

```json
{ "data": { "pageSize": 50, "cursor": 1714300000000 } }
// { "result": { "items": [DefinitionView], "nextCursor": 1714200000000 } }
```

`pageSize` 1 to 500 (default 50); `cursor` is the previous `nextCursor` (an integer, the last item's `updatedAt`). Returns active definitions ordered by `updatedAt` DESC across every scope; there are no scope, status, or tag filters, so filter `item.scope` client-side. Loop until `nextCursor` is `null`.
**Delete** (`/definitions/delete`): `{ definitionId, purge? }`. Default is a soft delete (tombstone: hidden from get/list, cannot be dispatched); `purge: true` also removes version snapshots. Returns `{ deleted: true, purged, definitionId }`. Fails with `FAILED_PRECONDITION` while in-flight runs exist. The `definitionId` is reusable afterwards and restarts at `version: 1`.

**Linter codes (19), in `error.message`:**

```text
Graph:   duplicate-node-id, dangling-edge, cycle-detected (only marked reject loop-backs may revisit),
         unreachable-node, node-missing-config, missing-breach-edge
Groups:  group-duplicate-id, group-members-empty, group-member-missing, group-expected-steps-invalid,
         group-quorum-invalid, group-cancelonquorum-requires-quorum-lt-expected,
         group-joinonquorum-members-must-share-successors, group-required-not-in-members,
         group-required-exceeds-quorum, group-node-in-multiple-groups
Loops:   loop-node-in-multiple-loops (overlapping reject back-edges; use one group-source back-edge),
         loop-body-must-have-single-terminal, loop-group-bounded-quorum-must-equal-expected
```

**Edge-contract rules** (the message carries the rule text; the doc names are internal): custom without `when`, `when` on a non-custom edge, `loop` on a non-reject edge, a loop-back whose `to` is not an ancestor, a reject to an ancestor without `loop`, `exhausted` without a sibling loop-back, a human node with no reject edge, an agent node without `url` / `urlPath`, group-to-group edges, forward reject from a `joinOnQuorum` / `cancelOnQuorum` group, a group reject loop-back on a non-`joinOnQuorum` group, and a trigger entry with more than one mechanism.
The linter does not check run-time feasibility; surface its codes to the author instead of retrying.

---

### 2.4 Type responses against ExecutionView, StepView, DefinitionView with compiled, ApprovalEventView, and step output shapes

**Impact: MEDIUM (Exact field shapes returned by the read endpoints and embedded in step outputs; StepView.nodeType now has four values and DefinitionView carries a read-only compiled block)**

These interfaces are the canonical shapes from the docs' Object reference. Type client code against them rather than hand-rolled guesses; in particular, branch on `StepView.nodeType` (four values) before reading `output`.

**Incorrect:**

```typescript
interface StepView { nodeType: 'agent' | 'human'; status: string; output: any } // misses notification and webhook
const graph = expandGroupsAndRoles(definition.edges, definition.groups);        // re-implements the compiler; read definition.compiled
```

**Correct:**

```typescript
interface ExecutionView {
  executionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: number;             // epoch ms
  completedAt: number | null;
  cancelledAt: number | null;
  definitionId: string;
  definitionVersion: number;     // pinned at dispatch
  correlationId: string;
  idempotencyKey: string;
  failureReason: { code: string; message: string } | null;
  steps: StepView[];             // [] in /executions/list items
}

interface StepView {
  stepId: string;
  nodeId: string;
  nodeType: 'agent' | 'human' | 'notification' | 'webhook';
  status: 'pending' | 'running' | 'waiting' | 'completed' | 'failed' | 'skipped' | 'cancelled' | 'breached';
  groupId: string | null;
  startedAt: number | null;
  completedAt: number | null;
  output: Record<string, unknown>;
  error: { code: string; message: string } | null;
}

interface DefinitionView {
  definitionId: string;
  name: string;
  description: string | null;
  version: number;
  scope: { level: 'apiKey' | 'organization' | 'document'; organizationId: string | null; documentId: string | null };
  nodes: NodeView[];
  edges: EdgeView[];             // exactly as authored
  groups: ParallelGroupDef[] | null;
  compiled: CompiledGraph;       // read-only, server-derived
  triggers: WorkflowTriggerConfig[] | null;
  tags: string[] | null;
  custom: Record<string, unknown> | null;
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'tombstoned';
  // webhookConfig is write-only and never returned
}

type JsonAst = Record<string, unknown>;

interface CompiledGraph {
  forwardEdges: CompiledForwardEdge[];
  loops: CompiledLoopRegion[];
}

interface CompiledForwardEdge {
  from: string;
  to: string;
  role: 'approve' | 'reject' | 'always' | 'exhausted' | 'custom';
  when: JsonAst | null;          // null for always
  fromGroupId?: string;
  toGroupId?: string;
}

interface CompiledLoopRegion {
  loopId: string;
  entryNodeId: string;
  bodyNodeIds: string[];
  maxIterations: number;
  onExhausted: { routeToNodeId: string } | null;
}

interface ApprovalEventView {
  eventId: string;
  seq: number;                   // monotonic per execution
  type: string;                  // external event type, see webhooks-delivery
  stepId: string | null;
  timestamp: number;             // epoch ms
  correlationId: string;
  data?: Record<string, unknown>;
}
```

**Human step `output` (after resume):**

```typescript
{
  reviewers: Array<{ userId: string; mandatory: boolean }>;
  reviewerIds: string[];
  reviewerEmails: string[];
  commentBody: string | null;
  aggregatorStatus: 'resolved' | 'rejected';
  approveCount: number;
  rejectCount: number;
  totalResponses: number;
  mandatoryCount: number;
  mandatoryApproveCount: number;
  decision: 'approve' | 'reject';
  approved: boolean;
  resumedAt: number;
  resumeKey: string;
}
```

**Other step outputs (documented keys)**
- Agent: `agentExecutionStatus`, `agentResultsSummary`, `resolvedUrl`, `agentDurationMs`, and `decision` (`approve` when the agent passed).
- Webhook (on success): `httpStatus`, allowlisted `responseHeaders`, `responseJson` (JSON responses), `responseText` (up to 64 KB).
- Loop entry step input on iteration N+1: `{ iteration, loopId, previousAttempts[] }` (see `concepts-edge-model`).
- Steps completed via `/steps/resolve`: `overriddenAt` is added.

**`joinOnQuorum` successor input:**

```typescript
{
  groupOutputs: Record<string /* memberNodeId */, Record<string, unknown>>;
  groupId: string;
  quorum: number;
  totalApproved: number;
}
```

`decision` / `approved` are what `on: "approve"` / `on: "reject"` edges and quorum counting key off. A step's `{ code, message }` error lives on `StepView.error`, not in event `data`.

---

### 2.5 Use the shared auth headers, data envelope, error codes, and linter-failure parsing on every Approval Engine endpoint

**Impact: HIGH (Every endpoint shares the same headers, envelope, and error vocabulary; linter codes arrive inside error.message (not error.details), so code that reads details sees nothing)**

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

---

## 3. Webhooks

**Impact: HIGH**

Outbound delivery (`webhooks-delivery`): `webhookConfig` on the definition versus the per-dispatch `webhookUrl` + `webhookSecret` override, HMAC-SHA256 verification on raw bytes, the `x-velt-*` headers, the 12-event catalog with per-node-type `data`, retry schedule to dead-letter, and idempotency on `(executionId, seq)`. Inbound trigger (`webhooks-inbound-handler`): the raw-JSON `/v2/workflow/webhook-inbound/trigger` endpoint with per-trigger secrets, `velt`/`github`/`vercel`/`custom` signature presets, `allowedEvents`, idempotency headers, the 1 MB limit, and no built-in rate limiting or payload URL screening.

### 3.1 Receive webhook deliveries via webhookConfig or per-dispatch receivers with raw-byte HMAC checks, the event catalog, retries, and idempotency

**Impact: HIGH (Hashing re-serialized JSON breaks signature checks, missing (executionId, seq) dedup double-processes retries, and a dispatch-level webhook pair silently replaces the definition's webhookConfig and its eventTypes filter)**

The engine POSTs every externally-visible event to your receiver, signed with HMAC-SHA256 (10 s timeout, no redirects). Configure the receiver on the definition for every run, or on a single dispatch. Verify the signature on the raw request bytes and make the handler idempotent.

**Where to configure the receiver**

| Where | Applies to | Fields |
|---|---|---|
| `webhookConfig` on the definition | Every run of that definition | `{ url, secret, eventTypes? }` (`secret` 16 to 512 chars, `eventTypes` up to 50) |
| `webhookUrl` + `webhookSecret` on dispatch | That one run | Replaces `webhookConfig` for the run (not a second target) and clears any `eventTypes` filter |

Both are `https` only and SSRF-guarded at write time and again at delivery. `webhookConfig` is write-only: `/definitions/get` never returns it, so a get, edit, update round trip clears it unless you re-send it.

**Incorrect:**

```javascript
app.post('/velt/approvals', express.json(), (req, res) => {
  const digest = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex');
  if (`sha256=${digest}` !== req.headers['x-velt-signature']) return res.status(401).end();
  handle(req.body); // no dedup: every retry is processed again
  res.status(200).end();
});
```

Re-serialized JSON never matches the signed bytes, `!==` is not constant-time, and retries are reprocessed.

**Correct (Node.js / Express):**

```javascript
const crypto = require('crypto');
const express = require('express');
const app = express();

function verifyVeltSignature(rawBody, headerValue, secret) {
  const [scheme, hex] = String(headerValue || '').split('=');
  if (scheme !== 'sha256' || !hex) return false;
  const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(hex, 'hex');
  const b = Buffer.from(computed, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

app.post('/velt/approvals', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!verifyVeltSignature(req.body, req.headers['x-velt-signature'], process.env.WEBHOOK_SECRET)) {
    return res.status(401).end();
  }
  const event = JSON.parse(req.body.toString('utf8'));
  const key = req.headers['x-velt-event-id'] || `${event.executionId}:${event.seq}`;
  if (await store.seen(key)) return res.status(204).end();
  await processAndRecord(key, event); // switch on event.type
  res.status(204).end();
});
```

**Delivery headers:** `x-velt-signature` (`sha256=<hex>` of the raw body), `x-velt-event-id` (stable across retries), `x-velt-attempt` (0-based). The same `eventId` and `seq` appear on every retry.
**Retry schedule:** initial attempt, then 2 s, 8 s, 32 s, 2 min, 8 min, then dead-letter. Any non-2xx within the 10 s timeout triggers the next attempt. Recover anything dead-lettered with `/executions/getEvents` and `sinceSeq` through the same handler.
**Event catalog (12 external types, also returned by `getEvents`)**
| Event | When | `data` highlights |
|---|---|---|
| `execution.dispatched` | Run created, first steps scheduled | `{ definitionId, definitionVersion, rootStepIds }` |
| `execution.completed` | All steps terminal, no unhandled failure | null |
| `execution.failed` | A step failed or breached with no recovery edge | null |
| `execution.cancelled` | Run cancelled or fully rolled back | `{ reason? }` |
| `step.awaiting-approval` | Step entered `waiting` (human, running agent, async webhook) | Human: `{ waitingForReviewers, mandatoryCount, resumeKey }`. Agent: `{ agentId, agentExecutionId, pollIntervalMs }` |
| `step.completed` | Step completed | Human: `{ aggregatorStatus, nodeType, decision }`. Agent: `{ agentExecutionId, agentExecutionStatus, decision, source }`. `__mock__`: `{ agentId, synthetic, decision }` |
| `step.failed` | Retry budget exhausted, or terminal failure | Human: `{ reason }`. Webhook: `{ httpStatus, latencyMs, retryClass }`. Notification: `{ channel, retryClass }`. Config-validation failures: `{ reason }`. Agent: `{ agentExecutionId, agentExecutionStatus, decision, source }` |
| `step.breached` | Step passed its SLA | `{ reason }` |
| `step.cancelled` | Cancelled directly or by a quorum / loop side effect | `{ actorId, reason }` |
| `group.quorum-met` | Group approval threshold first met | `{ groupId, total, quorum, completedTotal, expectedSteps }` |
| `loop.iteration-started` | Rejected iteration spawned the next one | `{ loopId, iteration, triggeredBy: 'rejection' }` |
| `loop.exhausted` | Loop hit `maxIterations` | `{ loopId, iteration, lastRejectedBy?, lastRejectionReason? }` |
- The `{ code, message }` error object is not in event `data`; route on `event.type`, then read `steps[].error` from `/executions/get`.
- Internal events (`step.scheduled`, `step.started`, `step.retried`, `step.overridden`, and others) consume `seq` numbers but are never delivered, so `seq` gaps are normal.
- `step.cancelled` `data.reason` is an open set: `group-quorum-met` (`actorId: "system:group-quorum"`), `loop-restart` (`actorId: "system:loop-restart"`), or the admin-supplied reason. Switch on `event.type`, not `data.reason`.

---

### 3.2 Send raw JSON to the inbound webhook trigger with per-trigger secrets, provider presets, and your own throttling

**Impact: MEDIUM-HIGH (The inbound trigger endpoint takes raw JSON (no data envelope) and authenticates with the per-trigger secret; it applies no per-source rate limiting and does not screen URLs inside the payload)**

Declaring `inboundWebhook` on a trigger exposes the definition at `POST https://api.velt.dev/v2/workflow/webhook-inbound/trigger`, so an external system can start runs. Unlike every other Approval Engine endpoint, the body is raw JSON with no `{ "data": ... }` envelope, because providers cannot reshape their outgoing bodies. The per-trigger `secret` is the real authenticator; the Velt API key is a publishable client key.

**Incorrect:**

```text
POST https://api.velt.dev/v2/workflow/webhook-inbound/trigger
content-type: application/json
x-velt-api-key: YOUR_API_KEY

{ "data": { "definitionId": "ci-review", "triggerId": "ci-build", "payload": { "sha": "abc123" } } }
```

The `data` envelope is wrong for this endpoint, and nothing is signed with the trigger secret, so verification fails.

**Correct (provider `velt`, HMAC):**

```javascript
const crypto = require('crypto');

const body = JSON.stringify({
  definitionId: 'ci-review',
  triggerId: 'ci-build',
  payload: { sha: 'abc123', branch: 'main' }, // becomes triggerContext
});
const signature = 'sha256=' + crypto.createHmac('sha256', process.env.TRIGGER_SECRET).update(body).digest('hex');

await fetch('https://api.velt.dev/v2/workflow/webhook-inbound/trigger', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-signature': signature,
  },
  body,
});
```

**Trigger config (`inboundWebhook`)**
| Field | Notes |
|---|---|
| `authMode` | Required. `hmac` (body signature) or `bearer` (`Authorization: Bearer <secret>`, `velt` provider only). |
| `secret` | Required. 16 to 512 chars. |
| `provider` | `velt` (default), `github`, `vercel`, or `custom`. Any non-`velt` provider requires `authMode: "hmac"`. |
| `signatureHeader`, `signatureAlgorithm` (`sha1` / `sha256`), `signaturePrefix`, `eventNameHeader` | `custom` provider only. `hmac` + `custom` requires `signatureHeader` and `signatureAlgorithm`. |
| `allowedEvents` | 1 to 50 event names. Non-matching events return HTTP 200 `{ ok: false, code: "event-ignored" }`. If the event name cannot be resolved, the event is dropped (fails closed). |
| `idempotencyHeader` / `idempotencyBodyPath` | Where to read the source event id. |
| `payloadMapping` | `pass-through` (default) or `wrap` (nests the payload under `source`). |
**Provider presets**
| `provider` | Signature header | Algorithm | Prefix | Event name from |
|---|---|---|---|---|
| `velt` | `x-velt-signature` | HMAC-SHA256 | `sha256=` | body `type` |
| `github` | `x-hub-signature-256` | HMAC-SHA256 | `sha256=` | `x-github-event` header |
| `vercel` | `x-vercel-signature` | HMAC-SHA1 | none | `x-vercel-deployment-event` header, then body `type` |
| `custom` | `signatureHeader` | `signatureAlgorithm` | `signaturePrefix` | `eventNameHeader` |
**Request rules**
- **API key:** `x-velt-api-key` header, or `?apiKey=` for providers that cannot set headers (the header wins if both are sent).
- **Identifiers:** `definitionId` and `triggerId` in the body for `velt`, or as `?definitionId=` and `?triggerId=` query params (needed for GitHub, Vercel, custom).
- **Body:** JSON object up to 1 MB (larger returns HTTP 413 `body-too-large`). For `velt`, `payload` becomes `triggerContext`; for every other provider the entire body does.
- **Idempotency:** the source event id becomes the run's `idempotencyKey` as `trig:<triggerId>:<id>`, deduplicated for 24 hours. Without one, the engine uses a per-request key, so configure `idempotencyHeader` (for example `x-github-delivery`) or `idempotencyBodyPath`.
- **Responses:** success is `{ ok: true, code: "accepted", executionId, deduplicated }`.
**What the endpoint does NOT do:** it applies no per-source rate limiting (add your own throttling if the source can burst), and URL values inside the payload are not screened. The SSRF allowlist applies only to outbound destinations you configure: webhook node `url`, `webhookConfig.url`, dispatch `webhookUrl`, and a URL-valued `slackTarget`. Validate any URL from the payload before an agent node uses it via `urlPath`.
Keep the surfaces straight: this endpoint pushes events into the engine; outbound delivery (`webhooks-delivery`) pushes run events out to your receiver; a `webhook` node (`concepts-notification-webhook-nodes`) calls your API as a step.

---

## 4. Patterns

**Impact: MEDIUM-HIGH**

Guidance from the Patterns page: which construct to pick for each review requirement, rejection strategies (loop-back with exhausted route, forward reject, group-source rewind) and the anti-patterns that are rejected or misbehave, and how to copy and update definitions safely given full-replace updates, write-only `webhookConfig`, inherited triggers, and versioning without history or rollback.

### 4.1 Copy and update definitions safely and keep version history in source control

**Impact: MEDIUM-HIGH (There is no duplicate endpoint, no readable version history, and no rollback; copies inherit triggers (double runs) and lose webhookConfig, and get-edit-update round trips clear webhookConfig)**

A definition supports create, update, delete, get, and list; copying is manual, and versioning protects concurrent edits and in-flight runs but gives you no history API and no rollback. Treat your own source control as the system of record and the API as the deployment target.

**Incorrect (copy by re-posting the read response):**

```javascript
const original = await workflowApi('definitions/get', { definitionId: 'marketing-page-approval' }, creds);
await workflowApi('definitions/create', { ...original, definitionId: 'marketing-page-approval-eu' }, creds);
```

Server-owned fields (`version`, `createdAt`, `updatedAt`, `status`, `compiled`) and explicit `null`s fail with `INVALID_ARGUMENT`. Even once stripped, the copy keeps the original's triggers (a nightly schedule now fires twice) and has no `webhookConfig`, because get never returns it.

**Correct:**

```javascript
const original = await workflowApi('definitions/get', { definitionId: 'marketing-page-approval' }, creds);

const { version, createdAt, updatedAt, status, compiled, triggers, ...authored } = original;
const stripNulls = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null));

const copy = stripNulls({
  ...authored,
  scope: stripNulls(authored.scope),
  definitionId: 'marketing-page-approval-eu',
  name: 'Marketing page approval (EU)',
  // triggers dropped on purpose; re-add with fresh triggerId values if the copy needs them
  webhookConfig: { url: 'https://hooks.acme.com/velt/eu', secret: process.env.EU_WEBHOOK_SECRET },
});

await workflowApi('definitions/create', copy, creds); // starts at version 1
```

**Copying checklist (four steps):** fetch with get; change `definitionId` (two active definitions cannot share one) and `name`; strip the five server-owned fields and every `null` (`description`, `groups`, `triggers`, `tags`, `custom`, `scope.organizationId`, `scope.documentId`); POST to create. `edges` and `scope` round-trip exactly, so routing cannot change silently.
**Updating:** update is a full replace with required `ifVersion`. Re-send `scope` (omitting it resets to `apiKey`), `triggers` (replaced wholesale), and `webhookConfig` (write-only; a get, edit, update round trip clears it otherwise).
**What versioning gives you**
- `ifVersion` conflicts fail with `FAILED_PRECONDITION` (`Version conflict: expected 4, current 5`) instead of overwriting a coworker's edit.
- Runs pin the version current at dispatch and finish on it; only new runs see the new version.
- Delete and recreate restarts the counter at `version: 1`.
**What it does not give you:** no endpoint lists or reads old versions, no rollback (resubmit your own copy of the old content as a new version), no draft vs live distinction, and no way to dispatch a specific version (new runs always get the latest).

---

### 4.2 Give every human node an explicit reject route and use one group-source back-edge for parallel rewinds

**Impact: HIGH (Per-reviewer back-edges fail with loop-node-in-multiple-loops, slaMs with only a reject edge fails with missing-breach-edge, and an exhausted target with another incoming edge runs twice)**

Every `human` node needs a reject route, and the engine will not let rejection be implicit. There are three shapes: send it back (loop-back with a cap and an exhausted route), send it elsewhere (forward reject edge), or rewind a whole parallel stage (one group-source back-edge). The anti-patterns below look reasonable and are either rejected or misbehave at run time.

**Incorrect (one back-edge per parallel reviewer):**

```json
{
  "edges": [
    { "from": "human-legal",   "to": "agent-draft", "on": "reject", "loop": { "maxIterations": 3 } },
    { "from": "human-brand",   "to": "agent-draft", "on": "reject", "loop": { "maxIterations": 3 } },
    { "from": "human-finance", "to": "agent-draft", "on": "reject", "loop": { "maxIterations": 3 } }
  ]
}
```

Each back-edge derives its own loop region and the bodies overlap: `loop-node-in-multiple-loops`.

**Correct (rewind the whole stage with one shared counter):**

```json
{
  "groups": [{
    "groupId": "compliance-review",
    "memberNodeIds": ["human-legal", "human-brand", "human-finance"],
    "expectedSteps": 3,
    "quorum": 3,
    "onQuorumMet": "joinOnQuorum"
  }],
  "edges": [
    { "from": { "kind": "group", "groupId": "compliance-review" }, "to": "agent-publish", "on": "approve" },
    { "from": { "kind": "group", "groupId": "compliance-review" }, "to": "agent-draft",   "on": "reject", "loop": { "maxIterations": 3 } },
    { "from": { "kind": "group", "groupId": "compliance-review" }, "to": "human-cco",     "on": "exhausted" }
  ]
}
```

A group-source reject back-edge is `joinOnQuorum`-only, and a group-bounded loop body needs `quorum === expectedSteps`.

**Single-reviewer shapes:**

```json
[
  { "from": "human-boss", "to": "agent-publish",        "on": "approve" },
  { "from": "human-boss", "to": "agent-draft",          "on": "reject", "loop": { "maxIterations": 3 } },
  { "from": "human-boss", "to": "human-skip-level-mgr", "on": "exhausted" }
]
```

For "send it somewhere else", replace the loop-back with `{ "from": "human-boss", "to": "human-rework-team", "on": "reject" }`. If rejection should end the run, point the reject edge at a terminal node.
**Anti-patterns**
- **Final human node with no reject edge:** rejected (`every human node must have at least one outgoing edge with on="reject"...`). Route the rejection to a terminal node explicitly.
- **`slaMs` with only a reject edge:** a reject edge never fires on a breach, so the linter returns `missing-breach-edge`. Add an `on: "always"` edge or a custom edge whose `when` tests for `breached`.
- **Per-member reject edges on a `joinOnQuorum` member:** they satisfy the reject-path rule but never fire, because the group owns fan-out. Use `waitAll` or `cancelOnQuorum` for per-rejecter routing.
- **An `on: "exhausted"` target that is reachable another way:** accepted, but if the escalation node is also the target of a normal edge, it is spawned once by that edge and again when the loop hits its cap, with different step ids, so both run. Keep exhausted targets as leaves with no other incoming edges and chain from them.
- **Driving loop rejections through `/steps/resolve`:** `reviewer-reject` and `force-reject` do not set `rejectorMandatory`, so the loop does not iterate. Use `recordReviewerDecision`.
- **No exhausted edge:** allowed, but an exhausted loop then fails the execution. Add one if the cap should escalate instead.

---

### 4.3 Pick the construct that matches the review requirement before writing the definition

**Impact: MEDIUM-HIGH (Most broken workflows pass the linter but use the wrong construct (waitAll where joinOnQuorum was meant, a blocking agent where a downstream human node was meant, polling without webhooks))**

The docs' Patterns page maps each review requirement to one construct. Choosing from this table first avoids definitions that validate but behave wrongly, such as a publish step that runs once per approver.

**Incorrect (requirement: "two of three approvals, then publish once"):**

```json
{
  "groups": [{ "groupId": "g", "memberNodeIds": ["legal", "brand", "finance"], "expectedSteps": 3, "quorum": 2 }],
  "edges": [
    { "from": "legal", "to": "publish" },
    { "from": "brand", "to": "publish" },
    { "from": "finance", "to": "publish" }
  ]
}
```

Default `waitAll` keeps per-member fan-out, so `publish` runs once per approver and the third reviewer is never released.

**Correct:**

```json
{
  "groups": [{ "groupId": "g", "memberNodeIds": ["legal", "brand", "finance"], "expectedSteps": 3, "quorum": 2, "onQuorumMet": "joinOnQuorum" }],
  "edges": [
    { "from": { "kind": "group", "groupId": "g" }, "to": "publish", "on": "approve" }
  ]
}
```

Each human member still needs a reject route (see `patterns-rejection-and-loops`).
**I want X, use Y**
| You want to model | Use |
|---|---|
| One reviewer; on reject retry up to N times, then escalate | `on: "reject"` back-edge with `loop.maxIterations`, plus a sibling `on: "exhausted"` edge |
| One reviewer; on reject hand off to another team | `on: "reject"` forward edge |
| Parallel reviewers, all must approve, any rejection rewinds the stage | `joinOnQuorum` group, `quorum === expectedSteps`, one group-source reject back-edge |
| 2 of 3 is enough, stop bothering the third | `cancelOnQuorum` |
| 2 of 3 is enough, then run the next step exactly once | `joinOnQuorum` |
| Everyone finishes, then one collective approve or reject path | `waitAll` group as edge source with `on: "approve"` and `on: "reject"` branches |
| Specific people must approve regardless of count | `requiredNodeIds` |
| Human sign-off on an agent's findings | `agent` node with a `human` node downstream (not `blocking: true`) |
| Respond within 24 hours or escalate | `slaMs` plus an `on: "always"` edge or a custom breach edge |
| Real-time notification on every state change | `webhookUrl` + `webhookSecret` on dispatch |
| Same receiver for every run of a definition | `webhookConfig` on the definition |
| Catch up after a missed webhook | `/executions/getEvents` with `sinceSeq` |
| A step calls your API and continues on the response | `webhook` node, `mode: "sync"` |
| A step hands off to a slow external system and waits | `webhook` node, `mode: "async"` |
| An external system starts a run | trigger with `inboundWebhook` |
| A run on a schedule | trigger with `schedule` |
| GitHub or Vercel events start runs, no per-repo setup | trigger with `appTrigger` |
| Email or Slack from inside the workflow | `notification` node |
| Admin acts on a reviewer's behalf, visible in the audit log | `/steps/resolve` with `reviewer-approve` / `reviewer-reject` |
| Admin finishes a step with no approve / reject concept | `/steps/resolve` with `force-complete` / `force-fail` |
**Webhooks or polling:** they are complementary. Use webhooks for liveness and `getEvents` with `sinceSeq` for recovery; polling alone suits a read-only tool that should not host an HTTPS receiver.

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/ai/approval-engine/overview
- https://docs.velt.dev/ai/approval-engine/setup
- https://docs.velt.dev/ai/approval-engine/customize-behavior
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/definitions/create-definition
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/executions/dispatch-execution
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/steps/record-reviewer-decision
- https://docs.velt.dev/ai/approval-engine/customize-behavior#inbound-webhook-trigger
- https://docs.velt.dev/ai/approval-engine/patterns
- https://docs.velt.dev/ai/approval-engine/customize-behavior#agent-nodes
- https://docs.velt.dev/ai/approval-engine/customize-behavior#triggers
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/steps/resolve-step
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/execution/run
