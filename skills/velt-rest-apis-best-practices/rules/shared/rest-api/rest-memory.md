---
title: Use Memory REST APIs for judgments, knowledge, alerts, and suggestions
impact: HIGH
impactDescription: Memory endpoints provide grounded search and knowledge workflows; wrong retrieval mode or ingest path creates misleading AI results
tags: rest, api, memory, judgments, knowledge, alerts, suggestions
---

## Use Memory REST APIs for judgments, knowledge, alerts, and suggestions

Use the `/v2/memory/*` REST API family for grounded review memory: semantic search over judgments, Q&A and decision suggestions, knowledge ingestion/search, profile/pattern/stat insights, and proactive alerts. These endpoints use the standard REST envelope and the same `x-velt-api-key` / `x-velt-auth-token` headers as the rest of v2.

**Incorrect (treating Memory as a chat completion endpoint):**

```bash
# Do not invent an answer when Memory has no grounding context.
POST https://api.velt.dev/v2/memory/ask
{ "data": { "question": "What policy do we follow for medical claims?" } }
```

**Correct (handle empty grounded results explicitly):**

```bash
POST https://api.velt.dev/v2/memory/ask
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{
  "data": {
    "question": "What policy do we follow for medical claims?",
    "organizationId": "org_123"
  }
}
```

If retrieval finds no relevant context, `answer` is an empty string with `confidence: 0`. Treat that as "Memory has nothing to say yet", not as a model failure to patch over.

### Endpoint groups

| Group | Endpoints | Notes |
|-------|-----------|-------|
| Judgments | `/v2/memory/search`, `/v2/memory/judgments/query` | `search` is semantic; `judgments/query` is structured listing. `filters.annotationId` requires `organizationId`. |
| Q&A and decisions | `/v2/memory/ask`, `/v2/memory/suggest` | `ask` returns grounded answers with citations; `suggest` returns `primary` and optional `conflict` recommendations. |
| Knowledge | `/v2/memory/knowledge/ingest`, `upload-url`, `ingest-status`, `update`, `delete`, `search`, `list`, `download`, `rules` | Ingestion is async. Inline files are up to 5 MB decoded; by-reference files use `upload-url` and support up to 30 MB. |
| Insights | `/v2/memory/profiles/get`, `/v2/memory/patterns/get`, `/v2/memory/stats/get` | Derived reviewer/profile/pattern/stat views over remembered judgments. |
| Alerts | `/v2/memory/alerts/list`, `dismiss`, `action`, `config/get`, `config/update` | Alerts are proactive signals; list is capped at 50 active alerts. |

**Knowledge ingest pattern:**

```bash
# Inline file, up to 5 MB decoded.
POST https://api.velt.dev/v2/memory/knowledge/ingest
{
  "data": {
    "source": "inline",
    "file": {
      "base64": "JVBERi0xLjQK...",
      "mimeType": "application/pdf",
      "fileName": "brand-guidelines.pdf",
      "fileSize": 184320
    },
    "organizationId": "org_123"
  }
}

# Poll until terminal.
POST https://api.velt.dev/v2/memory/knowledge/ingest-status
{ "data": { "sourceId": "source_123" } }
```

**Search pattern:**

```bash
POST https://api.velt.dev/v2/memory/search
{
  "data": {
    "query": "marketing copy with unsupported medical claims",
    "scope": "organization",
    "organizationId": "org_123",
    "limit": 5,
    "filters": { "decision": "reject" }
  }
}
```

**Verification Checklist:**
- [ ] Every request wraps payload fields in `{ "data": { ... } }`
- [ ] Both REST auth headers are sent
- [ ] `ask` callers handle `answer: ""` and `confidence: 0` as no grounded context
- [ ] `filters.annotationId` is only used with `organizationId`
- [ ] Knowledge ingest polls `ingest-status` before depending on search/rules
- [ ] Inline files stay under 5 MB decoded; larger files use `knowledge/upload-url` + `source: "fileRef"`
- [ ] Memory search and knowledge search are not conflated: `/memory/search` searches judgments; `/memory/knowledge/search` searches ingested files

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/search - "Search Judgments"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/ask - "Ask Memory"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/suggest - "Suggest Decision"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/knowledge/ingest - "Ingest Knowledge"
- https://docs.velt.dev/api-reference/rest-apis/v2/memory/alerts/list - "List Alerts"
