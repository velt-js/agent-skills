---
title: Use Sidebar Button to Toggle Comments Panel
impact: MEDIUM-HIGH
impactDescription: User control for showing/hiding comments sidebar
tags: sidebar-button, veltsidebarbutton, toggle, ui-control, commentCountType, sidebarButtonCountType, floatingMode, VeltSidebarButtonWireframe
---

## Use Sidebar Button to Toggle Comments Panel

`VeltSidebarButton` opens and closes the Comments Sidebar. Place it in your toolbar. To change its look, use the `VeltSidebarButtonWireframe` slots (`Icon`, `CommentsCount`, `UnreadIcon`); arbitrary children placed inside `<VeltSidebarButton>` are not a documented customization path.

**Incorrect (custom children instead of a wireframe):**

```jsx
<VeltSidebarButton>
  <button className="my-custom-button">Comments</button>
</VeltSidebarButton>
```

**Correct (basic setup):**

```jsx
import {
  VeltProvider,
  VeltComments,
  VeltCommentsSidebar,
  VeltSidebarButton,
  VeltCommentTool,
} from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />
      <VeltCommentsSidebar />
      <nav className="toolbar">
        <VeltCommentTool />
        <VeltSidebarButton />
      </nav>
    </VeltProvider>
  );
}
```

```html
<velt-comments></velt-comments>
<velt-comments-sidebar></velt-comments-sidebar>
<velt-sidebar-button></velt-sidebar-button>
```

**Badge count and floating mode:**

```jsx
// 'total' (default) | 'unread'
<VeltSidebarButton commentCountType="unread" />

// 'default' (open + in-progress) | 'filter' (the sidebar's filtered list, including 0)
<VeltSidebarButton sidebarButtonCountType="filter" />

// Overlay sidebar anchored to the button; do not render the sidebar separately
<VeltSidebarButton floatingMode={true} />
```

```html
<velt-sidebar-button comment-count-type="unread"></velt-sidebar-button>
```

Programmatic alternative for the badge source: `commentElement.setSidebarButtonCountType('filter')`. When a `setCommentSidebarData()` id set is active, the filter badge counts that set.

**Custom appearance (wireframe):**

```jsx
<VeltWireframe>
  <VeltSidebarButtonWireframe>
    <VeltSidebarButtonWireframe.Icon />
    <VeltSidebarButtonWireframe.CommentsCount />
    <VeltSidebarButtonWireframe.UnreadIcon />
  </VeltSidebarButtonWireframe>
</VeltWireframe>
```

```html
<velt-wireframe style="display:none;">
  <velt-sidebar-button-wireframe>
    <velt-sidebar-button-icon-wireframe></velt-sidebar-button-icon-wireframe>
    <velt-sidebar-button-comments-count-wireframe></velt-sidebar-button-comments-count-wireframe>
    <velt-sidebar-button-unread-icon-wireframe></velt-sidebar-button-unread-icon-wireframe>
  </velt-sidebar-button-wireframe>
</velt-wireframe>
```

Clicks emit `sidebarButtonClicked` on the comment element (see `permissions-comment-interaction-events.md`).

**Verification Checklist:**
- [ ] A sidebar (`VeltCommentsSidebar` or `VeltCommentsSidebarV2`) is mounted, unless `floatingMode` is on
- [ ] Button customization uses `VeltSidebarButtonWireframe`, not custom children
- [ ] Badge source chosen deliberately (`commentCountType` / `sidebarButtonCountType`)

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments-sidebar/v1/setup - Setup with sidebar button
- https://docs.velt.dev/async-collaboration/comments-sidebar/v1/customize-behavior#floatingmode - floatingMode
- https://docs.velt.dev/async-collaboration/comments-sidebar/v1/customize-behavior#commentcounttype - commentCountType
- https://docs.velt.dev/ui-customization/features/async/comments/comment-sidebar-button/wireframes - Sidebar button wireframes
