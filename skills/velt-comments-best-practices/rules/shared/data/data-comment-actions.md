---
title: Render Custom Action Chips with Comment.actions and Handle commentActionClicked
impact: MEDIUM
impactDescription: Adds customer-owned buttons (Copy, Dig Deeper, Approve) to comment rows and suggestion cards without forking the dialog UI
tags: actions, CommentAction, CommentActionClickedEvent, commentActionClicked, useCommentEventCallback, updateComment, suggestion, chips, VeltCommentDialogActions
---

## Render Custom Action Chips with Comment.actions and Handle commentActionClicked

Set `actions` on a comment (one row) or on the annotation (default for every row without its own list) to render customer-defined chips. Velt never interprets a click: there is no annotation write, no `saveComment()`, and no record of who clicked. You must subscribe to `commentActionClicked` and do the work yourself. On a `type: 'suggestion'` card, chips replace the built-in Accept / Reject row.

**Incorrect (expecting Velt to act on the click):**

```jsx
// Chips render, but nothing happens on click: no listener for commentActionClicked
await commentElement.updateComment({
  annotationId: 'ANNOTATION_ID',
  comment: { commentId: 'COMMENT_ID', commentText: 'Answer', actions: [{ id: 'approve', label: 'Approve' }] },
});
```

**Correct (set actions, then handle the event):**

```jsx
const commentElement = client.getCommentElement();

await commentElement.updateComment({
  annotationId: 'ANNOTATION_ID',
  comment: {
    commentId: 'COMMENT_ID',
    commentText: 'This is the answer for your question.',
    actions: [
      { id: 'copy-response', label: 'Copy Response' },
      { id: 'dig-deeper', label: 'Dig Deeper', metadata: { kind: 'followup' } },
    ],
  },
});

// Hook
const eventData = useCommentEventCallback('commentActionClicked');
useEffect(() => {
  if (eventData) {
    handleAction(eventData.actionId, eventData.scope, eventData.commentId, eventData.action.metadata);
  }
}, [eventData]);

// API Method
const subscription = commentElement.on('commentActionClicked').subscribe((event) => {
  handleAction(event.actionId, event.scope, event.commentId, event.action.metadata);
});
subscription?.unsubscribe();
```

```js
// Other Frameworks
const commentElement = Velt.getCommentElement();
const subscription = commentElement.on('commentActionClicked').subscribe((event) => {
  console.log(event.actionId, event.scope, event.commentId);
});
subscription?.unsubscribe();
```

To resolve a suggestion from a chip, call `commentElement.acceptSuggestion({ annotationId })` or `rejectSuggestion({ annotationId })` in your handler.

**Behavior:**
- `CommentAnnotation.actions` is the per-row default regardless of who authored the row; a comment-level list overrides it for that row.
- An explicitly empty comment-level list (`actions: []`, or every entry `hidden`) renders no row and does not fall back to the built-in Accept / Reject controls.
- A progress row never inherits annotation-level actions; only actions set directly on the progress comment render there.
- Each entry is validated on its own. It renders when `id` is a non-empty string, `hidden` is not `true`, and it has a non-empty `label` or `icon`. `disabled` keeps the chip visible but emits nothing.
- Duplicate clicks are suppressed for 500 ms per `(annotationId, commentId, actionId)`.
- REST: `actions` is accepted on `commentData[]` and on the annotation (max 20); updates replace the stored array outright.

**Types:**

```typescript
interface CommentAction {
  id: string;          // stable, customer-owned identity
  label?: string;
  icon?: string;       // raw SVG string, or URL / data URI
  disabled?: boolean;
  hidden?: boolean;
  metadata?: any;      // echoed back on commentActionClicked
}
interface CommentActionClickedEvent {
  action: CommentAction;
  actionId: string;
  scope: 'comment' | 'annotation';
  annotationId: string;
  commentId?: number;
  commentAnnotation: CommentAnnotation;
  comment?: Comment;
  actionUser: User;    // who clicked, distinct from the row's author
  metadata: VeltEventMetadata;
}
```

Restyle the chip row with the Actions wireframes or the `VeltCommentDialogActions` primitives.

**Verification Checklist:**
- [ ] A `commentActionClicked` listener performs every side effect; nothing is expected from Velt
- [ ] Each action has a stable non-empty `id` and a `label` or `icon`
- [ ] Suggestion cards that need Accept / Reject either omit `actions` or call `acceptSuggestion()` / `rejectSuggestion()` from a chip
- [ ] Subscriptions are unsubscribed on unmount

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#actions - Actions
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#commentactionclicked - commentActionClicked
- https://docs.velt.dev/api-reference/sdk/models/data-models#commentaction - CommentAction
- https://docs.velt.dev/api-reference/sdk/models/data-models#commentactionclickedevent - CommentActionClickedEvent
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/primitives#veltcommentdialogactions - VeltCommentDialogActions primitives
