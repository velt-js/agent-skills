---
title: Render rich suggestion bodies with summaryHtml
impact: MEDIUM
impactDescription: summaryHtml gives reviewers a formatted diff on the suggestion card; summary stays the plain-text fallback
tags: summaryHtml, summary, commitSuggestion, onTargetEditCommit, TargetEditCommitResult, commentHtml, commentText, DOMPurify
---

## Render rich suggestion bodies with summaryHtml

When a suggestion is created, the SDK adds a first comment to its thread; that comment is the body the suggestion card displays. Since v6.0.0-beta.13 you can pass `summaryHtml` alongside `summary` in `commitSuggestion(config)`, in the object returned from `onTargetEditCommit`, or in the overrides passed to the event's `commitSuggestion`. `summaryHtml` becomes the comment's `commentHtml`; `summary` (or the SDK's default diff text) stays in `commentText` as the fallback.

**Incorrect (HTML stuffed into the plain summary):**

```js
await suggestionElement.commitSuggestion({
  targetId: 'price-field',
  newValue: 6000,
  // BUG: summary is escaped and wrapped in <p>, so the tags render as literal text
  summary: '<p>Price: <s>$5,000</s> <b>$6,000</b></p>',
});
```

**Correct (React / Next.js):**

```jsx
import { useCommitSuggestion } from '@veltdev/react';

const { commitSuggestion } = useCommitSuggestion();

await commitSuggestion({
  targetId: 'price-field',
  newValue: 6000,
  summary: 'Price: $5,000 → $6,000',
  summaryHtml: '<p>Price: <s>$5,000</s> <b>$6,000</b></p>',
});
```

**Correct (Other Frameworks):**

```js
await suggestionElement.commitSuggestion({
  targetId: 'price-field',
  newValue: 6000,
  summary: 'Price: $5,000 → $6,000',
  summaryHtml: '<p>Price: <s>$5,000</s> <b>$6,000</b></p>',
});
```

Behavior:
- Only `summary`: `commentHtml` is the HTML-escaped summary wrapped in `<p>`.
- Neither: the SDK renders a default styled diff (old value in red italic, new value in green italic).
- `summaryHtml` is sanitized with DOMPurify at render time: `<script>` tags and event-handler attributes are stripped; inline `style` is kept.

**Verification Checklist:**
- [ ] Rich markup goes in `summaryHtml`, plain text in `summary`
- [ ] A plain `summary` is still provided as the text fallback
- [ ] No reliance on scripts or `onclick` attributes inside `summaryHtml`

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview#rich-html-summaries-with-summaryhtml — "Rich HTML summaries with `summaryHtml`"
- https://docs.velt.dev/api-reference/sdk/models/data-models#commitsuggestionconfigt — `CommitSuggestionConfig<T>.summaryHtml`
- https://docs.velt.dev/api-reference/sdk/models/data-models#targeteditcommitresult — `TargetEditCommitResult.summaryHtml`
