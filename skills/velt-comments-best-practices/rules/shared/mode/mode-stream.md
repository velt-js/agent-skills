---
title: Use Stream Mode for Google Docs-Style Comments
impact: HIGH
impactDescription: Comments appear in a side column synchronized with scroll position
tags: stream, google-docs, sidebar-stream, text-selection, scroll-sync
---

## Use Stream Mode for Google Docs-Style Comments

Stream mode renders comment dialogs in a column on the right side, similar to Google Docs. Comments auto-position and scroll with content. Works well combined with Text mode.

**Incorrect (missing streamMode and container reference):**

```jsx
// Comments won't appear in stream layout
<VeltComments />
<div className="document">Content</div>
```

**Correct (with streamMode and container ID):**

```jsx
import { VeltProvider, VeltComments } from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <div id="scrolling-container-id" style={{ overflow: 'auto', height: '100vh' }}>
        {/* This element is scrollable */}
        <div className="target-content">
          {/* This element contains content to be commented */}
          <p>Your document content here...</p>
        </div>

        <VeltComments
          streamMode={true}
          streamViewContainerId="scrolling-container-id"
        />
      </div>
    </VeltProvider>
  );
}
```

**Key Requirements:**
1. `streamMode={true}` enables stream layout
2. `streamViewContainerId` must match the scrolling container's ID
3. `VeltComments` should be inside the scrolling container
4. Text mode is enabled by default (works well with Stream)

**For HTML:**

```html
<div id="scrolling-container-id">
  <div class="target-content">
    <!-- Your document content -->
  </div>

  <velt-comments
    stream-mode="true"
    stream-view-container-id="scrolling-container-id"
  ></velt-comments>
</div>
```

**How Stream Mode Works:**
1. User selects text (Text mode enabled by default)
2. Comment tool appears near selection
3. User clicks to add comment
4. Comment dialog appears in right-side stream
5. Stream scrolls with document content

**Verification Checklist:**
- [ ] `streamMode={true}` is set
- [ ] `streamViewContainerId` matches container ID
- [ ] Container element is scrollable
- [ ] VeltComments is inside the scrolling container

**Source Pointers:**
- `/docs/async-collaboration/comments/setup/stream.mdx` - Complete setup
