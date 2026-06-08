---
title: Stale Suggestions and Drift Detection
impact: MEDIUM
tags: stale, driftDetected, suggestionStale, apply_failed
---

## Stale Suggestions and Drift Detection

### Stale Detection

If the target DOM node can't be resolved when a reviewer accepts, the suggestion transitions to `stale` instead of `accepted`. Listen for this on the SuggestionElement:

**React / Next.js:**
```jsx
import { useSuggestionEventCallback } from '@veltdev/react';

const staleEvent = useSuggestionEventCallback('suggestionStale');
```

**Other Frameworks:**
```js
suggestionElement.on('suggestionStale').subscribe((event) => {
  console.log('Suggestion went stale:', event);
});
```

Stale wins over drift — if the DOM node is missing, drift detection is skipped entirely.

### Drift Detection

On accept, if a getter is registered, the SDK compares the live value against the suggestion's `oldValue`. A mismatch sets `driftDetected: true` on the suggestion. In v1, the SDK records the flag but doesn't surface a confirmation prompt (that's planned for a future release).

### apply_failed

If your accept handler throws while applying `newValue`, the SDK marks the suggestion `apply_failed`. There's no separate event for this in v1 — it's only a status.

### Key Points

- Build your app to handle stale gracefully — show a "target no longer exists" message
- Check `suggestion.driftDetected` if you want to warn users that the target value changed since the suggestion was created
- Make accept handlers idempotent and catch errors to avoid `apply_failed`
