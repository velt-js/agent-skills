---
title: Deferred Commit with targetEditCommit Event
impact: HIGH
tags: targetEditCommit, commitSuggestion, deferred, validation, useSuggestionEventCallback
---

## Deferred Commit with targetEditCommit Event

If you skip `onTargetEditCommit`, subscribe to the `targetEditCommit` event. Its payload carries a pre-bound `commitSuggestion` builder — call it to finalize, or don't call it to drop the edit. This lets you gate suggestion creation behind validation or user confirmation.

**React / Next.js:**
```jsx
import { useSuggestionEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function CommitGate() {
  const commitEvent = useSuggestionEventCallback('targetEditCommit');

  useEffect(() => {
    if (!commitEvent) return;
    const { details, commitSuggestion } = commitEvent;
    if (isValid(details.newValue)) {
      commitSuggestion({ summary: `Update ${details.targetId}` });
    }
    // Not calling commitSuggestion drops the edit silently
  }, [commitEvent]);

  return null;
}
```

**Other Frameworks:**
```js
suggestionElement.on('targetEditCommit').subscribe(({ details, commitSuggestion }) => {
  if (isValid(details.newValue)) {
    commitSuggestion({ summary: `Update ${details.targetId}` });
  }
});
```

### When to Use This Over Auto-Commit

- You need to validate the new value before creating a suggestion
- You want to show a confirmation dialog before committing
- You need async logic (API call) before deciding whether to create the suggestion
