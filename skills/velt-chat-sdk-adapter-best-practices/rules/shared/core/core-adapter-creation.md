---
title: createVeltAdapter Configuration
impact: CRITICAL
tags: createVeltAdapter, config, apiKey, authToken, organizationId, webhookSecret
---

## createVeltAdapter Configuration

The `createVeltAdapter()` factory function creates the adapter instance. It reads credentials from both explicit options and environment variables.

```typescript
import { createVeltAdapter } from "@veltdev/chat-sdk-adapter";

const adapter = createVeltAdapter({
  botUserId: "my-bot",
  botUserName: "My Bot",
  organizationId: process.env.VELT_ORGANIZATION_ID!,
  resolveUsers,
  // webhookVersion: "v2",        // default; set "v1" for Basic webhooks
  // webhookSecret: "whsec_...",  // overrides VELT_WEBHOOK_SECRET env var
});
```

### Configuration Options

| Option | Required | Description |
|--------|----------|-------------|
| `botUserId` | Yes | Unique ID for the bot user (used to filter out bot's own messages) |
| `botUserName` | Yes | Display name shown on bot replies |
| `organizationId` | Yes | Velt organization ID (used for auth token scoping) |
| `resolveUsers` | Yes | Function to resolve user IDs to display names (see users rules) |
| `webhookVersion` | No | `"v2"` (default, Svix HMAC-SHA256) or `"v1"` (Basic auth token) |
| `webhookSecret` | No | Overrides `VELT_WEBHOOK_SECRET` env var |
| `selfHostingConfig` | No | For writing reactions on self-hosted backends (see reactions rules) |

### Environment Variables

The adapter reads these automatically:

| Variable | Required | Description |
|----------|----------|-------------|
| `VELT_API_KEY` | Yes | Your Velt API key |
| `VELT_AUTH_TOKEN` | No | Bot auth token. If omitted, the adapter auto-generates one from the API key scoped to the organization |
| `VELT_WEBHOOK_SECRET` | Yes | Webhook signing secret. v2 format: `whsec_<base64>`. v1 format: plain token |
| `VELT_ORGANIZATION_ID` | Yes | Organization ID (also passed explicitly in config) |

### Auth Token Auto-Generation

If `VELT_AUTH_TOKEN` is not set, the adapter automatically generates a bot token via `POST /v2/auth/generate_token`, scoped to the organization with `editor` access. Tokens are cached internally with a 40-hour TTL (Velt tokens last 48 hours) and auto-refresh on 401 or expiry.

### Key Points

- `botUserId` is critical for avoiding feedback loops — the adapter ignores webhook events from this user ID
- Always set `VELT_API_KEY` and `VELT_WEBHOOK_SECRET` as environment variables (never hardcode secrets)
- Omitting `VELT_AUTH_TOKEN` is fine for most cases — auto-generation handles it
