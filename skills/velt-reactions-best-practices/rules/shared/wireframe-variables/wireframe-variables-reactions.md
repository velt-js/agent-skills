---
title: Reactions wireframe variables — tool, pin, and inline-section componentConfig.* bindings + per-iteration context variables (user / emoji / isSelected)
impact: MEDIUM
impactDescription: Three primary wireframe tags plus nested children make up the reactions UI; binding componentConfig is how you build a fully custom emoji picker / pin / tooltip while still being driven by the same data stream
tags: reactions, wireframe, template-variables, velt-data, velt-if, velt-class, componentConfig, ReactionAnnotation, ReactionPinType, tooltipVisible, isReactionSelectedByCurrentUser, isSelected, emoji
---

## Reactions wireframe variables — tool, pin, inline-section

The Reactions feature exposes three primary wireframe tags. Each receives its own `componentConfig.*` data stream, plus there are nested children for the reactions-panel (emoji picker rows) and the reaction-pin (emoji glyph, count badge, hover tooltip with per-reactor rows). All variables use the **flat-config** access pattern — every read is via `componentConfig.<path>`. Dropping the prefix (`<velt-data field="annotation" />`) resolves to nothing.

### Three primary wireframe tags

```
<velt-reaction-tool-wireframe>            The "+" emoji-picker button.
<velt-reaction-pin-wireframe>             A single placed emoji reaction (pin) on the page or next to a comment.
<velt-inline-reactions-section-wireframe> The inline strip — hosts the tool + the list of pins for a target.
```

React equivalents: `VeltReactionToolWireframe`, `VeltReactionPinWireframe`, `VeltInlineReactionsSectionWireframe`.

### Wireframe templates must be wrapped in `<VeltWireframe>` / `<velt-wireframe>`

All wireframe definitions live inside the top-level wireframe registration tag. The registration tag is hidden from layout — its job is to register the template, not to render in place.

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

### React dot-notation form for nested wireframe slots

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
```

Equivalent to:

```tsx
<VeltWireframe>
  <VeltInlineReactionsSectionWireframe>
    <VeltInlineReactionsSectionPanelWireframe>
      <VeltInlineReactionsSectionToolContainerWireframe />
      <VeltInlineReactionsSectionListWireframe />
    </VeltInlineReactionsSectionPanelWireframe>
  </VeltInlineReactionsSectionWireframe>
</VeltWireframe>
```

The dot-notation form is the convention in the official React docs examples; the flat-tag form mirrors the web-component HTML names. Use whichever matches your codebase style.

### Reaction Tool componentConfig — the "+" picker button

**Tool-scope variables (`<velt-reaction-tool-wireframe>`):**

```
componentConfig.variant                string                   Wireframe variant id.
componentConfig.onClickOutside         Function                 Close handler — call from a click-outside region.
componentConfig.handleEmojiSelected    Function                 Emoji-selection handler. Call with the chosen emoji string.
componentConfig.excludeReactionIds     string[]                 Reaction ids to hide from the picker.
```

### Reaction Pin componentConfig — a placed emoji

**Pin-scope variables (`<velt-reaction-pin-wireframe>`):**

```
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

### Inline Reactions Section componentConfig — the strip

**Inline-section variables (`<velt-inline-reactions-section-wireframe>`):**

