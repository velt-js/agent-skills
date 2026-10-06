---
title: Give the bot a stable, unique botUserId and matching botUserName
impact: HIGH
impactDescription: The adapter drops events from botUserId; changing or reusing the ID makes the bot answer itself or ignore real users
tags: botUserId, botUserName, feedback loop, from, mention detection, userName
---

## Give the bot a stable, unique botUserId and matching botUserName

`botUserId` and `botUserName` identify the bot. Replies posted with `thread.post()` are authored as `from: { userId: botUserId, name: botUserName }`. When Velt sends the webhook for that reply, the adapter compares the acting user with `botUserId` and ignores it, which prevents reply loops. `botUserName` is also used to detect @-mentions of the bot.

**Incorrect (reuses a human user's ID):**

```typescript
createVeltAdapter({
  botUserId: "user-1",       // BUG: a real user's ID; their comments are now ignored as "bot" events
  botUserName: "Assistant",
});
```

**Correct:**

```typescript
export const BOT_USER_ID = "velt-bot";
export const BOT_USER_NAME = "Velt Bot";

const chat = new Chat<{ velt: VeltAdapter }>({
  userName: BOT_USER_NAME,
  adapters: {
    velt: createVeltAdapter({ botUserId: BOT_USER_ID, botUserName: BOT_USER_NAME, resolveUsers }),
  },
  state: createMemoryState(),
});
```

Include the bot in your user lookup (`resolveUsers`) so its name renders in mentions.

**Verification Checklist:**
- [ ] `botUserId` is unique and never changes between deployments
- [ ] `Chat.userName` equals the adapter's `botUserName`
- [ ] `resolveUsers` resolves the bot's ID too

**Source Pointers:**
- https://docs.velt.dev/ai/chat-sdk-adapter — "Create a user database" and "Create the bot instance"
