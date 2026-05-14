---
title: Place VeltInlineReactionsSection with targetReactionElementId; configure custom reaction emojis via prop or setCustomReactions
impact: HIGH
impactDescription: targetReactionElementId must match a real container id or the reactions strip has nothing to anchor to; custom emojis ship in three distinct entry shapes (url / iconUrl / emoji) and mixing them up produces a silent no-op
tags: reactions, VeltInlineReactionsSection, velt-inline-reactions-section, targetReactionElementId, customReactions, setCustomReactions, getReactionElement, url, iconUrl, emoji
---

## Place VeltInlineReactionsSection and configure custom reactions

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

### Custom reactions — three entry shapes

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

### Styling — `shadowDom` (default `true`) and `darkMode` (default `false`)

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

### Variants

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

### Shared with comment reactions

`setCustomReactions` also exists on `commentElement` (`client.getCommentElement().setCustomReactions(...)`) for the same map shape. If you want one custom emoji set across both inline reactions and comment reactions, set it on whichever element matches the scope of the change — for app-wide custom emojis you typically set it once on the comment element and the inline strip picks up the same set. See `velt-comments-best-practices` for the comments-specific path.

**Common pitfalls:**
- DO NOT omit `targetReactionElementId` — without it the inline strip has nothing to anchor to.
- DO NOT use a `targetReactionElementId` value that doesn't match any element's `id` — the strip mounts but no reactions render and the misconfiguration is silent.
- DO NOT pass camelCase `targetReactionElementId` on the HTML `<velt-inline-reactions-section>` element — use the kebab-case `target-reaction-element-id` attribute there.
- DO NOT mix entry shapes within a single reactionId (e.g., `{ url: ..., emoji: ... }`) — pass exactly one of `url`, `iconUrl`, or `emoji` per entry.
- DO NOT mount more than one `<VeltInlineReactionsSection>` for the same `targetReactionElementId` — duplicate strips render twice.

**Verification Checklist:**
- [ ] Container has a stable `id` attribute matching the `targetReactionElementId` value byte-for-byte
- [ ] In React JSX: `targetReactionElementId` (camelCase). In HTML / web components: `target-reaction-element-id` (kebab-case)
- [ ] Each custom reaction entry uses exactly one of `url`, `iconUrl`, or `emoji` — never multiple
- [ ] Custom reactionIds are stable, meaningful strings (used for storage and analytics)
- [ ] `shadowDom` is only disabled when you intentionally want your own CSS to reach into the component internals
- [ ] `darkMode` is controlled via the prop OR `enableDarkMode()` / `disableDarkMode()` — not both for the same scope
- [ ] Inline-reactions and comment-reactions custom emojis are configured at the right scope to avoid drift

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/reactions/setup — `<VeltInlineReactionsSection>` + `targetReactionElementId`
- https://docs.velt.dev/async-collaboration/reactions/customize-behavior — `setCustomReactions` and the three entry shapes
- https://docs.velt.dev/ui-customization/features/async/inline-reactions — `shadowDom` / `darkMode` / `variant` props + `enableDarkMode` / `disableDarkMode` runtime methods
- https://docs.velt.dev/api-reference/sdk/api/api-methods#setcustomreactions — `setCustomReactions()` signature
