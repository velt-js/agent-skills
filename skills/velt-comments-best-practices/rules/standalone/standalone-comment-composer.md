---
title: Use Comment Composer for Custom Comment Input
impact: MEDIUM-HIGH
impactDescription: Add comment input anywhere in your application
tags: comment-composer, standalone, input, custom-ui, add-comment
---

## Use Comment Composer for Custom Comment Input

The Comment Standalone Composer lets you add comment input anywhere in your application. Combine with Comment Thread and Comment Pin for fully custom comment interfaces.

**When to Use Standalone Components:**

Standalone components (Pin, Thread, Composer) are recommended when:
- **You need direct API access** - Work with comment data programmatically
- **You have complex UI requirements** - 3D canvas, WebGL, custom rendering engines
- **Default components don't fit your layout** - Kanban boards, custom sidebars, split views
- **You need custom positioning logic** - Comments on non-DOM elements, virtual lists

**When to Use Comment Composer Specifically:**
- Building custom comment sidebars with your own layout
- Adding comment input in overlays/popovers/modals
- Creating inline comment forms in custom locations
- Custom comment creation flows (e.g., multi-step wizards)
- Combining with Thread and Pin for fully custom interfaces

**Implementation:**

```jsx
import {
  VeltProvider,
  VeltComments,
  VeltCommentComposer,
  useCommentAnnotations
} from '@veltdev/react';

function CustomCommentSidebar() {
  const commentAnnotations = useCommentAnnotations();

  return (
    <div className="custom-sidebar">
      {/* Composer for new comments */}
      <div className="new-comment-section">
        <h4>Add Comment</h4>
        <VeltCommentComposer />
      </div>

      {/* List existing comments */}
      <div className="comments-list">
        {commentAnnotations?.map((annotation) => (
          <div key={annotation.annotationId}>
            {/* Render comment content */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />
      <CustomCommentSidebar />
    </VeltProvider>
  );
}
```

**Combining with Other Standalone Components:**

```jsx
import {
  VeltCommentComposer,
  VeltCommentThread,
  VeltCommentPin
} from '@veltdev/react';

function FullCustomInterface() {
  const commentAnnotations = useCommentAnnotations();

  return (
    <div className="layout">
      {/* Main content area with pins */}
      <div className="content" data-velt-manual-comment-container="true">
        {commentAnnotations?.map((a) => (
          <div
            key={a.annotationId}
            style={{ position: 'absolute', left: a.context?.x, top: a.context?.y }}
          >
            <VeltCommentPin annotationId={a.annotationId} />
          </div>
        ))}
      </div>

      {/* Sidebar with composer and threads */}
      <div className="sidebar">
        <VeltCommentComposer />

        {commentAnnotations?.map((a) => (
          <VeltCommentThread key={a.annotationId} annotationId={a.annotationId} />
        ))}
      </div>
    </div>
  );
}
```

**For HTML:**

```html
<velt-comment-composer></velt-comment-composer>
```

**Integration Points:**

| Component | Purpose |
|-----------|---------|
| VeltCommentComposer | Input for creating new comments |
| VeltCommentThread | Display existing comment threads |
| VeltCommentPin | Position comment pins manually |
| useCommentAnnotations | Fetch comment data |

**Verification Checklist:**
- [ ] VeltComments added to app root
- [ ] VeltCommentComposer placed in desired location
- [ ] Combined with Thread/Pin as needed
- [ ] Comment creation works from composer

**Source Pointers:**
- `/docs/async-collaboration/comments/standalone-components/comment-composer/overview.mdx` - Overview
- `/docs/async-collaboration/comments/standalone-components/comment-composer/setup.mdx` - Setup
