---
title: Handle Reactions with onReaction
impact: MEDIUM
tags: onReaction, emoji, added, removed, reaction
---

## Handle Reactions with onReaction

`onReaction` fires when a user adds or removes a reaction (emoji) on a comment. This is read-only on managed Velt — the handler observes reactions but cannot programmatically add them without self-hosting (see reactions rules).

```typescript
chat.onReaction(async (event) => {
  console.log(
    `${event.user.fullName} ${event.added ? "added" : "removed"} ${event.emoji}`
  );
});
```

### Event Properties

| Property | Type | Description |
|----------|------|-------------|
| `event.user.fullName` | `string` | User who reacted |
| `event.user.userId` | `string` | User ID |
| `event.emoji` | `string` | Emoji value (e.g., `"👍"` or `"thumbsup"`) |
| `event.rawEmoji` | `string` | Original emoji name from Velt (e.g., `"RAISED_HANDS"`) |
| `event.added` | `boolean` | `true` if added, `false` if removed |
| `event.messageId` | `string` | ID of the comment that was reacted to |
| `event.threadId` | `string` | Encoded thread ID |

### Use Cases

- Track sentiment on bot replies (thumbs up/down)
- Trigger actions on specific reactions (e.g., 👀 to acknowledge, ✅ to mark done)
- Log reaction analytics

```typescript
chat.onReaction(async (event) => {
  if (event.added && event.emoji === "👍") {
    // User approved the bot's response
    await logPositiveFeedback(event.threadId, event.messageId);
  }
});
```

### Reading vs Writing Reactions

`onReaction` is **read-only** — it observes reactions that users add/remove in the Velt UI. There is no managed REST API endpoint to programmatically add a reaction as a user. Calling `addReaction()` or `removeReaction()` on the managed Velt backend throws a `PermissionError`. To write reactions programmatically, you must configure `selfHostingConfig.reactionsService` on the adapter (see reactions rules). Most bots only need to read reactions.

### Key Points

- Requires `comment.reaction_add` and `comment.reaction_delete` events enabled in Velt Console
- The handler fires for all reactions in the organization, not just on bot messages
- Bot's own reactions (if using self-hosted write) are filtered out by `botUserId`
- Writing reactions (`addReaction`/`removeReaction`) is NOT available on managed Velt — requires self-hosting configuration
