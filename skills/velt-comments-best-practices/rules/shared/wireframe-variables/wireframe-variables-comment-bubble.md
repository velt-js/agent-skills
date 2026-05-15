---
title: Bind Comment Bubble Wireframe Slots Using Template Variables
impact: MEDIUM
impactDescription: Drives unread/selected styling, author content, and conditional pin decorations inside Comment Bubble and Comment Pin wireframes without re-subscribing to annotation state
tags: wireframe, template-variables, velt-data, velt-if, velt-class, defaultCondition, comment-bubble, comment-pin, annotation
---

## Bind Comment Bubble Wireframe Slots Using Template Variables

The Comment Bubble wireframe family (`<velt-comment-bubble-...-wireframe>` / `<VeltCommentBubbleWireframe.*>`) exposes a fixed set of template variables that you read with three directives — `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Use these instead of re-implementing annotation selection / unread tracking on top of `useCommentAnnotations`. Variables are mapped — reference them by their short name, **never** as `componentConfig.var` (with the documented feature-state exception below).

For the structural catalog of which wireframe tags exist and how they nest, see `ui/ui-wireframes.md`. This rule documents the *variable-binding* layer on top of that structure.

Do not rebuild bubble state from `useCommentAnnotations` and conditionally mount wireframe slots. The wireframe already exposes `annotation.unread`, `selectedAnnotationsMap`, and `annotation.from.name` as injected variables. Reimplementing this breaks the wireframe contract and causes double state tracking.

**Correct (read the slot's injected variables via `velt-data` / `veltIf` / `veltClass`):**

```jsx
import { VeltCommentBubbleWireframe } from '@veltdev/react';

<VeltCommentBubbleWireframe
  veltClass="'unread': {annotation.unread}, 'selected': {selectedAnnotationsMap[annotation.annotationId]}">
  <div className="my-bubble">
    <VeltCommentBubbleWireframe.Avatar>
      <img className="my-bubble__avatar" src="{annotation.from.photoUrl}" />
    </VeltCommentBubbleWireframe.Avatar>
    <span className="my-bubble__name">
      <VeltData field="annotation.from.name" />
    </span>
    <VeltCommentBubbleWireframe.CommentsCount>
      <VeltIf condition="{annotation.comments.length} > 1">
        <span className="my-bubble__count">
          <VeltData field="annotation.comments.length" />
        </span>
      </VeltIf>
    </VeltCommentBubbleWireframe.CommentsCount>
    <VeltCommentBubbleWireframe.UnreadIcon>
      <VeltIf condition="{annotation.unread}">
        <span className="my-bubble__dot" />
      </VeltIf>
    </VeltCommentBubbleWireframe.UnreadIcon>
  </div>
</VeltCommentBubbleWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-comment-bubble-wireframe
  velt-class="'unread': {annotation.unread}, 'selected': {selectedAnnotationsMap[annotation.annotationId]}">
  <div class="my-bubble">
    <velt-comment-bubble-avatar-wireframe>
      <img class="my-bubble__avatar" />
    </velt-comment-bubble-avatar-wireframe>
    <span class="my-bubble__name">
      <velt-data field="annotation.from.name"></velt-data>
    </span>
    <velt-comment-bubble-comments-count-wireframe>
      <span velt-if="{annotation.comments.length} > 1">
        <velt-data field="annotation.comments.length"></velt-data>
      </span>
    </velt-comment-bubble-comments-count-wireframe>
    <velt-comment-bubble-unread-icon-wireframe>
      <span velt-if="{annotation.unread}"></span>
    </velt-comment-bubble-unread-icon-wireframe>
  </div>
