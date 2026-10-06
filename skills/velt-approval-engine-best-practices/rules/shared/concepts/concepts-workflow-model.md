---
title: Understand the workflow model of definitions, node types, lifecycles, step IDs, scope, and versioning
impact: HIGH
impactDescription: Every REST payload carries these shapes; authoring against the pre-refactor model (onReject, loops[], deferred webhook nodes, blocking agents) produces INVALID_ARGUMENT at create time or runs that never advance
tags: approval-engine, review-workflow-builder, workflow, definition, nodes, edges, groups, triggers, agent, human, notification, webhook, lifecycle, stepId, scope, storeDbId, tenant-partitioning, versioning, definitionVersion, beta-limitations
---

## Understand the workflow model of definitions, node types, lifecycles, step IDs, scope, and versioning

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

**Verification Checklist:**
- [ ] No `onReject`, top-level `loops[]`, or `blocking: true` in authored definitions
- [ ] Every node `type` is one of `agent`, `human`, `notification`, `webhook`, and its `config` has no unknown fields
- [ ] Every `human` node has an outgoing `on: "reject"` edge; every `agent` node sets `url` or `urlPath`
- [ ] Definition stays within limits: 100 nodes, 500 edges, 100 groups, 50 triggers
- [ ] Code reading steps handles `waiting` for agent, human, and async webhook steps
- [ ] Scope is chosen for trigger inheritance, not as a definition selector
- [ ] IDs are never reused across tenants or API keys

**Source Pointers:**
- https://docs.velt.dev/ai/approval-engine/overview — "What is the Review Workflow Builder?", "Building blocks", "Node types", "Lifecycles", "Scope", "Limitations in beta"
- https://docs.velt.dev/ai/approval-engine/customize-behavior#node-configuration — common node fields
- https://docs.velt.dev/ai/approval-engine/customize-behavior#step-ids — step ID shapes
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/definitions/create-definition — field limits and `definitionId` pattern
