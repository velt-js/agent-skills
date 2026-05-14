---
title: Toggle area comments via `areaComment` prop on VeltComments or `enableAreaComment` / `disableAreaComment` on commentElement
impact: HIGH
impactDescription: Area is a mode of the Comments feature — there is no separate VeltArea component or getAreaElement handle; the area-mode toggle is the canonical entry point
tags: area, area-comment, areaComment, enableAreaComment, disableAreaComment, VeltComments, commentElement, getCommentElement, velt-area-tool, velt-area-pin-portal, velt-area-container
---

## Toggle area comments on VeltComments

Area comments are part of the Comments feature, not a separate component. The runtime decides whether users can draw a rectangle to attach a comment to a region. Area mode is **on by default** — disable it only if you don't want users to be able to draw area selections.

There is **no** `<VeltArea>` component, no `getAreaElement()` handle, and no `client.getAreaElement()` API. The handle is `client.getCommentElement()`, the same one used for the comments feature in general. Mistakenly looking for `getAreaElement` is a common base-model hallucination.

### Declarative — the `areaComment` prop on `<VeltComments>`

**Disable area comments (React / Next.js):**

```tsx
import { VeltComments } from '@veltdev/react';

<VeltComments areaComment={false} />
```

**Disable area comments (Other Frameworks):**

```html
<velt-comments area-comment="false"></velt-comments>
```

The HTML web-component form uses the kebab-case `area-comment` attribute. The React form uses the camelCase `areaComment` prop.

### Runtime — `enableAreaComment()` / `disableAreaComment()` on commentElement

When you need to flip area mode in response to user action (e.g., toggling a "review mode" toggle), use the runtime methods on the comment element handle:

**Toggle at runtime (React / Next.js):**

```tsx
const commentElement = client.getCommentElement();
commentElement.enableAreaComment();
commentElement.disableAreaComment();
```

**Toggle at runtime (Other Frameworks):**

```js
const commentElement = Velt.getCommentElement();
commentElement.enableAreaComment();
commentElement.disableAreaComment();
```

The prop is the right path when the toggle is part of an initial render; the runtime methods are right when toggling in response to user state.

### Three Area public elements (rendered automatically)

When area mode is enabled, the comments runtime renders three Area-specific public elements. You typically don't author these yourself — they're produced by the comments machinery — but you target them for CSS and (in one case) wireframe customization:

**Area public elements:**

```
<velt-area-tool>             The trigger primitive to draw a new area. No wireframe tag.
<velt-area-pin-portal>       The rendered area pin (the rectangle overlay). Wireframe tag:
                             <velt-area-pin-portal-wireframe> (React: VeltAreaPinPortalWireframe).
<velt-area-container>        The per-document orchestrator for all area pins. No wireframe tag.
```

Today only `area-pin-portal` registers a wireframe tag — see the `wireframe-variables-area` rule. The other two primitives don't yet expose `<velt-...-wireframe>` registrations.

**Common pitfalls — DO NOT:**

```
1. DO NOT search for <VeltArea> or client.getAreaElement(). Neither exists.
   Area lives under <VeltComments> and commentElement.
2. DO NOT confuse the React prop areaComment (camelCase) with the HTML
   attribute area-comment (kebab-case). Passing camelCase on the web
   component is silently ignored.
3. DO NOT assume area mode is off by default. It is ON by default, so a
   fresh <VeltComments /> already supports area drawing.
4. DO NOT set the prop AND call the runtime method against the same scope
   at the same time. Pick one path so you can reason about the active state.
```

**Verification checklist:**

```
- Code uses <VeltComments areaComment={false}> (React) or
  <velt-comments area-comment="false"> (HTML) to disable area mode.
- Runtime toggle uses commentElement.enableAreaComment() /
  disableAreaComment(), not a fictional getAreaElement() handle.
- Custom CSS targeting Area visuals uses the three public elements
  (<velt-area-tool>, <velt-area-pin-portal>, <velt-area-container>).
- No <VeltArea> or <VeltAreaTool> component is referenced in the React code.
- If toggling at runtime, the corresponding areaComment prop is omitted so
  the two paths don't fight.
```

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#enableareacomment — `areaComment` prop + `enableAreaComment` / `disableAreaComment` API
- https://docs.velt.dev/ui-customization/features/async/area/wireframe-variables — the three Area public elements
