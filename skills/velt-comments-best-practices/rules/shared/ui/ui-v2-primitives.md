---
title: Set defaultCondition on V2 Primitive Sub-Components to Control Default Rendering
impact: MEDIUM
impactDescription: Prevents the SDK's default show/hide logic from conflicting with custom wireframe compositions in V2 primitive component families
tags: v2-primitives, defaultCondition, wireframe, comment-pin, comment-bubble, text-comment, inline-comments-section, multi-thread-comment-dialog, sidebar-button, comments-sidebar-v2, VeltCommentSidebarV2, VeltMultiThreadCommentDialog, VeltInlineCommentsSectionFilterDropdownContentApplyButton, search, filter-button, filter-container, fullscreen-button, customization, ui
---

## Set defaultCondition on V2 Primitive Sub-Components to Control Default Rendering

Seven comment component families use the V2 primitive architecture: Comment Pin (6 primitives), Comment Bubble (3, HTML-only), Text Comment (7), Inline Comments Section (24), Multi-Thread Comment Dialog (25), Sidebar Button (3), and Comments Sidebar V2 (56+ — expanded with the new Search / FilterButton / FilterContainer / FullscreenButton families this release). Every primitive in these families accepts a `defaultCondition` / `default-condition` prop. When a wireframe replaces a section of the UI, set `defaultCondition={false}` to bypass the SDK's built-in default show/hide logic and prevent double-rendering or unintended visibility toggles.

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

**V2-Migrated Component Families:**

| Family | Primitive Count | Notes |
|--------|----------------|-------|
| Comment Pin | 6 | React + HTML |
| Comment Bubble | 3 | HTML-only primitives |
| Text Comment | 7 | React + HTML |
| Inline Comments Section | 24 | React + HTML (ApplyButton promoted to React in v5.0.2-beta.11) |
| Multi-Thread Comment Dialog | 25 | React + HTML (`VeltMultiThreadCommentDialog` root added in v5.0.2-beta.11) |
| Sidebar Button | 3 | React + HTML |
| Comments Sidebar V2 | 56+ | React + HTML; standalone HTML sub-primitive tags use the singular `velt-comment-sidebar-*-v2` form (root stays plural `velt-comments-sidebar-v2`); React identifiers are also singular `VeltCommentSidebarV2*` |
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

### Comments Sidebar V2 — naming convention

> **Note:** The root container `VeltCommentsSidebarV2` / `<velt-comments-sidebar-v2>` is plural. **Every** standalone sub-primitive — React identifier *and* HTML custom-element tag — uses the singular form `VeltCommentSidebarV2*` / `<velt-comment-sidebar-*-v2>`. The HTML tag rename (plural → singular for sub-primitives) is the current release; React identifiers were already singular.

**Incorrect (old plural HTML / React identifiers):**

```jsx
<VeltCommentsSidebarV2>
  <VeltCommentsSidebarV2Skeleton />
  <VeltCommentsSidebarV2Panel>
    <VeltCommentsSidebarV2Header />
    <VeltCommentsSidebarV2List />
  </VeltCommentsSidebarV2Panel>
</VeltCommentsSidebarV2>
```

```html
<!-- Old plural HTML sub-primitive tags — no longer valid -->
<velt-comments-sidebar-v2>
  <velt-comments-sidebar-skeleton-v2></velt-comments-sidebar-skeleton-v2>
  <velt-comments-sidebar-panel-v2>
    <velt-comments-sidebar-header-v2></velt-comments-sidebar-header-v2>
    <velt-comments-sidebar-list-v2></velt-comments-sidebar-list-v2>
  </velt-comments-sidebar-panel-v2>
</velt-comments-sidebar-v2>
```

**Correct (singular sub-primitive names for React *and* HTML; root stays plural):**

```jsx
<VeltCommentsSidebarV2>
  <VeltCommentSidebarV2Skeleton />
  <VeltCommentSidebarV2Panel>
    <VeltCommentSidebarV2Header>
      <VeltCommentSidebarV2CloseButton />
      <VeltCommentSidebarV2FullscreenButton />
      <VeltCommentSidebarV2Search>
        <VeltCommentSidebarV2SearchIcon />
        <VeltCommentSidebarV2SearchInput />
      </VeltCommentSidebarV2Search>
      <VeltCommentSidebarV2FilterButton>
        <VeltCommentSidebarV2FilterButtonAppliedIcon />
      </VeltCommentSidebarV2FilterButton>
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

```html
<velt-comments-sidebar-v2>
  <velt-comment-sidebar-skeleton-v2></velt-comment-sidebar-skeleton-v2>
  <velt-comment-sidebar-panel-v2>
    <velt-comment-sidebar-header-v2>
      <velt-comment-sidebar-close-button-v2></velt-comment-sidebar-close-button-v2>
      <velt-comment-sidebar-fullscreen-button-v2></velt-comment-sidebar-fullscreen-button-v2>
      <velt-comment-sidebar-search-v2>
        <velt-comment-sidebar-search-v2-icon></velt-comment-sidebar-search-v2-icon>
        <velt-comment-sidebar-search-v2-input></velt-comment-sidebar-search-v2-input>
      </velt-comment-sidebar-search-v2>
      <velt-comment-sidebar-filter-button-v2>
        <velt-comment-sidebar-filter-button-v2-applied-icon></velt-comment-sidebar-filter-button-v2-applied-icon>
      </velt-comment-sidebar-filter-button-v2>
      <velt-comment-sidebar-filter-dropdown-v2></velt-comment-sidebar-filter-dropdown-v2>
    </velt-comment-sidebar-header-v2>
    <velt-comment-sidebar-list-v2></velt-comment-sidebar-list-v2>
  </velt-comment-sidebar-panel-v2>
