# Velt Rewriter Best Practices

**Version 1.2.0**  
Velt  
May 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Velt Rewriter implementation guide covering the AI text-rewriter pipeline (enableRewriter → on('textSelected') → askAi → replaceText / addComment), multi-provider AI generation auto-routed by model prefix (OpenAI / Anthropic / Gemini), default-toolbar control, type-safe AiModel selection, and wireframe-driven custom UI for the Rewriter primitives. Patterns for integrating Velt Rewriter into React, Next.js, and other web applications.

---

## Table of Contents

1. [API Methods](#1-api-methods) — **HIGH**
   - 1.1 [Anchor a comment to the selected text with addComment](#11-anchor-a-comment-to-the-selected-text-with-addcomment)
   - 1.2 [Apply AI output to the DOM with replaceText](#12-apply-ai-output-to-the-dom-with-replacetext)
   - 1.3 [Call askAi to generate rewrites — provider is auto-routed by model prefix](#13-call-askai-to-generate-rewrites-provider-is-auto-routed-by-model-prefix)
   - 1.4 [Control the Default Rewriter Toolbar with enableDefaultUI / disableDefaultUI](#14-control-the-default-rewriter-toolbar-with-enabledefaultui-disabledefaultui)
   - 1.5 [Enable the Rewriter feature with enableRewriter / disableRewriter](#15-enable-the-rewriter-feature-with-enablerewriter-disablerewriter)
   - 1.6 [Subscribe to text selection with on('textSelected')](#16-subscribe-to-text-selection-with-ontextselected)

2. [Patterns](#2-patterns) — **HIGH**
   - 2.1 [Wire the full Rewriter pipeline — enable, subscribe, askAi, then replaceText or addComment](#21-wire-the-full-rewriter-pipeline-enable-subscribe-askai-then-replacetext-or-addcomment)

3. [Types](#3-types) — **MEDIUM**
   - 3.1 [Use the AiModel Union Type for RewriterAskAiRequest.model](#31-use-the-aimodel-union-type-for-rewriteraskairequestmodel)

4. [Wireframe Variables](#4-wireframe-variables) — **MEDIUM**
   - 4.1 [Bind Rewriter Wireframe Slots Using Template Variables](#41-bind-rewriter-wireframe-slots-using-template-variables)

---

## 1. API Methods

**Impact: HIGH**

Programmatic control of the `RewriterElement` — the entry point for the AI text-rewriter primitive. Covers the feature toggle (`enableRewriter` / `disableRewriter`), the default-toolbar toggle (`enableDefaultUI` / `disableDefaultUI`), the `textSelected` event subscription that drives the pipeline, the multi-provider `askAi` call (auto-routed by model prefix), and the two terminal actions `replaceText` (DOM swap) and `addComment` (anchored annotation).

### 1.1 Anchor a comment to the selected text with addComment

**Impact: MEDIUM (Creates a Velt comment annotation pinned to the same text range — pairs the Rewriter with the Comments feature for review workflows)**

`RewriterElement.addComment({ text, event })` creates a Velt comment annotation anchored to the exact text range described by the `textSelected` event. Use this when the user's intent is "discuss this passage" rather than "replace this passage" — e.g., reviewer feedback, AI-suggested rewrites that need human approval before applying, or simply comments anchored to text.

Like `replaceText`, this requires the full `event` (not just `event.text`) so Velt can pin the annotation to a durable DOM range. The response carries `annotationId` on success, which you can use to deep-link to the comment thread or to feed into other Comments-feature APIs.

`addComment` and `replaceText` are not mutually exclusive — a typical AI-assisted review flow uses both: ask AI for a suggested rewrite, anchor it as a comment for the reviewer to approve, then call `replaceText` on approval.

**Correct (React / Next.js — anchor AI suggestion as a comment):**

```tsx
const rewriterElement = client.getRewriterElement();

rewriterElement.on('textSelected').subscribe(async (event) => {
  const aiResponse = await rewriterElement.askAi({
    model: 'gpt-4o',
    prompt: 'Suggest a more inclusive rewording',
    selectedText: event.text,
  });

  if (!aiResponse.success) return;

  const result = await rewriterElement.addComment({
    text: aiResponse.text,
    event,
  });

  if (result.success) {
    console.log('Created annotation:', result.annotationId);
  }
});
```

**Correct (Other Frameworks):**

```js
const result = await rewriterElement.addComment({ text: aiResponse.text, event });
```

---

### 1.2 Apply AI output to the DOM with replaceText

**Impact: HIGH (Performs the in-place DOM replacement that completes the rewrite — using event metadata, not a manual range lookup)**

`RewriterElement.replaceText({ text, event })` swaps the originally-selected DOM text with new text. Velt uses the `event` from the `textSelected` subscription to locate the exact DOM range — you do not pass a selector, range, or coordinates. The `text` argument is whatever you want to put in its place (typically `response.text` from `askAi`).

The reason `event` is required (not just the original `event.text` string) is robustness: the event carries Velt-managed anchor metadata that survives DOM changes and concurrent edits in ways a raw string match wouldn't. Pass the event through; don't reconstruct it.

The response is a success/failure shape with `originalText` and `replacedText` on success — useful for showing a before/after diff or for undo.

**Correct (React / Next.js — apply askAi output):**

```tsx
const rewriterElement = client.getRewriterElement();

rewriterElement.on('textSelected').subscribe(async (event) => {
  const aiResponse = await rewriterElement.askAi({
    model: 'gemini-2.5-flash',
    prompt: 'Make it more concise',
    selectedText: event.text,
  });

  if (!aiResponse.success) return;

  const result = await rewriterElement.replaceText({
    text: aiResponse.text,
    event, // carry the full event through, not just event.text
  });

  if (result.success) {
    console.log('Replaced:', result.originalText, '→', result.replacedText);
  }
});
```

**Correct (Other Frameworks):**

```js
const result = await rewriterElement.replaceText({ text: aiResponse.text, event });
```

---

### 1.3 Call askAi to generate rewrites — provider is auto-routed by model prefix

**Impact: HIGH (Single multi-provider entry point for AI generation; Velt routes to OpenAI / Anthropic / Gemini based on the model string prefix, no per-provider wiring needed)**

`RewriterElement.askAi(request)` sends a prompt to an AI model through Velt's API and returns the generated text. The key thing to understand is **provider auto-routing**: Velt picks the provider purely from the model string's prefix — you do not configure a provider field anywhere.

| Prefix | Provider |
|---|---|
| `gpt-*`, `o1-*`, `o3-*`, `o4-*` | OpenAI |
| `claude-*` | Anthropic |
| `gemini-*` | Google |

This means changing model is a one-line change with no new wiring: `'gpt-4o'` → `'claude-3-5-sonnet-20241022'` switches providers transparently.

By default the request goes through Velt's built-in API with auth handled for you. To use your own keys (your own billing, your own rate limits, your own model access), configure them in the [Velt Console](https://console.velt.dev/). No code change is required when you switch from Velt-managed keys to your own — same `askAi` call, Velt routes accordingly.

The `model` field is typed as the `AiModel` union (see the `types-ai-model` rule). The union is open: any string still compiles, so unenumerated or fine-tuned model identifiers work without a cast.

There is also a server-side variant: `sdk.api.rewriter.askAi(...)` in the Velt Python SDK, useful for backend orchestration or when you want to keep prompts out of the client. See the `velt-self-hosting-data-best-practices` skill for backend usage; do not duplicate that pattern here.

**Correct (React / Next.js — call askAi inside the textSelected handler):**

```tsx
const rewriterElement = client.getRewriterElement();

rewriterElement.on('textSelected').subscribe(async (event) => {
  const response = await rewriterElement.askAi({
    model: 'gemini-2.5-flash',
    prompt: 'Make this more formal',
    selectedText: event.text,
  });

  if (response.success) {
    console.log('AI output:', response.text);
  } else {
    // Surface to user; do NOT swallow silently
    console.error('Rewriter askAi failed', response);
  }
});
```

**Correct (Other Frameworks):**

```js
const rewriterElement = Velt.getRewriterElement();

const response = await rewriterElement.askAi({
  model: 'claude-3-5-sonnet-20241022',
  prompt: 'Summarize in one sentence',
  selectedText: event.text,
});
```

---

### 1.4 Control the Default Rewriter Toolbar with enableDefaultUI / disableDefaultUI

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

### 1.5 Enable the Rewriter feature with enableRewriter / disableRewriter

**Impact: HIGH (Activates AI text-rewriter functionality on the page; without it, no text-selection events fire and the rewriter is dormant)**

`RewriterElement.enableRewriter()` turns the Rewriter feature ON for the page. Until it is called, the Rewriter is inert — no `textSelected` events fire, `askAi` / `replaceText` / `addComment` have nothing to act on, and the default toolbar never appears. `disableRewriter()` deactivates the feature.

This is distinct from `enableDefaultUI()` / `disableDefaultUI()`:
- `enableRewriter` / `disableRewriter` — **feature toggle**. Off = no events, no functionality at all.
- `enableDefaultUI` / `disableDefaultUI` — **toolbar visibility toggle**. The feature stays on; only Velt's built-in selection toolbar is hidden. Events still fire so you can render custom UI.

A common mistake is using `disableDefaultUI()` when you wanted to turn the feature off entirely (or vice versa). Pick based on intent:
- "Stop the rewriter from doing anything" → `disableRewriter()`
- "Hide the default toolbar but keep the events" → `disableDefaultUI()`

`enableRewriter()` is the first call in the canonical setup flow (enable → subscribe to `textSelected` → call `askAi` → call `replaceText` or `addComment`).

**Correct (React / Next.js — enable on mount, disable on unmount):**

```tsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function RewriterBootstrap() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const rewriterElement = client.getRewriterElement();
    rewriterElement.enableRewriter();
    return () => rewriterElement.disableRewriter();
  }, [client]);

  return null;
}
```

**Correct (Other Frameworks):**

```js
if (Velt) {
  const rewriterElement = Velt.getRewriterElement();
  rewriterElement.enableRewriter();
  // Later, to deactivate:
  // rewriterElement.disableRewriter();
}
```

---

### 1.6 Subscribe to text selection with on('textSelected')

**Impact: HIGH (Surfaces the user's selected text and its DOM context — required input for askAi, replaceText, and addComment)**

`RewriterElement.on('textSelected')` returns an Observable that emits a `TextSelectedEvent` every time a user highlights text in a Rewriter-enabled region. The event object carries the selected text plus the DOM-position context that `replaceText` and `addComment` need to anchor their operation — you do not have to track ranges yourself.

The event is what stitches the rest of the flow together. Without subscribing, you have no entry point for `askAi` (which needs `selectedText`) or `replaceText` / `addComment` (which need the event itself to identify the DOM target).

The Observable is hot — multiple subscribers all receive the same events. In React, subscribe inside `useEffect` and unsubscribe in the cleanup to avoid stale handlers after re-render.

**Correct (React / Next.js — subscribe and dispatch):**

```tsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function RewriterListener() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const rewriterElement = client.getRewriterElement();

    const subscription = rewriterElement.on('textSelected').subscribe(async (event) => {
      // event.text is the user's selection
      // event itself carries DOM-anchor data — pass it through to replaceText / addComment
      console.log('Selected text:', event.text);
    });

    return () => subscription.unsubscribe();
  }, [client]);

  return null;
}
```

**Correct (Other Frameworks):**

```js
const rewriterElement = Velt.getRewriterElement();

const subscription = rewriterElement.on('textSelected').subscribe((event) => {
  console.log('Selected text:', event.text);
});

// Later: subscription.unsubscribe();
```

---

## 2. Patterns

**Impact: HIGH**

End-to-end pipeline guidance — how the individual API methods compose into the canonical Rewriter flow (enable → subscribe → askAi → replaceText / addComment). Captures the event-threading rules (`event.text` for prompt input, full `event` for DOM-anchored actions) and the React `useEffect` lifecycle for subscriptions.

### 2.1 Wire the full Rewriter pipeline — enable, subscribe, askAi, then replaceText or addComment

**Impact: HIGH (The canonical end-to-end pattern; getting the order or the event-threading wrong is the most common source of "the rewriter doesn't do anything" bugs)**

The Rewriter is built as a four-step pipeline. Each step depends on the previous; skipping or reordering produces silent failures (events never fire, AI output never lands in the DOM, comments fail to anchor).

1. **Enable** — `rewriterElement.enableRewriter()`. Without this, no `textSelected` events fire and the feature is dormant.
2. **Subscribe** — `rewriterElement.on('textSelected').subscribe(event => ...)`. The event is the source of truth for what the user highlighted, including DOM-anchor metadata.
3. **Generate** — `rewriterElement.askAi({ model, prompt, selectedText: event.text })`. Provider is auto-routed from the model prefix.
4. **Apply** — either `rewriterElement.replaceText({ text: response.text, event })` to swap the DOM text, or `rewriterElement.addComment({ text: response.text, event })` to anchor a comment, or both (e.g., comment-then-replace-on-approval).

The `event` object from step 2 must be threaded into steps 3 and 4. Step 3 needs `event.text` for the prompt input. Step 4 needs the full `event` (not just `event.text`) because Velt uses its DOM-anchor metadata to perform safe replacement / pinning.

In React, the whole pipeline lives inside a single `useEffect` keyed on the Velt client. Activate `enableRewriter` and the subscription on mount, dispose both on unmount.

UI choice: by default Velt renders a built-in selection toolbar. If you want your own UI, call `rewriterElement.disableDefaultUI()` — the rewriter keeps emitting events and your custom UI (or wireframe slots) renders from the same data stream. See `api-default-ui-toggle` and `wireframe-variables-rewriter`.

**Correct (React / Next.js — full pipeline with replace-text apply step):**

```tsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function Rewriter() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const rewriterElement = client.getRewriterElement();

    // 1. Enable feature
    rewriterElement.enableRewriter();

    // 2. Subscribe to selections
    const sub = rewriterElement.on('textSelected').subscribe(async (event) => {
      // 3. Generate
      const aiResponse = await rewriterElement.askAi({
        model: 'gemini-2.5-flash',
        prompt: 'Make it more formal',
        selectedText: event.text,
      });
      if (!aiResponse.success) return;

      // 4. Apply: replace in place
      await rewriterElement.replaceText({ text: aiResponse.text, event });
    });

    return () => {
      sub.unsubscribe();
      rewriterElement.disableRewriter();
    };
  }, [client]);

  return null;
}
```

**Correct (Other Frameworks):**

```js
const rewriterElement = Velt.getRewriterElement();
rewriterElement.enableRewriter();

rewriterElement.on('textSelected').subscribe(async (event) => {
  const aiResponse = await rewriterElement.askAi({
    model: 'gemini-2.5-flash',
    prompt: 'Make it more formal',
    selectedText: event.text,
  });
  if (aiResponse.success) {
    await rewriterElement.replaceText({ text: aiResponse.text, event });
  }
});
```

---

## 3. Types

**Impact: MEDIUM**

TypeScript type contracts for the rewriter, including the open `AiModel` union over OpenAI, Anthropic, and Gemini model identifiers (with the `(string & NonNullable<unknown>)` escape hatch for forward-compatibility with unenumerated model strings).

### 3.1 Use the AiModel Union Type for RewriterAskAiRequest.model

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

## 4. Wireframe Variables

**Impact: MEDIUM**

Template-variable bindings for the Rewriter wireframe family (`<velt-rewriter-text-portal-wireframe>`, `<velt-rewriter-dialog-wireframe>`, `<velt-rewriter-bottom-sheet-wireframe>`, `<velt-rewriters-container-wireframe>`). Uses the **flat-config** access pattern — variables are referenced via `componentConfig.<path>`. Each primitive carries its own `componentConfigSignal` exposing loading state, option list, selection index, and annotation drill-down for building custom rewriter UIs that coexist with `disableDefaultUI()`.

### 4.1 Bind Rewriter Wireframe Slots Using Template Variables

**Impact: MEDIUM (Drives dynamic content, conditional rendering, and class toggling inside Rewriter wireframe slots without re-subscribing to rewriter annotation state)**

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
- https://docs.velt.dev/ai/rewriter/overview
- https://docs.velt.dev/ai/rewriter/setup
- https://docs.velt.dev/ai/rewriter/customize-behavior
- https://docs.velt.dev/api-reference/sdk/models/data-models#rewriteraskairequest
- https://docs.velt.dev/api-reference/sdk/models/data-models#rewriterreplacetextrequest
- https://docs.velt.dev/api-reference/sdk/models/data-models#rewriteraddcommentrequest
- https://docs.velt.dev/api-reference/sdk/models/data-models#textselectedevent
- https://docs.velt.dev/ui-customization/features/async/rewriter/wireframe-variables
- https://console.velt.dev
