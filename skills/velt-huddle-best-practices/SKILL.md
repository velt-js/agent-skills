---
name: velt-huddle-best-practices
description: "Velt Huddle implementation patterns and best practices for React, Next.js, and web applications. Use when adding audio/video/screen sharing huddles, in-app voice or video calls, ephemeral chat within huddles, flock mode (follow me), cursor-mode huddle bubbles, or huddle webhook integration. Triggers on any task involving huddles, video calls, audio calls, screen sharing sessions, VeltHuddle, VeltHuddleTool, or collaborative real-time communication features — even if the user doesn't explicitly say 'huddle'."
license: MIT
metadata:
  author: velt
  version: "1.0.0"
---

# Velt Huddle Best Practices

Comprehensive implementation guide for Velt's real-time audio, video, and screen sharing huddle feature. Contains 10 rules across 5 categories covering setup, configuration, webhooks, UI customization, and debugging.

## When to Apply

Reference these guidelines when:
- Adding audio/video/screen sharing to a collaborative app
- Configuring huddle types (audio, video, screen, all)
- Enabling ephemeral chat within huddles
- Implementing flock mode (follow me) for shared navigation
- Adding huddle bubble on user cursors
- Handling huddle webhook events (created, joined)
- Customizing huddle tool button UI
- Debugging huddle connection or permission issues

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Core Setup | CRITICAL | `core-` |
| 2 | Configuration | HIGH-MEDIUM | `config-` |
| 3 | Events | MEDIUM | `events-` |
| 4 | UI Customization | MEDIUM | `ui-` |
| 5 | Debugging | LOW-MEDIUM | `debug-` |

## Quick Reference

### Core Setup (CRITICAL)
- `core-auth-provider` — Use authProvider on VeltProvider, never identify()
- `core-setup` — Add VeltHuddle at app root + VeltHuddleTool in toolbar
- `core-document-setup` — Set document context to scope huddle per document

### Configuration (HIGH-MEDIUM)
- `config-huddle-types` — Select audio/video/screen/all mode
- `config-chat` — Enable/disable ephemeral chat within huddle
- `config-flock-mode` — Follow me mode on avatar click
- `config-cursor-mode` — Huddle bubble on user cursors

### Events (MEDIUM)
- `events-webhooks` — Huddle created/joined webhook integration

### UI Customization (MEDIUM)
- `ui-customization` — Slots, CSS parts, custom button templates

### Debugging (LOW-MEDIUM)
- `debug-common-issues` — Troubleshooting huddle issues

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
