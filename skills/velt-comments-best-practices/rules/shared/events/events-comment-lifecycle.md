---
title: Comment Lifecycle Events — Pin Clicks, Add Events, Button Clicks
impact: MEDIUM
impactDescription: Subscribe to comment lifecycle events for custom workflows
tags: commentPinClicked, onCommentAdd, veltButtonClick, useVeltEventCallback, on, autocompleteSearch, events
---

## Comment Lifecycle Events — Pin Clicks, Add Events, Button Clicks

Subscribe to comment lifecycle events for custom navigation, context injection, and workflow triggers.

**Events via on() method:**

```tsx
const commentElement = client.getCommentElement();

// Pin clicked — navigate to comment or show custom UI
commentElement.on('commentPinClicked').subscribe((event) => {
  // event: { annotationId, location, targetElement, ... }
  console.log('Pin clicked:', event.annotationId);
  router.push(`/doc/${event.documentId}#${event.annotationId}`);
});

// Custom button clicked (from wireframe custom buttons)
commentElement.on('veltButtonClick').subscribe((event) => {
  // event: { buttonId, annotationId, ... }
  console.log('Custom button:', event.buttonId);
});

// Autocomplete search (for custom contact search)
commentElement.on('autocompleteSearch').subscribe((query) => {
  console.log('Searching for:', query);
});
```

**onCommentAdd event with addContext():**

```tsx
// React hook
import { useCommentEventCallback } from '@veltdev/react';

function CommentHandler() {
  const onCommentAdd = useCommentEventCallback('onCommentAdd');

  useEffect(() => {
    if (!onCommentAdd) return;
    // Inject custom context BEFORE the comment is saved
    onCommentAdd.addContext({
      pageSection: 'header',
      projectId: 'proj-123',
      timestamp: Date.now(),
    });
  }, [onCommentAdd]);

  return null;
}

// Or via API
commentElement.on('onCommentAdd').subscribe((event) => {
  event.addContext({ key: 'value' });
});
```

**React hooks for events:**

```tsx
import { useCommentEventCallback, useVeltEventCallback } from '@veltdev/react';

// Comment-specific events
const pinClicked = useCommentEventCallback('commentPinClicked');
const commentSaved = useCommentEventCallback('commentSaved');
const visibilityClicked = useCommentEventCallback('visibilityOptionClicked');

// Generic Velt UI events
const veltEvent = useVeltEventCallback('veltButtonClick');
```

**Key details:**
- `onCommentAdd` fires BEFORE the comment is persisted — use `addContext()` to inject metadata
- `commentPinClicked` fires when a pin on the page is clicked
- `veltButtonClick` fires for custom buttons added via wireframes
- All subscriptions must be cleaned up on unmount
- `useCommentEventCallback` returns the event object directly (no subscription needed)

**Verification:**
- [ ] Event subscriptions cleaned up on component unmount
- [ ] addContext() called synchronously in onCommentAdd handler
- [ ] Event names match exactly (case-sensitive)

**Source Pointer:** https://docs.velt.dev/async-collaboration/comments/customize-behavior - Events
