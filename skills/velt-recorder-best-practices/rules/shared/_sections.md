# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. Core Setup (core)

**Impact:** CRITICAL
**Description:** Essential setup patterns for any Velt Recorder implementation. Includes adding VeltRecorderTool, VeltRecorderControlPanel, and VeltRecorderPlayer in the correct combination, connecting recorded data via event callbacks, and requesting device permissions.

---

## 2. Recording Configuration (config)

**Impact:** HIGH
**Description:** Configuration options for recording sessions. Includes recording type selection (all, audio, video, screen), max duration limits, Picture-in-Picture mode for screen recordings, microphone control, and quality/encoding settings per browser.

---

## 3. Data Management (data)

**Impact:** HIGH
**Description:** Patterns for accessing, subscribing to, and managing recording data. Includes reactive subscriptions via React hooks, one-time fetches, Observable subscriptions, deletion by recorder ID, and video downloads.

---

## 4. Event Handling (events)

**Impact:** MEDIUM-HIGH
**Description:** Subscription patterns for recorder lifecycle events. Covers all 11 event types including recording state changes, completion events, transcription completion, and error handling via both API subscriptions and React hooks.

---

## 5. Video Editor (editor)

**Impact:** MEDIUM
**Description:** Configuration and integration of the video editor for post-recording editing. Includes enabling the editor on components, auto-open behavior, retake button, onboarding tooltip, timeline preview with frame snapshots, and the standalone VeltVideoEditor component.

---

## 6. UI/UX Configuration (ui)

**Impact:** MEDIUM
**Description:** Visual and behavioral customization of recorder components. Includes control panel display modes (floating vs thread), fullscreen playback, click-to-play behavior, countdown timer, embedded settings, and AI transcription/summary display.

---

## 7. Debugging & Testing (debug)

**Impact:** LOW-MEDIUM
**Description:** Troubleshooting patterns and verification checklists for Velt recorder integrations.
