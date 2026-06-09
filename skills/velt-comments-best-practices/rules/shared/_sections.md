# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. Core Setup (core)

**Impact:** CRITICAL
**Description:** Essential setup patterns required for any Velt comments implementation. Includes provider initialization, document configuration, and user authentication.

---

## 2. Comment Modes (mode)

**Impact:** HIGH
**Description:** Different comment presentation and interaction modes for various use cases. Includes Freestyle, Popover, Stream, Text, Page, Inline, rich text editor integrations (TipTap, SlateJS, Lexical, Plate, Quill, CodeMirror, Ace), media player comments, and chart comments.

---

## 3. Standalone Components (standalone)

**Impact:** MEDIUM-HIGH
**Description:** Individual comment components for building custom implementations. Includes Comment Pin, Comment Thread, and Comment Composer for DIY comment interfaces.

---

## 4. Comment Surfaces (surface)

**Impact:** MEDIUM-HIGH
**Description:** Navigation and display surfaces for comments. Includes the Comments Sidebar, the V2 primitive-architecture sidebar, and related toggle components.

**Rules:**
- `surface-sidebar` - Comments sidebar component (VeltCommentsSidebar)
- `surface-sidebar-v2` - Primitive-architecture V2 sidebar (VeltCommentsSidebarV2) with 27+ composable primitives, unified filter model, CDK virtual scroll, and focused-thread view
- `surface-sidebar-button` - Toggle sidebar button

---

## 5. UI Customization (ui)

**Impact:** MEDIUM
**Description:** Visual customization patterns for comment components. Includes dialog customization, bubble styling, wireframe component usage, and standalone autocomplete primitives.

**Rules:**
- `ui-comment-dialog` - Customize comment dialog appearance
- `ui-comment-bubble` - Customize comment bubble appearance
- `ui-wireframes` - Use wireframe components for custom UI
- `ui-autocomplete-primitives` - Use standalone autocomplete primitive components to build custom autocomplete UIs without requiring the full VeltAutocomplete panel
- `ui-v2-primitives` - Set defaultCondition on V2 primitive sub-components (Comment Pin, Comment Bubble, Text Comment, Inline Comments Section, Multi-Thread Comment Dialog, Sidebar Button) to bypass SDK default show/hide logic in wireframe compositions

---

## 6. Data Model (data)

**Impact:** MEDIUM
**Description:** Patterns for working with comment data structures. Includes CRUD operations, metadata, annotations, composer control, read status, and data type reference.

**Rules:**
- `data-context-metadata` - Add custom metadata to comments with context
- `data-activity-action-types` - Type-safe comment activity filtering with CommentActivityActionTypes
- `data-trigger-activities` - Set triggerActivities on CommentData to create activity records via POST /v2/commentannotations/add (v5.0.2-beta.7)
- `data-comment-annotation-data-provider` - get/save/delete callbacks on CommentAnnotationDataProvider are now optional when using config-based URL endpoints; ResolverConfig.additionalFields replicates fields to resolver while retaining in Velt storage; ResolverConfig.fieldsToRemove strips fields from Velt's DB (PII removal)
- `data-agent-fields-query` - Use agentFields on CommentRequestQuery to filter getCommentAnnotationCount()
- `data-annotation-crud` - Programmatic annotation CRUD — create, query, delete threads with hooks and API methods
- `data-comment-crud` - Individual comment CRUD — add, update, delete, get comments within threads
- `data-read-status` - Mark comments as read/unread
- `data-composer-api` - Programmatic composer control — submit, clear, read state
- `data-types-reference` - Core data type reference — CommentAnnotation, Comment, Status, Priority, Attachment, Location, TargetElement

---

## 7. Debugging & Testing (debug)

**Impact:** LOW-MEDIUM
**Description:** Troubleshooting patterns and verification checklists for Velt integrations.

---

## 8. Moderation & Permissions (permissions)

**Impact:** LOW
**Description:** Access control and moderation features for comments. Includes comment visibility control (private mode), per-annotation visibility updates, and post-persist event handling.

**Rules:**
- `permissions-private-mode` - Control global comment visibility with enablePrivateMode/disablePrivateMode and update per-annotation visibility with updateVisibility
- `permissions-comment-saved-event` - Subscribe to the commentSaved event for reliable post-persist side-effects (webhooks, analytics, external sync)
- `permissions-visibility-option-dropdown` - Enable the visibility dropdown in the comment composer to let users select public or private before submitting, and subscribe to visibilityOptionClicked events
- `permissions-comment-save-triggered-event` - Use commentSaveTriggered for immediate UI feedback (spinners, disabled states) on save button click — before the async database write completes
- `permissions-comment-interaction-events` - Prefer past-tense event aliases commentToolClicked and sidebarButtonClicked over the present-tense originals in new code
- `permissions-anonymous-user-data-provider` - Register setAnonymousUserDataProvider() to resolve tagged contact emails to userIds at comment save time

---

## 9. Attachments & Reactions (attach)

**Impact:** MEDIUM
**Description:** File attachment control and emoji reaction features. Includes attachment download behavior, click interception events, and CSS state classes for attachment loading and edit-mode states.

---

## 10. Configuration (config)

**Impact:** MEDIUM
**Description:** Advanced configuration methods for comment features — mentions/contacts, status/priority, reactions, attachments, text formatting, navigation/deep linking, DOM controls, sidebar management, UI behavior toggles, and moderation.

