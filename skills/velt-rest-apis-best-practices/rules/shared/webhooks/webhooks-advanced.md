---
title: Verify and Handle Advanced (Svix) Webhooks
impact: MEDIUM
impactDescription: Advanced webhooks are signed and retried; skipping signature checks or slow responses lets forged or duplicate events through
tags: webhooks, advanced, v2, svix, signature, webhook-signature, retries, transformations, event-types, enterprise
---

## Verify and Handle Advanced (Svix) Webhooks

Advanced webhooks (Enterprise) deliver `WebhookV2Payload` messages with dot-notation event types to multiple endpoints, with per-endpoint filters, rate limits, retries, transformations, and signatures. Every delivery carries `webhook-id`, `webhook-timestamp`, and `webhook-signature` headers. Verify the signature against the **raw request body** with the endpoint's `whsec_` secret, then return 2xx within 15 seconds. Manage endpoints and secrets with the REST endpoints in `rest-advanced-webhooks`.

**Incorrect (parsed body, no signature check, slow handler):**

```javascript
app.post('/velt/webhooks', express.json(), async (req, res) => {
  await processEverything(req.body); // can exceed 15 s and trigger retries
  res.sendStatus(200);                // no verification: anyone can forge events
});
```

**Correct (raw body, HMAC-SHA256 check, timestamp tolerance, fast ack):**

```javascript
const crypto = require('crypto');

app.post('/velt/webhooks', express.raw({ type: 'application/json' }), (req, res) => {
  const id = req.header('webhook-id');
  const timestamp = req.header('webhook-timestamp');
  const signatures = (req.header('webhook-signature') || '').split(' ');
  const body = req.body.toString('utf8'); // raw string, never re-stringified JSON

  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return res.sendStatus(400);

  const secret = Buffer.from(process.env.VELT_WEBHOOK_SECRET.split('_')[1], 'base64');
  const expected = crypto.createHmac('sha256', secret).update(`${id}.${timestamp}.${body}`).digest('base64');
  const valid = signatures.some((sig) => {
    const value = sig.split(',')[1] || '';
    return value.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(value), Buffer.from(expected));
  });
  if (!valid) return res.sendStatus(401);

  res.sendStatus(200);                          // acknowledge within 15 seconds
  enqueue(id, JSON.parse(body));                // dedupe on webhook-id; retries reuse it
});
```

### Event types

| Area | Events |
|------|--------|
| Comment threads | `comment_annotation.add`, `.assign`, `.status_change`, `.priority_change`, `.custom_list_change`, `.subscribe`, `.unsubscribe`, `.accept`, `.reject`, `.approve`, `.suggestion_accept`, `.suggestion_reject` (suggestion events are opt-in) |
| Comments | `comment.add`, `comment.update`, `comment.delete`, `comment.reaction_add`, `comment.reaction_delete` |
| Huddle | `huddle.create`, `huddle.join` |
| CRDT | `crdt.update_data` (5-second debounce) |
| Recorder | `recorder.done` (on by default; toggle with `triggers.recorder.done`) |
| Review Workflow Builder | `execution.dispatched`, `execution.completed`, `execution.failed`, `execution.cancelled`, `step.awaiting-approval`, `step.completed`, `step.failed`, `step.breached`, `step.cancelled`, `group.quorum-met`, `loop.iteration-started`, `loop.exhausted` |

An endpoint with no event types receives everything; subscribe each endpoint to the subset it needs (`filterTypes` on the endpoint). Payloads look like `{ event, actionType, data: { actionUser, metadata, ... }, source, platform, webhookId }`. Private comments carry a `visibility` object inside `data`; treat it as informational only.

### Delivery, retries, and recovery

- Any non-2xx response, including 3xx redirects, or no response within 15 seconds is a failure.
- Retries back off: immediately, 5 s, 5 min, 30 min, 2 h, 5 h, 10 h, 10 h. After that the message is marked failed and a `message.attempt.exhausted` event is sent.
- An endpoint that fails for 5 days is disabled; re-enable it in the webhook dashboard. Failed messages can be resent one by one or recovered from a point in time.
- Retries resend the same `webhook-id`, so make handlers idempotent.
- Rate limits are per endpoint (messages per second) and can briefly be exceeded.
- Deliveries come from static IPs (`44.228.126.217`, `50.112.21.217`, `52.24.126.164`, `54.148.139.208`, `2600:1f24:64:8000::/56`) for firewall allowlists. HTTP Basic auth in the URL and custom headers are also supported.
- Disable CSRF protection on the webhook route.

### Transformations

A transformation is JavaScript on the endpoint that declares `handler(webhook)` and **returns the whole `WebhookObject`** (`method` of `POST` or `PUT`, `url`, `payload`, `cancel`). Returning only a new payload breaks delivery. Canceled messages show as successful.

```javascript
function handler(webhook) {
  if (webhook.payload.customUrl) {
    webhook.url = webhook.payload.customUrl;
  }
  return webhook;
}
```

Optional payload encoding (base64) and encryption (AES-256-CBC with an RSA-OAEP SHA-256 wrapped key) work as in basic webhooks; toggle them with `encodeData` / `encryptData` / `publicKey` on `/v2/workspace/advancedwebhookconfig/update`.

**Verification Checklist:**
- [ ] Signature is computed over `${webhook-id}.${webhook-timestamp}.${rawBody}` with HMAC-SHA256 and the base64-decoded part of the `whsec_` secret
- [ ] The `v1,` prefix is stripped from each space-delimited signature and compared in constant time
- [ ] `webhook-timestamp` is checked against a tolerance window
- [ ] The raw body is used for verification (no `JSON.stringify` round trip)
- [ ] The endpoint returns 2xx within 15 seconds and processes work asynchronously
- [ ] Handlers are idempotent on `webhook-id`
- [ ] Each endpoint subscribes to an explicit event subset
- [ ] Transformations return the full `WebhookObject`

**Source Pointers:**
- https://docs.velt.dev/webhooks/advanced - "Advanced Webhooks"
- https://docs.velt.dev/webhooks/advanced#verifying-webhook-signatures - "Verifying webhook signatures"
- https://docs.velt.dev/webhooks/advanced#retries - "Retries"
- https://docs.velt.dev/webhooks/advanced#transformations - "Transformations"
- https://docs.velt.dev/api-reference/sdk/models/data-models#webhookv2payload - "WebhookV2Payload"