</velt-comment-bubble-wireframe>
```

### Variable namespaces

The Comment Bubble injects four namespaces at the root of every slot.

**App State** — globally resolved identity:

| Variable | Type | Notes |
|---|---|---|
| `globalConfigSignal.appState.user` | `User \| null` | Currently identified end-user. Use the explicit path — `user` is *not* aliased here. |

**Data State** — annotation context for this bubble:

| Variable | Type | Notes |
|---|---|---|
| `annotation` | `CommentAnnotation \| null` | Annotation this bubble represents. Gate everything with `velt-if="{annotation}"`. |
| `annotation.from` | `User` | Author of the annotation's first comment. |
| `annotation.comments` | `Comment[]` | Comments in the thread. Length drives the count badge. |
| `annotation.status.id` | `string` | Status id (`"open"`, `"resolved"`, custom-status ids). |
| `annotation.unread` | `boolean` | Annotation has unread comments for the current user. |
| `annotation.iam.accessMode` | `'public' \| 'private'` | Visibility mode. |
| `annotation.ghostComment` | `GhostComment \| null` | Set when the pin has lost its DOM target (ghost-comment state). |
| `annotation.annotationIndex` | `number` | Place-order index (used by `comment-pin-index` slot). |
| `annotation.annotationNumber` | `number` | Auto-generated annotation number (used by `comment-pin-number` slot). |
| `annotations` | `CommentAnnotation[]` | All annotations currently in scope. |
| `unresolvedAnnotationsCount` | `number` | Unresolved annotations across the document. |
| `unreadCount` | `number` | Unread-comment count for this bubble's annotation. |
| `data.folderId` | `string` | Folder id the annotation belongs to. |
| `data.context` | `Record<string, any>` | Free-form annotation context (read via bracket / dotted paths). |

**UI State** — per-bubble flags driven by the bubble itself:

| Variable | Type | Notes |
|---|---|---|
| `uiState.commentPinSelected` | `boolean` | Pin associated with this bubble is currently selected. |
| `selectedAnnotationsMap` | `Record<string, boolean>` | Map keyed by `annotationId` → selected flag. Use bracket lookup: `{selectedAnnotationsMap[annotation.annotationId]}`. |
| `selectedAnnotationsLocationMap` | `Record<string, any>` | Internal selection bookkeeping by location — read individual entries via bracket notation if needed. |
| `darkMode` | `boolean` | Dark mode is active for this bubble. |
| `variant` | `string` | Per-instance variant tag from the host element. |
| `parentLocalUIState.shadowDom` | `boolean` | Shadow-DOM rendering is enabled (host attribute). |
| `commentBubbleTargetPinHover` | `boolean` | The bubble's anchor pin is currently hovered. |
| `openDialog` | `boolean` | A comment dialog is open for this bubble's annotation. |
| `readOnly` | `boolean` | Per-render read-only flag. |
| `showAvatar` | `boolean` | Avatar should render. |
| `commentCountType` | `'total' \| 'unread'` | Which count drives the badge. |

**Feature State** — workspace capability flags. These names collide with mappings used elsewhere, so they must be read via the **full path**:

| Variable | Type | Notes |
|---|---|---|
| `globalConfigSignal.featureState.customStatusesShown` | `boolean` | Custom-status decoration enabled on bubbles. |
| `globalConfigSignal.featureState.groupMatchedComments` | `boolean` | Matched comments are grouped on the page. |
| `globalConfigSignal.featureState.resolvedCommentsOnDom` | `boolean` | Resolved annotations still render bubbles. |
| `globalConfigSignal.featureState.readOnly` | `boolean` | Workspace read-only mode is active (distinct from the per-render `readOnly`). |

### Wireframe tags

The Comment Bubble proper has 4 slots; the related Comment Pin has 7 deeply-nested tags. Pin tags read from the *same* `annotation` context.

**Comment Bubble slots:**

| Wireframe tag | React component | Notes |
|---|---|---|
| `<velt-comment-bubble-wireframe>` | `<VeltCommentBubbleWireframe>` | Root. One per non-resolved annotation; resolved bubbles render only when `globalConfigSignal.featureState.resolvedCommentsOnDom === true`. |
| `<velt-comment-bubble-avatar-wireframe>` | `<VeltCommentBubbleWireframe.Avatar>` | Author avatar (`annotation.from.photoUrl` / `annotation.from.name`). |
| `<velt-comment-bubble-comments-count-wireframe>` | `<VeltCommentBubbleWireframe.CommentsCount>` | "N" badge. `shouldShow` requires `annotation.comments.length > 1`. |
| `<velt-comment-bubble-unread-icon-wireframe>` | `<VeltCommentBubbleWireframe.UnreadIcon>` | Unread indicator. `shouldShow` requires `unreadCount > 0` (or `annotation.unread`, depending on `commentCountType`). |

**Comment Pin slots** (separate primitive, same `annotation` binding):

| Wireframe tag | Notes |
|---|---|
| `<velt-comment-pin-wireframe>` | Root pin element. |
| `<velt-comment-pin-triangle-wireframe>` | Pointing-arrow triangle below the pin (visual only — no data binding). |
| `<velt-comment-pin-index-wireframe>` | Place-order index — bind `<velt-data field="annotation.annotationIndex" />`. |
| `<velt-comment-pin-number-wireframe>` | Auto-generated number — bind `<velt-data field="annotation.annotationNumber" />`. |
| `<velt-comment-pin-unread-comment-indicator-wireframe>` | Unread dot — gate with `velt-if="{annotation.unread}"`. |
| `<velt-comment-pin-private-comment-indicator-wireframe>` | Private-mode lock — gate with `velt-if="{annotation.iam.accessMode} === 'private'"`. |
| `<velt-comment-pin-ghost-comment-indicator-wireframe>` | Ghost-comment indicator — gate with `velt-if="{annotation.ghostComment}"`. |

### `defaultCondition` and Angular signal inputs

| React Prop | HTML Attribute | Type | Default | Behavior |
|---|---|---|---|---|
| `defaultCondition` | `default-condition` | `boolean \| "true" \| "false"` | `true` | When `false`, the component renders regardless of its internal `shouldShow` gate. Use to force-show a slot you would otherwise hide (e.g. render the comments-count badge even at length `1`). |

**Angular signal inputs** (parent-to-child wiring; React/HTML do not require these):

```typescript
// On any <velt-comment-bubble-...-wireframe> in an Angular template
[componentConfigSignal]="config()"      // annotation, selectedAnnotationsMap,
                                         // unreadCount, openDialog
