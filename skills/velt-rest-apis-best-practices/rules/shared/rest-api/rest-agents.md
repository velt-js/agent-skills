---
title: Create, Update, and Version Review Agents with the Agents REST API
impact: HIGH
impactDescription: Agent configs are validated strictly and versioned; a wrong endpoint or a fetch-modify-send of redacted secrets silently breaks agents
tags: rest, api, agents, review-agents, create, versions, postProcess, contextGathering, execution, mcp-tools, rest-api-strategy, redacted, built-in
---

## Create, Update, and Version Review Agents with the Agents REST API

Review agents review a URL and post findings as comment annotations. The `/v2/agents/*` family is all `POST` under `https://api.velt.dev/v2` with the API-key-level headers. **Identity** (`name`, `description`, `enabled`) is edited with `/v2/agents/update` and creates no version; **behavior** (instructions, context gathering, execution, post-processing, input, scope, setup) is edited with `/v2/agents/version/update`, which writes version N+1. Built-in agents (`spell-check`, `broken-links`, and others) are pre-registered: run them by ID without creating anything (see `rest-agents-builtin-options`).

**Incorrect (behavioral change sent to the identity endpoint):**

```bash
# /v2/agents/update silently drops instructions and execution, and still returns 200.
POST https://api.velt.dev/v2/agents/update
{ "data": { "agentId": "abc123def456", "instructions": "Also check footer links." } }
```

**Correct (behavioral change creates a new version):**

```bash
POST https://api.velt.dev/v2/agents/version/update
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{ "data": { "agentId": "abc123def456", "instructions": "Check headings use 'Inter'. Also check footer links." } }
# -> { "result": { "data": { "version": 4 } } }
```

### Create Agent: required fields

`/v2/agents/create` requires `name`, `description`, `enabled`, `contextGathering` (with at least one entry in `strategies`), and `execution`. Send `"execution": {}` to accept the default `"ai"` strategy. `instructions` is required for every strategy that consumes a prompt (`ai`, `service+ai`, `stagehand-agent`, `mcp-tools`); only pure `service` agents may omit it.

```json
{
  "data": {
    "name": "Brand Color Checker",
    "description": "Verifies CTAs use the primary brand color",
    "enabled": true,
    "instructions": "Verify all CTAs use the primary brand color #1A73E8.",
    "contextGathering": { "strategies": ["web-page-text", "web-page-screenshot"] },
    "execution": {},
    "metadata": { "team": "growth" }
  }
}
```

Returns `result.data.agentId`. The workspace has a cap on custom agents; `RESOURCE_EXHAUSTED` means it is reached. Server fields (`id`, `version`, `createdAt`, `updatedAt`) are never accepted on create or version update. `metadata` is free-form client metadata.

**Config blocks to get right:**

- `contextGathering.strategies`: `web-page-text`, `web-page-screenshot`, `web-page-html`, `web-page-css`, `web-page-links`, `web-page-accessibility`, `computed-styles` (needs `strategyOptions["computed-styles"].selectors`), `robots-txt`, `sitemap-data`, `lighthouse`, `rest-api` (needs `strategyOptions["rest-api"].endpoints`, 1 to 10), `none`.
- `execution.executionStrategy`: `ai` (default), `service` / `service+ai` (need `serviceId`: `broken-links`, `crawler`, `screenshot`, `accessibility-checker`, `og-image-checker`), `stagehand-agent` (browser agent; set `contextGathering.strategies: ["none"]`), or `mcp-tools` (needs `instructions` and 1 to 5 `execution.mcpServers`, each `{ id, url, transport: "http", auth?, allowedTools?, timeoutMs? }`).
- `execution.knowledge`: only `useMemory`, `maxChunks`, `maxPatterns`, `maxActivities` (each 1 to 20). Any other key, including the removed `sourceIds`, returns `INVALID_ARGUMENT`.
- `postProcess` rejects unknown keys. Use `deletePreviousSuggestions: { enabled }` for re-run dedup (on by default). `matchAndMerge` is accepted but inert. `pinResolution` is not configurable and is rejected. `guardrails` deduplicates findings and sanitizes HTML/XSS; it is not a confidence filter. `findingEnrichment.commentFormat` is `"plain"` or `"legacy"` (default for custom agents).
- `aiConfig` on `contextGathering` / `execution` / `response` persists only `provider` (`gemini`, `claude`, `openai`) and `execution.aiConfig.maxToolTurns` (integer 1 to 16, default 8). `model` and `responseMimeType` are accepted and discarded: to pin a model, send `aiConfig` on Run Execution instead.
- `response.useAiFormatting`, `formattingPrompt`, and `response.aiConfig` are stored but have no runtime effect yet.
- `input.userContextFields[]`: `{ id, title, type: "string" | "number" | "boolean", required?, example?, defaultValue? }`. The IDs `focusIssueTypes`, `sourceAnnotationId`, `sourcePageUrl`, and `sourceElementXpath` are reserved for run scope and rejected.
- `input.supportedVariables` is response-only and server-computed; anything you send is discarded.
- `scope.crossPage`, when present, requires `enabled`, `targetProperty`, and `pageDiscovery` (`"auto"` or `"manual"`).

