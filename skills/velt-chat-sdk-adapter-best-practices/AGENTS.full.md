# Velt Chat Sdk Adapter Best Practices

**Version 1.0.1**  
Velt  
October 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Velt Chat SDK Adapter implementation guide covering bot integration with Velt comment threads via the @veltdev/chat-sdk-adapter package. Covers createVeltAdapter configuration, webhook route setup (Next.js App Router), webhook version handling (v1 Basic vs v2 Advanced/Svix), event handlers (onNewMention, onSubscribedMessage, onReaction), user resolution patterns, reaction read/write capabilities, and deployment patterns for Vercel and other Node.js platforms.

---

## Table of Contents

1. [Core](#1-core) — **CRITICAL**
   - 1.1 [Configure createVeltAdapter with bot identity, organization, and env credentials](#11-configure-createveltadapter-with-bot-identity-organization-and-env-credentials)
   - 1.2 [Set up the Chat SDK Adapter as a lazily created server-side singleton](#12-set-up-the-chat-sdk-adapter-as-a-lazily-created-server-side-singleton)

2. [Webhook](#2-webhook) — **CRITICAL**
   - 2.1 [Enable the comment and reaction webhook events the bot needs](#21-enable-the-comment-and-reaction-webhook-events-the-bot-needs)
   - 2.2 [Expose the webhook route on the Node.js runtime with waitUntil](#22-expose-the-webhook-route-on-the-nodejs-runtime-with-waituntil)
   - 2.3 [Match webhookVersion to the Velt webhook system you configured](#23-match-webhookversion-to-the-velt-webhook-system-you-configured)

3. [Events](#3-events) — **HIGH**
   - 3.1 [Continue conversations with onSubscribedMessage and check isMention](#31-continue-conversations-with-onsubscribedmessage-and-check-ismention)
   - 3.2 [Observe reactions with onReaction](#32-observe-reactions-with-onreaction)
   - 3.3 [Reply to @-mentions with onNewMention and subscribe to the thread](#33-reply-to--mentions-with-onnewmention-and-subscribe-to-the-thread)

4. [Users](#4-users) — **HIGH**
   - 4.1 [Give the bot a stable, unique botUserId and matching botUserName](#41-give-the-bot-a-stable-unique-botuserid-and-matching-botusername)
   - 4.2 [Return index-aligned results from resolveUsers](#42-return-index-aligned-results-from-resolveusers)

5. [Reactions](#5-reactions) — **MEDIUM**
   - 5.1 [Read reactions on any plan without extra configuration](#51-read-reactions-on-any-plan-without-extra-configuration)
   - 5.2 [Write reactions only through a self-hosted @veltdev/node reactions service](#52-write-reactions-only-through-a-self-hosted-veltdevnode-reactions-service)

6. [Deployment](#6-deployment) — **MEDIUM**
   - 6.1 [Keep Velt credentials in environment variables](#61-keep-velt-credentials-in-environment-variables)
   - 6.2 [Use a public tunnel in development and persistent state in production](#62-use-a-public-tunnel-in-development-and-persistent-state-in-production)

---

## 1. Core

**Impact: CRITICAL**

Installing `@veltdev/chat-sdk-adapter`, `chat`, and a state adapter; the lazily created server-side `getChat()` singleton; and `createVeltAdapter` options (`botUserId`, `botUserName`, `organizationId`, `resolveUsers`, `webhookVersion`, `webhookSecret`, `selfHostingConfig`) with env-var fallbacks.

### 1.1 Configure createVeltAdapter with bot identity, organization, and env credentials

**Impact: CRITICAL (botUserId drives feedback-loop filtering and reply authorship; missing credentials make the adapter throw on first use)**

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

---

### 1.2 Set up the Chat SDK Adapter as a lazily created server-side singleton

**Impact: CRITICAL (Creating the Chat instance at module scope requires credentials at build time; creating it per request loses handlers and thread state)**

`@veltdev/chat-sdk-adapter` connects a [Chat SDK](https://chat-sdk.dev) bot to Velt comment threads. It runs on your server (API routes), not in the browser, so there is no `VeltProvider` or `authProvider`. Chat SDK concepts map to Velt as: Thread → comment annotation, Message → comment, Channel → document, `onNewMention` → a comment that @-mentions the bot, `onReaction` → a reaction added or removed, `thread.post()` → a reply in the thread.

Prerequisites: a Velt API key, the Webhook Service enabled in the Velt Console, and a publicly reachable endpoint (a tunnel during development).

```bash
npm install @veltdev/chat-sdk-adapter chat @chat-adapter/state-memory
```

**Incorrect (module-scope instance):**

```typescript
// BUG: evaluated at import time, so builds fail without credentials,
// and every importer shares an instance created before env vars exist
export const chat = new Chat({ userName: "Velt Bot", adapters: { velt: createVeltAdapter({ /* ... */ }) }, state: createMemoryState() });
```

**Correct (lazy singleton with handlers registered once):**

```typescript
// app/bot.ts
import { Chat } from "chat";
import { createMemoryState } from "@chat-adapter/state-memory";
import { createVeltAdapter, type VeltAdapter } from "@veltdev/chat-sdk-adapter";
import { BOT_USER_ID, BOT_USER_NAME, resolveUsers } from "./database";

let chatSingleton: Chat<{ velt: VeltAdapter }> | null = null;

export function getChat() {
  if (chatSingleton) return chatSingleton;

  const chat = new Chat<{ velt: VeltAdapter }>({
    userName: BOT_USER_NAME,
    adapters: {
      velt: createVeltAdapter({
        botUserId: BOT_USER_ID,
        botUserName: BOT_USER_NAME,
        organizationId: process.env.VELT_ORGANIZATION_ID,
        resolveUsers,
      }),
    },
    state: createMemoryState(),
  });

  chat.onNewMention(async (thread, message) => {
    await thread.subscribe();
    await thread.post(`Hi ${message.author.fullName}! How can I help?`);
  });

  chatSingleton = chat;
  return chat;
}
```

`createMemoryState()` loses thread subscriptions on restart; for production use a persistent Chat SDK state adapter.

**Verification Checklist:**
- [ ] The Chat instance is created inside `getChat()`, not at module scope
- [ ] Handlers are registered before the instance is cached
- [ ] `userName` on `Chat` matches `botUserName` on the adapter
- [ ] The code runs only on the server

**Source Pointers:**
- https://docs.velt.dev/ai/chat-sdk-adapter — "How it maps" and "Quickstart" (Install, Create the bot instance)

---

## 2. Webhook

**Impact: CRITICAL**

The webhook route on the Node.js runtime with `waitUntil`, the four events to enable in the Webhook Service, and matching `webhookVersion` (Advanced v2 HMAC vs Basic v1) to the configured secret.

### 2.1 Enable the comment and reaction webhook events the bot needs

**Impact: HIGH (Without comment.add the bot never sees mentions; without the reaction events onReaction never fires)**

In **Velt Console → Configurations → Webhook Service**, set your endpoint URL and enable these events, then copy the webhook secret (`whsec_...`) into `VELT_WEBHOOK_SECRET`:

| Event | Purpose |
|---|---|
| `comment.add` | New comments, including @-mentions of the bot |
| `comment_annotation.add` | New comment threads |
| `comment.reaction_add` | Reactions added (drives `onReaction`) |
| `comment.reaction_delete` | Reactions removed (drives `onReaction`) |

**Incorrect (mentions only):**

```text
Enabled events: comment_annotation.add
Result: replies inside existing threads never reach the bot, and onReaction never fires.
```

**Correct:**

```text
Endpoint: https://yourapp.com/api/webhooks/velt
Enabled events: comment.add, comment_annotation.add, comment.reaction_add, comment.reaction_delete
Secret: copied into VELT_WEBHOOK_SECRET
```

You can also configure the webhook with `POST /v2/workspace/webhookconfig/update`. Update the endpoint URL whenever you switch between a development tunnel and production.

**Verification Checklist:**
- [ ] All four events above are enabled
- [ ] The endpoint URL points at the deployed webhook route
- [ ] `VELT_WEBHOOK_SECRET` matches the secret shown in the Console

**Source Pointers:**
- https://docs.velt.dev/ai/chat-sdk-adapter — "Set up the Velt webhook"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/webhookconfig-update — webhook config REST API
- https://docs.velt.dev/webhooks/advanced — Velt webhooks

---

### 2.2 Expose the webhook route on the Node.js runtime with waitUntil

**Impact: CRITICAL (Edge runtimes break signature verification, cached routes drop events, and serverless functions without waitUntil can exit before the bot replies)**

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

---

### 2.3 Match webhookVersion to the Velt webhook system you configured

**Impact: CRITICAL (A version or secret mismatch makes every webhook fail verification, so the bot never responds)**

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

---

## 3. Events

**Impact: HIGH**

`onNewMention` with `thread.subscribe()` and `thread.post()` (including streamed AI replies), `onSubscribedMessage` with `isMention` filtering, and `onReaction`.

### 3.1 Continue conversations with onSubscribedMessage and check isMention

**Impact: HIGH (Subscribed threads deliver every new message; replying to all of them makes the bot noisy)**

After `thread.subscribe()`, every new message in that thread triggers `chat.onSubscribedMessage(handler)`. Check `message.isMention` to decide whether the bot was addressed. For AI bots, load recent history with `thread.adapter.fetchMessages(thread.id, { limit })` for context.

**Incorrect (answers every message in every subscribed thread):**

```typescript
chat.onSubscribedMessage(async (thread, message) => {
  await thread.post("Noted!"); // BUG: replies to human-to-human messages too
});
```

**Correct:**

```typescript
chat.onSubscribedMessage(async (thread, message) => {
  if (!message.isMention) return;

  const history = await thread.adapter.fetchMessages(thread.id, { limit: 20 });
  const messages = history.messages.map((m) => ({
    role: m.author.userId === BOT_USER_ID ? ("assistant" as const) : ("user" as const),
    content: m.text,
  }));

  const result = streamText({ model: anthropic(process.env.AI_MODEL!), messages });
  await thread.post(result.textStream);
});
```

Subscriptions live in the Chat SDK state adapter; with `createMemoryState()` they are lost on restart.

**Verification Checklist:**
- [ ] `onNewMention` calls `thread.subscribe()` so this handler fires
- [ ] The handler filters on `message.isMention` (or another explicit rule)
- [ ] Production bots use persistent state so subscriptions survive restarts

**Source Pointers:**
- https://docs.velt.dev/ai/chat-sdk-adapter — "Create the bot instance" (subscribe pattern)

---

### 3.2 Observe reactions with onReaction

**Impact: MEDIUM (onReaction is read-only on managed Velt; it requires the reaction webhook events and fires for reactions across the organization)**

`chat.onReaction(handler)` fires when a user adds or removes a reaction on a comment (the `comment.reaction_add` / `comment.reaction_delete` webhooks). Reading reactions works on all Velt plans. Writing reactions from the bot is a separate, self-hosted-only capability (see `reactions-write-self-hosted`).

**Incorrect (tries to react back on the managed backend):**

```typescript
chat.onReaction(async (event) => {
  // BUG: throws on the managed Velt backend unless selfHostingConfig.reactionsService is set
  await event.adapter.addReaction(event.threadId, event.messageId, "👍");
});
```

**Correct:**

```typescript
chat.onReaction(async (event) => {
  console.log(`${event.user.fullName} ${event.added ? "added" : "removed"} ${event.emoji}`);
  if (event.added && event.emoji === "👍") {
    await logPositiveFeedback(event.threadId, event.messageId);
  }
});
```

Event fields: `event.user` (`fullName`, `userId`), `event.emoji` (normalized), `event.rawEmoji` (the raw value from the Velt payload), `event.added`, `event.messageId` (the comment ID), and `event.threadId`. Filter by `threadId` or `messageId` to scope handling; the bot's own reactions are ignored.

**Verification Checklist:**
- [ ] `comment.reaction_add` and `comment.reaction_delete` are enabled in the Console
- [ ] The handler only reads reactions unless self-hosted writes are configured
- [ ] Handling is scoped by `threadId` / `messageId` where needed

**Source Pointers:**
- https://docs.velt.dev/ai/chat-sdk-adapter — "Create the bot instance" (`onReaction`) and "Reactions"

---

### 3.3 Reply to @-mentions with onNewMention and subscribe to the thread

**Impact: HIGH (onNewMention is the bot's entry point; without thread.subscribe() follow-up messages in that thread are ignored)**

`chat.onNewMention(handler)` fires when a comment @-mentions the bot. Call `thread.subscribe()` to keep receiving that thread's messages (see `events-on-subscribed-message`), then reply with `thread.post()`, which adds a reply to the Velt comment thread as the bot user. `thread.post()` accepts a string or a text stream, so you can stream an LLM reply.

**Incorrect (replies once and never follows the thread):**

```typescript
chat.onNewMention(async (thread, message) => {
  await thread.post("Hello!"); // BUG: no thread.subscribe(), so follow-ups never reach the bot
});
```

**Correct (greeting bot):**

```typescript
chat.onNewMention(async (thread, message) => {
  await thread.subscribe();
  await thread.post(`Hi ${message.author.fullName}! How can I help?`);
});
```

**Correct (streaming AI reply with the Vercel AI SDK):**

```typescript
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

chat.onNewMention(async (thread, message) => {
  await thread.subscribe();
  const result = streamText({
    model: anthropic(process.env.AI_MODEL!),
    system: "You are a helpful assistant.",
    messages: [{ role: "user", content: message.text }],
  });
  await thread.post(result.textStream);
});
```

Useful fields: `message.author.fullName` / `message.author.userId`, `message.text`, `message.isMention`, and `message.raw` (the Velt comment, including document context such as `documentName`, `documentUrl`, and `anchoredText`). `thread.id` encodes organization, document, and annotation (`velt:{organizationId}:{documentId}:{annotationId}`).

**Verification Checklist:**
- [ ] The handler is registered inside `getChat()` before the instance is cached
- [ ] `thread.subscribe()` is called when follow-up conversation is expected
- [ ] Streaming replies pass a text stream to `thread.post()`
- [ ] The bot's own replies are not handled as mentions (the adapter ignores events from `botUserId`)

**Source Pointers:**
- https://docs.velt.dev/ai/chat-sdk-adapter — "How it maps" and "Create the bot instance"

---

## 4. Users

**Impact: HIGH**

A stable, unique `botUserId` and matching `botUserName` to avoid reply loops, and index-aligned `resolveUsers` results.

### 4.1 Give the bot a stable, unique botUserId and matching botUserName

**Impact: HIGH (The adapter drops events from botUserId; changing or reusing the ID makes the bot answer itself or ignore real users)**

`botUserId` and `botUserName` identify the bot. Replies posted with `thread.post()` are authored as `from: { userId: botUserId, name: botUserName }`. When Velt sends the webhook for that reply, the adapter compares the acting user with `botUserId` and ignores it, which prevents reply loops. `botUserName` is also used to detect @-mentions of the bot.

**Incorrect (reuses a human user's ID):**

```typescript
createVeltAdapter({
  botUserId: "user-1",       // BUG: a real user's ID; their comments are now ignored as "bot" events
  botUserName: "Assistant",
});
```

**Correct:**

```typescript
export const BOT_USER_ID = "velt-bot";
export const BOT_USER_NAME = "Velt Bot";

const chat = new Chat<{ velt: VeltAdapter }>({
  userName: BOT_USER_NAME,
  adapters: {
    velt: createVeltAdapter({ botUserId: BOT_USER_ID, botUserName: BOT_USER_NAME, resolveUsers }),
  },
  state: createMemoryState(),
});
```

Include the bot in your user lookup (`resolveUsers`) so its name renders in mentions.

**Verification Checklist:**
- [ ] `botUserId` is unique and never changes between deployments
- [ ] `Chat.userName` equals the adapter's `botUserName`
- [ ] `resolveUsers` resolves the bot's ID too

**Source Pointers:**
- https://docs.velt.dev/ai/chat-sdk-adapter — "Create a user database" and "Create the bot instance"

---

### 4.2 Return index-aligned results from resolveUsers

**Impact: HIGH (resolveUsers results are matched by position; a filtered or reordered array attaches names to the wrong users)**

`resolveUsers({ userIds })` converts Velt user IDs into display info (`{ name }`). The adapter uses it to turn mention tokens into readable `@Name` text and to fill in authors. Return one entry per input ID, in the same order, with `undefined` for unknown users. It may be synchronous or return a Promise.

**Incorrect (filters out unknown users):**

```typescript
function resolveUsers({ userIds }: { userIds: string[] }) {
  // BUG: dropping unknown IDs shifts every later name onto the wrong user
  return USERS.filter((u) => userIds.includes(u.userId)).map((u) => ({ name: u.name }));
}
```

**Correct:**

```typescript
// app/database.ts
export const BOT_USER_ID = "velt-bot";
export const BOT_USER_NAME = "Velt Bot";

const USERS = [
  { userId: "user-1", name: "Charlie Layne" },
  { userId: "user-2", name: "Mislav Abha" },
  { userId: BOT_USER_ID, name: BOT_USER_NAME },
];

export function getUser(userId: string) {
  const user = USERS.find((u) => u.userId === userId);
  return user ? { name: user.name } : undefined;
}

export function resolveUsers({ userIds }: { userIds: string[] }) {
  return userIds.map((id) => getUser(id));
}
```

For production, look users up in your database (batch the query, then map back in input order).

**Verification Checklist:**
- [ ] Output length equals input length, in the same order
- [ ] Unknown users map to `undefined`
- [ ] The bot user is resolvable

**Source Pointers:**
- https://docs.velt.dev/ai/chat-sdk-adapter — "Create a user database"

---

## 5. Reactions

**Impact: MEDIUM**

Reading reactions on any plan, and writing them only through `selfHostingConfig.reactionsService` backed by the `@veltdev/node` self-hosted reactions service.

### 5.1 Read reactions on any plan without extra configuration

**Impact: MEDIUM (Reading reactions needs only the webhook events; adding self-hosting config for reads is unnecessary)**

Reading reactions with `onReaction` works on all Velt plans with the managed backend. Enable `comment.reaction_add` and `comment.reaction_delete` in the Webhook Service; no `selfHostingConfig` is needed.

**Incorrect (adds self-hosting just to read):**

```typescript
createVeltAdapter({
  botUserId: "velt-bot",
  botUserName: "Velt Bot",
  selfHostingConfig: { reactionsService }, // Unneeded: reads work without it
});
```

**Correct:**

```typescript
chat.onReaction(async (event) => {
  if (event.added) {
    console.log(`${event.user.fullName} reacted with ${event.emoji}`);
  } else {
    console.log(`${event.user.fullName} removed ${event.emoji}`);
  }
});
```

`event.emoji` is normalized for the Chat SDK; `event.rawEmoji` carries the raw value from the Velt reaction payload.

**Verification Checklist:**
- [ ] Both reaction webhook events are enabled
- [ ] No `selfHostingConfig` is added solely for reading
- [ ] Handlers filter by `threadId` / `messageId` when only some threads matter

**Source Pointers:**
- https://docs.velt.dev/ai/chat-sdk-adapter — "Reactions" and "Set up the Velt webhook"

---

### 5.2 Write reactions only through a self-hosted @veltdev/node reactions service

**Impact: MEDIUM (addReaction / removeReaction throw on the managed backend; the adapter delegates writes to a @veltdev/node reactions service you pass in)**

There is no managed REST endpoint to add a reaction as a user, so `addReaction` / `removeReaction` throw a clear error on the managed Velt backend. To enable writes, pass `selfHostingConfig.reactionsService`: a self-hosted reactions service backed by your own database. Use the `@veltdev/node` service from `sdk.selfHosting.getReactions()`; the adapter calls its `saveReactions` / `deleteReaction` methods.

**Incorrect (hand-rolled object with the wrong method names):**

```typescript
createVeltAdapter({
  botUserId: "velt-bot",
  botUserName: "Velt Bot",
  selfHostingConfig: {
    // BUG: the adapter delegates to saveReactions / deleteReaction, not addReaction / removeReaction
    reactionsService: { addReaction: async () => {}, removeReaction: async () => {} },
  },
});
```

**Correct:**

```typescript
import { VeltSDK } from "@veltdev/node";
import { createVeltAdapter } from "@veltdev/chat-sdk-adapter";

const sdk = VeltSDK.initialize({
  database: { connection_string: process.env.MONGODB_URI },
  apiKey: process.env.VELT_API_KEY,
  authToken: process.env.VELT_AUTH_TOKEN,
});
const reactionsService = await sdk.selfHosting.getReactions();

const adapter = createVeltAdapter({
  botUserId: "velt-bot",
  botUserName: "Velt Bot",
  organizationId: process.env.VELT_ORGANIZATION_ID,
  resolveUsers,
  selfHostingConfig: { reactionsService },
});

// After configuration:
await adapter.addReaction(threadId, messageId, "👍");
await adapter.removeReaction(threadId, messageId, "👍");
```

Most bots only need to read reactions; skip `selfHostingConfig` unless the bot must react.

**Verification Checklist:**
- [ ] Reaction writes are attempted only when `selfHostingConfig.reactionsService` is set
- [ ] The service comes from `await sdk.selfHosting.getReactions()` in `@veltdev/node`
- [ ] The self-hosted database is the same one your Velt reactions data provider uses

**Source Pointers:**
- https://docs.velt.dev/ai/chat-sdk-adapter — "Reactions" (Warning)
- https://docs.velt.dev/backend-sdks/node — "Reactions" (`getReactions()`, `saveReactions`, `deleteReaction`)
- https://docs.velt.dev/self-hosting/partial/reactions — self-hosted reaction data

---

## 6. Deployment

**Impact: MEDIUM**

Public tunnels for development, production webhook URLs, persistent state, and environment variables (`VELT_API_KEY`, `VELT_WEBHOOK_SECRET`, `VELT_ORGANIZATION_ID`, optional `VELT_AUTH_TOKEN`).

### 6.1 Keep Velt credentials in environment variables

**Impact: MEDIUM (Committed secrets leak; a missing VELT_WEBHOOK_SECRET or API key makes every webhook fail)**

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

---

### 6.2 Use a public tunnel in development and persistent state in production

**Impact: MEDIUM (Velt cannot reach localhost; stale webhook URLs and in-memory state are the usual reasons a deployed bot goes quiet)**

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

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/ai/chat-sdk-adapter
- https://chat-sdk.dev
- https://docs.velt.dev/backend-sdks/node
