---
name: velt-chat-sdk-adapter-best-practices
description: Velt Chat SDK Adapter best practices for building bots that read and reply in Velt comment threads. Use when building a greeting, support, or AI bot that answers @-mentions, wiring createVeltAdapter and the webhook route, choosing v1 or v2 webhooks, handling reactions, or deploying the bot. Triggers on @veltdev/chat-sdk-adapter, createVeltAdapter, onNewMention, onSubscribedMessage, onReaction, thread.post, or Velt comment webhooks, even if the user doesn't say 'chat SDK adapter'.
license: MIT
metadata:
  author: velt
  version: "1.0.1"
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

## Quick Reference

### 1. Core (CRITICAL)
- `core-setup-overview` - server-side only, lazy `getChat()` singleton, Chat SDK to Velt mapping
- `core-adapter-creation` - `createVeltAdapter` options and env-var fallbacks; optional `VELT_AUTH_TOKEN`

### 2. Webhook (CRITICAL)
- `webhook-route-setup` - Node.js runtime, `force-dynamic`, `waitUntil`; raw body for non-Fetch frameworks
- `webhook-required-events` - `comment.add`, `comment_annotation.add`, `comment.reaction_add`, `comment.reaction_delete`
- `webhook-version-config` - Advanced v2 (`whsec_...`, default) vs Basic v1 (`webhookVersion: "v1"`)

### 3. Events (HIGH)
- `events-on-new-mention` - `thread.subscribe()` then `thread.post()`, streamed AI replies
- `events-on-subscribed-message` - follow-ups filtered by `message.isMention`, thread history via `fetchMessages`
- `events-on-reaction` - read-only `onReaction` event fields

### 4. Users (HIGH)
- `users-bot-config` - stable, unique `botUserId`; `Chat.userName` matches `botUserName`
- `users-resolve-pattern` - index-aligned `resolveUsers` with `undefined` for unknown IDs

### 5. Reactions (MEDIUM)
- `reactions-read-only` - reading reactions needs only the webhook events
- `reactions-write-self-hosted` - `selfHostingConfig.reactionsService` from `@veltdev/node` `sdk.selfHosting.getReactions()`

### 6. Deployment (MEDIUM)
- `deployment-dev-tunnel` - public tunnel in development, production URL, persistent state
- `deployment-env-vars` - credentials in environment variables

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/core/core-setup-overview.md
rules/shared/webhook/webhook-route-setup.md
rules/shared/events/events-on-new-mention.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect and correct code examples
- Verification checklist
- Source pointers to official docs

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
