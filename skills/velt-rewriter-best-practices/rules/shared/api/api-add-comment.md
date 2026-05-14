---
title: Anchor a comment to the selected text with addComment
impact: MEDIUM
impactDescription: Creates a Velt comment annotation pinned to the same text range — pairs the Rewriter with the Comments feature for review workflows
tags: rewriter, RewriterElement, addComment, RewriterAddCommentRequest, annotation, comments
---

## Anchor a comment to the selected text with addComment

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

**Pitfalls:**
- DO NOT confuse `addComment` (Rewriter API, anchored to a text range from a `textSelected` event) with the comments-feature `addComment` you might use elsewhere — they are different methods with different anchoring semantics.
- DO NOT pass arbitrary user text into `addComment` without the corresponding `event` — annotation anchoring requires the event metadata.

**Verification Checklist:**
- [ ] The full `event` from `textSelected` is passed through
- [ ] `result.success` is checked before reading `result.annotationId`
- [ ] If both anchoring and replacement are needed, `addComment` and `replaceText` are sequenced (typically comment first, replace on approval)

**Source Pointers:**
- https://docs.velt.dev/ai/rewriter/setup — Step 4 Option B: Add a comment to selected text
- https://docs.velt.dev/api-reference/sdk/models/data-models#rewriteraddcommentrequest — `RewriterAddCommentRequest`
- https://docs.velt.dev/api-reference/sdk/models/data-models#rewriteraddcommentresponse — `RewriterAddCommentResponse`
