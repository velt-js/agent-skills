---
title: Model parallel review with groups, approval quorum, onQuorumMet policies, and group edge sources
impact: HIGH
impactDescription: Picking the wrong onQuorumMet policy duplicates downstream steps or strands reviewers; quorum counts approvals (including passing agents), not completions
tags: approval-engine, groups, parallel, quorum, expectedSteps, memberNodeIds, requiredNodeIds, onQuorumMet, waitAll, cancelOnQuorum, joinOnQuorum, group-quorum-met, groupOutputs, group-edge-source, collective-branch
---

## Model parallel review with groups, approval quorum, onQuorumMet policies, and group edge sources

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

**Verification Checklist:**
- [ ] `expectedSteps === memberNodeIds.length` and `1 <= quorum <= expectedSteps`
- [ ] No node is in two groups; `requiredNodeIds` are members and number at most `quorum`
- [ ] `cancelOnQuorum` groups use `quorum < expectedSteps`; `joinOnQuorum` members share one successor set
- [ ] A "run once after quorum" step hangs off a `joinOnQuorum` group, not off each member under `waitAll`
- [ ] Forward `on: "reject"` from a group only on `waitAll`; group reject loop-backs only on `joinOnQuorum`
- [ ] Agent members are expected to count toward quorum when they pass
- [ ] `joinOnQuorum` successors read member results from `input.groupOutputs[memberNodeId]`

**Source Pointers:**
- https://docs.velt.dev/ai/approval-engine/customize-behavior#parallel-groups-and-quorum-policies — fields, quorum counting, policies, `requiredNodeIds`
- https://docs.velt.dev/ai/approval-engine/customize-behavior#groups-as-edge-sources — collective branches
- https://docs.velt.dev/ai/approval-engine/patterns#choosing-a-parallel-review-policy — which policy to pick, `joinOnQuorum` member reject warning
- https://docs.velt.dev/ai/approval-engine/patterns#assuming-an-agent-in-a-quorum-group-never-counts — agent quorum counting
