---
title: Suggestion Status Lifecycle and Events Reference
impact: HIGH
tags: SuggestionStatus, pending, accepted, rejected, stale, apply_failed, events
---

## Suggestion Status Lifecycle

Suggestions move forward through these states (transitions are forward-only):

| Status | Meaning |
|--------|---------|
| `pending` | Created and awaiting review |
| `accepted` | Reviewer accepted; your `suggestionAccepted` handler applies `newValue` |
| `rejected` | Reviewer rejected (optional `rejectReason`). Nothing is applied |
| `stale` | Target DOM node couldn't be resolved at accept time |
| `apply_failed` | Your accept handler threw while applying. Status only — no dedicated event in v1 |

```typescript
type SuggestionStatus = 'pending' | 'accepted' | 'rejected' | 'stale' | 'apply_failed';
```

## Events Reference

Events come from **two different elements**:

### Comment Element Events (accept/reject outcomes)

Subscribe with `useCommentEventCallback` (React) or `commentElement.on()`:

| Event | Fires When | Payload |
|-------|-----------|---------|
| `suggestionAccepted` | Reviewer accepts | `SuggestionAcceptEvent` (`annotationId`, `commentAnnotation`, `metadata`, `actionUser`) |
| `suggestionRejected` | Reviewer rejects | `SuggestionRejectEvent` (adds `rejectReason`) |

### SuggestionElement Events (creation and lifecycle)

Subscribe with `useSuggestionEventCallback` (React) or `suggestionElement.on()`:

| Event | Fires When | Payload |
|-------|-----------|---------|
| `suggestionCreated` | Pending suggestion created | `SuggestionCreatedEvent` |
| `suggestionStale` | Suggestion goes stale at accept time | `SuggestionStaleEvent` |
| `targetEditStart` | User focuses a target | `TargetEditStartEvent` |
| `targetEditCommit` | Edit committed (carries `commitSuggestion` builder) | `TargetEditCommitEvent` |

### Key Point

Accept/reject events are on the **comment element**, everything else is on the **SuggestionElement**. This is because the accept/reject UI lives on the comment dialog.
