# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. Core Setup (core)

**Impact:** CRITICAL
**Description:** Essential setup patterns for any Velt Presence implementation. Covers authProvider on VeltProvider (never identify()), adding the VeltPresence component, and establishing document context for presence scoping.

**Rules:**
- `core-auth-provider` - Use authProvider on VeltProvider, never identify()
- `core-setup` - Add VeltPresence component for avatar display
- `core-document-setup` - Set document context for presence scoping

---

## 2. Data Access (data)

**Impact:** HIGH
**Description:** Patterns for reading presence state. Covers React hooks (`usePresenceData`, `usePresenceEventCallback`) and the vanilla-JS API surface (`getPresenceElement`, `getData`, `on`).

**Rules:**
- `data-presence-hooks` - React hooks for reactive presence data
- `data-presence-api` - Vanilla JS getPresenceElement, getData, on

---

## 3. Configuration (config)

**Impact:** HIGH-MEDIUM
**Description:** Behavior knobs for the Presence component. Covers away/offline inactivity timeouts, avatar overflow (`maxUsers`), self-visibility (include/exclude current user), and location-based filtering.

**Rules:**
- `config-inactivity-time` - Away/offline timeout configuration
- `config-max-users` - Avatar overflow control
- `config-self-visibility` - Include/exclude current user
- `config-location-presence` - Location-based presence filtering

---

## 4. Cursor (cursor)

**Impact:** HIGH
**Description:** Real-time cursor tracking on canvas, page, or whitelisted elements via the VeltCursor component.

**Rules:**
- `cursor-setup` - VeltCursor for real-time cursor tracking on canvas

---

## 5. Events (events)

**Impact:** MEDIUM
**Description:** Subscription patterns for presence lifecycle events — covers user online/away/offline state-change subscriptions, including paired setup and teardown.

**Rules:**
- `events-state-change` - Subscribe to user online/away/offline transitions

---

## 6. UI Customization (ui)

**Impact:** MEDIUM-LOW
**Description:** Visual customization of the Presence avatar list, tooltip, and overflow badge via VeltPresenceWireframe.

**Rules:**
- `ui-wireframes` - VeltPresenceWireframe customization

---

## 7. Wireframe Variables (wireframe-variables)

**Impact:** MEDIUM
**Description:** Template-variable binding inside `<velt-presence-...-wireframe>` tags. Documents the flat-config `componentConfig.<path>` access pattern and per-tooltip iteration context (`user`, `isActive`, `lastActiveAt`) used by `velt-data` / `velt-if` / `velt-class` directives.

**Rules:**
- `wireframe-variables-presence` - Bind Presence wireframe slots using template variables

---

## 8. Debugging (debug)

**Impact:** LOW-MEDIUM
**Description:** Troubleshooting patterns for presence-not-showing, stale-state, and identity-mismatch issues.

**Rules:**
- `debug-common-issues` - Troubleshooting presence issues
