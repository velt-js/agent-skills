---
title: Approval Engine REST API — Definitions, Executions, and Steps
impact: HIGH
impactDescription: Incorrect auth, missing idempotency keys, or wrong node/group shape causes silent duplicate executions or permanently stuck workflows
tags: rest, api, approval-engine, workflow, definitions, executions, steps, webhooks, idempotency
---

## Approval Engine REST API — Definitions, Executions, and Steps

The Approval Engine is a declarative workflow runtime for multi-step agent + human approval processes. All 14 endpoints are POST under `https://api.velt.dev/v2/workflow/`. Author definitions (nodes + edges + groups), dispatch executions, record decisions, and receive real-time webhook events.

**Required headers on every request:**

```
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN
content-type: application/json
```

**Request / response envelope:**

```json
// Request
{ "data": { /* endpoint-specific fields */ } }

// Success
{ "result": { /* endpoint-specific payload */ } }

// Error
{ "error": { "message": "...", "status": "INVALID_ARGUMENT", "details": {} } }
```

Do not duplicate `apiKey` or `authToken` in the request body. Auth is read from headers only.

---

### Definitions

A definition is the static, versioned blueprint of your workflow. Every update increments `version`; in-flight executions are immune to changes.

**Node shape:**

```typescript
// Agent node
{
  nodeId: string,
  type: "agent",
  config: {
    agentId: string,                  // required
    blocking?: boolean,               // default false; parks step in "waiting" when true
    resolutionPolicy?: {              // required when blocking: true
      kind: "allResolved" | "minResolved",
      minCount?: number               // required when kind === "minResolved"
    },
    promptOverride?: string,          // ≤ 8000 chars
    inputMapping?: object,
    agentMaxRuntimeMs?: number,       // ≤ 86400000
    requireNonEmptyOutput?: boolean
  },
  slaMs?: number                      // step deadline in ms; requires a breach-routed outgoing edge
}

// Human node — use reviewers[], not the legacy reviewerIds[]
{
  nodeId: string,
  type: "human",
  config: {
    reviewers: [{ userId: string, mandatory: boolean }],  // at least one mandatory: true
    commentBody?: string                                   // ≤ 8000 chars
  },
  slaMs?: number
}
```

**Edge shape:**

```typescript
{
  from: string,   // nodeId
  to: string,     // nodeId
  when?: string   // optional gating expression, e.g. "output.passesBrandCheck == true"
                  // Path roots: output.*, step.*, execution.input.*
                  // Operators: == != < > <= >= && || ! regex includes startsWith endsWith length isEmpty
}
```

**Group (parallel quorum) shape:**

```typescript
{
  groupId: string,
  memberNodeIds: string[],             // 1–500; each node in at most one group
  expectedSteps: number,              // must equal memberNodeIds.length
  quorum: number,                     // 1–expectedSteps approvals needed
  onQuorumMet?: "waitAll" | "cancelOnQuorum" | "joinOnQuorum",  // default: waitAll
  requiredNodeIds?: string[]          // specific members whose approval is required; length ≤ quorum
}
```

Quorum counts `completed` steps whose `output.decision === 'approve'` — not total completions. Non-blocking agent nodes never satisfy quorum; only human or blocking-agent nodes belong in groups with `cancelOnQuorum` or `joinOnQuorum`.

**`onQuorumMet` behavior summary:**

| Policy | What happens at first-time quorum | Per-member fan-out |
|---|---|---|
| `waitAll` (default) | Emits `group.quorum-met` only | Each member fans out per its own edges |
| `cancelOnQuorum` | Cancels remaining `waiting` siblings (actor: `system:group-quorum`) | Completing members still fan out; cancelled siblings do not |
| `joinOnQuorum` | Cancels waiting siblings; fires one group-owned downstream step per shared successor (stepId: `group_<groupId>__to__<childNodeId>`) | Member fan-out suppressed; group container owns it |

**Definitions endpoints:**

