---
title: Read reactions on any plan without extra configuration
impact: MEDIUM
impactDescription: Reading reactions needs only the webhook events; adding self-hosting config for reads is unnecessary
tags: onReaction, read, managed, emoji, rawEmoji
---

## Read reactions on any plan without extra configuration

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
