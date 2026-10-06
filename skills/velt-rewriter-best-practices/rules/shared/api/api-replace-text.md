---
title: Apply AI output to the DOM with replaceText
impact: HIGH
impactDescription: Performs the in-place DOM replacement that completes the rewrite — using event metadata, not a manual range lookup
tags: rewriter, RewriterElement, replaceText, RewriterReplaceTextRequest, DOM, replacement
---

## Apply AI output to the DOM with replaceText

`RewriterElement.replaceText({ text, event })` swaps the originally-selected DOM text with new text. Velt uses the `event` from the `textSelected` subscription to locate the exact DOM range — you do not pass a selector, range, or coordinates. The `text` argument is whatever you want to put in its place (typically `response.text` from `askAi`).

The reason `event` is required (not just the original `event.text` string) is robustness: the event carries Velt-managed anchor metadata that survives DOM changes and concurrent edits in ways a raw string match wouldn't. Pass the event through; don't reconstruct it.

The response is a success/failure shape with `originalText` and `replacedText` on success — useful for showing a before/after diff or for undo.

Since v6.0.16-beta.1, `replaceText()` returns `success: false` for a selection inside TipTap or another ProseMirror-based editor (writing into those editors caused a page freeze). The Rewriter does not apply text inside these editors, so always branch on `result.success` instead of assuming the DOM changed.

**Incorrect (assumes the replacement always lands):**

```tsx
rewriterElement.on('textSelected').subscribe(async (event) => {
  const aiResponse = await rewriterElement.askAi({ model: 'gpt-4o', prompt: 'Shorten', selectedText: event.text });
  await rewriterElement.replaceText({ text: aiResponse.text, event });
  // BUG: shows "Applied!" even when replaceText returned success: false
  // (for example, a selection inside a TipTap / ProseMirror editor)
  showToast('Applied!');
});
```

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

**Pitfalls:**
- DO NOT try to use `document.querySelector` + `innerHTML` / `replaceChild` to apply AI output — you'll lose Velt's anchor tracking and break any anchored comments.
- DO NOT pass `event.text` (the string) instead of `event` (the full event object). The string alone is insufficient context for safe replacement.
- DO NOT check `result.text` — the success-path field is `result.replacedText` (and `result.originalText` for the prior content).
- DO NOT rely on `replaceText` for content inside TipTap or other ProseMirror-based editors. It returns `success: false` there and leaves the editor untouched.

**Verification Checklist:**
- [ ] The full `event` from the `textSelected` subscription is passed through (not just `event.text`)
- [ ] `result.success` is checked before reading `result.originalText` / `result.replacedText`
- [ ] No manual DOM manipulation (`innerHTML` / `replaceChild`) is being used in place of `replaceText`
- [ ] `replaceText` is called from inside the `textSelected` handler so the event is fresh
- [ ] The `success: false` path is handled (for example, no "applied" UI), including selections inside TipTap / ProseMirror editors

**Source Pointers:**
- https://docs.velt.dev/ai/rewriter/setup — Step 4 Option A: Replace selected text
- https://docs.velt.dev/api-reference/sdk/models/data-models#rewriterreplacetextrequest — `RewriterReplaceTextRequest`
- https://docs.velt.dev/api-reference/sdk/models/data-models#rewriterreplacetextresponse — `RewriterReplaceTextResponse`
- https://docs.velt.dev/ai/rewriter/customize-behavior#replacetext — TipTap / ProseMirror note (6.0.16-beta.1)
