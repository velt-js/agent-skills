---
title: Use the AiModel Union Type for RewriterAskAiRequest.model
impact: MEDIUM
impactDescription: Enables type-safe model selection across OpenAI, Anthropic, and Gemini without losing extensibility
tags: rewriter, AiModel, RewriterAskAiRequest, model, typescript, openai, anthropic, gemini
---

## Use the AiModel Union Type for RewriterAskAiRequest.model

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

**Additional Context:**

The union is intentionally open. Passing a model string that is not in the enumerated set still compiles — TypeScript treats it as the `(string & NonNullable<unknown>)` branch rather than an error. This means upgrading to a newly released model identifier requires no library update on the consumer side.

See the full list of enumerated model identifiers in the `AiModel` type definition at the data-models reference below.

**Verification Checklist:**
- [ ] `model` field is typed as `AiModel` (or inferred via `RewriterAskAiRequest`) rather than a bare `string`
- [ ] IDE autocomplete is being used to select from the enumerated model list
- [ ] Non-standard model strings are passed as-is (no cast needed — union is open)
- [ ] `RewriterAskAiRequest` is imported from `@veltdev/types` or the relevant Velt types package

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/models/data-models#rewriteraskairequest - RewriterAskAiRequest data model and AiModel union definition
