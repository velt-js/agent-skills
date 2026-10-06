---
title: Create suggestions manually with startSuggestion and commitSuggestion
impact: HIGH
impactDescription: The only path for non-DOM widgets and AI-proposed changes; commitSuggestion rejects when mode is off, the target is unknown, or the value is unchanged
tags: startSuggestion, commitSuggestion, useStartSuggestion, useCommitSuggestion, manual, AI agent, non-DOM, CommitSuggestionConfig
---

## Create suggestions manually with startSuggestion and commitSuggestion

When there is no input for the SDK to watch (a canvas, a custom widget, or an "AI proposes a change" button), create the suggestion yourself. Call `startSuggestion(targetId)` to snapshot the current value as `oldValue`, then `commitSuggestion(config)` with the `newValue`. It resolves to `{ id }`.

**Incorrect (commits without the guards being satisfied):**

```js
// BUG: suggestion mode is off and 'chart.title' is neither tagged nor registered,
// so commitSuggestion rejects and nothing is created.
await suggestionElement.commitSuggestion({ targetId: 'chart.title', newValue: 'Q3 revenue' });
```

**Correct (React / Next.js):**

```jsx
import { useStartSuggestion, useCommitSuggestion } from '@veltdev/react';

function ProposeButton() {
  const { startSuggestion } = useStartSuggestion();
  const { commitSuggestion } = useCommitSuggestion();

  const propose = async () => {
    startSuggestion('row.123'); // snapshot oldValue now
    const { id } = await commitSuggestion({
      targetId: 'row.123',
      newValue: { qty: 7, price: 99 },
      summary: 'Bump qty + price',
      metadata: { source: 'ai-agent' },
    });
    console.log('Created suggestion', id);
  };

  return <button onClick={propose}>Propose change</button>;
}
```

**Correct (Other Frameworks):**

```js
suggestionElement.startSuggestion('row.123');

const { id } = await suggestionElement.commitSuggestion({
  targetId: 'row.123',
  newValue: { qty: 7, price: 99 },
  summary: 'Bump qty + price',
  metadata: { source: 'ai-agent' },
});
```

`commitSuggestion` creates nothing when:
- Suggestion mode is off
- The `targetId` is unknown (not tagged in the DOM and not registered with `registerTarget`)
- `newValue` is identical to the captured `oldValue`

For a server-side agent that has no browser session, create the suggestion over REST instead (see `data-backend-rest`).

**Verification Checklist:**
- [ ] Suggestion mode is enabled before `commitSuggestion`
- [ ] The target is tagged with `data-velt-suggestion-target` or registered with a getter
- [ ] `startSuggestion(targetId)` runs before `commitSuggestion` so `oldValue` is captured
- [ ] The promise rejection is handled

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview#3-capture-edits-as-suggestions — "Option 4: Create suggestions manually"
- https://docs.velt.dev/api-reference/sdk/models/data-models#commitsuggestionconfigt — `CommitSuggestionConfig<T>`
- https://docs.velt.dev/api-reference/sdk/api/api-methods#commitsuggestion — `commitSuggestion()`
