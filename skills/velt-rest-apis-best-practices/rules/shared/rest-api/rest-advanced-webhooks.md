---
title: Manage Advanced Webhooks via REST API
impact: MEDIUM
impactDescription: Programmatically enable advanced webhooks and manage delivery endpoints, signing secrets, and per-endpoint event/channel filters
tags: rest, api, webhooks, advanced-webhooks, endpoints, signing-secret, filterTypes, channels, rateLimit, FAILED_PRECONDITION
---

## Manage Advanced Webhooks via REST API

Advanced Webhooks add multiple delivery endpoints, per-endpoint event/channel filtering, rate limiting, and signed payloads on top of basic webhooks. These management endpoints live under `https://api.velt.dev/v2/workspace/` — all are POST, all use **API-key-level auth** (both `x-velt-api-key` and `x-velt-auth-token` headers), and all wrap the payload in `{ "data": { ... } }`. This rule covers *managing* advanced webhooks; for receiving and verifying the delivered events, see `webhooks-advanced` (Svix).

**Required headers (every request):**

```
x-velt-api-key: YOUR_API_KEY
x-velt-auth-token: YOUR_AUTH_TOKEN
```

**Response envelope:** success responses return `{ "result": { "status": "success", "message", "data" } }`; failures return `{ "error": { "status", "message" } }` where `status` is one of `INVALID_ARGUMENT`, `FAILED_PRECONDITION`, or `NOT_FOUND`.

### Enable first: workspace config

Advanced webhooks must be provisioned before any endpoint can be created. The **first** `update` call must include `isEnabled: true` — this provisions the underlying webhook application. Until then, the endpoint-management APIs return `FAILED_PRECONDITION`.

```bash
# Get config (no body params required)
POST https://api.velt.dev/v2/workspace/advancedwebhookconfig/get
{ "data": {} }
# → data: { isEnabled, encryptData, encodeData, publicKey, enableDataProtection }

# Update config (partial; at least one field required; first call must set isEnabled:true)
POST https://api.velt.dev/v2/workspace/advancedwebhookconfig/update
{ "data": { "isEnabled": true, "encryptData": false, "encodeData": false } }
```

If advanced webhooks are not available for the workspace at all, `advancedwebhookconfig/get` returns `FAILED_PRECONDITION` ("Advanced webhooks are not available for this workspace.") — contact Velt to enable the feature.

### Manage delivery endpoints

All four endpoint operations require advanced webhooks to already be enabled (else `FAILED_PRECONDITION`).

```bash
# Create an endpoint — url is required and must be a valid http(s) URL.
# The signing secret is ALWAYS generated server-side; never pass it in the request.
POST https://api.velt.dev/v2/workspace/advancedwebhook/endpoints/create
{ "data": {
    "url": "https://example.com/webhooks/velt",
    "description": "Primary endpoint",
    "filterTypes": ["comment.add", "comment.update"],   // optional; non-empty when provided; omit = all events
    "channels": ["channel-a"],                            // optional; non-empty when provided; omit = all channels
    "disabled": false,                                    // optional; default false
    "rateLimit": 10,                                      // optional; max deliveries/sec (positive integer)
    "uid": "my-endpoint-1",                               // optional caller-assigned id
    "metadata": { "team": "platform" }                   // optional string-valued key/value pairs
} }
# → data: { id: "ep_...", url, description, filterTypes, channels, disabled, rateLimit, uid, createdAt, updatedAt }

# List endpoints — paginated via opaque iterator cursor (limit 1–250)
POST https://api.velt.dev/v2/workspace/advancedwebhook/endpoints/get
{ "data": { "limit": 50, "iterator": "" } }
# → data: { endpoints: [...], iterator, prevIterator, done }
# When done === false, pass the returned iterator to fetch the next page.

# Update an endpoint — endpointId required; at least one other field; partial (omitted fields unchanged)
POST https://api.velt.dev/v2/workspace/advancedwebhook/endpoints/update
{ "data": { "endpointId": "ep_...", "description": "Updated", "disabled": false } }

# Delete an endpoint — permanent; immediately stops deliveries and invalidates the signing secret
POST https://api.velt.dev/v2/workspace/advancedwebhook/endpoints/delete
{ "data": { "endpointId": "ep_..." } }
# → data: { endpointId, deleted: true }
```

### Retrieve the signing secret

The signing secret is generated at creation and fetched separately. Use it to verify the signature on delivered webhook payloads (see `webhooks-advanced`). Treat it like a credential.

```bash
POST https://api.velt.dev/v2/workspace/advancedwebhook/endpoints/secret/get
{ "data": { "endpointId": "ep_..." } }
# → data: { endpointId, secret: "whsec_..." }
```

**Incorrect (creating an endpoint before enabling advanced webhooks, or trying to supply your own secret):**

```bash
# BUG 1: no prior advancedwebhookconfig/update with { isEnabled: true } →
#         { "error": { "status": "FAILED_PRECONDITION", "message": "Advanced webhooks are disabled for this workspace..." } }
# BUG 2: "secret" is ignored — the signing secret is always server-generated and only readable via endpoints/secret/get.
POST https://api.velt.dev/v2/workspace/advancedwebhook/endpoints/create
{ "data": { "url": "https://example.com/webhooks/velt", "secret": "whsec_mine" } }
```

**Correct (enable once, then create the endpoint and read back the generated secret):**

```bash
# 1) Enable advanced webhooks for the workspace (first call must set isEnabled:true)
POST https://api.velt.dev/v2/workspace/advancedwebhookconfig/update
{ "data": { "isEnabled": true } }

# 2) Create the delivery endpoint
POST https://api.velt.dev/v2/workspace/advancedwebhook/endpoints/create
{ "data": { "url": "https://example.com/webhooks/velt", "filterTypes": ["comment.add"] } }
# → data.id = "ep_..."

# 3) Fetch the server-generated signing secret to verify payloads
POST https://api.velt.dev/v2/workspace/advancedwebhook/endpoints/secret/get
{ "data": { "endpointId": "ep_..." } }
# → data.secret = "whsec_..."
```

**Verification Checklist:**
- [ ] Both `x-velt-api-key` and `x-velt-auth-token` headers sent on every request (API-key-level auth)
- [ ] Advanced webhooks enabled via `advancedwebhookconfig/update` with `{ isEnabled: true }` before any endpoint call
- [ ] Endpoint URLs used verbatim including the `/v2/workspace/advancedwebhook/...` path (basic-webhook config endpoints `webhookconfig-get/update` are separate)
- [ ] `filterTypes` / `channels` are non-empty arrays when provided (omit them to receive all events / all channels)
- [ ] Signing secret is never sent in `create`; it is read back from `endpoints/secret/get` and stored securely (never client-side)
- [ ] `FAILED_PRECONDITION` handled as "feature disabled/not provisioned"; `INVALID_ARGUMENT` as validation failure; `NOT_FOUND` as unknown endpoint
- [ ] List pagination loops on `data.iterator` while `data.done === false`

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/advancedwebhookconfig-get — "Get Advanced Webhook Config"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/advancedwebhookconfig-update — "Update Advanced Webhook Config"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/advancedwebhook-endpoints-create — "Create Advanced Webhook Endpoint"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/advancedwebhook-endpoints-secret-get — "Get Advanced Webhook Endpoint Secret"
