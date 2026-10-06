---
title: Run Agent Executions Asynchronously and Read Results Correctly
impact: HIGH
impactDescription: Executions are async and their statuses are counter-intuitive; treating failed as broken or skipping the poll loop misreports every run
tags: rest, api, agents, executions, run, poll, status, urls, agentIds, suite, focusIssueTypes, sourceAnnotationId, aiConfig, list, count, results
---

## Run Agent Executions Asynchronously and Read Results Correctly

`POST /v2/agents/execution/run` returns an `executionId` immediately. Poll `POST /v2/agents/execution/get` until `execution.status !== "running"`, and read per-URL findings only from `get` with `includeResults: true`. Status names describe findings, not health: **`passed` means no findings, `failed` means findings were found**, `partial` means some pages errored, and `error` means nothing usable was produced.

**Incorrect (treats `failed` as a broken run and reads results from the list endpoint):**

```javascript
const { executionId } = (await veltPost('/v2/agents/execution/run', { agentId, url })).result.data;
const list = await veltPost('/v2/agents/execution/list', { agentId });
const run = list.result.data.executions[0];
if (run.status === 'failed') retry(); // Wrong: "failed" means the agent found issues.
// Also wrong: run is missing organizationId/documentId, and list rows never include results.
```

**Correct (required IDs, poll Get Execution, branch on status):**

```javascript
// veltPost(path, data): server-side POST to https://api.velt.dev with { data } and the API-key-level headers
const run = await veltPost('/v2/agents/execution/run', {
  agentId: 'abc123def456',
  url: 'https://example.com/pricing',
  organizationId: 'org_001',
  documentId: 'doc_001',     // must already exist; findings land here as comment annotations
  ranBy: { userId: 'user_123' }
});
const { executionId } = run.result.data;

let execution;
do {
  await new Promise((r) => setTimeout(r, 5000));
  execution = (await veltPost('/v2/agents/execution/get', { executionId })).result.data.execution;
} while (execution.status === 'running');

switch (execution.status) {
  case 'passed':  /* clean: no findings */ break;
  case 'failed':  /* findings found: fetch them */ break;
  case 'partial': /* some pages errored: see resultsSummary.erroredUrls */ break;
  case 'error':   /* see execution.error.code and error.retryable */ break;
  case 'skipped': /* precondition not met */ break;
}

const { results } = (await veltPost('/v2/agents/execution/get', { executionId, includeResults: true })).result.data;
const findings = results.flatMap((row) => row.agentResult.findings);
```

### Run Execution request

| Field | Notes |
|-------|-------|
| `agentId` or `agentIds` | One is required. `agentIds` runs 1 to 10 distinct agents; when both are sent, `agentId` wins and `agentIds` is ignored |
| `url` | Required. Public `http(s)` seed URL. Loopback, link-local, metadata, private-network, `*.local` and `*.internal` hosts are refused |
| `organizationId`, `documentId` | Required. Unknown document returns `NOT_FOUND` |
| `urls` | Optional page list, max 500: absolute URLs or site-relative paths on the same host as `url`. Skips the crawl |
| `pageListTotal` | Optional, with `urls`: size of the source list before you cut it. Larger than the run's pages adds a `pages-truncated` warning |
| `crossPageExecute`, `maxUrlsToProcess` | Crawl mode (default `false`, max default 50). Ignored and derived when `urls` is sent |
| `deviceType` | `"desktop"` (default) or `"mobile"`. `mobile-inspector` always runs as mobile |
| `annotationVisibility` | `"private"` (default, organization members only) or `"public"` |
| `trigger`, `workflowExecutionId` | `"standalone"` (default) or `"workflow"` with the parent workflow execution ID |
| `ranBy` | `{ userId, name?, email? }` |
| `userContext` | Values for the agent's `userContextFields`, built-in per-run options, and the four run-scope keys below |
| `aiConfig` | Per-run model override, validated against an allowlist (see below) |

**Page lists.** `urls` entries are normalized: blank entries skipped, `#fragment` dropped, review toolbar query params removed, other query params kept, off-host or non-URL entries and repeats dropped. More than 500 entries, or a list where nothing survives, returns `INVALID_ARGUMENT`. The execution then reports `config.pageSource: "list"`, `config.seedUrl` as the first page, and `crawlerResults.status: "skipped"`.

**Several agents (`agentIds`).** Each agent gets its own execution and every other field applies to all of them. On several pages, the page list is resolved once and each page loads once for all agents. The response differs from a single run:

```json
{ "result": { "status": "success", "message": "Agent suite created successfully", "data": {
  "executions": [ { "agentId": "spell-check", "executionId": "exec_..._spellcheck" } ],
  "failed": [ { "agentId": "broken-links", "code": "already-exists", "message": "Agent execution is already running ... Execution ID: exec_..." } ]
} } }
```

Poll every `executionId` in `data.executions`. Per-agent problems (`already-exists`, `invalid-argument`, `not-found`, `permission-denied`, `resource-exhausted`, `internal`) land in `data.failed` and the others still start. The request fails only when no agent could start; then `error.details.failed` lists every agent.

**Run-scope `userContext` keys (any agent):**