```bash
# Create — definitionId + name + nodes + edges required; scope defaults to { level: "apiKey" }
POST https://api.velt.dev/v2/workflow/definitions/create
{
  "data": {
    "definitionId": "marketing-copy-approval",
    "name": "Marketing copy approval",
    "scope": { "level": "apiKey" },
    "nodes": [
      { "nodeId": "agent-draft",   "type": "agent", "config": { "agentId": "copy-agent-v1" } },
      { "nodeId": "human-legal",   "type": "human", "config": { "reviewers": [{ "userId": "u_legal_01", "mandatory": true }] } },
      { "nodeId": "human-brand",   "type": "human", "config": { "reviewers": [{ "userId": "u_brand_01", "mandatory": true }] } },
      { "nodeId": "agent-publish", "type": "agent", "config": { "agentId": "publish-agent-v1" } }
    ],
    "edges": [
      { "from": "agent-draft",  "to": "human-legal" },
      { "from": "agent-draft",  "to": "human-brand" },
      { "from": "human-legal",  "to": "agent-publish" },
      { "from": "human-brand",  "to": "agent-publish" }
    ],
    "groups": [{
      "groupId": "parallel-review",
      "memberNodeIds": ["human-legal", "human-brand"],
      "expectedSteps": 2,
      "quorum": 2,
      "onQuorumMet": "joinOnQuorum"
    }]
  }
}
// Response: { "result": { "definitionId": "marketing-copy-approval", "version": 1, ... } }

# Update — definitionId required; include ifVersion for optimistic-lock safety
POST https://api.velt.dev/v2/workflow/definitions/update
{ "data": { "definitionId": "marketing-copy-approval", "ifVersion": 1, "name": "Marketing copy approval v2" } }
// FAILED_PRECONDITION if ifVersion mismatches current version

# Get
POST https://api.velt.dev/v2/workflow/definitions/get
{ "data": { "definitionId": "marketing-copy-approval" } }
// Response: { "result": DefinitionView }

# List — all fields optional; cursor-based pagination
POST https://api.velt.dev/v2/workflow/definitions/list
{ "data": { "scope": { "level": "apiKey" }, "status": "active", "tags": ["q2"], "limit": 50 } }
// Response: { "result": { "definitions": DefinitionView[], "nextCursor": "..." } }

# Delete — rejected with FAILED_PRECONDITION if any in-flight executions exist
POST https://api.velt.dev/v2/workflow/definitions/delete
{ "data": { "definitionId": "marketing-copy-approval" } }
```

Definitions are linted at create/update time. Violations are rejected with `INVALID_ARGUMENT` and an explicit linter code. Common linter codes: `cycle-detected`, `dangling-edge`, `unreachable-node`, `missing-breach-edge` (SLA node without a breach-routed edge), `group-joinonquorum-members-must-share-successors`.

---

### Executions

**Dispatch — always supply `idempotencyKey`:**

```bash
POST https://api.velt.dev/v2/workflow/executions/dispatch
{
  "data": {
    "definitionId": "marketing-copy-approval",
    "idempotencyKey": "campaign-42-dispatch",   // highly recommended; omitting risks duplicates on retry
    "correlationId": "corr_campaign_42",
    "triggerContext": { "assetId": "asset_8f3" },
    "webhookUrl": "https://hooks.acme.com/velt/approvals",   // must be https://; private/loopback IPs rejected
    "webhookSecret": "whsec_9a8fS2l..."           // required when webhookUrl is set; both or neither
  }
}
// Response: { "result": { "executionId": "exec_1777...", "correlationId": "...", "deduplicated": false } }
// deduplicated: true means the idempotencyKey was already used — same executionId returned, no duplicate spawned
```

Replaying with the same `idempotencyKey` (including in concurrent races) returns the original `executionId` rather than spawning a duplicate. Treat `deduplicated: true` as success — do not re-dispatch.

`webhookUrl` and `webhookSecret` must be provided together. The URL is re-validated at delivery time; if its resolved IP is private, loopback, or link-local the request is not sent.

```bash
# Get execution state (includes steps[] array)
POST https://api.velt.dev/v2/workflow/executions/get
{ "data": { "executionId": "exec_1777..." } }

# List executions — cursor-based pagination
POST https://api.velt.dev/v2/workflow/executions/list
{ "data": { "definitionId": "marketing-copy-approval", "status": "running", "limit": 50 } }
// Response: { "result": { "executions": ExecutionView[], "nextCursor": "..." } }

# Cancel — rejected if execution is already terminal
POST https://api.velt.dev/v2/workflow/executions/cancel
{ "data": { "executionId": "exec_1777...", "reason": "campaign paused" } }
```

**Reconcile missed events with `sinceSeq`:**

```bash
POST https://api.velt.dev/v2/workflow/executions/getEvents
{ "data": { "executionId": "exec_1777...", "sinceSeq": 5 } }
// Response: { "result": { "events": ApprovalEventView[] } }
// Returns all externally-visible events after seq 5, in order.
// seq values may be non-contiguous — internal-only events fill gaps but are filtered.
```

Use `getEvents` with the last durably-stored `seq` to recover after a webhook outage. Make your receiver idempotent on `(executionId, seq)`.

---

### Steps

```bash
# Record a human reviewer's decision
POST https://api.velt.dev/v2/workflow/steps/recordReviewerDecision
{
  "data": {
    "executionId": "exec_1777...",
    "stepId": "step_agent-draft_...__to__human-legal",
    "reviewerId": "u_legal_01",
    "decision": "approve",   // "approve" | "reject"
    "reason": "looks good"
  }
}
// Response: { "result": { "recorded": true, "aggregatorStatus": "resolved", "resumeScheduled": true } }

# Record an external resolution for a blocking agent step
POST https://api.velt.dev/v2/workflow/steps/recordAgentResolution
{
  "data": {
    "executionId": "exec_1777...",
    "stepId": "step_blocking-agent_...",
    "resolutionId": "res-001",
    "output": { "decision": "approve", "score": 0.95 }
  }
}

# Cancel a step (admin scope required — PERMISSION_DENIED for non-admins)
POST https://api.velt.dev/v2/workflow/steps/cancel
{ "data": { "executionId": "exec_1777...", "stepId": "step_...", "reason": "escalated" } }

# Admin override — force-complete a step
POST https://api.velt.dev/v2/workflow/steps/resolve
{ "data": { "executionId": "exec_1777...", "stepId": "step_...", "output": { "decision": "approve" } } }
```

