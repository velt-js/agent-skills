---
title: Customize Comment Bubble Display
impact: MEDIUM
impactDescription: Configure comment count bubbles and indicators
tags: bubble, comment-bubble, count, unread, indicator
---

## Customize Comment Bubble Display

VeltCommentBubble shows comment count indicators on elements. Customize the display type, count mode, and appearance.

**Basic Usage:**

```jsx
import { VeltCommentBubble } from '@veltdev/react';

<div className="cell" id="cell-1">
  <VeltCommentBubble targetElementId="cell-1" />
</div>
```

**Comment Count Type:**

```jsx
// Show total replies (default)
<VeltCommentBubble
  targetElementId="cell-1"
  commentCountType="total"
/>

// Show only unread count
<VeltCommentBubble
  targetElementId="cell-1"
  commentCountType="unread"
/>
```

**VeltCommentBubble Props:**

| Prop | Type | Description |
|------|------|-------------|
| `targetElementId` | string | ID of associated element |
| `commentCountType` | string | "total" or "unread" |
| `context` | object | Custom metadata for matching |

**Using with Context (complex matching):**

```jsx
<VeltCommentBubble
  context={{ rowId: 'row-1', columnId: 'col-A' }}
  commentCountType="unread"
/>
```

**Disable Triangle (Popover Mode):**

When using bubbles, you may want to disable the default triangle indicator:

```jsx
<VeltComments
  popoverMode={true}
  popoverTriangleComponent={false}
/>
```

**For HTML:**

```html
<velt-comment-bubble
  target-element-id="cell-1"
  comment-count-type="unread"
></velt-comment-bubble>
```

**Complete Popover Pattern:**

```jsx
<div className="cell" id="cell-1">
  <VeltCommentTool targetElementId="cell-1" />
  <VeltCommentBubble targetElementId="cell-1" commentCountType="unread" />
  Cell Content
</div>
```

**Verification Checklist:**
- [ ] targetElementId matches element ID
- [ ] commentCountType set appropriately
- [ ] Bubble displays in correct location
- [ ] Triangle disabled if using bubble as indicator

**Source Pointers:**
- `/docs/async-collaboration/comments/setup/popover.mdx` - "Step 5: Add the Comment Bubble component"
- `/docs/ui-customization/features/async/comments/comment-bubble.mdx` - Customization