**Rules:**
- `config-mentions-contacts` - @Mentions, contacts, user assignment, autocomplete
- `config-status-priority` - Custom status and priority levels, resolve/update workflows
- `config-reactions` - Emoji reactions — enable, customize, add/delete/toggle
- `config-attachments` - File attachments — enable, upload, delete, allowed types
- `config-text-formatting` - Rich text formatting options in composer
- `config-navigation` - Navigation, deep linking, scroll-to-comment, shareable links
- `config-dom-controls` - Restrict comment placement to specific DOM elements
- `config-sidebar-management` - Programmatic sidebar data, filtering, and configuration
- `config-ui-behavior` - UI/UX toggle methods — display, interaction, behavior (20+ methods)
- `config-moderation` - Moderation workflows — approve, accept, reject, read-only
- `config-component-props` - Typed props interfaces for VeltComments, VeltCommentDialog, VeltCommentsSidebar, and VeltInlineCommentsSection — placeholder overrides (including edit-mode variants), assignToType, focus behavior

---

## 11. Events (events)

**Impact:** MEDIUM
**Description:** Comment lifecycle event subscriptions for custom workflows.

**Rules:**
- `events-comment-lifecycle` - Pin clicks, add events with addContext, custom button clicks, autocomplete search
- `events-agent-suggestion-lifecycle` - Subscribe to `suggestionAccepted` / `suggestionRejected` on the comment element to handle reviewer accept/reject of agent findings (with optional `rejectReason`)

---

## 12. REST API (rest)

**Impact:** HIGH
**Description:** Server-side comment management via REST API.

**Rules:**
- `rest-comment-annotations-api` - Annotation CRUD (add, get, update, delete, count)
- `rest-comments-api` - Individual comment CRUD within annotations (add, get, update, delete)

---

## 13. Wireframe Variables (wireframe-variables)

**Impact:** MEDIUM
**Description:** Template-variable binding patterns for the Comment Bubble, Comment Dialog, Comment Tool, Text Comment, Inline Comments Section, Multithread Comments, Comment Sidebar, and Comment Sidebar Button wireframes. Documents the `velt-data` / `velt-if` / `velt-class` directive system layered on top of the structural wireframe catalog in `ui/ui-wireframes.md` — variable namespaces (App / Data / UI / Feature State), loop-scope iteration variables, `defaultCondition` overrides, Angular signal inputs, and common `shouldShow` gates.

**Rules:**
- `wireframe-variables-comment-bubble` - Bind Comment Bubble and Comment Pin wireframe slots via `{annotation.*}`, `{selectedAnnotationsMap[...]}`, and `globalConfigSignal.featureState.*`
- `wireframe-variables-comment-dialog` - Bind the ~110-slot Comment Dialog wireframe family — App / Data / UI / Feature State namespaces, loop-scope (`comment`, `commentIndex`), root-level placeholder / unread-map paths, v1 backward-compat aliases
- `wireframe-variables-comment-tool` - Bind the Comment Tool wireframe via the flat-config `{addCommentMode}` / `{commentToolEnabled}` aliases (and the canonical `globalConfig.featureState.*` / `componentConfig.*` paths)
- `wireframe-variables-inline-comments-section` - Bind the Inline Comments Section wireframe — `{annotations}` / `{skeletonLoading}` / `{filterState.*}` / `{sortState.*}`, per-row loop-scope (`filter`, `sortOption`, `isActive`, `isAscending`), `featureState.*` conflict-paths, and nested Comment Dialog primitives in the list / composer
- `wireframe-variables-multithread-comments` - Bind the Multithread Comments wireframe — `{nonDraftCommentsCount}`, `{minimalFilter}`, empty-state + reset-filter gates, minimal filter/sort + bulk-actions dropdowns (`isSelected` loop-scope), `data.user` / `uiState.shadowDom` conflict-paths
- `wireframe-variables-autocomplete` - Bind the Autocomplete @-mention picker wireframes — flat-config `componentConfig.<path>` access for panel state (`flattenedItems`, `customGroupsEnabled`, `newUserContactError`), loop-scope `option` / `chip` iteration variables, option / group-option / chip / empty-state subcomponents, and chip tooltip descendants
- `wireframe-variables-text-comment` - Bind the Text Comment toolbar wireframes — `{selectedWordsCount}` / `{selectedCharactersCount}` / `{position.*}`, capability flags (`isUserAllowed`, `enableTextComments`, `rewriterEnabled`), and the five explicit-path conflict names (`data.user`, `uiState.disabled`, `uiState.left`, `uiState.isPlanExpired`, `parentLocalUIState.shadowDom`)
- `wireframe-variables-comment-sidebar-button` - Bind the Comment Sidebar Button wireframe via the flat-config namespaces (`globalConfig.featureState.sidebarVisible`, `componentConfig.data.unreadCount` / `annotations.length`, `componentConfig.uiState.commentCountType` / `floatingMode`)
- `wireframe-variables-comment-sidebar` - Bind the Comment Sidebar wireframe family (~80 tags) — hybrid access (mapped `focusedAnnotation` / `appliedFiltersCount` / `unreadCommentAnnotationCount` alongside flat `componentConfig.skeletonLoading` / `noCommentsFound*` / `virtualScrollData` / `filterConfig.*`), loop-scope (`focusedAnnotation`, `filter`, `item`, `group`, `tag`), filter-panel + minimal-dropdown + standalone-dropdown subtrees, nested Comment Dialog scope inside list / focused-thread / page-mode composer