### Get, update, and delete

```bash
# Single agent (custom: identity + behavioral fields; built-in: identity fields)
POST https://api.velt.dev/v2/agents/get
{ "data": { "agentId": "spell-check" } }

# List: filter "defaultOnly" | "customOnly", and/or groupId
POST https://api.velt.dev/v2/agents/get
{ "data": { "filter": "customOnly" } }

# Built-in agents accept only enabled
POST https://api.velt.dev/v2/agents/update
{ "data": { "agentId": "spell-check", "enabled": false } }

POST https://api.velt.dev/v2/agents/delete
{ "data": { "agentId": "abc123def456" } }
```

- List rows are identity-only. `executionCount` and `lastExecutedAt` appear **only on list responses**. Built-in rows carry `system: true` and `essentialDefault` (Velt's recommended default set; nothing runs automatically because of it).
- Agents marked `metadata.internal: true` are omitted from every list response but stay fetchable by `agentId`, so a list is not a complete inventory of resolvable IDs.
- Identify built-in agents by `id`; display names can change between releases.
- `update` with no recognized field is a silent no-op for custom agents and `INVALID_ARGUMENT` for built-in agents (which need `enabled`; `name`/`description` are ignored for them). Updating a non-existent agent returns `INTERNAL`, not `NOT_FOUND`.
- `delete` is idempotent (200 for an unknown ID) and first removes the agent from every group; if that cleanup fails, the delete aborts and can be retried.

### Version updates: one-level merge and redacted secrets

`/v2/agents/version/update` merges each top-level block you send onto the stored one, but **anything nested is replaced wholesale**. Sending `scope.crossPage` with only some keys discards the stored `pages`; sending `execution.mcpServers` replaces the whole array.

`get` and `versions/list` return stored secrets (`rest-api` endpoint `auth`, `mcpServers[].auth`) as the literal `"__redacted__"`. **Sending that string back stores it as the real credential**, and the agent starts failing at execution time.

**Incorrect (fetch-modify-send round trip):**

```javascript
// veltPost(path, data): server-side POST to https://api.velt.dev with { data } and the API-key-level headers
const { agent } = (await veltPost('/v2/agents/get', { agentId })).result.data;
agent.execution.knowledge = { useMemory: true, maxChunks: 10 };
// mcpServers[].auth.token is "__redacted__" and is now saved as the token.
await veltPost('/v2/agents/version/update', { agentId, execution: agent.execution });
```

**Correct (omit secret-bearing blocks, or resend real plaintext secrets):**

```javascript
await veltPost('/v2/agents/version/update', {
  agentId,
  execution: {
    executionStrategy: 'mcp-tools',
    mcpServers: [
      { id: 'docs', url: 'https://docs.example.com/mcp', auth: { type: 'bearer', token: process.env.DOCS_MCP_TOKEN } }
    ],
    knowledge: { useMemory: true, maxChunks: 10 }
  }
});
```

- `instructions` is re-validated against the merged result; blanking it on an AI agent is rejected.
- In-flight executions stay pinned to the version they started on.
- `versions/list` returns the full history newest first, with no pagination. `versions[].id` is `"v{N}"` (for example `"v3"`) and `versions[].version` is the integer. Snapshots are behavioral only; read `name`/`description`/`enabled` from `/v2/agents/get`. An unknown agent returns an empty `versions` array, not an error.
- `versions/restore` is a single-step undo from N to N-1 with no target parameter. At version 1 it returns `FAILED_PRECONDITION`.

**Verification Checklist:**
- [ ] Every request is `POST` with `{ "data": { ... } }` and both API-key-level headers
- [ ] Create payloads include `name`, `description`, `enabled`, `contextGathering.strategies` (at least one), `execution`, and `instructions` for prompt-consuming strategies
- [ ] Identity edits go to `/v2/agents/update`; behavioral edits go to `/v2/agents/version/update`
- [ ] `postProcess` uses `deletePreviousSuggestions`, never relies on `matchAndMerge`, and never sends `pinResolution`
- [ ] Model pinning is done per run (Run Execution `aiConfig`), not on the agent config
- [ ] `knowledge` sends only the four allowed keys; `userContextFields` IDs avoid the four reserved run-scope names
- [ ] Version updates send complete nested objects and never resend `"__redacted__"` secrets
- [ ] List consumers read `executionCount` / `lastExecutedAt` from list rows and expect `metadata.internal` agents to be absent
- [ ] `versions[].id` is treated as a `v{N}` string; restore is not called at version 1
- [ ] Missing-agent handling accounts for `INTERNAL` on update and `200` on delete

**Source Pointers:**
- https://docs.velt.dev/ai/agents/overview - "Review Agents"
- https://docs.velt.dev/ai/agents/setup - "Setup"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/create - "Create Agent"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/get - "Get Agent(s)"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/update - "Update Agent"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/delete - "Delete Agent"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/version/update - "Update Agent Version"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/versions/list - "List Agent Versions"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/versions/restore - "Restore Agent Version"
