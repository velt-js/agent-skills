---
title: Comment Moderation — Approve, Read-Only, and Suggestion Workflows
impact: LOW
impactDescription: Moderation workflows for comment review and approval
tags: enableModeratorMode, approveCommentAnnotation, useApproveCommentAnnotation, enableSuggestionMode, acceptSuggestion, rejectSuggestion, useAcceptSuggestion, useRejectSuggestion, enableReadOnly, enableResolveStatusAccessAdminOnly, isAdmin, moderation
---

## Comment Moderation — Approve, Read-Only, and Suggestion Workflows

Moderator mode hides new comments from everyone except admins and the author until an admin approves them. Suggestion annotations (`type: 'suggestion'`) are resolved with `acceptSuggestion()` / `rejectSuggestion()`. The older `acceptCommentAnnotation()` / `rejectCommentAnnotation()` pair is deprecated and no longer documented: it only wrote the workflow status and never flipped `annotation.type`, so an accepted suggestion kept rendering as a suggestion.

**Incorrect (deprecated accept/reject calls):**

```jsx
const commentElement = client.getCommentElement();
commentElement.acceptCommentAnnotation({ annotationId: 'ann-123' }); // deprecated, does not retire the suggestion card
commentElement.rejectCommentAnnotation({ annotationId: 'ann-123' }); // deprecated
```

**Correct (moderation, read-only, suggestion resolution):**

```jsx
const commentElement = client.getCommentElement();

// Moderator mode (default false). Mark admins with isAdmin: true on the User you authenticate.
commentElement.enableModeratorMode();

// Admin approves a pending comment so everyone with document access can see it
await commentElement.approveCommentAnnotation({ annotationId: 'ANNOTATION_ID' });

// Only admins and the comment author can resolve
commentElement.enableResolveStatusAccessAdminOnly();

// Read-only: removes composer, reactions, status, and other interactive features (default false)
commentElement.enableReadOnly();

// Suggestion mode: accept/reject controls on comments (default false)
commentElement.enableSuggestionMode();

// Resolve a type: 'suggestion' annotation from your own UI. Sets suggestion.status,
// flips annotation.type to 'comment', and emits suggestionAccepted / suggestionRejected.
await commentElement.acceptSuggestion({ annotationId: 'ANNOTATION_ID' });
await commentElement.rejectSuggestion({ annotationId: 'ANNOTATION_ID' });
```

```jsx
// React hooks
const { approveCommentAnnotation } = useApproveCommentAnnotation();
const { acceptSuggestion } = useAcceptSuggestion();
const { rejectSuggestion } = useRejectSuggestion();
```

```jsx
// Props
<VeltComments moderatorMode={true} resolveStatusAccessAdminOnly={true} readOnly={false} suggestionMode={true} />
```

```html
<velt-comments moderator-mode="true" resolve-status-access-admin-only="true" suggestion-mode="true"></velt-comments>
```

**Key details:**
- `approveCommentAnnotation` emits the `approveCommentAnnotation` event.
- For the full suggestion lifecycle (targets, `newValue`, `suggestionAccepted` handling), see the `velt-suggestions-best-practices` skill and the `suggestionAccepted` / `suggestionRejected` handling in `events-comment-lifecycle.md`.
- In Other Frameworks, call the same methods on `Velt.getCommentElement()`.

**Verification:**
- [ ] Moderator mode only enabled where approval is required, and admins carry `isAdmin: true`
- [ ] No new code calls `acceptCommentAnnotation()` / `rejectCommentAnnotation()`
- [ ] Suggestions are resolved with `acceptSuggestion()` / `rejectSuggestion()` (or the built-in buttons)
- [ ] Read-only mode used for viewers who must not write

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#moderation - Moderation
- https://docs.velt.dev/async-collaboration/suggestions/overview#resolve-suggestions-programmatically - acceptSuggestion / rejectSuggestion
- https://docs.velt.dev/api-reference/sdk/api/api-methods#acceptsuggestion - acceptSuggestion()
