---
title: Set defaultCondition on V2 Primitive Sub-Components to Control Default Rendering
impact: MEDIUM
impactDescription: Prevents the SDK's default show/hide logic from conflicting with custom wireframe compositions in V2 primitive component families
tags: v2-primitives, defaultCondition, wireframe, comment-pin, comment-bubble, text-comment, inline-comments-section, multi-thread-comment-dialog, sidebar-button, comments-sidebar-v2, VeltCommentSidebarV2, VeltMultiThreadCommentDialog, VeltInlineCommentsSectionFilterDropdownContentApplyButton, customization, ui
---

## Set defaultCondition on V2 Primitive Sub-Components to Control Default Rendering

Seven comment component families use the V2 primitive architecture: Comment Pin (6 primitives), Comment Bubble (3, HTML-only), Text Comment (7), Inline Comments Section (24), Multi-Thread Comment Dialog (25), Sidebar Button (3), and Comments Sidebar V2 (27). Every primitive in these families accepts a `defaultCondition` / `default-condition` prop. When a wireframe replaces a section of the UI, set `defaultCondition={false}` to bypass the SDK's built-in default show/hide logic and prevent double-rendering or unintended visibility toggles.

<!-- TODO (v5.0.2-beta.11): Verify the exact primitive component names within each family (e.g., the individual identifiers for the 6 Comment Pin primitives). Release note confirms primitive counts per family and the `defaultCondition` prop name, but does not enumerate individual primitive names. -->

**Incorrect (omitting defaultCondition when overriding a primitive section):**

```jsx
// The SDK's default show/hide logic still runs, causing the primitive
// to render in its default state alongside the custom wireframe content.
<VeltCommentPinWireframe.SomePrimitive>
  <MyCustomContent />
</VeltCommentPinWireframe.SomePrimitive>
```

**Correct (React — set defaultCondition={false} to bypass default rendering logic):**

```jsx
import { VeltWireframe } from '@veltdev/react';

// Inside a VeltWireframe block, pass defaultCondition={false} to any
// V2 primitive whose section is being replaced by custom content.
// Applies to all families: Comment Pin, Comment Bubble, Text Comment,
// Inline Comments Section, Multi-Thread Comment Dialog, Sidebar Button.
<VeltWireframe>
  <VeltCommentPinWireframe.SomePrimitive defaultCondition={false}>
    <MyCustomContent />
  </VeltCommentPinWireframe.SomePrimitive>
</VeltWireframe>
```

**Correct (HTML — use default-condition attribute):**

```html
<!-- Inside a <velt-wireframe style="display:none;"> wrapper -->
<velt-wireframe style="display:none;">
  <velt-comment-pin-primitive-wireframe default-condition="false">
    <!-- Custom content replaces the default primitive rendering -->
  </velt-comment-pin-primitive-wireframe>
</velt-wireframe>
```

**V2-Migrated Component Families (v5.0.2-beta.11+):**

| Family | Primitive Count | Notes |
|--------|----------------|-------|
| Comment Pin | 6 | React + HTML |
| Comment Bubble | 3 | HTML-only primitives |
| Text Comment | 7 | React + HTML |
| Inline Comments Section | 24 | React + HTML (was 23; ApplyButton promoted to React in v5.0.2-beta.11) |
| Multi-Thread Comment Dialog | 25 | React + HTML (was 24; `VeltMultiThreadCommentDialog` root added in v5.0.2-beta.11) |
| Sidebar Button | 3 | React + HTML |
| Comments Sidebar V2 | 27 | React + HTML; React identifiers renamed `VeltCommentsSidebarV2*` → `VeltCommentSidebarV2*` (HTML elements unchanged) in v5.0.2-beta.11 |
| Comment Dialog Composer — Attachment Downloads | 2 | React + HTML; edit-mode only |

**Attachment Download Primitives (edit-mode composer):**

Two new primitives enable download buttons for attachments inside the edit-mode comment dialog composer. Non-wireframe integrations receive download buttons automatically; use these primitives only when building a custom wireframe composer.

- `VeltCommentDialogComposerAttachmentsImageDownload` — download button for image attachments
- `VeltCommentDialogComposerAttachmentsOtherDownload` — download button for non-image file attachments

Both accept an `annotationId` prop (required, `string`) providing the attachment context.

