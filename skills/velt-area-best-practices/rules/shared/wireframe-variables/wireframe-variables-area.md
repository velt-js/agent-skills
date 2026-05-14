---
title: Area wireframe variables — only `<velt-area-pin-portal-wireframe>` registers; full componentConfig.* reference for the area pin overlay
impact: MEDIUM
impactDescription: Knowing which Area primitive actually exposes a wireframe tag (only the pin portal) prevents wasted effort on the tool and container; binding componentConfig is how you build a fully custom area pin while staying driven by the same data stream
tags: area, wireframe, template-variables, velt-data, velt-if, velt-class, componentConfig, areaPinAnnotation, selected, isResizing, hideAreaAnnotation, areaProperties, areaAnnotationColor, resizingOffset
---

## Area wireframe variables — only the pin portal exposes a wireframe tag

The Area feature has three customer-facing primitives. Today, only ONE of them registers a `<velt-...-wireframe>` tag:

**Wireframe registrations:**

```
<velt-area-tool>             No wireframe tag (CSS styling only).
<velt-area-pin-portal>       Wireframe tag: <velt-area-pin-portal-wireframe>
                             React: <VeltAreaPinPortalWireframe>
<velt-area-container>        No wireframe tag (CSS styling only).
```

To customize the area pin (the rectangle overlay on the page), use the pin-portal wireframe. To customize the tool or container, you're limited to CSS targeting on the public elements.

This feature uses the **flat-config** access pattern — every variable is referenced via the explicit `componentConfig.<path>` form. Dropping the prefix (`<velt-data field="selected" />`) resolves to nothing.

### `componentConfig.*` reference — area pin portal

**Area pin portal componentConfig variables:**

```
componentConfig.areaPinAnnotation         AreaAnnotation       The area annotation — geometry, color, author, targetAnnotations.
componentConfig.areaPinAnnotationOnResize AreaAnnotation       Mid-resize snapshot (set during drag-resize).
componentConfig.commentPinAnnotation      CommentAnnotation    Optional linked comment annotation (when an area scopes a comment).
componentConfig.user                      User                 Currently identified end-user.
componentConfig.selected                  boolean              Pin is currently selected by the local user.
componentConfig.hideAreaAnnotation        boolean              Hide the area visual (e.g., during certain modes).
componentConfig.areaAnnotationColor       string               Border / overlay color. Default '#625DF5'.
componentConfig.areaProperties            AreaProperty         Geometry data — top / left / width / height (and the underlying handles / coordinates / target element selector fields in the type).
componentConfig.isResizing                boolean              User is actively resizing this pin.
componentConfig.resizingOffset.top        number               Vertical resize-handle offset (used for inline style).
componentConfig.resizingOffset.left       number               Horizontal resize-handle offset (used for inline style).
componentConfig.offsetTop                 number               Vertical position offset (used for inline style).
componentConfig.offsetLeft                number               Horizontal position offset (used for inline style).
```

### Custom area pin overlay

**Custom area pin (React / Next.js) — highlights selection, dims when hidden, shows a resize handle during drag:**

```tsx
import { VeltAreaPinPortalWireframe } from '@veltdev/react';

<VeltAreaPinPortalWireframe
  velt-class="'is-selected': {componentConfig.selected}, 'is-hidden': {componentConfig.hideAreaAnnotation}, 'is-resizing': {componentConfig.isResizing}">
  <div className="my-area-pin">
    <span className="my-area-pin__author">
      <velt-data field="componentConfig.areaPinAnnotation.from.name" />
    </span>
    <span
      className="my-area-pin__resize-handle"
      velt-if="{componentConfig.selected}" />
  </div>
</VeltAreaPinPortalWireframe>
```

**Custom area pin (Other Frameworks):**

```html
<velt-area-pin-portal-wireframe
  velt-class="'is-selected': {componentConfig.selected}, 'is-hidden': {componentConfig.hideAreaAnnotation}, 'is-resizing': {componentConfig.isResizing}">
  <div class="my-area-pin">
    <span class="my-area-pin__author">
      <velt-data field="componentConfig.areaPinAnnotation.from.name"></velt-data>
    </span>
    <span class="my-area-pin__resize-handle"
          velt-if="{componentConfig.selected}"></span>
  </div>
</velt-area-pin-portal-wireframe>
```

### Reading the linked comment from the pin

`componentConfig.commentPinAnnotation` is set when the area scopes a comment thread. Use it to render comment-count badges or other thread-derived UI directly inside the area pin overlay:

**Comment-count badge inside the area pin:**

```tsx
<VeltAreaPinPortalWireframe>
  <div className="my-area-pin">
    <span velt-if="{componentConfig.commentPinAnnotation}">
      <velt-data field="componentConfig.commentPinAnnotation.comments.length" /> comments
    </span>
  </div>
</VeltAreaPinPortalWireframe>
```

**Common pitfalls — DO NOT:**

```
1. DO NOT drop the componentConfig. prefix. Flat-config requires the full path.
2. DO NOT look for a <velt-area-tool-wireframe> or
   <velt-area-container-wireframe> tag. Neither exists yet — only the
   pin portal registers a wireframe today.
3. DO NOT compute position from resizingOffset.top / offsetLeft etc.
   yourself. Those are internal values that the runtime uses to compute
   the inline style. Reading them for display is fine; treating them as
   the authoritative geometry source is wrong (use
   areaPinAnnotation.areaProperties for geometry).
4. DO NOT use componentConfig.areaPinAnnotationOnResize for the
   steady-state annotation. It only carries data during an active resize
   drag.
```

**Verification checklist:**

```
- Custom area pin uses <VeltAreaPinPortalWireframe> (React) or
  <velt-area-pin-portal-wireframe> (HTML) — not a non-existent tool /
  container wireframe.
- All componentConfig.* reads use the full path.
- Selection / resize / hidden state is read via componentConfig.selected /
  isResizing / hideAreaAnnotation.
- Linked comment access goes via componentConfig.commentPinAnnotation
  (guarded with velt-if because it's optional).
- Geometry / offset numbers are read but not treated as the authoritative
  source — areaPinAnnotation.areaProperties is the persisted geometry.
```

**Cross-reference — Area shares the comment-dialog wireframe:**

```
When a user clicks an area pin, the comment thread attached to it opens through
the SAME <VeltCommentDialogWireframe variant="dialog"> that Pin and Text comments
use. There is no Area-specific dialog wireframe. Customize the dialog over in
velt-comments-best-practices — the variant "dialog" applies to Pin, Area, AND
Text comments uniformly.
```

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/area/wireframe-variables — full variable reference + subcomponent list
- https://docs.velt.dev/ui-customization/template-variables — `velt-data` / `velt-if` / `velt-class` overview
- velt-comments-best-practices — comment-dialog customization (shared between Pin / Area / Text)
