---
title: Write reactions only through a self-hosted @veltdev/node reactions service
impact: MEDIUM
impactDescription: addReaction / removeReaction throw on the managed backend; the adapter delegates writes to a @veltdev/node reactions service you pass in
tags: addReaction, removeReaction, selfHostingConfig, reactionsService, self-hosted, @veltdev/node, saveReactions, deleteReaction
---

## Write reactions only through a self-hosted @veltdev/node reactions service

There is no managed REST endpoint to add a reaction as a user, so `addReaction` / `removeReaction` throw a clear error on the managed Velt backend. To enable writes, pass `selfHostingConfig.reactionsService`: a self-hosted reactions service backed by your own database. Use the `@veltdev/node` service from `sdk.selfHosting.getReactions()`; the adapter calls its `saveReactions` / `deleteReaction` methods.

**Incorrect (hand-rolled object with the wrong method names):**

```typescript
createVeltAdapter({
  botUserId: "velt-bot",
  botUserName: "Velt Bot",
  selfHostingConfig: {
    // BUG: the adapter delegates to saveReactions / deleteReaction, not addReaction / removeReaction
    reactionsService: { addReaction: async () => {}, removeReaction: async () => {} },
  },
});
```

**Correct:**

```typescript
import { VeltSDK } from "@veltdev/node";
import { createVeltAdapter } from "@veltdev/chat-sdk-adapter";

const sdk = VeltSDK.initialize({
  database: { connection_string: process.env.MONGODB_URI },
  apiKey: process.env.VELT_API_KEY,
  authToken: process.env.VELT_AUTH_TOKEN,
});
const reactionsService = await sdk.selfHosting.getReactions();

const adapter = createVeltAdapter({
  botUserId: "velt-bot",
  botUserName: "Velt Bot",
  organizationId: process.env.VELT_ORGANIZATION_ID,
  resolveUsers,
  selfHostingConfig: { reactionsService },
});

// After configuration:
await adapter.addReaction(threadId, messageId, "👍");
await adapter.removeReaction(threadId, messageId, "👍");
```

Most bots only need to read reactions; skip `selfHostingConfig` unless the bot must react.

**Verification Checklist:**
- [ ] Reaction writes are attempted only when `selfHostingConfig.reactionsService` is set
- [ ] The service comes from `await sdk.selfHosting.getReactions()` in `@veltdev/node`
- [ ] The self-hosted database is the same one your Velt reactions data provider uses

**Source Pointers:**
- https://docs.velt.dev/ai/chat-sdk-adapter — "Reactions" (Warning)
- https://docs.velt.dev/backend-sdks/node — "Reactions" (`getReactions()`, `saveReactions`, `deleteReaction`)
- https://docs.velt.dev/self-hosting/partial/reactions — self-hosted reaction data
