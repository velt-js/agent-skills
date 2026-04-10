---
title: Use Freestyle Mode for Pin-Anywhere Comments
impact: HIGH
impactDescription: Default mode - enables clicking anywhere to pin comments
tags: freestyle, pin, area-comments, comment-tool, click-anywhere
---

## Use Freestyle Mode for Pin-Anywhere Comments

Freestyle mode allows users to click anywhere on the page to pin comments. This is the default comment mode and works well for general page annotation or design feedback.

**Incorrect (missing VeltCommentTool):**

```jsx
// Users can't initiate comment mode without the tool
import { VeltComments } from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />
      {/* No way to start commenting */}
    </VeltProvider>
  );
}
```

**Correct (with VeltCommentTool, sidebar, and recommended props):**

```jsx
import { VeltProvider, VeltComments, VeltCommentTool, VeltCommentsSidebar, VeltSidebarButton } from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments
        shadowDom={false}
        textMode={false}
        allowedElementIds={['main-content']}
        commentToNearestAllowedElement={true}
      />
      <VeltCommentsSidebar />

      <div className="toolbar">
        <VeltCommentTool />
        <VeltSidebarButton />
      </div>

      <main id="main-content">
        {/* Comments can only be pinned inside this element */}
        <YourContent />
      </main>
    </VeltProvider>
  );
}
```

**Why these props matter:**
- `shadowDom={false}` — lets your CSS styles apply to Velt comment components (nearly always needed)
- `textMode={false}` — disables the default text selection comment mode, which conflicts with freestyle pin mode
- `allowedElementIds` — restricts where comment pins can be placed. Without this, users can pin comments on headers, navbars, and other UI elements you don't want annotated
- `commentToNearestAllowedElement={true}` — if a user clicks near the edge of the allowed area, the comment attaches to the nearest allowed element instead of failing

**How Freestyle Works:**
1. User clicks the `VeltCommentTool` button
2. Cursor changes to a comment pin
3. User clicks anywhere on the page
4. Comment dialog appears at click location
5. Comment is attached to the clicked element

**For HTML:**

```html
<body>
  <velt-comments></velt-comments>

  <div class="toolbar">
    <velt-comment-tool></velt-comment-tool>
  </div>
</body>
```

**Custom Comment Tool Button:**

```jsx
<VeltCommentTool>
  <button slot="button">
    {/* Your custom button */}
    Add Comment
  </button>
</VeltCommentTool>
```

**Verification Checklist:**
- [ ] VeltComments is added with `shadowDom={false}` and `textMode={false}`
- [ ] VeltCommentTool is placed in accessible location (toolbar/header)
- [ ] VeltCommentsSidebar is included for viewing all comments
- [ ] VeltSidebarButton is available to toggle the sidebar
- [ ] `allowedElementIds` restricts commenting to the intended content area
- [ ] Clicking tool changes cursor to comment pin
- [ ] Clicking inside allowed area creates comment at that location

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/freestyle - Complete setup
