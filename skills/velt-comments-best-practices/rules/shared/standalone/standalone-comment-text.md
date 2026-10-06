---
title: Use VeltCommentText to Attach a Known Annotation to Text in Your Markup
impact: MEDIUM
impactDescription: Highlights and attaches an existing comment to text you render yourself, without selection-driven text mode
tags: comment-text, VeltCommentText, velt-comment-text, standalone, annotationId, multiThreadAnnotationId, highlight, rich-text
---

## Use VeltCommentText to Attach a Known Annotation to Text in Your Markup

`VeltCommentText` (`<velt-comment-text>`) wraps any text and attaches an existing comment annotation to it: it highlights the wrapped text and links the comment. Use it when the text lives in your own components and you already know which annotation belongs to it, for example when re-rendering comments in a rich-text editor. For user-driven selection, use text comments instead. Do not confuse it with `VeltTextComment`, the selection toolbar used by text mode.

**Incorrect (using the text-mode toolbar component to wrap content):**

```jsx
// VeltTextComment is the selection toolbar, not a wrapper for known annotations
<VeltTextComment annotationId="ANNOTATION_ID">
  The quarterly numbers look off.
</VeltTextComment>
```

**Correct (React / Next.js):**

```jsx
import { VeltCommentText } from '@veltdev/react';

<VeltCommentText annotationId="ANNOTATION_ID">
  The quarterly numbers look off.
</VeltCommentText>

{/* Multi-thread annotation */}
<VeltCommentText multiThreadAnnotationId="MULTI_THREAD_ANNOTATION_ID">
  Revenue by region
</VeltCommentText>
```

**Correct (Other Frameworks):**

```html
<velt-comment-text annotation-id="ANNOTATION_ID">
  The quarterly numbers look off.
</velt-comment-text>

<velt-comment-text multi-thread-annotation-id="MULTI_THREAD_ANNOTATION_ID">
  Revenue by region
</velt-comment-text>
```

**Props:**

| Prop | HTML attribute | Type | Description |
|------|----------------|------|-------------|
| `annotationId` | `annotation-id` | `string` | Comment annotation to attach to the wrapped text |
| `multiThreadAnnotationId` | `multi-thread-annotation-id` | `string` | Multi-thread annotation to attach to the wrapped text |

Pass one of the two. Style highlighted text with the `velt-comment-text[comment-available="true"]` selector, as editor integrations do.

**Verification Checklist:**
- [ ] `VeltComments` is mounted so the annotation data and dialog are available
- [ ] Each wrapper receives the `annotationId` (or `multiThreadAnnotationId`) of an existing annotation
- [ ] `VeltCommentText` is used for known annotations; selection-driven commenting uses text mode
- [ ] HTML uses a closing `</velt-comment-text>` tag, not a self-closing element

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/standalone-components/comment-text/overview - Comment Text
- https://docs.velt.dev/async-collaboration/comments/setup/text - Text comments (selection-driven)
