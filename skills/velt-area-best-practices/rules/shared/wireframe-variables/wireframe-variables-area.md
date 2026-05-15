---
title: Area wireframe variables — limited wireframe support; full componentConfig.* reference for the area pin overlay
impact: MEDIUM
impactDescription: Knowing that no dedicated *-wireframe tag is registered for Area primitives prevents wasted effort; binding componentConfig is how you build custom area pin styling through CSS while staying driven by the same data stream
tags: area, wireframe, template-variables, velt-data, velt-if, velt-class, componentConfig, areaPinAnnotation, selected, isResizing, hideAreaAnnotation, areaProperties, areaAnnotationColor, resizingOffset
---

## Area wireframe variables — limited wireframe support

The Area feature has three customer-facing primitives. None of them currently register a dedicated `<velt-...-wireframe>` tag. The variables below describe the `componentConfig` exposed by `<velt-area-pin-portal>`:

**Wireframe registrations:**

```
<velt-area-tool>             No wireframe tag (CSS styling only).
<velt-area-pin-portal>       No direct wireframe slot — the area-pin renders through its
                             portal. Per-pin visual customization is not currently exposed
                             via a dedicated *-wireframe tag.
<velt-area-container>        No wireframe tag (CSS styling only).
```

To customize the area pin appearance, target CSS classes driven by `componentConfig.*` variables on the host element. To customize the tool or container, target CSS on the public elements.

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

### Accessing componentConfig

Since there is no wireframe slot, `componentConfig.*` variables are not available via `velt-data` interpolation. Use CSS to target the area pin's host element classes. The `componentConfig` shape above is documented so you understand the runtime model when inspecting element attributes.

`componentConfig.commentPinAnnotation` is set when the area scopes a comment thread. This information is available through the Velt comment annotations API if you need to react to it in application code.

**Common pitfalls — DO NOT:**

```
1. DO NOT look for a <velt-area-pin-portal-wireframe>,
   <velt-area-tool-wireframe>, or <velt-area-container-wireframe> tag.
   None of the Area primitives register a dedicated wireframe tag —
   customize through CSS on the public host elements.
2. DO NOT drop the componentConfig. prefix if you access these variables
   through Angular signal inputs. Flat-config requires the full path.
3. DO NOT compute position from resizingOffset.top / offsetLeft etc.
   yourself. Those are internal values the runtime uses to compute inline
   style. Use areaPinAnnotation.areaProperties for persisted geometry.
4. DO NOT use componentConfig.areaPinAnnotationOnResize for the
   steady-state annotation. It only carries data during an active resize
   drag.
```

**Verification checklist:**

```
- Area pin appearance is customized through CSS on <velt-area-pin-portal>
  (not through a wireframe tag — none exists).
- All componentConfig.* reads (if accessed via Angular signal inputs)
  use the full path.
- Selection / resize / hidden state classes are driven by CSS rules
  targeting the host element's class list.
- Linked comment data is accessed via the Velt comment annotations API,
  not via componentConfig.commentPinAnnotation inside a wireframe slot.
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
