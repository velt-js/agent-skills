---
name: velt-arrows-best-practices
description: "Best practices for Velt Arrows — the directional arrow annotation feature that lets users draw arrows pinned to DOM elements for visual feedback, design review, or collaborative pointing. Use whenever the user is adding Velt Arrows to their app, placing the VeltArrows or VeltArrowTool components, restricting arrows to specific DOM regions via allowedElementIds, enabling dark mode, customizing the arrow tool button (CSS ::part hooks or full custom-button slot replacement), reading the ArrowAnnotation data model (annotationId, from, targetElement, position, props.arrowLength / props.arrowAngle), or working with the ArrowElement API (client.getArrowElement). Triggers on any task involving Velt Arrows, drawn arrow pins, arrow annotations, directional pointing UI, design-review arrows, the VeltArrows / VeltArrowTool / velt-arrows / velt-arrow-tool web components, or ArrowAnnotation — even when the user does not explicitly say 'Velt' or 'arrows'."
license: MIT
metadata:
  author: velt
  version: "1.0.0"
---

# Velt Arrows Best Practices

Implementation guide for the Velt Arrows feature — a directional-arrow annotation primitive that lets users draw arrows pinned to DOM elements (or specific regions of them) for visual feedback, design review, and collaborative pointing.

## When to Apply

Reference these guidelines when:
- Setting up Velt Arrows in a React, Next.js, or HTML app
- Placing the `<VeltArrows>` (or `<velt-arrows>`) root component and the `<VeltArrowTool>` (or `<velt-arrow-tool>`) trigger
- Restricting where arrows can be drawn via `allowedElementIds` (prop OR `arrowElement.allowedElementIds()` method)
- Enabling `darkMode`
- Replacing the default arrow-tool button with a custom button (child-slot pattern)
- Styling the arrow tool via CSS `::part(...)` hooks
- Typing against `ArrowAnnotation` and `AnnotationProperty` (including `arrowLength` / `arrowAngle`) from the data model
- Calling `client.getArrowElement()` to get the `ArrowElement` handle

For general SDK setup (`VeltProvider`, auth, document identity) see `velt-setup-best-practices`. For UI-customization concepts that overlap with other Velt features, see `velt-comments-best-practices`.

## Known limitation — wireframe-tag interpolation

Arrows do NOT currently expose `<velt-...-wireframe>` registrations, so the `velt-data` / `velt-if` / `velt-class` template-variable system available on Comments / Activity / Notifications wireframes is **not yet supported on Arrows**. Customize via CSS parts and the custom-button slot until wireframe-tag registration ships. This is called out in the relevant rules so agents don't suggest a wireframe pattern that doesn't yet work.

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | API & Setup | HIGH | `api-` |
| 2 | Configuration | HIGH | `config-` |
| 3 | Types | MEDIUM | `types-` |

## Quick Reference

### API & Setup (HIGH)
- `api-setup` — `VeltArrows` (root) + `VeltArrowTool` (toolbar trigger); `client.getArrowElement()`; custom-button child slot pattern

### Configuration (HIGH)
- `config-customize` — `allowedElementIds` (prop and method form), `darkMode`, CSS `::part(container | button-container | button-icon)` hooks; wireframe-tag limitation

### Types (MEDIUM)
- `types-arrow-annotation` — `ArrowAnnotation` shape (annotationId, from, color, targetElement, position, locationId, location, props, annotationIndex, pageInfo) and `AnnotationProperty` (viewport dimensions, `arrowLength`, `arrowAngle`)

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/api/api-setup.md
rules/shared/config/config-customize.md
rules/shared/types/types-arrow-annotation.md
```

Each rule contains:
- Why it matters
- React / Next.js + Other Frameworks code samples
- Common pitfalls
- Verification checklist
- Source pointers to official docs

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
