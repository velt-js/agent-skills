---
title: Use Comment Thread to Render Existing Comments
impact: MEDIUM-HIGH
impactDescription: Render comment threads in custom locations like kanban boards
tags: comment-thread, standalone, render, kanban, custom-sidebar
---

## Use Comment Thread to Render Existing Comments

The Standalone Comment Thread component renders existing comment data in custom locations. Use this to build custom UIs like kanban boards or your own sidebar implementation.

**When to Use Standalone Components:**

Standalone components (Pin, Thread, Composer) are recommended when:
- **You need direct API access** - Work with comment data programmatically
- **You have complex UI requirements** - 3D canvas, WebGL, custom rendering engines
- **Default components don't fit your layout** - Kanban boards, custom sidebars, split views
- **You need custom positioning logic** - Comments on non-DOM elements, virtual lists

**When to Use Comment Thread Specifically:**
- **Kanban boards** - Display comment threads as cards in columns (see example below)
- Creating a custom comments sidebar
- Rendering comments in a custom layout (split views, panels)
- Displaying comments outside the default dialog
- Building task/issue tracking interfaces with threaded discussions

**Note:** This component only renders existing comments. It's a thin wrapper around the Comment Dialog component.

**Implementation:**

**1. Get Comment Annotations:**

```jsx
import { useCommentAnnotations } from '@veltdev/react';

const commentAnnotations = useCommentAnnotations();
```

**2. Render Comment Thread:**

```jsx
import { VeltCommentThread } from '@veltdev/react';

function CustomCommentList() {
  const commentAnnotations = useCommentAnnotations();

  return (
    <div className="custom-sidebar">
      {commentAnnotations?.map((annotation) => (
        <div key={annotation.annotationId} className="comment-card">
          <VeltCommentThread
            annotationId={annotation.annotationId}
          />
        </div>
      ))}
    </div>
  );
}
```

**Complete Example - Kanban Board:**

```jsx
import {
  VeltProvider,
  VeltComments,
  VeltCommentThread,
  useCommentAnnotations
} from '@veltdev/react';

function KanbanColumn({ status }) {
  const allAnnotations = useCommentAnnotations();

  // Filter comments by status from context
  const columnComments = allAnnotations?.filter(
    (a) => a.context?.status === status
  );

  return (
    <div className="kanban-column">
      <h3>{status}</h3>
      {columnComments?.map((annotation) => (
        <div key={annotation.annotationId} className="kanban-card">
          <div className="card-title">{annotation.context?.title}</div>
          <VeltCommentThread annotationId={annotation.annotationId} />
        </div>
      ))}
    </div>
  );
}

export default function KanbanBoard() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />

      <div className="kanban-board">
        <KanbanColumn status="todo" />
        <KanbanColumn status="in-progress" />
        <KanbanColumn status="done" />
      </div>
    </VeltProvider>
  );
}
```

**Styling the Thread:**

```jsx
<VeltCommentThread
  annotationId={annotation.annotationId}
  dialogVariant="custom-variant"
  darkMode={true}
/>
```

**For HTML:**

```html
<velt-comment-thread
  annotation-id="annotation-123"
  dialog-variant="custom-variant"
>
</velt-comment-thread>
```

**Verification Checklist:**
- [ ] VeltComments added to app root
- [ ] useCommentAnnotations retrieves comments
- [ ] annotationId passed to VeltCommentThread
- [ ] Comments display in custom location

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/standalone-components/comment-thread/overview - Overview
- https://docs.velt.dev/async-collaboration/comments/standalone-components/comment-thread/setup - Setup
