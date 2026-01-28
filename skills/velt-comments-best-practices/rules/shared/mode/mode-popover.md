---
title: Use Popover Mode for Table Cell Comments
impact: HIGH
impactDescription: Google Sheets-style comments attached to specific elements
tags: popover, table, cell, targetelementid, google-sheets, bubble
---

## Use Popover Mode for Table Cell Comments

Popover mode attaches comments to specific elements using `targetElementId`, similar to Google Sheets comments on cells. Use this for tables, grids, or any UI where comments should be bound to specific elements.

**Incorrect (missing popoverMode and targetElementId):**

```jsx
// Comments won't bind to specific cells
<VeltComments />

<div className="table">
  <div className="cell" id="cell-1">
    <VeltCommentTool />  {/* Not bound to the cell */}
  </div>
</div>
```

**Correct (with popoverMode and targetElementId):**

```jsx
import { VeltProvider, VeltComments, VeltCommentTool, VeltCommentBubble } from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments popoverMode={true} />

      <div className="table">
        <div className="cell" id="cell-id-1">
          <VeltCommentTool targetElementId="cell-id-1" />
          <VeltCommentBubble targetElementId="cell-id-1" />
        </div>
        <div className="cell" id="cell-id-2">
          <VeltCommentTool targetElementId="cell-id-2" />
          <VeltCommentBubble targetElementId="cell-id-2" />
        </div>
      </div>
    </VeltProvider>
  );
}
```

**Two Patterns for Comment Tools:**

**Pattern A: Comment Tool per Element**
```jsx
<div className="cell" id="cell-id-1">
  <VeltCommentTool targetElementId="cell-id-1" />
</div>
```

**Pattern B: Single Comment Tool with data attributes**
```jsx
<VeltCommentTool />  {/* Single tool in toolbar */}

<div className="cell"
     id="cell-A"
     data-velt-target-comment-element-id="cell-A">
  Content
</div>
```

**Adding Custom Metadata (Context):**

```jsx
<VeltCommentTool
  targetElementId="cell-id"
  context={{ rowId: 'row-1', columnId: 'col-A', value: 100 }}
/>
```

**Comment Bubble (shows reply count):**

```jsx
<VeltCommentBubble
  targetElementId="cell-id-1"
  commentCountType="unread"  // or "total"
/>
```

**Disable Triangle Indicator:**

```jsx
<VeltComments popoverMode={true} popoverTriangleComponent={false} />
```

**For HTML:**

```html
<velt-comments popover-mode="true"></velt-comments>

<div class="cell" id="cell-1">
  <velt-comment-tool target-element-id="cell-1"></velt-comment-tool>
  <velt-comment-bubble target-element-id="cell-1"></velt-comment-bubble>
</div>
```

**Verification Checklist:**
- [ ] VeltComments has `popoverMode={true}`
- [ ] Each commentable element has unique ID
- [ ] VeltCommentTool has matching `targetElementId`
- [ ] Comments appear attached to target element

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/popover - Complete setup
