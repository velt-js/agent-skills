---
title: Individual Comment CRUD — Add, Update, Delete, Get Comments Within Threads
impact: HIGH
impactDescription: Required for programmatic comment management within annotation threads
tags: addComment, updateComment, deleteComment, getComment, getUnreadCommentCountOnCurrentDocument, getUnreadCommentCountByLocationId, getUnreadCommentCountByAnnotationId
---

## Individual Comment CRUD — Add, Update, Delete, Get Comments Within Threads

Use these methods to manage individual comments within an existing annotation thread — add replies, edit messages, delete comments, and track unread counts.

**API Methods (via getCommentElement()):**

```tsx
const commentElement = client.getCommentElement();

// Add comment to existing thread
await commentElement.addComment({
  annotationId: 'ann-123',
  comment: {
    commentText: 'This is a reply',
    commentHtml: '<p>This is a reply</p>',
  },
});

// Update comment content
await commentElement.updateComment({
  annotationId: 'ann-123',
  commentId: 42,
  comment: {
    commentText: 'Updated text',
    commentHtml: '<p>Updated text</p>',
  },
});

// Delete single comment from thread
await commentElement.deleteComment({
  annotationId: 'ann-123',
  commentId: 42,
});

// Get comment data
const comment = await commentElement.getComment({
  annotationId: 'ann-123',
  commentId: 42,
});
```

**Unread Count Methods:**

```tsx
// Unread count on current document
commentElement.getUnreadCommentCountOnCurrentDocument()
  .subscribe((count) => {
    console.log('Unread on doc:', count);
  });

// Unread count by location
commentElement.getUnreadCommentCountByLocationId(locationId)
  .subscribe((count) => {
    console.log('Unread at location:', count);
  });

// Unread count by annotation thread
commentElement.getUnreadCommentCountByAnnotationId(annotationId)
  .subscribe((count) => {
    console.log('Unread in thread:', count);
  });
```

**Key details:**
- `addComment()` adds a reply to an existing annotation thread (not a new thread)
- `commentId` is a number, not a string
- `commentText` is plain text; `commentHtml` is the rich text version
- Unread count methods return Observables — subscribe and clean up
- To create a NEW thread, use `addCommentAnnotation()` (see data-annotation-crud rule)

**Verification:**
- [ ] Using correct annotationId and commentId types
- [ ] Subscription cleaned up on component unmount
- [ ] commentHtml provided alongside commentText for rich text

**Source Pointer:** https://docs.velt.dev/async-collaboration/comments/customize-behavior - Messages
