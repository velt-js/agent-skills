---
title: Customize Comment Dialog Appearance
impact: MEDIUM
impactDescription: Match comment dialogs to your application design system
tags: dialog, customization, styling, wireframe, ui, darkMode, readOnly, sidebarMode, isFocusedThreadEnabled, openAnnotationInFocusMode, expandOnSelection, inlineCommentMode, inboxMode, isInsidePdfViewer, multiThread, commentComposerMode, dialogSelection, dialogMode, focusedThreadMode, pageModeComposer, messageTruncation, initialEditCommentIndex, messageTruncationLines, variant, composerPosition, sortBy, sortOrder, commentPinType, containerComponentId, targetElementId, targetComposerElementId, locationVersion, locationDisplayName, context, commentPlaceholder, replyPlaceholder, VeltCommentDialogThreadCardReactionPin, VeltCommentDialogThreadCardAssignButton, VeltCommentDialogThreadCardEditComposer, VeltCommentDialogOptionsDropdownContent, enableAssignment, enableEdit, enableNotifications, enablePrivateMode, enableMarkAsRead, VeltCommentDialogMoreReplyCount, VeltCommentDialogMoreReplyText, collapsedRepliesPreview
---

## Customize Comment Dialog Appearance

Customize comment dialog appearance using variants, styling, and wireframe components to match your design system.

**Pre-defined Variants:**

```jsx
<VeltComments dialogVariant="variant-name" />
```

**Dark Mode:**

```jsx
<VeltCommentDialog darkMode={true} />
```

**Disable Shadow DOM (for CSS access):**

```jsx
<VeltComments shadowDom={false} />
```

**`VeltCommentDialogProps` — full prop surface (v5.0.2-beta.11+):**

The React interface mirrors the underlying `<velt-comment-dialog>` HTML element's full attribute set. Use these props to control rendering modes, layout, sort, edit-mode placeholders, target binding for programmatic submission, and visual styling.

```typescript
interface VeltCommentDialogProps {
  annotationId?: string;
  multiThreadAnnotationId?: string;

  // Display & mode flags
  darkMode?: boolean;
  readOnly?: boolean;
  sidebarMode?: boolean;
  isFocusedThreadEnabled?: boolean;
  openAnnotationInFocusMode?: boolean;
  expandOnSelection?: boolean;
  inlineCommentMode?: boolean;
  inboxMode?: boolean;
  isInsidePdfViewer?: boolean;
  multiThread?: boolean;
  commentComposerMode?: boolean;
  dialogSelection?: boolean;
  dialogMode?: boolean;
  focusedThreadMode?: boolean;
  pageModeComposer?: boolean;
  messageTruncation?: boolean;
  initialEditCommentIndex?: number | string | null;
  messageTruncationLines?: number | string;

  // Layout & styling
  variant?: string;
  composerPosition?: string;
  sortBy?: string;
  sortOrder?: string;
  commentPinType?: 'bubble' | 'pin' | 'chart' | 'text';

  // Target & context binding
  containerComponentId?: string;
  targetElementId?: string;
  targetComposerElementId?: string; // For programmatic submitComment()
  locationVersion?: string;
  locationDisplayName?: string;
  context?: any;

  // Placeholders (paired with config-component-props edit-mode rule)
  commentPlaceholder?: string;
  replyPlaceholder?: string;
  editPlaceholder?: string;
  editCommentPlaceholder?: string;
  editReplyPlaceholder?: string;
}
```

```jsx
// Common combinations
<VeltCommentDialog
  darkMode={true}
  readOnly={false}
  multiThread={true}
  sortBy="timestamp"
  sortOrder="desc"
  targetComposerElementId="my-composer"
/>
```

**Wireframe Customization (full control):**

Velt provides wireframe components for complete UI customization:

```jsx
import { VeltCommentDialogWireframe } from '@veltdev/react';

<VeltCommentDialogWireframe.Header>
  {/* Custom header content */}
</VeltCommentDialogWireframe.Header>

<VeltCommentDialogWireframe.Body>
  {/* Custom body content */}
</VeltCommentDialogWireframe.Body>
```

**Available Wireframe Components:**

| Component | Purpose |
|-----------|---------|
| `GhostBanner` | Banner for ghost/anonymous comments |
| `PrivateBanner` | Banner for private comments |
| `AssigneeBanner` | Shows assigned user |
| `Header` | Dialog header section |
| `Status` | Comment status indicator |
| `Priority` | Priority selector |
| `Options` | Comment options menu |

**CSS Customization (with shadowDom=false):**

```css
/* Target Velt comment elements */
velt-comment-dialog {
  --velt-primary-color: #your-brand-color;
}

.velt-comment-dialog-header {
  background: #f5f5f5;
}
```

**For HTML:**

```html
<velt-comments
  dialog-variant="variant-name"
  shadow-dom="false"
></velt-comments>
```

**Inline Comments Section Customization:**

```jsx
<VeltInlineCommentsSection
  targetElementId="container-id"
  dialogVariant="custom-variant"
  variant="inline-section-variant"
  shadowDom={false}
/>
```

**Thread-Card Primitives (v5.0.2-beta.11+):**

Three new primitives let you place reaction pins, the assign-to button, and an inline edit composer directly inside a custom thread-card composition.

