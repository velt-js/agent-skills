---
title: Reply to @-mentions with onNewMention and subscribe to the thread
impact: HIGH
impactDescription: onNewMention is the bot's entry point; without thread.subscribe() follow-up messages in that thread are ignored
tags: onNewMention, thread, message, subscribe, post, mention, streaming, AI bot
---

## Reply to @-mentions with onNewMention and subscribe to the thread

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
