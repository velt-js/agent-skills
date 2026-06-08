---
name: velt-chat-sdk-adapter-best-practices
description: Velt Chat SDK Adapter implementation patterns and best practices for building bots that integrate with Velt comment threads. Use when building a bot (greeting bot, AI bot, support bot) that responds to @-mentions in Velt comments, handling webhook events from Velt (comment.add, comment.reaction_add), configuring the Chat SDK with createVeltAdapter, setting up webhook routes in Next.js or other Node.js frameworks, handling reactions on Velt comments, resolving user identities for bot responses, or deploying a Velt-connected bot to Vercel or other platforms. Triggers on any task involving @veltdev/chat-sdk-adapter, Chat SDK adapters for Velt, Velt bot integration, Velt webhook handling for comments, onNewMention, onReaction, thread.post(), or building an automated responder for Velt comment threads — even if the user doesn't explicitly say 'chat SDK adapter'.
license: MIT
metadata:
  author: velt
  version: "1.0.0"
---

# Velt Chat SDK Adapter Best Practices

Comprehensive guide for building bots that integrate with Velt comment threads via the Chat SDK Adapter (`@veltdev/chat-sdk-adapter`). The adapter bridges the cross-platform [Chat SDK](https://chat-sdk.dev) with Velt's comment threading system, so a single bot can run on Velt, Slack, Discord, and other Chat SDK-compatible platforms.

## When to Apply

Reference these guidelines when:
- Building a bot that responds to @-mentions in Velt comment threads
- Setting up webhook routes to receive Velt comment/reaction events
- Configuring `createVeltAdapter` with proper credentials and user resolution
- Handling reactions (read on managed Velt, write requires self-hosting)
- Deploying a Velt bot to Vercel, other serverless platforms, or a Node.js server
- Building an AI agent that streams LLM replies into Velt threads

## Core Architecture

The adapter is **server-side only** — it runs in your API routes, not in the browser. There is no `VeltProvider` or `authProvider` involved (those are client-side patterns for the Velt React SDK). The adapter authenticates via `VELT_API_KEY` and auto-generates auth tokens scoped to each organization.

**The flow:**
1. User @-mentions the bot in a Velt comment thread
2. Velt sends a webhook to your API endpoint
3. The adapter verifies the signature, parses the event, and dispatches to your handler
4. Your handler calls `thread.post()` to reply (the adapter posts via Velt's REST API)

**Required packages:**
```bash
npm install @veltdev/chat-sdk-adapter chat @chat-adapter/state-memory
```

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Core | CRITICAL | `core-` |
| 2 | Webhook | CRITICAL | `webhook-` |
| 3 | Events | HIGH | `events-` |
| 4 | Users | HIGH | `users-` |
| 5 | Reactions | MEDIUM | `reactions-` |
| 6 | Deployment | MEDIUM | `deployment-` |

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
