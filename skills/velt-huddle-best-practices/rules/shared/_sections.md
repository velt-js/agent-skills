# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. Core Setup (core)

**Impact:** CRITICAL
**Description:** Essential setup required for any Velt huddle implementation. Use `authProvider` on `VeltProvider` (never call `identify()` directly), mount `VeltHuddle` at the app root, place `VeltHuddleTool` in the toolbar, and scope huddles per document via `setDocuments` / `VeltDocumentProvider`.

---

## 2. Configuration (config)

**Impact:** HIGH-MEDIUM
**Description:** Configuration options for huddle behavior. Select huddle type (`audio` / `video` / `screen` / `all`), enable or disable ephemeral in-call chat, opt in to flock mode (follow-me) on avatar click, and turn on cursor-mode huddle bubbles for cursor-anchored calls.

---

## 3. Events (events)

**Impact:** MEDIUM
**Description:** Server-driven huddle webhook events. Covers `huddle.created` and `huddle.joined` payloads and the verification / handler pattern for routing them through your backend.

---

## 4. UI Customization (ui)

**Impact:** MEDIUM
**Description:** Customizing the huddle UI through slots, CSS `::part(...)` hooks, and custom button templates on `VeltHuddleTool`.

---

## 5. Wireframe Variables (wireframe-variables)

**Impact:** MEDIUM
**Description:** Template variables exposed inside `<velt-huddle-...-wireframe>` tags and consumed via `<velt-data field="...">`, `velt-if="{var}"`, and `velt-class="'cls': {var}"`. Huddle uses the **flat-config** access pattern — variables are addressed by their explicit `componentConfig.<path>` form. Covers the root `<velt-huddle>` config (`meetingJoined`, `huddleAttendees`, `localStream`, `localStreamState.audio/video/screenSharingState`, `screenSharing`, `remoteStreamsByUserId`, `peerConnectionStateMapByUserId`, …), the `<velt-huddle-tool>` config (`type`, `screenSharingSupported`, `disabled`, `joinedHuddleToolComponentId`, `bannerRemoved`, …), and the per-attendee tile context exposed by `<velt-audio-huddle-user-wireframe>` and `<velt-video-huddle-user-wireframe>` (`attendee`, `stream`, `isLocal`, `color`, `gainVolume`).

---

## 6. Debugging (debug)

**Impact:** LOW-MEDIUM
**Description:** Troubleshooting patterns for common huddle issues — connection failures, missing media permissions, attendee state desyncs, and webhook delivery problems.
