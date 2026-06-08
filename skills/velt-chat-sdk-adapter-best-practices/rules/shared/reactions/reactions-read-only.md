---
title: Reading Reactions (All Plans)
impact: MEDIUM
tags: onReaction, read, managed, emoji
---

## Reading Reactions

Reading reactions via `onReaction` works on all Velt plans with the managed backend. No special configuration is needed beyond enabling the webhook events.

```typescript
chat.onReaction(async (event) => {
  if (event.added) {
    console.log(`${event.user.fullName} reacted with ${event.emoji}`);
  } else {
    console.log(`${event.user.fullName} removed ${event.emoji}`);
  }
});
```

### Required Webhook Events

Enable in Velt Console:
- `comment.reaction_add`
- `comment.reaction_delete`

### Emoji Format

Velt uses named emoji identifiers internally (e.g., `"RAISED_HANDS"`, `"THUMBS_UP"`). The adapter normalizes these to standard emoji characters or shortcodes in `event.emoji`. The original Velt name is available in `event.rawEmoji`.

### Key Points

- Reading reactions is supported on all plans — no self-hosting required
- The `onReaction` handler fires for all reactions across the organization
- Filter by `event.threadId` or `event.messageId` to scope to specific threads/messages
