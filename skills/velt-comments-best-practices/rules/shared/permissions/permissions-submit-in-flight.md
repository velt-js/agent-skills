---
title: Use CommentDialogActionService.isSubmitInFlight() to Guard Against Duplicate Submits
impact: LOW-MEDIUM
impactDescription: Without in-flight tracking, custom submit actions in sidebar custom-actions hosts can trigger duplicate comment saves or spurious draft events
tags: isSubmitInFlight, CommentDialogActionService, duplicate-submit, custom-actions, sidebar, draft
---

## Use CommentDialogActionService.isSubmitInFlight() to Guard Against Duplicate Submits

When building custom-actions sidebar hosts that intercept the comment submit flow, `CommentDialogActionService.isSubmitInFlight()` prevents duplicate submits and spurious auto-draft saves that fire before the composer reset signal propagates.

**When to use:** Only relevant for advanced custom-actions hosts (apps using `customActions={true}` on `VeltCommentsSidebar` with `setCommentSidebarData()`). Standard integrations do not need this.

**API:**

```jsx
import { CommentDialogActionService } from '@veltdev/react';

// Check if a submit is currently in flight for a specific dialog instance
const inFlight = CommentDialogActionService.isSubmitInFlight(dialogInstanceId);

// If omitted, returns false — the in-flight flag is only tracked per dialogInstanceId
const inFlightAny = CommentDialogActionService.isSubmitInFlight();
```

**Correct (guard custom submit handler):**

```jsx
function handleCustomSubmit(dialogInstanceId) {
  if (CommentDialogActionService.isSubmitInFlight(dialogInstanceId)) {
    return; // already submitting — skip
  }
  // proceed with submit
  commentElement.submitComment({ targetComposerElementId: dialogInstanceId });
}
```

**Correct (skip auto-draft-save during active submit):**

```jsx
function handleAutoSave(dialogInstanceId) {
  if (CommentDialogActionService.isSubmitInFlight(dialogInstanceId)) {
    return; // suppress draft save during submit
  }
  // save draft
}
```
