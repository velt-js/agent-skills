---
title: Definitions endpoints — create, update (ifVersion), get, list, delete; full linter rule reference
impact: HIGH
impactDescription: Definitions are the static blueprint of every workflow; the 25-rule linter rejects misconfigured definitions at create/update time
tags: approval-engine, rest, definitions, create, update, get, list, delete, ifVersion, linter, cycle-detected, dangling-edge, unreachable-node, missing-breach-edge, duplicate-node-id, node-missing-config, group-duplicate-id, group-members-empty, group-member-missing, group-expected-steps-invalid, group-quorum-invalid, group-cancelonquorum-requires-quorum-lt-expected, group-joinonquorum-members-must-share-successors, group-required-not-in-members, group-required-exceeds-quorum, group-node-in-multiple-groups, loop-duplicate-id, loop-entry-must-be-in-body, loop-body-member-missing, loop-body-unreachable-from-entry, loop-body-must-have-single-terminal, loop-node-in-multiple-loops, loop-on-exhausted-route-to-not-found, loop-on-exhausted-route-to-in-body, loop-group-bounded-quorum-must-equal-expected
---

## Definitions endpoints — create, update, get, list, delete

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

### Linter — full code reference (25 rules)

Definitions are validated at create AND update time. Any rule violation is rejected with `INVALID_ARGUMENT` and an explicit code in the error message. The linter now has 25 rules: 6 graph-shape rules, 10 group rules, and 9 loop rules.

**Graph-shape linter codes:**

```
duplicate-node-id                    Two nodes share the same nodeId.
dangling-edge                        An edge's from or to references a nodeId that isn't declared.
cycle-detected                       The graph contains a cycle — v1 is DAG-only.
unreachable-node                     A node has no path from any root.
node-missing-config                  A node has no config block.
missing-breach-edge                  A node has slaMs but no outgoing edge routed
                                     for breach handling — breaches would dead-end.
```

**Group linter codes:**

```
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

```
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

**Verification Checklist:**
- [ ] `definitionId` is stable across environments — treat it as a slug
- [ ] Every `update` call includes `ifVersion` for optimistic locking
- [ ] On `FAILED_PRECONDITION` for update, re-read with `/definitions/get` then re-apply (do NOT blind-retry)
- [ ] `/definitions/list` consumers honor `nextCursor` and never assume a single page
- [ ] `INVALID_ARGUMENT` with a linter code is surfaced to the human, not retried
- [ ] `/definitions/delete` is preceded by cancelling or waiting on in-flight executions

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/definitions/create-definition
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/definitions/update-definition
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/definitions/get-definition
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/definitions/list-definitions
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/definitions/delete-definition
- https://docs.velt.dev/ai/approval-engine/customize-behavior — full linter code reference
