---
title: Manage agents, executions, versions, and groups through the Agents REST API
impact: HIGH
impactDescription: Full lifecycle control over custom agents (CRUD + versioning), async executions with polling, and group-based fan-out; misuse either invents versions or leaks per-URL results behind the wrong endpoint
tags: rest, api, agents, executions, versions, groups, analytics, prompts
---

## Manage agents, executions, versions, and groups through the Agents REST API

Use the `/v2/agents/*` REST API family to author custom agents, run and poll executions, walk version history, and manage groups. All endpoints are `POST`, use the standard `https://api.velt.dev/v2` base URL, and require both `x-velt-api-key` and `x-velt-auth-token` headers. Endpoint identity is verbatim — the `/v2/` prefix and the exact path segments matter and are part of the URL.

**Incorrect (fetching per-URL results via the list endpoint, or omitting the poll loop):**

```bash
# Wrong: /v2/agents/execution/list never returns the per-URL findings subcollection,
# and calling it right after /v2/agents/execution/run can return an incomplete run.
POST https://api.velt.dev/v2/agents/execution/list
{ "data": { "agentId": "abc123def456" } }
```

**Correct (start an async execution, poll Get Execution until status leaves `"running"`):**

```bash
POST https://api.velt.dev/v2/agents/execution/run
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{
  "data": {
    "agentId": "abc123def456",
    "url": "https://example.com/pricing",
    "organizationId": "org_001",
    "documentId": "doc_001",
    "ranBy": { "userId": "user_123" }
  }
}

# Response: { "result": { "data": { "executionId": "exec_..." } } }

POST https://api.velt.dev/v2/agents/execution/get
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{
  "data": {
    "executionId": "exec_1711900000000_abc123def456",
    "includeResults": true
  }
}
```

Poll `/v2/agents/execution/get` until `execution.status !== "running"`. Only this endpoint returns the per-URL `results` subcollection (when `includeResults: true`); `/v2/agents/execution/list` never does.

### Endpoint groups

| Group | Endpoints | Notes |
|-------|-----------|-------|
| Agent CRUD | `/v2/agents/create`, `/v2/agents/get`, `/v2/agents/update`, `/v2/agents/delete` | `create` writes version 1 automatically. `update` edits identity only (`name`, `description`, `enabled`); behavioral changes use `/v2/agents/version/update`. `get` returns a single agent when `agentId` is provided, otherwise a list; `filter` and `groupId` narrow the list. |
| Executions | `/v2/agents/execution/run`, `/v2/agents/execution/get`, `/v2/agents/execution/list`, `/v2/agents/execution/count` | `run` is async — the response returns `executionId` immediately; poll `get` until `status !== "running"`. `get` is the only way to read the per-URL `results` subcollection (`includeResults: true`); `list` and `count` never include results. `list` accepts exactly three filter shapes: `{ agentId }`, `{ organizationId, documentId }`, or all three. |
| Versioning | `/v2/agents/version/update`, `/v2/agents/versions/list`, `/v2/agents/versions/restore` | Every behavioral edit creates a new version N+1. `versions/list` returns snapshots newest-first with secrets redacted. `versions/restore` is a single-step undo that walks back to N-1 and cannot go below version 1. |
| Prompt authoring | `/v2/agents/prompt/enhance`, `/v2/agents/prompt/validate`, `/v2/agents/prompt/refine`, `/v2/agents/config/resolve`, `/v2/agents/extract` | `enhance` checks a prompt for missing context (returns a clarification `requirement` or `null`). `validate` expands a one-line instruction into a structured task. `refine` iterates a prompt against demo failures. `config/resolve` recommends `contextGathering.strategies` and `execution.executionStrategy`. `extract` parses a CSV/PDF/XLSX file into agent configs ready for `/v2/agents/create`. |
| Groups | `/v2/agents/groups/create`, `get`, `list`, `update`, `delete`, `add-agents`, `remove-agents` | Groups bundle custom and built-in agents (max 100 members per group, max 50 groups per workspace). `update` only edits `name`/`description` — `metadata` is immutable after creation and membership uses `add-agents` / `remove-agents`. `list` strips `agentIds` and returns `agentCount` per row; call `get` for the full membership. |
| Analytics | `/v2/agents/analytics/get` | Per-agent, per-model, per-month token usage and execution counts. Omit `agentId` for a workspace-wide aggregate. Model keys are sanitised as `provider_model`. |

### Agent lifecycle example

Create → run → check results → edit behavior (new version) → roll back if needed:

