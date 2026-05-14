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

### 4. CSS variables — `--velt-arrow-z-index`

The arrow visual's stack order is controlled by a single CSS custom property, documented under Global Styles:

**Arrow z-index variable:**

```css
:root {
  --velt-arrow-z-index: 2147483557; /* default — sits just below modal overlays */
}
```

Override at any scope (`:root`, a wrapper, or an inline style) if arrows are appearing behind a custom overlay or being occluded by your own high-z-index UI. The default is intentionally close to the int32 max so most app UI sits below it.

### Known limitation — no wireframe-tag interpolation yet

Arrows do **not** currently expose `<velt-...-wireframe>` tags. The `velt-data` / `velt-if` / `velt-class` template-variable system available on Comments / Activity / Notifications wireframes is not yet supported for Arrows. Until wireframe-tag registration ships:

- Customize visuals via CSS `::part(...)` hooks on the tool button
- Replace the tool button entirely via the child-slot pattern
- Style the arrow visual via the `--velt-arrow-z-index` CSS variable (and Global Styles in the docs)

Do NOT suggest a `<velt-arrow-pin-wireframe>` or similar — those tags don't exist yet.

**Forward-compatibility — subcomponents and `componentConfig` variables (documented, not yet wireable):**

The Arrows feature is made up of four primitives. None currently registers a `<velt-...-wireframe>` tag, but the public elements + `componentConfig.*` shapes are documented for when wireframe-tag interpolation ships:

```
arrows-tool          <velt-arrows-tool>           The trigger to draw a new arrow.
arrow-pin            <velt-arrow-pin>             A placed arrow on the document.
arrow-pin-portal     <velt-arrow-pin-portal>      The per-pin overlay portal that renders the arrow visual.
arrows-container     <velt-arrows-container>      The per-document orchestrator that hosts every placed arrow.
```

```
componentConfig.arrowPinAnnotation       ArrowAnnotation       The arrow annotation (positions, color, author).
componentConfig.user                     User                  The currently identified end-user.
componentConfig.targetElement            HTMLElement           DOM target the arrow is anchored to.
componentConfig.annotationDragging       boolean               Arrow is currently being dragged.
componentConfig.dragPosition             { top, left } | null  Live drag position (used to compute inline style).
componentConfig.offsetTop                number                Vertical position offset.
componentConfig.offsetLeft               number                Horizontal position offset.
componentConfig.selectedAnnotationsMap   SelectedAnnotationsMap  Map keyed by annotationId — truthy when selected.
```

Treat this list as forward-compat reference only — you cannot read these variables via `velt-data` / `velt-if` / `velt-class` until wireframe-tag registration ships for Arrows.

**Verification Checklist:**
- [ ] `allowedElementIds` is set whenever arrows should be constrained to specific regions (omitting it allows arrows anywhere)
- [ ] Prop and method forms of `allowedElementIds` are not BOTH used on the same `<VeltArrows>` — pick one (prop for static, method for runtime updates)
- [ ] CSS `::part(...)` selectors are used (not deep selectors / global tag selectors) for tool-button styling because of Shadow DOM
- [ ] Custom-button replacement uses the child-slot pattern, not CSS `display: none` on the default button
- [ ] No `<velt-arrow-...-wireframe>` tags are suggested — they don't exist yet
- [ ] Z-index issues with arrows are addressed via `--velt-arrow-z-index` rather than touching component internals

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/arrows/customize-behavior — `allowedElementIds`, `darkMode`
- https://docs.velt.dev/ui-customization/features/async/arrows/parts — `::part(container | button-container | button-icon)`
- https://docs.velt.dev/ui-customization/features/async/arrows/wireframe-variables — current "limited support" status + subcomponent list + `componentConfig.*` reference
- https://docs.velt.dev/ui-customization/features/async/arrows/custom-button — child-slot replacement
- https://docs.velt.dev/ui-customization/features/async/arrows/variables — redirects to Global Styles
- https://docs.velt.dev/ui-customization/styling — `--velt-arrow-z-index` CSS variable
- https://docs.velt.dev/ui-customization/features/async/arrows/slots — named `slot="button"` form
