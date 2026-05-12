# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. Core Setup (core)

**Impact:** CRITICAL
**Description:** Essential setup required for any Velt Cursors implementation. Use `authProvider` on `VeltProvider` (never `identify()`), mount `<VeltCursor />` inside the content area you want tracked (not in a toolbar), and scope cursors per document via `setDocuments`. Get these wrong and no cursors render — or they leak across documents.

---

## 2. Data Access (data)

**Impact:** HIGH
**Description:** Patterns for reading cursor state. Includes the React hooks `useCursorUsers` and `useCursorUtils`, plus the SDK-level `getCursorElement()` Observable surface and `getOnlineUsersOnCurrentDocument()` for active-user lookup outside of React.

---

## 3. Configuration (config)

**Impact:** HIGH-MEDIUM
**Description:** Behavior toggles for the cursor pointer. Restrict cursor visibility to specific DOM elements (`allowedElementIds`), switch between the default name-label pointer and avatar mode, and tune the inactivity timeout that hides idle remote cursors.

---

## 4. Events (events)

**Impact:** MEDIUM
**Description:** Subscription patterns for cursor position and user changes. Covers `onCursorUserChange` (and its unsubscribe pair) so listener lifecycles are matched.

---

## 5. UI Wireframes (ui)

**Impact:** MEDIUM
**Description:** Structural wireframe variants for the cursor pointer — Arrow, Avatar, Default, and Huddle (audio + video) — and the `<velt-cursor-pointer-wireframe>` child tag catalog (default, default-name, default-comment, avatar, audio-huddle, audio-huddle-avatar, audio-huddle-audio, video-huddle).

---

## 6. Wireframe Variables (wireframe-variables)

**Impact:** MEDIUM
**Description:** Template variables exposed inside the Cursors and Live Selection wireframe trees and consumed via `<velt-data field="componentConfig.<path>">`, `velt-if="{componentConfig.<path>}"`, and `velt-class="'cls': {componentConfig.<path>}"`. Both features use the **flat-config** access pattern — variables are addressed via the explicit `componentConfig.<path>` form (not short names). Covers root `<velt-cursor>` state (`user`, `cursorUsers`, `currentCursorUser`, `huddleOnCursorMode`, `huddleJoined`, `huddleOnCursorModeByAttendeeId`, `attendeesByUserId`, `remoteStreamsByUserId`, `localStream`, `isFirstComponent`), per-user `<velt-cursor-pointer-wireframe>` state (`cursorUser`, `selfCursorPointer`, `showDefault`, `showAvatar`, `showAudio`, `showVideo`, `stream`, `gainVolume`, `lightenedColor`, `variant`), the three cursor helper functions (`onImageLoadError`, `getGainAnimationBorderStyle`, `getTextColor`), root props (`darkMode`, `variant`), the deeply-nested `<velt-cursor-pointer-...-wireframe>` child tag catalog, and the `<velt-selection-element-portal-wireframe>` Live Selection slot (`position`, `userIndicatorPosition`, `userIndicatorType`, `overlayPosition`, `selections`) including the `UserIndicatorPosition` / `UserIndicatorType` enums and the `CursorPosition` / `Selection` data-model types.

**Rules:**
- `wireframe-variables-cursors`
- `wireframe-variables-live-selection`

---

## 7. Debugging (debug)

**Impact:** LOW-MEDIUM
**Description:** Troubleshooting patterns for cursors that don't render, don't track the right element, or leak across documents.
