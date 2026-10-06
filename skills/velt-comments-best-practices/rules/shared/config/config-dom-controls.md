---
title: Restrict Comment Placement to Specific DOM Elements
impact: LOW
impactDescription: Control where users can place comments on the page
tags: allowedElementIds, allowedElementClassNames, allowedElementQuerySelectors, data-velt-comment-disabled, setPinCursorImage, sourceId, commentToNearestAllowedElement, enableCommentToNearestAllowedElement, dom
---

## Restrict Comment Placement to Specific DOM Elements

Control which elements can receive comment pins. Once you provide allowed IDs, class names, or query selectors, commenting is disabled on every other element (Popover mode is not affected). Use `data-velt-comment-disabled` to block individual elements instead.

**Incorrect (boolean param on a toggle, URL cursor):**

```jsx
commentElement.commentToNearestAllowedElement(true);   // not a method; use the enable/disable pair
commentElement.setPinCursorImage('https://example.com/cursor.svg'); // expects a 32x32 base64 image
```

**Correct:**

```jsx
const commentElement = client.getCommentElement();

commentElement.allowedElementIds(['some-element']);
commentElement.allowedElementClassNames(['class-name-1', 'class-name-2']);
commentElement.allowedElementQuerySelectors(['#id1.class-name-1']);

// Snap pins to the closest allowed element when the user clicks a non-allowed one (default false)
commentElement.enableCommentToNearestAllowedElement();

// Custom cursor in comment mode: 32 x 32 pixel image as a base64 string
commentElement.setPinCursorImage(BASE64_IMAGE_STRING);
```

```jsx
<VeltComments
  allowedElementIds={['some-element']}
  allowedElementClassNames={['class-name-1', 'class-name-2']}
  allowedElementQuerySelectors={['#id1.class-name-1']}
  commentToNearestAllowedElement={true}
  pinCursorImage={BASE64_IMAGE_STRING}
/>
```

**Disable comments on specific elements:**

```html
<div data-velt-comment-disabled></div>
```

**sourceId for duplicate DOM IDs:**

When the same element ID appears more than once (for example, a data component rendered in several places), give each `VeltCommentTool` a session-unique `sourceId` so the dialog opens on the instance the user clicked.

```jsx
<VeltCommentTool sourceId="sourceId1" />
```

```html
<velt-comment-tool source-id="sourceId1"></velt-comment-tool>
```

**Verification:**
- [ ] Allowed lists cover every element that should accept comments
- [ ] `data-velt-comment-disabled` on elements that must never be commented on
- [ ] `setPinCursorImage()` receives a 32 x 32 base64 image
- [ ] `sourceId` is unique per instance when DOM IDs repeat

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#dom-controls - DOM Controls
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#commenttonearestallowedelement - commentToNearestAllowedElement
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#setpincursorimage - setPinCursorImage
