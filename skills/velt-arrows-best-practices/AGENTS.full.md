# Velt Arrows Best Practices

**Version 1.0.1**  
Velt  
October 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Velt Arrows implementation guide — the directional-arrow annotation feature for visual feedback and design review. Covers VeltArrows / VeltArrowTool component placement, the client.getArrowElement() handle, allowedElementIds restriction (prop and method form), darkMode, custom-button slot replacement, CSS ::part hooks, and the ArrowAnnotation / AnnotationProperty data shapes (including arrowLength / arrowAngle).

---

## Table of Contents

1. [API & Setup](#1-api-setup) — **HIGH**
   - 1.1 [Set up Velt Arrows — place VeltArrows (root) and VeltArrowTool (trigger), then get the ArrowElement handle](#11-set-up-velt-arrows-place-veltarrows-root-and-veltarrowtool-trigger-then-get-the-arrowelement-handle)

2. [Configuration](#2-configuration) — **HIGH**
   - 2.1 [Configure Arrows — allowedElementIds, darkMode, and CSS ::part hooks; wireframe-tag limitation](#21-configure-arrows-allowedelementids-darkmode-and-css-part-hooks-wireframe-tag-limitation)

3. [Types](#3-types) — **MEDIUM**
   - 3.1 [ArrowAnnotation and AnnotationProperty — data shapes for placed arrows](#31-arrowannotation-and-annotationproperty-data-shapes-for-placed-arrows)

---

## 1. API & Setup

**Impact: HIGH**

Placement of the `<VeltArrows>` root component and the `<VeltArrowTool>` toolbar trigger, retrieving the `ArrowElement` handle via `client.getArrowElement()`, and the child-slot pattern for replacing the default tool button with a fully custom button.

### 1.1 Set up Velt Arrows — place VeltArrows (root) and VeltArrowTool (trigger), then get the ArrowElement handle

**Impact: HIGH (VeltArrows alone won't show a draw trigger and VeltArrowTool alone won't render placed arrows; both components are required, and the ArrowElement handle is the programmatic entry point for runtime config)**

The Arrows feature is two components plus one programmatic handle:

- `<VeltArrows>` (or `<velt-arrows>`) — the **root** orchestrator. Mount once near the top of your app. It hosts every placed arrow on the document.
- `<VeltArrowTool>` (or `<velt-arrow-tool>`) — the **toolbar trigger** that starts a new arrow. Mount it inside whatever toolbar you have.
- `client.getArrowElement()` — returns the `ArrowElement` handle for programmatic config (e.g. setting `allowedElementIds` at runtime). React-hook form: not provided; call via `useVeltClient()`.

Without `<VeltArrows>` you can place a trigger but arrows never render; without `<VeltArrowTool>` users have no way to start drawing.

**Incorrect (trigger without the root component):**

```tsx
// BUG: no <VeltArrows />, so users can start drawing but placed arrows never render
<div className="toolbar">
  <VeltArrowTool />
</div>
```

**Correct (React / Next.js): minimal end-to-end setup:**

```tsx
import { VeltArrows, VeltArrowTool } from '@veltdev/react';

export default function App() {
  return (
    <div>
      {/* Root orchestrator — mount once, near the top of the tree */}
      <VeltArrows />

      {/* Trigger — mount wherever your toolbar lives */}
      <div className="toolbar">
        <VeltArrowTool />
      </div>

      {/* ...the rest of your app... */}
    </div>
  );
}
```

**Correct (Other Frameworks): minimal setup:**

```html
<!doctype html>
<html lang="en">
  <head>
    <title>App</title>
    <script type="module" src="https://cdn.velt.dev/lib/sdk@latest/velt.js" onload="loadVelt()"></script>
    <script>
      async function loadVelt() {
        await Velt.init("YOUR_VELT_API_KEY");
      }
    </script>
  </head>
  <body>
    <velt-arrows></velt-arrows>
    <div class="toolbar">
      <velt-arrow-tool></velt-arrow-tool>
    </div>
  </body>
</html>
```

**Get the ArrowElement handle (React / Next.js):**

```tsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function ArrowsBootstrap() {
  const { client } = useVeltClient();
  useEffect(() => {
    if (!client) return;
    const arrowElement = client.getArrowElement();
    // Use arrowElement.allowedElementIds(...) etc. — see config-customize
  }, [client]);
  return null;
}
```

**Get the ArrowElement handle (Other Frameworks):**

```js
const arrowElement = Velt.getArrowElement();
```

**Custom tool button — child-replacement pattern (React / Next.js):**

```tsx
import { VeltArrowTool } from '@veltdev/react';

function YourToolbar() {
  return (
    <VeltArrowTool>
      {/* This child replaces the default arrow icon button entirely */}
      <button className="myArrowButton">Draw arrow</button>
    </VeltArrowTool>
  );
}
```

**Custom tool button — child-replacement (Other Frameworks):**

```html
<velt-arrow-tool>
  <!-- Child replaces the default icon button entirely -->
  <button class="myArrowButton">Draw arrow</button>
</velt-arrow-tool>
```

**Named `slot="button"` variant (alternative form):**

```tsx
<VeltArrowTool>
  <button slot="button">Arrow</button>
</VeltArrowTool>
```

```html
<velt-arrow-tool>
  <button slot="button">Arrow</button>
</velt-arrow-tool>
```

Both forms work — the plain child pattern (most common in the official `custom-button.mdx` docs) and the named-slot pattern (from the `slots.mdx` page) target the same `button` slot. Prefer the plain child form for new code; the named `slot="button"` attribute is explicit and helpful if you ever need to add additional slots in the future.

#### v6 modular SDK

If you pass `featureAllowList` in the Velt config, include `'arrow'`; otherwise the arrows chunk is not preloaded and the tags render inert until it loads. `client.preloadArrow()` warms the chunk ahead of first use, and calling `getArrowElement()` auto-enables the feature. Arrows have no headless React hooks; use the components, `getArrowElement()`, CSS, and props.

**Common pitfalls:**
- DO NOT mount `<VeltArrows>` inside a conditional that unmounts on tool toggle — it owns the per-document arrow state. Mount it once at the top of the tree.
- DO NOT call `getArrowElement()` before the Velt client is ready. In React, guard on `client` inside a `useEffect`.
- DO NOT mount more than one `<VeltArrows>` per document — extras get ignored or cause duplicate rendering depending on placement.

**Verification Checklist:**
- [ ] Exactly one `<VeltArrows>` is mounted near the root of the app
- [ ] At least one `<VeltArrowTool>` is mounted somewhere users can click it
- [ ] `client.getArrowElement()` is called only after the Velt client is initialized
- [ ] Custom tool buttons are passed as children of `<VeltArrowTool>` (replaces the default button entirely)
- [ ] In React, the ArrowElement-bootstrap effect has a `[client]` dependency
- [ ] If `featureAllowList` is set, it includes `'arrow'`

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/arrows/setup — component placement
- https://docs.velt.dev/api-reference/sdk/api/api-methods#getarrowelement — `client.getArrowElement()`
- https://docs.velt.dev/ui-customization/features/async/arrows/custom-button — custom-button child-slot pattern
- https://docs.velt.dev/api-reference/sdk/api/api-methods#preloadarrow — `preloadArrow()` and `featureAllowList`

---

## 2. Configuration

**Impact: HIGH**

Behavior configuration — restricting where arrows can be drawn via `allowedElementIds` (both as a `<VeltArrows>` prop and via `arrowElement.allowedElementIds()`), enabling `darkMode`, and CSS-level styling via `::part(container | button-container | button-icon)` on the tool button. Includes the known limitation that Arrows do not yet support `<velt-...-wireframe>` interpolation, so customize via CSS rather than template variables.

### 2.1 Configure Arrows — allowedElementIds, darkMode, and CSS ::part hooks; wireframe-tag limitation

**Impact: HIGH (Without allowedElementIds, users can draw arrows over any element; CSS ::part is the only styling surface today since wireframe-tag interpolation is not yet supported on Arrows)**

Three knobs cover the active configuration surface, plus one important known limitation.

#### 1. `allowedElementIds` — restrict where arrows can be drawn

Constrain the Arrows feature to a specific set of DOM element IDs. Anywhere outside this list, the arrow tool is inert. There are two equivalent forms:

**Incorrect (deep CSS selector into the shadow root):**

```css
/* BUG: does not cross the Shadow DOM boundary of <velt-arrow-tool> */
velt-arrow-tool button svg { width: 1.5rem; }
```

**Correct (React / Next.js): `allowedElementIds` as a `<VeltArrows>` prop:**

```tsx
<VeltArrows allowedElementIds={['canvas-region', 'preview-pane']} />
```

**Correct (Other Frameworks): `allowed-element-ids` attribute:**

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

#### 2. `darkMode` — enable dark theme

`darkMode` defaults to `false`. The Arrows customize-behavior page documents it on `<VeltArrows>`; the UI customization reference also lists `darkMode` as the typed prop on `VeltArrowTool`.

**React / Next.js:**

```tsx
<VeltArrows darkMode={true} />
```

**Other Frameworks:**

```html
<velt-arrows dark-mode="true"></velt-arrows>
```

#### 3. CSS `::part(...)` hooks — style the arrow tool button

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

#### 4. CSS variables — `--velt-arrow-z-index`

The arrow visual's stack order is controlled by a single CSS custom property, documented under Global Styles:

**Arrow z-index variable:**

```css
:root {
  --velt-arrow-z-index: 2147483557; /* default — sits just below modal overlays */
}
```

Override at any scope (`:root`, a wrapper, or an inline style) if arrows are appearing behind a custom overlay or being occluded by your own high-z-index UI. The default is intentionally close to the int32 max so most app UI sits below it.

#### Known limitation — no wireframe-tag interpolation yet

Arrows do **not** currently expose `<velt-...-wireframe>` tags. The `velt-data` / `velt-if` / `velt-class` template-variable system available on Comments / Activity / Notifications wireframes is not yet supported for Arrows. Until wireframe-tag registration ships:

- Customize visuals via CSS `::part(...)` hooks on the tool button
- Replace the tool button entirely via the child-slot pattern
- Style the arrow visual via the `--velt-arrow-z-index` CSS variable (and Global Styles in the docs)

Do NOT suggest a `<velt-arrow-pin-wireframe>` or similar — those tags don't exist yet. There are also no headless hooks for Arrows. Don't patch Velt's internal arrow DOM to force a layout; internal DOM can change in any release, so stick to documented parts, CSS variables, and props.

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
- https://docs.velt.dev/ui-customization/features/annotations-tags-arrows-areas — Tags / Arrows / Areas customization surface (no wireframe slots, no hooks; CSS and props)

---

## 3. Types

**Impact: MEDIUM**

The `ArrowAnnotation` data model (annotationId, from, color, targetElement, position, locationId, location, type='arrow', props, annotationIndex, pageInfo) and the shared `AnnotationProperty` shape it points at — viewport dimensions plus the arrow-specific `arrowLength` and `arrowAngle` fields.

### 3.1 ArrowAnnotation and AnnotationProperty — data shapes for placed arrows

**Impact: MEDIUM (The canonical shape returned for placed arrows and stored on the document; needed for any code that subscribes to arrows, exports them, or builds custom analytics)**

`ArrowAnnotation` is the canonical shape Velt persists for every placed arrow on a document. Code that subscribes to arrows, exports them, or builds custom UI on top of them types against this shape.

**Incorrect (reads geometry without guards):**

```typescript
const angle = annotation.props.arrowAngle; // BUG: props is optional, and the annotation may not be an arrow
```

**Correct (narrow and use optional chaining):**

```typescript
const angle = annotation.type === 'arrow' ? annotation.props?.arrowAngle : undefined;
```

**`ArrowAnnotation` shape:**

```typescript
interface ArrowAnnotation {
  annotationId: string;                // Required. Unique id; auto-generated.
  from: User;                          // Required. User who created the arrow.
  color?: string;                      // Optional. Display color.
  lastUpdated?: unknown;               // Optional. Timestamp of last update; auto-generated.
  targetElement?: TargetElement | null;// Optional. DOM target the arrow is anchored to.
  position?: CursorPosition | null;    // Optional. Cursor position relative to the annotation.
  locationId?: number | null;          // Optional. Auto-generated from the provided location.
  location?: Location | null;          // Optional. Used to identify the arrow on a sub-document.
  type?: string;                       // Optional. Defaults to "arrow".
  props?: AnnotationProperty;          // Optional. Display metadata (viewport + arrow geometry).
  annotationIndex?: number;            // Optional. 1-based index in the document's annotation list.
  pageInfo?: PageInfo;                 // Optional. Page metadata.
}
```

`type` defaults to `"arrow"` — branching on `annotation.type === 'arrow'` is the cheapest way to distinguish arrows from other annotation kinds in a mixed-feed subscription.

**`AnnotationProperty` shape — arrow geometry lives here:**

```typescript
interface AnnotationProperty {
  viewportWidth?: number;
  viewportHeight?: number;
  screenWidth?: number;
  screenHeight?: number;
  screenScrollHeight?: number;
  arrowLength?: number;                // ← arrow-specific: pixel length at capture
  arrowAngle?: number;                 // ← arrow-specific: rotation in degrees
}
```

`AnnotationProperty` is shared with other Velt annotation types — `arrowLength` and `arrowAngle` are the two fields that are specifically meaningful for arrows. The viewport / screen fields let consumers re-project the arrow correctly on a screen of a different size.

**Common pitfalls:**
- DO NOT treat `annotationId`, `from`, or `props.arrowLength` as guaranteed-present in arbitrary contexts — only `annotationId` and `from` are required. Always null-guard optional fields, especially `props` itself.
- DO NOT infer arrow direction from `position` alone — `props.arrowAngle` is the source of truth for rotation.
- DO NOT confuse `targetElement` (the DOM anchor) with `position` (the cursor reading at draw time). They serve different purposes.

**Verification Checklist:**
- [ ] Code that consumes arrow annotations narrows on `annotation.type === 'arrow'` rather than assuming all annotations are arrows
- [ ] `props?.arrowLength` and `props?.arrowAngle` are read with optional chaining — they're not guaranteed-present
- [ ] Re-projection logic uses `viewportWidth` / `viewportHeight` to scale `arrowLength` if the viewer's screen differs from the author's
- [ ] `from` is treated as a Velt `User` object (with `userId`, `name`, etc.), not a bare string

#### Related — `SelectedAnnotationsMap` (forward-compat)

If you eventually consume wireframe `componentConfig.selectedAnnotationsMap` once wireframe-tag interpolation ships for Arrows (see `config-customize` for the current limitation), this is the shape:

```typescript
// Keyed by annotationId — truthy entry means "this annotation is currently selected".
type SelectedAnnotationsMap = Record<string /* annotationId */, CommentAnnotation>;
```

The map is shared across annotation types (comments and arrows alike), keyed by `annotationId`. Today, you don't typically need this in Arrows code — but it's the type the official wireframe-variable docs reference for selection state, so it's documented here for forward-compatibility.

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/models/data-models#arrowannotation
- https://docs.velt.dev/api-reference/sdk/models/data-models#annotationproperty
- https://docs.velt.dev/api-reference/sdk/models/data-models#selectedannotationsmap

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/async-collaboration/arrows/overview
- https://docs.velt.dev/async-collaboration/arrows/setup
- https://docs.velt.dev/async-collaboration/arrows/customize-behavior
- https://docs.velt.dev/api-reference/sdk/models/data-models#arrowannotation
- https://docs.velt.dev/api-reference/sdk/models/data-models#annotationproperty
- https://docs.velt.dev/ui-customization/features/async/arrows/parts
- https://docs.velt.dev/ui-customization/features/async/arrows/custom-button
- https://docs.velt.dev/ui-customization/features/async/arrows/wireframe-variables
- https://docs.velt.dev/ui-customization/features/annotations-tags-arrows-areas
