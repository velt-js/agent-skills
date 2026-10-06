---
title: Manage definitions with create, full-replace update with ifVersion, get, list, delete, and the linter reference
impact: HIGH
impactDescription: Update replaces the whole definition (omitted scope resets to apiKey), round-tripped nulls and server-owned fields fail validation, and 19 linter codes plus edge-contract errors reject bad graphs
tags: approval-engine, rest, definitions, create, update, get, list, delete, purge, tombstone, ifVersion, full-replace, compiled, webhookConfig, linter, cycle-detected, dangling-edge, unreachable-node, missing-breach-edge, duplicate-node-id, node-missing-config, group-duplicate-id, group-members-empty, group-member-missing, group-expected-steps-invalid, group-quorum-invalid, group-cancelonquorum-requires-quorum-lt-expected, group-joinonquorum-members-must-share-successors, group-required-not-in-members, group-required-exceeds-quorum, group-node-in-multiple-groups, loop-node-in-multiple-loops, loop-body-must-have-single-terminal, loop-group-bounded-quorum-must-equal-expected
---

## Manage definitions with create, full-replace update with ifVersion, get, list, delete, and the linter reference

A definition is the versioned blueprint of a workflow. Five `POST` endpoints under `/v2/workflow/definitions/*` manage it. The two traps are that update is a full replace (not a patch) and that a read response cannot be sent back verbatim. Shapes for nodes, edges, groups, and triggers are in the `concepts-*` rules.

**Incorrect (partial patch, no lock, scope silently reset):**

```json
{ "data": { "definitionId": "marketing-copy-approval", "name": "Marketing copy approval v2" } }
```

`ifVersion`, `name`, `nodes`, and `edges` are required on update, and any field you omit (including `scope`, `triggers`, and `webhookConfig`) is not preserved.

**Correct (read, edit, strip, resend everything with `ifVersion`):**

```javascript
const current = await workflowApi('definitions/get', { definitionId: 'marketing-copy-approval' }, creds);

const { version, createdAt, updatedAt, status, compiled, ...authored } = current;
const stripNulls = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null));
const body = stripNulls({ ...authored, scope: stripNulls(authored.scope) });

body.name = 'Marketing copy approval (Q2 revision)';
// webhookConfig is write-only (never returned by get); re-send it or it is cleared
body.webhookConfig = { url: 'https://hooks.acme.com/velt/approvals', secret: process.env.WF_SECRET };

await workflowApi('definitions/update', { ...body, ifVersion: version }, creds);
```

**Create** (`/definitions/create`): required `definitionId` (`^[a-z0-9][a-z0-9-]{2,63}$`), `name` (1 to 200), `nodes` (1 to 100), `edges` (0 to 500). Optional `description` (up to 2000), `scope` (default `{ level: "apiKey" }`), `groups` (0 to 100), `triggers` (0 to 50), `webhookConfig` (`{ url, secret, eventTypes? }`), `tags` (0 to 20, each up to 64 chars), `custom`, and top-level `organizationId` / `documentId` (required for `organization` / `document` scope). Returns a `DefinitionView` with `version: 1` and `status: "active"`. Errors: `INVALID_ARGUMENT`, `ALREADY_EXISTS`.

**Update** (`/definitions/update`): every create field plus required `ifVersion`. A stale `ifVersion` fails with `FAILED_PRECONDITION` (`Version conflict: expected 4, current 5`); re-read and re-apply, never blind-retry. Omitting `scope` demotes an organization- or document-scoped definition to `apiKey`. Updating `triggers` replaces the array. In-flight runs keep their pinned version. Errors: `NOT_FOUND`, `FAILED_PRECONDITION`, `INVALID_ARGUMENT`.

**Round-tripping a read:** strip `version`, `createdAt`, `updatedAt`, `status`, `compiled`, and every `null` (`description`, `groups`, `triggers`, `tags`, `custom`, and `scope.organizationId` / `scope.documentId`). A leftover null or server-owned field fails with `INVALID_ARGUMENT`. `edges` and `scope` IDs round-trip exactly as you sent them.

**Get** (`/definitions/get`): `{ definitionId }`. `organizationId` / `documentId` are accepted but ignored. Returns `DefinitionView` (including the read-only `compiled` block, excluding `webhookConfig`). Tombstoned definitions return `NOT_FOUND`.

**List (`/definitions/list`):**

```json
{ "data": { "pageSize": 50, "cursor": 1714300000000 } }
// { "result": { "items": [DefinitionView], "nextCursor": 1714200000000 } }
```

`pageSize` 1 to 500 (default 50); `cursor` is the previous `nextCursor` (an integer, the last item's `updatedAt`). Returns active definitions ordered by `updatedAt` DESC across every scope; there are no scope, status, or tag filters, so filter `item.scope` client-side. Loop until `nextCursor` is `null`.

**Delete** (`/definitions/delete`): `{ definitionId, purge? }`. Default is a soft delete (tombstone: hidden from get/list, cannot be dispatched); `purge: true` also removes version snapshots. Returns `{ deleted: true, purged, definitionId }`. Fails with `FAILED_PRECONDITION` while in-flight runs exist. The `definitionId` is reusable afterwards and restarts at `version: 1`.

**Linter codes (19), in `error.message`:**

```text
Graph:   duplicate-node-id, dangling-edge, cycle-detected (only marked reject loop-backs may revisit),
         unreachable-node, node-missing-config, missing-breach-edge
Groups:  group-duplicate-id, group-members-empty, group-member-missing, group-expected-steps-invalid,
         group-quorum-invalid, group-cancelonquorum-requires-quorum-lt-expected,
         group-joinonquorum-members-must-share-successors, group-required-not-in-members,
         group-required-exceeds-quorum, group-node-in-multiple-groups
Loops:   loop-node-in-multiple-loops (overlapping reject back-edges; use one group-source back-edge),
         loop-body-must-have-single-terminal, loop-group-bounded-quorum-must-equal-expected
```

**Edge-contract rules** (the message carries the rule text; the doc names are internal): custom without `when`, `when` on a non-custom edge, `loop` on a non-reject edge, a loop-back whose `to` is not an ancestor, a reject to an ancestor without `loop`, `exhausted` without a sibling loop-back, a human node with no reject edge, an agent node without `url` / `urlPath`, group-to-group edges, forward reject from a `joinOnQuorum` / `cancelOnQuorum` group, a group reject loop-back on a non-`joinOnQuorum` group, and a trigger entry with more than one mechanism.

The linter does not check run-time feasibility; surface its codes to the author instead of retrying.

**Verification Checklist:**
- [ ] Every update sends `ifVersion`, `name`, `nodes`, `edges`, and the current `scope`, `triggers`, and `webhookConfig`
- [ ] Read responses are stripped of server-owned fields and nulls before create or update
- [ ] `FAILED_PRECONDITION` on update triggers a re-read and re-apply, not a blind retry
- [ ] List uses `pageSize` / `cursor`, reads `result.items`, and stops when `nextCursor` is `null`
- [ ] Scope filtering on list happens client-side
- [ ] Delete runs only after in-flight executions finish or are cancelled; `purge` used deliberately
- [ ] Linter codes are parsed from `error.message` and shown to the author

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/definitions/create-definition
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/definitions/update-definition
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/definitions/get-definition
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/definitions/list-definitions
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/definitions/delete-definition
- https://docs.velt.dev/ai/approval-engine/customize-behavior#linter-rules — linter codes and edge validation errors
