---
title: Comment Navigation and Deep Linking
impact: MEDIUM
impactDescription: Navigate to comments programmatically and generate shareable links
tags: scrollToCommentByAnnotationId, selectCommentByAnnotationId, onCommentSelectionChange, useCommentSelectionChangeHandler, getLink, copyLink, useGetLink, useCopyLink, enableScrollToComment, navigation, deep-linking
---

## Comment Navigation and Deep Linking

Navigate to specific comments, track selection changes, and generate shareable deep links. `getLink()` and `copyLink()` resolve to response/event objects, not a bare URL string.

**Incorrect (treating getLink as a string):**

```jsx
const link = await commentElement.getLink({ annotationId: 'ann-123' });
navigator.clipboard.writeText(link); // link is a GetLinkResponse object
```

**Correct:**

```jsx
const commentElement = client.getCommentElement();

// Scroll to the comment's element (works when the element is on the DOM)
commentElement.scrollToCommentByAnnotationId('ANNOTATION_ID');

// Open a thread, e.g. after landing from a notification email
commentElement.selectCommentByAnnotationId('ANNOTATION_ID');
// Close the currently selected thread (no argument or an unknown id)
commentElement.selectCommentByAnnotationId();

// Deep links
const getLinkResponse = await commentElement.getLink({ annotationId: 'ANNOTATION_ID' });
const copyLinkEvent = await commentElement.copyLink({ annotationId: 'ANNOTATION_ID' });

// Scroll to a comment when its id is in the URL (default true)
commentElement.enableScrollToComment();
```

**Selection changes:**

```jsx
// Hook
const commentSelectionChange = useCommentSelectionChangeHandler();
useEffect(() => {
  console.log(commentSelectionChange?.annotation?.id);
}, [commentSelectionChange]);

// API Method
const subscription = commentElement.onCommentSelectionChange().subscribe((data) => {
  console.log('Selection changed', data);
});
subscription?.unsubscribe();
```

React hooks for links: `const { getLink } = useGetLink();` and `const { copyLink } = useCopyLink();`. Disable URL scroll with `<VeltComments scrollToComment={false} />`. In Other Frameworks, call the same methods on `Velt.getCommentElement()`.

**Verification:**
- [ ] `selectCommentByAnnotationId()` called after the page finished rendering the target
- [ ] `getLink()` result read as a `GetLinkResponse`, not a string
- [ ] `onCommentSelectionChange()` subscription cleaned up on unmount

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#navigation - Navigation
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#deep-link - Deep Link
- https://docs.velt.dev/api-reference/sdk/models/data-models#getlinkresponse - GetLinkResponse
