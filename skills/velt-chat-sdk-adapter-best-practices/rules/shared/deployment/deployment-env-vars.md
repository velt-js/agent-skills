---
title: Environment Variables and Auth Token Management
impact: MEDIUM
tags: env, VELT_API_KEY, VELT_AUTH_TOKEN, VELT_WEBHOOK_SECRET, VELT_ORGANIZATION_ID, auto-generate
---

## Environment Variables

### Required Variables

```env
VELT_API_KEY="your-velt-api-key"
VELT_WEBHOOK_SECRET="whsec_..."
VELT_ORGANIZATION_ID="your-organization-id"
```

### Optional Variables

```env
VELT_AUTH_TOKEN=""
```

### Auth Token Auto-Generation

When `VELT_AUTH_TOKEN` is empty or not set, the adapter automatically generates a bot token:

1. Calls `POST /v2/auth/generate_token` with the API key
2. Scopes the token to the organization with `editor` access
3. Caches the token internally with a 40-hour TTL (tokens last 48 hours)
4. Auto-refreshes on 401 responses or cache expiry

This means you typically only need three env vars: `VELT_API_KEY`, `VELT_WEBHOOK_SECRET`, and `VELT_ORGANIZATION_ID`.

### Where to Find These Values

- **VELT_API_KEY** — Velt Console → API Keys
- **VELT_WEBHOOK_SECRET** — Velt Console → Configurations → Webhook Service (generated when you enable webhooks)
- **VELT_ORGANIZATION_ID** — Velt Console → Settings → Organization

### AI Bot Additional Variables

For AI-powered bots using the Vercel AI SDK:

```env
AI_PROVIDER="anthropic"
AI_MODEL="claude-sonnet-4-6"
ANTHROPIC_API_KEY="sk-ant-..."
# Or for OpenAI:
# AI_PROVIDER="openai"
# AI_MODEL="gpt-4o"
# OPENAI_API_KEY="sk-..."

# Optional: Redis for persistent state
REDIS_URL="redis://..."
```

### Key Points

- Never hardcode secrets in source code — always use environment variables
- Set these in `.env.local` for development, in your platform's env vars for production (Vercel, Railway, etc.)
- The webhook secret must match what's configured in Velt Console
