---
title: Comment Navigation and Deep Linking
impact: MEDIUM
impactDescription: Navigate to comments programmatically and generate shareable links
tags: scrollToCommentByAnnotationId, selectCommentByAnnotationId, onCommentSelectionChange, getLink, copyLink, enableScrollToComment, navigation, deep-linking
---

## Comment Navigation and Deep Linking

Navigate to specific comments, track selection changes, and generate shareable deep links.

**API Methods:**

```tsx
const commentElement = client.getCommentElement();

// Scroll to a comment pin on the page
commentElement.scrollToCommentByAnnotationId('ann-123');

// Select/highlight a comment (opens dialog)
commentElement.selectCommentByAnnotationId('ann-123');

// Listen to comment selection changes
commentElement.onCommentSelectionChange().subscribe((event) => {
  console.log('Selected annotation:', event?.annotationId);
});

// Enable auto-scroll to comment on page load (from URL hash)
commentElement.enableScrollToComment();

// Generate a shareable link to a comment
const link = await commentElement.getLink({ annotationId: 'ann-123' });
console.log('Link:', link); // https://yourapp.com/page?commentId=ann-123

// Copy comment link to clipboard
commentElement.copyLink({ annotationId: 'ann-123' });
```

**Key details:**
- `scrollToCommentByAnnotationId()` smoothly scrolls the page to the comment pin
- `selectCommentByAnnotationId()` opens the comment dialog for that thread
- `enableScrollToComment()` checks the URL for a comment ID on page load and auto-scrolls
- `getLink()` returns a URL that deep links to the comment
- `onCommentSelectionChange()` fires when user clicks a different comment

**Verification:**
- [ ] Annotation ID exists before calling scroll/select
- [ ] onCommentSelectionChange subscription cleaned up on unmount
- [ ] Deep link URL includes correct comment identifier

**Source Pointer:** https://docs.velt.dev/async-collaboration/comments/customize-behavior - Navigation, Deep Linking
