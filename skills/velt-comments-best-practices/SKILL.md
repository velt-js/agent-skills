---
name: velt-comments-best-practices
description: Velt Comments implementation patterns for React, Next.js, and web apps. Use when adding collaborative comments, including comment modes (Freestyle, Popover, Stream, Text, Page, Inline), editor integrations (TipTap, ProseMirror, Lexical, SlateJS, Apryse), comments sidebar V1/V2, private comments and Access Context, progress rows and action chips, agent comments and suggestion accept/reject, comment REST APIs, comment events, standalone components, wireframes, primitives, or template variables.
license: MIT
metadata:
  author: velt
  version: "1.4.2"
---

# Velt Comments Best Practices

Comprehensive implementation guide for Velt's collaborative comments feature in React, Next.js, and other web applications. Contains 90 rules across 13 categories, prioritized by impact to guide automated code generation and integration patterns.

## When to Apply

Reference these guidelines when:
- Adding collaborative commenting to a React/Next.js application
- Implementing any Velt comment mode (Freestyle, Popover, Stream, Text, Page, Inline)
- Integrating comments with rich text editors (TipTap, ProseMirror, SlateJS, Lexical, Plate, Quill, CodeMirror, Ace)
- Integrating comments with the Apryse WebViewer for PDF/docx documents
- Adding comments to media players (Video, Lottie animations) or charts (Highcharts, ChartJS, Nivo)
- Building custom comment interfaces with standalone components, wireframes, or primitives
- Configuring the comments sidebar (V1 or V2), private comments, Access Context, or moderation
- Streaming agent progress into comments, adding action chips, or creating agent comments through the REST API

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Core Setup | CRITICAL | `core-` |
| 2 | REST API | HIGH | `rest-` |
| 3 | Comment Modes | HIGH | `mode-` |
| 4 | Standalone Components | MEDIUM-HIGH | `standalone-` |
| 5 | Comment Surfaces | MEDIUM-HIGH | `surface-` |
| 6 | UI Customization | MEDIUM | `ui-` |
| 7 | Data Model | MEDIUM | `data-` |
| 8 | Debugging & Testing | LOW-MEDIUM | `debug-` |
| 9 | Moderation & Permissions | LOW | `permissions-` |
| 10 | Attachments & Reactions | MEDIUM | `attach-` |
| 11 | Configuration | MEDIUM | `config-` |
| 12 | Events | MEDIUM | `events-` |
| 13 | Wireframe Variables | MEDIUM | `wireframe-variables-` |

## Quick Reference

### 1. Core Setup (CRITICAL)

- `core-provider-setup` - Initialize VeltProvider with API key
- `core-authentication` - Authenticate users with `authProvider` before using comments
- `core-document-setup` - Configure document context for comments (identical `setDocuments()` repeats are ignored)

### 2. REST API (HIGH)

- `rest-comment-annotations-api` - Annotation CRUD (add, get, update with `updatedData`, delete, count), per-annotation response map, status authorship, suggestion / visibility / progress / actions payloads
- `rest-comments-api` - Comment CRUD under `/v2/commentannotations/comments/*`, `triggerNotification`, progress and actions
- `rest-agent-comments-api` - Agent comment annotations: `agent` block on `commentData[0]`, agent GET / DELETE filters, `findingId` correlation, accept/reject events

### 3. Comment Modes (HIGH)

- `mode-freestyle` - Pin comments anywhere on page
- `mode-popover` - Google Sheets-style cell comments
- `mode-stream` - Google Docs-style sidebar stream
- `mode-text` - Text highlight comments and `restrictTextSearchToAnchor`
- `mode-page` - Page-level comments via sidebar
- `mode-inline-comments` - Traditional inline thread style
- `mode-tiptap` - TipTap editor integration (required plugin since default comments are disabled on ProseMirror-based editors)
- `mode-slatejs` - SlateJS editor integration
- `mode-lexical` - Lexical editor integration
- `mode-plate` - Plate editor integration
- `mode-quill` - Quill editor integration
- `mode-codemirror-comments` - CodeMirror editor integration
- `mode-ace` - Ace editor integration
- `mode-apryse` - Apryse WebViewer (PDF/docx) integration via `@veltdev/apryse-velt-comments`
- `mode-canvas` - Canvas/drawing comments
- `mode-lottie-player` - Lottie animation frame comments
- `mode-video-player-prebuilt` - Velt prebuilt video player
- `mode-video-player-custom` - Custom video player integration
- `mode-chart-highcharts` - Highcharts data point comments
- `mode-chart-chartjs` - ChartJS data point comments
- `mode-chart-nivo` - Nivo charts data point comments
- `mode-chart-custom` - Custom chart integration

