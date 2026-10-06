---
title: Set up the Chat SDK Adapter as a lazily created server-side singleton
impact: CRITICAL
impactDescription: Creating the Chat instance at module scope requires credentials at build time; creating it per request loses handlers and thread state
tags: setup, Chat, createVeltAdapter, singleton, getChat, state-memory, prerequisites, server-side
---

## Set up the Chat SDK Adapter as a lazily created server-side singleton

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
