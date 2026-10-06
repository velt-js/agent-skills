---
title: Expose the webhook route on the Node.js runtime with waitUntil
impact: CRITICAL
impactDescription: Edge runtimes break signature verification, cached routes drop events, and serverless functions without waitUntil can exit before the bot replies
tags: webhook, route, POST, runtime, nodejs, force-dynamic, waitUntil, after, vercel, express
---

## Expose the webhook route on the Node.js runtime with waitUntil

Velt posts comment and reaction events to your endpoint; `chat.webhooks.velt(request, options)` verifies the signature, parses the event, and dispatches to your handlers. The route must run on Node.js because verification needs the raw body and Node's `crypto`. Pass `waitUntil` so reply work can finish after the response is returned.

**Incorrect (Edge runtime, no waitUntil):**

```typescript
export const runtime = "edge"; // BUG: signature verification needs Node's crypto and the raw body

export async function POST(request: Request) {
  return getChat().webhooks.velt(request); // BUG: async reply work may be cut off
}
```

**Correct (Next.js App Router):**

```typescript
// app/api/webhooks/velt/route.ts
import { after } from "next/server";
import { getChat } from "../../../bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return getChat().webhooks.velt(request, { waitUntil: (p) => after(() => p) });
}
```

**Correct (Vercel, `@vercel/functions`):**

```typescript
import { waitUntil } from "@vercel/functions";
import { getChat } from "../../../bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return getChat().webhooks.velt(request, { waitUntil: (p) => waitUntil(p) });
}
```

**Other Node frameworks:** the handler takes a Fetch API `Request` and returns a `Response`. On frameworks that use their own request objects (for example Express), build a `Request` from the **raw, unparsed** body and the original headers before calling it; a JSON-parsed body breaks signature verification.

```typescript
import express from "express";
import { getChat } from "./bot";

const app = express();

app.post("/api/webhooks/velt", express.raw({ type: "*/*" }), async (req, res) => {
  const request = new Request(`https://${req.headers.host}${req.originalUrl}`, {
    method: "POST",
    headers: new Headers(req.headers as Record<string, string>),
    body: req.body, // raw Buffer
  });
  const response = await getChat().webhooks.velt(request, {});
  res.status(response.status).send(await response.text());
});
```

**Verification Checklist:**
- [ ] The route runs on Node.js (`runtime = "nodejs"` in Next.js)
- [ ] The route is not cached (`dynamic = "force-dynamic"`)
- [ ] `waitUntil` is wired to `after` (Next.js) or `@vercel/functions`
- [ ] Non-Fetch frameworks pass the raw body, not parsed JSON
- [ ] The endpoint is publicly reachable

**Source Pointers:**
- https://docs.velt.dev/ai/chat-sdk-adapter — "Create the webhook endpoint"
