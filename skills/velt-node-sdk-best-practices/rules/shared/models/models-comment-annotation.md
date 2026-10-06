---
title: Use Correct PartialCommentAnnotation and BaseMetadata Shapes in Self-Hosting Handlers
impact: HIGH
impactDescription: Wrong field names or resolvedByUserId semantics cause silent data corruption when persisting resolver payloads
tags: PartialCommentAnnotation, PartialComment, BaseMetadata, resolvedByUserId, PartialTargetTextRange, partialCommentAnnotationFromDict, partialCommentAnnotationToDict, partialCommentFromDict, partialCommentToDict, baseMetadataFromDict, attachments, round-trip, saveComments
---

## Use Correct PartialCommentAnnotation and BaseMetadata Shapes in Self-Hosting Handlers

`PartialCommentAnnotation` is the payload shape for reading and writing annotation PII in self-hosting resolver handlers (for example the `commentAnnotation` map passed to `sdk.selfHosting` `saveComments`). It is not the REST update payload: `sdk.api.commentAnnotations.updateCommentAnnotations` takes `annotationIds` plus an `updatedData` object.

**PartialCommentAnnotation:**

```typescript
interface PartialCommentAnnotation {
  annotationId: string;                         // Required: stable identifier for the thread
  metadata?: BaseMetadata;                      // Document/org context
  comments?: Record<string, PartialComment>;    // Keyed by commentId string
  from?: PartialUser;                           // Annotation author
  assignedTo?: PartialUser;                     // Assigned user
  targetTextRange?: PartialTargetTextRange;     // Text range the annotation is anchored to
  resolvedByUserId?: string | null;             // Three-state, see below
  [key: string]: unknown;                       // Unknown keys preserved by round-trip helpers
}
```

**`resolvedByUserId` three-state semantics** (the most common source of bugs):

| State | Representation | Meaning |
|-------|----------------|---------|
| Absent | Property not set on the object | No resolution information; do not write the field |
| Explicit `null` | `resolvedByUserId: null` | Annotation was unresolved (cleared) |
| String | `resolvedByUserId: "user-123"` | Resolved by this user |

**Incorrect (truthiness check collapses absent and `null`, so an unresolve is dropped, or every save overwrites resolution state):**

```typescript
const annotation = partialCommentAnnotationFromDict(payload);
// BUG: absent and null both fall into the else-branch
if (annotation.resolvedByUserId) {
  await db.setResolvedBy(annotation.annotationId, annotation.resolvedByUserId);
} else {
  await db.setResolvedBy(annotation.annotationId, null); // wipes state on every unrelated save
}
```

**Correct (distinguish absent from explicit `null` with `Object.hasOwn`):**

```typescript
import { partialCommentAnnotationFromDict, partialCommentAnnotationToDict } from '@veltdev/node';

const annotation = partialCommentAnnotationFromDict(payload);

if (!Object.hasOwn(annotation, 'resolvedByUserId')) {
  // Absent: skip; do not overwrite existing resolution state
} else if (annotation.resolvedByUserId === null) {
  await db.setResolvedBy(annotation.annotationId, null);       // unresolve
} else {
  await db.setResolvedBy(annotation.annotationId, annotation.resolvedByUserId); // resolve
}

// Serialize back; unknown keys and an explicit null survive the round-trip
const dict = partialCommentAnnotationToDict(annotation);
```

**PartialComment:**

```typescript
interface PartialComment {
  commentId: string | number;
  commentHtml?: string;
  commentText?: string;
  attachments?: Record<string, PartialAttachment>;  // string keys (not number)
  from?: PartialUser;
  to?: PartialUser[];
  taggedUserContacts?: PartialTaggedUserContacts[];
  [key: string]: unknown;  // Unknown keys preserved by round-trip helpers
}
```

**PartialTargetTextRange:** `{ text: string }`, with `partialTargetTextRangeFromDict` / `partialTargetTextRangeToDict`.

**BaseMetadata:**

```typescript
interface BaseMetadata {
  apiKey?: string;
  documentId?: string;              // Velt-internal document identifier
  clientDocumentId?: string;        // Your application's document identifier
  organizationId?: string;          // Velt-internal organization identifier
  clientOrganizationId?: string;    // Your application's organization identifier
  folderId?: string;                // Your application's folder identifier
  veltFolderId?: string;            // Velt-internal folder identifier
  documentMetadata?: Record<string, unknown>;
  sdkVersion?: string | null;       // added in v1.0.2
}
```

**Round-trip helpers** exported at the package top level: `partialCommentAnnotationFromDict` / `ToDict`, `partialCommentFromDict` / `ToDict`, `partialTargetTextRangeFromDict` / `ToDict`, `baseMetadataFromDict` / `ToDict`. Use them when deserializing resolver or webhook payloads so unknown keys are preserved. `PartialUser` is a minimal pass-through `{ userId: string }`.

**Verification:**
- [ ] `PartialCommentAnnotation` is used for self-hosting resolver payloads, not for `sdk.api.commentAnnotations.updateCommentAnnotations` (which takes `annotationIds` + `updatedData`)
- [ ] Code distinguishes absent `resolvedByUserId` from explicit `null` (`Object.hasOwn` or `in`), never a truthiness check
- [ ] `attachments` uses string keys in `Record<string, PartialAttachment>`
- [ ] Round-trip helpers are used when deserializing payloads, so unknown keys survive
- [ ] `clientDocumentId` / `clientOrganizationId` are used when you need your own IDs rather than Velt-internal ones

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/node#data-models - "Data Models" (PartialCommentAnnotation, resolvedByUserId Semantics, PartialComment, BaseMetadata)
- https://docs.velt.dev/backend-sdks/node#updatecommentannotations - "updateCommentAnnotations"
