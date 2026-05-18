---
title: Approval Engine workflow model — nodes, edges, groups, quorum policies, loop regions, and step IDs
impact: HIGH
impactDescription: Every REST payload carries these shapes; misunderstanding them produces either INVALID_ARGUMENT linter failures at create time or stuck-forever executions at runtime
tags: approval-engine, workflow, definition, nodes, edges, groups, quorum, agent, human, reviewers, reviewerIds, slaMs, onQuorumMet, requiredNodeIds, stepId, loops, onReject, reviewerEmails, commentBody
---

## Approval Engine workflow model — nodes, edges, groups, quorum policies, loop regions, and step IDs

An Approval Engine **definition** is a static, versioned blueprint composed of three things: **nodes** (work units), **edges** (transitions between them), and **groups** (parallel sets with quorum). The same shapes appear in `/definitions/create`, `/definitions/update`, and `/definitions/get` responses — there is no separate schema language.

Understanding these shapes first makes the REST endpoints obvious. Skipping the model and copy-pasting endpoint payloads is the most common path to `INVALID_ARGUMENT` linter rejections and workflows that park forever waiting on a quorum that can never be satisfied.

**Node types overview:**

```
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

**`onReject` shorthand — per-node rejection routing:**

Authors can express the rejection path directly on a `human` node instead of declaring a top-level `loops[]` region or hand-writing a `when`-gated edge. Two mutually exclusive forms:

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

**Loop regions (`loops[]`):**

A loop region lets a workflow re-enter an earlier node when a reviewer rejects, instead of failing outright. Declare loops at the top level of a definition, peer to `groups[]`. Use a top-level loop (rather than the `onReject` shorthand) when multiple parallel reviewers share a single retry counter, or when you need explicit `loopId` control for event tracking.

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

```json
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

```
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

```
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

```
slaMs?: number      // step deadline in ms; set on any node

If the step doesn't complete within slaMs, it transitions to `breached` and emits
a step.breached event. To handle breaches, declare an outgoing edge that routes on
the breached status; otherwise the linter rejects the definition with
`missing-breach-edge` (silent dead-ends are a bug).
```

**Step IDs are deterministic** (so retries land on the same doc):

```
Root steps (no incoming edges):       step_<nodeId>_<timestamp>_<rand>
Per-edge fan-out:                     ${parentStepId}__to__${childNodeId}
joinOnQuorum group fan-out:           group_<groupId>__to__<childNodeId>
                                      (single instance regardless of how many group members ran)
```

**Status flows:**

```
Execution: pending → running → completed | failed | cancelled

Step:      pending → running → (waiting) → completed | failed | skipped | cancelled | breached
           // `waiting` applies only to human steps and blocking:true agent steps
```

**Verification Checklist:**
- [ ] Node `type` is one of `agent` / `human`
- [ ] Every `human` node provides exactly one of `reviewers[]` or `reviewerIds[]` — never both
- [ ] Every `human` node using the new shape has at least one `reviewers[].mandatory: true`
- [ ] Every `human` node satisfies strict-mode: has `config.onReject` set OR is a member of a top-level `loops[]` body
- [ ] `reviewerEmails` has 0–50 entries (if provided)
- [ ] `commentBody` is ≤ 8 000 chars; application surfaces it to reviewers (engine does NOT auto-create annotations)
- [ ] `onReject.loopBack.maxIterations` is 1–20 (default 5)
- [ ] Every `blocking: true` agent node includes `resolutionPolicy` (with `minCount` when `kind === "minResolved"`)
- [ ] Every node with `slaMs` has at least one outgoing breach-routed edge (avoids `missing-breach-edge`)
- [ ] Each node belongs to at most one group
- [ ] For every group: `expectedSteps === memberNodeIds.length`, `1 ≤ quorum ≤ expectedSteps`, `requiredNodeIds.length ≤ quorum`
- [ ] `cancelOnQuorum` groups have `quorum < expectedSteps` (avoids `group-cancelonquorum-requires-quorum-lt-expected`)
- [ ] `joinOnQuorum` groups: all members share the same successor set (avoids `group-joinonquorum-members-must-share-successors`)
- [ ] Approval-counting groups contain only `human` or `blocking: true` agents — never non-blocking agents
- [ ] Every `loops[]` entry: `entryNodeId` is in `bodyNodeIds`, `maxIterations` 1–20, no node appears in more than one loop body, `onExhausted.routeToNodeId` (if set) references a node outside the loop body

**Source Pointers:**
- https://docs.velt.dev/ai/approval-engine/overview — concepts overview, step ID formats
- https://docs.velt.dev/ai/approval-engine/customize-behavior — full node configuration, edge expressions, quorum policies, SLAs
