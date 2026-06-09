---
title: Comment Lifecycle Events — Pin Clicks, Add Events, Button Clicks
impact: MEDIUM
impactDescription: Subscribe to comment lifecycle events for custom workflows
tags: commentPinClicked, onCommentAdd, veltButtonClick, useVeltEventCallback, on, autocompleteSearch, suggestionAccepted, suggestionRejected, events
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

**suggestionAccepted / suggestionRejected events (agent finding accept/reject):**

Agent comments (created via the REST API with an `agent` block and `type: "suggestion"`) render with **Accept** and **Reject** buttons on the comment dialog. The reviewer's choice is emitted on the comment element as `suggestionAccepted` or `suggestionRejected`. Use these to apply the finding to your own data or trigger follow-up logic. The reject payload includes an optional `rejectReason`; both payloads carry the full `commentAnnotation` for the agent finding.

Pair these with `addCommentDraft` only if you also need to capture abandoned reviewer replies — accept/reject is a distinct outcome from a draft and fires through this channel, not through the draft channel.

**Correct (React — subscribe to accept/reject):**

```jsx
import { useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function AgentSuggestionHandler() {
  const accepted = useCommentEventCallback('suggestionAccepted');
  const rejected = useCommentEventCallback('suggestionRejected');

  useEffect(() => {
    if (!accepted) return;
    // accepted.commentAnnotation — the agent finding being accepted
    applyAgentFix(accepted.commentAnnotation);
  }, [accepted]);

  useEffect(() => {
    if (!rejected) return;
    // rejected.commentAnnotation — the agent finding being rejected
    // rejected.rejectReason — optional reviewer-supplied reason
    logRejection(rejected.commentAnnotation, rejected.rejectReason);
  }, [rejected]);

  return null;
}
```

**Correct (Other frameworks — subscribe to accept/reject):**

```typescript
const commentElement = client.getCommentElement();

const acceptedSub = commentElement.on('suggestionAccepted').subscribe(({ commentAnnotation }) => {
  // commentAnnotation contains the agent finding
});

const rejectedSub = commentElement.on('suggestionRejected').subscribe(({ commentAnnotation, rejectReason }) => {
  // rejectReason is optional
});

// Clean up on teardown
acceptedSub.unsubscribe();
rejectedSub.unsubscribe();
```

**Key details:**
- `onCommentAdd` fires BEFORE the comment is persisted — use `addContext()` to inject metadata
- `commentPinClicked` fires when a pin on the page is clicked
- `veltButtonClick` fires for custom buttons added via wireframes
- `addCommentDraft` fires only when the thread already has at least one committed comment — enum value `ADD_COMMENT_DRAFT`
- `suggestionAccepted` / `suggestionRejected` fire only for annotations created with `type: "suggestion"` and an `agent` block — see [[rest-comment-annotations-api]] for the request shape
- `suggestionRejected.rejectReason` is optional — handlers must tolerate it being absent
- All subscriptions must be cleaned up on unmount
- `useCommentEventCallback` returns the event object directly (no subscription needed)

**Verification:**
- [ ] Event subscriptions cleaned up on component unmount
- [ ] addContext() called synchronously in onCommentAdd handler
- [ ] Event names match exactly (case-sensitive)
- [ ] addCommentDraft handler checks that the thread has existing comments before acting (brand-new pins do not fire this event)
- [ ] `suggestionRejected` handler treats `rejectReason` as optional
- [ ] Accept/reject handlers act on `commentAnnotation`, not on the comment element instance

**Source Pointer:** https://docs.velt.dev/async-collaboration/comments/customize-behavior - Events
**Source Pointer:** https://docs.velt.dev/async-collaboration/comments/customize-behavior - "Agent Comments"
**Source Pointer:** https://docs.velt.dev/api-reference/sdk/models/data-models#addcommentdraftevent
**Source Pointer:** https://docs.velt.dev/api-reference/sdk/models/data-models#suggestionacceptevent
**Source Pointer:** https://docs.velt.dev/api-reference/sdk/models/data-models#suggestionrejectevent
