---
title: Use a public tunnel in development and persistent state in production
impact: MEDIUM
impactDescription: Velt cannot reach localhost; stale webhook URLs and in-memory state are the usual reasons a deployed bot goes quiet
tags: ngrok, tunnel, local dev, Vercel, deployment, waitUntil, state, redis
---

## Use a public tunnel in development and persistent state in production

Velt webhooks need a publicly reachable URL. During development expose your local server with a tunnel and point the Webhook Service at it; in production point it at the deployed route.

**Incorrect (localhost endpoint):**

```text
Webhook URL: http://localhost:3000/api/webhooks/velt
Result: Velt cannot reach it, so no events arrive.
```

**Correct (development):**

```bash
npm run dev
# In another terminal:
npx ngrok http 3000
# Set https://<your-tunnel-host>/api/webhooks/velt in Velt Console → Configurations → Webhook Service
```

**Correct (production on Vercel):**

```typescript
import { waitUntil } from "@vercel/functions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return getChat().webhooks.velt(request, { waitUntil: (p) => waitUntil(p) });
}
```

Set the environment variables in your hosting platform and update the Console webhook URL to the production route.

**State:** `createMemoryState()` is fine for development but loses thread subscriptions on restart. In production, use a persistent Chat SDK state adapter (for example `@chat-adapter/state-redis`) so `onSubscribedMessage` keeps working across deploys.

**Verification Checklist:**
- [ ] The Console webhook URL matches the current environment
- [ ] Tunnel URLs are updated after the tunnel restarts
- [ ] Serverless deployments pass `waitUntil`
- [ ] Production uses persistent state

**Source Pointers:**
- https://docs.velt.dev/ai/chat-sdk-adapter — "Create the webhook endpoint" and "Set up the Velt webhook"
