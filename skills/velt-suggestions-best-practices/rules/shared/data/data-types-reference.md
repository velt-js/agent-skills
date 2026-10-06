---
title: Type against SuggestionData, the Suggestion union, and the hooks table
impact: MEDIUM
impactDescription: Narrowing on status and using the shipped hook names avoids runtime undefined fields and invented APIs
tags: SuggestionData, Suggestion, PendingSuggestion, ApprovedSuggestion, RejectedSuggestion, StaleSuggestion, CommentAnnotationSuggestion, CommitSuggestionConfig, types, hooks
---

## Type against SuggestionData, the Suggestion union, and the hooks table

Suggestions are `CommentAnnotation` objects with `type === 'suggestion'` and a populated `suggestion` field (`SuggestionData`). `Suggestion<T>` is a discriminated union narrowed by `status`.

**Incorrect (reads resolution fields without narrowing):**

```typescript
function resolvedBy(s: Suggestion) {
  return s.resolvedBy.name; // BUG: PendingSuggestion and StaleSuggestion have no resolvedBy
}
```

**Correct (narrow on status first):**

```typescript
function resolvedBy(s: Suggestion): string | undefined {
  if (s.status === 'accepted' || s.status === 'apply_failed' || s.status === 'rejected') {
    return s.resolvedBy.name;
  }
  return undefined;
}
```

### SuggestionData (on `CommentAnnotation.suggestion`)

| Property | Type | Required | Notes |
|---|---|---|---|
| `annotationId` | `string` | Yes | Parent `CommentAnnotation` ID |
| `targetId` | `string` | Yes | Registered target ID |
| `targetType` | `SuggestionTargetType` | Yes | v1: always `'custom'` |
| `status` | `SuggestionStatus` | Yes | Current lifecycle state |
| `oldValue` / `newValue` | `unknown` | Yes | Snapshot and proposed value |
| `summary` | `string` | No | Plain-text description |
| `metadata` | `Record<string, unknown>` | No | Caller-supplied |
| `driftDetected` | `boolean` | No | Live value changed since snapshot |
| `createdBy` / `createdAt` | `User` / `number` | Yes | Author and creation time (ms) |
| `resolvedBy` / `resolvedAt` | `User` / `number` | No | Set on accept or reject |
| `rejectReason` | `string \| null` | No | Set on reject |

Variants: `PendingSuggestion<T>`, `ApprovedSuggestion<T>` (status `'accepted' | 'apply_failed'`), `RejectedSuggestion<T>`, `StaleSuggestion<T>` (no `resolvedBy` / `resolvedAt`). `CommitSuggestionConfig<T>` and `TargetEditCommitResult` both accept `summary`, `summaryHtml`, and `metadata`. `CommentAnnotationSuggestion` is the comment-side state mutated by `acceptSuggestion()` / `rejectSuggestion()`.

### React hooks

| Hook | Returns |
|---|---|
| `useSuggestionUtils()` | `SuggestionElement` |
| `useEnableSuggestionMode()` / `useDisableSuggestionMode()` | `{ enableSuggestionMode }` / `{ disableSuggestionMode }` |
| `useSuggestionModeState()` | `boolean` (reactive) |
| `useRegisterTarget()` / `useUnregisterTarget()` | `{ registerTarget }` / `{ unregisterTarget }` |
| `useStartSuggestion()` / `useCommitSuggestion()` | `{ startSuggestion }` / `{ commitSuggestion }` |
| `useSuggestions(filter?)` | `Suggestion[]` (reactive) |
| `usePendingSuggestion(targetId)` | `Suggestion \| null` (reactive) |
| `useSuggestionEventCallback(eventType)` | Latest suggestion-element event payload |
| `useAcceptSuggestion()` / `useRejectSuggestion()` | `{ acceptSuggestion }` / `{ rejectSuggestion }` (comment element) |
| `useCommentEventCallback('suggestionAccepted' \| 'suggestionRejected')` | Latest accept / reject payload |

**Verification Checklist:**
- [ ] Code narrows on `status` before reading `resolvedBy`, `resolvedAt`, or `rejectReason`
- [ ] Hook names match the table exactly (no `useSuggestionElement`, no `useAcceptCommentAnnotation`)
- [ ] `apply_failed` is handled as an `ApprovedSuggestion` variant

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/models/data-models#suggestiondata — `SuggestionData` and the `Suggestions` type section
- https://docs.velt.dev/api-reference/sdk/models/data-models#commentannotationsuggestion — `CommentAnnotationSuggestion`
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#usesuggestionutils — Suggestions hooks
