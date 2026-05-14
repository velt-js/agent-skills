---
title: Call askAi to generate rewrites — provider is auto-routed by model prefix
impact: HIGH
impactDescription: Single multi-provider entry point for AI generation; Velt routes to OpenAI / Anthropic / Gemini based on the model string prefix, no per-provider wiring needed
tags: rewriter, RewriterElement, askAi, RewriterAskAiRequest, RewriterAskAiResponse, openai, anthropic, gemini, model, prompt, selectedText
---

## Call askAi to generate rewrites — provider is auto-routed by model prefix

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

**Pitfalls:**
- DO NOT add a `provider` field to the request — there is no such field. Provider is inferred from the `model` prefix.
- DO NOT hardcode an API key in the client. If you need custom keys, configure them in the Velt Console and call `askAi` normally.
- DO NOT assume `response.text` is set before checking `response.success` — the response is a discriminated success/failure shape.
- DO NOT confuse this with `sdk.api.rewriter.askAi` (server-side Python SDK) — that's a separate code path documented in `velt-self-hosting-data-best-practices`.

**Verification Checklist:**
- [ ] `model` field uses a prefix that matches the desired provider (`gpt-*`/`o1-*`/`o3-*`/`o4-*`/`claude-*`/`gemini-*`)
- [ ] `selectedText` is passed through from `event.text`, not from `window.getSelection()`
- [ ] `response.success` is checked before reading `response.text`
- [ ] No `provider` field is included in the request
- [ ] Custom LLM keys are configured in the Velt Console, not embedded in the client

**Source Pointers:**
- https://docs.velt.dev/ai/rewriter/setup — Step 3: Send a prompt to AI
- https://docs.velt.dev/api-reference/sdk/models/data-models#rewriteraskairequest — `RewriterAskAiRequest`
- https://docs.velt.dev/api-reference/sdk/models/data-models#rewriteraskairesponse — `RewriterAskAiResponse`
- https://console.velt.dev/ — configure custom LLM API keys
