---
title: Place Velt UI Components Correctly
impact: MEDIUM
impactDescription: Correct placement ensures components render and function properly
tags: placement, components, ui, veltcomments, veltpresence
---

## Place Velt UI Components Correctly

Velt UI components must be placed inside VeltProvider and after user authentication. Component placement affects visibility and functionality.

**Incorrect (outside VeltProvider):**

```jsx
// VeltComments outside provider - won't work
import { VeltProvider, VeltComments } from "@veltdev/react";

export default function App() {
  return (
    <div>
      <VeltComments />  {/* Error: Not inside VeltProvider */}
      <VeltProvider apiKey="KEY">
        <Content />
      </VeltProvider>
    </div>
  );
}
```

**Incorrect (in same file as VeltProvider without separation):**

```jsx
// Calling identify in same component as VeltProvider
"use client";
import { VeltProvider, useIdentify, VeltComments } from "@veltdev/react";

export default function App() {
  useIdentify(user);  // Won't work - provider not mounted yet

  return (
    <VeltProvider apiKey="KEY">
      <VeltComments />
    </VeltProvider>
  );
}
```

**Correct (components in VeltCollaboration wrapper):**

```jsx
// app/page.tsx
"use client";
import { VeltProvider } from "@veltdev/react";
import { VeltCollaboration } from "@/components/velt/VeltCollaboration";
import { useVeltAuthProvider } from "@/components/velt/VeltInitializeUser";

export default function App() {
  const { authProvider } = useVeltAuthProvider();

  if (!authProvider) return <div>Loading...</div>;

  return (
    <VeltProvider apiKey="KEY" authProvider={authProvider}>
      {/* Velt components inside provider, in child component */}
      <VeltCollaboration />
      <MainContent />
    </VeltProvider>
  );
}
```

```jsx
// components/velt/VeltCollaboration.tsx
"use client";
import { VeltComments, VeltCommentsSidebar, VeltPresence } from "@veltdev/react";
import VeltInitializeDocument from "./VeltInitializeDocument";

export function VeltCollaboration() {
  return (
    <>
      <VeltInitializeDocument />  {/* Sets document ID */}
      <VeltComments />            {/* Comment pins on content */}
      <VeltCommentsSidebar />     {/* Sidebar panel */}
      <VeltPresence />            {/* User avatars */}
    </>
  );
}
```

**Component Placement Guide:**

| Component | Placement | Purpose |
|-----------|-----------|---------|
| VeltComments | Near content area | Enables commenting on page elements |
| VeltCommentsSidebar | App layout (fixed position) | Shows all comments in sidebar |
| VeltPresence | Header or toolbar | Shows active users |
| VeltCommentTool | Toolbar | Button to add comments |
| VeltCursor | Near VeltComments | Shows other users' cursors |

**Layout Example:**

```jsx
function AppLayout() {
  return (
    <div className="app-layout">
      {/* Header with presence */}
      <header className="app-header">
        <Logo />
        <Navigation />
        <VeltPresence />  {/* Shows user avatars in header */}
      </header>

      {/* Main content area with comments */}
      <main className="app-main">
        <VeltComments />  {/* Enables commenting on main content */}
        <PageContent />
      </main>

      {/* Fixed sidebar for comment list */}
      <aside className="app-sidebar">
        <VeltCommentsSidebar />
      </aside>
    </div>
  );
}
```

**Conditional Component Rendering:**

```jsx
function VeltCollaboration({ showSidebar = true, showPresence = true }) {
  return (
    <>
      <VeltInitializeDocument />
      <VeltComments />

      {showSidebar && <VeltCommentsSidebar />}
      {showPresence && <VeltPresence />}
    </>
  );
}

// Usage - editor page with all features
<VeltCollaboration showSidebar={true} showPresence={true} />

// Usage - read-only page with just comments
<VeltCollaboration showSidebar={false} showPresence={false} />
```

**Z-Index Considerations:**

Velt components use z-index for proper layering. If components aren't visible:

```css
/* Ensure Velt components are above your content */
.velt-comments-sidebar {
  z-index: 1000;
}

/* Or use Velt's CSS variables */
:root {
  --velt-sidebar-z-index: 1000;
}
```

**Verification:**
- [ ] All Velt components are inside VeltProvider
- [ ] Velt components are in child components (not same file as VeltProvider)
- [ ] VeltComments is near the content users will comment on
- [ ] VeltCommentsSidebar is in a fixed or sidebar position
- [ ] Components are visible (check z-index if not)

**Source Pointers:**
- `/sample-apps/apps/react/comments/tables/tanstack/single-tool/components/velt/VeltCollaboration.tsx` - Component placement pattern
- `/docs/get-started/quickstart.mdx` - "Notes" section on child component requirements