</velt-comments-sidebar-v2>
```

| Identifier family (React + HTML) | Identifier | HTML element |
|----------------------------------|-----------|--------------|
| Skeleton | `VeltCommentSidebarV2Skeleton` | `velt-comment-sidebar-skeleton-v2` |
| Panel | `VeltCommentSidebarV2Panel` | `velt-comment-sidebar-panel-v2` |
| Header | `VeltCommentSidebarV2Header` | `velt-comment-sidebar-header-v2` |
| CloseButton | `VeltCommentSidebarV2CloseButton` | `velt-comment-sidebar-close-button-v2` |
| FullscreenButton (new) | `VeltCommentSidebarV2FullscreenButton` | `velt-comment-sidebar-fullscreen-button-v2` |
| Search (new) | `VeltCommentSidebarV2Search` (+ `Icon`, `Input`) | `velt-comment-sidebar-search-v2` (+ `-icon`, `-input`) |
| FilterButton (new) | `VeltCommentSidebarV2FilterButton` (+ `AppliedIcon`) | `velt-comment-sidebar-filter-button-v2` (+ `-applied-icon`) |
| FilterDropdown (+ subtree, incl. new `Content.List.Item.Count` and `Content.List.Category.Label` leaves) | `VeltCommentSidebarV2FilterDropdown*` | `velt-comment-sidebar-filter-dropdown-*-v2` |
| FilterContainer (new — Main Filter bottom-sheet subtree) | `VeltCommentSidebarV2FilterContainer*` | `velt-comment-sidebar-filter-container-*-v2` |
| List / ListItem | `VeltCommentSidebarV2List` / `*ListItem` | `velt-comment-sidebar-list-v2` / `velt-comment-sidebar-list-item-v2` |
| EmptyPlaceholder | `VeltCommentSidebarV2EmptyPlaceholder` | `velt-comment-sidebar-empty-placeholder-v2` |
| ResetFilterButton | `VeltCommentSidebarV2ResetFilterButton` | `velt-comment-sidebar-reset-filter-button-v2` |
| PageModeComposer | `VeltCommentSidebarV2PageModeComposer` | `velt-comment-sidebar-page-mode-composer-v2` |
| FocusedThread (+ subtree) | `VeltCommentSidebarV2FocusedThread*` | `velt-comment-sidebar-focused-thread-*-v2` |

> **Breaking change (Comment Sidebar V2 — current release):** `VeltCommentSidebarV2MinimalActionsDropdown` (and the `Trigger` / `Content` / `MarkAllRead` / `MarkAllResolved` children) plus the corresponding `velt-comments-sidebar-minimal-actions-dropdown-v2` HTML family have been **removed**. The bulk actions are now exposed by the combined `actions` filter-dropdown, configured via the `minimalFilters` input on `VeltCommentsSidebarV2`. Replace any `MinimalActionsDropdown` usage with a `FilterDropdown` configured as `{ type: 'actions', sorts: [...], actions: [...] }` — see `surface/surface-sidebar-v2.md`.

### New V2 primitive families (current release)

- **Search** — header search container holding the icon + input leaves (`VeltCommentSidebarV2Search`, `*SearchIcon`, `*SearchInput`).
- **FilterButton** — header button that opens the Main Filter container; child `*FilterButtonAppliedIcon` surfaces the active-filter indicator.
- **FullscreenButton** — header leaf that emits `onFullscreenClick` when clicked.
- **FilterContainer** — root container for the Main Filter bottom-sheet / menu, holding:
  - `Title`, `GroupBy`, `ResetButton`, `ApplyButton`, `CloseButton` leaves.
  - `SectionList` → `Section` → `SectionLabel` (leaf) and `SectionField` → `SectionControl` (+ `SectionControlChevron`, `SectionControlValue`, `SectionControlChipList` → `SectionControlChip`, `SectionControlSearch`) and `SectionOptionList` → `SectionOption` (+ `SectionOptionCheckbox`, `SectionOptionName`, `SectionOptionCount`).

The `Search`, `FilterButton`, `FilterContainer`, and `FullscreenButton` families replace the customization surface previously occupied by `MinimalActionsDropdown`. Use the `actions` dropdown type on `minimalFilters` for bulk mark-all-read / mark-all-resolved — these primitive families are the new shape for that surface.

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
- [ ] V2 sidebar sub-primitives use the singular `VeltCommentSidebarV2*` React identifiers **and** singular `velt-comment-sidebar-*-v2` HTML tags; the root component stays `VeltCommentsSidebarV2` / `velt-comments-sidebar-v2`
- [ ] Any `MinimalActionsDropdown` usage is migrated to a `FilterDropdown` configured via `minimalFilters: [{ type: 'actions', sorts: [...], actions: [...] }]`
- [ ] New families (`Search`, `FilterButton`, `FilterContainer`, `FullscreenButton`) are composed inside `Header` for the modern V2 sidebar header layout
- [ ] Multi-thread primitives used standalone pass `multiThreadAnnotationId` to bind real annotation data without the parent `VeltMultiThreadCommentDialog` root

**Source Pointers:**
- https://docs.velt.dev/ui-customization/overview - Wireframe and primitive architecture overview
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog-structure - Comment dialog primitives reference
- https://docs.velt.dev/ui-customization/features/async/comments/comment-sidebar/comment-sidebar-v2-primitives - V2 sidebar primitive catalog (56+ primitives, singular HTML tag rename, MinimalActionsDropdown removal)
- https://docs.velt.dev/ui-customization/features/async/comments/inline-comments-section/primitives - Inline Comments Section primitives (incl. ApplyButton React promotion)
- https://docs.velt.dev/ui-customization/features/async/comments/multithread-comments/primitives - Multi-Thread Comment Dialog primitives (incl. new root)
