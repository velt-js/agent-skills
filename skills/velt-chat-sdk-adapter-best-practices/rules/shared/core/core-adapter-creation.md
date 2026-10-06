---
title: Configure createVeltAdapter with bot identity, organization, and env credentials
impact: CRITICAL
impactDescription: botUserId drives feedback-loop filtering and reply authorship; missing credentials make the adapter throw on first use
tags: createVeltAdapter, config, apiKey, authToken, webhookSecret, organizationId, botUserId, botUserName, resolveUsers, env
---

## Configure createVeltAdapter with bot identity, organization, and env credentials

`createVeltAdapter(options)` builds the adapter. Credentials fall back to environment variables, so most apps pass only the bot identity, `organizationId`, and `resolveUsers`.

**Incorrect (hard-coded secrets, no bot identity):**

```typescript
createVeltAdapter({
  apiKey: "sk_live_123",            // BUG: secret committed to source
  webhookSecret: "whsec_abc",       // BUG: secret committed to source
  // BUG: no botUserId / botUserName, so the bot cannot recognize its own messages or mentions
});
```

**Correct:**

```typescript
import { createVeltAdapter } from "@veltdev/chat-sdk-adapter";

const adapter = createVeltAdapter({
  botUserId: "velt-bot",
  botUserName: "Velt Bot",
  organizationId: process.env.VELT_ORGANIZATION_ID,
  resolveUsers,
  // webhookVersion: "v1",            // only for Basic webhooks; "v2" is the default
  // webhookSecret: "...",            // overrides VELT_WEBHOOK_SECRET
  // selfHostingConfig: { reactionsService }, // only for reaction writes
});
```

| Option | Notes |
|---|---|
| `botUserId` | Stable bot user ID; replies are posted as this user and its own events are ignored |
| `botUserName` | Display name; also used to detect @-mentions of the bot |
| `organizationId` | Velt organization; falls back to `VELT_ORGANIZATION_ID` and scopes generated tokens |
| `resolveUsers` | Maps user IDs to display names for mentions and authors (recommended) |
| `webhookVersion` | `"v2"` (default, Advanced) or `"v1"` (Basic) |
| `webhookSecret` | Overrides `VELT_WEBHOOK_SECRET` |
| `selfHostingConfig` | Enables reaction writes via a self-hosted backend |

```env
VELT_API_KEY="your-velt-api-key"
VELT_AUTH_TOKEN=""
VELT_WEBHOOK_SECRET="whsec_..."
VELT_ORGANIZATION_ID="your-organization-id"
```

`VELT_AUTH_TOKEN` is optional: if omitted, the adapter generates a bot token from your API key, scoped to `VELT_ORGANIZATION_ID`, and refreshes it automatically.

**Verification Checklist:**
- [ ] `VELT_API_KEY` and `VELT_WEBHOOK_SECRET` come from the environment
- [ ] `botUserId` and `botUserName` are set and stable
- [ ] `organizationId` is passed or `VELT_ORGANIZATION_ID` is set
- [ ] `webhookVersion` matches the webhook type configured in the Velt Console

**Source Pointers:**
- https://docs.velt.dev/ai/chat-sdk-adapter — "Quickstart" (Add your environment variables, Create the bot instance) and "Webhook versions"
