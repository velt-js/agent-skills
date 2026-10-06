---
title: Keep Velt credentials in environment variables
impact: MEDIUM
impactDescription: Committed secrets leak; a missing VELT_WEBHOOK_SECRET or API key makes every webhook fail
tags: env, VELT_API_KEY, VELT_AUTH_TOKEN, VELT_WEBHOOK_SECRET, VELT_ORGANIZATION_ID, auto-generate
---

## Keep Velt credentials in environment variables

The adapter reads its credentials from environment variables. You typically need three; `VELT_AUTH_TOKEN` is optional because the adapter generates a bot token from your API key, scoped to `VELT_ORGANIZATION_ID`, when it is empty.

**Incorrect (secrets in source):**

```typescript
createVeltAdapter({
  apiKey: "your-velt-api-key",   // BUG: committed secret
  webhookSecret: "whsec_abc123", // BUG: committed secret
  botUserId: "velt-bot",
  botUserName: "Velt Bot",
});
```

**Correct (`.env.local`):**

```env
VELT_API_KEY="your-velt-api-key"
VELT_AUTH_TOKEN=""
VELT_WEBHOOK_SECRET="whsec_..."
VELT_ORGANIZATION_ID="your-organization-id"
```

Get the API key from the Velt Console and the webhook secret from **Configurations → Webhook Service** after you configure the endpoint. AI bots also need their model provider key (for example `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`).

**Verification Checklist:**
- [ ] `VELT_API_KEY`, `VELT_WEBHOOK_SECRET`, and `VELT_ORGANIZATION_ID` are set in every environment
- [ ] No secrets appear in source control
- [ ] The webhook secret matches the Console for the configured webhook version

**Source Pointers:**
- https://docs.velt.dev/ai/chat-sdk-adapter — "Add your environment variables" and "Set up the Velt webhook"