```jsx
// React — inside a custom wireframe composer
<VeltCommentDialogComposerAttachmentsImageDownload annotationId="abc123" />
<VeltCommentDialogComposerAttachmentsOtherDownload annotationId="abc123" />
```

```html
<!-- HTML -->
<velt-comment-dialog-composer-attachments-image-download annotation-id="abc123"></velt-comment-dialog-composer-attachments-image-download>
<velt-comment-dialog-composer-attachments-other-download annotation-id="abc123"></velt-comment-dialog-composer-attachments-other-download>
```

**Comments Sidebar V2 Rename (v5.0.2-beta.11+):**

All 26 V2 sidebar child primitives have been renamed from `VeltCommentsSidebarV2*` (plural "Comments") to `VeltCommentSidebarV2*` (singular "Comment") on the React side. The root component `VeltCommentsSidebarV2` and every underlying HTML custom element (`velt-comments-sidebar-*-v2`) are unchanged.

**Incorrect (old plural React identifiers):**

```jsx
<VeltCommentsSidebarV2>
  <VeltCommentsSidebarV2Skeleton />
  <VeltCommentsSidebarV2Panel>
    <VeltCommentsSidebarV2Header />
    <VeltCommentsSidebarV2List />
  </VeltCommentsSidebarV2Panel>
</VeltCommentsSidebarV2>
```

**Correct (singular `VeltCommentSidebarV2*` for child primitives; root stays plural):**

```jsx
<VeltCommentsSidebarV2>
  <VeltCommentSidebarV2Skeleton />
  <VeltCommentSidebarV2Panel>
    <VeltCommentSidebarV2Header>
      <VeltCommentSidebarV2CloseButton />
      <VeltCommentSidebarV2MinimalActionsDropdown>
        <VeltCommentSidebarV2MinimalActionsDropdownTrigger />
        <VeltCommentSidebarV2MinimalActionsDropdownContent>
          <VeltCommentSidebarV2MinimalActionsDropdownContentMarkAllRead />
          <VeltCommentSidebarV2MinimalActionsDropdownContentMarkAllResolved />
        </VeltCommentSidebarV2MinimalActionsDropdownContent>
      </VeltCommentSidebarV2MinimalActionsDropdown>
      <VeltCommentSidebarV2FilterDropdown />
    </VeltCommentSidebarV2Header>
    <VeltCommentSidebarV2List />
    <VeltCommentSidebarV2EmptyPlaceholder>
      <VeltCommentSidebarV2ResetFilterButton />
    </VeltCommentSidebarV2EmptyPlaceholder>
    <VeltCommentSidebarV2PageModeComposer />
    <VeltCommentSidebarV2FocusedThread>
      <VeltCommentSidebarV2FocusedThreadBackButton />
      <VeltCommentSidebarV2FocusedThreadDialogContainer />
    </VeltCommentSidebarV2FocusedThread>
  </VeltCommentSidebarV2Panel>
</VeltCommentsSidebarV2>
```

| Old React Identifier | New React Identifier | HTML Element (unchanged) |
|----------------------|----------------------|--------------------------|
| `VeltCommentsSidebarV2Skeleton` | `VeltCommentSidebarV2Skeleton` | `velt-comments-sidebar-skeleton-v2` |
| `VeltCommentsSidebarV2Panel` | `VeltCommentSidebarV2Panel` | `velt-comments-sidebar-panel-v2` |
| `VeltCommentsSidebarV2Header` | `VeltCommentSidebarV2Header` | `velt-comments-sidebar-header-v2` |
| `VeltCommentsSidebarV2CloseButton` | `VeltCommentSidebarV2CloseButton` | `velt-comments-sidebar-close-button-v2` |
| `VeltCommentsSidebarV2MinimalActionsDropdown*` (5 variants) | `VeltCommentSidebarV2MinimalActionsDropdown*` | `velt-comments-sidebar-minimal-actions-dropdown-*-v2` |
| `VeltCommentsSidebarV2FilterDropdown*` (9 variants) | `VeltCommentSidebarV2FilterDropdown*` | `velt-comments-sidebar-filter-dropdown-*-v2` |
| `VeltCommentsSidebarV2List` / `*ListItem` | `VeltCommentSidebarV2List` / `*ListItem` | `velt-comments-sidebar-list-v2` / `velt-comments-sidebar-list-item-v2` |
| `VeltCommentsSidebarV2EmptyPlaceholder` | `VeltCommentSidebarV2EmptyPlaceholder` | `velt-comments-sidebar-empty-placeholder-v2` |
| `VeltCommentsSidebarV2ResetFilterButton` | `VeltCommentSidebarV2ResetFilterButton` | `velt-comments-sidebar-reset-filter-button-v2` |
| `VeltCommentsSidebarV2PageModeComposer` | `VeltCommentSidebarV2PageModeComposer` | `velt-comments-sidebar-page-mode-composer-v2` |
| `VeltCommentsSidebarV2FocusedThread*` (3 variants) | `VeltCommentSidebarV2FocusedThread*` | `velt-comments-sidebar-focused-thread-*-v2` |

