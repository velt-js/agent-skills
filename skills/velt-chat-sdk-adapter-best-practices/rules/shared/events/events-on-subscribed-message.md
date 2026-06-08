---
title: Handle Continued Conversation with onSubscribedMessage
impact: HIGH
tags: onSubscribedMessage, subscribe, continued conversation, follow-up
---

## Handle Continued Conversation with onSubscribedMessage

After calling `thread.subscribe()` in `onNewMention`, subsequent messages in that thread trigger `onSubscribedMessage`. This enables multi-turn conversations.

```typescript
chat.onSubscribedMessage(async (thread, message) => {
  if (message.isMention) {
    await thread.post(`You mentioned me again, ${message.author.fullName}!`);
  }
});
```

### When It Fires

- Only for threads where `thread.subscribe()` was previously called
- For every new message in the subscribed thread (not just mentions)
- The `message.isMention` flag tells you whether the bot was explicitly @-mentioned

### AI Bot Pattern with Thread History

For AI bots, fetch the full thread history to provide context:

```typescript
chat.onSubscribedMessage(async (thread, message) => {
  if (!message.isMention) return;

  const history = await thread.adapter.fetchMessages(thread.id, { limit: 20 });
  const messages = history.messages.map((m) => ({
    role: m.author.userId === "my-bot" ? "assistant" as const : "user" as const,
    content: m.text,
  }));

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: "You are a helpful assistant.",
    messages,
  });

  await thread.post(result.textStream);
});
```

### Key Points

- Without `thread.subscribe()` in `onNewMention`, `onSubscribedMessage` never fires for that thread
- Check `message.isMention` to decide whether to respond — otherwise the bot replies to every message in every subscribed thread
- Thread subscriptions are stored in the state adapter (memory or Redis). With `createMemoryState()`, subscriptions are lost on restart
- For production bots that need to survive restarts, use `@chat-adapter/state-redis`
