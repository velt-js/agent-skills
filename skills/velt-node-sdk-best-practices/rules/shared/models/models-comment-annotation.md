---
title: Use Correct PartialCommentAnnotation and BaseMetadata Shapes for Updates
impact: HIGH
impactDescription: Wrong field names or resolvedByUserId semantics cause silent data corruption in comment annotation updates
tags: PartialCommentAnnotation, PartialComment, BaseMetadata, resolvedByUserId, PartialTargetTextRange, partialCommentAnnotationFromDict, partialCommentAnnotationToDict, partialCommentFromDict, partialCommentToDict, attachments, round-trip, updateCommentAnnotations
---

## Use Correct PartialCommentAnnotation and BaseMetadata Shapes for Updates

When updating comment annotations via `sdk.api.commentAnnotations.updateCommentAnnotations()` or the self-hosting equivalent, the payload uses `PartialCommentAnnotation` — a subset of the full annotation with specific field semantics.

**PartialCommentAnnotation:**

```typescript
interface PartialCommentAnnotation {
  annotationId: string;                         // Required: which annotation to update
  metadata?: BaseMetadata;                      // Document/org context
  comments?: Record<string, PartialComment>;    // Map of comment IDs to partial updates (optional)
  from?: PartialUser;                           // Annotation author
  assignedTo?: PartialUser;                     // Assigned user
  targetTextRange?: PartialTargetTextRange;     // Text range the annotation is anchored to
  resolvedByUserId?: string | null;             // Three-state — see below
  [key: string]: unknown;                       // Unknown keys preserved by round-trip helpers
}
```

**`resolvedByUserId` three-state semantics** — this is the most common source of bugs:

| Value | Meaning |
|-------|---------|
| *omitted* | No change to resolution state |
| `null` | **Unresolve** the annotation |
| `"user-123"` | **Resolve** — mark as resolved by this user |

```typescript
// Resolve an annotation
await sdk.api.commentAnnotations.updateCommentAnnotations({
  organizationId: 'org-1',
  documentId: 'doc-1',
  commentAnnotations: [{
    annotationId: 'ann-1',
    resolvedByUserId: 'user-123',  // resolves
  }],
});

// Unresolve it
await sdk.api.commentAnnotations.updateCommentAnnotations({
  organizationId: 'org-1',
  documentId: 'doc-1',
  commentAnnotations: [{
    annotationId: 'ann-1',
    resolvedByUserId: null,  // unresolves
  }],
});

// Update other fields without touching resolution state — just omit resolvedByUserId
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

Note: `attachments` uses `Record<string, PartialAttachment>` (string keys), not `{ [attachmentId: number]: PartialAttachment }`.

**PartialTargetTextRange:**

```typescript
interface PartialTargetTextRange {
  text: string;  // The selected text snippet the comment is anchored to
}
```

**BaseMetadata:**

```typescript
interface BaseMetadata {
  apiKey?: string;
  documentId?: string;
  clientDocumentId?: string;        // Client-side document identifier (your app's original value)
  organizationId?: string;
  clientOrganizationId?: string;    // Client-side org identifier (your app's original value)
  folderId?: string;                // Your application's folder identifier
  veltFolderId?: string;            // Velt-generated internal folder identifier
  documentMetadata?: Record<string, unknown>;  // Arbitrary document-level metadata pass-through
  sdkVersion?: string | null;       // SDK version that produced the request (added in v1.0.2)
}
```

**Round-trip dict helpers** — use these when serializing/deserializing to preserve unknown keys for forward compatibility:

```typescript
import {
  partialCommentAnnotationFromDict,
  partialCommentAnnotationToDict,
  partialCommentFromDict,
  partialCommentToDict,
} from '@veltdev/node';

// Deserialize from a raw dict (e.g. from a webhook payload)
const annotation = partialCommentAnnotationFromDict(rawDict);

// Serialize back — unknown keys are preserved
const dict = partialCommentAnnotationToDict(annotation);
```

**Verification:**
- [ ] `resolvedByUserId` is explicitly set to `null` for unresolve (not `undefined` or omitted)
- [ ] `resolvedByUserId` is omitted (not set to `undefined`) when resolution state should not change
- [ ] `attachments` uses string keys in `Record<string, PartialAttachment>`
- [ ] Round-trip helpers used when deserializing webhook payloads to preserve unknown keys
- [ ] `BaseMetadata` includes `clientDocumentId` and `clientOrganizationId` when needed for client-side ID mapping

**Source Pointer:** https://docs.velt.dev/api-reference/sdk/models/data-models — PartialCommentAnnotation, BaseMetadata
