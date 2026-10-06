---
title: Continue conversations with onSubscribedMessage and check isMention
impact: HIGH
impactDescription: Subscribed threads deliver every new message; replying to all of them makes the bot noisy
tags: onSubscribedMessage, subscribe, continued conversation, follow-up, isMention, fetchMessages
---

## Continue conversations with onSubscribedMessage and check isMention

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