```bash
POST https://api.velt.dev/v2/agents/create
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{
  "data": {
    "name": "Brand Consistency Checker",
    "instructions": "Check that all headings use the brand font 'Inter'.",
    "contextGathering": { "strategies": ["web-page-text", "web-page-html"] },
    "execution": { "executionStrategy": "ai" }
  }
}
# → { "result": { "data": { "agentId": "abc123def456" } } }

POST https://api.velt.dev/v2/agents/execution/run
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{
  "data": {
    "agentId": "abc123def456",
    "url": "https://example.com",
    "crossPageExecute": true,
    "maxUrlsToProcess": 25,
    "organizationId": "org_001",
    "documentId": "doc_001"
  }
}

POST https://api.velt.dev/v2/agents/version/update
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{
  "data": {
    "agentId": "abc123def456",
    "instructions": "Check headings use 'Inter' font. Verify #1A73E8 on all CTAs and links."
  }
}
# → { "result": { "data": { "version": 4 } } }

POST https://api.velt.dev/v2/agents/versions/restore
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{ "data": { "agentId": "abc123def456" } }
# → { "result": { "data": { "version": 3 } } }
```

Server-managed fields (`id`, `version`, `createdAt`, `updatedAt`, `managedBy`, `metadata.type`, `metadata.category`, `metadata.internal`, `metadata.apiKey`) are rejected with `INVALID_ARGUMENT` if sent on `/v2/agents/create` or `/v2/agents/version/update`. Auth secrets in `contextGathering.strategyOptions["rest-api"]` and `execution.mcpServers[].auth` are encrypted at rest and returned as `"__redacted__"` on `get` / `versions/list`; rotate by sending the new plaintext, keep by omitting the field.

### Execution list — three-shape filter whitelist

`/v2/agents/execution/list` rejects every filter combination outside this whitelist:

```bash
# 1. All executions of one agent across the workspace.
POST https://api.velt.dev/v2/agents/execution/list
{ "data": { "agentId": "abc123def456", "pageSize": 20 } }

# 2. All executions on one document (any agent).
POST https://api.velt.dev/v2/agents/execution/list
{ "data": { "organizationId": "org_001", "documentId": "doc_001" } }

# 3. All three narrows a single agent to a single document.
POST https://api.velt.dev/v2/agents/execution/list
{
  "data": {
    "agentId": "abc123def456",
    "organizationId": "org_001",
    "documentId": "doc_001",
    "pageSize": 50
  }
}
```

Pagination continues via `pageToken = data.nextPageToken`; the `nextPageToken` key is omitted entirely (not `null`) when the result set is exhausted. `pageSize` is `1..100` (default 20).

### Execution counts — poll-based "N running" counters

```bash
POST https://api.velt.dev/v2/agents/execution/count
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{
  "data": {
    "agentIds": ["abc123def456", "spell-check"],
    "status": "running"
  }
}
# → { "result": { "data": { "counts": { "abc123def456": 2, "spell-check": 0 } } } }
```

`agentIds` accepts a single string or an array of 1–200 ids. Failed per-agent counts return the integer sentinel `-1` (not `null`); unknown agent ids return `0`. Omit `agentIds` for a single workspace-wide `total`.

### Agent groups

```bash
# Create a group with initial members and immutable metadata.
POST https://api.velt.dev/v2/agents/groups/create
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{
  "data": {
    "name": "Brand QA",
    "description": "All brand-quality agents",
    "agentIds": ["abc123def456", "spell-check"],
    "metadata": { "clientOrganizationId": "org_001" }
  }
}

# Membership changes go through add-agents / remove-agents, never through /update.
POST https://api.velt.dev/v2/agents/groups/add-agents
{ "data": { "groupId": "grp_9f3ac2", "agentIds": ["xyz789ghi012"] } }

POST https://api.velt.dev/v2/agents/groups/remove-agents
{ "data": { "groupId": "grp_9f3ac2", "agentIds": ["spell-check"] } }

# Filter an agent list to a group's members.
POST https://api.velt.dev/v2/agents/get
{ "data": { "groupId": "grp_9f3ac2" } }
```

`add-agents` and `remove-agents` are idempotent (`arrayUnion` / `arrayRemove`); re-adding a member or removing a non-member is a silent success. The membership cap of 100 is enforced atomically. Deleting a group (`/v2/agents/groups/delete`) removes the group document only — member agents are untouched.

### Prompt authoring chain

`/v2/agents/prompt/*` and `/v2/agents/config/resolve` are pure design tools — they do not create or modify agents:

```bash
# 1. Check whether a raw prompt is specific enough.
POST https://api.velt.dev/v2/agents/prompt/enhance
{ "data": { "prompt": "Check that the page uses our brand colors" } }
# → { "enhancedPrompt": { "requirement": "Please specify which brand colors..." } }

# 2. Expand a simple instruction into a structured task.
POST https://api.velt.dev/v2/agents/prompt/validate
{ "data": { "prompt": "Make sure there are no broken links on the page" } }
# → { "validationResult": { "analysis_prompt": "## Objective\n...", "demos": { ... } } }

# 3. Iterate the analysis prompt against demo failures.
POST https://api.velt.dev/v2/agents/prompt/refine
{
  "data": {
    "analysisPrompt": "## Objective\nIdentify all broken links...",
    "demoFeedback": [
      {
        "demoId": "demo-1",
        "demoTitle": "Mailto link with malformed address",
        "demoHtml": "<a href=\"mailto:invalid email@\">Email us</a>",
        "demoExpected": "detected",
        "feedback": "Malformed mailto links should also count as broken."
      }
    ]
  }
}

# 4. Recommend contextGathering / execution strategies for the final instructions.
POST https://api.velt.dev/v2/agents/config/resolve
{ "data": { "instructions": "Verify all CTAs use the primary brand color #1A73E8." } }
# → { "resolvedConfig": { "extraction_strategies": [...], "execution_strategy": "ai" } }
```

`/v2/agents/extract` bulk-imports an existing checklist (CSV / PDF / XLSX / plain text) into a list of agent configs that can be passed straight into `/v2/agents/create`:

```bash
POST https://api.velt.dev/v2/agents/extract
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{
  "data": {
    "fileBase64": "QWdlbnQgTmFtZSxEZXNjcmlwdGlvbixJbnN0cnVjdGlvbnMK...",
    "mimeType": "text/csv",
    "fileName": "qa-checklist.csv"
  }
}
```

### Analytics

```bash
POST https://api.velt.dev/v2/agents/analytics/get
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{ "data": { "agentId": "abc123def456", "year": "2026", "month": "03" } }
```

Response `analytics.tokenUsage` is broken down by `allTime`, `yearly[year][provider_model]`, `monthly[month][provider_model]`, and `byModel[provider_model]`. `year` must match `^\d{4}$`; `month` must match `^(0[1-9]|1[0-2])$`.

**Verification Checklist:**
- [ ] Every request wraps payload fields in `{ "data": { ... } }`
- [ ] Both `x-velt-api-key` and `x-velt-auth-token` headers are sent on every call
- [ ] Endpoint paths are verbatim, including `/v2/` — no stale `/v2/agents/list-agent-executions` (replaced by `/v2/agents/execution/list`)
- [ ] After `/v2/agents/execution/run`, callers poll `/v2/agents/execution/get` until `execution.status !== "running"` before reading results
- [ ] Per-URL `results` are read from `/v2/agents/execution/get` with `includeResults: true` only — never from `/v2/agents/execution/list`
- [ ] `/v2/agents/execution/list` filter combos are one of `{agentId}`, `{organizationId, documentId}`, or all three; every other shape (including `{}`) is rejected
- [ ] Behavioral edits go through `/v2/agents/version/update` (creates a new version); identity-only edits go through `/v2/agents/update` (no version bump)
- [ ] Server-managed fields (`managedBy`, `metadata.type/category/internal/apiKey`, `id`, `version`, `createdAt`, `updatedAt`) are never sent on create / version update
- [ ] Auth secrets returned as `"__redacted__"` are preserved by omission on subsequent version updates; only rotated by sending a new plaintext value
- [ ] `/v2/agents/groups/update` is used only for `name` / `description`; membership changes use `add-agents` / `remove-agents`
- [ ] `/v2/agents/execution/count` callers treat a per-agent value of `-1` as "count failed" and `0` as "unknown or zero", both distinct from `null`
- [ ] `/v2/agents/versions/restore` is only called when the current version is `> 1`

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/create - "Create Agent"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/get - "Get Agent(s)"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/update - "Update Agent (Identity)"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/delete - "Delete Agent"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/extract - "Extract Agents from File"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/execution/run - "Run Execution"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/execution/get - "Get Execution"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/execution/list - "List Executions"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/execution/count - "Count Executions"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/config/resolve - "Resolve Config"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/analytics/get - "Get Agent Analytics"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/prompt/enhance - "Enhance Prompt"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/prompt/validate - "Validate Prompt"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/prompt/refine - "Refine Prompt"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/version/update - "Update Agent Version"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/versions/list - "List Agent Versions"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/versions/restore - "Restore Agent Version"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/create - "Create Agent Group"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/get - "Get Agent Group"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/list - "List Agent Groups"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/update - "Update Agent Group"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/delete - "Delete Agent Group"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/add-agents - "Add Agents to Group"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/remove-agents - "Remove Agents from Group"
