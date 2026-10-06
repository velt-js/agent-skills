---
title: Use Agent Groups, Prompt Tools, Extract, and Analytics Correctly
impact: MEDIUM
impactDescription: Groups have hard limits and immutable metadata, and the prompt tools return drafts that need mapping before Create Agent accepts them
tags: rest, api, agents, groups, system-groups, prompt, enhance, validate, refine, config-resolve, extract, analytics, token-usage
---

## Use Agent Groups, Prompt Tools, Extract, and Analytics Correctly

Groups bundle custom and built-in agents for filtering. The prompt tools (`prompt/enhance`, `prompt/validate`, `prompt/refine`, `config/resolve`) and `extract` are design helpers: they never create or modify agents, and their outputs must be mapped onto the Create Agent shape. All are `POST` with the API-key-level headers.

**Incorrect (membership and metadata changes through the update endpoint):**

```bash
# Rejected: update is .strict() and only accepts name and description.
POST https://api.velt.dev/v2/agents/groups/update
{ "data": { "groupId": "K3mR7pQxN2vB9wLdT4sY", "agentIds": ["spell-check"], "metadata": { "team": "growth" } } }
```

**Correct (metadata at creation, membership through add/remove):**

```bash
POST https://api.velt.dev/v2/agents/groups/create
{ "data": {
    "name": "Brand QA",
    "description": "All brand-quality agents",
    "agentIds": ["abc123def456", "spell-check"],
    "metadata": { "organizationId": "org_001", "documentId": "doc_001", "team": "growth" }
} }

POST https://api.velt.dev/v2/agents/groups/add-agents
{ "data": { "groupId": "K3mR7pQxN2vB9wLdT4sY", "agentIds": ["broken-links"] } }

POST https://api.velt.dev/v2/agents/groups/remove-agents
{ "data": { "groupId": "K3mR7pQxN2vB9wLdT4sY", "agentIds": ["spell-check"] } }

# List the agents of one group
POST https://api.velt.dev/v2/agents/get
{ "data": { "groupId": "K3mR7pQxN2vB9wLdT4sY" } }
```

### Group rules

- Limits: 50 groups per workspace and 100 agents per group. The 50 includes up to 5 auto-provisioned **system groups** (`copy-qa`, `seo`, `design-checks`, `performance`, `brand-checks`), so `RESOURCE_EXHAUSTED` can arrive at 45 of your own groups.
- `metadata` is immutable after creation; the workspace `apiKey` is merged in as `metadata.apiKey`.
- On create, more than 100 `agentIds` (counted before dedup) is `INVALID_ARGUMENT`; unknown custom-agent IDs are `NOT_FOUND`; built-in IDs are accepted without lookup.
- `add-agents` and `remove-agents` are idempotent. `add-agents` returns `RESOURCE_EXHAUSTED` past 100 members.
- `groups/list` takes an empty `data` and returns `agentCount` instead of `agentIds`; call `groups/get` for full membership. System groups carry `system: true`.
- `groups/update` changes only `name` / `description` (at least one). System groups can be renamed and deleted; a deleted system group is re-provisioned the next time an agent classifies into it.
- Deleting a group never deletes its agents. Deleting an agent removes it from every group.

### Prompt tools

```bash
# 1. Is the prompt specific enough? requirement is null when it is.
POST https://api.velt.dev/v2/agents/prompt/enhance
{ "data": { "prompt": "Check that the page uses our brand colors" } }
# -> data.enhancedPrompt: { requirement, context?, suggestion?, suggestion_type? }

# 2. Expand a one-line instruction into a structured task with demos
POST https://api.velt.dev/v2/agents/prompt/validate
{ "data": { "prompt": "Make sure there are no broken links on the page" } }
# -> data.validationResult: { analysis_prompt, requires_tool, response_descriptions, demos, suggested_required_inputs }

# 3. Iterate the analysis prompt against demo feedback
POST https://api.velt.dev/v2/agents/prompt/refine
{ "data": { "analysisPrompt": "## Objective\n...", "demoFeedback": [
    { "demoId": "demo-1", "demoTitle": "Malformed mailto", "demoHtml": "<a href=\"mailto:bad@\">Email</a>", "demoExpected": "detected", "feedback": "Malformed mailto links count as broken." }
] } }
# -> data.refinerResult: { analysis_prompt, response_descriptions }

# 4. Recommend strategies for the final instructions
POST https://api.velt.dev/v2/agents/config/resolve
{ "data": { "instructions": "Verify all CTAs use #1A73E8.", "rawInstructions": "Check CTA colors" } }
# -> data.resolvedConfig: { extraction_strategies, execution_strategy, reasoning, strategy_options? }
```

