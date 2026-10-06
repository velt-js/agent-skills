---
title: Troubleshoot Common Velt Backend Integration Failures
impact: LOW-MEDIUM
impactDescription: Fast diagnosis of auth, prerequisite, response-shape, and webhook errors avoids long debugging sessions
tags: debug, troubleshooting, errors, auth, advanced-queries, partial-failure, memory, agents, webhooks, token_expired
---

## Troubleshoot Common Velt Backend Integration Failures

Most backend failures come from the wrong header pair, a missing Console prerequisite, a misread response envelope, or a webhook endpoint that answers slowly. Check the error's `status` string (`error.status`) and `message` first, then match it below.

**Incorrect (retry every failure the same way):**

```javascript
async function call(path, data) {
  const json = await (await fetch(`https://api.velt.dev${path}`, { method: 'POST', headers, body: JSON.stringify({ data }) })).json();
  if (json.error) return call(path, data); // loops on INVALID_ARGUMENT, NOT_FOUND, ALREADY_EXISTS forever
  return json.result.data;                 // undefined for Memory endpoints
}
```

**Correct (classify by `error.status`, read the right envelope):**

```javascript
const RETRYABLE = new Set(['INTERNAL', 'UNAVAILABLE', 'DEADLINE_EXCEEDED', 'RESOURCE_EXHAUSTED']);

async function call(path, data, attempt = 0) {
  const res = await fetch(`https://api.velt.dev${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-velt-api-key': process.env.VELT_API_KEY,
      'x-velt-auth-token': process.env.VELT_AUTH_TOKEN
    },
    body: JSON.stringify({ data })
  });
  const json = await res.json();
  if (json.error) {
    const { status, message, details } = json.error;
    // Bulk document endpoints report per-item codes in details; see rest-documents-partial-failures.
    if (RETRYABLE.has(status) && !details && attempt < 3) {
      await new Promise((r) => setTimeout(r, 2 ** attempt * 1000));
      return call(path, data, attempt + 1);
    }
    throw Object.assign(new Error(message), { status, details });
  }
  return path.startsWith('/v2/memory/') ? json.result : json.result.data;
}
```

### Symptom guide

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Every call rejected | Missing header, or api-key pair sent to a workspace-level endpoint (or the reverse) | Use the pair that matches the endpoint scope (`core-rest-api-auth`) |
| `get` endpoints fail or return nothing for organizations, documents, folders, users, notifications, or comment annotations | Advanced queries not enabled | Enable advanced queries in the Console (and run the v4+ SDK) |
| Comment delete with `agentId` / `agentSuggestions` / `agentUrls` returns `NOT_FOUND` | Advanced queries not enabled | Enable them; the delete never widens to the whole document |
| `/v2/organizations/documents/*` returns HTTP 500 `INTERNAL` | Per-item failure (`not-found`, `already-exists`) in `error.details` | Branch on each item's `code`; retry only `internal` |
| `generate_token` returns `INVALID_ARGUMENT` | Body not wrapped in `data`, or `organizationId` in `userProperties` | Wrap in `data`; send the organization as a `permissions.resources[]` entry |
| Frontend auth stops after about 48 hours | JWT expired and `identify()` users do not refresh | Use `authProvider` with `generateToken`, or handle the `error` event with `code === 'token_expired'` |
| Agent run returns `NOT_FOUND` | Target `documentId` does not exist yet | Create the document first (`/v2/organizations/documents/add`) |
| Agent run returns `ALREADY_EXISTS` | Same agent already running on the document | Wait for the running execution (its ID is in the message) or poll it |
| Agent status `failed` looks like an outage | `failed` means findings were found | Treat `passed` as clean and `failed` as findings; `error` is the real failure |
| Agent starts failing auth after a config edit | `"__redacted__"` secret was sent back on version update | Resend real plaintext secrets or omit the secret-bearing block |
| Memory `ask` returns `answer: ""` | No grounding context yet | Show "nothing yet"; do not fabricate an answer |
| Memory search scoped to a document returns workspace-wide results | `documentId` / `documentIds` sent without `organizationId` | Always pair them with `organizationId` |
| Memory knowledge call rejected with `INVALID_ARGUMENT` | Unknown or misspelled field on a strict endpoint | Send only documented fields |
| Notification reaches the whole organization | `notifyAll` left at its default `true` | Set `notifyAll: false` to notify only `notifyUsers` |

### Webhooks not arriving

1. Confirm the service is enabled (Console > Configurations > Webhook Service, or `POST /v2/workspace/webhookconfig/get`).
2. Check the trigger is on: CRDT, recorder, and suggestion triggers are off by default.
3. Make the URL publicly reachable (not `localhost`) and allow Velt's static IPs for advanced webhooks.
4. Return 2xx within 15 seconds; queue heavy work.
5. For advanced webhooks, check the endpoint's `filterTypes` and whether the endpoint was disabled after 5 days of failures.
6. For signature mismatches, verify against the raw body and the correct endpoint secret (`webhooks-advanced`).

**Verification Checklist:**
- [ ] Errors are classified by `error.status`; only transient statuses are retried, with backoff and a cap
- [ ] Memory responses are read from `result`; other endpoints from `result.data`
- [ ] Advanced queries are enabled before using `get` endpoints and agent delete filters
- [ ] Bulk document errors are handled per item
- [ ] JWT refresh is wired through `authProvider` or the `token_expired` error event
- [ ] Webhook triggers, reachability, response time, and signatures are checked when events go missing

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/create - "Next Steps" (header pairs)
- https://docs.velt.dev/api-reference/rest-apis/v2/documents/delete-documents - "Partial Failures"
- https://docs.velt.dev/get-started/advanced#token-refresh - "Token Refresh"
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/execution/run - "Run Execution" (errors)
- https://docs.velt.dev/ai/memory/overview#errors - "Errors"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/webhookconfig-update - "Update Webhook Config"
- https://docs.velt.dev/webhooks/advanced#troubleshooting-tips - "Troubleshooting tips"
