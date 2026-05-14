---
title: AreaAnnotation and supporting types — geometry, multi-target, comment linkage
impact: MEDIUM
impactDescription: The persisted shape that links area rectangles back to their comment threads; needed for any code that subscribes to annotations, exports them, or implements self-hosted persistence
tags: area, AreaAnnotation, AreaProperty, AreaTargetAnnotation, AreaMetadata, targetAnnotations, areaProperties, targetElements, type
---

## AreaAnnotation and supporting types

`AreaAnnotation` is the canonical shape Velt persists for every placed area rectangle. The most important field for understanding the data model is `targetAnnotations: AreaTargetAnnotation[]` — that's the linkage from an area to the comment thread(s) it scopes.

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

### How an Area links back to a Comment

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
