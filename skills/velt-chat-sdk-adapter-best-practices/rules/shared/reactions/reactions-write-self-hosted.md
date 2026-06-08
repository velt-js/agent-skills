---
title: Writing Reactions (Self-Hosted Only)
impact: MEDIUM
tags: addReaction, removeReaction, selfHostingConfig, reactionsService, self-hosted
---

## Writing Reactions (Self-Hosted Only)

Programmatically adding or removing reactions (`addReaction`/`removeReaction`) is NOT supported on the managed Velt backend. Calling these methods without self-hosting configuration throws a `PermissionError`.

### Why It's Restricted

There is no managed REST API endpoint to add a reaction as a specific user. Reactions are normally created by the user clicking in the Velt comment UI.

### Enabling Reaction Writes

Pass a `selfHostingConfig.reactionsService` to the adapter:

```typescript
import { createVeltAdapter } from "@veltdev/chat-sdk-adapter";

const reactionsService = {
  addReaction: async (payload) => {
    // Your custom implementation (e.g., direct MongoDB write)
    return result;
  },
  removeReaction: async (payload) => {
    // Your custom implementation
    return result;
  },
};

const adapter = createVeltAdapter({
  botUserId: "my-bot",
  botUserName: "My Bot",
  organizationId: process.env.VELT_ORGANIZATION_ID!,
  resolveUsers,
  selfHostingConfig: {
    reactionsService,
  },
});
```

### Usage After Configuration

```typescript
// Add a reaction to a specific message
await adapter.addReaction(threadId, messageId, "👍");

// Remove a reaction
await adapter.removeReaction(threadId, messageId, "👍");
```

### Key Points

- Most bots only need to READ reactions (via `onReaction`) — writing reactions is an advanced use case
- Self-hosting requires running your own data backend (typically MongoDB with `@veltdev/node`)
- If you don't need bot-initiated reactions, skip `selfHostingConfig` entirely
