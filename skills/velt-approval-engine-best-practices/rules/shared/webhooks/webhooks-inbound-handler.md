---
title: Inbound webhook handler — raw JSON ingress with bearer auth, signed callbacks, rate/size limits, SSRF guard
impact: MEDIUM-HIGH
impactDescription: External systems POST raw JSON directly (no {data:...} envelope); skipping the bearer token or assuming the standard REST envelope makes every inbound call fail
tags: approval-engine, webhooks, inbound, raw-json, bearer-token, signed-callback, rate-limiting, body-size-limit, ssrf, salesforce, stripe, github
---

## Inbound webhook handler — raw JSON ingress, distinct from outbound delivery

In addition to outbound delivery (`webhooks-delivery`), the Approval Engine exposes an **inbound** webhook handler: an HTTP endpoint with a stable URL that external systems (Salesforce, Stripe, GitHub, etc.) POST raw JSON to in order to push events *into* the engine. It is complementary to — not a duplicate of — outbound delivery; both paths are active independently and can coexist on the same workflow.

The key shape difference from the standard REST API: inbound payloads are **not** wrapped in a `{ data: ... }` envelope. The handler accepts raw JSON bodies directly.

**Incorrect (wrapping the body in the REST `{data:...}` envelope and omitting the bearer token):**

```json
{
  "data": { "event": "deal.closed", "dealId": "abc123" }
}
```

```text
POST <inbound-handler-url>
Content-Type: application/json
// no Authorization header → rejected before any processing
```

**Correct (raw JSON body + bearer token):**

```text
POST <inbound-handler-url>
Content-Type: application/json
Authorization: Bearer <token>
```

```json
{ "event": "deal.closed", "dealId": "abc123" }
```

The inbound handler enforces, at the boundary:

- **Bearer-token validation** — requests must carry a valid bearer token; unauthenticated requests are rejected before any processing.
- **Signed callback tokens** — callbacks issued by the handler are signed so downstream consumers can verify authenticity end-to-end.
- **Rate limiting** — per-source request rate is capped to prevent abuse.
- **Body-size limits** — oversized payloads are rejected before parsing.
- **SSRF URL guard** — any URL values in the incoming payload are validated against an allowlist to block server-side request forgery.

Keep the two surfaces straight: **inbound** = external systems push events *into* the engine (this rule); **outbound** = the engine pushes state-change events *out* to your receiver via the per-dispatch `webhookUrl` + `webhookSecret` (`webhooks-delivery`). This is also distinct from the deferred `node.type === "webhook"` step type, which validates in a definition but does not run in v1 (`concepts-workflow-model`).

**Verification Checklist:**
- [ ] Inbound POST bodies are raw JSON — NOT wrapped in `{ data: ... }`
- [ ] Every inbound request carries a valid `Authorization: Bearer <token>` — unauthenticated calls are rejected up front
- [ ] Callers verify the signed callback token on callbacks issued by the handler
- [ ] Senders stay within the per-source rate cap and body-size limit (oversized/abusive traffic is rejected at the boundary)
- [ ] Any URLs in the payload resolve to allowlisted hosts (SSRF guard rejects the rest)
- [ ] Inbound and outbound are treated as independent surfaces, not interchangeable

**Source Pointers:**
- https://docs.velt.dev/ai/approval-engine/overview — "Inbound webhook handler" (raw JSON ingress, bearer auth, signed callbacks, rate/size limits, SSRF guard)
