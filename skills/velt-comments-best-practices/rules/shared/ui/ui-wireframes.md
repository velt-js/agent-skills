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

**For HTML:**

```html
<velt-comment-dialog-wireframe>
  <velt-comment-dialog-wireframe-header>
    <velt-comment-dialog-wireframe-status></velt-comment-dialog-wireframe-status>
  </velt-comment-dialog-wireframe-header>
</velt-comment-dialog-wireframe>
```

**Verification Checklist:**
- [ ] Correct wireframe component imported
- [ ] Proper nesting of child components
- [ ] Framework naming convention followed
- [ ] Required subcomponents included

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog-structure - Dialog wireframe
- https://docs.velt.dev/ui-customization/features/async/comments/comment-sidebar-structure - Sidebar wireframe
