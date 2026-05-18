---
title: Webhook delivery — HMAC verification on raw bytes, payload shape, event catalog with data highlights, retry schedule, idempotency on (executionId, seq)
impact: HIGH
impactDescription: Wrong signature verification (hashing re-serialized JSON instead of raw bytes) lets forged requests through; missing seq-based idempotency double-processes every retried event
tags: approval-engine, webhooks, hmac, sha256, x-velt-signature, x-velt-event-id, x-velt-attempt, retry, dead-letter, idempotency, seq, executionId, event-types, raw-body, payload, eventId, correlationId, cancellation-reason, loop.iteration-started, loop.exhausted, loopId
---

## Webhook delivery — HMAC verification on raw bytes, retry, event catalog

When you dispatch with `webhookUrl` + `webhookSecret`, every externally-visible state change is POSTed to your receiver. Delivery is JSON POST with a 10 s timeout and no redirects.

**Delivery headers:**

```
x-velt-signature    sha256=<hex> — HMAC-SHA256 of the raw request body
x-velt-event-id     Stable event ID, unchanged across retries
x-velt-attempt      0-based attempt counter
```

**Payload shape (every delivery):**

```
event           string              External event type (see Event Catalog below)
executionId     string              The execution this event belongs to
definitionId    string              The pinned definition id for this execution
stepId          string | null       Set for step-level events; null for execution-level
status          string | undefined  Optional. Extracted from data.status when present
seq             integer             Monotonic per-execution sequence — use for ordering
                                    and reconciliation
timestamp       string              ISO 8601 timestamp of the event
correlationId   string              End-to-end trace id, echoed from dispatch
data            object              Event-specific payload (see catalog)
```

### Signature verification — hash RAW bytes, not re-serialized JSON

The single most important detail: hash the raw request body as your HTTP framework received it. Re-serializing parsed JSON (`JSON.stringify(req.body)`) reorders keys, changes whitespace, and produces a different digest — your verification will always fail.

**Correct (Node.js / Express with raw-body middleware):**

```javascript
const crypto = require('crypto');
const express = require('express');
const app = express();

// CRITICAL: get the raw bytes, not parsed JSON.
// Never call JSON.stringify(req.body) for signature input.
app.use('/velt/approvals', express.raw({ type: 'application/json' }));

function verifyVeltSignature(rawBody, headerValue, secret) {
  const [scheme, hex] = String(headerValue || '').split('=');
  if (scheme !== 'sha256' || !hex) return false;
  const computed = crypto
    .createHmac('sha256', secret)
    .update(rawBody)                          // raw bytes, NOT JSON.stringify(req.body)
    .digest('hex');
  const a = Buffer.from(hex, 'hex');
  const b = Buffer.from(computed, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);  // constant-time compare
}

app.post('/velt/approvals', (req, res) => {
  const ok = verifyVeltSignature(req.body, req.headers['x-velt-signature'], process.env.WEBHOOK_SECRET);
  if (!ok) return res.status(401).end();

  const event = JSON.parse(req.body.toString('utf8'));
  // ... idempotent handling, keyed on (event.executionId, event.seq) or x-velt-event-id
  res.status(204).end();
});
```

Two things never to skip: (1) raw body — `express.json()` will parse the body and the original bytes are gone; (2) `crypto.timingSafeEqual` for the comparison — `===` is timing-leak-prone.

**Event catalog with data highlights:**

```
External event           Internal name              When emitted                          data highlights
─────────────────────────────────────────────────────────────────────────────────────────────────────────
execution.dispatched     same                       Execution created; first steps        { definitionId,
                                                    scheduled                              definitionVersion,
                                                                                           rootStepIds }
execution.completed      same                       All steps terminal, no               null
                                                    unhandled failures
execution.failed         same                       Blocking step ended failed/breached  { failureReason }
                                                    with no recovery edge
execution.cancelled      same                       /executions/cancel or full           { reason? }
                                                    execution rollback
step.awaiting-approval   step.waiting               Human or blocking-agent step         { waitingForReviewers,
                                                    entered waiting                       mandatoryCount,
                                                                                          resumeKey }
step.completed           same                       Step transitioned to completed       Human / blocking-agent:
                                                                                         { aggregatorStatus,
                                                                                           nodeType, decision,
                                                                                           aggregatorBacked }
                                                                                         Non-blocking agent:
                                                                                         { agentId }
step.failed              same                       Step failed (retry budget exhausted) { error: { code, message } }
step.breached            same                       Step exceeded its slaMs              { reason }
step.cancelled           same                       Cancelled via /steps/cancel or by    { actorId, reason }
                                                    quorum-met side effect
group.quorum-met         parallel-group.quorum-met  Parallel group's approval threshold  { groupId, total, quorum,
                                                    first satisfied                       completedTotal,
                                                                                          expectedSteps }
loop.iteration-started   same                       Iteration N+1 spawns after a body    { loopId, iteration,
                                                    iteration terminated rejected and     triggeredBy: 'rejection' }
                                                    the cap wasn't hit
loop.exhausted           same                       Loop's maxIterations cap reached     { loopId, iteration,
                                                                                          lastRejectedBy?,
                                                                                          lastRejectionReason? }
```

