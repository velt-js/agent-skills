---
name: velt-cursors-best-practices
description: "Velt Cursors implementation patterns and best practices for React, Next.js, and web applications. Use when adding real-time cursor tracking, collaborative cursor sharing, avatar-mode cursors, cursor element whitelisting, cursor inactivity timeouts, or cursor position subscriptions. Triggers on any task involving live cursors, collaborative cursor display, VeltCursor, cursor tracking on canvas or whiteboard, or showing where other users are pointing — even if the user doesn't explicitly say 'cursors'."
license: MIT
metadata:
  author: velt
  version: "1.0.0"
---

# Velt Cursors Best Practices

Comprehensive implementation guide for Velt's real-time cursor tracking feature. Contains 11 rules across 6 categories covering setup, configuration, data access, events, UI customization, and debugging.

## When to Apply

Reference these guidelines when:
- Adding real-time cursor tracking to a canvas, whiteboard, or collaborative page
- Configuring cursor display (avatar mode, name labels)
- Restricting cursor visibility to specific page elements
- Subscribing to cursor position data or user changes
- Customizing cursor pointer appearance with wireframes
- Debugging cursors not showing or tracking incorrectly

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Core Setup | CRITICAL | `core-` |
| 2 | Data Access | HIGH | `data-` |
| 3 | Configuration | HIGH-MEDIUM | `config-` |
| 4 | Events | MEDIUM | `events-` |
| 5 | UI Customization | MEDIUM | `ui-` |
| 6 | Debugging | LOW-MEDIUM | `debug-` |

## Quick Reference

### Core Setup (CRITICAL)
- `core-auth-provider` — Use authProvider on VeltProvider, never identify()
- `core-setup` — Add VeltCursor component inside content area (not toolbar)
- `core-document-setup` — Set document context to scope cursors per document

### Data Access (HIGH)
- `data-cursor-hooks` — useCursorUsers, useCursorUtils React hooks
- `data-cursor-api` — getCursorElement, getOnlineUsersOnCurrentDocument Observable

### Configuration (HIGH-MEDIUM)
- `config-allowed-elements` — Restrict cursors to specific DOM elements
- `config-avatar-mode` — Show user avatars instead of name labels
- `config-inactivity-time` — Configure inactive timeout threshold

### Events (MEDIUM)
- `events-cursor-change` — onCursorUserChange callback for position updates

### UI Customization (MEDIUM)
- `ui-wireframes` — Cursor pointer wireframe variants (Arrow, Avatar, Default, Huddle)

### Debugging (LOW-MEDIUM)
- `debug-common-issues` — Troubleshooting cursor tracking issues

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/core/core-setup.md
rules/shared/config/config-allowed-elements.md
rules/shared/data/data-cursor-hooks.md
```

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