```jsx
import {
  VeltCommentDialogThreadCardReactionPin,
  VeltCommentDialogThreadCardAssignButton,
  VeltCommentDialogThreadCardEditComposer,
} from '@veltdev/react';

// Reaction pin inside a thread card
<VeltCommentDialogThreadCardReactionPin
  annotationId="abc123"
  reactionId="reaction-1"
  commentIndex={0}
/>

// Assign-to button inside a thread card
<VeltCommentDialogThreadCardAssignButton
  annotationId="abc123"
  commentId="456"
/>

// Inline edit composer inside a thread card
<VeltCommentDialogThreadCardEditComposer
  annotationId="abc123"
  commentId="456"
/>
```

```html
<!-- HTML — primitive custom elements -->
<velt-comment-dialog-thread-card-reaction-pin
  annotation-id="abc123"
  reaction-id="reaction-1"
  comment-index="0">
</velt-comment-dialog-thread-card-reaction-pin>

<velt-comment-dialog-thread-card-assign-button
  annotation-id="abc123"
  comment-id="456">
</velt-comment-dialog-thread-card-assign-button>

<velt-comment-dialog-thread-card-edit-composer
  annotation-id="abc123"
  comment-id="456">
</velt-comment-dialog-thread-card-edit-composer>
```

| Primitive | Extra Props (beyond Common Inputs) |
|-----------|-----------------------------------|
| `VeltCommentDialogThreadCardReactionPin` | `reactionId`, `commentObj`, `commentIndex`, `index` |
| `VeltCommentDialogThreadCardAssignButton` | `commentObj`, `commentId`, `commentIndex` |
| `VeltCommentDialogThreadCardEditComposer` | `commentObj`, `commentId`, `commentIndex` |

**`VeltCommentDialogOptionsDropdownContent` — show/hide individual options (v5.0.2-beta.11+):**

Previously documented as common-inputs-only; now exposes per-option enable flags so you can selectively render the assign / edit / notifications / private-mode / mark-as-read items inside the options dropdown.

```jsx
// React — show only the edit option
<VeltCommentDialogOptionsDropdownContent
  annotationId="abc123"
  enableEdit={true}
  enableAssignment={false}
  enableNotifications={false}
  enablePrivateMode={false}
  enableMarkAsRead={false}
/>
```

```html
<!-- HTML — same shape, kebab-case string attrs -->
<velt-comment-dialog-options-dropdown-content
  annotation-id="abc123"
  enable-edit="true"
  enable-assignment="false"
  enable-notifications="false"
  enable-private-mode="false"
  enable-mark-as-read="false">
</velt-comment-dialog-options-dropdown-content>
```

| Prop | Type | Description |
|------|------|-------------|
| `commentObj` | `any \| string` | Comment data object (or serialized JSON string for HTML) |
| `commentIndex` | `number \| string` | Index of comment in the array |
| `enableAssignment` | `boolean` | Shows the assign option |
| `enableEdit` | `boolean` | Shows the edit option |
| `enableNotifications` | `boolean` | Shows the notifications option |
| `enablePrivateMode` | `boolean` | Shows the private mode option |
| `enableMarkAsRead` | `boolean` | Shows the mark-as-read option |

**Collapsed-Replies-Preview Primitives (v5.0.2-beta.37+):**

Two primitives render the "Show N replies…" divider in a comment dialog's collapsed teaser (shown in the non-selected/preview state when `collapsedRepliesPreview` is enabled). They appear only when a thread has more than two comments.

```jsx
import {
  VeltCommentDialogMoreReplyCount,
  VeltCommentDialogMoreReplyText,
} from '@veltdev/react';

// Hidden-reply count: annotation.comments.length - 2, clamped to >= 0
<VeltCommentDialogMoreReplyCount annotationId="abc123" />

// Pluralized noun: "reply" when one reply is hidden, otherwise "replies"
<VeltCommentDialogMoreReplyText annotationId="abc123" />
```

```html
<velt-comment-dialog-more-reply-count annotation-id="abc123"></velt-comment-dialog-more-reply-count>
<velt-comment-dialog-more-reply-text annotation-id="abc123"></velt-comment-dialog-more-reply-text>
```

Both accept Common Inputs only. In React wireframe mode the public primitive is also exposed as the named sub-properties `VeltCommentDialogMoreReply.Count` and `.Text`; see `wireframe-variables-comment-dialog` for the separate wireframe-tree names.

**Verification Checklist:**
- [ ] Variant applied if using pre-defined styles
- [ ] shadowDom={false} if using custom CSS
- [ ] Wireframes used for complex customization
- [ ] `VeltCommentDialogProps` flags use React camelCase (e.g. `darkMode`, `readOnly`, `pageModeComposer`); HTML attributes use kebab-case
- [ ] Thread-card primitives (`VeltCommentDialogThreadCard{ReactionPin,AssignButton,EditComposer}`) receive `annotationId` (+ `commentId` or `commentIndex` where relevant)
- [ ] `VeltCommentDialogOptionsDropdownContent` sets `enable*` flags for any individual options it should show; omitted flags default to the SDK's built-in behavior
- [ ] `VeltCommentDialogMoreReply{Count,Text}` used only inside the collapsed-replies-preview divider (threads with more than two comments); both take Common Inputs only

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog-structure - Structure
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/styling - Styling
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/pre-defined-variants - Variants
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltcommentdialogprops - VeltCommentDialogProps full attribute set
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/primitives - Thread-card primitives and options-dropdown enable flags
