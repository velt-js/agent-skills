---
title: Stream Multi-Step Work into a Comment with Comment.progress
impact: MEDIUM
impactDescription: Shows a live progress row while an agent or long task works, without posting placeholder replies that count toward the thread
tags: progress, CommentProgress, CommentProgressStep, commentProgressStaleAfter, setCommentProgressStaleAfter, updateComment, addComment, agent, streaming, VeltCommentDialogProgress
---

## Stream Multi-Step Work into a Comment with Comment.progress

`Comment.progress` turns a comment into a live progress row (animated dots plus a step label) rendered between the last message and the reply composer. Use it instead of posting and deleting "Thinking..." replies: a content-less progress comment does not count toward `annotation.comments`, reply counts, sidebar previews, or resolve state. It is independent of the `agent` block, so any multi-step operation can use it.

**Incorrect (placeholder replies that pollute the thread):**

```jsx
// Each placeholder is a real comment: it bumps reply counts and must be deleted later
await commentElement.addComment({ annotationId, comment: { commentText: 'Thinking...' } });
await commentElement.addComment({ annotationId, comment: { commentText: 'Still working...' } });
```

**Correct (create active, push steps on the same commentId, complete with content):**

```jsx
const commentElement = client.getCommentElement();
const commentId = Date.now();

// 1. Content-less comment with progress.state 'active'
await commentElement.addComment({
  annotationId: 'ANNOTATION_ID',
  comment: {
    commentId,
    progress: { state: 'active', steps: [{ label: 'Getting data', state: 'active' }] },
  },
});

// 2. Push step updates on the SAME commentId (updateComment replaces the comment wholesale)
await commentElement.updateComment({
  annotationId: 'ANNOTATION_ID',
  comment: {
    commentId,
    progress: { state: 'active', steps: [{ label: 'Generating response', state: 'active' }] },
  },
});

// 3. Finish: write the real content and move out of 'active'
await commentElement.updateComment({
  annotationId: 'ANNOTATION_ID',
  comment: {
    commentId,
    progress: { state: 'completed', steps: [{ label: 'Generating response', state: 'completed' }] },
    commentText: 'This is the answer for your question.',
    commentHtml: '<p>This is the answer for your question.</p>',
  },
});
```

The Other Frameworks code is identical with `Velt.getCommentElement()`.

**From your backend:** send `progress` on `commentData[]` in Add Comments / Add Comment Annotations, then update it with Update Comments (`updatedData.progress` replaces the stored object). Set `triggerNotification: true` at the request root of the final update to notify once when the answer lands. Keep progress writes to about one per second per comment. See `rest-comments-api.md`.

**Behavior:**
- The row renders only while `progress.state === 'active'`. `completed` renders the comment as a normal reply; `failed` and `cancelled` stop the indicator but keep any partial content visible.
- `steps` is replaced on every update; there is no server-side append. Keep at most one step `active`. The label shown is the last `active` step, else the last step, else a default "Processing…". Labels render verbatim and are never translated.
- Multiple concurrent runs each get their own row, ordered by server-stamped `createdAt` (`progress.startedAt` never affects ordering).
- A thread whose only comments are content-less progress comments does not render until real content is written.
- Completing a content-less progress comment does not mark it "(edited)".
- A row with no updates goes stale after `commentProgressStaleAfter` ms (default `600000`) and stops rendering. Raise it for long-running agents:

```jsx
<VeltComments commentProgressStaleAfter={1800000} />
// or
commentElement.setCommentProgressStaleAfter(1800000);
```

```html
<velt-comments comment-progress-stale-after="1800000"></velt-comments>
```

**Types:**

```typescript
interface CommentProgress {
  state: 'active' | 'completed' | 'failed' | 'cancelled';
  steps?: CommentProgressStep[];     // max 100 via REST
  visibleToUserIds?: string[];       // display-only, not a security boundary
  startedAt?: number;
}
interface CommentProgressStep {
  label: string;
  id?: string;
  state?: 'pending' | 'active' | 'completed' | 'failed';
  startedAt?: number;
  completedAt?: number;
  metadata?: any;
}
```

Restyle the row with the Progress wireframes (`VeltCommentDialogProgressWireframe` with `.Dots` / `.Label`) or the `VeltCommentDialogProgress` primitives.

**Verification Checklist:**
- [ ] Every update reuses the same `commentId` as the initial progress comment
- [ ] The final update writes content and sets `state` to `'completed'` (or `'failed'` / `'cancelled'`)
- [ ] Each update sends the full `steps` array you want displayed
- [ ] `commentProgressStaleAfter` raised for runs that can pause longer than 10 minutes
- [ ] `visibleToUserIds` is not relied on for access control

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#progress - Progress
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#commentprogressstaleafter - commentProgressStaleAfter
- https://docs.velt.dev/api-reference/sdk/models/data-models#commentprogress - CommentProgress
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/update-comments - Update Comments (progress, triggerNotification)
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/wireframes#progress-body - Progress wireframes
