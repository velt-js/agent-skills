# Velt Area Best Practices

**Version 1.0.1**  
Velt  
October 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Velt Area Comments implementation guide — the rectangle area-annotation feature that lets users draw a box on the page and attach a comment to that region. Covers the area-comment toggle (default ON; areaComment prop on VeltComments, enableAreaComment/disableAreaComment runtime methods on commentElement), the three Area primitives (tool / pin-portal / container) and which one exposes a wireframe tag (only velt-area-pin-portal-wireframe today), the full componentConfig.* reference for that wireframe, and the AreaAnnotation / AreaProperty / AreaTargetAnnotation / AreaMetadata data shapes.

---

## Table of Contents

1. [API](#1-api) — **HIGH**
   - 1.1 [Toggle area comments via `areaComment` prop on VeltComments or `enableAreaComment` / `disableAreaComment` on commentElement](#11-toggle-area-comments-via-areacomment-prop-on-veltcomments-or-enableareacomment-disableareacomment-on-commentelement)

2. [Wireframe Variables](#2-wireframe-variables) — **MEDIUM**
   - 2.1 [Area wireframe variables — limited wireframe support; full componentConfig.* reference for the area pin overlay](#21-area-wireframe-variables-limited-wireframe-support-full-componentconfig-reference-for-the-area-pin-overlay)

3. [Types](#3-types) — **MEDIUM**
   - 3.1 [AreaAnnotation and supporting types — geometry, multi-target, comment linkage](#31-areaannotation-and-supporting-types-geometry-multi-target-comment-linkage)

---

## 1. API

**Impact: HIGH**

The Area feature is a mode of the Comments feature — there is no standalone `<VeltArea>` component and no `getAreaElement()` handle. Toggle area comments via the `areaComment` prop on `<VeltComments>` or via `commentElement.enableAreaComment()` / `disableAreaComment()` at runtime. Area mode is on by default. The three Area-specific public elements (`<velt-area-tool>`, `<velt-area-pin-portal>`, `<velt-area-container>`) are rendered automatically by the comments runtime.

### 1.1 Toggle area comments via `areaComment` prop on VeltComments or `enableAreaComment` / `disableAreaComment` on commentElement

**Impact: HIGH (Area is a mode of the Comments feature — there is no separate VeltArea component or getAreaElement handle; the area-mode toggle is the canonical entry point)**

Area comments are part of the Comments feature, not a separate component. The runtime decides whether users can draw a rectangle to attach a comment to a region. Area mode is **on by default** — disable it only if you don't want users to be able to draw area selections.

There is **no** `<VeltArea>` component, no `getAreaElement()` handle, and no `client.getAreaElement()` API. The handle is `client.getCommentElement()`, the same one used for the comments feature in general. Mistakenly looking for `getAreaElement` is a common base-model hallucination.

#### Declarative — the `areaComment` prop on `<VeltComments>`

**Incorrect (invented API):**

```tsx
// BUG: there is no <VeltArea> component and no getAreaElement() handle
<VeltArea enabled={false} />
client.getAreaElement().disable();
```

**Correct (React / Next.js): disable area comments with the prop:**

```tsx
import { VeltComments } from '@veltdev/react';

<VeltComments areaComment={false} />
```

**Correct (Other Frameworks): disable area comments with the attribute:**

```html
<velt-comments area-comment="false"></velt-comments>
```

The HTML web-component form uses the kebab-case `area-comment` attribute. The React form uses the camelCase `areaComment` prop.

#### Runtime — `enableAreaComment()` / `disableAreaComment()` on commentElement

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

#### Three Area public elements (rendered automatically)

When area mode is enabled, the comments runtime renders three Area-specific public elements. You typically don't author these yourself (the comments machinery produces them), but you target them for CSS:

**Area public elements:**

```
<velt-area-tool>             The trigger primitive to draw a new area. No wireframe tag.
<velt-area-pin-portal>       The rendered area pin (the rectangle overlay). No dedicated wireframe slot.
<velt-area-container>        The per-document orchestrator for all area pins. No wireframe tag.
```

None of the three registers a usable `<velt-...-wireframe>` slot, and Areas have no `Velt*` React wrapper and no headless hooks. Customize with CSS on these host elements and the area color (default `#625DF5`); see the `wireframe-variables-area` rule.

#### Location filters and feature loading

- Since v6.0.7, area annotations follow the same location filters as comment pins: after `setLocations()` or `excludeLocationIds` scopes the view, area rectangles for other locations are hidden too. No API change.
- In the v6 modular SDK, if you pass `featureAllowList`, include `'area'` (and `'comment'`) or the area chunk is not preloaded; `client.preloadArea()` warms it on demand.

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
- No <velt-area-*-wireframe> tag or VeltArea* React wrapper is referenced.
- If featureAllowList is set, it includes 'area'.
```

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#enableareacomment — `areaComment` prop + `enableAreaComment` / `disableAreaComment` API
- https://docs.velt.dev/ui-customization/features/async/area/wireframe-variables — the three Area public elements
- https://docs.velt.dev/ui-customization/features/annotations-tags-arrows-areas — Areas: no React wrapper, no wireframe slots, no hooks; CSS and area color
- https://docs.velt.dev/release-notes/version-6/sdk-changelog — 6.0.7 Comments entry (area annotations follow location filters)
- https://docs.velt.dev/api-reference/sdk/api/api-methods#preloadarea — `preloadArea()` and `featureAllowList`

---

## 2. Wireframe Variables

**Impact: MEDIUM**

The `componentConfig` runtime model of the area pin overlay and how to customize Areas. No Area primitive registers a usable wireframe slot and there are no headless hooks, so customization is CSS on the public host elements plus the area color (default `#625DF5`). Uses the **flat-config** access pattern — every read is via `componentConfig.<path>`. Variables cover the annotation (`areaPinAnnotation`, `areaPinAnnotationOnResize`), the optional linked comment (`commentPinAnnotation`), selection / resize / hidden state (`selected`, `isResizing`, `hideAreaAnnotation`), the styling color (`areaAnnotationColor`), and the geometry / offset numbers (`areaProperties`, `resizingOffset.top`/`left`, `offsetTop`, `offsetLeft`).

### 2.1 Area wireframe variables — limited wireframe support; full componentConfig.* reference for the area pin overlay

**Impact: MEDIUM (Knowing that no dedicated *-wireframe tag is registered for Area primitives prevents wasted effort; binding componentConfig is how you build custom area pin styling through CSS while staying driven by the same data stream)**

The Area feature has three customer-facing primitives. None of them currently register a dedicated `<velt-...-wireframe>` tag. The variables below describe the `componentConfig` exposed by `<velt-area-pin-portal>`:

**Wireframe registrations:**

```
<velt-area-tool>             No wireframe tag (CSS styling only).
<velt-area-pin-portal>       No direct wireframe slot — the area-pin renders through its
                             portal. Per-pin visual customization is not currently exposed
                             via a dedicated *-wireframe tag.
<velt-area-container>        No wireframe tag (CSS styling only).
```

To customize the area pin appearance, target CSS classes driven by `componentConfig.*` variables on the host element. To customize the tool or container, target CSS on the public elements. The UI customization reference confirms Areas have no wireframe slots, no `{...}` tokens, no `Velt*` React wrapper, and no headless hooks; the lever is CSS plus the area color (default `#625DF5`). Velt's own styles are high-specificity, so overrides may need `!important`.

**Incorrect (wireframe that is never registered):**

```html
<velt-wireframe style="display:none;">
  <!-- BUG: no Area wireframe slot exists; this template is ignored -->
  <velt-area-pin-portal-wireframe>
    <div velt-class="'is-selected': {componentConfig.selected}"></div>
  </velt-area-pin-portal-wireframe>
</velt-wireframe>
```

**Correct (CSS on the public host element):**

```css
/* Target the documented host element; Velt styles are high-specificity */
velt-area-pin-portal {
  opacity: 0.85 !important;
}
```

This feature uses the **flat-config** access pattern — every variable is referenced via the explicit `componentConfig.<path>` form. Dropping the prefix (`<velt-data field="selected" />`) resolves to nothing.

#### `componentConfig.*` reference — area pin portal

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

#### Accessing componentConfig

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
- https://docs.velt.dev/ui-customization/features/annotations-tags-arrows-areas — "Limitations" (Areas: CSS and area color only)
- https://docs.velt.dev/ui-customization/styling — CSS overrides and `--velt-*` theming
- https://docs.velt.dev/ui-customization/template-variables — `velt-data` / `velt-if` / `velt-class` overview
- velt-comments-best-practices — comment-dialog customization (shared between Pin / Area / Text)

---

## 3. Types

**Impact: MEDIUM**

The `AreaAnnotation` data shape — including `targetElements: (TargetElement | null)[]` (plural, supporting multi-element targeting), `areaProperties: AreaProperty` (resize-handle geometry), `targetAnnotations: AreaTargetAnnotation[]` (the linkage to comment / tag threads attached to this area), and `metadata: AreaMetadata` (open extras). Plus the three supporting types `AreaProperty`, `AreaTargetAnnotation`, and `AreaMetadata`. The `type` field defaults to `'area'`.

### 3.1 AreaAnnotation and supporting types — geometry, multi-target, comment linkage

**Impact: MEDIUM (The persisted shape that links area rectangles back to their comment threads; needed for any code that subscribes to annotations, exports them, or implements self-hosted persistence)**

`AreaAnnotation` is the canonical shape Velt persists for every placed area rectangle. The most important field for understanding the data model is `targetAnnotations: AreaTargetAnnotation[]` — that's the linkage from an area to the comment thread(s) it scopes.

**Incorrect (looks for the comment link in metadata):**

```typescript
const commentId = area.metadata?.commentAnnotationId; // BUG: the linkage lives in targetAnnotations[]
```

**Correct (resolve linked comments from targetAnnotations):**

```typescript
const commentIds = (area.targetAnnotations ?? [])
  .filter((t) => t.type === 'comment' && t.annotationId)
  .map((t) => t.annotationId as string);
```

**`AreaAnnotation` shape:**

```typescript
interface AreaAnnotation {
  annotationId: string;                            // Required. Unique id; auto-generated.
  from: User;                                      // Required. User who created the area annotation.
  color?: string;                                  // Optional. Display color.
  lastUpdated?: any;                               // Optional. Timestamp (auto-generated).
  targetElement?: TargetElement | null;            // Optional. Original target element reference.
  targetElements?: (TargetElement | null)[];       // Optional. Multiple target elements (plural — Area supports multi-element targeting).
  position?: CursorPosition | null;                // Optional. Cursor position at place-time.
  locationId?: number | null;                      // Optional. Auto-generated from the location.
  location?: Location | null;                      // Optional. Sub-document scoping.
  type?: string;                                   // Optional. Defaults to "area".
  props: AnnotationProperty;                       // Required. Annotation display properties (viewport, etc.).
  annotationIndex?: number;                        // Optional. 1-based index in the document.
  pageInfo?: PageInfo;                             // Optional. Page metadata.
  areaProperties?: AreaProperty;                   // Optional. Geometry data — handles + coordinates.
  targetAnnotations: AreaTargetAnnotation[];       // Required. Linked annotations (comments / tags) attached to this area.
  metadata?: AreaMetadata;                         // Optional. Open custom metadata.
}
```

A few things to call out:
- `type` defaults to `"area"` — narrow on `annotation.type === 'area'` in mixed annotation subscriptions.
- `targetElements` (plural) is the area-specific multi-target field; `targetElement` (singular) is the original-reference convenience pointer.
- `targetAnnotations` is REQUIRED — every area annotation has at least the schema field, even when empty.
- `props` and `targetAnnotations` are the only required fields outside the auto-generated identity / authorship fields.

**`AreaProperty` (geometry):**

```typescript
interface AreaProperty {
  targetElement?: string;   // Optional. Target element selector.
  handle1?: any;            // Optional. First resize-handle data.
  handle2?: any;            // Optional. Second resize-handle data.
  coordinates?: any;        // Optional. Area coordinates data.
}
```

Note: `AreaProperty.targetElement` is a string selector (not the `TargetElement` object). This is distinct from `AreaAnnotation.targetElement: TargetElement | null`.

**`AreaTargetAnnotation` (the linkage):**

```typescript
interface AreaTargetAnnotation {
  type?: string;            // Optional. Type of the linked annotation — typically "comment" or "tag".
  annotationId?: string;    // Optional. Unique id of the linked annotation.
  position?: string;        // Optional. Position reference for placement on the area.
}
```

Each entry in `AreaAnnotation.targetAnnotations[]` is a pointer to another annotation that's attached to this area. The typical case: one comment thread linked to one area. The `type` field distinguishes between comments (`"comment"`) and tags (`"tag"`).

**`Features.AREA` enum constant:**

The SDK ships a `Features` enum where `Features.AREA === 'area'` — the same string `AreaAnnotation.type` defaults to. Use the enum when you need a compile-time-safe handle for the feature name (e.g., feature-toggle code that switches on `Features.AREA` vs `Features.COMMENT`); the bare string `'area'` is equivalent for runtime comparisons.

```typescript
import { Features } from '@veltdev/types';

annotation.type === Features.AREA   // same as: annotation.type === 'area'
```

**`AreaMetadata` (open extras):**

```typescript
class AreaMetadata extends BaseMetadata {
  [key: string]: any;       // Open index signature for custom properties.
}
```

Open-ended bag. Use it to attach app-specific metadata that should travel with the area annotation. Don't put load-bearing relationships here — use `targetAnnotations` for that.

**`AreaStatus` (added to the data models in v6):**

```typescript
type AreaStatus = 'added' | 'updated' | 'deleted';
```

**Private comments:** since v6.0.0-beta.15, area annotations on a private comment do not inherit the parent comment's Access Context and no longer reach viewers in the same Access Context; context-scoped queries do not return them.

#### How an Area links back to a Comment

When a user draws an area and attaches a comment, two annotations are produced:
1. An `AreaAnnotation` (`type === 'area'`) with the geometry.
2. A `CommentAnnotation` (`type === 'comment'`) with the comment thread.

The `AreaAnnotation.targetAnnotations[]` will contain an `AreaTargetAnnotation` whose `annotationId` matches the comment's `annotationId` and whose `type === 'comment'`. To navigate from an area to its comment thread, look up the comment annotation by that id.

The wireframe surface exposes the resolved linkage via `componentConfig.commentPinAnnotation` on the area pin portal — see the `wireframe-variables-area` rule.

**Common pitfalls — DO NOT:**

```
1. DO NOT treat targetAnnotations as optional. It is a required field on
   the schema. (It can be an empty array, but the property exists.)
2. DO NOT confuse AreaAnnotation.targetElement (a TargetElement object
   reference) with AreaProperty.targetElement (a string CSS selector).
   Different fields, different types, easy to swap.
3. DO NOT narrow targetAnnotations[i].type only against "comment". "tag"
   is a documented value too; handle unknown types gracefully.
4. DO NOT use AreaMetadata for the comment linkage. That is what
   targetAnnotations is for.
```

**Verification checklist:**

```
- Code that consumes area annotations narrows on annotation.type === 'area'.
- targetAnnotations[] is iterated to resolve linked comments / tags
  (not parsed from metadata).
- Multi-target area code reads targetElements[] (plural), not targetElement
  (singular).
- AreaProperty.targetElement (string selector) is not confused with
  AreaAnnotation.targetElement (TargetElement object).
- Unknown values in targetAnnotations[i].type are handled (not just
  'comment' and 'tag').
```

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/models/data-models#areaannotation
- https://docs.velt.dev/api-reference/sdk/models/data-models#areaproperty
- https://docs.velt.dev/api-reference/sdk/models/data-models#areatargetannotation
- https://docs.velt.dev/api-reference/sdk/models/data-models#areametadata
- https://docs.velt.dev/api-reference/sdk/models/data-models#areastatus
- https://docs.velt.dev/release-notes/version-6/sdk-changelog — 6.0.0-beta.15 Comments entry (area annotations on private comments)

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#enableareacomment
- https://docs.velt.dev/ui-customization/features/async/area/wireframe-variables
- https://docs.velt.dev/api-reference/sdk/models/data-models#areaannotation
- https://docs.velt.dev/api-reference/sdk/models/data-models#areaproperty
- https://docs.velt.dev/api-reference/sdk/models/data-models#areatargetannotation
- https://docs.velt.dev/api-reference/sdk/models/data-models#areametadata
- https://docs.velt.dev/ui-customization/features/annotations-tags-arrows-areas
- https://docs.velt.dev/api-reference/sdk/models/data-models#areastatus
