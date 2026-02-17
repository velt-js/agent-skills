---
title: Use Page Mode for Page-Level Comments
impact: HIGH
impactDescription: Comments at page level via sidebar, not attached to elements
tags: page-mode, sidebar, page-comments, veltcommentssidebar
---

## Use Page Mode for Page-Level Comments

Page mode enables users to leave comments at the page level through the Comments Sidebar, rather than attaching them to specific elements. Useful for general page feedback.

**Incorrect (missing pageMode on sidebar):**

```jsx
// Page comments won't appear at sidebar bottom
<VeltComments />
<VeltCommentsSidebar />
```

**Correct (with pageMode enabled):**

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
      <VeltCommentsSidebar pageMode={true} />

      <div className="toolbar">
        <VeltSidebarButton />
      </div>
    </VeltProvider>
  );
}
```

**Key Components:**
- `VeltComments` - Enables comments feature
- `VeltCommentsSidebar` - The sidebar panel (with `pageMode={true}`)
- `VeltSidebarButton` - Toggles the sidebar open/closed

**How Page Mode Works:**
1. User clicks VeltSidebarButton to open sidebar
2. Comment composer appears at bottom of sidebar
3. User types page-level comment
4. Comment is associated with the page, not a specific element

**For HTML:**

```html
<velt-comments></velt-comments>
<velt-comments-sidebar page-mode="true"></velt-comments-sidebar>

<div class="toolbar">
  <velt-sidebar-button></velt-sidebar-button>
</div>
```

**Programmatic Page Mode Composer Control (v4.7.7+):**

`setContextInPageModeComposer()` accepts a `PageModeComposerConfig` object. By default, context is cleared after each submission (`clearContext: true`). Set `clearContext: false` to preserve context data across multiple submissions.

```tsx
// PageModeComposerConfig interface
// {
//   context?: { [key: string]: any } | null;
//   targetElementId?: string | null;
//   clearContext?: boolean;  // defaults to true
// }
```

```jsx
import { useVeltClient } from '@veltdev/react';

function PageModeControls() {
  const { client } = useVeltClient();

  const openComposerWithContext = () => {
    const commentElement = client.getCommentElement();
    // Set context data before opening composer (context cleared after submission by default)
    commentElement.setContextInPageModeComposer({
      context: { section: 'header', category: 'feedback' },
      targetElementId: 'header-section',
    });
    // Focus the page mode composer
    commentElement.focusPageModeComposer();
  };

  const openComposerPreservingContext = () => {
    const commentElement = client.getCommentElement();
    // Set clearContext: false to preserve context data across submissions
    commentElement.setContextInPageModeComposer({
      context: { documentId: '123', section: 'intro' },
      targetElementId: 'my-element',
      clearContext: false,
    });
    commentElement.focusPageModeComposer();
  };

  const handleClearContext = () => {
    const commentElement = client.getCommentElement();
    commentElement.clearPageModeComposerContext();
  };

  return (
    <>
      <button onClick={openComposerWithContext}>Add Page Comment</button>
      <button onClick={openComposerPreservingContext}>Add Comment (Keep Context)</button>
      <button onClick={handleClearContext}>Clear Context</button>
    </>
  );
}
```

**Verification Checklist:**
- [ ] VeltCommentsSidebar has `pageMode={true}`
- [ ] VeltSidebarButton is placed in UI
- [ ] Sidebar shows comment composer at bottom
- [ ] Comments appear without element association

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/page - Complete setup