[parentLocalUIState]="localUI()"         // darkMode, variant, shadowDom,
                                         // readOnly, showAvatar, commentCountType
```

The root `<velt-comment-bubble>` element additionally accepts host attributes that map onto local UI state: `dark-mode`, `variant`, `show-avatar`, `comment-count-type`, `shadow-dom`.

### `shouldShow` gates worth remembering

| Slot | `shouldShow` |
|---|---|
| `comment-bubble-wireframe` (root) | One per non-resolved annotation. Resolved annotations render only when `globalConfigSignal.featureState.resolvedCommentsOnDom === true`. |
| `comment-bubble-comments-count-wireframe` | `annotation.comments.length > 1` |
| `comment-bubble-unread-icon-wireframe` | `unreadCount > 0` (or `annotation.unread === true`, depending on `commentCountType`) |
| `comment-pin-unread-comment-indicator-wireframe` | `annotation.unread === true` |
| `comment-pin-private-comment-indicator-wireframe` | `annotation.iam.accessMode === 'private'` |
| `comment-pin-ghost-comment-indicator-wireframe` | `annotation.ghostComment != null` |

Override any of them with `defaultCondition={false}` (React) / `default-condition="false"` (HTML) when you need the slot to render unconditionally.

### Naming conflicts — use the full path

Three names collide with mappings used by other features. Inside a Comment Bubble wireframe, prefer the explicit path:

| Conflicting name | Use this in Comment Bubble |
|---|---|
| `customStatusesShown` | `globalConfigSignal.featureState.customStatusesShown` |
| `resolvedCommentsOnDom` | `globalConfigSignal.featureState.resolvedCommentsOnDom` |
| `readOnly` | `globalConfigSignal.featureState.readOnly` (workspace) **or** `{readOnly}` (per-render local) |

### Common mistakes — DO NOT

**1. DO NOT prefix mapped variables with `componentConfig.`** Variables are mapped to short names. `<velt-data field="componentConfig.annotation.from.name" />` resolves to nothing — use `<velt-data field="annotation.from.name" />`. The exception is the *feature-state* names listed above, which **require** the `globalConfigSignal.featureState.<name>` path.

**2. DO NOT confuse `annotation.unread` with `uiState.commentPinSelected`.** `annotation.unread` is data-state (this annotation has unread comments for me). `uiState.commentPinSelected` is UI-state (this bubble's pin is the currently selected one). They drive different visuals.

**3. DO NOT compare `selectedAnnotationsMap` to a boolean directly.** It is a map. Bracket-lookup the current annotation: `{selectedAnnotationsMap[annotation.annotationId]}`.

**4. DO NOT mix `defaultCondition` with `velt-if` to mean the same thing.** `defaultCondition={false}` disables the slot's internal gate (forcing render). `velt-if` adds a new gate on top. Combining them inverts the semantics you probably want.

**5. DO NOT bind to `parentLocalUIState.shadowDom` from inside the wireframe to *enable* shadow-DOM.** Shadow-DOM is set via the host attribute `shadow-dom="true"` on `<velt-comment-bubble>`. The variable only reports the current state.

**Verification:**
- [ ] Wireframe slots reference mapped variables by short name (not `componentConfig.var`)
- [ ] Feature-state reads use the full `globalConfigSignal.featureState.<name>` path for the four conflicting names
- [ ] Selection state uses `{selectedAnnotationsMap[annotation.annotationId]}` (bracket-lookup), not a boolean alias
- [ ] Comment-pin tags are used only when implementing a custom pin — the bubble tags do not nest pin tags
- [ ] `defaultCondition` / `default-condition` is used only to override an unwanted `shouldShow` gate
- [ ] Angular usage wires `[componentConfigSignal]` and `[parentLocalUIState]` from the parent — React/HTML usage does not

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/comment-bubble/wireframe-variables — "Comment Bubble Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-wireframes.md` (structural wireframe catalog), `ui/ui-comment-bubble.md` (bubble customization patterns)
