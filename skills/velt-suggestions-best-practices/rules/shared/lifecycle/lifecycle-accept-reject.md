---
title: Handle Accept and Reject Events
impact: CRITICAL
tags: suggestionAccepted, suggestionRejected, useCommentEventCallback, apply, idempotent
---

## Handle Accept and Reject Events

This is the step you cannot skip. Accept/reject buttons live on the comment dialog, so the outcome is emitted on the **comment element** (not the SuggestionElement). The SDK records the outcome — but your handler applies `newValue` to your data.

**React / Next.js:**
```jsx
import { useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function ApplyAcceptedSuggestions() {
  const accepted = useCommentEventCallback('suggestionAccepted');
  const rejected = useCommentEventCallback('suggestionRejected');

  useEffect(() => {
    const suggestion = accepted?.commentAnnotation?.suggestion;
    if (!suggestion) return;
    applyToYourState(suggestion.targetId, suggestion.newValue);
  }, [accepted]);

  useEffect(() => {
    if (rejected?.commentAnnotation) {
      console.log('Rejected:', rejected.rejectReason);
    }
  }, [rejected]);

  return null;
}
```

**Other Frameworks:**
```js
const commentElement = Velt.getCommentElement();

commentElement.on('suggestionAccepted').subscribe(({ commentAnnotation }) => {
  const suggestion = commentAnnotation?.suggestion;
  applyToYourState(suggestion.targetId, suggestion.newValue);
});

commentElement.on('suggestionRejected').subscribe(({ commentAnnotation, rejectReason }) => {
  console.log('Rejected:', rejectReason);
});
```

### Make Your Accept Handler Idempotent

The handler can fire more than once — across reconnects, multiple tabs, and multiple clients viewing the same document. Applying `newValue` should be safe to run repeatedly (e.g., set the field to `newValue` rather than incrementing it).

If your handler throws while applying, the SDK marks the suggestion `apply_failed`.

### Key Points

- Subscribe with `useCommentEventCallback` (React) or `commentElement.on()` — NOT `useSuggestionEventCallback`
- Read the change from `commentAnnotation.suggestion.targetId` and `.newValue`
- The `accepted` payload type is `SuggestionAcceptEvent` with `annotationId`, `commentAnnotation`, `metadata`, `actionUser`
- The `rejected` payload adds `rejectReason`
