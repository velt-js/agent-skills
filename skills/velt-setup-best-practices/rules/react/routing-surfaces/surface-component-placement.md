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

**Incorrect (auth hooks in same component as VeltProvider):** Do not call auth hooks or document setup hooks in the same component that renders VeltProvider: the provider isn't mounted yet when those hooks run. Use child components for authentication (via `authProvider` prop) and document setup.

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

**Visibility:** if a Velt component renders but is hidden behind your layout, check stacking context and `z-index` on your own containers first. To restyle Velt components, follow the UI customization setup (CSS variables cross the shadow DOM; class selectors need `shadowDom={false}` or `client.injectCustomCss()`).

**Verification:**
- [ ] All Velt components are inside VeltProvider
- [ ] Velt components are in child components (not same file as VeltProvider)
- [ ] VeltComments is near the content users will comment on
- [ ] VeltCommentsSidebar is in a fixed or sidebar position
- [ ] Components are visible (check your own containers' stacking context if not)

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 7: Install Velt Feature Components; Notes section on child component requirements
- `https://docs.velt.dev/ui-customization/setup` - "Choose your shadow DOM strategy"
