---
title: Receive webhook deliveries via webhookConfig or per-dispatch receivers with raw-byte HMAC checks, the event catalog, retries, and idempotency
impact: HIGH
impactDescription: Hashing re-serialized JSON breaks signature checks, missing (executionId, seq) dedup double-processes retries, and a dispatch-level webhook pair silently replaces the definition's webhookConfig and its eventTypes filter
tags: approval-engine, webhooks, webhookConfig, eventTypes, webhookUrl, webhookSecret, hmac, sha256, x-velt-signature, x-velt-event-id, x-velt-attempt, retry, dead-letter, idempotency, seq, executionId, event-types, raw-body, step.awaiting-approval, step.completed, step.failed, group.quorum-met, loop.iteration-started, loop.exhausted, cancellation-reason
---

## Receive webhook deliveries via webhookConfig or per-dispatch receivers with raw-byte HMAC checks, the event catalog, retries, and idempotency

The engine POSTs every externally-visible event to your receiver, signed with HMAC-SHA256 (10 s timeout, no redirects). Configure the receiver on the definition for every run, or on a single dispatch. Verify the signature on the raw request bytes and make the handler idempotent.

**Where to configure the receiver**

| Where | Applies to | Fields |
|---|---|---|
| `webhookConfig` on the definition | Every run of that definition | `{ url, secret, eventTypes? }` (`secret` 16 to 512 chars, `eventTypes` up to 50) |
| `webhookUrl` + `webhookSecret` on dispatch | That one run | Replaces `webhookConfig` for the run (not a second target) and clears any `eventTypes` filter |

Both are `https` only and SSRF-guarded at write time and again at delivery. `webhookConfig` is write-only: `/definitions/get` never returns it, so a get, edit, update round trip clears it unless you re-send it.

**Incorrect:**

```javascript
app.post('/velt/approvals', express.json(), (req, res) => {
  const digest = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex');
  if (`sha256=${digest}` !== req.headers['x-velt-signature']) return res.status(401).end();
  handle(req.body); // no dedup: every retry is processed again
  res.status(200).end();
});
```

Re-serialized JSON never matches the signed bytes, `!==` is not constant-time, and retries are reprocessed.

**Correct (Node.js / Express):**

```javascript
const crypto = require('crypto');
const express = require('express');
const app = express();

function verifyVeltSignature(rawBody, headerValue, secret) {
  const [scheme, hex] = String(headerValue || '').split('=');
  if (scheme !== 'sha256' || !hex) return false;
  const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(hex, 'hex');
  const b = Buffer.from(computed, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

app.post('/velt/approvals', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!verifyVeltSignature(req.body, req.headers['x-velt-signature'], process.env.WEBHOOK_SECRET)) {
    return res.status(401).end();
  }
  const event = JSON.parse(req.body.toString('utf8'));
  const key = req.headers['x-velt-event-id'] || `${event.executionId}:${event.seq}`;
  if (await store.seen(key)) return res.status(204).end();
  await processAndRecord(key, event); // switch on event.type
  res.status(204).end();
});
```

**Delivery headers:** `x-velt-signature` (`sha256=<hex>` of the raw body), `x-velt-event-id` (stable across retries), `x-velt-attempt` (0-based). The same `eventId` and `seq` appear on every retry.

**Retry schedule:** initial attempt, then 2 s, 8 s, 32 s, 2 min, 8 min, then dead-letter. Any non-2xx within the 10 s timeout triggers the next attempt. Recover anything dead-lettered with `/executions/getEvents` and `sinceSeq` through the same handler.

**Event catalog (12 external types, also returned by `getEvents`)**

| Event | When | `data` highlights |
|---|---|---|
| `execution.dispatched` | Run created, first steps scheduled | `{ definitionId, definitionVersion, rootStepIds }` |
| `execution.completed` | All steps terminal, no unhandled failure | null |
| `execution.failed` | A step failed or breached with no recovery edge | null |
| `execution.cancelled` | Run cancelled or fully rolled back | `{ reason? }` |
| `step.awaiting-approval` | Step entered `waiting` (human, running agent, async webhook) | Human: `{ waitingForReviewers, mandatoryCount, resumeKey }`. Agent: `{ agentId, agentExecutionId, pollIntervalMs }` |
| `step.completed` | Step completed | Human: `{ aggregatorStatus, nodeType, decision }`. Agent: `{ agentExecutionId, agentExecutionStatus, decision, source }`. `__mock__`: `{ agentId, synthetic, decision }` |
| `step.failed` | Retry budget exhausted, or terminal failure | Human: `{ reason }`. Webhook: `{ httpStatus, latencyMs, retryClass }`. Notification: `{ channel, retryClass }`. Config-validation failures: `{ reason }`. Agent: `{ agentExecutionId, agentExecutionStatus, decision, source }` |
| `step.breached` | Step passed its SLA | `{ reason }` |
| `step.cancelled` | Cancelled directly or by a quorum / loop side effect | `{ actorId, reason }` |
| `group.quorum-met` | Group approval threshold first met | `{ groupId, total, quorum, completedTotal, expectedSteps }` |
| `loop.iteration-started` | Rejected iteration spawned the next one | `{ loopId, iteration, triggeredBy: 'rejection' }` |
| `loop.exhausted` | Loop hit `maxIterations` | `{ loopId, iteration, lastRejectedBy?, lastRejectionReason? }` |

- The `{ code, message }` error object is not in event `data`; route on `event.type`, then read `steps[].error` from `/executions/get`.
- Internal events (`step.scheduled`, `step.started`, `step.retried`, `step.overridden`, and others) consume `seq` numbers but are never delivered, so `seq` gaps are normal.
- `step.cancelled` `data.reason` is an open set: `group-quorum-met` (`actorId: "system:group-quorum"`), `loop-restart` (`actorId: "system:loop-restart"`), or the admin-supplied reason. Switch on `event.type`, not `data.reason`.

**Verification Checklist:**
- [ ] Receiver configured once via `webhookConfig`, or per run via the dispatch pair, knowing the pair replaces `webhookConfig` and its `eventTypes`
- [ ] `webhookConfig` is re-sent on every definition update
- [ ] Route uses raw-body middleware; HMAC is computed over the raw bytes and compared with `crypto.timingSafeEqual`
- [ ] Handler dedups on `x-velt-event-id` or `(executionId, seq)` in a durable store and returns 2xx on duplicates
- [ ] Handler responds 2xx within 10 s and does heavy work asynchronously
- [ ] Agent and human `step.completed` / `step.awaiting-approval` data shapes are both handled; tests do not rely only on `__mock__` data
- [ ] Outage recovery calls `/executions/getEvents` with the last processed `seq` and tolerates gaps

**Source Pointers:**
- https://docs.velt.dev/ai/approval-engine/customize-behavior#webhook-delivery — `webhookConfig` vs dispatch pair, retry policy
- https://docs.velt.dev/ai/approval-engine/customize-behavior#event-reference — event catalog and `data` shapes
- https://docs.velt.dev/ai/approval-engine/customize-behavior#cancellation-reasons — `step.cancelled` reasons
- https://docs.velt.dev/ai/approval-engine/setup#step-4-get-the-outcome — headers and signature verification
- https://docs.velt.dev/ai/approval-engine/patterns#duplicating-a-workflow — `webhookConfig` is write-only and dispatch overrides
