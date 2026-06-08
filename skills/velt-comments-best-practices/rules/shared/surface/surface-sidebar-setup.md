---
title: Comments Sidebar Setup, Modes, and Configuration
impact: MEDIUM-HIGH
impactDescription: Sidebar is the primary surface for viewing, filtering, and navigating all comments — incorrect setup leads to missing sidebar or broken navigation
tags: sidebar, setup, VeltCommentsSidebar, VeltSidebarButton, embed-mode, floating-mode, page-mode, focused-thread, V2, filterConfig, groupConfig, sortOrder, fullScreen, forceClose, sidebar-props
---

## Comments Sidebar Setup, Modes, and Configuration

The comments sidebar has multiple display modes, each with specific component requirements. Choosing the wrong mode or omitting a required component results in a broken or invisible sidebar.

**Step 1 — Import and place components:**

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
      <div className="toolbar">
        <VeltSidebarButton />
        <VeltCommentTool />
      </div>
    </VeltProvider>
  );
}
```

**Step 2 — Choose a display mode:**

| Mode | Prop | Behavior |
|------|------|----------|
| Default | _(none)_ | Slides in from the right edge |
| Embed | `embedMode={true}` | Fills its parent container; no close button — you manage open/close |
| Floating | `floatingMode={true}` on **VeltSidebarButton** | Overlay panel over the button. Do NOT render `<VeltCommentsSidebar>` separately |
| Page Mode | `pageMode={true}` | Adds a composer for page-level comments (not pinned to an element) |
| Focused Thread | `focusedThreadMode={true}` | Clicking a comment expands it in-place; adds a navigation button |
| Full Screen | `fullScreen={true}` | Expands to fill the viewport (default mode only, not floating/embed) |

**Embed mode:**

```jsx
<div className="sidebar-container">
  <VeltCommentsSidebar embedMode={true} />
</div>
```

**Floating mode (on the button, NOT the sidebar):**

```jsx
<VeltSidebarButton floatingMode={true} />
```

**Focused thread mode with navigation callback:**

```jsx
<VeltCommentsSidebar
  focusedThreadMode={true}
  openAnnotationInFocusMode={true}
  onCommentNavigationButtonClick={(event) => {
    const { pageId } = event.location;
    navigateToPage(pageId);
  }}
/>
```

**Step 3 — Configure filters, grouping, and sort:**

```jsx
const filterConfig = {
  location: { enable: true, name: 'Pages', enableGrouping: true, multiSelection: true },
  people: { enable: true, name: 'Author', enableGrouping: true },
  priority: { enable: true, name: 'Priority' },
  status: { enable: true, name: 'Status' },
  category: { enable: true, name: 'Category', enableGrouping: true },
};

<VeltCommentsSidebar
  filterConfig={filterConfig}
  groupConfig={{ enable: true, name: 'Group By' }}
  sortOrder="desc"
  sortBy="lastUpdated"
  filterPanelLayout="menu"
  position="right"
/>
```

**Step 4 — Handle navigation events:**

```jsx
<VeltCommentsSidebar
  onCommentClick={(event) => {
    const { pageId } = event.location;
    navigateToPage(pageId);
  }}
/>
```

**Programmatic open/close:**

```jsx
const commentElement = client.getCommentElement();
commentElement.openCommentSidebar();
commentElement.closeCommentSidebar();
commentElement.toggleCommentSidebar();
```

**Additional props reference:**

| Prop | Default | Description |
|------|---------|-------------|
| `position` | `'right'` | `'left'` or `'right'` |
| `readOnly` | `false` | Prevent editing in sidebar |
| `currentLocationSuffix` | `false` | Adds "(this page)" to matching group |
| `excludeLocationIds` | `[]` | Hide comments from specific locations |
| `filterGhostCommentsInSidebar` | `false` | Hide ghost/orphan comments |
| `dialogSelection` | `true` | When false, sidebar clicks emit event instead of opening dialog inline |
| `expandOnSelection` | `true` | Auto-expand dialogs on selection |
| `forceClose` | `false` | Force close on outside click even when opened via API |
| `searchPlaceholder` | - | Custom search input placeholder text |
| `commentPlaceholder` | - | Custom dialog composer placeholder |
| `replyPlaceholder` | - | Custom reply input placeholder |
| `pageModePlaceholder` | - | Custom page mode composer placeholder |
| `commentCountType` | `'total'` | `'total'` or `'unread'` on sidebar button |
| `sidebarButtonCountType` | `'default'` | `'default'` or `'filter'` |
| `context` | - | Custom context metadata for page mode comments |
| `defaultMinimalFilter` | `'all'` | `'all'` \| `'read'` \| `'unread'` \| `'resolved'` \| `'open'` \| `'reset'` \| `null` |
| `systemFiltersOperator` | `'and'` | `'and'` or `'or'` for combining system filters |

**V2 Sidebar (primitive-based):**

```jsx
import { VeltCommentsSidebarV2 } from '@veltdev/react';

<VeltCommentsSidebarV2 />
// or
<VeltCommentsSidebar version="2" />
```

V2 replaces the per-category filter panel with a unified `FilterDropdown`. For V2 wireframe customization, see the Comment Sidebar V2 Structure docs.
