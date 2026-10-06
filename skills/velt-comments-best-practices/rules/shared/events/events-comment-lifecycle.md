---
title: Comment Lifecycle Events — Pin Clicks, Add Events, Button Clicks
impact: MEDIUM
impactDescription: Subscribe to comment lifecycle events for custom workflows
tags: commentPinClicked, addCommentAnnotation, addContext, isAssigneeChanged, veltButtonClick, useVeltEventCallback, on, autocompleteSearch, suggestionAccepted, suggestionRejected, sidebarOpen, sidebarClose, commentClick, fullscreenClick, FullscreenClickEvent, events
---

## Comment Lifecycle Events — Pin Clicks, Add Events, Button Clicks, Agent Suggestion Accept/Reject

Subscribe to comment lifecycle events for custom navigation, context injection, and workflow triggers.

> **For agent suggestion accept/reject:** Use `useCommentEventCallback('suggestionAccepted')` and `useCommentEventCallback('suggestionRejected')` — these are the correct events, not `commentSaved` with status checks.

**Agent suggestion accept/reject events (for AI agent findings):**

Agent findings (annotations with `sourceType: "agent"` and `type: "suggestion"`) render with Accept and Reject buttons. Use `suggestionAccepted` and `suggestionRejected` to handle the reviewer's decision. The SDK persists the status — applying the actual change is your code's responsibility.

```tsx
import { useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

export function AgentSuggestionListener() {
  const accepted = useCommentEventCallback('suggestionAccepted');
  const rejected = useCommentEventCallback('suggestionRejected');

  useEffect(() => {
    if (!accepted) return;
    console.log('Suggestion accepted', accepted.commentAnnotation);
  }, [accepted]);

  useEffect(() => {
    if (!rejected) return;
    console.log('Suggestion rejected', rejected.rejectReason);
  }, [rejected]);

  return null;
}
```

**Events via on() method:**

```tsx
const commentElement = client.getCommentElement();

// Pin clicked: payload is { annotationId, commentAnnotation, metadata? }
const pinSub = commentElement.on('commentPinClicked').subscribe((event) => {
  console.log('Pin clicked:', event.annotationId, event.commentAnnotation.location);
});

// Autocomplete search (custom contact search; see config-mentions-contacts.md)
const searchSub = commentElement.on('autocompleteSearch').subscribe((event) => {
  console.log('Searching for:', event.searchText, event.type);
});

pinSub?.unsubscribe();
searchSub?.unsubscribe();
```

**Wireframe button clicks (`veltButtonClick`) are a client-level event, not a comment event:**

```tsx
// Hook
const veltButtonClick = useVeltEventCallback('veltButtonClick');

// API Method (client / Velt, not commentElement)
const subscription = client.on('veltButtonClick').subscribe((event) => {
  console.log(event.buttonContext?.groupId, event.buttonContext?.selections);
});
subscription?.unsubscribe();
```

**Incorrect (`onCommentAdd` is not an event name; `veltButtonClick` is not a comment event):**

```tsx
const onCommentAdd = useCommentEventCallback('onCommentAdd');   // never fires
commentElement.on('veltButtonClick').subscribe(handler);        // wrong element
```

**Correct (add context when a thread is created with `addCommentAnnotation` + `addContext()`):**

`addContext()` is available on the `addCommentAnnotation` and `addCommentAnnotationDraft` event payloads. `onCommentAdd` is not an event name for `on()` or `useCommentEventCallback`; it only exists as the legacy `<VeltComments onCommentAdd>` prop / `useCommentAddHandler()` hook.

```tsx
// Hook
const addEvent = useCommentEventCallback('addCommentAnnotation');
useEffect(() => {
  if (addEvent) {
    addEvent.addContext({ pageSection: 'header', projectId: 'proj-123' });
  }
}, [addEvent]);

// API Method
const subscription = commentElement.on('addCommentAnnotation').subscribe((event) => {
  event.addContext({ pageSection: 'header' });
});
subscription?.unsubscribe();
```

