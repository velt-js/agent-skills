---
title: Restrict Comment Placement to Specific DOM Elements
impact: LOW
impactDescription: Control where users can place comments on the page
tags: allowedElementIds, allowedElementClassNames, allowedElementQuerySelectors, data-velt-comment-disabled, setPinCursorImage, sourceId, commentToNearestAllowedElement, dom
---

## Restrict Comment Placement to Specific DOM Elements

Control which elements on the page can receive comment pins.

**API Methods:**

```tsx
const commentElement = client.getCommentElement();

// Restrict by element IDs
commentElement.allowedElementIds(['editor-area', 'design-canvas', 'content-panel']);

// Restrict by CSS class names
commentElement.allowedElementClassNames(['commentable', 'reviewable']);

// Restrict by CSS selectors
commentElement.allowedElementQuerySelectors(['[data-commentable]', '.content-area > div']);

// Auto-snap pin to nearest allowed element
commentElement.commentToNearestAllowedElement(true);

// Custom cursor icon when in comment mode
commentElement.setPinCursorImage('https://example.com/custom-cursor.svg');
```

**HTML attribute to disable comments on specific elements:**

```html
<!-- This element cannot receive comments -->
<div data-velt-comment-disabled="true">
  Protected content
</div>
```

**Source ID for tracking:**

```tsx
// Identify which source element generated a comment
<VeltCommentTool sourceId="toolbar-button" />
```

**Key details:**
- `allowedElementIds`, `allowedElementClassNames`, and `allowedElementQuerySelectors` are mutually exclusive — use one approach
- `data-velt-comment-disabled` can be added to any HTML element
- `commentToNearestAllowedElement` snaps pins to the closest allowed parent
- `setPinCursorImage` accepts a URL to a custom cursor image

**Verification:**
- [ ] Only one restriction method used (IDs, classes, or selectors)
- [ ] Comment pins only appear on allowed elements
- [ ] `data-velt-comment-disabled` on sensitive elements

**Source Pointer:** https://docs.velt.dev/async-collaboration/comments/customize-behavior - DOM Controls