```
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

### Nested decomposition

The reaction-pin and the inline-section / reactions-panel each have their own child wireframe tags. Each child inherits its parent's `componentConfig` and may also expose **context-specific** per-iteration variables that are ONLY resolvable inside specific tags.

**Reaction pin children (`<velt-reaction-pin-wireframe>` → ...):**

```
<velt-reaction-pin-emoji-wireframe>             The emoji glyph itself.
<velt-reaction-pin-count-wireframe>             The "+N" count badge when multiple users reacted with the same emoji.
<velt-reaction-pin-tooltip-users-wireframe>     The hover tooltip wrapper listing all reactors.
<velt-reaction-pin-tooltip-user-wireframe>      A single reactor row inside the tooltip (iterated). EXPOSES context var: `user`.
<velt-reaction-pin-tooltip-user-avatar-wireframe>   Avatar inside a tooltip row. Reads `user.photoUrl`.
<velt-reaction-pin-tooltip-user-name-wireframe>     Name inside a tooltip row. Reads `user.name`.
```

**Inline-section children (`<velt-inline-reactions-section-wireframe>` → ...):**

```
<velt-inline-reactions-section-tool-container-wireframe>   Wraps the emoji-picker tool.
<velt-inline-reactions-section-panel-wireframe>            Panel wrapper that hosts the reaction list.
<velt-inline-reactions-section-list-wireframe>             Iterates componentConfig.annotations; renders one reaction-pin per entry.
```

**Reactions Panel children (the emoji picker that opens when the user clicks the tool "+" button):**

```
<velt-reactions-panel-items-wireframe>          The list wrapper that iterates the filtered emojis.
<velt-reactions-panel-item-wireframe>           A single emoji row. EXPOSES context vars: `emoji`, `isSelected`.
<velt-reactions-panel-item-emoji-wireframe>     The emoji glyph itself. EXPOSES context var: `emoji`.
```

### Context-specific per-iteration variables

These three are ONLY resolvable inside the specific nested tags noted. They are NOT visible from the parent or sibling wireframes.

```
user        User                       Inside <velt-reaction-pin-tooltip-user-wireframe> and its children.
                                       Iterated — one per reactor in the tooltip.
emoji       { key, value, name? }      Inside <velt-reactions-panel-item-wireframe> and -item-emoji-wireframe.
                                       Iterated — one per emoji in the picker.
isSelected  boolean                    Inside <velt-reactions-panel-item-wireframe>.
                                       True for the currently-selected emoji row.
```

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

### Don't reach across scopes

Each wireframe slot only sees its own `componentConfig` scope plus its assigned per-iteration context variables:

- Tool-scope variables (`handleEmojiSelected`, `excludeReactionIds`) are not visible inside the pin or inline-section wireframes.
- Pin-scope variables (`annotation`, `isReactionSelectedByCurrentUser`, `tooltipVisible`) are not visible inside the inline-section wireframe.
- Inline-section variables (`annotations[]`, `skeletonLoading`, `darkMode`) are not visible inside the pin or tool wireframes.
- The per-iteration `user`, `emoji`, `isSelected` are ONLY visible inside the specific iterated rows.

**Common pitfalls:**
- DO NOT drop the `componentConfig.` prefix — flat-config requires the full path. (Per-iteration `user` / `emoji` / `isSelected` are the exception — those don't use the prefix because they're context-scoped, not config-scoped.)
- DO NOT bind `componentConfig.annotation` inside the inline-section wireframe — `annotation` is pin-scope; the inline-section sees `annotations[]` (plural).
- DO NOT reach into `componentConfig.user` from the tooltip-user-wireframe — there, use the iteration variable `user` directly.
- DO NOT subscribe via the data hooks (e.g., to enumerate reactions) when you can read `componentConfig.annotations` directly from inside the inline-section wireframe — the wireframe stream is the right seam.

**Verification Checklist:**
- [ ] All wireframe definitions are wrapped in `<VeltWireframe>` (React) / `<velt-wireframe style="display:none;">` (HTML)
- [ ] All `componentConfig.*` reads use the full path (never bare names)
- [ ] Pin-scope variables (`annotation`, `isReactionSelectedByCurrentUser`, `tooltipVisible`) are read only inside the pin wireframe and its children
- [ ] Tool-scope variables (`handleEmojiSelected`, `excludeReactionIds`) are read only inside the tool wireframe
- [ ] Inline-section variables (`annotations[]`, `darkMode`) are read only inside the inline-section wireframe
- [ ] Per-iteration `user` is used inside `<velt-reaction-pin-tooltip-user-wireframe>` and its children, not `componentConfig.user`
- [ ] Per-iteration `emoji` / `isSelected` are used inside `<velt-reactions-panel-item-wireframe>` and its emoji child, not parent componentConfig
- [ ] React code may use either the flat tag names (`VeltInlineReactionsSectionPanelWireframe`) or the dot-notation form (`VeltInlineReactionsSectionWireframe.Panel`) — both compile to the same registration

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/reactions-wireframe-variables — full variable + subcomponent reference
- https://docs.velt.dev/ui-customization/features/async/inline-reactions — wireframe overview for the inline-reactions section
- https://docs.velt.dev/ui-customization/template-variables — `velt-data` / `velt-if` / `velt-class` overview
