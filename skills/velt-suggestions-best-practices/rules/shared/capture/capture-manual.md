---
title: Manual Suggestion Creation with startSuggestion / commitSuggestion
impact: HIGH
tags: startSuggestion, commitSuggestion, manual, AI agent, non-DOM, programmatic
---

## Manual Suggestion Creation

For non-DOM flows — custom widgets, canvas elements, or an "AI proposes a change" button — bypass auto-detection entirely. Call `startSuggestion(targetId)` to snapshot the current value, then `commitSuggestion(config)` to create the proposal.

**React / Next.js:**
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

**Other Frameworks:**
```js
suggestionElement.startSuggestion('row.123');

const { id } = await suggestionElement.commitSuggestion({
  targetId: 'row.123',
  newValue: { qty: 7, price: 99 },
  summary: 'Bump qty + price',
  metadata: { source: 'ai-agent' },
});
```

### Guards

`commitSuggestion` rejects (and creates nothing) when:
- Suggestion mode is not enabled
- The `targetId` is unknown (not tagged or registered)
- `newValue` is deeply equal to the snapshot — no no-op suggestions

### AI Agent Pattern

This is the approach for AI-proposes-human-reviews workflows. The AI calls `startSuggestion` + `commitSuggestion` programmatically, and a human reviewer accepts or rejects via the comment dialog.

```jsx
const aiPropose = async (targetId, aiGeneratedValue, description) => {
  startSuggestion(targetId);
  await commitSuggestion({
    targetId,
    newValue: aiGeneratedValue,
    summary: description,
    metadata: { source: 'ai', model: 'gpt-4' },
  });
};
```
