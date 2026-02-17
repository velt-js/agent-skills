---
title: Use the commentSaved Event for Reliable Post-Persist Side-Effects
impact: LOW
impactDescription: Trigger webhooks, analytics, or external sync only after database write confirmation — not prematurely on optimistic UI updates
tags: commentSaved, event, webhook, persistence, CommentSavedEvent, useCommentEventCallback, subscribe, lifecycle
---

## Use the commentSaved Event for Reliable Post-Persist Side-Effects

The `commentSaved` event fires after a comment annotation is successfully written to the database. Use this event — not optimistic UI callbacks — as the trigger for side-effects such as webhooks, audit logging, or syncing external systems.

**Incorrect (triggering side-effects on optimistic callbacks — may fire before persistence):**

```jsx
// onCommentAdd fires optimistically before the comment is persisted.
// Side-effects triggered here can reference data that has not yet been saved.
<VeltComments
  onCommentAdd={(event) => {
    triggerWebhook(event); // Unreliable — may fire before database write
  }}
/>
```

**Correct (React — subscribe via useCommentEventCallback):**

```jsx
import { useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function CommentSaveListener() {
  const savedEvent = useCommentEventCallback('commentSaved');

  useEffect(() => {
    if (!savedEvent) return;

    // Fires only after the annotation is confirmed in the database.
    console.log('Comment persisted, annotationId:', savedEvent.annotationId);
    console.log('Full annotation:', savedEvent.commentAnnotation);

    // Safe to trigger webhooks, log analytics, or sync external systems here.
    triggerWebhook(savedEvent);
    logAnalyticsEvent('comment_saved', { annotationId: savedEvent.annotationId });
  }, [savedEvent]);

  return null;
}
```

**Correct (HTML / Other Frameworks — subscribe via commentElement):**

```typescript
const commentElement = Velt.getCommentElement();

const subscription = commentElement.on('commentSaved').subscribe((event) => {
  // Fires only after database write confirmation.
  console.log('Comment persisted, annotationId:', event.annotationId);
  console.log('Full annotation:', event.commentAnnotation);

  // Trigger webhook, log analytics, or sync external systems.
  triggerWebhook(event);
});

// Clean up subscription when no longer needed
subscription.unsubscribe();
```

**`CommentSavedEvent` Interface:**

```typescript
interface CommentSavedEvent {
  annotationId: string;                  // ID of the persisted comment annotation
  commentAnnotation: CommentAnnotation;  // Full annotation object as stored in the database
  metadata: VeltEventMetadata;           // Event metadata (timestamp, source, etc.)
}
```

**Key Behaviors:**

- `commentSaved` fires **after** write confirmation, not on optimistic update. It is safe to use as the trigger for backend side-effects.
- The event is emitted once per annotation save — both for new annotations and updates to existing ones.
- `savedEvent.commentAnnotation` contains the full persisted annotation object, including any server-assigned fields.
- In React, `useCommentEventCallback('commentSaved')` returns the latest event value; it updates whenever a new save occurs.
- In non-React frameworks, the `.subscribe()` callback receives each event in order. Always call `.unsubscribe()` to avoid memory leaks.

**Verification Checklist:**
- [ ] Side-effects (webhooks, logging, external sync) are triggered from `commentSaved`, not from optimistic callbacks like `onCommentAdd`
- [ ] React usage uses `useCommentEventCallback('commentSaved')` with a `useEffect` that depends on `savedEvent`
- [ ] Non-React usage calls `.unsubscribe()` to clean up the subscription when the component or listener is destroyed
- [ ] `annotationId` from the event is used to reference the saved annotation in downstream systems

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior/events - `commentSaved` event and payload reference
- https://docs.velt.dev/api-reference/sdk/api/react-hooks - `useCommentEventCallback` hook
- https://docs.velt.dev/api-reference/sdk/api/elements/comment-element - `commentElement.on()` subscription pattern
