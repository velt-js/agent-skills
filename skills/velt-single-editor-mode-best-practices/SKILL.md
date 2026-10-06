---
name: velt-single-editor-mode-best-practices
description: Velt Single Editor Mode patterns for React, Next.js, and web apps. Use when implementing exclusive editing (one editor, read-only viewers), enableSingleEditorMode, setUserAsEditor error codes, useUserEditorState / useEditor, editor access requests and handoff, timeout-based transfer, singleEditorModeContainerIds, data-velt-sync-access and auto-sync attributes, single-tab editing, heartbeat, SEM events, or customizing the VeltSingleEditorModePanel wireframe.
license: MIT
metadata:
  author: velt
  version: "1.1.0"
---

# Velt Single Editor Mode Best Practices

Comprehensive implementation guide for Velt's Single Editor Mode in React and Next.js applications. Contains 15 rules across 8 categories, prioritized by impact to guide automated code generation and integration patterns.

## When to Apply

Reference these guidelines when:
- Enabling Single Editor Mode to restrict editing to one user at a time
- Setting up VeltSingleEditorModePanel and default UI
- Calling setUserAsEditor() and handling error codes
- Subscribing to editor state via useUserEditorState or isUserEditor()
- Building custom access request UX (editor accept/reject, viewer request/cancel)
- Scoping Single Editor Mode to specific containers with singleEditorModeContainerIds()
- Controlling elements with data-velt-sync-access attributes
- Enabling auto-sync for text elements (input, textarea, contenteditable)
- Configuring editor access timeout and auto-transfer behavior
- Subscribing to SEM events (accessRequested, editorAssigned, etc.)
- Handling multi-tab editing scenarios with singleTabEditor and editCurrentTab()
- Configuring heartbeat and presence detection for editor tracking
- Customizing the default Single Editor Mode panel with wireframes

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Core Setup | CRITICAL | `core-` |
| 2 | Editor State Management | CRITICAL | `state-` |
| 3 | Access Request Flow | HIGH | `access-` |
| 4 | Element Control | HIGH | `elements-` |
| 5 | Timeout Configuration | MEDIUM | `timeout-` |
| 6 | Event Handling | MEDIUM | `events-` |
| 7 | Debugging & Testing | LOW-MEDIUM | `debug-` |
| 8 | UI Customization | MEDIUM | `ui-` |

## Quick Reference

### 1. Core Setup (CRITICAL)

- `core-setup` — Enable Single Editor Mode after useVeltInitState(), with config, default UI, and panel component

### 2. Editor State Management (CRITICAL)

- `state-hooks` — Use useUserEditorState and useEditor hooks for React editor state
- `state-set-user-editor` — Call setUserAsEditor() with error handling for all 3 error codes
- `state-editor-api` — Subscribe to isUserEditor() and getEditor() Observables

### 3. Access Request Flow (HIGH)

- `access-hooks` — Use useEditorAccessRequestHandler hook for React access flow
- `access-editor-side` — Handle incoming requests with accept/reject via API
- `access-viewer-side` — Request and cancel editor access as viewer

### 4. Element Control (HIGH)

- `elements-container-scope` — Scope SEM to specific containers and enable auto-sync
- `elements-sync-attributes` — Apply data-velt-sync-access attributes to native HTML elements only

### 5. Timeout Configuration (MEDIUM)

- `timeout-hooks` — Use useEditorAccessTimer for React countdown UI
- `timeout-config` — Configure timeout duration and auto-transfer behavior

### 6. Event Handling (MEDIUM)

- `events-hooks` — Use useLiveStateSyncEventCallback for React event subscriptions
- `events-subscribe` — Subscribe to all 7 SEM event types via API

### 7. Debugging & Testing (LOW-MEDIUM)

- `debug-common-issues` — Common issues, heartbeat config, featureAllowList, and testing checklist

### 8. UI Customization (MEDIUM)

- `ui-panel-wireframe` — Customize VeltSingleEditorModePanel with VeltSingleEditorModePanelWireframe, shadowDom, darkMode, variant

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/core/core-setup.md
rules/shared/state/state-set-user-editor.md
rules/react/access/access-hooks.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Source pointers to official documentation

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
