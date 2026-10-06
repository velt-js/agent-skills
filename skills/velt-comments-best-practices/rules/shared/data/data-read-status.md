---
title: Mark Comments as Read or Unread
impact: HIGH
impactDescription: Control read/unread state for notification badges and filtering
tags: markAsRead, markAsUnread, viewedBy, unread, read, useCommentUtils
---

## Mark Comments as Read or Unread

Use `markAsRead()` and `markAsUnread()` to control the current user's read state on one annotation at a time, for example in a custom "mark as read" button. Each call takes a single `annotationId` and resolves to `Promise<void>`. There is no batch `annotationIds` form.

**Incorrect (array payload):**

```jsx
commentElement.markAsRead({ annotationIds: ['ann-123', 'ann-456'] });
```

**Correct:**

```jsx
// Hook
const { markAsRead, markAsUnread } = useCommentUtils();
await markAsRead({ annotationId: 'ANNOTATION_ID' });

// API Method
const commentElement = client.getCommentElement();
await commentElement.markAsRead({ annotationId: 'ANNOTATION_ID' });   // adds the user to viewedBy
await commentElement.markAsUnread({ annotationId: 'ANNOTATION_ID' }); // removes the user from viewedBy

// Mark several threads by looping
await Promise.all(ids.map((annotationId) => commentElement.markAsRead({ annotationId })));
```

```js
// Other Frameworks
const commentElement = Velt.getCommentElement();
await commentElement.markAsRead({ annotationId: 'ANNOTATION_ID' });
```

**Key details:**
- Only the current user's read state changes.
- Unread badges (`commentCountType="unread"`), sidebar unread filters, and unread count subscriptions update automatically.
- Choose the unread indicator style with `setUnreadIndicatorMode('minimal' | 'verbose')`.

**Verification:**
- [ ] Each call passes a single `annotationId`
- [ ] Calls are awaited (they return promises)
- [ ] Unread UI is driven by the unread count subscriptions, not local state

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#markasread - markAsRead
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#markasunread - markAsUnread
