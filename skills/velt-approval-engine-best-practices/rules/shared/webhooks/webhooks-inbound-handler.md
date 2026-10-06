---
title: Send raw JSON to the inbound webhook trigger with per-trigger secrets, provider presets, and your own throttling
impact: MEDIUM-HIGH
impactDescription: The inbound trigger endpoint takes raw JSON (no data envelope) and authenticates with the per-trigger secret; it applies no per-source rate limiting and does not screen URLs inside the payload
tags: approval-engine, webhooks, inbound, inboundWebhook, webhook-inbound, raw-json, hmac, bearer, provider, github, vercel, custom, allowedEvents, idempotencyHeader, idempotencyBodyPath, payloadMapping, event-ignored, body-too-large
---

## Send raw JSON to the inbound webhook trigger with per-trigger secrets, provider presets, and your own throttling

Declaring `inboundWebhook` on a trigger exposes the definition at `POST https://api.velt.dev/v2/workflow/webhook-inbound/trigger`, so an external system can start runs. Unlike every other Approval Engine endpoint, the body is raw JSON with no `{ "data": ... }` envelope, because providers cannot reshape their outgoing bodies. The per-trigger `secret` is the real authenticator; the Velt API key is a publishable client key.

**Incorrect:**

```text
POST https://api.velt.dev/v2/workflow/webhook-inbound/trigger
content-type: application/json
x-velt-api-key: YOUR_API_KEY

{ "data": { "definitionId": "ci-review", "triggerId": "ci-build", "payload": { "sha": "abc123" } } }
```

The `data` envelope is wrong for this endpoint, and nothing is signed with the trigger secret, so verification fails.

**Correct (provider `velt`, HMAC):**

```javascript
const crypto = require('crypto');

const body = JSON.stringify({
  definitionId: 'ci-review',
  triggerId: 'ci-build',
  payload: { sha: 'abc123', branch: 'main' }, // becomes triggerContext
});
const signature = 'sha256=' + crypto.createHmac('sha256', process.env.TRIGGER_SECRET).update(body).digest('hex');

await fetch('https://api.velt.dev/v2/workflow/webhook-inbound/trigger', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-signature': signature,
  },
  body,
});
```

**Trigger config (`inboundWebhook`)**

| Field | Notes |
|---|---|
| `authMode` | Required. `hmac` (body signature) or `bearer` (`Authorization: Bearer <secret>`, `velt` provider only). |
| `secret` | Required. 16 to 512 chars. |
| `provider` | `velt` (default), `github`, `vercel`, or `custom`. Any non-`velt` provider requires `authMode: "hmac"`. |
| `signatureHeader`, `signatureAlgorithm` (`sha1` / `sha256`), `signaturePrefix`, `eventNameHeader` | `custom` provider only. `hmac` + `custom` requires `signatureHeader` and `signatureAlgorithm`. |
| `allowedEvents` | 1 to 50 event names. Non-matching events return HTTP 200 `{ ok: false, code: "event-ignored" }`. If the event name cannot be resolved, the event is dropped (fails closed). |
| `idempotencyHeader` / `idempotencyBodyPath` | Where to read the source event id. |
| `payloadMapping` | `pass-through` (default) or `wrap` (nests the payload under `source`). |

**Provider presets**

| `provider` | Signature header | Algorithm | Prefix | Event name from |
|---|---|---|---|---|
| `velt` | `x-velt-signature` | HMAC-SHA256 | `sha256=` | body `type` |
| `github` | `x-hub-signature-256` | HMAC-SHA256 | `sha256=` | `x-github-event` header |
| `vercel` | `x-vercel-signature` | HMAC-SHA1 | none | `x-vercel-deployment-event` header, then body `type` |
| `custom` | `signatureHeader` | `signatureAlgorithm` | `signaturePrefix` | `eventNameHeader` |

**Request rules**
- **API key:** `x-velt-api-key` header, or `?apiKey=` for providers that cannot set headers (the header wins if both are sent).
- **Identifiers:** `definitionId` and `triggerId` in the body for `velt`, or as `?definitionId=` and `?triggerId=` query params (needed for GitHub, Vercel, custom).
- **Body:** JSON object up to 1 MB (larger returns HTTP 413 `body-too-large`). For `velt`, `payload` becomes `triggerContext`; for every other provider the entire body does.
- **Idempotency:** the source event id becomes the run's `idempotencyKey` as `trig:<triggerId>:<id>`, deduplicated for 24 hours. Without one, the engine uses a per-request key, so configure `idempotencyHeader` (for example `x-github-delivery`) or `idempotencyBodyPath`.
- **Responses:** success is `{ ok: true, code: "accepted", executionId, deduplicated }`.

**What the endpoint does NOT do:** it applies no per-source rate limiting (add your own throttling if the source can burst), and URL values inside the payload are not screened. The SSRF allowlist applies only to outbound destinations you configure: webhook node `url`, `webhookConfig.url`, dispatch `webhookUrl`, and a URL-valued `slackTarget`. Validate any URL from the payload before an agent node uses it via `urlPath`.

Keep the surfaces straight: this endpoint pushes events into the engine; outbound delivery (`webhooks-delivery`) pushes run events out to your receiver; a `webhook` node (`concepts-notification-webhook-nodes`) calls your API as a step.

**Verification Checklist:**
- [ ] Inbound bodies are raw JSON, never wrapped in `data`
- [ ] The trigger `secret` is 16 to 512 chars and the sender signs (or bears) it per the provider preset
- [ ] GitHub, Vercel, and custom providers use `authMode: "hmac"` and pass `definitionId` / `triggerId` as query params
- [ ] `idempotencyHeader` or `idempotencyBodyPath` is set so provider retries do not start duplicate runs
- [ ] Callers handle `event-ignored` (HTTP 200) and `body-too-large` (HTTP 413)
- [ ] You throttle bursty sources and validate payload URLs yourself

**Source Pointers:**
- https://docs.velt.dev/ai/approval-engine/customize-behavior#inbound-webhook-trigger — fields, presets, request rules, limits
- https://docs.velt.dev/ai/approval-engine/overview#four-ways-to-start-a-run — inbound webhook as a start mechanism
