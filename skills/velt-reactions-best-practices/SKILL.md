---
name: velt-reactions-best-practices
description: "Best practices for Velt Inline Reactions, emoji reactions anchored to elements of your app (articles, posts, images, charts). Use when adding VeltInlineReactionsSection with targetReactionElementId, configuring custom emojis (url, iconUrl, emoji) via customReactions or setCustomReactions, using getReactionElement or useReactionElement, building custom UI with the reaction wireframes and componentConfig variables, or typing ReactionAnnotation. Triggers on Velt reactions or emoji feedback on content."
license: MIT
metadata:
  author: velt
  version: "1.0.1"
---

# Velt Reactions Best Practices

Implementation guide for the Velt Inline Reactions feature — emoji reactions anchored to specific elements of your app (articles, posts, images, charts, custom UI). One root component, one required prop, optional custom emoji map, and a rich wireframe layer for building custom UI.

## When to Apply

Reference these guidelines when:
- Adding inline reactions to a page section, post, or any container with a stable element id
- Binding `<VeltInlineReactionsSection>` to that container via `targetReactionElementId`
- Configuring custom reaction emojis (image URLs, alternate `iconUrl`, or unicode emoji)
- Calling `setCustomReactions(...)` on the reaction element from `useReactionElement()`, `client.getReactionElement()`, or `Velt.getReactionElement()`
- Including `'reaction'` in a v6 `featureAllowList`
- Reasoning about reactions on private comments (they do not inherit the comment's Access Context)
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
- `api-setup` — `<VeltInlineReactionsSection targetReactionElementId="...">` placement (must match container `id`); `customReactions` prop + `setCustomReactions()` via `useReactionElement()` / `client.getReactionElement()`; the three custom-emoji entry shapes (`url`, `iconUrl`, `emoji`); `featureAllowList` key `'reaction'`

### Wireframe Variables (MEDIUM)
- `wireframe-variables-reactions` — three primary wireframe tags (tool / pin / inline-section); full `componentConfig.*` reference per scope; nested decomposition (reactions-panel items, pin tooltip user rows); context-specific per-iteration variables (`user`, `emoji`, `isSelected`); flat-config access pattern

### Types (MEDIUM)
- `types-reaction-annotation` — `ReactionAnnotation` shape (`annotationId`, `from`, `reactions`, `commentAnnotationId`, `targetElement`, `targetElementId`, `position`, `type='reaction'`, etc.); `ReactionPinType` enum (`'comment' | 'inline' | ...`); reactions on private comments and Access Context; cross-link to self-hosting resolver-request shapes and `/self-hosting/partial/reactions`

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
