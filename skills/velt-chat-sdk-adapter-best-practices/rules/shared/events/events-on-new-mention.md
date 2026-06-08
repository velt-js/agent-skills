---
title: Handle Bot Mentions with onNewMention
impact: HIGH
tags: onNewMention, thread, message, subscribe, post, mention
---

## Handle Bot Mentions with onNewMention

`onNewMention` fires when a user @-mentions the bot in a comment thread for the first time. This is the primary entry point for bot interactions.

```typescript
chat.onNewMention(async (thread, message) => {
  await thread.subscribe();
  await thread.post(`Hi ${message.author.fullName}! How can I help?`);
});
```

### Parameters

- **`thread`** — The comment thread where the bot was mentioned. Has methods:
  - `thread.post(text)` — Reply to the thread (posts as the bot user)
  - `thread.subscribe()` — Subscribe to future messages in this thread
  - `thread.id` — Encoded thread ID (`velt:{orgId}:{docId}:{annotationId}`)
  - `thread.adapter` — Reference to the VeltAdapter instance

- **`message`** — The comment that mentioned the bot:
  - `message.author.fullName` — Display name of the author
  - `message.author.userId` — User ID of the author
  - `message.text` — Plain text content of the message
  - `message.isMention` — Always `true` in onNewMention
  - `message.raw` — Raw Velt webhook payload (VeltRawMessage)

### The thread.subscribe() Pattern

Calling `thread.subscribe()` tells the Chat SDK to keep tracking this thread. Without it, the bot only responds to the initial mention — subsequent messages in the same thread are ignored. Always call subscribe if you want continued conversation.

### AI Bot Pattern (Streaming)

For AI bots, use the Vercel AI SDK's `streamText` and pass the stream directly to `thread.post()`:

```typescript
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

chat.onNewMention(async (thread, message) => {
  await thread.subscribe();

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: "You are a helpful assistant.",
    messages: [{ role: "user", content: message.text }],
  });

  await thread.post(result.textStream);
});
```

### Key Points

- Always call `thread.subscribe()` if you want the bot to respond to follow-up messages
- `thread.post()` accepts a string or a ReadableStream (for streaming LLM responses)
- The bot's own replies do NOT trigger `onNewMention` — the adapter filters out events from `botUserId`
- Register `onNewMention` before the Chat instance is used (inside `getChat()`, before assigning to singleton)