Internal-only events (`step.scheduled`, `step.started`, `step.retried`, `step.resumed`, `step.response-recorded`, `step.overridden`, `parallel-group.completed`, `idempotency.suppressed`) fill `seq` gaps but are **never** delivered externally. Non-contiguous `seq` values are normal — do not treat a gap as an error.

**Cancellation reason vocabulary:**

`step.cancelled.data.reason` is an open string set — switch on `event.type` for control flow, not `data.reason`.

```
group-quorum-met       (system actor "system:group-quorum")
                       Engine cancelled the step because the parent group's
                       approval quorum was met under cancelOnQuorum or joinOnQuorum.

loop-restart           (system actor "system:loop-restart")
                       Engine cancelled an in-flight body step from iteration N
                       of a loop region because iteration N+1 is starting.

(admin-supplied)       Free-form reason passed to /steps/cancel.
```

The `step.cancelled` `data.reason` set may grow over time — Velt treats this as a non-breaking change.

**Retry schedule:**

```
Attempt 1 (initial)    —
Attempt 2              2 s
Attempt 3              8 s
Attempt 4              32 s
Attempt 5              2 min
Attempt 6              8 min → DLQ after this fails
```

After 5 failed retries the payload is written to a dead-letter queue. A delivery is considered successful if your receiver returns HTTP 2xx within Velt's 10 s timeout. Any non-2xx triggers the next retry.

### Idempotency contract — `(executionId, seq)`

**At-least-once delivery.** Every retried delivery uses the same `x-velt-event-id` and carries the same `(executionId, seq)` in the payload. Your handler must:

1. Compute a dedup key from the payload: `${event.executionId}:${event.seq}` (or use `x-velt-event-id`).
2. Check a durable store before processing. If seen, return 2xx without re-doing work.
3. Otherwise process + record the key + return 2xx atomically.

**Missed-event recovery:**

If your receiver was down past the DLQ horizon (5 retries), reconcile with `/executions/getEvents`:

```javascript
// After your receiver recovers from an outage:
const lastSeen = await store.lastProcessedSeqFor(executionId);
const { events } = await workflowApi('executions/getEvents', { executionId, sinceSeq: lastSeen });
for (const ev of events) {
  await idempotentProcess(ev);   // same handler as your webhook receiver
}
```

The receiver and the reconciler must share the same dedup logic (same `(executionId, seq)` key).

**Verification Checklist:**
- [ ] Webhook route uses raw-body middleware (`express.raw` or framework equivalent) — NOT parsed JSON
- [ ] HMAC-SHA256 hashes the raw bytes (`req.body` as `Buffer`); never `JSON.stringify(req.body)`
- [ ] Hex comparison uses `crypto.timingSafeEqual`, not `===`
- [ ] Header parsed as `sha256=<hex>` — scheme verified
- [ ] Receiver dedups on `(executionId, seq)` or `x-velt-event-id` with a durable store
- [ ] Receiver returns 2xx on duplicate without redoing work
- [ ] Non-contiguous `seq` values are NOT treated as errors (internal events fill gaps)
- [ ] Outage recovery path calls `/executions/getEvents?sinceSeq=<last-processed-seq>` and feeds events through the same idempotent handler
- [ ] Control flow switches on `event.type`, not `data.reason`

**Source Pointers:**
- https://docs.velt.dev/ai/approval-engine/customize-behavior — webhook delivery, payload shape, retry schedule, event catalog with data highlights, cancellation reason vocabulary
- https://docs.velt.dev/ai/approval-engine/setup — webhook signature verification
- https://docs.velt.dev/api-reference/rest-apis/v2/approval-engine/executions/get-execution-events — sinceSeq recovery
