---
title: Individual Comment CRUD — Add, Update, Delete, Get Comments Within Threads
impact: HIGH
impactDescription: Required for programmatic comment management within annotation threads
tags: addComment, updateComment, deleteComment, getComment, useAddComment, useUpdateComment, useDeleteComment, useGetComment, getUnreadCommentCountOnCurrentDocument, getUnreadCommentCountByLocationId, getUnreadCommentCountByAnnotationId, isAssigneeChanged
---

## Individual Comment CRUD — Add, Update, Delete, Get Comments Within Threads

Manage individual comments inside an existing annotation thread: add replies, edit messages, delete comments, and track unread counts. For `updateComment()`, the `commentId` goes **inside** the `comment` object, and `updateComment()` replaces the comment wholesale.

**Incorrect (commentId outside the comment object):**

```jsx
await commentElement.updateComment({
  annotationId: 'ann-123',
  commentId: 42,                       // must be comment.commentId
  comment: { commentText: 'Updated text' },
});
```

**Correct:**

```jsx
const commentElement = client.getCommentElement();

// Add a reply to an existing thread (optionally with visibility set at creation)
await commentElement.addComment({
  annotationId: 'ANNOTATION_ID',
  comment: { commentText: 'This is a reply', commentHtml: '<p>This is a reply</p>' },
});

// Update: commentId lives inside comment
await commentElement.updateComment({
  annotationId: 'ANNOTATION_ID',
  comment: { commentId: 42, commentText: 'Updated text', commentHtml: '<p>Updated text</p>' },
});

await commentElement.deleteComment({ annotationId: 'ANNOTATION_ID', commentId: 42 });

// Returns Comment[] for the annotation
const comments = await commentElement.getComment({ annotationId: 'ANNOTATION_ID' });
```

```jsx
// Hooks
const { addComment } = useAddComment();
const { updateComment } = useUpdateComment();
const { deleteComment } = useDeleteComment();
const { getComment } = useGetComment();
```

**Unread counts:**

```jsx
// Hooks
const docCount = useUnreadCommentCountOnCurrentDocument();
const locationCount = useUnreadCommentCountByLocationId(locationId);
const threadCount = useUnreadCommentCountByAnnotationId(annotationId);

// API Methods (Observables)
const subscription = commentElement
  .getUnreadCommentCountByAnnotationId(annotationId)
  .subscribe((countObj) => console.log(countObj));
subscription?.unsubscribe();
```

**Key details:**
- `addComment()` adds a reply to an existing thread. To create a new thread, use `addCommentAnnotation()` (see `data-annotation-crud.md`).
- `commentId` is a number.
- `updateComment()` replaces the comment. It marks a comment "(edited)" only when the replaced comment already had content, so completing a content-less progress comment is not flagged as edited.
- The `addComment` and `updateComment` events carry `isAssigneeChanged`; through `commentElement.updateComment()` it is always `false`.
- Live progress rows and action chips are fields on the comment (`progress`, `actions`); see `data-comment-progress.md` and `data-comment-actions.md`.
- In Other Frameworks, call the same methods on `Velt.getCommentElement()`.

**Verification:**
- [ ] `updateComment()` passes `comment.commentId`
- [ ] `commentHtml` provided alongside `commentText` for rich text
- [ ] Unread count subscriptions cleaned up on unmount

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#messages - Messages
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#updatecomment - updateComment
- https://docs.velt.dev/api-reference/sdk/models/data-models#updatecommentrequest - UpdateCommentRequest
