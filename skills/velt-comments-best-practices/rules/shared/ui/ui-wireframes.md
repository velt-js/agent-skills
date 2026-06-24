---
title: Use Wireframe Components for Custom UI
impact: MEDIUM
impactDescription: Build fully custom comment UIs with wireframe building blocks
tags: wireframe, customization, components, structure, ui
---

## Use Wireframe Components for Custom UI

Velt provides wireframe components that give you complete control over comment UI structure while maintaining functionality.

**Naming Conventions:**

| Framework | Pattern | Example |
|-----------|---------|---------|
| React | PascalCase | `VeltCommentDialogWireframe.Header` |
| HTML | kebab-case | `velt-comment-dialog-wireframe-header` |

**Comment Dialog Wireframe Structure:**

```jsx
import { VeltCommentDialogWireframe } from '@veltdev/react';

function CustomCommentDialog() {
  return (
    <VeltCommentDialogWireframe>
      <VeltCommentDialogWireframe.GhostBanner />
      <VeltCommentDialogWireframe.PrivateBanner />
      <VeltCommentDialogWireframe.AssigneeBanner />

      <VeltCommentDialogWireframe.Header>
        <VeltCommentDialogWireframe.Status />
        <VeltCommentDialogWireframe.Priority />
        <VeltCommentDialogWireframe.Options />
      </VeltCommentDialogWireframe.Header>

      <VeltCommentDialogWireframe.Body>
        {/* Comment content */}
      </VeltCommentDialogWireframe.Body>

      <VeltCommentDialogWireframe.Composer>
        {/* Input area */}
      </VeltCommentDialogWireframe.Composer>
    </VeltCommentDialogWireframe>
  );
}
```

**Comments Sidebar Wireframe:**

```jsx
import { VeltCommentsSidebarWireframe } from '@veltdev/react';

function CustomSidebar() {
  return (
    <VeltCommentsSidebarWireframe>
      <VeltCommentsSidebarWireframe.Header>
        <VeltCommentsSidebarWireframe.Filter />
        <VeltCommentsSidebarWireframe.CloseButton />
      </VeltCommentsSidebarWireframe.Header>

      <VeltCommentsSidebarWireframe.Panel>
        <VeltCommentsSidebarWireframe.List />
        <VeltCommentsSidebarWireframe.EmptyPlaceholder />
      </VeltCommentsSidebarWireframe.Panel>
    </VeltCommentsSidebarWireframe>
  );
}
```

**Key Wireframe Components:**

**Dialog Components:**
- `GhostBanner` - Anonymous comment indicator
- `PrivateBanner` - Private comment indicator
- `AssigneeBanner` - Assigned user display
  - `AssigneeBanner.ResolveButton` - Resolve button (template nested **inside** the button component as of v5.0.1-beta.2)
  - `AssigneeBanner.UnresolveButton` - Unresolve button (template nested **inside** the button component as of v5.0.1-beta.2)
- `Header` - Dialog header container
- `Status` - Status selector
- `Priority` - Priority selector
- `Options` - Options menu
- `Body` - Comment content area
- `Composer` - Input composer
- `VisibilityBanner` - Four-option visibility banner below the composer (v5.0.2-beta.4+; replaces the removed `VisibilityDropdown`)
  - `VisibilityBanner.Icon` - Banner icon
  - `VisibilityBanner.Text` - Banner label text
  - `VisibilityBanner.Dropdown` - Visibility selector dropdown
  - `VisibilityBanner.Dropdown.Trigger` - Dropdown trigger button
  - `VisibilityBanner.Dropdown.Trigger.Label` - Trigger label text
  - `VisibilityBanner.Dropdown.Trigger.AvatarList` - Avatar list (shown for `selected-people`)
  - `VisibilityBanner.Dropdown.Trigger.AvatarList.Item` - Individual avatar
  - `VisibilityBanner.Dropdown.Trigger.AvatarList.RemainingCount` - Overflow count badge
  - `VisibilityBanner.Dropdown.Trigger.Icon` - Trigger icon
  - `VisibilityBanner.Dropdown.Content` - Dropdown content panel
  - `VisibilityBanner.Dropdown.Content.Item` - Visibility option item (accepts `type`: `'public'` | `'organizationPrivate'` | `'restrictedSelf'` | `'restrictedSelectedPeople'`) (renamed from `'org-users'` / `'personal'` / `'selected-people'` in v5.0.2-beta.5)
  - `VisibilityBanner.Dropdown.Content.Item.Icon` - Option item icon
  - `VisibilityBanner.Dropdown.Content.Item.Label` - Option item label

