---
title: Add Comments to Canvas/Drawing Applications
impact: HIGH
impactDescription: Manual comment positioning for HTML5 canvas and drawing apps
tags: canvas, drawing, manual, veltcommentpin, custom-position
---

## Add Comments to Canvas/Drawing Applications

Add collaborative comments to HTML5 canvas or drawing applications using manual comment positioning with VeltCommentPin.

**Setup Overview:**

Canvas comments follow the manual positioning pattern - handle click events, store coordinates in context, and render pins at stored positions.

**Implementation:**

```jsx
import { useState, useEffect, useRef } from 'react';
import {
  VeltProvider,
  VeltComments,
  VeltCommentTool,
  VeltCommentPin,
  useVeltClient,
  useCommentAnnotations,
  useCommentModeState
} from '@veltdev/react';

export default function CanvasComments() {
  const canvasId = 'myDrawingCanvas';
  const canvasRef = useRef(null);
  const { client } = useVeltClient();
  const commentModeState = useCommentModeState();
  const commentAnnotations = useCommentAnnotations();
  const [canvasComments, setCanvasComments] = useState([]);

  // Filter comments for this canvas
  useEffect(() => {
    const filtered = commentAnnotations?.filter(
      (c) => c.context?.canvasId === canvasId
    );
    setCanvasComments(filtered || []);
  }, [commentAnnotations]);

  // Handle canvas click
  const handleCanvasClick = (event) => {
    if (!commentModeState || !client) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const context = {
      canvasId,
      commentType: 'manual',
      x,
      y,
      // Optional: store relative position for responsive
      xPercent: x / rect.width,
      yPercent: y / rect.height
    };

    client.getCommentElement().addManualComment({ context });
  };

  // Render comment pin at stored position
  const renderPin = (annotation) => {
    const ctx = annotation.context || {};
    if (ctx.x === undefined || ctx.y === undefined) return null;

    return (
      <div
        key={annotation.annotationId}
        style={{
          position: 'absolute',
          left: `${ctx.x}px`,
          top: `${ctx.y}px`,
          transform: 'translate(-50%, -100%)',
          zIndex: 1000
        }}
      >
        <VeltCommentPin annotationId={annotation.annotationId} />
      </div>
    );
  };

  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />
      <VeltCommentTool />

      <div
        style={{ position: 'relative' }}
        data-velt-manual-comment-container="true"
      >
        <canvas
          ref={canvasRef}
          id={canvasId}
          width={800}
          height={600}
          onClick={handleCanvasClick}
          style={{ border: '1px solid #ccc' }}
        />
        {canvasComments.map(renderPin)}
      </div>
    </VeltProvider>
  );
}
```

**Key Implementation Details:**

**1. Calculate Click Position:**
```jsx
const rect = canvasRef.current.getBoundingClientRect();
const x = event.clientX - rect.left;
const y = event.clientY - rect.top;
```

**2. Store in Context:**
```jsx
const context = {
  canvasId,           // For filtering
  commentType: 'manual',
  x, y,               // Pixel position
  xPercent, yPercent  // Optional: relative position
};
```

**3. Add Manual Comment:**
```jsx
client.getCommentElement().addManualComment({ context });
```

**4. Position Pin:**
```jsx
style={{
  position: 'absolute',
  left: `${ctx.x}px`,
  top: `${ctx.y}px`,
  transform: 'translate(-50%, -100%)'
}}
```

**Alternative: Using onCommentAdd:**
```jsx
// Let Velt handle click, add metadata via callback
<VeltComments
  onCommentAdd={(event) => {
    // Add custom metadata to comment
    return {
      ...event,
      context: {
        ...event.context,
        canvasId,
        customData: 'value'
      }
    };
  }}
/>
```

**Verification Checklist:**
- [ ] Container has data-velt-manual-comment-container="true"
- [ ] Container has position: relative
- [ ] Click position calculated relative to canvas
- [ ] Context includes canvasId for filtering
- [ ] Pins rendered at stored coordinates

**Source Pointers:**
- `/docs/async-collaboration/comments/setup/canvas.mdx` - Canvas setup
- `/docs/async-collaboration/comments/setup/canvas-comments/overview.mdx` - Overview
