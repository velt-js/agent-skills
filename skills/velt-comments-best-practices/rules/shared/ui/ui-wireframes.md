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
- `Header` - Dialog header container
- `Status` - Status selector
- `Priority` - Priority selector
- `Options` - Options menu
- `Body` - Comment content area
- `Composer` - Input composer

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
