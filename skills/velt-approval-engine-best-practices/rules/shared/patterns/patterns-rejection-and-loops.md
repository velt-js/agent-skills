---
title: Give every human node an explicit reject route and use one group-source back-edge for parallel rewinds
impact: HIGH
impactDescription: Per-reviewer back-edges fail with loop-node-in-multiple-loops, slaMs with only a reject edge fails with missing-breach-edge, and an exhausted target with another incoming edge runs twice
tags: approval-engine, patterns, anti-patterns, rejection, reject-edge, loop-back, exhausted, maxIterations, loop-node-in-multiple-loops, missing-breach-edge, joinOnQuorum, rewind-stage, escalation
---

## Give every human node an explicit reject route and use one group-source back-edge for parallel rewinds

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

**Verification Checklist:**
- [ ] Every human node, including group members, has a reject route (forward edge, own loop-back, or group-source back-edge)
- [ ] Parallel reviewers that rewind together share one `joinOnQuorum` group-source back-edge, not one back-edge each
- [ ] Every loop-back has `maxIterations` 1 to 20 and, where escalation is wanted, a sibling `on: "exhausted"` edge
- [ ] Exhausted targets have no other incoming edges
- [ ] Nodes with `slaMs` have a breach-capable edge in addition to the reject edge
- [ ] Rejections that should loop are recorded via `recordReviewerDecision`

**Source Pointers:**
- https://docs.velt.dev/ai/approval-engine/patterns#choosing-a-rejection-strategy — three rejection shapes
- https://docs.velt.dev/ai/approval-engine/patterns#anti-patterns — back-edge per reviewer, `slaMs` with only reject, final human node, exhausted target reachable another way
- https://docs.velt.dev/ai/approval-engine/patterns#choosing-sla-and-breach-handling — breach routing
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/steps/resolve-step — reject actions and loop predicates
