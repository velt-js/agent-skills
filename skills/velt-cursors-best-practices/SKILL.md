---
name: velt-cursors-best-practices
description: "Velt Cursors patterns for React, Next.js, and web apps. Use when adding live cursors (VeltCursor), confining cursors with allowedElementIds, avatar mode, cursor inactivity timeouts, useCursorUsers / getOnlineUsersOnCurrentDocument data, onCursorUserChange events, cursor pointer wireframes and componentConfig variables, or Live Selection indicator styling. Triggers on any task showing where other users point or select on a canvas or page, even if the user doesn't say 'cursors'."
license: MIT
metadata:
  author: velt
  version: "1.1.2"
---

# Velt Cursors Best Practices

Comprehensive implementation guide for Velt's real-time cursor tracking feature (and the sibling Live Selection indicator). Contains 13 rules across 7 categories covering setup, configuration, data access, events, UI customization, wireframe template variables, and debugging.

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
| 5 | UI Wireframes | MEDIUM | `ui-` |
| 6 | Wireframe Variables | MEDIUM | `wireframe-variables-` |
| 7 | Debugging | LOW-MEDIUM | `debug-` |

## Quick Reference

### Core Setup (CRITICAL)
- `core-auth-provider` — Use authProvider on VeltProvider, never identify()
- `core-setup` — Mount one VeltCursor near the app root; confine with allowedElementIds; include 'cursor' in featureAllowList
- `core-document-setup` — Set document context to scope cursors per document

### Data Access (HIGH)
- `data-cursor-hooks` — useCursorUsers, useCursorUtils React hooks (positions in `position.top/left`)
- `data-cursor-api` — getCursorElement, getOnlineUsersOnCurrentDocument Observable, documented methods only

### Configuration (HIGH-MEDIUM)
- `config-allowed-elements` — Restrict cursors to specific DOM elements
- `config-avatar-mode` — Show user avatars instead of name labels (`avatarMode` prop)
- `config-inactivity-time` — Set the inactivity timeout explicitly (docs list 5 min and 2 min defaults)

### Events (MEDIUM)
- `events-cursor-change` — onCursorUserChange callback for position updates

### UI Wireframes (MEDIUM)
- `ui-wireframes` — Cursor pointer wireframe variants (Arrow, Avatar, Default, AudioHuddle, VideoHuddle) inside VeltWireframe

### Wireframe Variables (MEDIUM)
- `wireframe-variables-cursors` — Flat-config `componentConfig.<path>` variables for `<velt-cursor>` and `<velt-cursor-pointer-wireframe>` (cursorUser, showAvatar / showAudio / showVideo, huddle flags, helper functions)
- `wireframe-variables-live-selection` — Live Selection has no wireframe tag yet: style it with CSS classes; runtime model (selections, userIndicatorPosition, userIndicatorType) for reference

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
