---
title: Pick the construct that matches the review requirement before writing the definition
impact: MEDIUM-HIGH
impactDescription: Most broken workflows pass the linter but use the wrong construct (waitAll where joinOnQuorum was meant, a blocking agent where a downstream human node was meant, polling without webhooks)
tags: approval-engine, patterns, decision-table, waitAll, cancelOnQuorum, joinOnQuorum, requiredNodeIds, slaMs, webhook-node, notification-node, triggers, webhookConfig, getEvents, polling, resolve
---

## Pick the construct that matches the review requirement before writing the definition

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

**Verification Checklist:**
- [ ] Each requirement in the spec maps to one row above before any JSON is written
- [ ] "Run once after quorum" uses `joinOnQuorum`, not `waitAll` per-member edges
- [ ] Agent findings that need sign-off go to a downstream `human` node
- [ ] Production integrations use both webhooks and `getEvents` catch-up
- [ ] Runs started by external systems or schedules use triggers, not a custom relay

**Source Pointers:**
- https://docs.velt.dev/ai/approval-engine/patterns#i-want-x-use-y — decision table
- https://docs.velt.dev/ai/approval-engine/patterns#choosing-a-parallel-review-policy — policy choice
- https://docs.velt.dev/ai/approval-engine/patterns#webhooks-or-polling — complementary delivery
