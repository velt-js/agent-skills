---
title: Comment Moderation — Approve, Accept, Reject Workflows
impact: LOW
impactDescription: Moderation workflows for comment review and approval
tags: enableModeratorMode, approveCommentAnnotation, acceptCommentAnnotation, rejectCommentAnnotation, enableSuggestionMode, enableReadOnly, enableResolveStatusAccessAdminOnly, moderation
---

## Comment Moderation — Approve, Accept, Reject Workflows

Enable moderation workflows for comment review, approval, and rejection.

**API Methods:**

```tsx
const commentElement = client.getCommentElement();

// Enable moderator mode (moderator can approve/reject all comments)
commentElement.enableModeratorMode();

// Restrict resolve/status changes to admin users only
commentElement.enableResolveStatusAccessAdminOnly();

// Approval workflow
commentElement.approveCommentAnnotation({ annotationId: 'ann-123' });
commentElement.acceptCommentAnnotation({ annotationId: 'ann-123' });
commentElement.rejectCommentAnnotation({ annotationId: 'ann-123' });

// Suggestion mode (comments are suggestions that can be accepted/rejected)
commentElement.enableSuggestionMode();

// Read-only mode (view comments but cannot add/edit)
commentElement.enableReadOnly();

// "Seen by" indicator (shows who has viewed the comment)
commentElement.enableSeenByUsers();
```

**Key details:**
- `enableModeratorMode()` gives the current user moderator privileges
- `approveCommentAnnotation()` / `rejectCommentAnnotation()` change the annotation status
- These trigger `APPROVE`, `ACCEPT`, `REJECT` activity types
- `enableReadOnly()` prevents any comment creation or editing
- `enableSuggestionMode()` changes the comment workflow to suggestion-based

**Verification:**
- [ ] Moderator mode only enabled for authorized users
- [ ] Approval/rejection updates reflected in status
- [ ] Read-only mode prevents all write operations
- [ ] Activity logs capture moderation actions

**Source Pointer:** https://docs.velt.dev/async-collaboration/comments/customize-behavior - Moderation
