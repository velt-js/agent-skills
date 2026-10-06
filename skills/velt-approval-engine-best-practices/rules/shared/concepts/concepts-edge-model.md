---
title: Route with edge on roles, JSON-AST when predicates, reject loop-backs, and breach-aware edges
impact: HIGH
impactDescription: All routing (approve, reject, loop-back, exhausted, breach, custom) is expressed on edges; a JavaScript-style when string fails to compile and a slaMs node without a breach route is rejected
tags: approval-engine, edges, on, approve, reject, always, exhausted, custom, when, json-ast, loop, maxIterations, loop-back, compiled, forwardEdges, loops, previousAttempts, slaMs, breached, missing-breach-edge, EdgeEndpoint
---

## Route with edge on roles, JSON-AST when predicates, reject loop-backs, and breach-aware edges

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

**Verification Checklist:**
- [ ] `when` appears only on `on: "custom"` edges and is a JSON-AST string (escaped JSON), never JavaScript
- [ ] Every reject edge to an ancestor carries `loop.maxIterations` (1 to 20); every `on: "exhausted"` edge has a sibling reject loop-back from the same `from`
- [ ] Every node with `slaMs` and outgoing edges has an `on: "always"` edge or a custom breach edge
- [ ] Loop bodies are single-terminal or group-bounded `joinOnQuorum` with `quorum === expectedSteps`
- [ ] Loop-back workflows record rejections with `recordReviewerDecision`, not `/steps/resolve`
- [ ] Graph UIs render from `compiled.forwardEdges` / `compiled.loops`

**Source Pointers:**
- https://docs.velt.dev/ai/approval-engine/customize-behavior#edge-model — fields, roles, reject / loop-back / exhausted
- https://docs.velt.dev/ai/approval-engine/customize-behavior#custom-predicates — JSON-AST shapes and path roots
- https://docs.velt.dev/ai/approval-engine/customize-behavior#loop-regions — derived regions, body shape, `previousAttempts`
- https://docs.velt.dev/ai/approval-engine/customize-behavior#sla-and-breach-handling — breach routing
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/definitions/get-definition#the-compiled-block — `compiled` schema
