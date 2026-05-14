# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. API (api)

**Impact:** HIGH
**Description:** The Area feature is a mode of the Comments feature — there is no standalone `<VeltArea>` component and no `getAreaElement()` handle. Toggle area comments via the `areaComment` prop on `<VeltComments>` or via `commentElement.enableAreaComment()` / `disableAreaComment()` at runtime. Area mode is on by default. The three Area-specific public elements (`<velt-area-tool>`, `<velt-area-pin-portal>`, `<velt-area-container>`) are rendered automatically by the comments runtime.

---

## 2. Wireframe Variables (wireframe-variables)

**Impact:** MEDIUM
**Description:** Template-variable bindings for the Area feature. Only one primitive registers a wireframe tag today: `<velt-area-pin-portal-wireframe>` (React: `VeltAreaPinPortalWireframe`). The tool and container primitives do not. Uses the **flat-config** access pattern — every read is via `componentConfig.<path>`. Variables cover the annotation (`areaPinAnnotation`, `areaPinAnnotationOnResize`), the optional linked comment (`commentPinAnnotation`), selection / resize / hidden state (`selected`, `isResizing`, `hideAreaAnnotation`), the styling color (`areaAnnotationColor`), and the geometry / offset numbers (`areaProperties`, `resizingOffset.top`/`left`, `offsetTop`, `offsetLeft`).

---

## 3. Types (types)

**Impact:** MEDIUM
**Description:** The `AreaAnnotation` data shape — including `targetElements: (TargetElement | null)[]` (plural, supporting multi-element targeting), `areaProperties: AreaProperty` (resize-handle geometry), `targetAnnotations: AreaTargetAnnotation[]` (the linkage to comment / tag threads attached to this area), and `metadata: AreaMetadata` (open extras). Plus the three supporting types `AreaProperty`, `AreaTargetAnnotation`, and `AreaMetadata`. The `type` field defaults to `'area'`.
