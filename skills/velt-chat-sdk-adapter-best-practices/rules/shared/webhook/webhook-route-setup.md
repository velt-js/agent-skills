---
title: Webhook Route Setup (Next.js App Router)
impact: CRITICAL
tags: webhook, route, POST, runtime, nodejs, force-dynamic, waitUntil, after
---

## Webhook Route Setup

The webhook endpoint receives events from Velt and dispatches them to your bot's handlers. The adapter handles signature verification, parsing, and dispatch — you just wire it up.

### Next.js App Router (Recommended)

```typescript
// app/api/webhooks/velt/route.ts
import { after } from "next/server";
import { getChat } from "../../../bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return getChat().webhooks.velt(request, {
    waitUntil: (p) => after(() => p),
  });
}
```

### Vercel Deployment Alternative

On Vercel, use `@vercel/functions` instead of `next/server` for `waitUntil`:

```typescript
import { waitUntil } from "@vercel/functions";
import { getChat } from "../../../bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return getChat().webhooks.velt(request, {
    waitUntil: (p) => waitUntil(p),
  });
}
```

### Why These Settings Matter

- **`runtime = "nodejs"`** — Signature verification uses Node's `crypto` module, which is not available on Edge runtime. Using Edge will cause verification failures.
- **`dynamic = "force-dynamic"`** — Prevents Next.js from caching the route. Webhook payloads are unique per event.
- **`waitUntil`** — Bot replies (thread.post) are async work that happens after the webhook response. Without `waitUntil`, serverless functions may terminate before the reply is sent.

### Express / Other Frameworks

```typescript
import express from "express";
import { getChat } from "./bot";

const app = express();

app.post("/api/webhooks/velt", async (req, res) => {
  const response = await getChat().webhooks.velt(req, {});
  res.status(response.status).send(await response.text());
});
```

### Key Points

- The webhook endpoint must be a POST handler
- Return the Response from `chat.webhooks.velt()` directly — it handles 200/401 status codes
- The adapter returns 200 immediately and processes events asynchronously via `waitUntil`
- Must be publicly accessible (use ngrok for local development)
