---
title: Gate commits with the targetEditCommit event and autoCommit false
impact: HIGH
impactDescription: Without autoCommit false the SDK commits first and the event's commitSuggestion becomes a no-op, so validation and confirmation gates silently stop working
tags: targetEditCommit, commitSuggestion, autoCommit, detect-only, deferred, validation, useSuggestionEventCallback, TargetEditCommitEvent
---

## Gate commits with the targetEditCommit event and autoCommit false

Use this path when you need to validate a value, ask the user to confirm, or run async logic before a suggestion exists. Enable suggestion mode with `autoCommit: false` and **no** `onTargetEditCommit`, then subscribe to `targetEditCommit` on the suggestion element. The payload carries `details` plus a `commitSuggestion` function already bound to that edit. Call it (optionally overriding `summary`, `summaryHtml`, `metadata`) to create the suggestion, or skip it to discard the edit.

**Incorrect (missing the opt-out):**

```jsx
// BUG: autoCommit defaults to true, so every edit is committed before this effect runs
const commitEvent = useSuggestionEventCallback('targetEditCommit');
useEffect(() => {
  if (commitEvent && isValid(commitEvent.details.newValue)) {
    commitEvent.commitSuggestion({ summary: 'Validated change' });
  }
}, [commitEvent]);
```

**Correct (React / Next.js):**

```jsx
import { useEnableSuggestionMode, useSuggestionEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function CommitGate() {
  const { enableSuggestionMode } = useEnableSuggestionMode();

  useEffect(() => {
    // Detect-only: without this, the SDK auto-commits before your gate runs.
    enableSuggestionMode({ autoCommit: false });
  }, []);

  const commitEvent = useSuggestionEventCallback('targetEditCommit');

  useEffect(() => {
    if (!commitEvent) return;
    const { details, commitSuggestion } = commitEvent;
    if (isValid(details.newValue)) {
      commitSuggestion({ summary: `Update ${details.targetId}` });
    }
  }, [commitEvent]);

  return null;
}
```

**Correct (Other Frameworks):**

```js
suggestionElement.enableSuggestionMode({ autoCommit: false });

const subscription = suggestionElement
  .on('targetEditCommit')
  .subscribe(({ details, commitSuggestion }) => {
    if (isValid(details.newValue)) {
      commitSuggestion({ summary: `Update ${details.targetId}` });
    }
  });

// On teardown:
subscription?.unsubscribe();
```

The event's `commitSuggestion` returns `Promise<{ id: string }>`. If an earlier auto-commit or handler commit failed, calling it retries; after a successful commit it is a no-op.

**Verification Checklist:**
- [ ] `enableSuggestionMode({ autoCommit: false })` is used, with no `onTargetEditCommit`
- [ ] The subscription is on the suggestion element (`useSuggestionEventCallback` / `suggestionElement.on`), not the comment element
- [ ] Discarded edits simply skip `commitSuggestion`
- [ ] Non-React subscriptions are unsubscribed on teardown

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview#3-capture-edits-as-suggestions — "Option 3: Decide per edit with the `targetEditCommit` event"
- https://docs.velt.dev/api-reference/sdk/models/data-models#targeteditcommitevent — `TargetEditCommitEvent`
- https://docs.velt.dev/api-reference/sdk/models/data-models#targeteditcommitbuilder — `TargetEditCommitBuilder`
