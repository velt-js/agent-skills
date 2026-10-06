---
name: velt-huddle-best-practices
description: "Velt Huddle patterns for React, Next.js, and web apps. Use when adding in-app audio, video, or screen-sharing huddles (VeltHuddle, VeltHuddleTool), choosing the huddle type, in-call chat, flock mode on avatar click, cursor-mode huddle bubbles, serverFallback, huddle webhooks (created / joined, huddle.create / huddle.join), tool slots and CSS parts, or huddle wireframe variables. Triggers on any task involving huddles, voice or video calls, or screen sharing, even if the user doesn't say 'huddle'."
license: MIT
metadata:
  author: velt
  version: "1.1.1"
---

# Velt Huddle Best Practices

Comprehensive implementation guide for Velt's real-time audio, video, and screen sharing huddle feature. Contains 11 rules across 6 categories covering setup, configuration, webhooks, UI customization, wireframe template variables, and debugging.

## When to Apply

Reference these guidelines when:
- Adding audio/video/screen sharing to a collaborative app
- Configuring huddle types (audio, video, screen, all)
- Enabling ephemeral chat within huddles
- Implementing flock mode (follow me) for shared navigation
- Adding huddle bubble on user cursors
- Handling huddle webhook events (Basic created/joined, Advanced huddle.create/huddle.join)
- Customizing huddle tool button UI
- Debugging huddle connection or permission issues

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Core Setup | CRITICAL | `core-` |
| 2 | Configuration | HIGH-MEDIUM | `config-` |
| 3 | Events | MEDIUM | `events-` |
| 4 | UI Customization | MEDIUM | `ui-` |
| 5 | Wireframe Variables | MEDIUM | `wireframe-variables-` |
| 6 | Debugging | LOW-MEDIUM | `debug-` |

## Quick Reference

### Core Setup (CRITICAL)
- `core-auth-provider` — Use authProvider on VeltProvider, never identify()
- `core-setup` — Add VeltHuddle at app root + VeltHuddleTool in toolbar; include 'huddle' in featureAllowList
- `core-document-setup` — Set document context to scope huddle per document

### Configuration (HIGH-MEDIUM)
- `config-huddle-types` — Set type explicitly (audio/video/all; screen vs presentation naming)
- `config-chat` — Enable/disable ephemeral chat within huddle
- `config-flock-mode` — Follow me mode on avatar click
- `config-cursor-mode` — Huddle bubble on user cursors

### Events (MEDIUM)
- `events-webhooks` — Basic (created/joined) and Advanced (huddle.create/huddle.join) webhook handlers

### UI Customization (MEDIUM)
- `ui-customization` — `button` slot and CSS parts on VeltHuddleTool

### Wireframe Variables (MEDIUM)
- `wireframe-variables-huddle` — `componentConfig.*` flat-config variables on the huddle root, the huddle tool, and per-attendee tiles

### Debugging (LOW-MEDIUM)
- `debug-common-issues` — Troubleshooting huddle issues

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/core/core-setup.md
rules/shared/config/config-huddle-types.md
rules/shared/events/events-webhooks.md
```

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
