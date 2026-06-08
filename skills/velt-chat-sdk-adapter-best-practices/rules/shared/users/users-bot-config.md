---
title: Bot User Configuration and Feedback Loop Avoidance
impact: HIGH
tags: botUserId, botUserName, feedback loop, agent, from
---

## Bot User Configuration

The `botUserId` and `botUserName` identify the bot in Velt's system. They serve two purposes: attributing bot replies and filtering out the bot's own webhook events.

```typescript
createVeltAdapter({
  botUserId: "velt-bot",       // Unique, stable ID
  botUserName: "Velt Bot",     // Human-readable display name
  // ...
});
```

### Feedback Loop Prevention

When the bot posts a reply via `thread.post()`, Velt fires a `comment.add` webhook for that reply. Without filtering, the bot would process its own message and potentially reply again infinitely.

The adapter prevents this by comparing `event.actionUser.userId` against `botUserId`. If they match, the event is silently ignored. This is why `botUserId` must be consistent — if it doesn't match, the bot enters a feedback loop.

### Bot Reply Attribution

Bot replies are posted with the `from` field set to `{ userId: botUserId }` and are tagged with an `agent` metadata block:

```json
{
  "from": { "userId": "velt-bot" },
  "agent": {
    "agentSource": "velt",
    "agentId": "velt-bot",
    "sourceType": "agent"
  }
}
```

### Key Points

- `botUserId` must be a unique, stable string — never reuse an existing human user's ID
- `botUserName` appears in the Velt comment UI as the reply author
- If you change `botUserId`, old webhook events from the bot won't be filtered — the bot may reply to its own historical messages
- The `userName` on the Chat constructor should match `botUserName` on the adapter