### 4. Standalone Components (MEDIUM-HIGH)

- `standalone-comment-pin` - Manual comment pin positioning
- `standalone-comment-thread` - Render comment threads
- `standalone-comment-composer` - Add comments with a standalone composer
- `standalone-comment-text` - Wrap your own text in `VeltCommentText` to attach a known annotation

### 5. Comment Surfaces (MEDIUM-HIGH)

- `surface-sidebar` - Comments sidebar component and shared props
- `surface-sidebar-setup` - Sidebar setup and display modes (embed, floating, page, focused thread, fullscreen)
- `surface-sidebar-v2` - V2 sidebar: declarative filters, event-bus navigation (`commentClick`, `sidebarOpen`, `sidebarClose`), virtual scroll, focused-thread view
- `surface-sidebar-button` - Toggle sidebar button, badge count types, button wireframe

### 6. UI Customization (MEDIUM)

- `ui-comment-dialog` - Customize comment dialog
- `ui-comment-bubble` - Customize comment bubble
- `ui-wireframes` - Use wireframe components
- `ui-autocomplete-primitives` - Standalone autocomplete primitives for custom @mention UIs
- `ui-agent-suggestion-primitives` - Customize the suggestion card with exported `VeltCommentDialogSuggestionAction*` primitives and wireframe slots (the `VeltCommentDialogAgentSuggestion*` family is Beta, not exported yet)
- `ui-v2-primitives` - Set `defaultCondition={false}` on V2 primitive sub-components to bypass SDK show/hide logic

### 7. Data Model (MEDIUM)

- `data-annotation-crud` - Create, query, and delete threads with hooks and API methods
- `data-comment-crud` - Add, update, delete, and get comments within threads
- `data-comment-annotations` - Work with annotation objects in React
- `data-filtering-grouping` - Filter and group comments by context
- `data-context-metadata` - Add custom metadata (context) and update it with `updateContext()`
- `data-read-status` - Mark annotations as read or unread
- `data-composer-api` - Programmatic composer control (submit, clear, read state)
- `data-comment-progress` - Stream multi-step work into a comment with `Comment.progress`
- `data-comment-actions` - Custom action chips with `actions` and the `commentActionClicked` event
- `data-types-reference` - Core types: CommentAnnotation, Comment, Status, Priority, Attachment, Location, TargetElement
- `data-activity-action-types` - Use `CommentActivityActionTypes` for type-safe activity filtering
- `data-trigger-activities` - Set `triggerActivities` on REST `commentData` to create activity records
- `data-comment-annotation-data-provider` - Endpoint-based data provider config, `additionalFields`, `fieldsToRemove`
- `data-agent-fields-query` - Use `agentFields` on `CommentRequestQuery` to scope `getCommentAnnotationsCount()`

### 8. Debugging & Testing (LOW-MEDIUM)

- `debug-common-issues` - Common issues and solutions
- `debug-verification` - Verification checklist

### 9. Moderation & Permissions (LOW)

- `permissions-private-mode` - `enablePrivateMode` / `disablePrivateMode` and per-annotation `updateVisibility`
- `permissions-private-comments-access-context` - Private comments and Access Context as two independent checks
- `permissions-visibility-option-dropdown` - Composer visibility banner and `visibilityOptionClicked`
- `permissions-visibility-routing` - Treat legacy `iam.accessMode` and `visibilityConfig.type` as private together
- `permissions-comment-saved-event` - Use `commentSaved` for post-persist side effects
- `permissions-comment-save-triggered-event` - Use `commentSaveTriggered` for immediate UI feedback
- `permissions-submit-in-flight` - Guard custom-actions submits with `CommentDialogActionService.isSubmitInFlight()`
- `permissions-comment-interaction-events` - Prefer `commentToolClicked` and `sidebarButtonClicked`
- `permissions-anonymous-user-data-provider` - Resolve tagged emails to userIds with `setAnonymousUserDataProvider()`

