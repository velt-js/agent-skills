---
title: Apply accepted suggestions from the comment element events
impact: CRITICAL
impactDescription: The SDK never writes accepted values; without an idempotent suggestionAccepted handler on the comment element, approved changes are lost
tags: suggestionAccepted, suggestionRejected, useCommentEventCallback, commentElement, apply, idempotent, SuggestionAcceptEvent, SuggestionRejectEvent
---

## Apply accepted suggestions from the comment element events

This is the step you cannot skip. When a reviewer clicks **Accept** or **Reject** (or your code calls `acceptSuggestion()` / `rejectSuggestion()`), the SDK updates the suggestion's status but does **not** change your data. Listen for `suggestionAccepted` on the **comment element**, read `commentAnnotation.suggestion.newValue`, and write it to your state or backend.

**Incorrect (wrong element):**

```jsx
// BUG: accept/reject outcomes are emitted on the comment element, not the suggestion element
const accepted = useSuggestionEventCallback('suggestionAccepted');
```

**Correct (React / Next.js):**

```jsx
import { useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function ApplyAcceptedSuggestions() {
  const accepted = useCommentEventCallback('suggestionAccepted');
  const rejected = useCommentEventCallback('suggestionRejected');

  useEffect(() => {
    const suggestion = accepted?.commentAnnotation?.suggestion;
    if (!suggestion) return;
    applyToYourState(suggestion.targetId, suggestion.newValue); // set, never increment
  }, [accepted]);

  useEffect(() => {
    if (rejected?.commentAnnotation) {
      console.log('Rejected:', rejected.rejectReason);
    }
  }, [rejected]);

  return null;
}
```

**Correct (Other Frameworks):**

```js
const commentElement = Velt.getCommentElement();

const acceptSub = commentElement.on('suggestionAccepted').subscribe(({ commentAnnotation }) => {
  const suggestion = commentAnnotation?.suggestion;
  applyToYourState(suggestion.targetId, suggestion.newValue);
});

const rejectSub = commentElement.on('suggestionRejected').subscribe(({ rejectReason }) => {
  console.log('Rejected:', rejectReason);
});

// On teardown:
acceptSub?.unsubscribe();
rejectSub?.unsubscribe();
```

**Make the handler idempotent.** It can run more than once (after reconnects, in multiple tabs, and on every client viewing the document). Set the field to `newValue` rather than incrementing it. If the handler throws while applying, the SDK marks the suggestion `apply_failed`.

Payloads: `SuggestionAcceptEvent` has `annotationId`, `commentAnnotation`, `metadata`, `actionUser`; `SuggestionRejectEvent` adds optional `rejectReason`.

**Verification Checklist:**
- [ ] Subscriptions use `useCommentEventCallback` or `commentElement.on()`, not the suggestion element
- [ ] The handler reads `commentAnnotation.suggestion.targetId` and `.newValue`
- [ ] Applying the value is safe to repeat
- [ ] Non-React subscriptions are unsubscribed on teardown

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview#4-apply-accepted-suggestions — "4. Apply Accepted Suggestions"
- https://docs.velt.dev/api-reference/sdk/models/data-models#suggestionacceptevent — `SuggestionAcceptEvent`
- https://docs.velt.dev/api-reference/sdk/models/data-models#suggestionrejectevent — `SuggestionRejectEvent`