**`VeltInlineCommentsSectionFilterDropdownContentApplyButton` — React promotion (v5.0.2-beta.11+):**

Previously HTML-only; now exposed as a React component with `targetElementId` and `defaultCondition` props. This brings the Inline Comments Section primitive family count to 24.

```jsx
<VeltInlineCommentsSectionFilterDropdownContentApplyButton
  targetElementId="my-section"
  defaultCondition={true}
/>
```

```html
<velt-inline-comments-section-filter-dropdown-content-apply-button
  target-element-id="my-section"
  default-condition="true">
</velt-inline-comments-section-filter-dropdown-content-apply-button>
```

**`VeltMultiThreadCommentDialog` — new root primitive (v5.0.2-beta.11+):**

A new root component for the multi-thread comment dialog family, with a matching standalone `<velt-multi-thread-comment-dialog>` custom element. Multi-thread primitives can now also be used standalone by passing `multiThreadAnnotationId` to render with real annotation data without a parent root.

```jsx
<VeltMultiThreadCommentDialog
  multiThreadAnnotationId="thread-123"
  readOnly={false}
  defaultCondition={true}
  onSaveComment={(e) => console.log(e)}
/>
```

```html
<velt-multi-thread-comment-dialog
  multi-thread-annotation-id="thread-123"
  read-only="false"
  default-condition="true">
</velt-multi-thread-comment-dialog>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `annotationId` | `string` | — | The annotation ID |
| `multiThreadAnnotationId` | `string` | — | The multi-thread annotation ID |
| `annotation` | `any` | — | Annotation data object (serialized JSON in HTML) |
| `readOnly` | `boolean` | `false` | Disables user interaction |
| `defaultCondition` | `boolean` | `true` | When `false`, the component always renders regardless of internal state |
| `variant` | `string` | — | Visual variant for the component |
| `inboxMode` | `boolean` | `false` | Renders the dialog in inbox mode |
| `onSaveComment` | `Function` | — | Callback fired when a comment is saved (HTML: listen via `addEventListener('onSaveComment', ...)`) |

**Verification Checklist:**
- [ ] `defaultCondition={false}` is set on any V2 primitive whose section is fully replaced by a custom wireframe
- [ ] Primitive components are wrapped inside a `<VeltWireframe>` block (React) or `<velt-wireframe style="display:none;">` wrapper (HTML)
- [ ] HTML attributes use kebab-case: `default-condition="false"`
- [ ] Only primitives from the V2-migrated families are targeted (Comment Pin, Comment Bubble, Text Comment, Inline Comments Section, Multi-Thread Comment Dialog, Sidebar Button, Comments Sidebar V2)
- [ ] V2 sidebar child primitives use the singular `VeltCommentSidebarV2*` names (not the old plural `VeltCommentsSidebarV2*`); the root component stays `VeltCommentsSidebarV2`
- [ ] Multi-thread primitives used standalone pass `multiThreadAnnotationId` to bind real annotation data without the parent `VeltMultiThreadCommentDialog` root

**Source Pointers:**
- https://docs.velt.dev/ui-customization/overview - Wireframe and primitive architecture overview
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog-structure - Comment dialog primitives reference
- https://docs.velt.dev/ui-customization/features/async/comments/comment-sidebar/comment-sidebar-v2-primitives - V2 sidebar primitive rename
- https://docs.velt.dev/ui-customization/features/async/comments/inline-comments-section/primitives - Inline Comments Section primitives (incl. ApplyButton React promotion)
- https://docs.velt.dev/ui-customization/features/async/comments/multithread-comments/primitives - Multi-Thread Comment Dialog primitives (incl. new root)
