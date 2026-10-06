---
title: Observe reactions with onReaction
impact: MEDIUM
impactDescription: onReaction is read-only on managed Velt; it requires the reaction webhook events and fires for reactions across the organization
tags: onReaction, emoji, added, removed, reaction, comment.reaction_add, comment.reaction_delete
---

## Observe reactions with onReaction

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
