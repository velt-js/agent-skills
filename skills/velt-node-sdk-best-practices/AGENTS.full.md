# Velt Node Sdk Best Practices

**Version 0.2.0**  
Velt  
June 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Implementation guide for the Velt Node SDK (@veltdev/node) covering its two backends — sdk.api.* (REST API, 17 services) and sdk.selfHosting.* (MongoDB + S3 self-hosted, 7 services + token) — with emphasis on response envelopes, lazy-load pattern for self-hosting services, positional-arg surprise on getToken/getAttachment/saveAttachment, typed error class hierarchy, and data models (PartialCommentAnnotation, BaseMetadata, resolvedByUserId three-state semantics, round-trip dict helpers).

---

## Table of Contents

1. [Initialization & lifecycle](#1-initialization-lifecycle) — **CRITICAL**
   - 1.1 [Initialize VeltSDK in the right mode and wire shutdown](#11-initialize-veltsdk-in-the-right-mode-and-wire-shutdown)

4. [Data models](#4-data-models) — **HIGH**
   - 4.1 [Use Correct PartialCommentAnnotation and BaseMetadata Shapes for Updates](#41-use-correct-partialcommentannotation-and-basemetadata-shapes-for-updates)

5. [Cross-cutting pitfalls](#5-cross-cutting-pitfalls) — **MEDIUM**
   - 5.1 [getToken is positional, token service is sync, errors are typed classes](#51-gettoken-is-positional-token-service-is-sync-errors-are-typed-classes)

---

## 1. Initialization & lifecycle

**Impact: CRITICAL**

`VeltSDK.initialize(...)` shape (REST-only vs full self-hosting with `database`), env-var auth (`VELT_API_KEY` / `VELT_AUTH_TOKEN` / `VELT_WORKSPACE_*` / `AWS_*`), peer-dep requirements (`mongodb ^6` for self-hosting, `@aws-sdk/client-s3 ^3` for S3 attachments), Node 18+ runtime, and the `await sdk.close()` shutdown contract that releases the MongoDB pool. Get this wrong and either methods throw at runtime or pools leak across serverless cold starts.

### 1.1 Initialize VeltSDK in the right mode and wire shutdown

**Impact: CRITICAL (Wrong init mode → `sdk.selfHosting.*` methods throw at call time; missing shutdown → MongoDB pool leaks across serverless restarts)**

`VeltSDK.initialize()` has two valid shapes. Picking the wrong one isn't a compile error — it shows up later as runtime failures.

**Install** — `@veltdev/node` alone is enough for REST-only. Add `mongodb ^6` if you'll call any `sdk.selfHosting.*` method, and `@aws-sdk/client-s3 ^3` if any `saveAttachment` call will pass a file buffer. Node.js 18+.

Reference: `backend-sdks/node.mdx` (Installation; Quick Start → Initialize/Shutdown; Configuration → Environment Variables)

---

## 4. Data models

**Impact: HIGH**

TypeScript shapes for comment annotations and metadata used by both `sdk.api.commentAnnotations` and `sdk.selfHosting` services. Includes `PartialCommentAnnotation` (the update payload), `PartialComment`, `BaseMetadata`, `PartialTargetTextRange`, and round-trip dict helpers. Getting field names or semantics wrong (especially `resolvedByUserId`'s three-state contract) causes silent data corruption.

### 4.1 Use Correct PartialCommentAnnotation and BaseMetadata Shapes for Updates

**Impact: HIGH (Wrong field names or resolvedByUserId semantics cause silent data corruption in comment annotation updates)**

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

**`resolvedByUserId` three-state semantics** — this is the most common source of bugs:
| Value | Meaning |
|-------|---------|
| *omitted* | No change to resolution state |
| `null` | **Unresolve** the annotation |
| `"user-123"` | **Resolve** — mark as resolved by this user |

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

**Round-trip dict helpers** — use these when serializing/deserializing to preserve unknown keys for forward compatibility:

Reference: https://docs.velt.dev/api-reference/sdk/models/data-models — PartialCommentAnnotation, BaseMetadata

---

## 5. Cross-cutting pitfalls

**Impact: MEDIUM**

The traps that don't fit cleanly into one backend: `getToken` is positional on both backends; `sdk.selfHosting.token` is a synchronous property (no loader); typed error class discrimination via `instanceof`; envelope-confusion symptoms (`result.success is undefined` etc).

### 5.1 getToken is positional, token service is sync, errors are typed classes

**Impact: MEDIUM-HIGH (Wrong getToken shape returns undefined token; wrong envelope check silently misreads results; untyped catch loses structured error info)**

Three cross-cutting traps that come up across both backends.

### 1. `getToken` is positional on BOTH backends

Signature: `getToken(organizationId: string, userId: string, email?: string, isAdmin?: boolean)`.

Reference: `backend-sdks/node.mdx` (Self-Hosting Backend → Token; REST API Backend → Token; Error Handling)

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/backend-sdks/node
- https://docs.velt.dev/api-reference/sdk/models/data-models
- https://www.npmjs.com/package/@veltdev/node
