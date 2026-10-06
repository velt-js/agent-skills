---
title: Ingest and Manage Memory Knowledge Sources Asynchronously
impact: MEDIUM-HIGH
impactDescription: Ingestion is async and strictly validated; skipping the status poll, oversize inline files, or stray fields produce empty search results or rejected calls
tags: rest, api, memory, knowledge, ingest, upload-url, fileRef, ingest-status, knowledge-search, rules, rate-limits
---

## Ingest and Manage Memory Knowledge Sources Asynchronously

Knowledge sources (guidelines, standards, policy docs) feed Memory `ask` and agent knowledge retrieval. `knowledge/ingest` returns `status: "processing"` and a `sourceId` immediately; poll `knowledge/ingest-status` until `completed` or `failed` before relying on the source. Supported types: PDF, CSV, Excel (`.xlsx`), and plain text. Inline uploads go up to 5 MB decoded; larger files up to 30 MB go through a signed upload URL.

**Incorrect (large file inline, misspelled field, no status poll):**

```json
{
  "data": {
    "source": "inline",
    "file": { "bas64": "JVBERi0xLjQK...", "mimeType": "application/pdf", "fileName": "handbook.pdf" }
  }
}
```

**Correct (by-reference flow for a large file, then poll):**

```bash
# 1. Mint a signed URL (15-minute expiry). Repeat the same org/doc scope on ingest.
POST https://api.velt.dev/v2/memory/knowledge/upload-url
{ "data": { "mimeType": "application/pdf", "fileSize": 8421376, "fileName": "brand-guidelines.pdf", "organizationId": "org_eu" } }
# -> result: { uploadUrl, fileRef: "gs://...", expiresAt }

# 2. PUT the raw bytes with the same Content-Type
curl -X PUT "$UPLOAD_URL" -H "Content-Type: application/pdf" --data-binary @brand-guidelines.pdf

# 3. Ingest by reference
POST https://api.velt.dev/v2/memory/knowledge/ingest
{ "data": { "source": "fileRef", "fileRef": "gs://bucket/path/original.pdf", "mimeType": "application/pdf", "organizationId": "org_eu" } }
# -> result: { status: "processing", sourceId: "src_9a8...", message }

# 4. Poll until terminal
POST https://api.velt.dev/v2/memory/knowledge/ingest-status
{ "data": { "sourceId": "src_9a8..." } }
# -> result: { status: "completed", extractedRulesCount, chunkCount, originalDownloadUrl, canonicalMdDownloadUrl, ... }
```

Inline ingest for files up to 5 MB:

```json
{
  "data": {
    "source": "inline",
    "file": { "base64": "JVBERi0xLjQK...", "mimeType": "application/pdf", "fileName": "brand-guidelines.pdf", "fileSize": 184320 }
  }
}
```

### Ingestion rules

- `file` needs all four keys: `base64`, `mimeType`, `fileName` (1 to 255 chars), `fileSize` (decoded bytes, max 5,242,880). The server checks `mimeType` against the bytes; CSV and text must be valid UTF-8.
- `documentId` requires `organizationId` on `ingest` and `upload-url`. A `fileRef` ingested with a different scope than its upload URL, or from another workspace, returns `PERMISSION_DENIED`.
- Each `fileRef` can be ingested once. An expired, missing, or already-ingested object returns `FAILED_PRECONDITION`. A workspace can hold at most 50 outstanding upload URLs (`RESOURCE_EXHAUSTED` past that).
- `ingest`, `upload-url`, `ingest-status`, `delete`, and `knowledge/search` reject unknown fields with `INVALID_ARGUMENT`.
- Duplicate uploads set `dedupOf` and mirror the original's status, so a duplicate can report `processing` until the original finishes.
- On `failed`, `failureReason` is one of `pdf-llm-conversion-failed`, `storage-upload-failed`, `cloud-tasks-enqueue-failed`, `embedding-failed`, `unsupported-mime-detected-post-validation`, `workspace-deleted-mid-flow`.
- Download URLs from `ingest-status` and `list` are signed for 15 minutes. Do not store them; call again for fresh ones.

### Search, list, rules, update, download, delete

```bash
# Search ingested content (workspace-scoped: organizationId/documentId are rejected)
POST https://api.velt.dev/v2/memory/knowledge/search
{ "data": { "query": "image format requirements", "sourceId": ["src_9a8...", "src_2b1..."], "includeRules": true, "limit": 5 } }
# -> result: { results: [{ kind?, ruleId?, sourceId?, text, score?, category? }], recordsSearched }

POST https://api.velt.dev/v2/memory/knowledge/list   { "data": {} }                          # -> result: [ up to 100 sources, newest first ]
POST https://api.velt.dev/v2/memory/knowledge/rules  { "data": { "sourceId": "src_9a8..." } }  # -> result: [{ id, content, category, index }]
POST https://api.velt.dev/v2/memory/knowledge/update { "data": { "sourceId": "src_9a8...", "newContent": "# Brand Guidelines v2\n- Always cite medical claims" } }
POST https://api.velt.dev/v2/memory/knowledge/download { "data": { "sourceId": "src_9a8..." } }  # -> result: markdown string or null
POST https://api.velt.dev/v2/memory/knowledge/delete { "data": { "sourceId": "src_9a8..." } }
```

- `knowledge/search` reads ingested files; `/v2/memory/search` reads judgments. `score` is cosine **distance**: lower is more relevant. `sourceId` is one id or an array of 2 to 30. `includeRules` must be a real boolean. On embedding failure it falls back to the most recent items with no `score`.
- `list` has no pagination: only the 100 most recent sources are reachable.
- `update` works only on rule-based sources (checklists and guideline docs); others return `FAILED_PRECONDITION`. It returns a rule diff and `newVersion`.
- `download` returns `null` with HTTP 200 for unknown, foreign, or still-processing sources; use `ingest-status` to tell them apart.
- `delete` returns `ABORTED` (409) while the source is processing or has dedup dependents (`details.dependentCount`); unknown ids return `NOT_FOUND`.

**Rate limits per API key per minute:** `ingest-status` 600, `knowledge/search` 120, `upload-url` 100, `ingest` 30, `delete` 30. Over the limit returns `RESOURCE_EXHAUSTED`; back off, and pace bulk imports and status polling.

**Verification Checklist:**
- [ ] Every ingest is followed by an `ingest-status` poll until `completed` or `failed`
- [ ] Inline files send `base64`, `mimeType`, `fileName`, and `fileSize`, and stay at or under 5 MB decoded; larger files use `upload-url` + `PUT` + `source: "fileRef"`
- [ ] The upload `PUT` uses the same `Content-Type` as the requested `mimeType`, and ingest repeats the same `organizationId` / `documentId`
- [ ] No unknown or misspelled fields are sent to the strict knowledge endpoints
- [ ] `knowledge/search` never sends `organizationId` / `documentId`, and ranks by ascending `score`
- [ ] Signed download URLs are fetched fresh, not cached
- [ ] `delete` handles `ABORTED` by waiting for a terminal status or removing dependents first
- [ ] Callers stay under the per-minute rate limits

**Source Pointers:**
- https://docs.velt.dev/ai/memory/overview - "Memory (Beta)"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/ingest - "Ingest Knowledge"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/upload-url - "Get Upload URL"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/ingest-status - "Get Ingest Status"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/search - "Search Knowledge Base"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/list - "List Knowledge Sources"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/rules - "List Extracted Rules"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/update - "Update Knowledge"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/download - "Download Canonical Markdown"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/delete - "Delete Knowledge"
