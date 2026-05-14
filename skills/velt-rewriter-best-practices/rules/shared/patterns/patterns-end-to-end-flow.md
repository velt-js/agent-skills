---
title: Wire the full Rewriter pipeline — enable, subscribe, askAi, then replaceText or addComment
impact: HIGH
impactDescription: The canonical end-to-end pattern; getting the order or the event-threading wrong is the most common source of "the rewriter doesn't do anything" bugs
tags: rewriter, RewriterElement, setup, end-to-end, pipeline, enableRewriter, textSelected, askAi, replaceText, addComment
---

## Wire the full Rewriter pipeline — enable, subscribe, askAi, then replaceText or addComment

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

**Common mistakes:**

1. **Forgetting `enableRewriter()`** — no events fire and nothing happens. Symptoms: the `subscribe` handler never runs even when the user selects text.
2. **Subscribing before enabling** — the order matters less in practice (the subscription is hot), but always call `enableRewriter()` first to keep the mental model clear.
3. **Threading `event.text` into `replaceText`** — must pass the full `event`, not just the string.
4. **Confusing `disableDefaultUI()` with `disableRewriter()`** — the former hides the toolbar only; the latter shuts the feature off. Pick based on whether you still want events.
5. **Not unsubscribing on unmount** — in React, leaks an Observable subscription per render of the parent.

**Verification Checklist:**
- [ ] `enableRewriter()` is called before any subscription / `askAi` / `replaceText` / `addComment`
- [ ] The `textSelected` subscription is alive for as long as the feature should be active
- [ ] `event.text` is used as the `selectedText` argument to `askAi`
- [ ] The full `event` object (not just `event.text`) is passed to `replaceText` / `addComment`
- [ ] `response.success` is checked before reading downstream fields
- [ ] In React, the pipeline lives in a single `useEffect` with a cleanup that disposes the subscription and disables the feature

**Source Pointers:**
- https://docs.velt.dev/ai/rewriter/setup — full setup walkthrough
- https://docs.velt.dev/ai/rewriter/overview — How it works (the four-step pipeline)
