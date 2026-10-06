---
title: Customize each suggestion with onTargetEditCommit
impact: HIGH
impactDescription: The handler controls summary, summaryHtml, and metadata per edit; it always wins over autoCommit, and returning null skips the edit
tags: onTargetEditCommit, onTargetEditStart, enableSuggestionMode, summary, summaryHtml, metadata, TargetEditCommitResult
---

## Customize each suggestion with onTargetEditCommit

Pass `onTargetEditCommit` when you enable suggestion mode. The SDK calls it with `{ targetId, oldValue, newValue, element }` each time a user finishes an edit. Return an object and the SDK creates the suggestion right away with your `summary`, `summaryHtml`, and `metadata`. Return `null` to skip creating one. The handler always wins over `autoCommit`. `onTargetEditStart` fires when editing begins; it is informational and its return value is reserved.

**Incorrect (expects autoCommit false to block the handler):**

```js
suggestionElement.enableSuggestionMode({
  autoCommit: false, // ignored: onTargetEditCommit is provided
  onTargetEditCommit: ({ targetId, newValue }) => ({ summary: `${targetId} → ${newValue}` }),
});
// BUG: every edit still becomes a suggestion; return null from the handler to skip
```

**Correct (React / Next.js):**

```jsx
import { useEnableSuggestionMode } from '@veltdev/react';

function Toolbar() {
  const { enableSuggestionMode } = useEnableSuggestionMode();

  const startSuggesting = () =>
    enableSuggestionMode({
      onTargetEditStart: ({ targetId, oldValue }) => {
        // Informational: oldValue was just snapshotted
      },
      onTargetEditCommit: ({ targetId, oldValue, newValue }) => {
        if (newValue === '') return null; // skip this edit
        return {
          summary: `${targetId}: ${oldValue} → ${newValue}`,
          metadata: { source: 'inline-edit' },
        };
      },
    });

  return <button onClick={startSuggesting}>Suggest changes</button>;
}
```

**Correct (Other Frameworks):**

```js
suggestionElement.enableSuggestionMode({
  onTargetEditCommit: ({ targetId, oldValue, newValue }) => ({
    summary: `${targetId}: ${oldValue} → ${newValue}`,
    metadata: { source: 'inline-edit' },
  }),
});
```

If a handler commit fails, it no longer blocks a retry: call the `commitSuggestion` function on the `targetEditCommit` event payload to try again. A successful commit is protected against an accidental double commit.

**Verification Checklist:**
- [ ] The handler returns (or resolves to) `{ summary, summaryHtml?, metadata? }`, or `null` to skip the edit
- [ ] Code does not combine `onTargetEditCommit` with `autoCommit: false` expecting detect-only behavior
- [ ] `onTargetEditStart` is used for side effects only

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview#3-capture-edits-as-suggestions — "Option 2: Customize each suggestion with `onTargetEditCommit`"
- https://docs.velt.dev/api-reference/sdk/models/data-models#targeteditcommitresult — `TargetEditCommitResult`
- https://docs.velt.dev/api-reference/sdk/models/data-models#targeteditcommithandlert — `TargetEditCommitHandler<T>`