> **Breaking Change (v5.0.2-beta.4):** The `velt-comment-dialog-visibility-dropdown-*` wireframe family has been removed. Migrate any custom wireframes to the new `velt-comment-dialog-visibility-banner-*` family shown below.

> **Breaking Change (v5.0.2-beta.5):** The `type` prop values on `VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item` (and the HTML equivalent) have been renamed to align with the `CommentVisibilityOption` enum. Replace `type="personal"` → `type="restrictedSelf"`, `type="selected-people"` → `type="restrictedSelectedPeople"`, `type="org-users"` → `type="organizationPrivate"`. The `type="public"` value is unchanged.

> **Breaking Change (v5.0.2-beta.5):** The `VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.UserPicker` sub-component hierarchy (11 components) has been removed. The visibility banner now uses the shared autocomplete component internally for user selection. Remove any wireframe usage of `UserPicker` and its descendants.

**VisibilityBanner Wireframe Usage (v5.0.2-beta.5+):**

```jsx
// React (v5.0.2-beta.5+)
<VeltWireframe>
  <VeltCommentDialogWireframe.VisibilityBanner>
    <VeltCommentDialogWireframe.VisibilityBanner.Icon />
    <VeltCommentDialogWireframe.VisibilityBanner.Text />
    <VeltCommentDialogWireframe.VisibilityBanner.Dropdown>
      <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Trigger>
        <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Trigger.Label />
        <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Trigger.AvatarList>
          <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Trigger.AvatarList.Item />
          <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Trigger.AvatarList.RemainingCount />
        </VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Trigger.AvatarList>
        <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Trigger.Icon />
      </VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Trigger>
      <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content>
        {/* Supports 4 types: 'public', 'organizationPrivate', 'restrictedSelf', 'restrictedSelectedPeople' */}
        <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item type="public">
          <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item.Icon />
          <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item.Label />
        </VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item>
        <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item type="organizationPrivate">
          <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item.Icon />
          <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item.Label />
        </VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item>
        <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item type="restrictedSelf">
          <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item.Icon />
          <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item.Label />
        </VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item>
        <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item type="restrictedSelectedPeople">
          <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item.Icon />
          <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item.Label />
        </VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item>
      </VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content>
    </VeltCommentDialogWireframe.VisibilityBanner.Dropdown>
  </VeltCommentDialogWireframe.VisibilityBanner>
</VeltWireframe>
```

