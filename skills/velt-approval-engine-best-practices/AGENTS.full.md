# Velt Approval Engine Best Practices

**Version 1.0.0**  
Velt  
May 2026

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
   - 1.1 [Approval Engine workflow model — nodes, edges, groups, quorum policies, loop regions, and step IDs](#11-approval-engine-workflow-model-nodes-edges-groups-quorum-policies-loop-regions-and-step-ids)

2. [REST Endpoints](#2-rest-endpoints) — **HIGH**
   - 2.1 [Approval Engine REST foundations — auth headers, envelope, canonical error codes, and schema-validation messages](#21-approval-engine-rest-foundations-auth-headers-envelope-canonical-error-codes-and-schema-validation-messages)
   - 2.2 [Definitions endpoints — create, update (ifVersion), get, list, delete; full linter rule reference](#22-definitions-endpoints-create-update-ifversion-get-list-delete-full-linter-rule-reference)
   - 2.3 [Executions endpoints — dispatch (idempotencyKey, webhookUrl), get, list, cancel, getEvents](#23-executions-endpoints-dispatch-idempotencykey-webhookurl-get-list-cancel-getevents)
   - 2.4 [Object reference — ExecutionView, StepView, DefinitionView, ApprovalEventView, and the human / joinOnQuorum payload shapes](#24-object-reference-executionview-stepview-definitionview-approvaleventview-and-the-human-joinonquorum-payload-shapes)
   - 2.5 [Steps endpoints — recordReviewerDecision, recordAgentResolution, cancel (admin), resolve (admin)](#25-steps-endpoints-recordreviewerdecision-recordagentresolution-cancel-admin-resolve-admin)

3. [Webhooks](#3-webhooks) — **HIGH**
   - 3.1 [Webhook delivery — HMAC verification on raw bytes, payload shape, event catalog with data highlights, retry schedule, idempotency on (executionId, seq)](#31-webhook-delivery-hmac-verification-on-raw-bytes-payload-shape-event-catalog-with-data-highlights-retry-schedule-idempotency-on-executionid-seq)

---

## 1. Concepts

**Impact: HIGH**

The workflow model — what a definition is, how nodes (`agent` / `human`) connect via edges, how groups model parallel quorum, how the three `onQuorumMet` policies (`waitAll` / `cancelOnQuorum` / `joinOnQuorum`) drive fan-out, the `onReject` shorthand (Form A: routeToNodeId; Form B: loopBack) and strict-mode requirement, top-level `loops[]` (loopId, entryNodeId, bodyNodeIds, maxIterations 1–20, previousAttempts threading), `reviewerEmails` (0–50, surfaces in step output), `commentBody` (stored on output only — application must surface to reviewers), the deterministic stepId formats, and the execution/step status flows. Read this before any REST rule — the endpoint payloads carry these shapes verbatim.

### 1.1 Approval Engine workflow model — nodes, edges, groups, quorum policies, loop regions, and step IDs

**Impact: HIGH (Every REST payload carries these shapes; misunderstanding them produces either INVALID_ARGUMENT linter failures at create time or stuck-forever executions at runtime)**

An Approval Engine **definition** is a static, versioned blueprint composed of three things: **nodes** (work units), **edges** (transitions between them), and **groups** (parallel sets with quorum). The same shapes appear in `/definitions/create`, `/definitions/update`, and `/definitions/get` responses — there is no separate schema language.

Understanding these shapes first makes the REST endpoints obvious. Skipping the model and copy-pasting endpoint payloads is the most common path to `INVALID_ARGUMENT` linter rejections and workflows that park forever waiting on a quorum that can never be satisfied.

**Node types overview:**

```typescript
agent      Runs an agent. Non-blocking by default (completes asynchronously without a
           decision). With blocking: true, parks in "waiting" until external resolutions
           arrive via /steps/recordAgentResolution.

human      Requires reviewer approval. Drives via /steps/recordReviewerDecision. Parks in
           "waiting" until aggregator resolves.
```

**Agent node shape:**

```json
{
  "nodeId": "brand-check",
  "type": "agent",
  "config": {
    "agentId": "brand-agent-v1",
    "blocking": false,
    "requireNonEmptyOutput": true,
    "promptOverride": "...",
    "inputMapping": { "...": "..." },
    "agentMaxRuntimeMs": 86400000
  },
  "slaMs": 3600000
}
```

Agent node config fields: `agentId` (required), `promptOverride` (≤ 8000 chars), `inputMapping` (object), `blocking` (default false), `resolutionPolicy` (**required when `blocking: true`**: `{ kind: "allResolved" | "minResolved", minCount?: integer }`; `minCount` is required when `kind === "minResolved"`), `agentMaxRuntimeMs` (≤ 86_400_000 / 24h), `requireNonEmptyOutput` (boolean).

**Human node shape (new — preferred):**

```json
{
  "nodeId": "human-legal",
  "type": "human",
  "config": {
    "reviewers": [{ "userId": "u_legal_01", "mandatory": true }],
    "reviewerEmails": ["legal@example.com"],
    "commentBody": "Please review for legal compliance.",
    "onReject": { "routeToNodeId": "human-escalate" }
  }
}
```

Exactly one of `reviewers[]` (preferred) or `reviewerIds[]` (legacy) must be provided. Both are accepted by the engine — `reviewerIds[]` is kept for back-compat. Supplying both at once is rejected with `cannot set both reviewerIds and reviewers — use one`. The `reviewers[]` form must include at least one `mandatory: true`, and userIds must be unique.
`reviewerEmails` (optional, 0–50 string entries) stores email addresses alongside the `reviewers[]` list. The value surfaces in the human step's `output.reviewerEmails` after the step resumes — use it to drive downstream notification UIs. The engine does not validate that emails correspond to configured reviewers.
`commentBody` (optional, ≤ 8 000 chars) is stored on the human step's `output` for use by your reviewer-facing UI. The engine does NOT auto-create a Velt annotation or comment thread per human step in v1 — your application is responsible for surfacing this string to reviewers and, if you use the legacy comment-resolution flow, for creating the comment thread the reviewer replies to.

**Correct (Form A — route on reject):**

```json
{
  "nodeId": "human-review",
  "type": "human",
  "config": {
    "reviewers": [{ "userId": "u1", "mandatory": true }],
    "onReject": { "routeToNodeId": "human-escalate" }
  }
}
```

Form A synthesizes a reject-gated edge from this node to `routeToNodeId`.

**Correct (Form B — loop back on reject):**

```json
{
  "nodeId": "human-review",
  "type": "human",
  "config": {
    "reviewers": [{ "userId": "u1", "mandatory": true }],
    "onReject": {
      "loopBack": {
        "toNodeId": "agent-draft",
        "maxIterations": 3,
        "onExhausted": { "routeToNodeId": "human-final-call" }
      }
    }
  }
}
```

Form B synthesizes a top-level loop region with `entryNodeId = toNodeId`. `maxIterations` defaults to 5 (range 1–20). `onExhausted.routeToNodeId` specifies the node spawned when the cap is reached; omitting it causes the execution to fail on exhaustion. A custom `when` predicate may be specified; the default is mandatory-reject.
**Strict-mode requirement:** every `human` node must satisfy one of the following, or the definition is rejected with `INVALID_ARGUMENT`:
- `config.onReject` is set (either form), OR
- the node is a `bodyNodeIds` member of a top-level `loops[]` entry.
The engine desugars `onReject` at write time — it strips `onReject` from the stored config and appends the synthesized edges or loop region to the top-level arrays. `GET /definitions/get` returns this canonical (desugared) form. Note: `onReject.routeToNodeId` set on a `joinOnQuorum` group member is dead code at runtime — the group container owns fan-out on quorum, so the per-member route is never fired.

**Correct (top-level loops[] declaration):**

```json
{
  "loops": [
    {
      "loopId": "draft-revision",
      "entryNodeId": "agent-draft",
      "bodyNodeIds": ["agent-draft", "human-legal", "human-brand"],
      "onIterationReject": {
        "when": "{\"op\":\"and\",\"args\":[...]}"
      },
      "onExhausted": { "routeToNodeId": "human-escalate" },
      "maxIterations": 5
    }
  ]
}
{
  "iteration": 2,
  "loopId": "draft-revision",
  "previousAttempts": [
    {
      "iteration": 1,
      "authorOutput": {},
      "rejectedBy": "u_legal_01",
      "rejectorMandatory": true,
      "rejectionReason": "missing clause",
      "rejectedAt": 1716000000000
    }
  ]
}
```

`loops[]` fields:
| Field | Type | Required | Notes |
|---|---|---|---|
| `loopId` | string | yes | 1–64 chars. Stable identifier used in loop events. |
| `entryNodeId` | string | yes | Node spawned first on each iteration. Must be in `bodyNodeIds`. |
| `bodyNodeIds` | string[] | yes | 1–50 nodes inside the iteration scope. |
| `onIterationReject.when` | string (JSON-AST) | no | Predicate to trigger iteration N+1. Default: `decision == reject && rejectorMandatory == true`. |
| `onExhausted.routeToNodeId` | string | no | Node spawned when `maxIterations` reached. Omitting causes execution failure on exhaustion. |
| `maxIterations` | integer | yes | 1–20. Hard cap per execution instance. |
**Body-shape constraints:** the body must be one of: (a) a single-terminal sequential subgraph (one node with no outgoing edges inside the body), or (b) a group-bounded body where every member shares a `joinOnQuorum` group with `quorum === expectedSteps`. Violating either shape triggers loop linter codes (see `rest-definitions` rule).
**Critical — loop predicate caveat with `/steps/resolve` reject actions:** the default `onIterationReject.when` predicate is `decision == 'reject' && rejectorMandatory == true`. When a step is resolved via the `/steps/resolve` endpoint with `action: "reviewer-reject"` or `action: "force-reject"`, the engine does NOT populate `output.rejectedBy` or `output.rejectorMandatory` on the step. As a result, this default predicate will evaluate to false and the loop region will NOT iterate — the execution will follow the non-loop edge instead. If your loop region must fire on rejection, use `recordReviewerDecision` with a mandatory reviewer (which does populate `rejectorMandatory: true`) rather than the resolve reject actions.
**`previousAttempts` payload:** on iteration N+1, the entry step's input object includes:
Use this to give the entry agent full context about prior rejection reasons so it can revise its output accordingly.

**Edge shape:**

```typescript
{
  from: string,           // source nodeId
  to: string,             // target nodeId
  when?: string           // e.g. "output.passesBrandCheck == true"
}
```

If `when` is omitted, the edge always fires. If a node has multiple outgoing edges and no `when` clause evaluates true, the execution stalls at that node — always include an unconditional edge or an explicit catch-all `when: "true"`.

**`when` expression language:**

```typescript
Path roots:
  output.*              The source step's output object.
  step.*                The source step's metadata (status, timing).
  execution.input.*     The triggerContext you passed on dispatch.

Operators:
  ==  !=  <  >  <=  >=  &&  ||  !
  Helpers: regex, includes, startsWith, endsWith, length, isEmpty
```

Expressions are compiled at write time (pure AST, no `eval`) and walked at runtime.

**Group shape (parallel quorum):**

```typescript
{
  groupId: string,                                               // 1–64 chars, unique
  memberNodeIds: string[],                                       // 1–500; each node belongs to AT MOST one group
  expectedSteps: number,                                         // 1–500; MUST equal memberNodeIds.length
  quorum: number,                                                // 1–expectedSteps; "how many approvals to satisfy"
  onQuorumMet?: "waitAll" | "cancelOnQuorum" | "joinOnQuorum",  // default: waitAll
  requiredNodeIds?: string[]                                     // length ≤ quorum; these specific members must approve too
}
```

**Quorum counts only `completed` steps whose `output.decision === 'approve'`** — not total completions, not rejections, not failures, not breaches, not cancellations (those count toward completion only). Two consequences:
1. **Non-blocking agent nodes never satisfy quorum** — they complete without producing an approve/reject decision. Only `human` nodes and `blocking: true` agents belong in approval-counting groups.
2. **A `reject` does not block group completion.** Group-completion (`expectedSteps` met) and group-quorum (approval threshold) are tracked separately. A group of all-reject members rolls up to complete but never fires `group.quorum-met`.

**onQuorumMet policies — first-time approval-quorum-met effect:**

```typescript
waitAll          (default)
  Emits group.quorum-met event only. Execution continues until every member is terminal.
  Per-member fan-out: each member's outgoing edges fire on its own completion.
  Two members fanning to the same downstream node ⇒ two downstream step instances.

cancelOnQuorum
  Emits group.quorum-met AND cancels every sibling member step still in `waiting`
  (system actor "system:group-quorum", audit reason "group-quorum-met").
  Completed members still fan out per their edges; cancelled members do not.
  Linter constraint: requires quorum < expectedSteps.

joinOnQuorum
  Emits group.quorum-met, cancels waiting siblings, AND fires a single group-owned
  downstream step per shared successor (synthetic stepId:
  group_<groupId>__to__<childNodeId>). Per-member fan-out is SUPPRESSED — the
  group container owns fan-out, so downstream successors run exactly once.
  Successor's input is { groupOutputs, groupId, quorum, totalApproved }.
  Linter constraint: every member must share the same outgoing-edge target set.
```

**Specific-must-approve quorum (`requiredNodeIds`):**

```json
{
  "groupId": "approver-group",
  "memberNodeIds": ["legal", "finance", "brand"],
  "expectedSteps": 3,
  "quorum": 2,
  "requiredNodeIds": ["legal", "finance"]
}
```

Quorum-met now requires both: every nodeId in `requiredNodeIds` approves AND the numeric `quorum` is met. `brand` alone reaching 2 approvals does NOT satisfy the gate — `legal` AND `finance` must both also be approvers. Empty/omitted `requiredNodeIds` collapses back to anonymous quorum.

**SLA and breach handling:**

```typescript
slaMs?: number      // step deadline in ms; set on any node

If the step doesn't complete within slaMs, it transitions to `breached` and emits
a step.breached event. To handle breaches, declare an outgoing edge that routes on
the breached status; otherwise the linter rejects the definition with
`missing-breach-edge` (silent dead-ends are a bug).
Root steps (no incoming edges):       step_<nodeId>_<timestamp>_<rand>
Per-edge fan-out:                     ${parentStepId}__to__${childNodeId}
joinOnQuorum group fan-out:           group_<groupId>__to__<childNodeId>
                                      (single instance regardless of how many group members ran)
```

**Step IDs are deterministic** (so retries land on the same doc):

**Status flows:**

```typescript
Execution: pending → running → completed | failed | cancelled

Step:      pending → running → (waiting) → completed | failed | skipped | cancelled | breached
           // `waiting` applies only to human steps and blocking:true agent steps
```

---

## 2. REST Endpoints

**Impact: HIGH**

The 14 POST endpoints under `/v2/workflow/*`. Split by resource: **foundations** (auth headers, request/response envelope, canonical error codes, schema-validation messages); **definitions** (5 endpoints + full 25-rule linter reference — 16 graph+group rules + 9 new loop rules); **executions** (5 endpoints — dispatch with `idempotencyKey` + webhook config; cancel; getEvents with `sinceSeq`); **steps** (4 endpoints; admin-only `/steps/cancel` with optional `actorId` and `/steps/resolve` with optional `reason` + `actorId`); **object-views** (TypeScript interfaces for `ExecutionView`, `StepView`, `DefinitionView`, `ApprovalEventView`, and the human/`joinOnQuorum` payload shapes).

### 2.1 Approval Engine REST foundations — auth headers, envelope, canonical error codes, and schema-validation messages

**Impact: HIGH (Every endpoint shares the same auth header convention, request/response envelope, and error code set; getting these wrong looks endpoint-specific but isn't)**

All 14 Approval Engine endpoints share the same auth model, request/response envelope, and error vocabulary. Everything here applies to every other `rest-*` rule in this skill.

**Base URL:**

```typescript
POST https://api.velt.dev/v2/workflow/*
```

Every endpoint is `POST` (yes, even reads like `definitions/get`). The HTTP method is constant; the path identifies the operation. `/v1/...` and `/v2/...` are active aliases for the same controllers — new integrations should use V2.

**Auth headers (every request):**

```typescript
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

**Error code reference:**

```typescript
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
These are `INVALID_ARGUMENT` errors with specific human-readable `message` strings. Stable; safe to string-match for end-user-friendly tooling.

**Schema validation messages:**

```typescript
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

---

### 2.2 Definitions endpoints — create, update (ifVersion), get, list, delete; full linter rule reference

**Impact: HIGH (Definitions are the static blueprint of every workflow; the 25-rule linter rejects misconfigured definitions at create/update time)**

A **definition** is the static, versioned blueprint of a workflow. Every successful update increments `version`. In-flight executions are immune to definition changes — they pin to the version they were dispatched against.

Five POST endpoints under `/v2/workflow/definitions/*`. For node/edge/group shapes see the `concepts-workflow-model` rule.

**Create — endpoint:**

```bash
POST https://api.velt.dev/v2/workflow/definitions/create
```

`definitionId`, `name`, `nodes`, and `edges` are required. `scope` defaults to `{ "level": "apiKey" }`. `groups`, `triggers`, `tags`, `description`, `custom` are optional.

**Create — request + response:**

```json
{
  "data": {
    "definitionId": "marketing-copy-approval",
    "name": "Marketing copy approval",
    "scope": { "level": "apiKey" },
    "nodes": [
      { "nodeId": "agent-draft",   "type": "agent", "config": { "agentId": "copy-agent-v1" } },
      { "nodeId": "human-legal",   "type": "human", "config": { "reviewers": [{ "userId": "u_legal_01", "mandatory": true }] } },
      { "nodeId": "human-brand",   "type": "human", "config": { "reviewers": [{ "userId": "u_brand_01", "mandatory": true }] } },
      { "nodeId": "agent-publish", "type": "agent", "config": { "agentId": "publish-agent-v1" } }
    ],
    "edges": [
      { "from": "agent-draft",  "to": "human-legal" },
      { "from": "agent-draft",  "to": "human-brand" },
      { "from": "human-legal",  "to": "agent-publish" },
      { "from": "human-brand",  "to": "agent-publish" }
    ],
    "groups": [{
      "groupId": "parallel-review",
      "memberNodeIds": ["human-legal", "human-brand"],
      "expectedSteps": 2,
      "quorum": 2,
      "onQuorumMet": "joinOnQuorum"
    }]
  }
}

// Response
// { "result": { "definitionId": "marketing-copy-approval", "version": 1, ... } }
```

`scope.level` is `"apiKey"` (workspace-wide), `"organization"` (bound to an `organizationId`), or `"document"` (bound to a `documentId` under an organization).
**Scope per-level required fields:** when `scope.level` is `"organization"`, the top-level `organizationId` field is required. When `scope.level` is `"document"`, both `organizationId` AND `documentId` are required. Omitting either returns `INVALID_ARGUMENT`.
**Server-namespaced IDs caveat:** the engine hashes certain client-supplied IDs (e.g., node IDs) at write time to produce stable internal identifiers. The values echoed back in the response are the engine's internal forms — they are NOT your original client-supplied strings. Do not rely on the echoed IDs matching what you sent; use `definitionId` as the stable external key.
**`triggers` shape:** each entry in the `triggers[]` array has the form `{ triggerId, eventName?, filters? }`. Triggers are descriptive metadata only in v1 — the engine does NOT auto-dispatch executions when a trigger's event fires. Your application is responsible for calling `/executions/dispatch` in response to events. `triggers[]` is stored on the definition and surfaced in `GET` responses, but has no runtime effect.

**Update — always include `ifVersion`:**

```bash
POST https://api.velt.dev/v2/workflow/definitions/update
```

`definitionId` is required; everything else is optional. Always include `ifVersion` to opt into optimistic locking — without it, concurrent updaters can silently overwrite each other.

**Update — request body:**

```json
{ "data": { "definitionId": "marketing-copy-approval", "ifVersion": 1, "name": "Marketing copy approval v2" } }
```

Mismatched `ifVersion` returns `FAILED_PRECONDITION`. Re-read with `/definitions/get`, re-apply, and retry.

**Get — endpoint:**

```bash
POST https://api.velt.dev/v2/workflow/definitions/get
{ "data": { "definitionId": "marketing-copy-approval" } }
// Response: { "result": DefinitionView }   // see rest-object-views rule
```

**List — cursor-based pagination:**

```bash
POST https://api.velt.dev/v2/workflow/definitions/list
{ "data": { "scope": { "level": "apiKey" }, "status": "active", "tags": ["q2"], "limit": 50 } }
// Response: { "result": { "definitions": DefinitionView[], "nextCursor": "..." } }
```

All `data` fields are optional. Always honor `nextCursor` — never assume `limit` is enforced exactly.

**Delete — endpoint:**

```bash
POST https://api.velt.dev/v2/workflow/definitions/delete
{ "data": { "definitionId": "marketing-copy-approval" } }
```

Rejected with `FAILED_PRECONDITION` if any in-flight executions exist. Cancel or wait for them first.
Definitions are validated at create AND update time. Any rule violation is rejected with `INVALID_ARGUMENT` and an explicit code in the error message. The linter now has 25 rules: 6 graph-shape rules, 10 group rules, and 9 loop rules.

**Graph-shape linter codes:**

```typescript
duplicate-node-id                    Two nodes share the same nodeId.
dangling-edge                        An edge's from or to references a nodeId that isn't declared.
cycle-detected                       The graph contains a cycle — v1 is DAG-only.
unreachable-node                     A node has no path from any root.
node-missing-config                  A node has no config block.
missing-breach-edge                  A node has slaMs but no outgoing edge routed
                                     for breach handling — breaches would dead-end.
```

**Group linter codes:**

```typescript
group-duplicate-id                              Two groups share the same groupId.
group-members-empty                             memberNodeIds is empty.
group-member-missing                            A member references a nodeId that isn't declared.
group-expected-steps-invalid                    expectedSteps < 1 (must also equal memberNodeIds.length).
group-quorum-invalid                            quorum < 1 or quorum > expectedSteps.
group-cancelonquorum-requires-quorum-lt-expected
                                                cancelOnQuorum with quorum >= expectedSteps —
                                                nothing to cancel.
group-joinonquorum-members-must-share-successors
                                                joinOnQuorum but members have different
                                                outgoing-edge target sets.
group-required-not-in-members                   An entry in requiredNodeIds is not in memberNodeIds.
group-required-exceeds-quorum                   requiredNodeIds.length > quorum — impossible to satisfy.
group-node-in-multiple-groups                   A node appears as a member of two or more groups.
```

**Loop linter codes:**

```typescript
loop-duplicate-id                         Two loops share the same loopId.
loop-entry-must-be-in-body                entryNodeId is not listed in bodyNodeIds.
loop-body-member-missing                  A bodyNodeIds entry isn't a declared node.
loop-body-unreachable-from-entry          Some body node is unreachable from entryNodeId
                                          along body-internal edges.
loop-body-must-have-single-terminal       Body shape is neither single-terminal sequential
                                          nor group-bounded (see concepts-workflow-model).
loop-node-in-multiple-loops               A node appears in more than one loop body.
loop-on-exhausted-route-to-not-found      onExhausted.routeToNodeId references an unknown node.
loop-on-exhausted-route-to-in-body        onExhausted.routeToNodeId is itself a body node —
                                          it must route outside the loop.
loop-group-bounded-quorum-must-equal-expected
                                          Group-bounded body joinOnQuorum group requires
                                          quorum === expectedSteps.
```

These are deterministic — surface the code to the human author rather than retrying. The linter does not check runtime feasibility (e.g., a stuck-on-rejection group passes the linter; see `concepts-workflow-model`).

---

### 2.3 Executions endpoints — dispatch (idempotencyKey, webhookUrl), get, list, cancel, getEvents

**Impact: HIGH (Missing idempotencyKey on dispatch creates duplicate executions on retry; missing sinceSeq recovery after a webhook outage leaves your state permanently behind)**

An **execution** is a single run of a definition. Five POST endpoints under `/v2/workflow/executions/*`. The two operations that have non-obvious failure modes are **dispatch** (always supply `idempotencyKey`) and **getEvents** (use `sinceSeq` to recover missed webhooks).

**Dispatch — always supply `idempotencyKey`:**

```json
POST https://api.velt.dev/v2/workflow/executions/dispatch
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

---

### 2.4 Object reference — ExecutionView, StepView, DefinitionView, ApprovalEventView, and the human / joinOnQuorum payload shapes

**Impact: MEDIUM (The exact field shapes returned by /executions/get, /definitions/get, /executions/getEvents, and embedded in step outputs — needed for typing client code against responses)**

These TypeScript interfaces describe the canonical shapes returned from the read endpoints. They're stable for v1 and safe to type against in client code.

**`ExecutionView` — returned by `/executions/get` and embedded in `/executions/list`:**

```typescript
interface ExecutionView {
  executionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: number;             // epoch ms
  completedAt: number | null;
  cancelledAt: number | null;
  definitionId: string;
  definitionVersion: number;     // pinned at dispatch — updates to the definition don't change this
  correlationId: string;
  idempotencyKey: string;
  failureReason: { code: string; message: string } | null;
  steps: StepView[];
}
```

**`StepView` — one entry per scheduled or completed step:**

```typescript
interface StepView {
  stepId: string;
  nodeId: string;
  nodeType: 'agent' | 'human';
  status: 'pending' | 'running' | 'waiting' | 'completed' | 'failed' | 'skipped' | 'cancelled' | 'breached';
  groupId: string | null;
  startedAt: number | null;
  completedAt: number | null;
  output: Record<string, unknown>;
  error: { code: string; message: string } | null;
}
```

**`DefinitionView` — returned by `/definitions/get` and embedded in `/definitions/list`:**

```typescript
interface DefinitionView {
  definitionId: string;
  name: string;
  description: string | null;
  version: number;
  scope: {
    level: 'apiKey' | 'organization' | 'document';
    organizationId: string | null;
    documentId: string | null;
  };
  nodes: NodeView[];
  edges: EdgeView[];
  groups: ParallelGroupDef[] | null;
  triggers: WorkflowTriggerConfig[] | null;
  tags: string[] | null;
  custom: Record<string, unknown> | null;
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'tombstoned';
}
```

**`ApprovalEventView` — returned by `/executions/getEvents`:**

```typescript
interface ApprovalEventView {
  eventId: string;
  seq: number;             // monotonic per-execution
  type: string;            // external event type — see webhooks-delivery for catalog
  stepId: string | null;
  timestamp: number;       // epoch ms
  correlationId: string;
  data?: Record<string, unknown>;
}
```

This shape differs slightly from the webhook payload (webhook deliveries also include `executionId`, `definitionId`, `status`, and use ISO 8601 strings for `timestamp` — see `webhooks-delivery`).

**Human step output (after resume):**

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

`decision` and `approved` are what edge `when` expressions and quorum policies key off — e.g. an edge `when: "output.decision == 'reject'"` will fire only on a human-step rejection.

**`joinOnQuorum` group successor input:**

```typescript
{
  groupOutputs: Record<string /* memberNodeId */, Record<string, unknown> /* member's output */>;
  groupId: string;
  quorum: number;
  totalApproved: number;
}
```

This is how a group-owned downstream step sees each member's per-step output without duplicating itself per member.

---

### 2.5 Steps endpoints — recordReviewerDecision, recordAgentResolution, cancel (admin), resolve (admin)

**Impact: HIGH (Steps endpoints drive forward progress on parked human/blocking-agent steps; admin-only endpoints (cancel/resolve) require admin-scoped auth tokens or they 403; the resolve action discriminator determines both permissions and loop-predicate behavior)**

Four POST endpoints under `/v2/workflow/steps/*`. Two are for normal forward progress on parked steps; two are admin-only overrides.

**recordReviewerDecision — a human reviewer approves or rejects:**

```json
POST https://api.velt.dev/v2/workflow/steps/recordReviewerDecision
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

```json
POST https://api.velt.dev/v2/workflow/steps/recordAgentResolution
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

```json
POST https://api.velt.dev/v2/workflow/steps/cancel
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

```json
POST https://api.velt.dev/v2/workflow/steps/resolve
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

The `action` field (REQUIRED) is the central discriminator. It determines both the resolution semantics and the auth requirements:
| `action` value | Semantics | Auth requirement |
|---|---|---|
| `force-approve` | Admin sets step to approved-complete; skips aggregator | Admin-scoped token |
| `force-reject` | Admin sets step to rejected-complete; skips aggregator | Admin-scoped token |
| `force-complete` | Admin marks step complete without approve/reject framing | Admin-scoped token |
| `force-fail` | Admin marks step as failed | Admin-scoped token |
| `reviewer-approve` | Reviewer-scoped approve; routes through aggregator | `actorId` must be in `step.reviewerIds` |
| `reviewer-reject` | Reviewer-scoped reject; routes through aggregator | `actorId` must be in `step.reviewerIds` |
`actorId` is REQUIRED (1–256 chars). `reason` is optional, ≤ 2000 chars.
**Reviewer-scoped auth:** `reviewer-approve` and `reviewer-reject` require `actorId` to be a member of `step.reviewerIds`. If it is not, the engine returns `PERMISSION_DENIED`.
**Authority-of-record:** The engine computes the canonical `decision`, `approved`, and `approvalReply` fields from the action. Any keys with those names in the caller-supplied `output` object are ignored and cannot override the engine's computed values.
**Critical — reject actions do NOT populate loop-predicate fields:** `reviewer-reject` and `force-reject` do NOT populate `output.rejectedBy` or `output.rejectorMandatory` on the step output. The default loop-region predicate `decision == 'reject' && rejectorMandatory == true` will therefore NOT fire when a step is resolved via these actions. If your loop region relies on `rejectorMandatory`, you must use `recordReviewerDecision` with a configured mandatory reviewer rather than the `/steps/resolve` reject actions. See also the loop-predicate caveat in `concepts-workflow-model`.
**Post-GA note:** Workspace-admin RBAC will further gate force-* actions by workspace role.
| Situation | Endpoint |
|---|---|
| Human reviewer is acting through your UI | `recordReviewerDecision` |
| Out-of-band system completed a `blocking: true` agent step | `recordAgentResolution` |
| Operator escalates / aborts a single step | `cancel` (admin) |
| Operator force-resolves a stuck step (choose action) | `resolve` with appropriate `action` value |
| Reviewer acting via resolve endpoint (in reviewerIds) | `resolve` with `reviewer-approve` or `reviewer-reject` |
| Operator aborts the whole workflow | `/executions/cancel` (NOT `/steps/cancel`) |

---

## 3. Webhooks

**Impact: HIGH**

Inbound webhook delivery — required HMAC-SHA256 signature verification on the raw bytes (not re-serialized JSON), the three `x-velt-*` headers, the full payload field shape, the event catalog with `data` highlights per event type (including new `loop.iteration-started` and `loop.exhausted` events), the retry schedule (immediate → +2s → +8s → +32s → +2min → +8min → DLQ), the at-least-once delivery contract with idempotency on `(executionId, seq)`, the cancellation reason vocabulary, and missed-event recovery via `/executions/getEvents?sinceSeq=N`.

### 3.1 Webhook delivery — HMAC verification on raw bytes, payload shape, event catalog with data highlights, retry schedule, idempotency on (executionId, seq)

**Impact: HIGH (Wrong signature verification (hashing re-serialized JSON instead of raw bytes) lets forged requests through; missing seq-based idempotency double-processes every retried event)**

When you dispatch with `webhookUrl` + `webhookSecret`, every externally-visible state change is POSTed to your receiver. Delivery is JSON POST with a 10 s timeout and no redirects.

**Delivery headers:**

```typescript
x-velt-signature    sha256=<hex> — HMAC-SHA256 of the raw request body
x-velt-event-id     Stable event ID, unchanged across retries
x-velt-attempt      0-based attempt counter
```

**Payload shape (every delivery):**

```typescript
event           string              External event type (see Event Catalog below)
executionId     string              The execution this event belongs to
definitionId    string              The pinned definition id for this execution
stepId          string | null       Set for step-level events; null for execution-level
status          string | undefined  Optional. Extracted from data.status when present
seq             integer             Monotonic per-execution sequence — use for ordering
                                    and reconciliation
timestamp       string              ISO 8601 timestamp of the event
correlationId   string              End-to-end trace id, echoed from dispatch
data            object              Event-specific payload (see catalog)
```

The single most important detail: hash the raw request body as your HTTP framework received it. Re-serializing parsed JSON (`JSON.stringify(req.body)`) reorders keys, changes whitespace, and produces a different digest — your verification will always fail.

**Correct (Node.js / Express with raw-body middleware):**

```javascript
const crypto = require('crypto');
const express = require('express');
const app = express();

// CRITICAL: get the raw bytes, not parsed JSON.
// Never call JSON.stringify(req.body) for signature input.
app.use('/velt/approvals', express.raw({ type: 'application/json' }));

function verifyVeltSignature(rawBody, headerValue, secret) {
  const [scheme, hex] = String(headerValue || '').split('=');
  if (scheme !== 'sha256' || !hex) return false;
  const computed = crypto
    .createHmac('sha256', secret)
    .update(rawBody)                          // raw bytes, NOT JSON.stringify(req.body)
    .digest('hex');
  const a = Buffer.from(hex, 'hex');
  const b = Buffer.from(computed, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);  // constant-time compare
}

app.post('/velt/approvals', (req, res) => {
  const ok = verifyVeltSignature(req.body, req.headers['x-velt-signature'], process.env.WEBHOOK_SECRET);
  if (!ok) return res.status(401).end();

  const event = JSON.parse(req.body.toString('utf8'));
  // ... idempotent handling, keyed on (event.executionId, event.seq) or x-velt-event-id
  res.status(204).end();
});
```

Two things never to skip: (1) raw body — `express.json()` will parse the body and the original bytes are gone; (2) `crypto.timingSafeEqual` for the comparison — `===` is timing-leak-prone.

**Event catalog with data highlights:**

```typescript
External event           Internal name              When emitted                          data highlights
─────────────────────────────────────────────────────────────────────────────────────────────────────────
execution.dispatched     same                       Execution created; first steps        { definitionId,
                                                    scheduled                              definitionVersion,
                                                                                           rootStepIds }
execution.completed      same                       All steps terminal, no               null
                                                    unhandled failures
execution.failed         same                       Blocking step ended failed/breached  { failureReason }
                                                    with no recovery edge
execution.cancelled      same                       /executions/cancel or full           { reason? }
                                                    execution rollback
step.awaiting-approval   step.waiting               Human or blocking-agent step         { waitingForReviewers,
                                                    entered waiting                       mandatoryCount,
                                                                                          resumeKey }
step.completed           same                       Step transitioned to completed       Human / blocking-agent:
                                                                                         { aggregatorStatus,
                                                                                           nodeType, decision,
                                                                                           aggregatorBacked }
                                                                                         Non-blocking agent:
                                                                                         { agentId }
step.failed              same                       Step failed (retry budget exhausted) { error: { code, message } }
step.breached            same                       Step exceeded its slaMs              { reason }
step.cancelled           same                       Cancelled via /steps/cancel or by    { actorId, reason }
                                                    quorum-met side effect
group.quorum-met         parallel-group.quorum-met  Parallel group's approval threshold  { groupId, total, quorum,
                                                    first satisfied                       completedTotal,
                                                                                          expectedSteps }
loop.iteration-started   same                       Iteration N+1 spawns after a body    { loopId, iteration,
                                                    iteration terminated rejected and     triggeredBy: 'rejection' }
                                                    the cap wasn't hit
loop.exhausted           same                       Loop's maxIterations cap reached     { loopId, iteration,
                                                                                          lastRejectedBy?,
                                                                                          lastRejectionReason? }
```

Internal-only events (`step.scheduled`, `step.started`, `step.retried`, `step.resumed`, `step.response-recorded`, `step.overridden`, `parallel-group.completed`, `idempotency.suppressed`) fill `seq` gaps but are **never** delivered externally. Non-contiguous `seq` values are normal — do not treat a gap as an error.

**Cancellation reason vocabulary:**

```typescript
group-quorum-met       (system actor "system:group-quorum")
                       Engine cancelled the step because the parent group's
                       approval quorum was met under cancelOnQuorum or joinOnQuorum.

loop-restart           (system actor "system:loop-restart")
                       Engine cancelled an in-flight body step from iteration N
                       of a loop region because iteration N+1 is starting.

(admin-supplied)       Free-form reason passed to /steps/cancel.
```

The `step.cancelled` `data.reason` set may grow over time — Velt treats this as a non-breaking change.

**Retry schedule:**

```typescript
Attempt 1 (initial)    —
Attempt 2              2 s
Attempt 3              8 s
Attempt 4              32 s
Attempt 5              2 min
Attempt 6              8 min → DLQ after this fails
```

After 5 failed retries the payload is written to a dead-letter queue. A delivery is considered successful if your receiver returns HTTP 2xx within Velt's 10 s timeout. Any non-2xx triggers the next retry.
**At-least-once delivery.** Every retried delivery uses the same `x-velt-event-id` and carries the same `(executionId, seq)` in the payload. Your handler must:
1. Compute a dedup key from the payload: `${event.executionId}:${event.seq}` (or use `x-velt-event-id`).
2. Check a durable store before processing. If seen, return 2xx without re-doing work.
3. Otherwise process + record the key + return 2xx atomically.

**Missed-event recovery:**

```javascript
// After your receiver recovers from an outage:
const lastSeen = await store.lastProcessedSeqFor(executionId);
const { events } = await workflowApi('executions/getEvents', { executionId, sinceSeq: lastSeen });
for (const ev of events) {
  await idempotentProcess(ev);   // same handler as your webhook receiver
}
```

The receiver and the reconciler must share the same dedup logic (same `(executionId, seq)` key).

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/ai/approval-engine/overview
- https://docs.velt.dev/ai/approval-engine/setup
- https://docs.velt.dev/ai/approval-engine/customize-behavior
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/definitions/create-definition
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/executions/dispatch-execution
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/steps/record-reviewer-decision