**Detect assignment changes (`isAssigneeChanged`, v6.0.15+):**

The `addComment`, `addCommentAnnotation`, and `updateComment` payloads carry `isAssigneeChanged`: `true` when the event assigned a new user or removed the assignee. Read the current assignee from `commentAnnotation.assignedTo`. Through `commentElement.updateComment()` it is always `false`; listen to `assignUser` for assignments made separately.

```tsx
// Hook
const addCommentEvent = useCommentEventCallback('addComment');
useEffect(() => {
  if (addCommentEvent?.isAssigneeChanged) {
    notifyAssignee(addCommentEvent.commentAnnotation.assignedTo);
  }
}, [addCommentEvent]);

// API Method
const subscription = commentElement.on('addComment').subscribe((event) => {
  if (event.isAssigneeChanged) {
    console.log(event.commentAnnotation.assignedTo);
  }
});
subscription?.unsubscribe();
```

**Sidebar events (v6):** `sidebarOpen`, `sidebarClose`, `commentClick` (payload: `annotation`, `documentId`, `location`, `targetElementId`, `context`), `commentNavigationButtonClick`, and `fullscreenClick` are on the comment element event bus. `sidebarClose` fires exactly once per close, whether from the close button, an outside click, or `closeCommentSidebar()` / `toggleCommentSidebar()`. Action chip clicks emit `commentActionClicked` (see `data-comment-actions.md`).

**React hooks for events:**

```tsx
import { useCommentEventCallback, useVeltEventCallback } from '@veltdev/react';

// Comment-specific events
const pinClicked = useCommentEventCallback('commentPinClicked');
const commentSaved = useCommentEventCallback('commentSaved');
const visibilityClicked = useCommentEventCallback('visibilityOptionClicked');
const sidebarOpen = useCommentEventCallback('sidebarOpen');

// Client-level UI events
const veltEvent = useVeltEventCallback('veltButtonClick');
```

**addCommentDraft event (abandoned reply/edit drafts):**

The `addCommentDraft` event fires when a user abandons a reply or edit composer without saving — for example, by clicking outside the dialog, closing the sidebar, or navigating away. It fires only on existing threads that already have at least one committed comment; brand-new pin drafts do not trigger it. The payload includes the unsaved text, HTML, attachments, recordings, and the parent annotation — use it to recover or log lost work.

Do not rely on this event for brand-new pin placements. Those do not trigger `addCommentDraft`.

**Correct (React — subscribe to abandoned draft):**

```jsx
import { useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function DraftHandler() {
  const draftEvent = useCommentEventCallback('addCommentDraft');

  useEffect(() => {
    if (!draftEvent) return;
    // draftEvent.comment.commentText — unsaved text
    // draftEvent.comment.commentHtml — unsaved HTML
    // draftEvent.annotationId — parent thread ID
    // draftEvent.commentAnnotation — full parent thread object
    console.log('User abandoned reply:', draftEvent.comment.commentText);
    console.log('Annotation:', draftEvent.annotationId);
  }, [draftEvent]);

  return null;
}
```

**Correct (Other frameworks — subscribe to abandoned draft):**

```typescript
const commentElement = client.getCommentElement();
const subscription = commentElement.on('addCommentDraft').subscribe((event) => {
  // event: AddCommentDraftEvent
  // event.annotationId, event.commentAnnotation, event.comment, event.metadata
  console.log('User abandoned reply:', event.comment.commentText);
  console.log('Annotation:', event.annotationId);
});

// Clean up on teardown
subscription.unsubscribe();
```

**AddCommentDraftEvent payload:**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `annotationId` | `string` | Yes | ID of the annotation to which the abandoned draft belongs |
| `commentAnnotation` | `CommentAnnotation` | Yes | The full parent thread object |
| `comment` | `Comment` | Yes | Snapshot of unsaved composer content (reply mode: pending text/HTML/attachments/recordings; edit mode: original fields merged with unsaved edits, `commentId` preserved) |
| `metadata` | `VeltEventMetadata` | Yes | Event metadata |

