---
title: Chat SDK Adapter Setup Overview
impact: CRITICAL
tags: setup, Chat, createVeltAdapter, singleton, state-memory, prerequisites
---

## Chat SDK Adapter Setup Overview

The Chat SDK Adapter is a server-side library that connects your bot to Velt comment threads. It is NOT a client-side React component — it runs in API routes (Next.js, Express, etc.).

### Prerequisites

- A Velt account with an API key
- Webhook service enabled in Velt Console (Configurations → Webhook Service)
- A publicly accessible endpoint for webhooks (or ngrok for local dev)

### Required Packages

```bash
npm install @veltdev/chat-sdk-adapter chat @chat-adapter/state-memory
```

- `@veltdev/chat-sdk-adapter` — The Velt adapter
- `chat` — The Chat SDK framework
- `@chat-adapter/state-memory` — In-memory state for thread/message tracking

### The Singleton Pattern

The Chat instance must be created lazily as a singleton. This avoids requiring credentials at build time and ensures all webhook requests share the same event handlers and state.

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

  // Register event handlers here (see events rules)
  chat.onNewMention(async (thread, message) => {
    await thread.subscribe();
    await thread.post(`Hi ${message.author.fullName}!`);
  });

  chatSingleton = chat;
  return chat;
}
```

### Key Points

- Create the Chat instance lazily in a `getChat()` function — not at module scope
- Register all event handlers (`onNewMention`, `onReaction`, etc.) before assigning to the singleton
- Use `createMemoryState()` for development; consider `@chat-adapter/state-redis` for production (survives restarts)
- The `userName` on Chat and `botUserName` on the adapter should match
