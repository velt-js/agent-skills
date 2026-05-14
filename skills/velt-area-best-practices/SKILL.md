---
name: velt-area-best-practices
description: "Best practices for Velt Area Comments — the rectangle area-annotation feature that lets users draw a region on the page and attach a comment thread to it (Figma-style 'draw a box and comment'). Use whenever the user is toggling area comments on or off (areaComment prop on VeltComments, or commentElement.enableAreaComment / disableAreaComment), customizing the area pin via the velt-area-pin-portal-wireframe tag, binding componentConfig.areaPinAnnotation / componentConfig.selected / componentConfig.isResizing / componentConfig.hideAreaAnnotation template variables, or reading the AreaAnnotation data model (annotationId, from, targetElements, areaProperties, targetAnnotations linking back to comments). Trigger on any task involving Velt area comments, rectangle annotations on documents, draw-a-box-and-comment UI, area pin customization, or the AreaAnnotation / AreaProperty / AreaTargetAnnotation shapes — even if the user does not explicitly say 'Velt' or 'area comments'."
license: MIT
metadata:
  author: velt
  version: "1.0.0"
---

# Velt Area Comments Best Practices

Implementation guide for Velt Area Comments — the rectangle area-annotation feature where users draw a box on the page and attach a comment thread to that region. Area is built on top of the Comments feature: it's not a separate component, it's a mode of `<VeltComments>` that is enabled by default and toggled via a prop or runtime method.

## When to Apply

Reference these guidelines when:
- Toggling area comments on or off in your app (default is ON)
- Choosing between the declarative `areaComment` prop on `<VeltComments>` and the imperative `commentElement.enableAreaComment()` / `disableAreaComment()` API
- Building a custom area pin via the wireframe surface — only `<velt-area-pin-portal-wireframe>` registers; the tool and container do not yet
- Reading `componentConfig.areaPinAnnotation`, `componentConfig.selected`, `componentConfig.isResizing`, `componentConfig.hideAreaAnnotation`, or the geometry / resize-offset variables
- Typing against `AreaAnnotation`, `AreaProperty`, `AreaTargetAnnotation`, or `AreaMetadata`
- Understanding how an `AreaAnnotation` links back to the comment thread(s) it scopes via `targetAnnotations[]`

## Area is a Comments-feature mode

There is **no** standalone `<VeltArea>` component. Area annotations are produced by the Comments feature when the area mode is active. The relevant SDK handle is `client.getCommentElement()` (the comments handle), not a hypothetical `getAreaElement()`. The three Area-specific public elements (`<velt-area-pin-portal>`, `<velt-area-tool>`, `<velt-area-container>`) are rendered automatically by the comments runtime when area mode is enabled.

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | API | HIGH | `api-` |
| 2 | Wireframe Variables | MEDIUM | `wireframe-variables-` |
| 3 | Types | MEDIUM | `types-` |

## Quick Reference

### API (HIGH)
- `api-toggle-area-comments` — `<VeltComments areaComment={false}>` prop and `commentElement.enableAreaComment()` / `disableAreaComment()` runtime methods; the three public Area primitives (tool / pin-portal / container); the "no standalone component" framing

### Wireframe Variables (MEDIUM)
- `wireframe-variables-area` — `<velt-area-pin-portal-wireframe>` (the only Area primitive with a wireframe registration today) and its `componentConfig.*` reference (areaPinAnnotation, selected, isResizing, hideAreaAnnotation, areaProperties, resizingOffset, offsetTop/Left, areaAnnotationColor, commentPinAnnotation link)

### Types (MEDIUM)
- `types-area-annotation` — `AreaAnnotation` shape with the comment-linkage field `targetAnnotations[]` (`AreaTargetAnnotation[]`); supporting `AreaProperty` (geometry) and `AreaMetadata` (open extras); how area pins attach to comment threads

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/api/api-toggle-area-comments.md
rules/shared/wireframe-variables/wireframe-variables-area.md
rules/shared/types/types-area-annotation.md
```

Each rule contains:
- Why it matters
- React / Next.js + Other Frameworks code samples
- Common pitfalls
- Verification checklist
- Source pointers to official docs

## Related skills

- **`velt-comments-best-practices`** — Area is a mode of the comments feature; the `commentElement` handle, comment-annotation shape, and most surrounding setup live in the comments skill. Cross-link rather than duplicate.

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
