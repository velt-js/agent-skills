---
title: List agent executions through the Agents REST API
impact: MEDIUM
impactDescription: Server-side pagination of agent execution history without fetching executions one by one
tags: rest, api, agents, executions, pagination
---

## List agent executions through the Agents REST API

Use `POST /v2/agents/execution/list` to paginate through an agent's execution history. This endpoint is for reading execution summaries by agent, document, organization, or status; it is not the workflow/Approval Engine API.

**Incorrect (using workflow endpoints or fetching executions one at a time):**

```bash
# Wrong family: workflow executions are Approval Engine executions,
# not generic agent execution history.
POST https://api.velt.dev/v2/workflow/executions/list
{ "data": { "agentId": "agent_123" } }
```

**Correct (list agent execution summaries):**

```bash
POST https://api.velt.dev/v2/agents/execution/list
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN

{
  "data": {
    "agentId": "agent_123",
    "documentId": "doc_001",
    "status": "failed",
    "pageSize": 50,
    "orderDirection": "desc"
  }
}
```

The response returns `result.items`, plus `nextCursor` and `hasMore` for pagination.

```json
{
  "result": {
    "items": [
      {
        "id": "exec_1711900000000_abc123",
        "agentId": "agent_123",
        "agentName": "Brand Consistency Checker",
        "agentVersion": 3,
        "status": "passed",
        "message": "Found 7 issues across 12 pages.",
        "startedAt": 1711900000000,
        "completedAt": 1711900150000,
        "durationMs": 150000,
        "trigger": "standalone"
      }
    ],
    "nextCursor": "eyJvZmZzZXQiOjUwfQ==",
    "hasMore": true
  }
}
```

**Verification Checklist:**
- [ ] Endpoint path is exactly `/v2/agents/execution/list`
- [ ] Both `x-velt-api-key` and `x-velt-auth-token` headers are sent
- [ ] `pageSize` is between 1 and 500 when provided
- [ ] Pagination loops with `cursor = result.nextCursor` while `hasMore` is true
- [ ] `status` filters only use `running`, `passed`, `failed`, `error`, or `skipped`

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/list-agent-executions - "List Agent Executions"
