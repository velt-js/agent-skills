---
title: ArrowAnnotation and AnnotationProperty — data shapes for placed arrows
impact: MEDIUM
impactDescription: The canonical shape returned for placed arrows and stored on the document; needed for any code that subscribes to arrows, exports them, or builds custom analytics
tags: arrows, ArrowAnnotation, AnnotationProperty, annotationId, targetElement, position, props, arrowLength, arrowAngle, type
---

## ArrowAnnotation and AnnotationProperty — data shapes for placed arrows

`ArrowAnnotation` is the canonical shape Velt persists for every placed arrow on a document. Code that subscribes to arrows, exports them, or builds custom UI on top of them types against this shape.

**`ArrowAnnotation` shape:**

```typescript
interface ArrowAnnotation {
  annotationId: string;                // Required. Unique id; auto-generated.
  from: User;                          // Required. User who created the arrow.
  color?: string;                      // Optional. Display color.
  lastUpdated?: unknown;               // Optional. Timestamp of last update; auto-generated.
  targetElement?: TargetElement | null;// Optional. DOM target the arrow is anchored to.
  position?: CursorPosition | null;    // Optional. Cursor position relative to the annotation.
  locationId?: number | null;          // Optional. Auto-generated from the provided location.
  location?: Location | null;          // Optional. Used to identify the arrow on a sub-document.
  type?: string;                       // Optional. Defaults to "arrow".
  props?: AnnotationProperty;          // Optional. Display metadata (viewport + arrow geometry).
  annotationIndex?: number;            // Optional. 1-based index in the document's annotation list.
  pageInfo?: PageInfo;                 // Optional. Page metadata.
}
```

`type` defaults to `"arrow"` — branching on `annotation.type === 'arrow'` is the cheapest way to distinguish arrows from other annotation kinds in a mixed-feed subscription.

**`AnnotationProperty` shape — arrow geometry lives here:**

```typescript
interface AnnotationProperty {
  viewportWidth?: number;
  viewportHeight?: number;
  screenWidth?: number;
  screenHeight?: number;
  screenScrollHeight?: number;
  arrowLength?: number;                // ← arrow-specific: pixel length at capture
  arrowAngle?: number;                 // ← arrow-specific: rotation in degrees
}
```

`AnnotationProperty` is shared with other Velt annotation types — `arrowLength` and `arrowAngle` are the two fields that are specifically meaningful for arrows. The viewport / screen fields let consumers re-project the arrow correctly on a screen of a different size.

**Common pitfalls:**
- DO NOT treat `annotationId`, `from`, or `props.arrowLength` as guaranteed-present in arbitrary contexts — only `annotationId` and `from` are required. Always null-guard optional fields, especially `props` itself.
- DO NOT infer arrow direction from `position` alone — `props.arrowAngle` is the source of truth for rotation.
- DO NOT confuse `targetElement` (the DOM anchor) with `position` (the cursor reading at draw time). They serve different purposes.

**Verification Checklist:**
- [ ] Code that consumes arrow annotations narrows on `annotation.type === 'arrow'` rather than assuming all annotations are arrows
- [ ] `props?.arrowLength` and `props?.arrowAngle` are read with optional chaining — they're not guaranteed-present
- [ ] Re-projection logic uses `viewportWidth` / `viewportHeight` to scale `arrowLength` if the viewer's screen differs from the author's
- [ ] `from` is treated as a Velt `User` object (with `userId`, `name`, etc.), not a bare string

### Related — `SelectedAnnotationsMap` (forward-compat)

If you eventually consume wireframe `componentConfig.selectedAnnotationsMap` once wireframe-tag interpolation ships for Arrows (see `config-customize` for the current limitation), this is the shape:

```typescript
// Keyed by annotationId — truthy entry means "this annotation is currently selected".
type SelectedAnnotationsMap = Record<string /* annotationId */, CommentAnnotation>;
```

The map is shared across annotation types (comments and arrows alike), keyed by `annotationId`. Today, you don't typically need this in Arrows code — but it's the type the official wireframe-variable docs reference for selection state, so it's documented here for forward-compatibility.

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/models/data-models#arrowannotation
- https://docs.velt.dev/api-reference/sdk/models/data-models#annotationproperty
- https://docs.velt.dev/api-reference/sdk/models/data-models#selectedannotationsmap