```html
<!-- Other Frameworks (inside <velt-wireframe style="display:none;"> wrapper) (v5.0.2-beta.5+) -->
<velt-comment-dialog-visibility-banner-wireframe>
  <velt-comment-dialog-visibility-banner-icon-wireframe></velt-comment-dialog-visibility-banner-icon-wireframe>
  <velt-comment-dialog-visibility-banner-text-wireframe></velt-comment-dialog-visibility-banner-text-wireframe>
  <velt-comment-dialog-visibility-banner-dropdown-wireframe>
    <velt-comment-dialog-visibility-banner-dropdown-trigger-wireframe>
      <velt-comment-dialog-visibility-banner-dropdown-trigger-label-wireframe></velt-comment-dialog-visibility-banner-dropdown-trigger-label-wireframe>
      <velt-comment-dialog-visibility-banner-dropdown-trigger-avatar-list-wireframe>
        <velt-comment-dialog-visibility-banner-dropdown-trigger-avatar-list-item-wireframe></velt-comment-dialog-visibility-banner-dropdown-trigger-avatar-list-item-wireframe>
        <velt-comment-dialog-visibility-banner-dropdown-trigger-avatar-list-remaining-count-wireframe></velt-comment-dialog-visibility-banner-dropdown-trigger-avatar-list-remaining-count-wireframe>
      </velt-comment-dialog-visibility-banner-dropdown-trigger-avatar-list-wireframe>
      <velt-comment-dialog-visibility-banner-dropdown-trigger-icon-wireframe></velt-comment-dialog-visibility-banner-dropdown-trigger-icon-wireframe>
    </velt-comment-dialog-visibility-banner-dropdown-trigger-wireframe>
    <velt-comment-dialog-visibility-banner-dropdown-content-wireframe>
      <!-- Supports 4 types: 'public', 'organizationPrivate', 'restrictedSelf', 'restrictedSelectedPeople' -->
      <velt-comment-dialog-visibility-banner-dropdown-content-item-wireframe type="public">
        <velt-comment-dialog-visibility-banner-dropdown-content-item-icon-wireframe></velt-comment-dialog-visibility-banner-dropdown-content-item-icon-wireframe>
        <velt-comment-dialog-visibility-banner-dropdown-content-item-label-wireframe></velt-comment-dialog-visibility-banner-dropdown-content-item-label-wireframe>
      </velt-comment-dialog-visibility-banner-dropdown-content-item-wireframe>
      <velt-comment-dialog-visibility-banner-dropdown-content-item-wireframe type="organizationPrivate">
        <velt-comment-dialog-visibility-banner-dropdown-content-item-icon-wireframe></velt-comment-dialog-visibility-banner-dropdown-content-item-icon-wireframe>
        <velt-comment-dialog-visibility-banner-dropdown-content-item-label-wireframe></velt-comment-dialog-visibility-banner-dropdown-content-item-label-wireframe>
      </velt-comment-dialog-visibility-banner-dropdown-content-item-wireframe>
      <velt-comment-dialog-visibility-banner-dropdown-content-item-wireframe type="restrictedSelf">
        <velt-comment-dialog-visibility-banner-dropdown-content-item-icon-wireframe></velt-comment-dialog-visibility-banner-dropdown-content-item-icon-wireframe>
        <velt-comment-dialog-visibility-banner-dropdown-content-item-label-wireframe></velt-comment-dialog-visibility-banner-dropdown-content-item-label-wireframe>
      </velt-comment-dialog-visibility-banner-dropdown-content-item-wireframe>
      <velt-comment-dialog-visibility-banner-dropdown-content-item-wireframe type="restrictedSelectedPeople">
        <velt-comment-dialog-visibility-banner-dropdown-content-item-icon-wireframe></velt-comment-dialog-visibility-banner-dropdown-content-item-icon-wireframe>
        <velt-comment-dialog-visibility-banner-dropdown-content-item-label-wireframe></velt-comment-dialog-visibility-banner-dropdown-content-item-label-wireframe>
      </velt-comment-dialog-visibility-banner-dropdown-content-item-wireframe>
    </velt-comment-dialog-visibility-banner-dropdown-content-wireframe>
  </velt-comment-dialog-visibility-banner-dropdown-wireframe>
</velt-comment-dialog-visibility-banner-wireframe>
```

**AssigneeBanner Resolve/Unresolve Button Nesting (v5.0.1-beta.2+):**

As of v5.0.1-beta.2, the wireframe template for the resolve and unresolve buttons is nested **inside** the button component, not wrapping it. This gives custom content direct access to button state, styling, and event handlers.

```jsx
// Correct: custom content rendered INSIDE the button component (v5.0.1-beta.2+)
<VeltCommentDialogWireframe.AssigneeBanner>
  <VeltCommentDialogWireframe.AssigneeBanner.ResolveButton>
    {/* Custom content rendered inside the resolve button */}
  </VeltCommentDialogWireframe.AssigneeBanner.ResolveButton>
  <VeltCommentDialogWireframe.AssigneeBanner.UnresolveButton>
    {/* Custom content rendered inside the unresolve button */}
  </VeltCommentDialogWireframe.AssigneeBanner.UnresolveButton>
</VeltCommentDialogWireframe.AssigneeBanner>
```

