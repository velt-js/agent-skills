---
title: Bind Comment Dialog Wireframe Slots Using Template Variables
impact: MEDIUM
impactDescription: Drives layout-mode styling, capability gating, composer state, thread-card iteration, and banner visibility inside the Comment Dialog wireframe family without re-subscribing to annotation state
tags: wireframe, template-variables, velt-data, velt-if, velt-class, defaultCondition, comment-dialog, composer, thread-card, banners
---

## Bind Comment Dialog Wireframe Slots Using Template Variables

The Comment Dialog wireframe family (`<velt-comment-dialog-...-wireframe>` / `<VeltCommentDialogWireframe.*>`) is the largest wireframe surface in the Velt SDK — roughly 110 slot tags covering the header, body, threads, thread-card, composer (and its attachments / format-toolbar / assign-user / private-badge / recordings subtree), the four banners, status/priority/custom dropdowns, and the auxiliary buttons (resolve, unresolve, private, delete, suggestion accept/reject, copy-link, sign-in, upgrade, navigation, all-comment).

You read the wireframe's exposed variables with three directives — `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Use these instead of re-implementing capability gating, draft state, or thread iteration on top of `useCommentAnnotations` / `useVeltClient`.

Most variables are mapped — reference them by their short name (`{annotation}`, `{enableResolve}`, `{composerContent}`). A small set lives at the root of `componentConfigSignal` and is **not** mapped — those require the full `componentConfigSignal.<name>` path (see the [Root-Level Properties](#root-level-properties-use-full-path) section).

For the structural catalog of which wireframe tags exist and how they nest, see `ui/ui-wireframes.md`. For the dialog's customization layer (CSS, custom-content slots), see `ui/ui-comment-dialog.md`. This rule documents the *variable-binding* layer on top of both.

**Incorrect (rebuilding dialog state from `useCommentAnnotations` and gating slots from the host component):**

```jsx
import { useCommentAnnotations, useVeltClient } from '@veltdev/react';
import { VeltCommentDialogWireframe } from '@veltdev/react';

function Dialog({ annotationId }) {
  const annotations = useCommentAnnotations();
  const annotation = annotations?.find(a => a.annotationId === annotationId);
  const client = useVeltClient();
  // Reimplements enableResolve + canResolveAnnotation tracking
  // and editComment state the wireframe already exposes as variables.
  const [canResolve, setCanResolve] = useState(false);
  const [editing, setEditing] = useState(false);
  useEffect(() => { /* manual subscriptions ... */ }, [client, annotation]);
  if (!annotation) return null;
  return (
    <VeltCommentDialogWireframe>
      <div className={editing ? 'my-dialog is-editing' : 'my-dialog'}>
        {canResolve && <button>Resolve</button>}
        {annotation.comments.map((c, i) => (
          <article key={c.commentId}>
            <strong>{c.from?.name}</strong>
            <p>{c.commentText}</p>
          </article>
        ))}
      </div>
    </VeltCommentDialogWireframe>
  );
}
```

**Correct (read the slot's injected variables via `velt-data` / `velt-if` / `velt-class`; let `ThreadCard` iterate for you):**

```jsx
import { VeltCommentDialogWireframe } from '@veltdev/react';

<VeltCommentDialogWireframe>
  <div className="my-dialog" veltClass="'is-editing': {editComment}, 'is-private': {isPrivateComment}, 'dark': {darkMode}">
    <VeltCommentDialogWireframe.Header>
      <VeltCommentDialogWireframe.ResolveButton
        veltIf="{enableResolve} && {canResolveAnnotation} && (!{resolveStatusAccessAdminOnly} || {isUserAdmin})">
        Resolve
      </VeltCommentDialogWireframe.ResolveButton>
      <VeltCommentDialogWireframe.CloseButton />
    </VeltCommentDialogWireframe.Header>

    <VeltCommentDialogWireframe.Body>
      <VeltCommentDialogWireframe.Threads>
        <VeltCommentDialogWireframe.ThreadCard>
          <article className="my-comment" veltClass="'is-first': '{commentIndex} === 0'">
            <strong><VeltData field="comment.from.name" /></strong>
            <p><VeltData field="comment.commentText" /></p>
            <VeltCommentDialogWireframe.ThreadCardEdited />
          </article>
        </VeltCommentDialogWireframe.ThreadCard>
      </VeltCommentDialogWireframe.Threads>
    </VeltCommentDialogWireframe.Body>

    <VeltCommentDialogWireframe.Composer />
  </div>
</VeltCommentDialogWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-comment-dialog-wireframe>
  <div class="my-dialog" velt-class="'is-editing': {editComment}, 'is-private': {isPrivateComment}">
    <velt-comment-dialog-header-wireframe>
      <velt-comment-dialog-resolve-button-wireframe
        velt-if="{enableResolve} && {canResolveAnnotation}">
        Resolve
      </velt-comment-dialog-resolve-button-wireframe>
      <velt-comment-dialog-close-button-wireframe></velt-comment-dialog-close-button-wireframe>
    </velt-comment-dialog-header-wireframe>

    <velt-comment-dialog-threads-wireframe>
      <velt-comment-dialog-thread-card-wireframe>
        <strong><velt-data field="comment.from.name"></velt-data></strong>
        <p><velt-data field="comment.commentText"></velt-data></p>
      </velt-comment-dialog-thread-card-wireframe>
    </velt-comment-dialog-threads-wireframe>

    <velt-comment-dialog-composer-wireframe></velt-comment-dialog-composer-wireframe>
  </div>
</velt-comment-dialog-wireframe>
```

### Variable namespaces

The dialog injects four root namespaces plus context-specific (loop-scoped) variables.

**App State** — identity:

| Variable | Type | Notes |
|---|---|---|
| `user` | `User` | Currently identified end-user. |
| `isUserAdmin` | `boolean` | `user.isAdmin === true`. |
| `isKnownUser` | `boolean` | User has been identified (vs. anonymous). |
| `repliesUniqueUsers` | `User[]` | Distinct authors of replies on the current annotation. |

**Data State** — annotation, composer staging, edit state, attachments, recordings:

| Variable | Type | Notes |
|---|---|---|
| `annotation` | `CommentAnnotation` | Annotation this dialog represents. Aliased as `commentAnnotation`. |
| `annotations` | `CommentAnnotation[]` | All annotations in scope. Aliased as `commentAnnotations`. |
| `allAnnotations` | `CommentAnnotation[]` | Unfiltered annotation list. |
| `ghostComment` | `GhostComment \| null` | Set when the annotation has lost its DOM target. |
| `assignTo` | `UserContact` | Currently selected assignee. |
| `selectedUserContacts` | `UserContact[]` | Selected user contacts (assign / mention). |
| `customList` | `any[]` | Autocomplete reference list. |
| `toOrganizationUserGroup` | `any[]` | Organization user-group contacts. |
| `taggedUserContacts` | `AutocompleteUserContactReplaceData[]` | Users tagged via @mention in the active composer. |
| `taggedGroups` | `any[]` | Groups tagged via @mention. |
| `customChipData` | `CustomAnnotationDropdownData \| null` | Custom-chip dropdown config. |
| `selectedCustomChipSet` | `Set<string>` | IDs currently selected in the custom-chip dropdown. |
| `currentDialogView` | `Record<string, any>` | Seen-by aggregation keyed by `commentId`. |
| `selectedFiles` | `FileData[]` | Files staged in the composer. |
| `invalidSelectedFiles` | `InvalidFileData[]` | Files rejected by validation. |
| `selectedAttachments` | `any[]` | Attachments staged for the new comment. |
| `editComment` | `Comment \| null` | Comment currently being edited. |
| `editCommentIndex` | `number \| null` | Index of the comment being edited. |
| `localRecordedData` | `RecordedData[]` | Recordings staged in the composer. |
| `attachmentsToDelete` | `any[]` | Attachments queued for deletion on save. |

**UI State — layout modes** (mutually-styled, sometimes co-active):

| Variable | Type | Notes |
|---|---|---|
| `sidebarMode` | `boolean` | Rendered inside the comments sidebar. |
| `inboxMode` | `boolean` | Rendered inside the inbox layout. |
| `dialogMode` | `boolean` | Default popup-dialog layout. |
| `inlineCommentMode` | `boolean` | Inline-comment-pin styling. |
| `inlineCommentSectionMode` | `boolean` | Inline comments section layout. |
| `focusedThreadMode` | `boolean` | Focused-thread layout. |
| `isFocusedThreadEnabled` | `boolean` | Focused-thread navigation is allowed. |
| `pageModeComposer` | `boolean` | Page-level composer mode. |
| `bottomSheetMode` | `boolean` | Bottom-sheet layout. |
| `commentComposerMode` | `boolean` | Composer-only layout (no thread). |
| `multiThreadAnnotationId` | `string \| null` | Multi-thread context id. |
| `dialogOpenedInSidebar` | `boolean` | Dialog opened in sidebar context. |
| `dialogShadowDOM` | `boolean` | Shadow-DOM rendering enabled. |
| `containerComponentId` | `string` | Owning container id. |
| `commentDialogUniqueId` | `string` | Unique id for this dialog instance. |
| `deviceType` | `string` | `'desktop'` / `'mobile'` / … |
| `darkMode` | `boolean` | Dark mode is active. |
| `variant` | `string` | Per-instance variant tag. |
| `disabled` | `boolean` | Dialog is disabled. |
| `readOnly` | `boolean` | Per-instance read-only mode. |
| `commentPinSelected` | `boolean` | Pin associated with this dialog is selected. |
| `commentDialogSelected` | `boolean` | This dialog is the currently selected one. |
| `fullExpanded` | `boolean` | Dialog is fully expanded (sidebar). |
| `expandOnSelection` | `boolean` | Sidebar expands on click vs. visually selecting. |
| `composerPosition` | `'top' \| 'bottom'` | Composer position. |
| `selectedVisibility` | `CommentVisibilityOptionType` | Selected visibility option. |
| `selectedVisibilityUsers` | `any[]` | Users selected when `selectedVisibility === 'selected_people'`. |
| `locationVersion` | `string` | Annotation location version. |

**UI State — composer state** (driven by the composer):

| Variable | Type | Notes |
|---|---|---|
| `composerContent` | `string` | Plain-text composer draft. Aliased as `newComment`. |
| `composerContentHTML` | `string` | Rich-text composer draft. Aliased as `newCommentHTML`. |
| `composerInOpenState` | `boolean` | Composer is expanded. |
| `composerMode` | `'default' \| 'expanded'` | Current composer mode. |
| `isInputFocused` | `boolean` | Composer input has keyboard focus. |
| `showCommentButtons` | `boolean` | Composer's action-button row should render. |
| `isAutocompleteDropdownOpen` | `boolean` | @-mention autocomplete dropdown is open. |
| `uploadingAttachments` | `boolean` | One or more attachments are uploading. |
| `recorderInitConfig` | `any` | Active recorder configuration (or `null`). |

**UI State — reactions, replies, dropdowns:**

| Variable | Type | Notes |
|---|---|---|
| `showReplies` | `boolean` | Reply list is currently shown. |
| `collapsedComments` | `boolean` | Comments are collapsed. |
| `showAllComments` | `boolean` | "Show all" mode is active. |
| `showReplyComposer` | `boolean` | Reply composer is visible. |
| `maxReplyAvatars` | `number` | Max reply avatars to show before "+N". |
| `showSuggestionModeActions` | `boolean` | Suggestion-mode accept/reject visible. |
| `reactionToolOpenIndex` | `number` | Comment index whose reaction picker is open (`-1` if none). |
| `openDropdownIndexValue` | `number` | Comment index whose options dropdown is open (`-1` if none). |
| `hasReactionsByCommentId` | `Record<string, boolean>` | Map keyed by `commentId` — bracket-lookup. |
| `assignToMenuOpened` | `boolean` | Assign-to menu is open. |
| `isPrivateComment` | `boolean` | Annotation is in private mode. |
| `showGhostCommentMessage` | `boolean` | Ghost-comment banner should show. |
| `playVideoInFullScreen` | `boolean` | Recordings play full-screen. |
| `shouldScrollToBottom` | `boolean` | Internal transient signal — not typically used in wireframes. |
| `showScreenSizeInfo` | `boolean` | Screen-size information overlay visible. |
| `sidebarButtonOnCommentDialogVisible` | `boolean` | "View all comments" sidebar button visible. |

**Feature State** — workspace capability flags (all shared across dialog instances for the same annotation):

| Variable | Type | Notes |
|---|---|---|
| `canResolveAnnotation` / `canUnresolveAnnotation` | `boolean` | Current user is allowed to (un)resolve. |
| `dialogSelectedByKnownUser` | `boolean` | Selected dialog belongs to an identified user. |
| `enableResolve` | `boolean` | Resolve action enabled by config. |
| `resolveStatusAccessAdminOnly` | `boolean` | Only admins can change resolve status. |
| `enableSignInButton` / `enableUpgradeButton` | `boolean` | Sign-in / upgrade buttons rendered. |
| `enableGhostCommentsMessage` | `boolean` | Ghost-comment banner enabled. |
| `replyAvatars` | `boolean` | Reply-avatars strip enabled. |
| `userMentions` | `boolean` | @-mention autocomplete enabled. |
| `recordingSummaryEnabled` | `boolean` | Recording AI-summary feature enabled. |
| `enableAttachment` | `boolean` | File attachments enabled. |
| `allowedFileTypes` | `string[]` | File-type allow-list. |
| `allowedRecordings` | `string[]` | Recording types enabled (`'audio'` / `'video'` / `'screen'`). |
| `screenSharingSupported` | `boolean` | Browser supports screen-sharing. |
| `enterKeyToSubmit` | `boolean` | Enter submits (vs. newline). |
| `deleteOnBackspace` | `boolean` | Backspace on empty composer deletes the comment. |
| `enableReactions` | `boolean` | Emoji reactions enabled. |
| `isInsidePdfViewer` | `boolean` | Dialog is inside a PDF viewer. |
| `enableStatus` / `enablePriority` | `boolean` | Status / Priority dropdowns enabled. |
| `customStatusesShown` | `boolean` | Custom-status decoration enabled. |
| `statusOptions` / `priorityOptions` | `CustomStatus[]` / `CustomPriority[]` | Available options. |
| `visibilityOptions` | `boolean` | Visibility dropdown enabled. |
| `enableAssignment` | `boolean` | Assign-to dropdown enabled. |
| `enableNotifications` | `boolean` | Notification toggle enabled. |
| `enableEdit` / `enableDelete` | `boolean` | Edit / delete actions enabled. |
| `enablePrivateMode` | `boolean` | Private-mode toggle enabled. |
| `deleteThreadWithFirstComment` | `boolean` | Deleting the first comment cascades to thread. |
| `seenByUsers` | `boolean` | "Seen by" feature enabled. |
| `commentAcceptedStatus` / `commentRejectedStatus` | `CustomStatus` | Suggestion-mode terminal-status objects. |
| `enableAutoCategorize` | `boolean` | Auto-categorize feature enabled. |
| `suggestionMode` / `moderatorMode` | `boolean` | Suggestion / moderator modes active. |
| `isPlanExpired` | `boolean` | Workspace plan is expired. |

### Loop-scope (context-specific) variables

These resolve only inside their owning iteration slot — referencing them outside returns `undefined`.

| Variable | Type | Available in |
|---|---|---|
| `commentObj` / `comment` | `Comment` | `<velt-comment-dialog-thread-card-wireframe>` and descendants. Aliases. |
| `commentIndex` | `number` | Same as above. `0` on the parent comment. |
| `commentAnnotation` / `commentAnnotations` | `CommentAnnotation` / `CommentAnnotation[]` | Available everywhere (aliases of `annotation` / `annotations`). |
| `userContact` | `UserContact` | User-selector items (visibility-banner dropdown, assign-user). |
| `context` | `Record<string, any>` | Inline-comment-section context (cross-references `mode/mode-inline-comments.md`). |

**Aliases:** `commentObj` ↔ `comment`, `annotation` ↔ `commentAnnotation`, `annotations` ↔ `commentAnnotations`. Prefer the short form.

### Root-Level Properties (Use Full Path)

These live at the root of `componentConfigSignal` and are **not** entries in the variable map — they require the full path:

| Variable | Type | Notes |
|---|---|---|
| `componentConfigSignal.unreadCommentsMap` | `Record<string, number> \| null` | Map keyed by `annotationId` → unread count. Combine with bracket notation: `{componentConfigSignal.unreadCommentsMap[annotation.annotationId]}`. |
| `componentConfigSignal.unreadIndicatorMode` | `'minimal' \| 'detailed'` | Unread-indicator display mode. |
| `componentConfigSignal.commentplaceholder` | `string` | Placeholder for the new-comment composer. |
| `componentConfigSignal.replyplaceholder` | `string` | Placeholder for the reply composer. |
| `componentConfigSignal.editplaceholder` | `string` | Placeholder for the generic edit composer. |
| `componentConfigSignal.editcommentplaceholder` | `string` | Placeholder for the edit-comment composer. |
| `componentConfigSignal.editreplyplaceholder` | `string` | Placeholder for the edit-reply composer. |
| `componentConfigSignal.placeholder` | `string` | Generic placeholder; takes priority over the others. |

One root-level helper **is** mapped: `unreadCommentAnnotationCount` (read as `{unreadCommentAnnotationCount}` — populated for the unread counter on dialog/sidebar entry-points).

### Version 1 backward-compatibility aliases

Inherited from v4 SDK config signals. Mapped so v4 wireframes keep working:

| v1 Alias | Maps to | Notes |
|---|---|---|
| `allowAssignment` | `enableAssignment` | Was in `CommentDialogOptionsDropdownConfig`. |
| `allowToggleNotification` | `enableNotifications` | Per-comment notification toggle flag. |
| `allowEdit` | `enableEdit` | Per-comment edit-permission flag. |
| `allowChangeCommentAccessMode` | `enablePrivateMode` | Access-mode toggle flag. |
| `notificationEnabled` | `notificationEnabled` (passthrough) | Data context must provide it. |
| `mainCommentId` | `annotation.comments.0.commentId` | First comment's id. |

The resolver also unwraps two legacy signal-name prefixes — `commentDialogOptionsDropdownConfigSignal.*` and `commentDialogStatusDropdownConfigSignal.*` — so an old wireframe like `{commentDialogOptionsDropdownConfigSignal.allowAssignment}` keeps working. **Prefer the v5 names in new code.**

### Wireframe tags by region

The dialog exposes roughly 110 slot tags. They are grouped here by region; the full structural tree is catalogued in `ui/ui-wireframes.md`. The React component path is `<VeltCommentDialogWireframe.X.Y>` matching the kebab-case tag.

**Root / structural** (4 tags):

| Wireframe tag | Notes |
|---|---|
| `<velt-comment-dialog-wireframe>` | Root. `shouldShow` requires `annotation` to resolve. |
| `<velt-comment-dialog-header-wireframe>` | Top region — typically wraps `close-button`, `resolve-button`, dropdowns. |
| `<velt-comment-dialog-body-wireframe>` | Middle region — wraps `threads` and banners. |
| `<velt-comment-dialog-close-button-wireframe>` | Close button. |

**Threads region** (iteration root + 11 thread-card slots):

| Wireframe tag | Loop-scope | Notes |
|---|---|---|
| `<velt-comment-dialog-threads-wireframe>` | — | Iteration root over `annotation.comments`. |
| `<velt-comment-dialog-thread-card-wireframe>` | injects `comment`, `commentObj`, `commentIndex` | Per-comment card. All children below inherit the loop-scope. |
| `<velt-comment-dialog-thread-card-avatar-wireframe>` | inherits | Author avatar — bind `comment.from.photoUrl`. |
| `<velt-comment-dialog-thread-card-name-wireframe>` | inherits | Author name — bind `comment.from.name`. |
| `<velt-comment-dialog-thread-card-time-wireframe>` | inherits | Timestamp — bind `comment.createdAt`. |
| `<velt-comment-dialog-thread-card-message-wireframe>` | inherits | Comment text. Has `…-show-more-wireframe` / `…-show-less-wireframe` children for long messages. |
| `<velt-comment-dialog-thread-card-edited-wireframe>` | inherits | "(edited)" indicator. |
| `<velt-comment-dialog-thread-card-options-wireframe>` | inherits | Per-comment options menu trigger. |
| `<velt-comment-dialog-thread-card-reactions-wireframe>` | inherits | Emoji reactions strip. `shouldShow` requires `{enableReactions} && {hasReactionsByCommentId[comment.commentId]}`. |
| `<velt-comment-dialog-thread-card-recordings-wireframe>` | inherits | Per-comment recordings list. |
| `<velt-comment-dialog-thread-card-attachments-wireframe>` | inherits | Per-comment attachments list. |
| `<velt-comment-dialog-thread-card-seen-dropdown-wireframe>` | inherits | "Seen by" dropdown trigger. Children: `…-content-item-avatar/name/time-wireframe`. |

**Composer region** (10 top-level + attachment / format-toolbar subtrees):

| Wireframe tag | Notes |
|---|---|
| `<velt-comment-dialog-composer-wireframe>` | Composer root. Reads `composerContent` / `composerContentHTML`. |
| `<velt-comment-dialog-composer-input-wireframe>` | The contenteditable input. |
| `<velt-comment-dialog-composer-avatar-wireframe>` | Current-user avatar (`user.photoUrl`). |
| `<velt-comment-dialog-composer-action-button-wireframe>` | Submit / send button. `shouldShow` requires `{showCommentButtons}`. |
| `<velt-comment-dialog-composer-format-toolbar-wireframe>` | Rich-text format toolbar. |
| `<velt-comment-dialog-composer-assign-user-wireframe>` | Assign-user trigger. `shouldShow` requires `{enableAssignment}`. |
| `<velt-comment-dialog-composer-private-badge-wireframe>` | Private-mode badge. `shouldShow` requires `{isPrivateComment}`. |
| `<velt-comment-dialog-composer-recordings-wireframe>` | Recordings staged in composer — iterates `localRecordedData`. |
| `<velt-comment-dialog-composer-attachments-wireframe>` | Attachments root — wraps the subtree below. |
| `<velt-comment-dialog-composer-attachments-selected-wireframe>` | Selected-attachments iteration root. |

**Composer attachment subtree** (per-file slots — image vs. other vs. invalid):

| Wireframe tag | Notes |
|---|---|
| `…-attachments-image-wireframe` (+ `-preview`, `-loading`, `-download`, `-delete` children) | Image file slot. |
| `…-attachments-other-wireframe` (+ `-icon`, `-name`, `-size`, `-loading`, `-download`, `-delete` children) | Non-image file slot. |
| `…-attachments-invalid-wireframe` (+ `-item-preview`, `-item-message`, `-item-delete` children) | Validation-failed file slot. Gate the root with `velt-if="{invalidSelectedFiles.length} > 0"`. |

**Status / Priority / Custom-annotation dropdown subtrees** — each has a `…-dropdown-wireframe` trigger plus `…-content-item-icon/name(/label)/tick-wireframe` per-row children. Loop-scope inside the per-row slots is the option object (`statusOptions[i]`, `priorityOptions[i]`, `customChipData.items[i]`).

| Wireframe tag | Notes |
|---|---|
| `<velt-comment-dialog-status-dropdown-wireframe>` (+ content children) | `shouldShow` requires `{enableStatus}`. |
| `<velt-comment-dialog-priority-dropdown-wireframe>` (+ content children) | `shouldShow` requires `{enablePriority}`. |
| `<velt-comment-dialog-custom-annotation-dropdown-wireframe>` (+ content / trigger-list-item children) | `shouldShow` requires `customChipData != null`. |
| `<velt-comment-dialog-options-dropdown-wireframe>` (+ 8 content variants — `delete-comment`, `delete-thread`, `make-private-enable/disable`, `mark-as-read-mark-read/mark-unread`, `notification-subscribe/unsubscribe`) | Per-comment options. Gate variants by current-state flags. |

**Action buttons** (8 tags — each is its own primitive, gated by feature/capability flags):

| Wireframe tag | `shouldShow` |
|---|---|
| `<velt-comment-dialog-resolve-button-wireframe>` | `{enableResolve} && {canResolveAnnotation} && (!{resolveStatusAccessAdminOnly} || {isUserAdmin})` |
| `<velt-comment-dialog-unresolve-button-wireframe>` | `{canUnresolveAnnotation}` |
| `<velt-comment-dialog-private-button-wireframe>` | `{enablePrivateMode}` |
| `<velt-comment-dialog-delete-button-wireframe>` | `{enableDelete}` |
| `<velt-comment-dialog-suggestion-action-wireframe>` (+ `-accept`, `-reject` children) | `{suggestionMode} && {showSuggestionModeActions}` |
| `<velt-comment-dialog-approve-wireframe>` | `{moderatorMode}` |
| `<velt-comment-dialog-sign-in-wireframe>` | `{enableSignInButton} && !{isKnownUser}` |
| `<velt-comment-dialog-upgrade-wireframe>` | `{enableUpgradeButton} && {isPlanExpired}` |

**Banners** (4 tags + visibility-banner dropdown subtree):

| Wireframe tag | `shouldShow` |
|---|---|
| `<velt-comment-dialog-assignee-banner-wireframe>` (+ `-user-avatar`, `-user-name`, `-resolve-button` children) | `assignTo != null` |
| `<velt-comment-dialog-private-banner-wireframe>` | `{isPrivateComment}` |
| `<velt-comment-dialog-ghost-banner-wireframe>` | `{enableGhostCommentsMessage} && {showGhostCommentMessage}` |
| `<velt-comment-dialog-visibility-banner-wireframe>` (+ `-icon`, `-text`, full dropdown subtree below) | `{visibilityOptions}` |

The **visibility-banner dropdown subtree** mirrors the status / priority dropdown shape — a trigger (with avatar-list-item / remaining-count / icon / label children) and a content list (with per-item icon / label children). Loop-scope is `userContact` (avatar list) or the visibility option (`{option.value}` / `{option.label}` / `{option.icon}`) inside the per-item slots.

**Metadata / per-comment indicator tags** (4 tags — each renders a small badge in the thread-card header):

| Wireframe tag | Notes |
|---|---|
| `<velt-comment-dialog-metadata-wireframe>` | Wraps the four below. |
| `<velt-comment-dialog-comment-category-wireframe>` | Auto-categorize chip. `shouldShow` requires `{enableAutoCategorize}`. |
| `<velt-comment-dialog-comment-index-wireframe>` | "1 of N" indicator. |
| `<velt-comment-dialog-comment-number-wireframe>` | Auto-generated comment number. |
| `<velt-comment-dialog-comment-suggestion-status-wireframe>` | Suggestion-mode terminal status. |

**Reply navigation** (5 tags):

| Wireframe tag | Notes |
|---|---|
| `<velt-comment-dialog-reply-avatars-wireframe>` (+ `-list-item-wireframe` child) | Strip of reply-author avatars. `shouldShow` requires `{replyAvatars}`. |
| `<velt-comment-dialog-toggle-reply-wireframe>` (+ `-count`, `-icon`, `-text` children) | "View N replies" toggle. |
| `<velt-comment-dialog-hide-reply-wireframe>` | "Hide replies" toggle. |
| `<velt-comment-dialog-more-reply-wireframe>` | "+N more" indicator. |
| `<velt-comment-dialog-navigation-button-wireframe>` | Inter-thread navigation. |

**Auxiliary** (3 tags):

| Wireframe tag | Notes |
|---|---|
| `<velt-comment-dialog-all-comment-wireframe>` | "View all comments" link. `shouldShow` requires `{sidebarButtonOnCommentDialogVisible}`. |
| `<velt-comment-dialog-copy-link-wireframe>` | Copy-link button. |
| `<velt-comment-dialog-suggestion-action-accept-wireframe>` / `…-reject-wireframe` | Suggestion-mode terminal buttons (also listed under Action Buttons). |

For the *exhaustive* per-slot prose (sample markup, props, classes), see the docs source linked at the bottom.

### `defaultCondition` and Angular signal inputs

| React Prop | HTML Attribute | Type | Default | Behavior |
|---|---|---|---|---|
| `annotationId` | `annotation-id` | `string` | — | Standalone mode — pin this primitive to an annotation id. |
| `inlineCommentSectionMode` | `inline-comment-section-mode` | `boolean \| "true" \| "false"` | `false` | Switch to inline-section behavior. |
| `defaultCondition` | `default-condition` | `boolean \| "true" \| "false"` | `true` | When `false`, bypasses the slot's `shouldShow` so it always renders. |

**Angular signal inputs** (parent-to-child wiring; React/HTML do not require these):

```typescript
// On any <velt-comment-dialog-...-wireframe> in an Angular template
[componentConfigSignal]="config()"   // shared per-annotation config signal
[parentLocalUIState]="localUI()"     // per-instance UI state
```

The root `<velt-comment-dialog>` element additionally accepts host attributes that map onto local UI state — `dark-mode`, `variant`, `disabled`, `read-only`, `composer-position`, `dialog-shadow-dom`, etc.

### Common mistakes — DO NOT

**1. DO NOT prefix mapped variables with `componentConfig.` or `componentConfigSignal.`.** The dialog exposes ~250 mapped names. `<velt-data field="componentConfigSignal.annotation.from.name" />` resolves to nothing — use `<velt-data field="annotation.from.name" />`. The exception is the **eight unmapped root-level properties** (`componentConfigSignal.unreadCommentsMap`, the five `*placeholder` strings, `componentConfigSignal.unreadIndicatorMode`, `componentConfigSignal.placeholder`) which **must** use the full path.

**2. DO NOT reference loop-scope variables outside their slot.** `{comment}` / `{commentObj}` / `{commentIndex}` are defined only inside `<velt-comment-dialog-thread-card-wireframe>` and its descendants. Referencing them from the header or composer returns `undefined`.

**3. DO NOT gate the resolve button with only `{enableResolve}` or only `{canResolveAnnotation}`.** Both are required, plus the admin-only override: `velt-if="{enableResolve} && {canResolveAnnotation} && (!{resolveStatusAccessAdminOnly} || {isUserAdmin})"`.

**4. DO NOT compare `reactionToolOpenIndex` / `openDropdownIndexValue` directly to a boolean.** They are numeric indices (`-1` when closed). Compare to `{commentIndex}`: `velt-class="'reaction-open': '{reactionToolOpenIndex} === {commentIndex}'"`.

**5. DO NOT bracket-lookup `hasReactionsByCommentId` / `unreadCommentsMap` without the `commentId` / `annotationId` in scope.** Inside thread-card use `{hasReactionsByCommentId[comment.commentId]}`. Inside the dialog root use `{componentConfigSignal.unreadCommentsMap[annotation.annotationId]}`.

**6. DO NOT mix `defaultCondition` with `velt-if` to mean the same thing.** `defaultCondition={false}` disables the slot's internal `shouldShow` (forcing render). `velt-if` adds a new gate on top. Combining them inverts the semantics you probably want.

**7. DO NOT remount the dialog wireframe to switch layout modes.** `sidebarMode` / `inboxMode` / `dialogMode` / `inlineCommentMode` / `focusedThreadMode` are exposed as variables — toggle a class with `velt-class`, do not unmount.

**8. DO NOT depend on legacy `commentDialogOptionsDropdownConfigSignal.*` / `commentDialogStatusDropdownConfigSignal.*` prefixes in new code.** They are kept working by the resolver but the v5 short names (`enableAssignment`, `enableEdit`, `statusOptions`, …) are canonical.

**Verification:**
- [ ] Wireframe slots reference mapped variables by short name — `{annotation}`, `{enableResolve}`, `{composerContent}` — never `componentConfigSignal.<mapped-name>`
- [ ] The eight unmapped root-level properties (`unreadCommentsMap`, the `*placeholder` set, `unreadIndicatorMode`) are read with the full `componentConfigSignal.<name>` path
- [ ] Loop-scope (`comment`, `commentObj`, `commentIndex`, `userContact`) is used only inside the owning iteration slot
- [ ] Resolve / delete / private / suggestion buttons combine the capability flag (`enable*`) **and** the per-user permission (`can*` / `is*Admin`) — not one or the other
- [ ] Index-based dropdown / reaction state uses `=== {commentIndex}` (not a boolean coercion)
- [ ] `hasReactionsByCommentId` / `unreadCommentsMap` are bracket-looked-up against `comment.commentId` / `annotation.annotationId`
- [ ] Layout-mode switching is done via `velt-class`, not by remounting the wireframe
- [ ] Angular usage wires `[componentConfigSignal]` and `[parentLocalUIState]` from the parent — React/HTML usage does not
- [ ] v5 short names (`enableAssignment`, `enableEdit`, `enableNotifications`, `enablePrivateMode`) are preferred over the v1 aliases (`allowAssignment`, `allowEdit`, `allowToggleNotification`, `allowChangeCommentAccessMode`)

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/wireframe-variables — "Comment Dialog Wireframe Variables" (full per-slot reference)
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-wireframes.md` (structural catalog of all dialog tags), `ui/ui-comment-dialog.md` (dialog customization), `mode/mode-inline-comments.md` (`{context.someProperty}` patterns in inline-section composers)
