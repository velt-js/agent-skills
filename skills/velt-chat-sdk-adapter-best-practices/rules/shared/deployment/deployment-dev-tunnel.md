---
title: Local Development with Tunnels and Production Deployment
impact: MEDIUM
tags: ngrok, tunnel, local dev, Vercel, deployment, waitUntil
---

## Local Development

Velt webhooks need a publicly accessible URL. For local development, use a tunnel:

```bash
# Start your dev server
npm run dev

# In another terminal, expose port 3000
npx ngrok http 3000
```

Then set the ngrok URL in Velt Console → Configurations → Webhook Service:
```
https://abc123.ngrok.io/api/webhooks/velt
```

### Production Deployment (Vercel)

1. Deploy your Next.js app to Vercel
2. Set environment variables in Vercel dashboard
3. Update webhook URL in Velt Console to `https://yourapp.vercel.app/api/webhooks/velt`
4. Use `@vercel/functions` for `waitUntil`:

```typescript
import { waitUntil } from "@vercel/functions";

export async function POST(request: Request) {
  return getChat().webhooks.velt(request, {
    waitUntil: (p) => waitUntil(p),
  });
}
```

### Other Platforms

The webhook endpoint works on any Node.js platform that:
- Supports HTTP POST endpoints with raw JSON body access
- Runs on Node.js (not Edge) runtime for `crypto` module access
- Can keep async work alive after responding (via `waitUntil` or long-running processes)
- Returns responses within 15 seconds

### State Persistence

- **Development:** `createMemoryState()` — zero config, lost on restart
- **Production:** `createRedisState()` via `@chat-adapter/state-redis` — survives restarts, required for thread subscriptions to persist

```typescript
import { createMemoryState } from "@chat-adapter/state-memory";
import { createRedisState } from "@chat-adapter/state-redis";

const state = process.env.REDIS_URL
  ? createRedisState()
  : createMemoryState();

const chat = new Chat({ /* ... */ state });
```

### Key Points

- Remember to update the webhook URL in Velt Console when switching between dev and production
- ngrok URLs change on restart (use a paid plan for stable URLs or update the console each time)
- For serverless deployments, `waitUntil` is critical — without it, bot replies may not be sent
