---
title: Use Comment Pin for Manual Position Control
impact: MEDIUM-HIGH
impactDescription: Full control over comment pin placement in complex UIs
tags: comment-pin, manual, veltcommentpin, custom-position, annotation
---

## Use Comment Pin for Manual Position Control

VeltCommentPin gives you complete control over where comment pins appear. Use this for complex UIs, canvas applications, or when automatic positioning doesn't meet your needs.

**When to Use Standalone Components:**

Standalone components (Pin, Thread, Composer) are recommended when:
- **You need direct API access** - Work with comment data programmatically
- **You have complex UI requirements** - 3D canvas, WebGL, custom rendering engines
- **Default components don't fit your layout** - Kanban boards, custom sidebars, split views
- **You need custom positioning logic** - Comments on non-DOM elements, virtual lists

**When to Use Comment Pin Specifically:**
- Custom chart/canvas implementations
- 3D applications and WebGL scenes
- Complex drag-and-drop interfaces
- When automatic pin placement doesn't work
- Building custom comment UIs with full control

**Implementation Steps:**

**1. Add Comments with Custom Metadata:**

Option A: Using onCommentAdd callback
```jsx
<VeltComments
  onCommentAdd={(event) => {
    // Add custom positioning data
    return {
      ...event,
      context: {
        ...event.context,
        customX: 100,
        customY: 200
      }
    };
  }}
/>
```

Option B: Using addManualComment API
```jsx
const { client } = useVeltClient();
const commentModeState = useCommentModeState();

const handleClick = (event) => {
  if (client && commentModeState) {
    const commentElement = client.getCommentElement();
    commentElement.addManualComment({
      context: {
        x: event.clientX,
        y: event.clientY
      }
    });
  }
};
```

**2. Retrieve Comment Annotations:**

```jsx
import { useCommentAnnotations } from '@veltdev/react';

const commentAnnotations = useCommentAnnotations();

// Or via API
const commentElement = client.getCommentElement();
commentElement.getAllCommentAnnotations().subscribe((annotations) => {
  // Process annotations
});
```

**3. Render Comment Pins:**

```jsx
import { VeltCommentPin } from '@veltdev/react';

function CommentPins({ annotations }) {
  return annotations.map((annotation) => {
    const { x, y } = annotation.context || {};

    return (
      <div
        key={annotation.annotationId}
        style={{
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          transform: 'translate(-50%, -100%)'
        }}
      >
        <VeltCommentPin annotationId={annotation.annotationId} />
      </div>
    );
  });
}
```

**Complete Example:**

```jsx
import {
  VeltProvider,
  VeltComments,
  VeltCommentTool,
  VeltCommentPin,
  useVeltClient,
  useCommentAnnotations,
  useCommentModeState
} from '@veltdev/react';

export default function ManualPinExample() {
  const { client } = useVeltClient();
  const commentModeState = useCommentModeState();
  const commentAnnotations = useCommentAnnotations();

  const handleContainerClick = (event) => {
    if (!client || !commentModeState) return;

    const rect = event.currentTarget.getBoundingClientRect();
    client.getCommentElement().addManualComment({
      context: {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }
    });
  };

  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />
      <VeltCommentTool />

      <div
        style={{ position: 'relative', width: '100%', height: 500 }}
        data-velt-manual-comment-container="true"
        onClick={handleContainerClick}
      >
        {commentAnnotations?.map((annotation) => (
          <div
            key={annotation.annotationId}
            style={{
              position: 'absolute',
              left: annotation.context?.x,
              top: annotation.context?.y
            }}
          >
            <VeltCommentPin annotationId={annotation.annotationId} />
          </div>
        ))}
      </div>
    </VeltProvider>
  );
}
```

**VeltCommentPin Props:**

| Prop | Type | Description |
|------|------|-------------|
| `annotationId` | string | ID of the comment annotation to display |

**Verification Checklist:**
- [ ] Container has data-velt-manual-comment-container="true"
- [ ] Context includes position data
- [ ] annotationId passed to VeltCommentPin
- [ ] Pin positioned with absolute CSS

**Source Pointers:**
- `/docs/async-collaboration/comments/standalone-components/comment-pin/overview.mdx` - Overview
- `/docs/async-collaboration/comments/standalone-components/comment-pin/setup.mdx` - Setup
