---
title: Query Memory with Search, Ask, Suggest, and Judgments Query
impact: HIGH
impactDescription: Memory responses have no data wrapper and its filters match stored values exactly; wrong decision values or scope ids silently return nothing or the whole workspace
tags: rest, api, memory, judgments, search, ask, suggest, judgments-query, documentIds, recencyDays, decision, scope, beta
---

## Query Memory with Search, Ask, Suggest, and Judgments Query

Memory (Beta) records every review decision as a read-only **judgment** and lets you query them over REST: `search` returns raw decision records, `ask` returns a written answer with citations, `suggest` recommends approve or reject for a new item, and `judgments/query` lists by metadata. All are `POST` under `https://api.velt.dev/v2/memory/` with the API-key-level headers. Unlike most v2 endpoints, **Memory responses put fields directly on `result`** (no `result.data`).

**Incorrect (`data` wrapper on the read, invented decision value, lone `documentId`):**

```javascript
const res = await veltPost('/v2/memory/search', {
  query: 'unsupported medical claim',
  documentId: 'pricing-page',          // ignored without organizationId: searches the whole workspace
  filters: { decision: 'reject' }      // stored value is "rejected": matches nothing
});
const hits = res.result.data.results;  // undefined: Memory has no data wrapper
```

**Correct (scoped by organization, exact decision value, read `result` directly):**

```javascript
// veltPost(path, data): server-side POST to https://api.velt.dev with { data } and the API-key-level headers
const res = await veltPost('/v2/memory/search', {
  query: 'unsupported medical claim',
  organizationId: 'org_eu',
  documentIds: ['pricing-page', 'homepage-redesign'],
  limit: 5,
  filters: { decision: 'rejected', judgeType: 'human' }
});
const { results, totalInScope } = res.result;
// results[]: { recordId, reasoning, decision, confidence, actionUser, createdAt, similarity, scope, agent }
```

### Scoping (search, ask, judgments/query)

| Field | Rule |
|-------|------|
| `organizationId` | Limits the read to one organization (`orgId` alias on search/ask) |
| `documentId` | Applied **only with `organizationId`**; alone it is ignored and the read stays workspace-wide |
| `documentIds` | 1 to 25 ids, only with `organizationId`. `documentId` wins when both are sent. Empty arrays, more than 25 ids, or empty ids return `INVALID_ARGUMENT` |
| `filters.decision` | Exact stored value: `comment`, `resolve`, `approved`, `rejected`, `in_progress`, `agree`, `disagree`, `endorse`, `document_approved`, `document_rejected` |
| `filters.judgeType` | `human` or `agent` |
| `filters.dateRange` | `{ start, end }` as ISO-8601 strings or epoch ms; `start` must not be after `end` |
| `filters.excludeDocumentIds` | 1 to 20 ids to leave out |
| `filters.annotationId` | Reads one comment thread oldest-first. **Requires `organizationId`** |
| `recencyDays` | 1 to 365. Returns the last N complete UTC days instead of a semantic match (good for digests); today's activity is excluded |

`search` also takes `limit` (1 to 50, default 10), `embeddingType` (`review` default, or `content`), and an explicit `scope` (`document`, `organization`, `apiKey`). Filters run after retrieval over the top `limit * 3` matches, so a selective filter can return fewer results than exist: use `judgments/query` for exhaustive metadata lookups. `totalInScope` is the count returned, not a workspace total.

### Ask

```bash
POST https://api.velt.dev/v2/memory/ask
{ "data": { "question": "How do we handle copy that makes medical claims?", "organizationId": "org_eu" } }
# -> result: { answer, citations: [{ recordId, snippet }], confidence, recordsSearched }
```

- An empty `answer` with `confidence: 0` means Memory has no grounding context yet (a new workspace starts empty). Show "nothing yet"; do not substitute a model-generated answer.
- `citations[].recordId` is not verified against the retrieved set; handle ids that do not resolve.
- `ask` ignores `limit`. With `documentIds`, an answer comes back empty when none of those documents has activity. Reviewer profiles, patterns, and alerts stay workspace-wide inputs even when you exclude documents.

### Suggest

```bash
POST https://api.velt.dev/v2/memory/suggest
{ "data": { "query": "Ad copy: clinically proven to reduce wrinkles", "organizationId": "org_eu" } }
# -> result: { primary: { recommendation: "approve" | "reject", confidence, basedOn, scope, scopeLabel, topReasons, uniqueReviewers, caveats } | null, conflict: {...} | null }
```

- `primary` is `null` when nothing matched or fewer than 2 records support the leading decision. Handle it as "no recommendation".
- `conflict` is set only when both sides have 2 or more records; show it as reviewer disagreement.
- Only `approved`, `agree`, `endorse`, `document_approved` count toward approve, and only `rejected`, `disagree`, `document_rejected` toward reject.
- `suggest` takes `query`, `organizationId`, and `documentId` (no `documentIds`).

### Judgments query

```bash
POST https://api.velt.dev/v2/memory/judgments/query
{ "data": { "organizationId": "org_eu", "documentIds": ["checkout-flow-v3"], "decision": "rejected", "limit": 20 } }
# -> result: { results[], total }
```

Filters here are top-level fields (`decision`, `judgeType`, `contentType`, `reviewerId`, `annotationId`), not a `filters` object. `limit` is 1 to 100 (default 20). Returned `organizationId` / `documentId` are Velt's internal ids, not the ids you sent. There is no "create judgment" endpoint: judgments come from your users' review activity and your agents' findings.

### Errors

Validation errors return `INVALID_ARGUMENT` with `details.issues` listing every failing field. A missing `x-velt-auth-token` is `INVALID_ARGUMENT`; an auth token that does not match the API key is `PERMISSION_DENIED`. `RESOURCE_EXHAUSTED` means rate limited.

**Verification Checklist:**
- [ ] Memory responses are read from `result` directly, never `result.data`
- [ ] `documentId` / `documentIds` are always sent with `organizationId`; `documentIds` has 1 to 25 non-empty ids
- [ ] `filters.decision` uses exact stored values (`approved`, `rejected`, ...), not `approve` / `reject`
- [ ] `filters.annotationId` (or `annotationId` on judgments/query) is sent with `organizationId`
- [ ] `ask` callers handle `answer: ""` with `confidence: 0`, and unresolved citation ids
- [ ] `suggest` callers handle `primary: null` and a non-null `conflict`
- [ ] Exhaustive listings use `judgments/query`, not filtered `search`
- [ ] `details.issues` is surfaced on validation errors

**Source Pointers:**
- https://docs.velt.dev/ai/memory/overview - "Memory (Beta)"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/search - "Search Judgments"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/ask - "Ask Memory"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/suggest - "Suggest Decision"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/judgments/query - "Query Judgments"
