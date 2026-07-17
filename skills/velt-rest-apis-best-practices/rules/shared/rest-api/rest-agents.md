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
    "description": "Validates brand colors, logos, and typography across pages",
    "enabled": true,
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
    "instructions": "Check headings use 'Inter' font. Verify #1A73E8 on all CTAs and links.",
    "postProcess": {
      "guardrails": { "enabled": true },
      "deletePreviousSuggestions": { "enabled": true }
    }
  }
}
# → { "result": { "data": { "version": 4 } } }

POST https://api.velt.dev/v2/agents/versions/restore
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{ "data": { "agentId": "abc123def456" } }
# → { "result": { "data": { "version": 3 } } }
```

Server-generated fields (`id`, `version`, `createdAt`, `updatedAt`) are never accepted on `/v2/agents/create` or `/v2/agents/version/update`; `metadata` itself is now free-form client metadata (no reserved keys). Auth secrets in `contextGathering.strategyOptions["rest-api"]` and `execution.mcpServers[].auth` are encrypted at rest and returned as `"__redacted__"` on `get` / `versions/list`; rotate by sending the new plaintext, keep by omitting the field.

### Create Agent — required fields and postProcess shape

`/v2/agents/create` now requires `name`, `description`, `enabled`, `contextGathering`, and `execution` on every payload. `contextGathering.strategies` must contain at least one strategy. Send `"execution": {}` to accept the defaults (`executionStrategy: "ai"`); the field is required but its inner keys are not.

**Incorrect** (stale minimum payload — omits `description`, `enabled`, `execution`, and the `strategies` array — rejected with `INVALID_ARGUMENT`):

```json
{
  "data": {
    "name": "Simple Content Checker",
    "instructions": "Check for broken images and missing alt text on the page.",
    "contextGathering": {}
  }
}
```

**Correct** (current minimum payload):

```json
{
  "data": {
    "name": "Simple Content Checker",
    "description": "Checks for broken images and missing alt text",
    "enabled": true,
    "instructions": "Check for broken images and missing alt text on the page.",
    "contextGathering": { "strategies": ["web-page-html"] },
    "execution": {}
  }
}
```

`postProcess` now rejects unknown keys. The active dedup mechanism is `postProcess.deletePreviousSuggestions` — a `{ enabled?: boolean }` block that clears the prior run's suggestions per URL before writing the new ones. `postProcess.matchAndMerge` is still accepted for backward compatibility but is **inert** (deprecated / ignored); do not rely on it and do not recommend it as the dedup strategy. `postProcess.pinResolution` is no longer a configurable key — pin resolution always runs internally as part of the pipeline and sending it returns `INVALID_ARGUMENT`.

`postProcess.guardrails` is now the finding-quality pipeline: it deduplicates findings (identical source URL + target text + occurrence + issue type) and sanitizes HTML / XSS from all text fields. It is **not** a confidence floor — findings below any threshold are no longer suppressed by `guardrails`, so any legacy guidance tying `guardrails` to a `<50` confidence cut is stale.

`execution.serviceId` accepts `"broken-links"`, `"crawler"`, `"screenshot"`, `"accessibility-checker"`, and `"og-image-checker"`. `response.responseAdapter` accepts `"broken-links-response"`, `"crawler-response"`, `"screenshot-response"`, `"accessibility-checker-response"`, and `"og-image-checker-response"`.

`aiConfig.maxToolTurns` (both `contextGathering.aiConfig` and `execution.aiConfig`) is an integer in the closed range `1..16` with a default of `8`. Values outside that range are rejected at config time — do not send `maxToolTurns: 32` expecting silent clamping.

### Run Execution — required IDs and error codes

`/v2/agents/execution/run` now requires `organizationId` and `documentId` at the top level of the body. This is a hard precondition, not an optional persistence hint: the target document must already exist, findings are persisted to it as comment annotations, and unknown documents return `NOT_FOUND`.

**Incorrect** (missing IDs — findings have nowhere to land, and current schema rejects the payload):

```json
{
  "data": {
    "agentId": "abc123def456",
    "url": "https://example.com"
  }
}
```

**Correct** (both IDs supplied, document must already exist):

```json
{
  "data": {
    "agentId": "abc123def456",
    "url": "https://example.com",
    "organizationId": "org_001",
    "documentId": "doc_001"
  }
}
```

Error surface for `/v2/agents/execution/run`:

| Code                  | When it fires                                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `INVALID_ARGUMENT`    | Invalid URL, missing `agentId` / `organizationId` / `documentId`, invalid `trigger` or `deviceType`.             |
| `NOT_FOUND`           | Store database not found, **or the target document does not exist**.                                             |
| `ALREADY_EXISTS`      | Another execution is already running for this `agentId` + `documentId` combo. The error message includes the running execution's ID — log it so retriers can join or drop. |
| `RESOURCE_EXHAUSTED`  | The workspace's AI credits are exhausted.                                                                        |

### Execution response — `metadata`, `matchResult`, and finding fields

- `execution.metadata` now uses `organizationId` and `documentId` (not `clientOrganizationId` / `clientDocumentId`). Both are echoed verbatim from the `Run Execution` payload; empty string when absent. Any consumer reading `metadata.clientOrganizationId` / `metadata.clientDocumentId` is bound to a retired shape.
- `resultsSummary.totalAnnotationsCreated` is now defined under delete-and-recreate reruns: it counts the fresh annotations written by this run **after** clearing the prior run's suggestions per URL — no longer "after match-and-merge dedup".
- `resultsSummary.matchResult` (`{ created, skipped, resolved }`) is **legacy**. Only old execution documents carry it; new executions run per-URL delete-and-recreate and never write this field. Do not treat `matchResult.created` / `.skipped` / `.resolved` as a normal integration path, and never depend on it being present.
- Per-result `issueType` is an **issue classification tag** (short, lowercase, hyphenated — e.g. `"casing"`, `"pii"`, `"spelling"`, `"broken-link"`). It is not a match-and-merge key.
- Per-result `confidence` is the 0–100 score reported by the agent; guardrails no longer suppress findings under any threshold, so `< 50` is returned to consumers unchanged.

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

List rows now include the same `metadata: { organizationId, documentId }` block as `Get Execution`, echoing the IDs passed on `Run Execution`. Consumers can read those IDs directly off list rows without a follow-up `Get` roundtrip.

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

Group `metadata` is a free-form object of your own keys — `organizationId`, `documentId`, and anything else you want to stamp on the group (e.g. `team`). The retired `clientOrganizationId` / `clientDocumentId` / `clientGroupId` pair and the server-hashed `server_org_001` / `server_doc_001` values are gone from every group example (Create / Get / List). Rule examples must not carry them.

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
    "metadata": {
      "organizationId": "org_001",
      "documentId": "doc_001",
      "team": "growth"
    }
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

`/v2/agents/groups/list` may include **system groups** that the platform auto-creates while classifying newly-created agents into default buckets (deterministic IDs like `copy-qa`, `seo`, `design-checks`). System rows carry `system: true`; customer-created groups do not have that field. Consumers who only want customer-created groups should filter `system !== true`, and callers should expect deterministic IDs to appear on `list` without an explicit `Create Group` call.

### Get Agent — response shape

`/v2/agents/get` responses no longer expose `metadata.internal`, `metadata.type`, `metadata.category`, or `metadata.apiKey`, and the docs no longer mention "internal built-ins (`crawler`, `screenshot`) excluded from list responses". Any consumer that filtered on those reserved metadata keys or expected internal built-ins to be hidden from `list` is bound to stale behavior — drop that logic.

Built-in agents return their identity fields (`id`, `name`, `description`, `enabled`, `managedBy`, `system`, and `input` when declared); custom agents additionally return the version-subcollection behavioral fields. Auth secrets remain returned as `"__redacted__"`.

`executionCount` and `lastExecutedAt` are returned **only on list responses**, not on single-agent `Get`. To read those counters, call `/v2/agents/get` without an `agentId` (list form) and pick the row you need — do not expect them on `{ "agentId": "..." }` fetches.

### Update Agent — no-op semantics

`/v2/agents/update` is not schema-guarded to require at least one of `name` / `description` / `enabled`:

- **Custom agents:** a request with no recognized field succeeds as a **silent no-op** (returns 200, changes nothing). Do not rely on "send-nothing" as a validation error — validate the payload client-side before dispatch.
- **Built-in agents:** the request must include `enabled` or it returns `INVALID_ARGUMENT`. `name` and `description` sent alongside `enabled` are **silently ignored** for built-in agents rather than rejected. Route built-in identity edits through `enabled` only.

### List Agent Versions — v{N} id format and behavioral-only snapshots

Version snapshots are now **behavioral-only**. Identity fields (`name`, `description`, `enabled`, `managedBy`) live on the root agent document; they are no longer duplicated inside `versions[]`. Any rule example or consumer that pulled `versions[].name` / `.description` is stale — route agent-identity reads to `/v2/agents/get`.

`versions[].id` is a stable string in the `v{N}` format (e.g. `"v1"`, `"v2"`, `"v3"`) — no longer bare-number strings. Callers that key by `id` must migrate: mixing `"3"` with `"v3"` will silently miss matches. `versions[].version` (the integer version number) is unchanged.

Version-snapshot `postProcess` mirrors the create/update shape — expect `deletePreviousSuggestions`, not `matchAndMerge`, in current snapshots.

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
- [ ] `/v2/agents/create` payloads include all required fields: `name`, `description`, `enabled`, `contextGathering` (with ≥1 `strategies`), and `execution` (send `{}` for defaults)
- [ ] `postProcess` uses `deletePreviousSuggestions` for per-URL dedup — never `matchAndMerge` (accepted-but-inert) — and does not send `pinResolution` (rejected)
- [ ] `postProcess.guardrails` is treated as a dedup + HTML/XSS sanitization pipeline, not as a `< 50` confidence filter
- [ ] `aiConfig.maxToolTurns` is an integer in `1..16`; out-of-range values are not sent
- [ ] `/v2/agents/execution/run` payloads include both `organizationId` and `documentId` — they are required, and the target document must already exist
- [ ] `/v2/agents/execution/run` callers handle `ALREADY_EXISTS` (concurrent execution — log the running executionId from the error message), `RESOURCE_EXHAUSTED` (AI credits), and `NOT_FOUND` (unknown target document) in addition to `INVALID_ARGUMENT`
- [ ] After `/v2/agents/execution/run`, callers poll `/v2/agents/execution/get` until `execution.status !== "running"` before reading results
- [ ] Per-URL `results` are read from `/v2/agents/execution/get` with `includeResults: true` only — never from `/v2/agents/execution/list`
- [ ] Execution response consumers read `metadata.organizationId` / `metadata.documentId` (not `client*`), and do not depend on the legacy `resultsSummary.matchResult` block being present
- [ ] `/v2/agents/execution/list` filter combos are one of `{agentId}`, `{organizationId, documentId}`, or all three; every other shape (including `{}`) is rejected
- [ ] Behavioral edits go through `/v2/agents/version/update` (creates a new version); identity-only edits go through `/v2/agents/update` (no version bump)
- [ ] `id`, `version`, `createdAt`, `updatedAt` are never sent on `create` / `version/update` — they are server-generated
- [ ] Custom-agent `/v2/agents/update` calls include at least one of `name` / `description` / `enabled` (empty payloads succeed silently); built-in-agent updates always include `enabled` (`name`/`description` are ignored)
- [ ] Version-snapshot consumers read `versions[].id` as a `v{N}` string (not a bare number) and route identity reads (`name`, `description`) to `/v2/agents/get`, not to `versions[]`
- [ ] Agent-`get` consumers pull `executionCount` / `lastExecutedAt` from list responses, not single-agent fetches
- [ ] Agent-group `metadata` uses top-level `organizationId` / `documentId` and free-form keys — no `clientOrganizationId` / `clientDocumentId` / `clientGroupId` / `server_org_*` / `server_doc_*`
- [ ] `/v2/agents/groups/list` consumers filter or branch on `system: true` when they want only customer-created groups
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