### 10. Attachments & Reactions (MEDIUM)

- `attach-download-control` - Control attachment download behavior and intercept clicks

### 11. Configuration (MEDIUM)

- `config-mentions-contacts` - @Mentions, contact element APIs, assignment, custom autocomplete search
- `config-status-priority` - Custom status and priority levels, resolve/update workflows
- `config-reactions` - Emoji reactions: enable, custom map, add/delete/toggle
- `config-attachments` - File attachments: enable, `setAllowedFileTypes`, upload, delete
- `config-text-formatting` - Formatting toolbar and `FormatConfig`
- `config-navigation` - Navigation, deep linking, scroll-to-comment, shareable links
- `config-dom-controls` - Restrict comment placement to specific DOM elements
- `config-sidebar-management` - Programmatic sidebar data, filters, operators, and events
- `config-sidebar-access-modes` - `accessModes` filter for privacy-based sidebar filtering
- `config-ui-behavior` - UI/UX toggles, draft confirmation, lazy-loaded resolved comments
- `config-moderation` - Approve, read-only, admin-only resolve; resolve suggestions with `acceptSuggestion()` / `rejectSuggestion()`
- `config-component-props` - Typed props for VeltComments, VeltCommentDialog, VeltCommentsSidebar, VeltInlineCommentsSection

### 12. Events (MEDIUM)

- `events-comment-lifecycle` - Pin clicks, `addCommentAnnotation` + `addContext()`, `isAssigneeChanged`, sidebar events, `veltButtonClick`, suggestion accept/reject, `addCommentDraft`, `fullscreenClick`

### 13. Wireframe Variables (MEDIUM)

- `wireframe-variables-comment-bubble` - Comment Bubble and Comment Pin wireframe variables
- `wireframe-variables-comment-dialog` - Comment Dialog wireframe variables (App / Data / UI / Feature State, loop scope)
- `wireframe-variables-comment-tool` - Comment Tool wireframe variables
- `wireframe-variables-inline-comments-section` - Inline Comments Section wireframe variables
- `wireframe-variables-multithread-comments` - Multithread Comments wireframe variables
- `wireframe-variables-autocomplete` - Autocomplete @mention picker wireframe variables (no panel-level wireframe)
- `wireframe-variables-text-comment` - Text Comment toolbar wireframe variables
- `wireframe-variables-comment-sidebar-button` - Comment Sidebar Button wireframe variables
- `wireframe-variables-comment-sidebar` - Comment Sidebar wireframe variables (hybrid mapped / flat access)

## Agent Comments — Critical API Reference

When the task involves AI agents creating comments or handling agent suggestion accept/reject, use these exact patterns:

**Creating agent annotations** — `POST /v2/commentannotations/add`:
```javascript
data: {
  organizationId: "...",
  documentId: "...",
  commentAnnotations: [{
    type: "suggestion",                    // REQUIRED for Accept/Reject buttons
    commentData: [{
      commentText: "Finding text",
      from: { userId: "agent-id" },
      agent: {                             // On commentData[0], NOT annotation root
        agentSource: "external",           // "external" for non-Velt agents
        agentName: "My Agent",             // REQUIRED for external agents
        agentId: "my-agent",
        executionId: "run_123",
        reason: {                          // REQUIRED — finding details
          title: "Issue title",
          description: "Details",
          severity: "high",
        },
      },
    }],
  }],
}
```

**Reading agent annotations** — `POST /v2/commentannotations/get`:
- Use `executionId` filter for a specific run
- Use `agentSuggestions: true` for only pending (unaccepted) suggestions

**Handling accept/reject on the client** — use dedicated events, NOT `commentSaved`:
```tsx
import { useCommentEventCallback } from '@veltdev/react';
const accepted = useCommentEventCallback('suggestionAccepted');
const rejected = useCommentEventCallback('suggestionRejected');
```

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
