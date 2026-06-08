---
name: velt-presence-best-practices
description: "Velt Presence implementation patterns and best practices for React, Next.js, and web applications. Use when adding user presence avatars, online/away/offline status indicators, real-time cursor tracking, inactivity timeout configuration, location-based presence filtering, presence data subscriptions, or flock mode (follow me) shared navigation sessions with enableFlockMode, startFollowingUser, stopFollowingUser, onNavigate callback, and defaultFlockNavigation. Triggers on any task involving user presence, active user avatars, who's online indicators, cursor sharing, VeltPresence, VeltCursor, follow-along features, or collaborative awareness features — even if the user doesn't explicitly say 'presence'."
license: MIT
metadata:
  author: velt
  version: "1.2.0"
---

# Velt Presence Best Practices

Comprehensive implementation guide for Velt's real-time user presence and cursor tracking features. Contains 15 rules across 8 categories covering setup, configuration, data access, cursor sharing, events, UI customization, wireframe template variables, and debugging.

## When to Apply

Reference these guidelines when:
- Adding user presence avatars to show who's online
- Configuring inactivity timeouts (away/offline states)
- Implementing real-time cursor tracking on canvas or page
- Subscribing to presence data or user state changes
- Filtering presence by location or document
- Customizing presence avatar UI with wireframes
- Implementing flock mode (follow me) for shared navigation sessions
- Debugging presence not showing or users appearing offline

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Core Setup | CRITICAL | `core-` |
| 2 | Data Access | HIGH | `data-` |
| 3 | Configuration | HIGH-MEDIUM | `config-` |
| 4 | Cursor | HIGH | `cursor-` |
| 5 | Events | MEDIUM | `events-` |
| 6 | UI Customization | MEDIUM | `ui-` |
| 7 | Wireframe Variables | MEDIUM | `wireframe-variables-` |
| 8 | Debugging | LOW-MEDIUM | `debug-` |

## Quick Reference

### Core Setup (CRITICAL)
- `core-auth-provider` — Use authProvider on VeltProvider, never identify()
- `core-setup` — Add VeltPresence component for avatar display
- `core-document-setup` — Set document context for presence scoping

### Data Access (HIGH)
- `data-presence-hooks` — usePresenceData, usePresenceEventCallback hooks
- `data-presence-api` — Vanilla JS getPresenceElement, getData, on

### Configuration (HIGH-MEDIUM)
- `config-inactivity-time` — Away/offline timeout configuration
- `config-max-users` — Avatar overflow control
- `config-self-visibility` — Include/exclude current user
- `config-location-presence` — Location-based presence filtering
- `config-flock-mode` — Flock mode (follow me) setup, enableFlockMode, startFollowingUser/stopFollowingUser, onNavigate callback for SPA routing, defaultFlockNavigation

### Cursor (HIGH)
- `cursor-setup` — VeltCursor for real-time cursor tracking on canvas

### Events (MEDIUM)
- `events-state-change` — Subscribe to user online/away/offline transitions

### UI Customization (MEDIUM)
- `ui-wireframes` — VeltPresenceWireframe customization

### Wireframe Variables (MEDIUM)
- `wireframe-variables-presence` — Bind Presence wireframe slots via `componentConfig.<path>` template variables (`velt-data` / `velt-if` / `velt-class`)

### Debugging (LOW-MEDIUM)
- `debug-common-issues` — Troubleshooting presence issues

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/core/core-setup.md
rules/shared/config/config-inactivity-time.md
rules/shared/data/data-presence-hooks.md
```

Each rule file contains:
- Brief explanation of why it matters
- Correct code example with explanation
- Verification checklist
- Source pointers to official docs

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