- Map `suggested_required_inputs[]` (`{ name, description, example, reason }`) to `userContextFields` (`{ id: name, title: description, example, type }`) before Create Agent; sending them verbatim is rejected.
- Map `config/resolve` output: `extraction_strategies` to `contextGathering.strategies`, `strategy_options` to `contextGathering.strategyOptions` (dropping it leaves `computed-styles` inert), `execution_strategy` to `execution.executionStrategy`.
- `config/resolve` never surfaces a model failure: it returns 200 with a fallback whose `reasoning` is exactly `"Default configuration applied"`. Check for that string.
- The `provider` field on these tools accepts `gemini`, `claude`, or `openai`; other values fail with `INTERNAL` (or the fallback, on `config/resolve`).

### Extract agents from a checklist file

```bash
POST https://api.velt.dev/v2/agents/extract
{ "data": { "fileBase64": "QWdlbnQgTmFtZSxEZXNjcmlwdGlvbgo...", "mimeType": "text/csv", "fileName": "qa-checklist.csv" } }
# -> data.extractionResult: { agents[{ name, description, prompt, sourceTasks, userContextFields? }], summary, skipped, totalTasksParsed?, memory: { sourceId } }
```

Extracted agents are **drafts**, not Create Agent payloads: map `prompt` to `instructions`, and add `enabled`, `contextGathering`, and `execution` yourself (use `config/resolve`). At most 50 agents per file; files over 5 MB decoded are rejected. Every uploaded file is also stored as a Memory knowledge source (`memory.sourceId`). Handle `DEADLINE_EXCEEDED` and `UNAVAILABLE` (retry).

### Analytics

```bash
POST https://api.velt.dev/v2/agents/analytics/get
{ "data": { "agentId": "abc123def456", "year": "2026", "month": "03" } }
# -> data.analytics: { tokenUsage: { allTime, yearly?, monthly?, byModel? }, executionCounts }
```

Only `tokenUsage.allTime` and `executionCounts` are guaranteed. `monthly` appears only when `year` is sent. Model keys are `provider_model` with dots and slashes replaced by underscores (`gemini/gemini-3.6-flash` becomes `gemini_gemini-3_6-flash`). The `model` filter takes the full `provider/model` ID and narrows `byModel` only.

**Verification Checklist:**
- [ ] Group membership changes use `add-agents` / `remove-agents`; `groups/update` sends only `name` / `description`
- [ ] Group `metadata` is set at creation and never expected to change
- [ ] Group limits account for system groups; `system: true` rows are filtered when only your groups are wanted
- [ ] `suggested_required_inputs` and `extract` drafts are mapped to the Create Agent shape before use
- [ ] `config/resolve` responses with `reasoning === "Default configuration applied"` are treated as a fallback
- [ ] `strategy_options` from `config/resolve` is carried into `contextGathering.strategyOptions`
- [ ] Analytics consumers read only `allTime` and `executionCounts` unconditionally and send `year` when they need `monthly`

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/create - "Create Agent Group"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/get - "Get Agent Group"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/list - "List Agent Groups"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/update - "Update Agent Group"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/delete - "Delete Agent Group"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/add-agents - "Add Agents to Group"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/groups/remove-agents - "Remove Agents from Group"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/prompt/enhance - "Enhance Prompt"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/prompt/validate - "Validate Prompt"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/prompt/refine - "Refine Prompt"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/config/resolve - "Resolve Config"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/extract - "Extract Agents from File"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/analytics/get - "Get Agent Analytics"