**Comment Sidebar V2 fullscreen toggle (`fullscreenClick` event):**

The `fullscreenClick` event fires when a user clicks the fullscreen toggle in the Comment Sidebar V2 header (`fullScreen={true}` prop must be enabled to render the button). The payload is a `FullscreenClickEvent` whose `fullScreen` field is the **post-toggle** state — `true` means the sidebar just entered fullscreen. Use this event as the standard event-API pathway; the component-level `onFullscreenClick` output on `VeltCommentSidebarV2FullscreenButton` remains available for callers wiring the primitive directly. Both pathways coexist — pick one; do not wire both for the same handler.

**Correct (React — subscribe to fullscreen toggle):**

```jsx
import { useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function FullscreenHandler() {
  const fullscreenEvent = useCommentEventCallback('fullscreenClick');

  useEffect(() => {
    if (!fullscreenEvent) return;
    // fullscreenEvent.fullScreen — post-toggle state (true = now fullscreen)
    console.log('Sidebar fullscreen:', fullscreenEvent.fullScreen);
  }, [fullscreenEvent]);

  return null;
}
```

**Correct (Other frameworks — subscribe to fullscreen toggle):**

```typescript
const commentElement = client.getCommentElement();
const subscription = commentElement.on('fullscreenClick').subscribe((event) => {
  // event: FullscreenClickEvent
  // event.fullScreen — post-toggle state; event.metadata — VeltEventMetadata
  console.log('Sidebar fullscreen:', event.fullScreen);
});

// Clean up on teardown
subscription.unsubscribe();
```

**Key details:**
- `addContext()` lives on the `addCommentAnnotation` / `addCommentAnnotationDraft` payloads; use it to inject metadata before the annotation is saved
- `commentPinClicked` fires when a pin on the page is clicked
- `veltButtonClick` fires for custom buttons added via wireframes and is subscribed on the client (`client.on` / `Velt.on` / `useVeltEventCallback`)
- `isAssigneeChanged` on `addComment` / `addCommentAnnotation` / `updateComment` tells you an assignment changed
- `addCommentDraft` fires only when the thread already has at least one committed comment — enum value `ADD_COMMENT_DRAFT`
- `suggestionAccepted` / `suggestionRejected` fire when a reviewer clicks Accept or Reject on an agent suggestion — the payload includes `commentAnnotation` (the full finding); rejected also includes `rejectReason`
- `fullscreenClick` fires when the Comment Sidebar V2 fullscreen toggle is clicked; `event.fullScreen` is the state **after** the toggle. Alternative pathway to the primitive-level `onFullscreenClick` output on `VeltCommentSidebarV2FullscreenButton` — both surfaces coexist, choose one per handler
- All subscriptions must be cleaned up on unmount
- `useCommentEventCallback` returns the event object directly (no subscription needed)

**Verification:**
- [ ] Event subscriptions cleaned up on component unmount
- [ ] `addContext()` called synchronously in the `addCommentAnnotation` handler
- [ ] `veltButtonClick` subscribed on the client, not on the comment element
- [ ] Event names match exactly (case-sensitive)
- [ ] addCommentDraft handler checks that the thread has existing comments before acting (brand-new pins do not fire this event)
- [ ] `fullscreenClick` handler treats `event.fullScreen` as the post-toggle state (not the previous state); handler is not double-wired to both the event API and the component-level `onFullscreenClick` output

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#event-subscription - Comment event table
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#addcontext - addContext
- https://docs.velt.dev/api-reference/sdk/models/data-models#addcommentevent - AddCommentEvent (`isAssigneeChanged`)
- https://docs.velt.dev/api-reference/sdk/models/data-models#addcommentdraftevent - AddCommentDraftEvent
- https://docs.velt.dev/async-collaboration/comments-sidebar/v2/customize-behavior#fullscreenclick - fullscreenClick
- https://docs.velt.dev/async-collaboration/comments-sidebar/v1/customize-behavior#custom-filtering-sorting-and-grouping - veltButtonClick
