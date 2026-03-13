---
title: Use commentSaveTriggered for Immediate UI Feedback Before Async Save Completes
impact: LOW
impactDescription: Show spinners or disable UI the moment the user clicks save — before the database write — without reacting too late with the post-persist commentSaved event
tags: commentSaveTriggered, commentSaved, event, CommentSaveTriggeredEvent, useCommentEventCallback, subscribe, lifecycle, UI feedback, optimistic
---

## Use commentSaveTriggered for Immediate UI Feedback Before Async Save Completes

The `commentSaveTriggered` event fires the instant the save button is clicked, before the async database write begins. Use it for immediate UI feedback (spinners, disabled states) and use `commentSaved` — which fires only after the write confirms — for reliable post-persist side-effects such as webhooks or analytics.

**Incorrect (using commentSaved for immediate UI feedback — fires too late):**

```jsx
import { useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function SaveFeedback() {
  const savedEvent = useCommentEventCallback('commentSaved');

  useEffect(() => {
    if (!savedEvent) return;
    // commentSaved fires AFTER the database write completes.
    // The UI will feel sluggish — the spinner appears only after the round-trip.
    showSpinner();
  }, [savedEvent]);

  return null;
}
```

**Correct (React — use commentSaveTriggered for immediate feedback):**

```jsx
import { useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function CommentSaveTriggeredListener() {
  const triggeredEvent = useCommentEventCallback('commentSaveTriggered');

  useEffect(() => {
    if (!triggeredEvent) return;
    // Fires immediately on button click, before the database write starts.
    console.log('Save triggered, annotationId:', triggeredEvent.annotationId);
    // Use for immediate UI feedback only — not for post-persist side-effects.
    showSpinner();
    disableUI();
  }, [triggeredEvent]);

  return null;
}
```

**Correct (HTML / Other Frameworks — subscribe via commentElement):**

```typescript
const commentElement = Velt.getCommentElement();

const subscription = commentElement.on('commentSaveTriggered').subscribe((event) => {
  // Fires immediately on button click, before the database write starts.
  console.log('Save triggered, annotationId:', event.annotationId);
  showSpinner();
  disableUI();
});

// Clean up subscription when no longer needed
subscription.unsubscribe();
```

**`CommentSaveTriggeredEvent` Interface:**

```typescript
interface CommentSaveTriggeredEvent {
  annotationId: string;                 // ID of the comment annotation being saved
  commentAnnotation: CommentAnnotation; // Full annotation object at save time (v5.0.2-beta.4+)
  metadata: VeltEventMetadata;          // Event metadata (timestamp, source, etc.)
}
```

**Event Timing Reference:**

| Event | Fires When | Use For |
|-------|-----------|---------|
| `commentSaveTriggered` | Immediately on save button click | Instant UI feedback (spinners, disabled states) |
| `commentSaved` | After async database write confirms | Webhooks, analytics, external sync |

**Key Behaviors:**

- `commentSaveTriggered` fires **before** the database write — it is not a confirmation of persistence.
- Do not trigger webhooks or external sync from `commentSaveTriggered`; those side-effects require confirmation from `commentSaved`.
- `CommentSaveTriggeredEvent` now includes the full `commentAnnotation` object (v5.0.2-beta.4+), providing comment content, assignment, and visibility state without a separate lookup.
- In React, `useCommentEventCallback('commentSaveTriggered')` returns the latest event value and updates on each new save click.
- In non-React frameworks, always call `.unsubscribe()` to avoid memory leaks when the listener is no longer needed.

**Verification Checklist:**
- [ ] Immediate UI side-effects (spinners, disabled inputs) use `commentSaveTriggered`, not `commentSaved`
- [ ] Post-persist side-effects (webhooks, analytics, external sync) use `commentSaved`, not `commentSaveTriggered`
- [ ] React usage uses `useCommentEventCallback('commentSaveTriggered')` with a `useEffect` that depends on `triggeredEvent`
- [ ] Non-React usage calls `.unsubscribe()` to clean up the subscription when the listener is destroyed

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior/events - `commentSaveTriggered` event and payload reference
- https://docs.velt.dev/api-reference/sdk/api/react-hooks - `useCommentEventCallback` hook
- https://docs.velt.dev/api-reference/sdk/api/elements/comment-element - `commentElement.on()` subscription pattern
