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
- `/docs/async-collaboration/comments-sidebar/overview.mdx` - Overview
- `/docs/async-collaboration/comments-sidebar/setup.mdx` - Setup
- `/sample-apps/apps/react/comments/tables/tanstack/comment-aggregation/` - Demo usage
