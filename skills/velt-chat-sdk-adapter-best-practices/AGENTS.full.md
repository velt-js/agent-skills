# Velt Chat SDK Adapter Best Practices — Full Guide
|v1.0.0|Velt|June 2026

IMPORTANT: The Chat SDK Adapter is server-side only — it runs in API routes, NOT in the browser. There is no VeltProvider or authProvider. The adapter authenticates via VELT_API_KEY and auto-generates auth tokens.

---

## 1. Core — CRITICAL

### 1.1 Setup Overview

Required packages:
```bash
npm install @veltdev/chat-sdk-adapter chat @chat-adapter/state-memory
```

Create the Chat instance as a lazy singleton:

```typescript
import { Chat } from "chat";
import { createMemoryState } from "@chat-adapter/state-memory";
import { createVeltAdapter, type VeltAdapter } from "@veltdev/chat-sdk-adapter";

let chatSingleton: Chat<{ velt: VeltAdapter }> | null = null;

export function getChat(): Chat<{ velt: VeltAdapter }> {
  if (chatSingleton) return chatSingleton;

  const chat = new Chat<{ velt: VeltAdapter }>({
    userName: "My Bot",
    adapters: {
      velt: createVeltAdapter({
        botUserId: "my-bot",
        botUserName: "My Bot",
        organizationId: process.env.VELT_ORGANIZATION_ID!,
        resolveUsers,
      }),
    },
    state: createMemoryState(),
  });

  chat.onNewMention(async (thread, message) => {
    await thread.subscribe();
    await thread.post(`Hi ${message.author.fullName}!`);
  });

  chatSingleton = chat;
  return chat;
}
```

### 1.2 createVeltAdapter Configuration

| Option | Required | Description |
|--------|----------|-------------|
| `botUserId` | Yes | Unique ID for the bot (filters out bot's own events) |
| `botUserName` | Yes | Display name on bot replies |
| `organizationId` | Yes | Velt org ID for token scoping |
| `resolveUsers` | Yes | Maps user IDs to display names |
| `webhookVersion` | No | `"v2"` (default) or `"v1"` |
| `webhookSecret` | No | Overrides `VELT_WEBHOOK_SECRET` env var |
| `selfHostingConfig` | No | For writing reactions (self-hosted only) |

Environment variables: `VELT_API_KEY` (required), `VELT_WEBHOOK_SECRET` (required), `VELT_ORGANIZATION_ID` (required), `VELT_AUTH_TOKEN` (optional — auto-generated if omitted).

---

## 2. Webhook — CRITICAL

### 2.1 Route Setup (Next.js App Router)

```typescript
// app/api/webhooks/velt/route.ts
import { after } from "next/server";
import { getChat } from "../../../bot";

export const runtime = "nodejs";        // crypto module needs Node.js
export const dynamic = "force-dynamic"; // never cache webhooks

export async function POST(request: Request) {
  return getChat().webhooks.velt(request, {
    waitUntil: (p) => after(() => p),
  });
}
```

Vercel alternative: use `waitUntil` from `@vercel/functions`.

### 2.2 Webhook Versions

**v2 (default):** Svix HMAC-SHA256. Secret format: `whsec_<base64>`. Headers: `webhook-id`, `webhook-timestamp`, `webhook-signature`. Replay protection via timestamp check.

**v1:** `Authorization: Basic <token>`. Set `webhookVersion: "v1"` in adapter config.

### 2.3 Required Events

Enable in Velt Console → Configurations → Webhook Service:
- `comment.add` (required — mention detection)
- `comment_annotation.add` (new threads)
- `comment.reaction_add` / `comment.reaction_delete` (for reaction support)

---

## 3. Events — HIGH

### 3.1 onNewMention

```typescript
chat.onNewMention(async (thread, message) => {
  await thread.subscribe();
  await thread.post(`Hi ${message.author.fullName}!`);
});
```

Always call `thread.subscribe()` to enable follow-up messages. For AI bots, pass `streamText().textStream` to `thread.post()`.

### 3.2 onSubscribedMessage

```typescript
chat.onSubscribedMessage(async (thread, message) => {
  if (message.isMention) {
    await thread.post("Still here!");
  }
});
```

Only fires for threads where `subscribe()` was called. Check `message.isMention` to avoid responding to every message.

### 3.3 onReaction

```typescript
chat.onReaction(async (event) => {
  console.log(`${event.user.fullName} ${event.added ? "added" : "removed"} ${event.emoji}`);
});
```

Read-only on managed Velt. Properties: `user`, `emoji`, `rawEmoji`, `added`, `messageId`, `threadId`.

---

## 4. Users — HIGH

### 4.1 resolveUsers Pattern

```typescript
function resolveUsers({ userIds }: { userIds: string[] }): (User | undefined)[] {
  return userIds.map((id) => {
    const user = USERS.find((u) => u.userId === id);
    return user ? { name: user.name } : undefined;
  });
}
```

Output array must match input length and indices. Return `undefined` for unknown users.

### 4.2 Bot User Config

`botUserId` prevents feedback loops — the adapter ignores events from this user ID. Must be unique and stable. `botUserName` appears in the Velt comment UI.

---

## 5. Reactions — MEDIUM

### 5.1 Reading

Works on all plans via `onReaction`. Requires `comment.reaction_add`/`comment.reaction_delete` events.

### 5.2 Writing (Self-Hosted Only)

`addReaction`/`removeReaction` throw without `selfHostingConfig.reactionsService`. Most bots only need reading.

---

## 6. Deployment — MEDIUM

### 6.1 Environment Variables

Required: `VELT_API_KEY`, `VELT_WEBHOOK_SECRET`, `VELT_ORGANIZATION_ID`. Optional: `VELT_AUTH_TOKEN` (auto-generated if omitted).

### 6.2 Dev & Production

Local: ngrok tunnel → set URL in Velt Console. Production: deploy to Vercel, use `@vercel/functions` for `waitUntil`. For persistent subscriptions, use `@chat-adapter/state-redis` instead of memory state.
