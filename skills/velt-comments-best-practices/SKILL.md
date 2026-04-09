---
name: velt-comments-best-practices
description: Velt Comments implementation patterns and best practices for React, Next.js, and web applications. Use when adding collaborative commenting features, comment modes (Freestyle, Popover, Stream, Text, Page), rich text editor comments (TipTap, SlateJS, Lexical), media player comments, or chart comments.
license: MIT
metadata:
  author: velt
  version: "1.0.0"
---

# Velt Comments Best Practices

Comprehensive implementation guide for Velt's collaborative comments feature in React and Next.js applications. Contains 71 rules across 12 categories, prioritized by impact to guide automated code generation and integration patterns.

## When to Apply

Reference these guidelines when:
- Adding collaborative commenting to a React/Next.js application
- Implementing any Velt comment mode (Freestyle, Popover, Stream, Text, Page, Inline)
- Integrating comments with rich text editors (TipTap, SlateJS, Lexical)
- Adding comments to media players (Video, Lottie animations)
- Adding comments to charts (Highcharts, ChartJS, Nivo)
- Building custom comment interfaces with standalone components

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Core Setup | CRITICAL | `core-` |
| 2 | Comment Modes | HIGH | `mode-` |
| 3 | Standalone Components | MEDIUM-HIGH | `standalone-` |
| 4 | Comment Surfaces | MEDIUM-HIGH | `surface-` |
| 5 | UI Customization | MEDIUM | `ui-` |
| 6 | Data Model | MEDIUM | `data-` |
| 7 | Debugging & Testing | LOW-MEDIUM | `debug-` |
| 8 | Moderation & Permissions | LOW | `permissions-` |
| 9 | Attachments & Reactions | MEDIUM | `attach-` |

## Quick Reference

### 1. Core Setup (CRITICAL)

- `core-provider-setup` - Initialize VeltProvider with API key
- `core-authentication` - Authenticate users before using comments
- `core-document-setup` - Configure document context for comments

### 2. Comment Modes (HIGH)

- `mode-freestyle` - Pin comments anywhere on page
- `mode-popover` - Google Sheets-style cell comments
- `mode-stream` - Google Docs-style sidebar stream
- `mode-text` - Text highlight comments
- `mode-page` - Page-level comments via sidebar
- `mode-inline-comments` - Traditional inline thread style
- `mode-tiptap` - TipTap editor integration
- `mode-slatejs` - SlateJS editor integration
- `mode-lexical` - Lexical editor integration
- `mode-canvas` - Canvas/drawing comments
- `mode-lottie-player` - Lottie animation frame comments
- `mode-video-player-prebuilt` - Velt prebuilt video player
- `mode-video-player-custom` - Custom video player integration
- `mode-chart-highcharts` - Highcharts data point comments
- `mode-chart-chartjs` - ChartJS data point comments
- `mode-chart-nivo` - Nivo charts data point comments
- `mode-chart-custom` - Custom chart integration

### 3. Standalone Components (MEDIUM-HIGH)

- `standalone-comment-pin` - Manual comment pin positioning
- `standalone-comment-thread` - Render comment threads
- `standalone-comment-composer` - Add comments programmatically

### 4. Comment Surfaces (MEDIUM-HIGH)

- `surface-sidebar` - Comments sidebar component
- `surface-sidebar-v2` - Primitive-architecture V2 sidebar with 27+ composable primitives, unified filter model, and focused-thread view
- `surface-sidebar-button` - Toggle sidebar button

### 5. UI Customization (MEDIUM)

- `ui-comment-dialog` - Customize comment dialog
- `ui-comment-bubble` - Customize comment bubble
- `ui-wireframes` - Use wireframe components
- `ui-autocomplete-primitives` - Use standalone autocomplete primitive components to build custom autocomplete UIs without requiring the full VeltAutocomplete panel
- `ui-v2-primitives` - Set defaultCondition={false} on V2 primitive sub-components to bypass SDK default show/hide logic when overriding sections in wireframe compositions

### 6. Data Model (MEDIUM)

- `data-context-metadata` - Add custom metadata
- `data-comment-annotations` - Work with annotations
- `data-filtering-grouping` - Filter and group comments
- `data-activity-action-types` - Use CommentActivityActionTypes constant for type-safe comment activity filtering instead of raw strings
- `data-trigger-activities` - Set triggerActivities on CommentData to auto-create activity records via POST /v2/commentannotations/add
- `data-comment-annotation-data-provider` - Use config-based URL endpoints on CommentAnnotationDataProvider without placeholder callbacks; additionalFields replicates fields to resolver while retaining in Velt storage; fieldsToRemove strips fields from Velt's DB for PII removal
- `data-agent-fields-query` - Use agentFields on CommentRequestQuery to filter getCommentAnnotationCount() to agent-tagged annotations; unread count equals total count when agentFields is set

### 7. Debugging & Testing (LOW-MEDIUM)

- `debug-common-issues` - Common issues and solutions
- `debug-verification` - Verification checklist

### 8. Moderation & Permissions (LOW)

- `permissions-private-mode` - Control global comment visibility with enablePrivateMode/disablePrivateMode and update per-annotation visibility with updateVisibility
- `permissions-comment-saved-event` - Subscribe to the commentSaved event for reliable post-persist side-effects (webhooks, analytics, external sync)
- `permissions-visibility-option-dropdown` - Enable the visibility dropdown in the comment composer to let users select public or private before submitting, and subscribe to visibilityOptionClicked events
- `permissions-comment-save-triggered-event` - Use commentSaveTriggered for immediate UI feedback (spinners, disabled states) on save button click — before the async database write completes
- `permissions-comment-interaction-events` - Prefer past-tense event aliases commentToolClicked and sidebarButtonClicked over the present-tense originals in new code
- `permissions-anonymous-user-data-provider` - Register setAnonymousUserDataProvider() to resolve tagged contact emails to userIds at comment save time

### 9. Attachments & Reactions (MEDIUM)

- `attach-download-control` - Control attachment download behavior and intercept clicks

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/core/core-provider-setup.md
rules/shared/mode/mode-popover.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Source pointers to official documentation

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
