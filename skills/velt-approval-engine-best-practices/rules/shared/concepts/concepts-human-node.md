---
title: Configure human nodes with mandatory reviewers and an outgoing reject edge
impact: HIGH
impactDescription: A human node without an on reject edge is rejected at create time, and a reviewerId that is not declared on the node is silently discarded so the step never resolves
tags: approval-engine, human-node, reviewers, reviewerIds, mandatory, reviewerEmails, commentBody, reject-path, APPROVAL_HUMAN_NODE_REQUIRES_REJECT_PATH, aggregator, recordReviewerDecision, reviewer-ui
---

## Configure human nodes with mandatory reviewers and an outgoing reject edge

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

**Verification Checklist:**
- [ ] Exactly one of `reviewers` or `reviewerIds` per human node, with at least one `mandatory: true` reviewer
- [ ] Every human node, including group members, has an outgoing `on: "reject"` edge (forward route or loop-back)
- [ ] `reviewerEmails` has at most 50 entries; `commentBody` is at most 8000 chars
- [ ] Your reviewer UI renders `commentBody` and sends `recordReviewerDecision` with a declared `reviewerId`
- [ ] Code treats `recorded: false` as "not applied" and inspects `rejectionReason` (only `idempotent` is safe to ignore)

**Source Pointers:**
- https://docs.velt.dev/ai/approval-engine/customize-behavior#human-nodes — fields and the reject-path note
- https://docs.velt.dev/ai/approval-engine/setup#step-3-record-a-decision — reviewer UI and `reviewerId` matching
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/steps/record-reviewer-decision — "Not Recorded Response"
- https://docs.velt.dev/ai/approval-engine/patterns#a-final-human-node-with-no-reject-edge — anti-pattern
