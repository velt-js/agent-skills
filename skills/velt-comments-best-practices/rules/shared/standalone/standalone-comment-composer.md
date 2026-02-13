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

**Composer Props (v4.7.3+):**

```jsx
<VeltCommentComposer
  placeholder="Leave a comment..."       // Custom placeholder text (v4.7.3+)
  readOnly={false}                        // Disable input (v4.7.9+)
  targetComposerElementId="my-composer"   // Associate with specific element (v4.7.4+)
/>
```

**Note:** The prop `targetElementId` was renamed to `targetComposerElementId` in v4.7.4. Use `targetComposerElementId` for all new implementations.

**Programmatic Submission (v4.7.4+):**

```jsx
import { useVeltClient } from '@veltdev/react';

function ComposerControls() {
  const { client } = useVeltClient();

  const submit = () => {
    const commentElement = client.getCommentElement();
    // Submit comment from a specific composer
    commentElement.submitComment({ targetComposerElementId: 'my-composer' });
  };

  const clear = () => {
    const commentElement = client.getCommentElement();
    commentElement.clearComposer();
  };

  return (
    <>
      <button onClick={submit}>Submit</button>
      <button onClick={clear}>Clear</button>
    </>
  );
}
```

**Listening for Text Changes (v4.7.3+):**

```jsx
<VeltComments
  onComposerTextChange={(event) => {
    // event includes draft annotation and targetComposerElementId
    console.log('Text changed:', event);
  }}
/>
```

**For HTML:**

```html
<velt-comment-composer
  placeholder="Leave a comment..."
  target-composer-element-id="my-composer"
></velt-comment-composer>
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
- [ ] Use `targetComposerElementId` (not `targetElementId`) for element association
- [ ] Combined with Thread/Pin as needed

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/standalone-components/comment-composer/overview - Overview
- https://docs.velt.dev/async-collaboration/comments/standalone-components/comment-composer/setup - Setup
