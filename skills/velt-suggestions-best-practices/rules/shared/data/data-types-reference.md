---
title: Suggestion Data Types Reference
impact: MEDIUM
tags: SuggestionData, Suggestion, PendingSuggestion, ApprovedSuggestion, RejectedSuggestion, StaleSuggestion, types
---

## Suggestion Data Types Reference

Suggestions are stored as `CommentAnnotation` objects with `type === 'suggestion'` and a populated `suggestion` field.

### SuggestionData

Stored on `CommentAnnotation.suggestion`:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `annotationId` | `string` | Yes | ID of the parent `CommentAnnotation` |
| `targetId` | `string` | Yes | ID of the registered suggestion target |
| `targetType` | `SuggestionTargetType` | Yes | v1: always `'custom'` |
| `status` | `SuggestionStatus` | Yes | Current lifecycle state |
| `oldValue` | `unknown` | Yes | Target value captured at suggestion creation |
| `newValue` | `unknown` | Yes | Proposed replacement value |
| `summary` | `string` | No | Human-readable description of the change |
| `metadata` | `Record<string, unknown>` | No | Arbitrary caller-supplied metadata |
| `driftDetected` | `boolean` | No | True when target value changed after creation |
| `createdBy` | `User` | Yes | User who created the suggestion |
| `createdAt` | `number` | Yes | Unix timestamp (ms) of creation |
| `resolvedBy` | `User` | No | User who accepted or rejected |
| `resolvedAt` | `number` | No | Unix timestamp (ms) of resolution |
| `rejectReason` | `string \| null` | No | Reason provided when rejecting |

### Suggestion\<T\> Discriminated Union

```typescript
type Suggestion<T = unknown> =
  | PendingSuggestion<T>
  | ApprovedSuggestion<T>
  | RejectedSuggestion<T>
  | StaleSuggestion<T>;
```

Narrow by `status` to access variant-specific fields. `ApprovedSuggestion<T>` may have `apply_failed` status when the accept handler threw.

### React Hooks Summary

| Hook | Returns |
|------|---------|
| `useSuggestionUtils()` | `SuggestionElement` singleton |
| `useEnableSuggestionMode()` | `{ enableSuggestionMode }` |
| `useDisableSuggestionMode()` | `{ disableSuggestionMode }` |
| `useSuggestionModeState()` | `boolean` (reactive) |
| `useRegisterTarget()` | `{ registerTarget }` |
| `useUnregisterTarget()` | `{ unregisterTarget }` |
| `useStartSuggestion()` | `{ startSuggestion }` |
| `useCommitSuggestion()` | `{ commitSuggestion }` |
| `useSuggestions(filter?)` | `Suggestion[]` (reactive) |
| `usePendingSuggestion(targetId)` | `Suggestion \| null` (reactive) |
| `useSuggestionEventCallback(eventType)` | Event payload (reactive) |
| `useCommentEventCallback(eventType)` | Event payload (for accept/reject) |
