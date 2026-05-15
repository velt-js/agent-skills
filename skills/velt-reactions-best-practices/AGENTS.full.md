# Velt Reactions Best Practices

**Version 1.0.0**  
Velt  
May 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Velt Inline Reactions implementation guide — the emoji-reaction feature for adding contextual emoji feedback to elements of your app. Covers VeltInlineReactionsSection placement with required targetReactionElementId binding, custom reaction emoji configuration (url / iconUrl / emoji) via the customReactions prop or client.getReactionElement().setCustomReactions(), the wireframe primitives (velt-reaction-tool-wireframe, velt-reaction-pin-wireframe, velt-inline-reactions-section-wireframe) and their nested children, and the ReactionAnnotation data shape.

---

## Table of Contents

1. [API](#1-api) — **HIGH**
   - 1.1 [Place VeltInlineReactionsSection with targetReactionElementId; configure custom reaction emojis via prop or setCustomReactions](#11-place-veltinlinereactionssection-with-targetreactionelementid-configure-custom-reaction-emojis-via-prop-or-setcustomreactions)

2. [Wireframe Variables](#2-wireframe-variables) — **MEDIUM**
   - 2.1 [Reactions wireframe variables — tool, pin, and inline-section componentConfig.* bindings + per-iteration context variables (user / emoji / isSelected)](#21-reactions-wireframe-variables-tool-pin-and-inline-section-componentconfig-bindings-per-iteration-context-variables-user-emoji-isselected)

3. [Types](#3-types) — **MEDIUM**
   - 3.1 [ReactionAnnotation and ReactionPinType — data shapes for placed reactions](#31-reactionannotation-and-reactionpintype-data-shapes-for-placed-reactions)

---

## 1. API

**Impact: HIGH**

Placement of `<VeltInlineReactionsSection>` (and its `<velt-inline-reactions-section>` web-component form) with the required `targetReactionElementId` prop bound to a stable container `id`; configuration of custom reaction emojis through the `customReactions` prop or `client.getReactionElement().setCustomReactions(...)` runtime method; the three entry shapes per reaction (`url`, `iconUrl`, `emoji`).

### 1.1 Place VeltInlineReactionsSection with targetReactionElementId; configure custom reaction emojis via prop or setCustomReactions

**Impact: HIGH (targetReactionElementId must match a real container id or the reactions strip has nothing to anchor to; custom emojis ship in three distinct entry shapes (url / iconUrl / emoji) and mixing them up produces a silent no-op)**

The Inline Reactions feature is one component bound to a container element by id. Add the container, give it a stable `id`, then mount `<VeltInlineReactionsSection>` inside it with `targetReactionElementId` set to that same `id`. Reactions placed on this section anchor to the container.

**Minimal setup (React / Next.js):**

```tsx
import { VeltInlineReactionsSection } from '@veltdev/react';

export function Article() {
  return (
    <section id="article-42">
      <div>...your article content...</div>

      <VeltInlineReactionsSection targetReactionElementId="article-42" />
    </section>
  );
}
```

**Minimal setup (Other Frameworks):**

```html
<section id="article-42">
  <div>...your article content...</div>

  <velt-inline-reactions-section
    target-reaction-element-id="article-42">
  </velt-inline-reactions-section>
</section>
```

The two forms are equivalent — in React JSX use `targetReactionElementId` (camelCase prop); in HTML / web components use `target-reaction-element-id` (kebab-case attribute). The string must match the container's `id` attribute exactly.
By default the emoji picker shows a built-in set. To replace or extend it, pass a `customReactions` map. Each entry is keyed by a stable `reactionId` you choose, and the value is one of three shapes:

**Custom reactions map — entry shapes:**

```ts
type CustomReactionEntry =
  | { url: string }       // Image URL (the canonical form). Loaded as an <img>.
  | { iconUrl: string }   // Alternate image URL field (also accepted).
  | { emoji: string };    // Unicode emoji text. Rendered as text.

type CustomReactionsMap = { [reactionId: string]: CustomReactionEntry };
```

You can mix shapes within a single map — some entries can be image URLs, others can be unicode emojis. Each reactionId is the stable handle used in storage and analytics, so pick something you can grep for later (e.g., `"fire"`, `"laugh-cry"`, not random IDs).

**Custom reactions via prop (React / Next.js):**

```tsx
const customReactions = {
  fire: { url: "https://em-content.zobj.net/source/apple/391/fire_1f525.png" },
  brand: { iconUrl: "https://cdn.example.com/icons/brand-react.png" },
  laughCry: { emoji: "🤣" },
};

<VeltInlineReactionsSection
  targetReactionElementId="article-42"
  customReactions={customReactions}
/>
```

**Custom reactions via the runtime method (React / Next.js):**

```tsx
const reactionElement = client.getReactionElement();
reactionElement.setCustomReactions({
  fire:     { url: "https://em-content.zobj.net/source/apple/391/fire_1f525.png" },
  brand:    { iconUrl: "https://cdn.example.com/icons/brand-react.png" },
  laughCry: { emoji: "🤣" },
});
```

**Custom reactions via the runtime method (Other Frameworks):**

```js
const reactionElement = Velt.getReactionElement();
reactionElement.setCustomReactions({
  fire:     { url: "..." },
  laughCry: { emoji: "🤣" },
});
```

The prop and the runtime method are equivalent — the prop is declarative and survives re-renders; the runtime method is useful when the emoji set changes based on app state.
The default Velt component is encapsulated in Shadow DOM so your app's CSS doesn't interfere. Disable it if you want to apply your own CSS to the internals.

**Disable Shadow DOM (React / Next.js):**

```tsx
<VeltInlineReactionsSection
  targetReactionElementId="article-42"
  shadowDom={false}
/>
```

**Disable Shadow DOM (Other Frameworks):**

```html
<velt-inline-reactions-section
  target-reaction-element-id="article-42"
  shadow-dom="false">
</velt-inline-reactions-section>
```

Enable dark mode via prop or via the runtime API methods on `reactionElement`:

**Dark mode prop (React / Next.js):**

```tsx
<VeltInlineReactionsSection
  targetReactionElementId="article-42"
  darkMode={true}
/>
```

**Dark mode runtime API:**

```js
const reactionElement = client.getReactionElement();   // or Velt.getReactionElement() for non-React
reactionElement.enableDarkMode();
reactionElement.disableDarkMode();
```

The prop is the right path when dark mode is part of an initial render; the runtime API is the right path when dark mode toggles in response to user action.
Inline Reactions ships with one pre-defined variant — `"inline"` — that customizes the default components inside the Inline Reactions section. You can also define your own variant names and reuse the same wireframe template in different places.

**Built-in variant (React / Next.js):**

```tsx
<VeltWireframe>
  <VeltInlineReactionsSection variant="inline" />
</VeltWireframe>
```

**Built-in variant (Other Frameworks):**

```html
<velt-wireframe style="display:none;">
  <velt-inline-reactions-section variant="inline"></velt-inline-reactions-section>
</velt-wireframe>
```

Custom variants behave identically — pick a stable name and reference it from the wireframe slot to keep multiple placements in sync.
`setCustomReactions` also exists on `commentElement` (`client.getCommentElement().setCustomReactions(...)`) for the same map shape. If you want one custom emoji set across both inline reactions and comment reactions, set it on whichever element matches the scope of the change — for app-wide custom emojis you typically set it once on the comment element and the inline strip picks up the same set. See `velt-comments-best-practices` for the comments-specific path.

---

## 2. Wireframe Variables

**Impact: MEDIUM**

Template-variable bindings for the Reactions wireframe family — three primary tags (`<velt-reaction-tool-wireframe>` for the "+" emoji picker, `<velt-reaction-pin-wireframe>` for placed emoji pins, `<velt-inline-reactions-section-wireframe>` for the inline strip), plus their nested decomposition (reactions-panel items, pin tooltip user rows, pin emoji + count subcomponents). Uses the **flat-config** access pattern — every read is via `componentConfig.<path>`. Documents per-iteration context variables (`user` inside tooltip rows, `emoji` + `isSelected` inside reactions-panel rows) that are scoped to specific nested tags.

### 2.1 Reactions wireframe variables — tool, pin, and inline-section componentConfig.* bindings + per-iteration context variables (user / emoji / isSelected)

**Impact: MEDIUM (Three primary wireframe tags plus nested children make up the reactions UI; binding componentConfig is how you build a fully custom emoji picker / pin / tooltip while still being driven by the same data stream)**

The Reactions feature exposes three primary wireframe tags. Each receives its own `componentConfig.*` data stream, plus there are nested children for the reactions-panel (emoji picker rows) and the reaction-pin (emoji glyph, count badge, hover tooltip with per-reactor rows). All variables use the **flat-config** access pattern — every read is via `componentConfig.<path>`. Dropping the prefix (`<velt-data field="annotation" />`) resolves to nothing.

### Three primary wireframe tags

**Wireframe wrapper (React / Next.js):**

```tsx
import { VeltWireframe } from '@veltdev/react';

<VeltWireframe>
  {/* ...your wireframe definitions... */}
</VeltWireframe>
```

**Wireframe wrapper (Other Frameworks):**

```html
<velt-wireframe style="display:none;">
  <!-- your wireframe definitions -->
</velt-wireframe>
```

The HTML form requires the inline `style="display:none;"` (the React form hides itself automatically).
In React, the nested wireframe tags are also exposed as dot-notation members of the parent component. Both forms compile to the same registration; pick whichever reads better in your code:

**Dot-notation (React) — equivalent to the flat tag names:**

```tsx
<VeltWireframe>
  <VeltInlineReactionsSectionWireframe>
    <VeltInlineReactionsSectionWireframe.Panel>
      <VeltInlineReactionsSectionWireframe.ToolContainer />
      <VeltInlineReactionsSectionWireframe.List />
    </VeltInlineReactionsSectionWireframe.Panel>
  </VeltInlineReactionsSectionWireframe>
</VeltWireframe>
<VeltWireframe>
  <VeltInlineReactionsSectionWireframe>
    <VeltInlineReactionsSectionPanelWireframe>
      <VeltInlineReactionsSectionToolContainerWireframe />
      <VeltInlineReactionsSectionListWireframe />
    </VeltInlineReactionsSectionPanelWireframe>
  </VeltInlineReactionsSectionWireframe>
</VeltWireframe>
```

Equivalent to:
The dot-notation form is the convention in the official React docs examples; the flat-tag form mirrors the web-component HTML names. Use whichever matches your codebase style.

**Tool-scope variables (`<velt-reaction-tool-wireframe>`):**

```typescript
componentConfig.variant                string                   Wireframe variant id.
componentConfig.onClickOutside         Function                 Close handler — call from a click-outside region.
componentConfig.handleEmojiSelected    Function                 Emoji-selection handler. Call with the chosen emoji string.
componentConfig.excludeReactionIds     string[]                 Reaction ids to hide from the picker.
```

**Pin-scope variables (`<velt-reaction-pin-wireframe>`):**

```typescript
componentConfig.type                              ReactionPinType     'timeline' | 'comment' | 'standalone' (pin variant).
componentConfig.annotationId                      string              The reaction-annotation id this pin represents.
componentConfig.annotation                        ReactionAnnotation  Full annotation: from, emoji, users, createdAt, ...
componentConfig.disableTooltip                    boolean             Hide the hover tooltip.
componentConfig.customTooltipTemplate             TemplateRef<any>    Optional custom tooltip template ref (programmatic only — set via the
                                                                      [template] input on the element; not bindable from wireframe markup).
componentConfig.isReactionSelectedByCurrentUser   boolean             Local user has reacted with this emoji.
componentConfig.user                              User                Currently identified end-user.
componentConfig.tooltipVisible                    boolean             Tooltip is currently open.
componentConfig.shadowDom                         boolean             Shadow-DOM rendering enabled (host config).
componentConfig.variant                           string              Wireframe variant id.
componentConfig.excludeReactionIds                string[]            Reaction ids to hide.
componentConfig.commentReactionAnnotationIds      string[]            When the pin lives next to a comment, the full list of reactions on the comment.
```

**Custom reaction pin (React) — highlight when the local user has reacted, show a count badge when N > 1:**

```tsx
import { VeltWireframe, VeltReactionPinWireframe } from '@veltdev/react';

<VeltWireframe>
  <VeltReactionPinWireframe
    veltClass="'is-mine': {componentConfig.isReactionSelectedByCurrentUser}">
    <button className="my-pin">
      <span><VeltData field="componentConfig.annotation.emoji" /></span>
      <VeltIf condition="{componentConfig.annotation.users.length} > 1">
        <span>
          <VeltData field="componentConfig.annotation.users.length" />
        </span>
      </VeltIf>
    </button>
  </VeltReactionPinWireframe>
</VeltWireframe>
```

**Custom reaction pin (Other Frameworks):**

```html
<velt-wireframe style="display:none;">
  <velt-reaction-pin-wireframe
    velt-class="'is-mine': {componentConfig.isReactionSelectedByCurrentUser}">
    <button class="my-pin">
      <span><velt-data field="componentConfig.annotation.emoji"></velt-data></span>
      <span velt-if="{componentConfig.annotation.users.length} > 1">
        <velt-data field="componentConfig.annotation.users.length"></velt-data>
      </span>
    </button>
  </velt-reaction-pin-wireframe>
</velt-wireframe>
```

**Inline-section variables (`<velt-inline-reactions-section-wireframe>`):**

```typescript
componentConfig.targetReactionElementId      string                       Anchor element id (matches the host attr).
componentConfig.annotations                  ReactionAnnotation[]         Reactions placed on this target.
componentConfig.user                         User | null                  Currently identified end-user.
componentConfig.skeletonLoading              boolean                      Skeleton loader is active.
componentConfig.darkMode                     boolean                      Dark mode is active.
componentConfig.variant                      string                       Per-instance variant tag.
componentConfig.shadowDom                    boolean                      Shadow-DOM rendering enabled.
componentConfig.onEmojiSelected              (emoji: string) => void      Emoji-picked handler.
componentConfig.onReactionClick              (ann: ReactionAnnotation) => void   Pin-click handler.
componentConfig.reactionAnnotationsTrackByFn Function                     Internal — identity function for list tracking.
```

The reaction-pin and the inline-section / reactions-panel each have their own child wireframe tags. Each child inherits its parent's `componentConfig` and may also expose **context-specific** per-iteration variables that are ONLY resolvable inside specific tags.

**Reaction pin children (`<velt-reaction-pin-wireframe>` → ...):**

```typescript
<velt-reaction-pin-emoji-wireframe>             The emoji glyph itself.
<velt-reaction-pin-count-wireframe>             The "+N" count badge when multiple users reacted with the same emoji.
<velt-reaction-pin-tooltip-users-wireframe>     The hover tooltip wrapper listing all reactors.
<velt-reaction-pin-tooltip-user-wireframe>      A single reactor row inside the tooltip (iterated). EXPOSES context var: `user`.
<velt-reaction-pin-tooltip-user-avatar-wireframe>   Avatar inside a tooltip row. Reads `user.photoUrl`.
<velt-reaction-pin-tooltip-user-name-wireframe>     Name inside a tooltip row. Reads `user.name`.
```

**Inline-section children (`<velt-inline-reactions-section-wireframe>` → ...):**

```typescript
<velt-inline-reactions-section-tool-container-wireframe>   Wraps the emoji-picker tool.
<velt-inline-reactions-section-panel-wireframe>            Panel wrapper that hosts the reaction list.
<velt-inline-reactions-section-list-wireframe>             Iterates componentConfig.annotations; renders one reaction-pin per entry.
```

**Reactions Panel children (the emoji picker that opens when the user clicks the tool "+" button):**

```typescript
<velt-reactions-panel-items-wireframe>          The list wrapper that iterates the filtered emojis.
<velt-reactions-panel-item-wireframe>           A single emoji row. EXPOSES context vars: `emoji`, `isSelected`.
<velt-reactions-panel-item-emoji-wireframe>     The emoji glyph itself. EXPOSES context var: `emoji`.
user        User                       Inside <velt-reaction-pin-tooltip-user-wireframe> and its children.
                                       Iterated — one per reactor in the tooltip.
emoji       { key, value, name? }      Inside <velt-reactions-panel-item-wireframe> and -item-emoji-wireframe.
                                       Iterated — one per emoji in the picker.
isSelected  boolean                    Inside <velt-reactions-panel-item-wireframe>.
                                       True for the currently-selected emoji row.
```

These three are ONLY resolvable inside the specific nested tags noted. They are NOT visible from the parent or sibling wireframes.

**Custom emoji-picker row + tooltip user row (React):**

```tsx
import {
  VeltWireframe,
  VeltReactionsPanelItemWireframe,
  VeltReactionsPanelItemEmojiWireframe,
  VeltReactionPinTooltipUserWireframe,
} from '@veltdev/react';

<VeltWireframe>
  {/* Emoji picker row (reactions-panel) — uses context vars emoji + isSelected */}
  <VeltReactionsPanelWireframe.Items.Item>
    <button className="my-emoji-row">
      <VeltReactionsPanelWireframe.Items.Item.Emoji>
        <span className="my-emoji">
          <VeltData field="emoji.value" />
        </span>
      </VeltReactionsPanelWireframe.Items.Item.Emoji>
      <VeltData field="emoji.name" />
    </button>
  </VeltReactionsPanelWireframe.Items.Item>

  {/* Tooltip reactor row (reaction-pin tooltip) — uses context var user */}
  <VeltReactionPinTooltipUserWireframe>
    <li className="reactor-row">
      <VeltIf condition="{user.photoUrl}"><img /></VeltIf>
      <VeltData field="user.name" />
    </li>
  </VeltReactionPinTooltipUserWireframe>
</VeltWireframe>
```

Each wireframe slot only sees its own `componentConfig` scope plus its assigned per-iteration context variables:
- Tool-scope variables (`handleEmojiSelected`, `excludeReactionIds`) are not visible inside the pin or inline-section wireframes.
- Pin-scope variables (`annotation`, `isReactionSelectedByCurrentUser`, `tooltipVisible`) are not visible inside the inline-section wireframe.
- Inline-section variables (`annotations[]`, `skeletonLoading`, `darkMode`) are not visible inside the pin or tool wireframes.
- The per-iteration `user`, `emoji`, `isSelected` are ONLY visible inside the specific iterated rows.

---

## 3. Types

**Impact: MEDIUM**

The `ReactionAnnotation` data shape (annotationId, from, reactions, commentAnnotationId, targetElement / targetElementId, position, locationId / location, type='reaction', annotationIndex, pageInfo, icon) and the `ReactionPinType` discriminator (`'comment' | 'inline' | ...`). Cross-references the self-hosting resolver-request shapes (`SaveReactionResolverRequest`, `DeleteReactionResolverRequest`, etc.) documented in `velt-self-hosting-data-best-practices` without duplicating them.

### 3.1 ReactionAnnotation and ReactionPinType — data shapes for placed reactions

**Impact: MEDIUM (The canonical shape returned for placed reactions and stored on the document; needed for any code that subscribes to reactions, persists them via self-hosting, or builds custom analytics)**

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
The `ReactionPinType` type distinguishes pin display locations when you're consuming pin-scope wireframe variables (`componentConfig.type` on `<velt-reaction-pin-wireframe>`):

**`ReactionPinType` values (exact docs definition):**

```typescript
type ReactionPinType = "timeline" | "comment" | "standalone";
'timeline'     Pin reaction to a timeline view.
'comment'      Pin reaction to comment context.
'standalone'   Display reaction independently.
```

Note: there is **no** `'inline'` value — that was a common-sense guess that doesn't match the actual type. Narrow on the three documented literals (`'timeline'` / `'comment'` / `'standalone'`).
If you're self-hosting reaction data, see two sources for the full picture:
- **`velt-self-hosting-data-best-practices`** — Python resolver-request shapes (`SaveReactionResolverRequest`, `DeleteReactionResolverRequest`, `GetReactionResolverRequest`). None of these include `commentId`; the canonical fields are `organizationId`, `documentId`, and (for delete) `reactionId`.
- **Velt docs `self-host-data/reactions.mdx`** — the comprehensive reactions data-provider page covering the endpoint-based vs function-based `ReactionAnnotationDataProvider`, `getConfig` / `saveConfig` / `deleteConfig` endpoint configs, `resolveTimeout` and retry configs (`getRetryConfig` / `saveRetryConfig` / `deleteRetryConfig`), the `additionalFields` option, backend examples (MongoDB / PostgreSQL), and debugging via `client.on('dataProvider')`.
This skill does not duplicate those payload shapes — read the linked sources for the full schemas before implementing a provider.
When reactions are attached to comments, the comment-element event stream emits `addReaction`, `deleteReaction`, and `toggleReaction` events. Those events live in the comments skill (`velt-comments-best-practices`) — they aren't part of the inline-reactions surface but you'll encounter them if you're subscribing to comment-element events on documents that also have reactions.

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/async-collaboration/reactions/overview
- https://docs.velt.dev/async-collaboration/reactions/setup
- https://docs.velt.dev/async-collaboration/reactions/customize-behavior
- https://docs.velt.dev/ui-customization/features/async/reactions-wireframe-variables
- https://docs.velt.dev/ui-customization/features/async/inline-reactions
- https://docs.velt.dev/api-reference/sdk/models/data-models#reactionannotation
