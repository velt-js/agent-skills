---
title: Bind Rewriter Wireframe Slots Using Template Variables
impact: MEDIUM
impactDescription: Drives dynamic content, conditional rendering, and class toggling inside Rewriter wireframe slots without re-subscribing to rewriter annotation state
tags: wireframe, template-variables, velt-data, velt-if, velt-class, componentConfig, rewriter-text-portal, rewriter-dialog, rewriter-bottom-sheet
---

## Bind Rewriter Wireframe Slots Using Template Variables

The Rewriter wireframe family (`<velt-rewriter-...-wireframe>` / `<VeltRewriter*Wireframe>`) exposes the AI text-rewriter's per-primitive state via three directives — `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Use these instead of re-implementing loading, option-count, or selection tracking on top of the `RewriterElement` handle.

The Rewriter uses the **flat-config** access pattern — variables are referenced via the explicit `componentConfig.<path>` form (unlike the Activity Log / Comment family which use short-name mapping). Each primitive carries its own `componentConfigSignal` — the text portal, the dialog, and the bottom-sheet expose different variable sets, so a variable defined on the dialog is not visible on the portal.

The wireframe layer is independent of the rewriter's default-UI toolbar. `disableDefaultUI()` on `RewriterElement` hides the built-in toolbar but does **not** disable the feature — events keep firing and your wireframe slots keep receiving config updates, so you can render fully custom UI from the same data stream.

Do not rebuild rewriter state from the element handle and conditionally mount slots. The wireframe already exposes `componentConfig.loading`, `componentConfig.options`, and `componentConfig.apiCalled` directly.

**Correct (read the slot's injected `componentConfig` via `velt-data` / `velt-if` / `velt-class`):**

```jsx
import { VeltRewriterDialogWireframe } from '@veltdev/react';

<VeltRewriterDialogWireframe
  veltClass="'is-loading': {componentConfig.loading}">
  <VeltIf condition="{componentConfig.apiCalled}">
    <header><VeltData field="componentConfig.options.length" /> options</header>
  </VeltIf>
  <VeltIf condition="!{componentConfig.apiCalled}">
    <header>Pick a rewrite to start</header>
  </VeltIf>
  <VeltIf condition="{componentConfig.loading}"><div>Generating…</div></VeltIf>
  <VeltIf condition="!{componentConfig.loading}">
    <ul><li><VeltData field="componentConfig.options.0" /></li></ul>
  </VeltIf>
</VeltRewriterDialogWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-rewriter-dialog-wireframe
  velt-class="'is-loading': {componentConfig.loading}">
  <header velt-if="{componentConfig.apiCalled}">
    <velt-data field="componentConfig.options.length"></velt-data> options
  </header>
  <div velt-if="{componentConfig.loading}">Generating…</div>
</velt-rewriter-dialog-wireframe>
```

### Variable sets per primitive

**`<velt-rewriter-text-portal-wireframe>`** — the inline highlight over the target text:

| Variable | Type | Use |
|---|---|---|
| `componentConfig.rewriterPinAnnotation` | `RewriterAnnotation` | The annotation this portal represents. Drill into `.from.name`, `.targetText`, `.options`. |
| `componentConfig.first` | `boolean` | First annotation in a stack. Pair with `velt-class="'is-first': {componentConfig.first}"`. |
| `componentConfig.last` | `boolean` | Last annotation in a stack. |
| `componentConfig.isPhone` | `boolean` | Mobile layout flag. |

**`<velt-rewriter-dialog-wireframe>` / `<velt-rewriter-bottom-sheet-wireframe>`** — same data, desktop popover vs. mobile bottom-sheet:

| Variable | Type | Use |
|---|---|---|
| `componentConfig.searchCount` | `number` | Number of generation requests submitted so far. |
| `componentConfig.loading` | `boolean` | A generation call is in-flight. |
| `componentConfig.apiCalled` | `boolean` | At least one generation call has been made — flip between "empty" and "results" states. |
| `componentConfig.options` | `string[]` | AI-generated rewrite options. Iterate or index (`options.0`, `options.length`). |
| `componentConfig.selectedOptionIndex` | `number` | Currently-selected option index, or `-1` when none. |
| `componentConfig.bottomSheetMode` | `boolean` | Renders as bottom-sheet (mobile). The bottom-sheet primitive's built-in `shouldShow` is gated on this. |

**`<velt-rewriters-container-wireframe>`** — the per-document orchestrator. Renders one portal per active rewriter annotation. Exposes no extra variables at the container level.

### Common mistakes — DO NOT

**1. DO NOT drop the `componentConfig.` prefix.** The Rewriter uses flat-config — `<velt-data field="loading" />` resolves to nothing. Always write `<velt-data field="componentConfig.loading" />`.

**2. DO NOT reference a variable across primitives.** `componentConfig.loading` is defined on the dialog / bottom-sheet, not on the text portal. Referencing dialog variables from the portal slot returns `undefined` silently.

**3. DO NOT conflate `disableDefaultUI()` with "turn off the rewriter".** `disableDefaultUI()` only hides the built-in selection toolbar — events keep firing and `componentConfig` keeps updating, which is exactly the seam custom wireframe UI relies on.

**Verification:**
- [ ] All variable reads use the `componentConfig.<path>` form — never the short name alone
- [ ] Dialog-scoped variables (`loading`, `options`, `apiCalled`, `selectedOptionIndex`, `searchCount`, `bottomSheetMode`) are read only inside the dialog / bottom-sheet slots
- [ ] Portal-scoped variables (`rewriterPinAnnotation`, `first`, `last`, `isPhone`) are read only inside the text-portal slot
- [ ] Custom rewriter UI relies on the wireframe variable stream rather than re-subscribing to the `RewriterElement` handle
- [ ] `disableDefaultUI()` is used in tandem with wireframe slots, not as a kill-switch for the feature

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/rewriter/wireframe-variables — "Rewriter Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
