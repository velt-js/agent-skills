---
name: velt-reactions-best-practices
description: "Best practices for Velt Inline Reactions — the emoji-reaction feature for adding contextual emoji feedback to elements of your app (articles, posts, images, charts, custom UI). Use whenever the user is adding the VeltInlineReactionsSection component, binding it to a target element via targetReactionElementId, configuring custom reaction emojis (image URLs, iconUrl, or unicode emoji) via setCustomReactions, calling client.getReactionElement(), customizing the wireframe primitives (velt-reaction-tool-wireframe, velt-reaction-pin-wireframe, velt-inline-reactions-section-wireframe, and their nested reactions-panel / tooltip children), binding componentConfig.* template variables (annotation, isReactionSelectedByCurrentUser, tooltipVisible, annotations, targetReactionElementId), or reading the ReactionAnnotation data model. Trigger on any task involving Velt reactions, emoji reactions on content, inline-reactions UI, contextual emoji feedback, or VeltInlineReactionsSection — even if the user does not explicitly say 'Velt' or 'reactions'."
license: MIT
metadata:
  author: velt
  version: "1.0.0"
---

# Velt Reactions Best Practices

Implementation guide for the Velt Inline Reactions feature — emoji reactions anchored to specific elements of your app (articles, posts, images, charts, custom UI). One root component, one required prop, optional custom emoji map, and a rich wireframe layer for building custom UI.

## When to Apply

Reference these guidelines when:
- Adding inline reactions to a page section, post, or any container with a stable element id
- Binding `<VeltInlineReactionsSection>` to that container via `targetReactionElementId`
- Configuring custom reaction emojis (image URLs, alternate `iconUrl`, or unicode emoji)
- Calling `client.getReactionElement().setCustomReactions(...)` from non-React or runtime code
- Building custom reaction UI (custom pin, custom emoji picker, custom tooltip) via the wireframe tags
- Reading `componentConfig.annotation`, `componentConfig.isReactionSelectedByCurrentUser`, `componentConfig.tooltipVisible`, or the per-iteration `user` / `emoji` / `isSelected` context variables
- Typing against `ReactionAnnotation` / `ReactionPinType`

## Related Velt skills

- **Comment reactions** — comments and reactions share the same `setCustomReactions` config; the same custom emoji map flows through `commentElement.setCustomReactions(...)` (see `velt-comments-best-practices`). Configure once at the right scope; don't duplicate per feature.
- **Self-hosting reaction data** — `velt-self-hosting-data-best-practices` documents the resolver-request shapes for persisting reactions yourself (`SaveReactionResolverRequest`, `DeleteReactionResolverRequest`, etc.). Cross-reference, don't duplicate.

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | API | HIGH | `api-` |
| 2 | Wireframe Variables | MEDIUM | `wireframe-variables-` |
| 3 | Types | MEDIUM | `types-` |

## Quick Reference

### API (HIGH)
- `api-setup` — `<VeltInlineReactionsSection targetReactionElementId="...">` placement (must match container `id`); `customReactions` prop + `client.getReactionElement().setCustomReactions()` runtime method; the three custom-emoji entry shapes (`url`, `iconUrl`, `emoji`)

### Wireframe Variables (MEDIUM)
- `wireframe-variables-reactions` — three primary wireframe tags (tool / pin / inline-section); full `componentConfig.*` reference per scope; nested decomposition (reactions-panel items, pin tooltip user rows); context-specific per-iteration variables (`user`, `emoji`, `isSelected`); flat-config access pattern

### Types (MEDIUM)
- `types-reaction-annotation` — `ReactionAnnotation` shape (`annotationId`, `from`, `reactions`, `commentAnnotationId`, `targetElement`, `targetElementId`, `position`, `type='reaction'`, etc.); `ReactionPinType` enum (`'comment' | 'inline' | ...`); cross-link to self-hosting resolver-request shapes

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/api/api-setup.md
rules/shared/wireframe-variables/wireframe-variables-reactions.md
rules/shared/types/types-reaction-annotation.md
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