```html
<!-- HTML equivalents -->
<velt-comment-dialog-assignee-banner-wireframe>
  <velt-comment-dialog-assignee-banner-resolve-button-wireframe>
    <!-- Custom content inside resolve button -->
  </velt-comment-dialog-assignee-banner-resolve-button-wireframe>
  <velt-comment-dialog-assignee-banner-unresolve-button-wireframe>
    <!-- Custom content inside unresolve button -->
  </velt-comment-dialog-assignee-banner-unresolve-button-wireframe>
</velt-comment-dialog-assignee-banner-wireframe>
```

**Sidebar Components:**
- `Header` - Sidebar header
- `Filter` - Filter controls
- `Panel` - Main content panel
- `List` - Comment list
- `EmptyPlaceholder` - Empty state

**V2 Sidebar Wireframe Subtrees (`VeltCommentsSidebarV2Wireframe.*` / `velt-comments-sidebar-*-v2-wireframe`):**

The V2 sidebar wireframe catalog gained five new subtrees and lost the MinimalActionsDropdown family. Compose them inside `VeltWireframe` / `<velt-wireframe>`.

- `Search` — header search row (and its `Icon` + `Input` leaves).
- `FilterButton` — opens the Main Filter container; child `AppliedIcon` leaf surfaces the active-filter indicator.
- `FilterContainer` — Main Filter bottom-sheet / menu subtree:
  - `Title`, `GroupBy`, `ResetButton`, `ApplyButton`, `CloseButton` leaves.
  - `SectionList` → `Section` → `SectionLabel` (leaf) and `SectionField` → `SectionControl` (+ `SectionControlChevron`, `SectionControlValue`, `SectionControlChipList` → `SectionControlChip`, `SectionControlSearch`) and `SectionOptionList` → `SectionOption` (+ `SectionOptionCheckbox`, `SectionOptionName`, `SectionOptionCount`).
- `FullscreenButton` — leaf header toggle that emits the new `onFullscreenClick` event.
- `ListGroupHeader` — renders once per group when grouping is enabled; child leaves `Label`, `Count`, `Chevron`, `Separator`.
- `FilterDropdown.Content.List.Item.Count` — new leaf under the existing `FilterDropdown` subtree.
- `FilterDropdown.Content.List.Category.Label` — new leaf alongside the existing `Category.Content`.

> **Breaking change (Comment Sidebar V2 — current release):** `VeltCommentsSidebarV2Wireframe.MinimalActionsDropdown` (Trigger / Content / MarkAllRead / MarkAllResolved) and the `velt-comments-sidebar-minimal-actions-dropdown-v2-wireframe` family are removed from the wireframe catalog. The actions are now exposed by the combined `actions` filter-dropdown, configured via the `minimalFilters` input on `VeltCommentsSidebarV2`. Migrate any custom wireframes to a `FilterDropdown` (or `FilterContainer`) composition.

```jsx
// React — V2 sidebar header composed against the new wireframe subtree
<VeltWireframe>
  <VeltCommentsSidebarV2Wireframe.Header>
    <VeltCommentsSidebarV2Wireframe.CloseButton />
    <VeltCommentsSidebarV2Wireframe.Search>
      <VeltCommentsSidebarV2Wireframe.Search.Icon />
      <VeltCommentsSidebarV2Wireframe.Search.Input />
    </VeltCommentsSidebarV2Wireframe.Search>
    <VeltCommentsSidebarV2Wireframe.FilterButton>
      <VeltCommentsSidebarV2Wireframe.FilterButton.AppliedIcon />
    </VeltCommentsSidebarV2Wireframe.FilterButton>
    <VeltCommentsSidebarV2Wireframe.FilterContainer />
    <VeltCommentsSidebarV2Wireframe.FullscreenButton />
    <VeltCommentsSidebarV2Wireframe.FilterDropdown />
  </VeltCommentsSidebarV2Wireframe.Header>
  <VeltCommentsSidebarV2Wireframe.List>
    <VeltCommentsSidebarV2Wireframe.ListGroupHeader>
      <VeltCommentsSidebarV2Wireframe.ListGroupHeader.Label />
      <VeltCommentsSidebarV2Wireframe.ListGroupHeader.Count />
      <VeltCommentsSidebarV2Wireframe.ListGroupHeader.Chevron />
      <VeltCommentsSidebarV2Wireframe.ListGroupHeader.Separator />
    </VeltCommentsSidebarV2Wireframe.ListGroupHeader>
  </VeltCommentsSidebarV2Wireframe.List>
</VeltWireframe>
```

