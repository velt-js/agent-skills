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

**Correct (with VeltCommentTool):**

```jsx
import { VeltProvider, VeltComments, VeltCommentTool } from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />

      <div className="toolbar">
        <VeltCommentTool />
      </div>
    </VeltProvider>
  );
}
```

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
- [ ] VeltComments is added to app root
- [ ] VeltCommentTool is placed in accessible location
- [ ] Clicking tool changes cursor to comment pin
- [ ] Clicking page creates comment at that location

**Source Pointers:**
- `/docs/async-collaboration/comments/setup/freestyle.mdx` - Complete setup
- `/sample-apps/apps/react/comments/website-builder/freestyle-comments/freestyle-comments-demo/` - Working demo
