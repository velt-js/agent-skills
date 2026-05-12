# Velt Rewriter Best Practices

**Version 1.1.0**  
Velt  
May 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Velt Rewriter implementation guide covering the AI text-rewriter primitive, programmatic control of the default selection toolbar, and type-safe AI model selection via the AiModel union type on RewriterAskAiRequest. Provides patterns for integrating Velt's Rewriter into React, Next.js, and other web applications.

---

## Table of Contents

1. [API Methods](#1-api-methods) — **HIGH**
   - 1.1 [Control the Default Rewriter Toolbar with enableDefaultUI / disableDefaultUI](#11-control-the-default-rewriter-toolbar-with-enabledefaultui-disabledefaultui)

2. [Types](#2-types) — **MEDIUM**
   - 2.1 [Use the AiModel Union Type for RewriterAskAiRequest.model](#21-use-the-aimodel-union-type-for-rewriteraskairequestmodel)

3. [Wireframe Variables](#3-wireframe-variables) — **MEDIUM**
   - 3.1 [Bind Rewriter Wireframe Slots Using Template Variables](#31-bind-rewriter-wireframe-slots-using-template-variables)

---

## 1. API Methods

**Impact: HIGH**

Programmatic control of the `RewriterElement` — the entry point for the AI text-rewriter primitive. Covers methods that toggle the default selection toolbar without disabling the feature (events still fire when the toolbar is hidden), enabling fully custom rewriter UIs.

### 1.1 Control the Default Rewriter Toolbar with enableDefaultUI / disableDefaultUI

**Impact: HIGH (Separates toolbar visibility from rewriter functionality, enabling fully custom selection UIs)**

`RewriterElement` exposes `enableDefaultUI()` and `disableDefaultUI()` methods that show or hide the default selection toolbar **without disabling the rewriter feature itself**. When the default UI is off, all rewriter events still fire — consumers can subscribe to them and render their own custom UI instead.

This matters because some applications already have a text-selection toolbar or want a completely custom rewrite experience. Without `disableDefaultUI()`, the Velt default toolbar always appears on selection, which conflicts with existing selection UIs.

Do not attempt to hide the toolbar with CSS alone — use the API method so event subscriptions continue to work correctly.

**Correct (React / Next.js — disable default toolbar and handle events yourself):**

```tsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function RewriterController() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const rewriterElement = client.getRewriterElement();

    // Hide the built-in toolbar; events still fire
    rewriterElement.disableDefaultUI();

    // Re-enable later if needed
    // rewriterElement.enableDefaultUI();
  }, [client]);

  return null;
}
```

**Correct (Other Frameworks — disable default toolbar):**

```js
// After Velt is initialized
const rewriterElement = Velt.getRewriterElement();

// Hide the built-in toolbar; events still fire
rewriterElement.disableDefaultUI();

// Re-enable later if needed
// rewriterElement.enableDefaultUI();
```

---

## 2. Types

**Impact: MEDIUM**

TypeScript type contracts for the rewriter, including the open `AiModel` union over OpenAI, Anthropic, and Gemini model identifiers (with the `(string & NonNullable<unknown>)` escape hatch for forward-compatibility with unenumerated model strings).

### 2.1 Use the AiModel Union Type for RewriterAskAiRequest.model

**Impact: MEDIUM (Enables type-safe model selection across OpenAI, Anthropic, and Gemini without losing extensibility)**

The `model` field on `RewriterAskAiRequest` was changed from a plain `string` to the new `AiModel` union type. The union enumerates supported model identifiers across OpenAI, Anthropic, and Gemini. It remains open via `(string & NonNullable<unknown>)`, so undocumented or future model strings still compile without a cast — no breaking change if you were passing a literal string before.

This matters because passing an arbitrary string gave no autocomplete or compile-time safety. The `AiModel` union provides IDE completions for all officially supported models while preserving backward compatibility for custom or preview model names.

Do not cast an arbitrary string to `AiModel` if it is an officially listed model — use the enumerated literal directly.

**Correct (TypeScript — using AiModel union for model selection):**

```tsx
import type { RewriterAskAiRequest, AiModel } from '@veltdev/types';

// Autocomplete guides you to a supported model identifier
const request: RewriterAskAiRequest = {
  prompt: 'Make this more concise',
  model: 'gpt-4o',        // OpenAI — autocompleted from AiModel union
  // model: 'claude-3-5-sonnet-20241022',  // Anthropic
  // model: 'gemini-1.5-pro',              // Gemini
  // model: 'my-fine-tuned-model',         // still valid — union is open
};
```

---

## 3. Wireframe Variables

**Impact: MEDIUM**

Template-variable bindings for the Rewriter wireframe family (`<velt-rewriter-text-portal-wireframe>`, `<velt-rewriter-dialog-wireframe>`, `<velt-rewriter-bottom-sheet-wireframe>`, `<velt-rewriters-container-wireframe>`). Uses the **flat-config** access pattern — variables are referenced via `componentConfig.<path>`. Each primitive carries its own `componentConfigSignal` exposing loading state, option list, selection index, and annotation drill-down for building custom rewriter UIs that coexist with `disableDefaultUI()`.

### 3.1 Bind Rewriter Wireframe Slots Using Template Variables

**Impact: MEDIUM (Drives dynamic content, conditional rendering, and class toggling inside Rewriter wireframe slots without re-subscribing to rewriter annotation state)**

The Rewriter wireframe family (`<velt-rewriter-...-wireframe>` / `<VeltRewriter*Wireframe>`) exposes the AI text-rewriter's per-primitive state via three directives — `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Use these instead of re-implementing loading, option-count, or selection tracking on top of the `RewriterElement` handle.

The Rewriter uses the **flat-config** access pattern — variables are referenced via the explicit `componentConfig.<path>` form (unlike the Activity Log / Comment family which use short-name mapping). Each primitive carries its own `componentConfigSignal` — the text portal, the dialog, and the bottom-sheet expose different variable sets, so a variable defined on the dialog is not visible on the portal.

The wireframe layer is independent of the rewriter's default-UI toolbar. `disableDefaultUI()` on `RewriterElement` hides the built-in toolbar but does **not** disable the feature — events keep firing and your wireframe slots keep receiving config updates, so you can render fully custom UI from the same data stream.

**Incorrect (rebuilding rewriter state from the element handle and conditionally mounting slots):**

```jsx
import { useVeltClient } from '@veltdev/react';

function CustomRewriterDialog({ annotation }) {
  const client = useVeltClient();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  // Reimplements loading / options / apiCalled tracking that the wireframe
  // already exposes via componentConfig.loading, .options, .apiCalled.
  useEffect(() => { /* manual subscriptions on RewriterElement ... */ }, [client]);
  if (!annotation) return null;
  return (
    <div className={loading ? 'rewriter is-loading' : 'rewriter'}>
      {options.length > 0 && <ul>{options.map(o => <li>{o}</li>)}</ul>}
    </div>
  );
}
```

**Correct (read the slot's injected `componentConfig` via `velt-data` / `velt-if` / `velt-class`):**

```jsx
import { VeltRewriterDialogWireframe } from '@veltdev/react';

<VeltRewriterDialogWireframe
  velt-class="'is-loading': {componentConfig.loading}">
  <header velt-if="{componentConfig.apiCalled}">
    <velt-data field="componentConfig.options.length" /> options
  </header>
  <header velt-if="!{componentConfig.apiCalled}">Pick a rewrite to start</header>
  <div velt-if="{componentConfig.loading}">Generating…</div>
  <ul velt-if="!{componentConfig.loading}">
    <li><velt-data field="componentConfig.options.0" /></li>
  </ul>
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
**1. DO NOT drop the `componentConfig.` prefix.** The Rewriter uses flat-config — `<velt-data field="loading" />` resolves to nothing. Always write `<velt-data field="componentConfig.loading" />`.
**2. DO NOT reference a variable across primitives.** `componentConfig.loading` is defined on the dialog / bottom-sheet, not on the text portal. Referencing dialog variables from the portal slot returns `undefined` silently.
**3. DO NOT conflate `disableDefaultUI()` with "turn off the rewriter".** `disableDefaultUI()` only hides the built-in selection toolbar — events keep firing and `componentConfig` keeps updating, which is exactly the seam custom wireframe UI relies on.

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/async-collaboration/rewriter/overview
- https://docs.velt.dev/async-collaboration/rewriter/api-reference
- https://docs.velt.dev/api-reference/sdk/models/data-models#rewriteraskairequest
- https://docs.velt.dev/ui-customization/features/async/rewriter/wireframe-variables
- https://console.velt.dev
