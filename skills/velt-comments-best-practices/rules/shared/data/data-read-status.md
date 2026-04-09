---
title: Mark Comments as Read or Unread
impact: HIGH
impactDescription: Control read/unread state for notification badges and filtering
tags: markAsRead, markAsUnread, unread, read
---

## Mark Comments as Read or Unread

Use `markAsRead()` and `markAsUnread()` to programmatically control read/unread state of comment annotations — useful for custom notification badges, read receipts, or "mark all as read" actions.

**API Methods:**

```tsx
const commentElement = client.getCommentElement();

// Mark specific annotations as read
commentElement.markAsRead({
  annotationIds: ['ann-123', 'ann-456'],
});

// Mark specific annotations as unread
commentElement.markAsUnread({
  annotationIds: ['ann-123'],
});
```

**Key details:**
- These methods affect the current user's read state only
- Unread badges on `VeltCommentBubble` (commentCountType="unread") update automatically
- Sidebar unread filters reflect the change in real-time
- Combine with `getUnreadCommentCountOnCurrentDocument()` to build custom unread indicators

**Verification:**
- [ ] Annotation IDs are valid strings
- [ ] Unread badges update after calling markAsRead/markAsUnread
- [ ] Used in combination with unread count subscriptions for UI updates

**Source Pointer:** https://docs.velt.dev/async-collaboration/comments/customize-behavior - Comment Status (Read/Unread)
