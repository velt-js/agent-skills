---
title: ReactionAnnotation and ReactionPinType — data shapes for placed reactions
impact: MEDIUM
impactDescription: The canonical shape returned for placed reactions and stored on the document; needed for any code that subscribes to reactions, persists them via self-hosting, or builds custom analytics
tags: reactions, ReactionAnnotation, ReactionPinType, annotationId, commentAnnotationId, targetElementId, reactions, type, self-hosting
---

## ReactionAnnotation and ReactionPinType — data shapes for placed reactions

`ReactionAnnotation` is the canonical shape Velt persists for every placed reaction. Code that subscribes to reactions, exports them, builds custom analytics, or implements a self-hosting data provider types against this shape.

**`ReactionAnnotation` shape:**

```typescript
interface ReactionAnnotation {
  annotationId: string;                       // Required. Unique id; auto-generated.
  from?: User;                                // Optional. User who created the reaction.
  reactions?: Reaction[];                     // Optional. Individual reactions on this annotation.
  commentAnnotationId?: string;               // Optional. Connected comment annotation id when the reaction is on a comment.
  targetElement?: TargetElement | null;       // Optional. DOM target the reaction is placed on.
  targetElementId?: string | null;            // Optional. Target element id provided by you (matches inline-section's targetReactionElementId).
  position?: CursorPosition | null;           // Optional. Cursor position at place-time.
  locationId?: number | null;                 // Optional. Auto-generated from the provided location.
  location?: Location | null;                 // Optional. Sub-document scoping.
  type?: string;                              // Optional. Defaults to "reaction".
  annotationIndex?: number;                   // Optional. 1-based index.
  pageInfo?: PageInfo;                        // Optional. Page metadata.
  icon?: string;                              // Optional. Icon identifier for the reaction.
  iconUrl?: string;                           // Optional. URL of a custom reaction icon image.
  iconEmoji?: string;                         // Optional. Emoji character used as the reaction icon.
  lastUpdated?: any;                          // Optional. Timestamp when the annotation was last updated (auto-generated).
  metadata?: ReactionMetadata;                // Optional. Custom metadata attached to the annotation.
  context?: Context;                          // Optional. Context object for the annotation.
}
```

**`Reaction` (the per-entry shape inside `reactions[]`):**

```typescript
interface Reaction {
  variant?: string;       // Optional. Emoji variant identifier.
  from: User;             // Required. User who added this individual reaction.
  lastUpdated?: Date;     // Optional. Timestamp when this reaction was added (auto-generated).
}
```

A single `ReactionAnnotation` can hold multiple `Reaction` entries when multiple users have reacted with the same emoji to the same target. `from` on the annotation is the original creator; `reactions[i].from` is each individual reactor.

`type` defaults to `"reaction"` — narrow on `annotation.type === 'reaction'` to distinguish reactions from other annotation kinds in a mixed-feed subscription.

`commentAnnotationId` is the link to a parent comment when the reaction lives on a comment thread (vs. inline on page content). Inline-section reactions have it `undefined` and use `targetElementId` instead.

### `ReactionPinType` discriminator

The `ReactionPinType` type distinguishes pin display locations when you're consuming pin-scope wireframe variables (`componentConfig.type` on `<velt-reaction-pin-wireframe>`):

**`ReactionPinType` values (exact docs definition):**

```typescript
type ReactionPinType = "timeline" | "comment" | "standalone";
```

```
'timeline'     Pin reaction to a timeline view.
'comment'      Pin reaction to comment context.
'standalone'   Display reaction independently.
```

Note: there is **no** `'inline'` value — that was a common-sense guess that doesn't match the actual type. Narrow on the three documented literals (`'timeline'` / `'comment'` / `'standalone'`).

### Self-hosting data — cross-reference

If you're self-hosting reaction data, see two sources for the full picture:

- **`velt-self-hosting-data-best-practices`** — Python resolver-request shapes (`SaveReactionResolverRequest`, `DeleteReactionResolverRequest`, `GetReactionResolverRequest`). None of these include `commentId`; the canonical fields are `organizationId`, `documentId`, and (for delete) `reactionId`.
- **Velt docs `self-host-data/reactions.mdx`** — the comprehensive reactions data-provider page covering the endpoint-based vs function-based `ReactionAnnotationDataProvider`, `getConfig` / `saveConfig` / `deleteConfig` endpoint configs, `resolveTimeout` and retry configs (`getRetryConfig` / `saveRetryConfig` / `deleteRetryConfig`), the `additionalFields` option, backend examples (MongoDB / PostgreSQL), and debugging via `client.on('dataProvider')`.

This skill does not duplicate those payload shapes — read the linked sources for the full schemas before implementing a provider.

### Event-side cross-reference (comments + reactions)

When reactions are attached to comments, the comment-element event stream emits `addReaction`, `deleteReaction`, and `toggleReaction` events. Those events live in the comments skill (`velt-comments-best-practices`) — they aren't part of the inline-reactions surface but you'll encounter them if you're subscribing to comment-element events on documents that also have reactions.

**Common pitfalls:**
- DO NOT treat `commentAnnotationId` as guaranteed-present — it is only set for reactions attached to comments. Inline-section reactions have it `undefined`.
- DO NOT treat `from` as required — although typical reactions have it, the type allows `undefined`. Null-guard.
- DO NOT confuse `targetElement` (the DOM anchor) with `targetElementId` (the string id the host code provided) — both can be present; `targetElementId` is the stable handle.
- DO NOT assume `type` is exclusively `'reaction'` — narrow on it explicitly when consuming a mixed annotation feed.

**Verification Checklist:**
- [ ] Code that consumes reaction annotations narrows on `annotation.type === 'reaction'`
- [ ] Optional fields (`from`, `commentAnnotationId`, `position`, `props`) are null-guarded
- [ ] Self-hosting resolver payloads use the canonical fields (`organizationId`, `documentId`, `reactionId`) — not `commentId`
- [ ] Pin-scope `componentConfig.type` is treated as a `ReactionPinType` value drawn from `'timeline' | 'comment' | 'standalone'` (NOT `'inline'`, which is not a valid value)

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/models/data-models#reactionannotation
- https://docs.velt.dev/api-reference/sdk/models/data-models#reaction
- https://docs.velt.dev/api-reference/sdk/models/data-models#reactionpintype
- https://docs.velt.dev/api-reference/sdk/models/data-models#reactionmetadata
- https://docs.velt.dev/self-host-data/reactions — comprehensive reactions data-provider guide
- velt-self-hosting-data-best-practices — Python resolver-request shapes (`python-users-reactions.md`)
- velt-comments-best-practices — `addReaction` / `deleteReaction` / `toggleReaction` comment events
