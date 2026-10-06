---
title: Match webhookVersion to the Velt webhook system you configured
impact: CRITICAL
impactDescription: A version or secret mismatch makes every webhook fail verification, so the bot never responds
tags: webhook, v1, v2, Svix, HMAC, signature, verification, whsec, Basic, webhookVersion, webhookSecret
---

## Match webhookVersion to the Velt webhook system you configured

The adapter supports both Velt webhook systems:
- **Advanced (v2), the default:** verified with Svix-style HMAC-SHA256 using the `whsec_...` secret and the `webhook-id` / `webhook-timestamp` / `webhook-signature` headers.
- **Basic (v1):** verified against the `Authorization: Basic <token>` header. Set `webhookVersion: "v1"` and pass that token as `webhookSecret`.

**Incorrect (Basic webhook verified as v2):**

```typescript
// Console is set to Basic, but webhookVersion defaults to "v2"
createVeltAdapter({
  webhookSecret: process.env.VELT_BASIC_TOKEN, // BUG: not a whsec_ secret; every request fails verification
  botUserId: "velt-bot",
  botUserName: "Velt Bot",
});
```

**Correct (Advanced, default):**

```typescript
// VELT_WEBHOOK_SECRET="whsec_..."
createVeltAdapter({
  botUserId: "velt-bot",
  botUserName: "Velt Bot",
  organizationId: process.env.VELT_ORGANIZATION_ID,
  resolveUsers,
});
```

**Correct (Basic):**

```typescript
createVeltAdapter({
  webhookVersion: "v1",
  webhookSecret: process.env.VELT_WEBHOOK_SECRET, // the Basic auth token
  botUserId: "velt-bot",
  botUserName: "Velt Bot",
  organizationId: process.env.VELT_ORGANIZATION_ID,
  resolveUsers,
});
```

Prefer v2: it signs each request and checks its timestamp, which also protects against replays.

**Verification Checklist:**
- [ ] `webhookVersion` matches the Console setting (omit for v2)
- [ ] v2 uses a `whsec_...` secret; v1 uses the Basic token
- [ ] Verification failures are investigated as secret or version mismatches first

**Source Pointers:**
- https://docs.velt.dev/ai/chat-sdk-adapter — "Webhook versions"
- https://docs.velt.dev/webhooks/advanced — Advanced webhooks