| Key | Effect |
|-----|--------|
| `focusIssueTypes` | 1 to 50 issue types. Reports only those, and replaces only the agent's earlier pending suggestions of those types (a focused recheck) |
| `sourceAnnotationId` | The comment that asked for the run; copied to each finding's `agent.reason` |
| `sourcePageUrl` | Page of that comment; copied with `sourceAnnotationId` |
| `sourceElementXpath` | XPath of the element the comment is pinned on; findings on that element of `sourcePageUrl` are dropped |

A malformed run-scope key returns `INVALID_ARGUMENT` before any run starts, with `error.details.issues`. Re-run dedup follows `postProcess.deletePreviousSuggestions` and never touches suggestions a user already resolved.

**Per-run `aiConfig`.** Unknown keys are rejected and an empty object is rejected. Fields: `provider` (`gemini`, `claude`, `openai`), `model` (allowlisted), `defaultModels` (per-provider map), `maxToolTurns` (1 to 16), `modelChecks` (only `"image-crop"` today). Send `provider` with `model`: a `model` without `provider` that does not match the agent's resolved provider is silently dropped and the run still returns 200. Get Execution reports the answering model in `llmModel` and any provider fallbacks in `providerFallbacks`. If the workspace stored its own provider keys (`aiModelApiKey` on `/v2/workspace/apikeyconfig/update`), runs prefer those providers.

**Run errors:** `INVALID_ARGUMENT` (bad URL, missing IDs, bad `urls`, `aiConfig`, run-scope key, or `userContext` field; `agentIds` outside 1 to 10), `NOT_FOUND` (document missing), `ALREADY_EXISTS` (same agent already running on this document; the message includes the running execution ID; a stalled run is ended with `STALE_RUN` instead), `RESOURCE_EXHAUSTED` (AI credits), `INTERNAL` (`Failed to dispatch agent execution task.`; the created executions end with `TASK_DISPATCH_FAILED`; resend).

### Reading an execution

- `execution.metadata.organizationId` / `documentId` echo the run IDs (not `clientOrganizationId`).
- `resultsSummary`: `totalFindings`, `totalAnnotationsCreated` (fresh annotations after delete-and-recreate), `urlsProcessed`, `urlsWithFindings`, `urlsErrored`, `erroredUrls` (max 50), `severityCounts` (sparse; missing key means 0), `findings` (top 50 sample). `matchResult` is legacy and absent on new runs.
- `error.code` includes `TIMEOUT`, `LLM_ERROR`, `CRAWLER_ERROR`, and run-level codes `TASK_DISPATCH_FAILED`, `STALE_RUN`, `SUITE_TIMEOUT`, `RUN_ATTEMPTS_EXHAUSTED`, `MALFORMED_TASK`. Check `error.retryable`.
- Per-URL rows (`includeResults: true`) nest findings under `results[i].agentResult.findings`, not on the row. Test page failure with `agentResult.status === "failed"`; `agentResult.error` is always present (null on success).
- Each finding has `severity`, `targetText`, `occurrence`, `suggestion`, `suggestedFix?`, `htmlSelector`, `targetElementXpath`, `isPageLevel`, `issueType`, `confidence` (0 to 100, not filtered), `reasonExtras`, `metadata`, and `evidence`. Render `evidence.html` as text, never as markup.

### List and count

```bash
# Exactly one of three filter shapes: { agentId }, { organizationId, documentId }, or all three
POST https://api.velt.dev/v2/agents/execution/list
{ "data": { "organizationId": "org_001", "documentId": "doc_001", "pageSize": 20 } }
# -> data.executions[] (newest first), data.nextPageToken (key absent on the last page)

# Poll-friendly counters
POST https://api.velt.dev/v2/agents/execution/count
{ "data": { "agentIds": ["abc123def456", "spell-check"], "status": "running" } }
# -> data.counts: { "abc123def456": 2, "spell-check": 0 }   (-1 means that count failed)
```

`list` and `count` reject unknown top-level fields. `pageSize` is 1 to 100. Omit `agentIds` on `count` for a single `data.total`.

**Verification Checklist:**
- [ ] Run requests include `organizationId` and `documentId` for an existing document, plus `agentId` or `agentIds`
- [ ] Callers poll `/v2/agents/execution/get` until `status !== "running"` and read findings from `results[].agentResult.findings` with `includeResults: true`
- [ ] Status handling treats `failed` as "findings found" and `passed` as "no findings", and handles `partial`, `error`, and `skipped`
- [ ] `agentIds` runs poll every ID in `data.executions` and surface `data.failed`
- [ ] `urls` lists stay within 500 same-host entries; `crossPageExecute` / `maxUrlsToProcess` are not sent alongside them
- [ ] Run-scope keys (`focusIssueTypes`, `sourceAnnotationId`, `sourcePageUrl`, `sourceElementXpath`) are well-formed
- [ ] `aiConfig.model` is always paired with `provider` (or `defaultModels` is used)
- [ ] `ALREADY_EXISTS`, `RESOURCE_EXHAUSTED`, `NOT_FOUND`, and `INTERNAL` are handled on run
- [ ] `list` uses one of the three filter shapes and paginates until `nextPageToken` is absent
- [ ] `count` consumers treat `-1` as a failed count

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/execution/run - "Run Execution"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/execution/get - "Get Execution"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/execution/list - "List Executions"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/execution/count - "Count Executions"
- https://docs.velt.dev/ai/agents/overview#execution-statuses - "Execution statuses"
- https://docs.velt.dev/ai/agents/setup - "Setup"
