---
title: Approval Engine workflow model — nodes, edges, groups, quorum policies, and step IDs
impact: HIGH
impactDescription: Every REST payload carries these shapes; misunderstanding them produces either INVALID_ARGUMENT linter failures at create time or stuck-forever executions at runtime
tags: approval-engine, workflow, definition, nodes, edges, groups, quorum, agent, human, webhook, reviewers, reviewerIds, slaMs, onQuorumMet, requiredNodeIds, stepId
---

## Approval Engine workflow model — nodes, edges, groups, quorum policies, and step IDs

An Approval Engine **definition** is a static, versioned blueprint composed of three things: **nodes** (work units), **edges** (transitions between them), and **groups** (parallel sets with quorum). The same shapes appear in `/definitions/create`, `/definitions/update`, and `/definitions/get` responses — there is no separate schema language.

Understanding these shapes first makes the REST endpoints obvious. Skipping the model and copy-pasting endpoint payloads is the most common path to `INVALID_ARGUMENT` linter rejections and workflows that park forever waiting on a quorum that can never be satisfied.

**Node types overview:**

```
agent      Runs an agent. Non-blocking by default (completes asynchronously without a
           decision). With blocking: true, parks in "waiting" until external resolutions
           arrive via /steps/recordAgentResolution.

human      Requires reviewer approval. Drives via /steps/recordReviewerDecision. Parks in
           "waiting" until aggregator resolves.

webhook    Schema-accepted for forward compatibility; runtime handler is deferred in v1.
           Most v1 workflows use agent + human only.
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
    "commentBody": "Please review for legal compliance."
  }
}
```

Exactly one of `reviewers[]` (preferred) or `reviewerIds[]` (legacy) must be provided. Both are accepted by the engine — `reviewerIds[]` is kept for back-compat. Supplying both at once is rejected with `cannot set both reviewerIds and reviewers — use one`. The `reviewers[]` form must include at least one `mandatory: true`, and userIds must be unique.

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
- [ ] Node `type` is one of `agent` / `human` / `webhook` (most v1 workflows use `agent` + `human` only)
- [ ] Every `human` node provides exactly one of `reviewers[]` or `reviewerIds[]` — never both
- [ ] Every `human` node using the new shape has at least one `reviewers[].mandatory: true`
- [ ] Every `blocking: true` agent node includes `resolutionPolicy` (with `minCount` when `kind === "minResolved"`)
- [ ] Every node with `slaMs` has at least one outgoing breach-routed edge (avoids `missing-breach-edge`)
- [ ] Each node belongs to at most one group
- [ ] For every group: `expectedSteps === memberNodeIds.length`, `1 ≤ quorum ≤ expectedSteps`, `requiredNodeIds.length ≤ quorum`
- [ ] `cancelOnQuorum` groups have `quorum < expectedSteps` (avoids `group-cancelonquorum-requires-quorum-lt-expected`)
- [ ] `joinOnQuorum` groups: all members share the same successor set (avoids `group-joinonquorum-members-must-share-successors`)
- [ ] Approval-counting groups contain only `human` or `blocking: true` agents — never non-blocking agents

**Source Pointers:**
- https://docs.velt.dev/ai/approval-engine/overview — concepts overview, step ID formats
- https://docs.velt.dev/ai/approval-engine/customize-behavior — full node configuration, edge expressions, quorum policies, SLAs