```html
<!-- HTML / Other Frameworks — matching velt-comments-sidebar-*-v2-wireframe tags -->
<velt-wireframe style="display:none;">
  <velt-comments-sidebar-header-v2-wireframe>
    <velt-comments-sidebar-close-button-v2-wireframe></velt-comments-sidebar-close-button-v2-wireframe>
    <velt-comments-sidebar-search-v2-wireframe>
      <velt-comments-sidebar-search-v2-icon-wireframe></velt-comments-sidebar-search-v2-icon-wireframe>
      <velt-comments-sidebar-search-v2-input-wireframe></velt-comments-sidebar-search-v2-input-wireframe>
    </velt-comments-sidebar-search-v2-wireframe>
    <velt-comments-sidebar-filter-button-v2-wireframe>
      <velt-comments-sidebar-filter-button-v2-applied-icon-wireframe></velt-comments-sidebar-filter-button-v2-applied-icon-wireframe>
    </velt-comments-sidebar-filter-button-v2-wireframe>
    <velt-comments-sidebar-filter-container-v2-wireframe></velt-comments-sidebar-filter-container-v2-wireframe>
    <velt-comments-sidebar-fullscreen-button-v2-wireframe></velt-comments-sidebar-fullscreen-button-v2-wireframe>
    <velt-comments-sidebar-filter-dropdown-v2-wireframe></velt-comments-sidebar-filter-dropdown-v2-wireframe>
  </velt-comments-sidebar-header-v2-wireframe>
  <velt-comments-sidebar-list-v2-wireframe>
    <velt-comments-sidebar-list-group-header-v2-wireframe>
      <velt-comments-sidebar-list-group-header-v2-label-wireframe></velt-comments-sidebar-list-group-header-v2-label-wireframe>
      <velt-comments-sidebar-list-group-header-v2-count-wireframe></velt-comments-sidebar-list-group-header-v2-count-wireframe>
      <velt-comments-sidebar-list-group-header-v2-chevron-wireframe></velt-comments-sidebar-list-group-header-v2-chevron-wireframe>
      <velt-comments-sidebar-list-group-header-v2-separator-wireframe></velt-comments-sidebar-list-group-header-v2-separator-wireframe>
    </velt-comments-sidebar-list-group-header-v2-wireframe>
  </velt-comments-sidebar-list-v2-wireframe>
</velt-wireframe>
```

**For HTML:**

```html
<velt-comment-dialog-wireframe>
  <velt-comment-dialog-wireframe-header>
    <velt-comment-dialog-wireframe-status></velt-comment-dialog-wireframe-status>
  </velt-comment-dialog-wireframe-header>
</velt-comment-dialog-wireframe>
```

**Wireframe Data Variables (v5.0.2-beta.11+):**

Two shorthand variables are now available inside `<velt-data field="...">` expressions within wireframe templates:

| Variable | Resolves To | Notes |
|----------|-------------|-------|
| `annotations` | `componentConfigSignal.data.annotations` | Supports nested access, e.g. `field="annotations.0.annotationId"` |
| `allAnnotations` | `componentConfigSignal.data.allAnnotations` | All annotations regardless of current filter context |

These variables are useful for list-level UIs such as Inline Comments Section wireframes where you need to iterate over or reference annotation data directly.

