---
title: Use Sidebar Button to Toggle Comments Panel
impact: MEDIUM-HIGH
impactDescription: User control for showing/hiding comments sidebar
tags: sidebar-button, veltsidebarbutton, toggle, ui-control
---

## Use Sidebar Button to Toggle Comments Panel

VeltSidebarButton provides a button to open and close the Comments Sidebar. Place it in your toolbar or navigation for easy access.

**Basic Setup:**

```jsx
import { VeltSidebarButton } from '@veltdev/react';

<div className="toolbar">
  <VeltSidebarButton />
</div>
```

**Custom Button Appearance:**

```jsx
<VeltSidebarButton>
  <button className="my-custom-button">
    Comments
  </button>
</VeltSidebarButton>
```

**With Icon:**

```jsx
<VeltSidebarButton>
  <div className="sidebar-btn">
    <CommentIcon />
    <span>Comments</span>
  </div>
</VeltSidebarButton>
```

**For HTML:**

```html
<velt-sidebar-button>
  <button class="my-custom-btn">
    Comments
  </button>
</velt-sidebar-button>
```

**Complete Example:**

```jsx
import {
  VeltProvider,
  VeltComments,
  VeltCommentsSidebar,
  VeltSidebarButton,
  VeltCommentTool
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

      <main>
        {/* App content */}
      </main>
    </VeltProvider>
  );
}
```

**Verification Checklist:**
- [ ] VeltCommentsSidebar is in the app
- [ ] VeltSidebarButton placed in accessible location
- [ ] Button toggles sidebar visibility
- [ ] Custom content renders inside button if provided

**Source Pointers:**
- `/docs/async-collaboration/comments-sidebar/setup.mdx` - Setup with sidebar button
- `/docs/async-collaboration/comments/setup/page.mdx` - Page mode example
