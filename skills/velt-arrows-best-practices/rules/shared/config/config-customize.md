---
title: Configure Arrows — allowedElementIds, darkMode, and CSS ::part hooks; wireframe-tag limitation
impact: HIGH
impactDescription: Without allowedElementIds, users can draw arrows over any element; CSS ::part is the only styling surface today since wireframe-tag interpolation is not yet supported on Arrows
tags: arrows, allowedElementIds, darkMode, parts, container, button-container, button-icon, css, shadow-dom, wireframe-tag-not-supported
---

## Configure Arrows — allowedElementIds, darkMode, CSS parts, wireframe limitation

Three knobs cover the active configuration surface, plus one important known limitation.

### 1. `allowedElementIds` — restrict where arrows can be drawn

Constrain the Arrows feature to a specific set of DOM element IDs. Anywhere outside this list, the arrow tool is inert. There are two equivalent forms:

**As a `<VeltArrows>` prop (React / Next.js):**

```tsx
<VeltArrows allowedElementIds={['canvas-region', 'preview-pane']} />
```

**As a `<velt-arrows>` attribute (Other Frameworks):**

```html
<velt-arrows allowed-element-ids="['canvas-region', 'preview-pane']"></velt-arrows>
```

**As a runtime method on `ArrowElement` (React / Next.js):**

```tsx
const arrowElement = client.getArrowElement();
arrowElement.allowedElementIds(['canvas-region', 'preview-pane']);
```

**As a runtime method on `ArrowElement` (Other Frameworks):**

```js
const arrowElement = Velt.getArrowElement();
arrowElement.allowedElementIds(['canvas-region', 'preview-pane']);
```

The prop form is declarative; the method form is useful when you need to change the allowed set in response to runtime state (e.g. a route change or user permission switch).

### 2. `darkMode` — enable dark theme

`darkMode` defaults to `false`.

**React / Next.js:**

```tsx
<VeltArrows darkMode={true} />
```

**Other Frameworks:**

```html
<velt-arrows dark-mode="true"></velt-arrows>
```

### 3. CSS `::part(...)` hooks — style the arrow tool button

`<velt-arrow-tool>` is encapsulated in Shadow DOM. Normal CSS selectors won't reach inside; use `::part()` to target the exposed parts.

**Three exposed parts:**

```
container          The arrow-tool root container.
button-container   The button wrapper inside the container.
button-icon        The SVG icon inside the button.
```

**Example CSS — size the icon:**

```css
velt-arrow-tool::part(button-icon) {
  width: 1.5rem;
  height: 1.5rem;
}
```

If you need to replace the button wholesale rather than restyle it, use the child-slot pattern from `api-setup` (pass your own `<button>` as a child of `<VeltArrowTool>`).

### Known limitation — no wireframe-tag interpolation yet

Arrows do **not** currently expose `<velt-...-wireframe>` tags. The `velt-data` / `velt-if` / `velt-class` template-variable system available on Comments / Activity / Notifications wireframes is not yet supported for Arrows. Until wireframe-tag registration ships:

- Customize visuals via CSS `::part(...)` hooks on the tool button
- Replace the tool button entirely via the child-slot pattern
- Style the arrow visual via CSS variables (see Global Styles in the docs)

Do NOT suggest a `<velt-arrow-pin-wireframe>` or similar — those tags don't exist yet. The data shapes (`componentConfig.arrowPinAnnotation`, `componentConfig.annotationDragging`, etc.) are documented in the official wireframe-variables page for forward-compatibility but cannot be used today.

**Verification Checklist:**
- [ ] `allowedElementIds` is set whenever arrows should be constrained to specific regions (omitting it allows arrows anywhere)
- [ ] Prop and method forms of `allowedElementIds` are not BOTH used on the same `<VeltArrows>` — pick one (prop for static, method for runtime updates)
- [ ] CSS `::part(...)` selectors are used (not deep selectors / global tag selectors) for tool-button styling because of Shadow DOM
- [ ] Custom-button replacement uses the child-slot pattern, not CSS `display: none` on the default button
- [ ] No `<velt-arrow-...-wireframe>` tags are suggested — they don't exist yet

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/arrows/customize-behavior — `allowedElementIds`, `darkMode`
- https://docs.velt.dev/ui-customization/features/async/arrows/parts — `::part(container | button-container | button-icon)`
- https://docs.velt.dev/ui-customization/features/async/arrows/wireframe-variables — current "limited support" status of wireframe interpolation
- https://docs.velt.dev/ui-customization/features/async/arrows/custom-button — child-slot replacement
