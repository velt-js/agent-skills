---
title: Resolve suggestions from your own UI with acceptSuggestion and rejectSuggestion
impact: HIGH
impactDescription: acceptSuggestion and rejectSuggestion are the only calls that retire a suggestion card; the deprecated acceptCommentAnnotation pair leaves it rendering as a suggestion
tags: acceptSuggestion, rejectSuggestion, useAcceptSuggestion, useRejectSuggestion, acceptCommentAnnotation, rejectCommentAnnotation, deprecated, commentElement, LazyCommentElement, action chips
---

## Resolve suggestions from your own UI with acceptSuggestion and rejectSuggestion

Since v6.0.9-beta.1 the comment element exposes `acceptSuggestion({ annotationId })` and `rejectSuggestion({ annotationId, reason? })`, the same calls the built-in Accept and Reject buttons make. Both set `suggestion.status` **and** flip `annotation.type` to `'comment'`, which retires the suggestion card into a normal thread, and both emit the existing `suggestionAccepted` / `suggestionRejected` events. They resolve to the event payload, or `null`. React gets `useAcceptSuggestion()` / `useRejectSuggestion()`, and `LazyCommentElement` carries both methods.

**Incorrect (deprecated pair):**

```js
// BUG: deprecated in v6.0.9-beta.1. Writes only the workflow status and never flips
// annotation.type, so the card keeps rendering as a suggestion with an "Accepted" badge.
await commentElement.acceptCommentAnnotation({ annotationId });
```

**Correct (React / Next.js):**

```jsx
// Hook
import { useAcceptSuggestion, useRejectSuggestion } from '@veltdev/react';

const { acceptSuggestion } = useAcceptSuggestion();
const { rejectSuggestion } = useRejectSuggestion();

await acceptSuggestion({ annotationId });
await rejectSuggestion({ annotationId, reason: 'Not applicable' });

// API Method
const commentElement = client.getCommentElement();
await commentElement.acceptSuggestion({ annotationId });
await commentElement.rejectSuggestion({ annotationId, reason: 'Not applicable' });
```

**Correct (Other Frameworks):**

```js
const commentElement = Velt.getCommentElement();

await commentElement.acceptSuggestion({ annotationId });
await commentElement.rejectSuggestion({ annotationId, reason: 'Not applicable' });
```

The request field is `reason`; the emitted `SuggestionRejectEvent` exposes it as `rejectReason`. Your `suggestionAccepted` handler (see `lifecycle-accept-reject`) still applies `newValue`, whether the accept came from the dialog or from these methods. A typical caller is a custom action chip on the suggestion card (the `actions` array on a comment or annotation replaces the built-in Accept/Reject row and emits `commentActionClicked`).

**Verification Checklist:**
- [ ] Custom accept/reject UI calls `acceptSuggestion()` / `rejectSuggestion()`, never `acceptCommentAnnotation()` / `rejectCommentAnnotation()`
- [ ] The reject request passes `reason`, not `rejectReason`
- [ ] React code uses the hooks or `client.getCommentElement()`; other frameworks use `Velt.getCommentElement()`
- [ ] The existing `suggestionAccepted` handler remains the single place that applies `newValue`

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/suggestions/overview#resolve-suggestions-programmatically — "Resolve Suggestions Programmatically"
- https://docs.velt.dev/api-reference/sdk/api/api-methods#acceptsuggestion — `acceptSuggestion()` / `rejectSuggestion()`
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#useacceptsuggestion — `useAcceptSuggestion()` / `useRejectSuggestion()`
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#actions — custom action chips on suggestion cards
