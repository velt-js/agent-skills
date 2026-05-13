---
title: Component Props API — VeltComments, VeltCommentDialog, VeltCommentsSidebar, VeltInlineCommentsSection
impact: MEDIUM
impactDescription: Enables typed prop-level customization (placeholder overrides, assignment mode, focus behavior) without imperative API calls
tags: VeltCommentsProps, VeltCommentDialogProps, VeltCommentsSidebarProps, VeltInlineCommentsSectionProps, editPlaceholder, editCommentPlaceholder, editReplyPlaceholder, assignToType, placeholder, component props, props API
---

## Component Props API — VeltComments, VeltCommentDialog, VeltCommentsSidebar, VeltInlineCommentsSection

Four Velt comment components accept typed props interfaces that cover placeholder text overrides (including edit-mode variants), assignment UI configuration, and sidebar focus behavior. Props set on the root `VeltComments` container propagate to all child dialogs automatically — set them once at the root rather than on every dialog.

Do not rely on imperative `commentElement.*` methods for features covered by these typed props — the prop interface is the canonical way to configure placeholder text and assignment mode.

**Correct (typed props on each component):**

```jsx
import {
  VeltComments,
  VeltCommentDialog,
  VeltCommentsSidebar,
  VeltInlineCommentsSection,
} from '@veltdev/react';

// Root container — props propagate to all dialogs automatically.
// editCommentPlaceholder / editReplyPlaceholder take precedence over editPlaceholder.
// Priority: editCommentPlaceholder | editReplyPlaceholder → editPlaceholder → placeholder → SDK defaults.
<VeltComments
  assignToType="dropdown"          // 'dropdown' (default) | 'checkbox'
  editPlaceholder="Edit your comment…"
  editCommentPlaceholder="Edit your first comment…"
  editReplyPlaceholder="Edit your reply…"
/>

// Individual dialog — same edit-placeholder props, no assignToType
<VeltCommentDialog
  editPlaceholder="Edit your comment…"
  editCommentPlaceholder="Edit your first comment…"
  editReplyPlaceholder="Edit your reply…"
/>

// Sidebar — adds add/reply/page-mode placeholders and focus behavior
<VeltCommentsSidebar
  commentPlaceholder="Add a comment…"
  replyPlaceholder="Add a reply…"
  pageModePlaceholder="Add a page comment…"
  editPlaceholder="Edit your comment…"
  editCommentPlaceholder="Edit your first comment…"
  editReplyPlaceholder="Edit your reply…"
  openAnnotationInFocusMode={true}  // requires focusedThreadMode to be enabled
/>

// Inline Comments Section — adds composerPlaceholder and readOnly
<VeltInlineCommentsSection
  commentPlaceholder="Add a comment…"
  replyPlaceholder="Add a reply…"
  composerPlaceholder="Start a conversation…"
  editPlaceholder="Edit your comment…"
  editCommentPlaceholder="Edit your first comment…"
  editReplyPlaceholder="Edit your reply…"
  readOnly={false}
/>
```

**Verification Checklist:**
- [ ] Edit-mode placeholder variants (`editCommentPlaceholder`, `editReplyPlaceholder`) are set on `VeltComments` root so they propagate to all dialogs
- [ ] `assignToType` is only used on `VeltComments` (not on `VeltCommentDialog`)
- [ ] `openAnnotationInFocusMode` on `VeltCommentsSidebar` is paired with `focusedThreadMode` enabled
- [ ] `VeltInlineCommentsSection` `readOnly` prop is used instead of imperative disable calls where applicable

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior - VeltCommentsProps and VeltCommentDialogProps
- https://docs.velt.dev/async-collaboration/comments-sidebar/customize-behavior - VeltCommentsSidebarProps
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltcommentsprops - VeltCommentsProps type definition
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltcommentdialogprops - VeltCommentDialogProps type definition
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltcommentssidebarprops - VeltCommentsSidebarProps type definition
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltinlinecommentssectionprops - VeltInlineCommentsSectionProps type definition
