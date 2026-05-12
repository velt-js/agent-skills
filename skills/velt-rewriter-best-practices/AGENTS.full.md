# Velt Rewriter Best Practices

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

Velt Rewriter implementation guide covering the AI text-rewriter primitive, programmatic control of the default selection toolbar, and type-safe AI model selection via the AiModel union type on RewriterAskAiRequest. Provides patterns for integrating Velt's Rewriter into React, Next.js, and other web applications.

---

## Table of Contents

1. [API Methods](#1-api-methods) — **HIGH**
   - 1.1 [Control the Default Rewriter Toolbar with enableDefaultUI / disableDefaultUI](#11-control-the-default-rewriter-toolbar-with-enabledefaultui-disabledefaultui)

2. [Types](#2-types) — **MEDIUM**
   - 2.1 [Use the AiModel Union Type for RewriterAskAiRequest.model](#21-use-the-aimodel-union-type-for-rewriteraskairequestmodel)

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

## References

- https://docs.velt.dev
- https://docs.velt.dev/async-collaboration/rewriter/overview
- https://docs.velt.dev/async-collaboration/rewriter/api-reference
- https://docs.velt.dev/api-reference/sdk/models/data-models#rewriteraskairequest
- https://console.velt.dev
