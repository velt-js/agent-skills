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

**React Primitive Sub-Components (v5.0.2-beta.13+):**

`VeltCommentBubble` now exposes three independently importable React primitives for fine-grained composition. Previously only available as HTML elements, these now have React wrappers:

<!-- TODO (v5.0.2-beta.13): Verify full prop signatures for VeltCommentBubbleAvatar, VeltCommentBubbleCommentsCount, and VeltCommentBubbleUnreadIcon. Release note confirms component names, import path, and defaultCondition prop, but full prop tables are not specified in the release notes. -->

```jsx
import {
  VeltCommentBubbleAvatar,
  VeltCommentBubbleCommentsCount,
  VeltCommentBubbleUnreadIcon,
} from '@veltdev/react';

// Each primitive accepts defaultCondition to bypass the SDK's
// default show/hide logic when composing inside a wireframe.
<VeltCommentBubbleAvatar defaultCondition={false} />
<VeltCommentBubbleCommentsCount defaultCondition={false} />
<VeltCommentBubbleUnreadIcon defaultCondition={false} />
```

**Verification Checklist:**
- [ ] targetElementId matches element ID
- [ ] commentCountType set appropriately
- [ ] Bubble displays in correct location
- [ ] Triangle disabled if using bubble as indicator
- [ ] React primitive sub-components imported from `@veltdev/react` (v5.0.2-beta.13+)

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/popover - "Step 5: Add the Comment Bubble component"
- https://docs.velt.dev/ui-customization/features/async/comments/comment-bubble - Customization
