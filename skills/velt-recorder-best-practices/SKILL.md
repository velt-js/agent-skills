---
name: velt-recorder-best-practices
description: Velt Recorder implementation patterns and best practices for React, Next.js, and web applications. Use when adding audio, video, or screen recording features, recording playback, video editing, recording transcription, or managing recording lifecycle events.
license: MIT
metadata:
  author: velt
  version: "1.0.0"
---

# Velt Recorder Best Practices

Comprehensive implementation guide for Velt's Recorder system in React and Next.js applications. Contains 22 rules across 7 categories, prioritized by impact to guide automated code generation and integration patterns.

## When to Apply

Reference these guidelines when:
- Adding audio, video, or screen recording to a React/Next.js application
- Setting up VeltRecorderTool, VeltRecorderControlPanel, and VeltRecorderPlayer
- Configuring VeltRecorderNotes for pinned recordings
- Integrating the VeltVideoEditor for post-recording editing
- Configuring recording quality constraints and encoding options
- Requesting device permissions (camera, microphone, screen)
- Subscribing to recording lifecycle events
- Managing recording data (fetch, subscribe, delete, download)
- Enabling AI transcription and summary display
- Configuring Picture-in-Picture mode for screen recordings
- Setting max recording duration limits
- Choosing between floating and thread control panel modes

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Core Setup | CRITICAL | `core-` |
| 2 | Recording Configuration | HIGH | `config-` |
| 3 | Data Management | HIGH | `data-` |
| 4 | Event Handling | MEDIUM-HIGH | `events-` |
| 5 | Video Editor | MEDIUM | `editor-` |
| 6 | UI/UX Configuration | MEDIUM | `ui-` |
| 7 | Debugging & Testing | LOW-MEDIUM | `debug-` |

## Quick Reference

### 1. Core Setup (CRITICAL)

- `core-setup` — Add VeltRecorderTool, VeltRecorderControlPanel, and VeltRecorderPlayer
- `core-permissions` — Request device permissions for camera, microphone, and screen capture
- `core-webhooks` — Handle the recorder.done server-side webhook event (RecorderPayload, RecorderTrigger)

### 2. Recording Configuration (HIGH)

- `config-type-and-mode` — Select recording type (all, audio, video, screen) and customize tool button
- `config-max-length` — Set maximum recording duration
- `config-picture-in-picture` — Enable PiP for screen recordings (Chrome only)
- `config-quality-encoding` — Configure recording quality constraints and encoding options

### 3. Data Management (HIGH)

- `data-hooks` — Use React hooks (useRecordings, useRecorderAddHandler) for reactive data
- `data-fetch-subscribe` — Fetch or subscribe to recording data via API
- `data-delete-download` — Delete recordings and download latest video version
- `data-rest-api` — Retrieve recordings via REST API (server-side, with pagination)

### 4. Event Handling (MEDIUM-HIGH)

- `events-lifecycle` — Subscribe to all 11 recorder events via API
- `events-hooks` — Use useRecorderEventCallback hook for React event subscriptions

### 5. Video Editor (MEDIUM)

- `editor-enable-configure` — Enable video editor with auto-open, retake, timeline preview
- `editor-standalone` — Embed standalone VeltVideoEditor component

### 6. UI/UX Configuration (MEDIUM)

- `ui-control-panel-mode` — Choose floating vs thread mode for VeltRecorderControlPanel
- `ui-playback-options` — Configure fullscreen playback and click-to-play behavior
- `ui-countdown-settings` — Control countdown timer and embedded settings
- `ui-ai-transcription` — Configure AI transcription and summary display

### 7. Debugging & Testing (LOW-MEDIUM)

- `debug-common-issues` — Common recorder issues and solutions

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/core/core-setup.md
rules/shared/config/config-type-and-mode.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Source pointers to official documentation

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