```jsx
// React — reference annotation data via the annotations shorthand variable
// inside a wireframe template for a list-level component (e.g., Inline Comments Section)
<VeltWireframe>
  {/* annotations.0.annotationId resolves the first annotation's ID */}
  <velt-data field="annotations.0.annotationId" />

  {/* allAnnotations gives access to all annotations regardless of filter state */}
  <velt-data field="allAnnotations" />
</VeltWireframe>
```

```html
<!-- HTML — same shorthand variables work inside velt-data field expressions -->
<velt-wireframe style="display:none;">
  <velt-data field="annotations.0.annotationId"></velt-data>
  <velt-data field="allAnnotations"></velt-data>
</velt-wireframe>
```

**Thread Card Message — ShowMore / ShowLess Wireframe Primitives (v5.0.2-beta.18+):**

When `messageTruncation` is enabled (on `VeltInlineCommentsSection`, or via `messageTruncation` / `messageTruncationLines` on `VeltCommentDialog`-rendering surfaces), the expand/collapse controls are full wireframe primitives. They live in the comment-dialog thread-card message hierarchy because truncation is implemented at the message level, and the inline-comments section internally renders comment-dialog thread cards.

Wireframes (use inside `VeltWireframe` / `<velt-wireframe>`):

| React | HTML |
|---|---|
| `VeltCommentDialogWireframe.ThreadCard.Message.ShowMore` | `velt-comment-dialog-thread-card-message-show-more-wireframe` |
| `VeltCommentDialogWireframe.ThreadCard.Message.ShowLess` | `velt-comment-dialog-thread-card-message-show-less-wireframe` |

Equivalent standalone primitives (use directly without a wireframe wrapper):

| React | HTML |
|---|---|
| `VeltCommentDialogThreadCardMessageShowMore` | `velt-comment-dialog-thread-card-message-show-more` |
| `VeltCommentDialogThreadCardMessageShowLess` | `velt-comment-dialog-thread-card-message-show-less` |

These controls only render when a message exceeds the `messageTruncationLines` threshold. Both accept the standard Common Inputs props/attributes — no message-specific configuration is required; the primitives bind to the iterating thread card automatically.

**Correct (React / Next.js — custom ShowMore / ShowLess inside a wireframe):**

```jsx
<VeltWireframe>
  <VeltCommentDialogWireframe.ThreadCard.Message.ShowMore />
  <VeltCommentDialogWireframe.ThreadCard.Message.ShowLess />
</VeltWireframe>
```

**Correct (Other Frameworks — custom ShowMore / ShowLess inside a wireframe):**

```html
<velt-wireframe>
  <velt-comment-dialog-thread-card-message-show-more-wireframe>
    <!-- custom Show more content -->
  </velt-comment-dialog-thread-card-message-show-more-wireframe>
  <velt-comment-dialog-thread-card-message-show-less-wireframe>
    <!-- custom Show less content -->
  </velt-comment-dialog-thread-card-message-show-less-wireframe>
</velt-wireframe>
```

**Verification Checklist:**
- [ ] Correct wireframe component imported
- [ ] Proper nesting of child components
- [ ] Framework naming convention followed
- [ ] Required subcomponents included
- [ ] When accessing annotation data in wireframe templates, use `annotations` or `allAnnotations` shorthand variables (v5.0.2-beta.11+) instead of long-form signal paths
- [ ] V2 sidebar header compositions use `Search` / `FilterButton` / `FilterContainer` / `FullscreenButton` / `FilterDropdown` — `MinimalActionsDropdown` and its descendants are no longer in the catalog
- [ ] V2 sidebar list compositions place `ListGroupHeader` (+ `Label`, `Count`, `Chevron`, `Separator`) inside `List`

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog-structure - Dialog wireframe
- https://docs.velt.dev/ui-customization/features/async/comments/comment-sidebar-structure - Sidebar wireframe
- https://docs.velt.dev/ui-customization/features/async/comments/comment-sidebar-structure-v2 - V2 Sidebar wireframe structure (Search / FilterButton / FilterContainer / FullscreenButton / ListGroupHeader)
