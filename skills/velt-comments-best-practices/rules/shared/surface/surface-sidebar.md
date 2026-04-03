---
title: Use Comments Sidebar for Comment Navigation
impact: MEDIUM-HIGH
impactDescription: Central panel for viewing, filtering, and navigating all comments
tags: sidebar, veltcommentssidebar, navigation, filter, embed-mode
---

## Use Comments Sidebar for Comment Navigation

VeltCommentsSidebar provides a panel displaying all comments with search, filter, and navigation capabilities. Essential for any non-trivial commenting implementation.

**Basic Setup:**

```jsx
import {
  VeltProvider,
  VeltComments,
  VeltCommentsSidebar,
  VeltSidebarButton
} from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />
      <VeltCommentsSidebar />

      <div className="toolbar">
        <VeltSidebarButton />
      </div>
    </VeltProvider>
  );
}
```

**Embed Mode (in custom container):**

```jsx
<div className="my-sidebar-container">
  <VeltCommentsSidebar embedMode={true} />
</div>
```

**Page Mode (page-level comments):**

```jsx
<VeltCommentsSidebar pageMode={true} />
```

**Disable Comment Grouping:**

```jsx
<VeltCommentsSidebar
  groupConfig={{ enable: false }}
/>
```

**Handle Comment Clicks:**

```jsx
<VeltCommentsSidebar
  onCommentClick={(event) => {
    const { location, documentId, targetElementId, context } = event;
    // Navigate to comment location
    // e.g., scroll to element, seek video, etc.
  }}
/>
```

**VeltCommentsSidebar Props:**

| Prop | Type | Description |
|------|------|-------------|
| `embedMode` | boolean | Embed in custom container |
| `pageMode` | boolean | Enable page-level comments |
| `groupConfig` | object | Configure comment grouping |
| `onCommentClick` | function | Handle comment selection |

> **Breaking change (v5.0.2-beta.13):** The `version` prop has been removed from `VeltCommentsSidebar`. The `version="2"` opt-in pattern is no longer valid. Use `VeltCommentsSidebarV2` / `velt-comments-sidebar-v2` directly instead.

**V1 defers to V2 when both are mounted (v5.0.2-beta.13+):**

<!-- TODO (v5.0.2-beta.13): Verify exact rendering behavior when both are present — whether V1 renders nothing, hides itself, or suppresses open. Release note states V1 "defers to V2" but does not specify the internal mechanism. -->

When `velt-comments-sidebar` (V1) and `velt-comments-sidebar-v2` (V2) are both present in the DOM simultaneously, V1 defers to V2 and will not open. `setSidebarVisibility` and `toggleSidebarVisibility` APIs also detect the V2 element. Do not mount both components at the same time; use only V2 when V2 behavior is required.

```jsx
// Before (no longer valid — version prop removed):
<VeltCommentsSidebar version="2" />

// After — use VeltCommentsSidebarV2 directly:
<VeltCommentsSidebarV2 />
```

**For HTML:**

```html
<velt-comments-sidebar
  embed-mode="true"
  page-mode="false"
>
</velt-comments-sidebar>

<velt-sidebar-button></velt-sidebar-button>
```

**Complete Example with Video Player:**

```jsx
<VeltCommentsSidebar
  embedMode={true}
  onCommentClick={(event) => {
    const { location } = event;
    if (location?.currentMediaPosition !== undefined) {
      // Seek video to timestamp
      videoRef.current.currentTime = location.currentMediaPosition;
      // Set location to show comments
      client.setLocations([location]);
    }
  }}
/>
```

**Verification Checklist:**
- [ ] VeltCommentsSidebar added to app
- [ ] VeltSidebarButton provides toggle
- [ ] embedMode set if using custom container
- [ ] onCommentClick handles navigation

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments-sidebar/overview - Overview
- https://docs.velt.dev/async-collaboration/comments-sidebar/setup - Setup