`/steps/cancel` and `/steps/resolve` require admin scope. Non-admin tokens receive `PERMISSION_DENIED`.

---

### Webhook delivery

Set `webhookUrl` + `webhookSecret` on dispatch to receive real-time events. Every externally-visible state change is POSTed to your receiver.

**Delivery headers:**

| Header | Description |
|---|---|
| `x-velt-signature` | `sha256=<hex>` — HMAC-SHA256 of the raw request body |
| `x-velt-event-id` | Stable event ID, unchanged across retries |
| `x-velt-attempt` | 0-based attempt counter |

**Signature verification:**

```javascript
const crypto = require('crypto');

function verifyVeltSignature(rawBody, headerValue, secret) {
  const [scheme, hex] = String(headerValue).split('=');
  if (scheme !== 'sha256' || !hex) return false;
  const computed = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')   // hash raw bytes, NOT re-serialized JSON
    .digest('hex');
  const a = Buffer.from(hex, 'hex');
  const b = Buffer.from(computed, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
```

**Externally-visible event types:**

| Event | When emitted |
|---|---|
| `execution.dispatched` | Execution created; first steps scheduled |
| `execution.completed` | All steps terminal, no unhandled failures |
| `execution.failed` | A blocking step failed/breached with no recovery edge |
| `execution.cancelled` | Via `/executions/cancel` or full rollback |
| `step.awaiting-approval` | Human or blocking-agent step entered `waiting` |
| `step.completed` | Step transitioned to `completed` |
| `step.failed` | Step failed (retry budget exhausted) |
| `step.breached` | Step exceeded its SLA deadline |
| `step.cancelled` | Cancelled via API or by quorum-met side effect |
| `group.quorum-met` | Parallel group approval threshold first satisfied |

**Retry schedule:** immediate → +2s → +8s → +32s → +2min → +8min → DLQ after 5 retries.

Delivery is at-least-once. Make your receiver idempotent on `(executionId, seq)`. Recover missed events via `/executions/getEvents` with `sinceSeq`.

Internal-only events (`step.scheduled`, `step.started`, `step.retried`, etc.) fill `seq` gaps but are never delivered externally — non-contiguous `seq` values are normal.

---

### Error codes

| Code | Common cause |
|---|---|
| `UNAUTHENTICATED` | Missing or invalid `x-velt-auth-token` |
| `PERMISSION_DENIED` | Non-admin calling `/steps/cancel` or `/steps/resolve` |
| `NOT_FOUND` | Unknown `executionId`, `definitionId`, or `stepId` |
| `ALREADY_EXISTS` | Creating a definition whose `definitionId` already exists |
| `FAILED_PRECONDITION` | `ifVersion` mismatch; cancelling a terminal execution/step; deleting a definition with in-flight executions |
| `INVALID_ARGUMENT` | Schema failure or linter rule violation |
| `RESOURCE_EXHAUSTED` | Rate limit exceeded — retry with exponential backoff and `idempotencyKey` |

**Verification Checklist:**
- [ ] All requests include `x-velt-api-key`, `x-velt-auth-token`, and `content-type: application/json` headers
- [ ] Every dispatch includes an `idempotencyKey`; `deduplicated: true` responses are treated as success, not retried
- [ ] `webhookUrl` and `webhookSecret` are provided together (both or neither); URL uses `https://` and is not a private/loopback host
- [ ] Webhook signature verification hashes the raw request bytes — not re-serialized JSON — using HMAC-SHA256 with `timingSafeEqual`
- [ ] Webhook receiver is idempotent on `(executionId, seq)`; `/executions/getEvents?sinceSeq=N` is used for outage recovery
- [ ] Human node config uses `reviewers: [{ userId, mandatory }]` (not legacy `reviewerIds[]`), with at least one `mandatory: true`
- [ ] Blocking agent nodes include `resolutionPolicy`; non-blocking agents are not placed in quorum groups expecting approval decisions
- [ ] Definitions with `slaMs` nodes declare a breach-routed outgoing edge (avoids `missing-breach-edge` linter rejection)
- [ ] `/steps/cancel` and `/steps/resolve` are only called with admin-scoped tokens

**Source Pointers:**
- https://docs.velt.dev/ai/approval-engine/overview - Overview and key concepts
- https://docs.velt.dev/ai/approval-engine/setup - End-to-end setup guide
- https://docs.velt.dev/ai/approval-engine/customize-behavior - Node config, edge expressions, quorum policies, SLAs, event reference, error vocabulary
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/definitions/create-definition - Definitions endpoints
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/executions/dispatch-execution - Executions endpoints
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/steps/record-reviewer-decision - Steps endpoints
