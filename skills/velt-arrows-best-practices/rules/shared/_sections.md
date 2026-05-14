# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. API & Setup (api)

**Impact:** HIGH
**Description:** Placement of the `<VeltArrows>` root component and the `<VeltArrowTool>` toolbar trigger, retrieving the `ArrowElement` handle via `client.getArrowElement()`, and the child-slot pattern for replacing the default tool button with a fully custom button.

---

## 2. Configuration (config)

**Impact:** HIGH
**Description:** Behavior configuration — restricting where arrows can be drawn via `allowedElementIds` (both as a `<VeltArrows>` prop and via `arrowElement.allowedElementIds()`), enabling `darkMode`, and CSS-level styling via `::part(container | button-container | button-icon)` on the tool button. Includes the known limitation that Arrows do not yet support `<velt-...-wireframe>` interpolation, so customize via CSS rather than template variables.

---

## 3. Types (types)

**Impact:** MEDIUM
**Description:** The `ArrowAnnotation` data model (annotationId, from, color, targetElement, position, locationId, location, type='arrow', props, annotationIndex, pageInfo) and the shared `AnnotationProperty` shape it points at — viewport dimensions plus the arrow-specific `arrowLength` and `arrowAngle` fields.
