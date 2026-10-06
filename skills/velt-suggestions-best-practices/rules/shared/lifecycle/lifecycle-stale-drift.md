---
title: Handle stale suggestions, drift, and apply_failed
impact: MEDIUM
impactDescription: A suggestion accepted after its target left the page becomes stale instead of accepted; ignoring it leaves reviewers with no feedback
tags: stale, suggestionStale, driftDetected, apply_failed, useSuggestionEventCallback, SuggestionStaleEvent
---

## Handle stale suggestions, drift, and apply_failed

If the target DOM node cannot be resolved when a reviewer accepts, the suggestion moves to `stale` instead of `accepted`, and no `suggestionAccepted` event fires for it. Listen for `suggestionStale` on the **suggestion element**. Stale wins over drift: if the node is missing, drift detection is skipped.

**Incorrect (only listens for accepts):**

```jsx
// BUG: accepts on a removed target never reach this handler; the user sees nothing happen
const accepted = useCommentEventCallback('suggestionAccepted');
```

**Correct (React / Next.js):**

```jsx
import { useSuggestionEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function StaleNotice() {
  const staleEvent = useSuggestionEventCallback('suggestionStale');

  useEffect(() => {
    if (staleEvent?.suggestion) {
      notify(`"${staleEvent.suggestion.targetId}" no longer exists, so the change was not applied.`);
    }
  }, [staleEvent]);

  return null;
}
```

**Correct (Other Frameworks):**

```js
const subscription = suggestionElement.on('suggestionStale').subscribe(({ suggestion }) => {
  notify(`"${suggestion.targetId}" no longer exists, so the change was not applied.`);
});

// On teardown:
subscription?.unsubscribe();
```

**Drift detection (best-effort):** on accept, if a getter is registered, the SDK compares the live value with `oldValue`. A mismatch sets `driftDetected: true` on the suggestion. v1 only records the flag; there is no confirmation prompt yet. Check `suggestion.driftDetected` in your accept handler if you want to warn before overwriting.

**apply_failed:** if your accept handler throws while applying `newValue`, the SDK marks the suggestion `apply_failed`. It is a status only; there is no dedicated event in v1.

**Verification Checklist:**
- [ ] `suggestionStale` is subscribed on the suggestion element
- [ ] The UI explains stale suggestions to the reviewer
- [ ] The accept handler checks `driftDetected` where overwriting a changed value matters
- [ ] The accept handler catches its own errors to avoid unexpected `apply_failed`

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview — "Properties" (drift and stale) and the Note under "4. Apply Accepted Suggestions"
- https://docs.velt.dev/api-reference/sdk/models/data-models#suggestionstaleevent — `SuggestionStaleEvent`
