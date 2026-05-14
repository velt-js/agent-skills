# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. API (api)

**Impact:** HIGH
**Description:** Placement of `<VeltInlineReactionsSection>` (and its `<velt-inline-reactions-section>` web-component form) with the required `targetReactionElementId` prop bound to a stable container `id`; configuration of custom reaction emojis through the `customReactions` prop or `client.getReactionElement().setCustomReactions(...)` runtime method; the three entry shapes per reaction (`url`, `iconUrl`, `emoji`).

---

## 2. Wireframe Variables (wireframe-variables)

**Impact:** MEDIUM
**Description:** Template-variable bindings for the Reactions wireframe family — three primary tags (`<velt-reaction-tool-wireframe>` for the "+" emoji picker, `<velt-reaction-pin-wireframe>` for placed emoji pins, `<velt-inline-reactions-section-wireframe>` for the inline strip), plus their nested decomposition (reactions-panel items, pin tooltip user rows, pin emoji + count subcomponents). Uses the **flat-config** access pattern — every read is via `componentConfig.<path>`. Documents per-iteration context variables (`user` inside tooltip rows, `emoji` + `isSelected` inside reactions-panel rows) that are scoped to specific nested tags.

---

## 3. Types (types)

**Impact:** MEDIUM
**Description:** The `ReactionAnnotation` data shape (annotationId, from, reactions, commentAnnotationId, targetElement / targetElementId, position, locationId / location, type='reaction', annotationIndex, pageInfo, icon) and the `ReactionPinType` discriminator (`'comment' | 'inline' | ...`). Cross-references the self-hosting resolver-request shapes (`SaveReactionResolverRequest`, `DeleteReactionResolverRequest`, etc.) documented in `velt-self-hosting-data-best-practices` without duplicating them.
