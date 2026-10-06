---
title: Use the suggestion status lifecycle and the two event sources correctly
impact: HIGH
impactDescription: Status values and event names must match the shipped SDK exactly ('accepted', not 'approved'); subscribing on the wrong element misses events
tags: SuggestionStatus, pending, accepted, rejected, stale, apply_failed, events, suggestionCreated, suggestionStale, targetEditStart, targetEditCommit, suggestionAccepted, suggestionRejected
---

## Use the suggestion status lifecycle and the two event sources correctly

A suggestion moves forward only through these states:

```typescript
type SuggestionStatus = 'pending' | 'accepted' | 'rejected' | 'stale' | 'apply_failed';
```

| Status | Meaning |
|---|---|
| `pending` | Created and awaiting review |
| `accepted` | A reviewer accepted it; your `suggestionAccepted` handler applies `newValue` |
| `rejected` | A reviewer rejected it (optional `rejectReason`); nothing is applied |
| `stale` | The target DOM node could not be resolved at accept time |
| `apply_failed` | Your accept handler threw while applying; status only, no event in v1 |

**Incorrect (invented status value and wrong element):**

```js
// BUG: the status is 'accepted', not 'approved'; outcomes are emitted on the comment element
suggestionElement.getSuggestions({ status: 'approved' });
suggestionElement.on('suggestionApproved').subscribe(apply);
```

**Correct (subscribe on the element that emits each event):**

```jsx
// React / Next.js
// Hook: suggestion element events
const created = useSuggestionEventCallback('suggestionCreated');
// Hook: comment element events (accept / reject outcomes)
const accepted = useCommentEventCallback('suggestionAccepted');

// API Method
client.getSuggestionElement().on('suggestionCreated').subscribe(handleCreated);
client.getCommentElement().on('suggestionAccepted').subscribe(handleAccepted);
```

```js
// Other Frameworks
Velt.getSuggestionElement().on('suggestionCreated').subscribe(handleCreated);
Velt.getCommentElement().on('suggestionAccepted').subscribe(handleAccepted);
```

| Element | Event | Payload |
|---|---|---|
| Comment element | `suggestionAccepted` | `SuggestionAcceptEvent` (`annotationId`, `commentAnnotation`, `metadata`, `actionUser`) |
| Comment element | `suggestionRejected` | `SuggestionRejectEvent` (adds `rejectReason`) |
| Suggestion element | `suggestionCreated` | `SuggestionCreatedEvent` (`suggestion`) |
| Suggestion element | `suggestionStale` | `SuggestionStaleEvent` (`suggestion`) |
| Suggestion element | `targetEditStart` | `TargetEditStartEvent` (`details`) |
| Suggestion element | `targetEditCommit` | `TargetEditCommitEvent` (`details`, `commitSuggestion`) |

The data-model `SuggestionEventTypesMap` also lists `suggestionApproved` / `suggestionRejected` keys for the suggestion element, but the Suggestions guide documents review outcomes on the comment element. Build accept/reject handling on `suggestionAccepted` / `suggestionRejected` from the comment element.

**Verification Checklist:**
- [ ] Status comparisons use the exact literals above
- [ ] Accept/reject handling subscribes on the comment element
- [ ] Creation, stale, and edit events subscribe on the suggestion element
- [ ] Every `.subscribe()` has a matching `unsubscribe()` on teardown

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview#event-subscription — "Event subscription"
- https://docs.velt.dev/async-collaboration/suggestions/overview#lifecycle — "Lifecycle"
- https://docs.velt.dev/api-reference/sdk/models/data-models#suggestionstatus — `SuggestionStatus`
