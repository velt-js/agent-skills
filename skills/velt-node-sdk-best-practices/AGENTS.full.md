# Velt Node Sdk Best Practices

**Version 0.2.3**  
Velt  
June 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Implementation guide for the Velt Node SDK (@veltdev/node) covering its two backends — sdk.api.* (REST API, 18 services) and sdk.selfHosting.* (MongoDB + S3 self-hosted, 7 services + token) — with emphasis on response envelopes, lazy-load pattern for self-hosting services, positional-arg surprise on getToken/getAttachment/saveAttachment, typed error class hierarchy, and data models (PartialCommentAnnotation, BaseMetadata, resolvedByUserId three-state semantics, round-trip dict helpers).

---

## Table of Contents

1. [Initialization & lifecycle](#1-initialization-lifecycle) — **CRITICAL**
   - 1.1 [Initialize VeltSDK in the right mode and wire shutdown](#11-initialize-veltsdk-in-the-right-mode-and-wire-shutdown)

2. [sdk.api.* REST backend](#2-sdkapi-rest-backend) — **HIGH**
   - 2.1 [Drop unknown fields from REST writes with the FieldFilterOptions allowlist](#21-drop-unknown-fields-from-rest-writes-with-the-fieldfilteroptions-allowlist)
   - 2.2 [Read the sdk.api.* envelope correctly and use the right service namespace](#22-read-the-sdkapi-envelope-correctly-and-use-the-right-service-namespace)

3. [sdk.selfHosting.* MongoDB + S3](#3-sdkselfhosting-mongodb-s3) — **HIGH**
   - 3.1 [Lazy-load self-hosting services and check the flat envelope](#31-lazy-load-self-hosting-services-and-check-the-flat-envelope)
   - 3.2 [Pass file bytes positionally to saveAttachment; getAttachment is purely positional](#32-pass-file-bytes-positionally-to-saveattachment-getattachment-is-purely-positional)

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

## 2. sdk.api.* REST backend

**Impact: HIGH**

18 typed services that wrap the Velt REST API v2. Response envelope is `{ result: { status, message, data, ... } }`. Every method requires `organizationId` (write) or `organizationIds` (read). Service instances are available immediately — no async lazy-load. The `activities` / `commentAnnotations` / `notifications` add/update methods accept an optional `FieldFilterOptions` second argument (`{ filterUnknownFields: true }`) to drop unknown keys before the write.

### 2.1 Drop unknown fields from REST writes with the FieldFilterOptions allowlist

**Impact: MEDIUM (Opt-in payload narrowing keeps custom/unknown keys out of Velt REST writes; fail-open so a write is never blocked)**

The `sdk.api.*` add/update methods on `activities`, `commentAnnotations`, and `notifications` accept an optional **second** argument, `FieldFilterOptions`. Pass `{ filterUnknownFields: true }` to narrow the request to exactly the fields the target Velt backend endpoint accepts, dropping unknown/custom keys before the request is sent. It is **opt-in** (defaults to `false`) and **fail-open**: if filtering throws, the original payload is sent, so enabling it never blocks a write.

The eight methods that accept the option: `addActivities`, `updateActivities`, `addCommentAnnotations`, `updateCommentAnnotations`, `addComments`, `updateComments`, `addNotifications`, `updateNotifications`.

**Incorrect (passing custom/unknown keys and assuming the backend strips them — they are forwarded as-is, and `isRead`/`isArchived` silently do nothing on update):**

```ts
// Unknown `internalTag` is sent verbatim; nothing narrows it.
await sdk.api.notifications.addNotifications({
  organizationId: 'org-123',
  documentId: 'doc-1',
  notifications: [{ /* ... */ internalTag: 'debug' }],
});

// isRead/isArchived are NOT part of /v2/notifications/update — they are ignored.
await sdk.api.notifications.updateNotifications({
  organizationId: 'org-123',
  notifications: [{ id: 'n-1', isRead: true }],
});
```

**Correct (opt in with the second argument to drop unknown keys before sending):**

```ts
await sdk.api.notifications.addNotifications(
  {
    organizationId: 'org-123',
    documentId: 'doc-1',
    notifications: [{ /* ... */ internalTag: 'debug' }], // internalTag dropped
  },
  { filterUnknownFields: true },
);
pickKnownFields<T extends object>(data: T, keys: readonly string[]): Partial<T>;
filterRequest<T extends object>(request: T, spec: FilterSpec): T;

interface FilterSpec {
  keys: readonly string[];              // allowed top-level keys (everything else dropped)
  arrays?: Record<string, FilterSpec>;  // array-of-object fields, filtered per item
  objects?: Record<string, FilterSpec>; // single-object fields, filtered recursively
}
```

Open-typed objects (`actionUser`, `context`, `metadata`, `from`, `entityData`, and user objects) pass through whole — their nested contents are never filtered.
**Exported utilities** — the field-allowlist module is exported from `@veltdev/node` so advanced callers can reuse the same logic:
- `pickKnownFields(data, keys)` — keeps only own-enumerable keys present in `keys`; values kept by reference (no recursion); non-object/array/null inputs returned unchanged.
- `filterRequest(request, spec)` — applies a `FilterSpec` recursively; never mutates input; fail-open (returns the original request on any error).
- Eight per-method specs are exported: `ADD_ACTIVITIES_SPEC`, `UPDATE_ACTIVITIES_SPEC`, `ADD_COMMENT_ANNOTATIONS_SPEC`, `UPDATE_COMMENT_ANNOTATIONS_SPEC`, `ADD_COMMENTS_SPEC`, `UPDATE_COMMENTS_SPEC`, `ADD_NOTIFICATIONS_SPEC`, `UPDATE_NOTIFICATIONS_SPEC`. See the docs for the full per-endpoint allowlisted-key tables.
**Note:** `UPDATE_NOTIFICATIONS_SPEC` intentionally excludes `isRead`/`isArchived` — they are absent from the backend `UpdateNotificationsSchemaV2` and unsupported by `/v2/notifications/update`, so they are dropped when filtering is on.

Reference: `backend-sdks/node.mdx` — "Field Allowlist" (FieldFilterOptions, exported `pickKnownFields`/`filterRequest`/`FilterSpec`, per-endpoint specs)

---

### 2.2 Read the sdk.api.* envelope correctly and use the right service namespace

**Impact: HIGH (Wrong envelope check silently mis-reads every response; wrong service/method name is a runtime "is not a function")**

Every `sdk.api.*` method returns the REST envelope and requires `organizationId`. Service instances are available immediately — there is no `await sdk.api.getXxx()` lazy-load (that pattern is `sdk.selfHosting.*` only).

**Envelope** — success returns:

**High-risk additions to remember:**

```ts
const result = await sdk.api.documents.addDocuments({
  organizationId: 'org-123',
  documents: [{ documentId: 'doc-1', documentName: 'My Document' }],
});
if (result.result.status !== 'success') throw new Error(result.result.message);
```

Workspace and Token methods are workspace-scoped — they use `VELT_WORKSPACE_AUTH_TOKEN` and `VELT_WORKSPACE_ID` when set.

Reference: `backend-sdks/node.mdx` (REST API Backend → all 18 service subsections); `api-reference/sdk/models/data-models.mdx` (Node SDK Types → `VeltApiResponse`, per-service request/response types)

---

## 3. sdk.selfHosting.* MongoDB + S3

**Impact: HIGH**

7 services backed by your own MongoDB (and optionally AWS S3 for attachments). Loader pattern: `const svc = await sdk.selfHosting.getXxx()` — instances cached after first call. Flat response envelope: `{ success, statusCode, data }` on success, `{ success: false, statusCode, error, errorCode }` on failure. Attachment uploads use a hybrid call shape — request object plus optional positional file args.

### 3.1 Lazy-load self-hosting services and check the flat envelope

**Impact: HIGH (Forgetting `await` returns a Promise (next call throws "is not a function"); reading the wrong envelope key silently mis-judges every result)**

Self-hosting services are lazy-loaded with `await sdk.selfHosting.getXxx()` — the service instance is cached after the first call. Skip the `await` and you get a Promise object back, then every method on it throws "is not a function".

**Envelope** — flat shape, NOT the nested `{ result: { status, ... } }` of `sdk.api.*`:

**Incorrect — pre-v1.0.5 `user` field is silently ignored:**

```ts
const svc = await sdk.selfHosting.getReactions();
await svc.saveReactions({
  metadata: { organizationId: 'org-123', documentId: 'doc-1' },
  reactionAnnotation: {
    'reaction-1': { annotationId: 'reaction-1', icon: 'thumbsup', user: { userId: 'u-1' } }, // `user` is not a recognized key on v1.0.5+
  },
});
```

**Correct — use `from`:**

```ts
const svc = await sdk.selfHosting.getReactions();
await svc.saveReactions({
  metadata: { organizationId: 'org-123', documentId: 'doc-1' },
  reactionAnnotation: {
    'reaction-1': { annotationId: 'reaction-1', icon: 'thumbsup', from: { userId: 'u-1' }, metadata: {} },
  },
});
```

**Canonical write:**

```ts
const svc = await sdk.selfHosting.getComments();
const r = await svc.saveComments({
  metadata: { organizationId: 'org-123', documentId: 'doc-1' },
  commentAnnotation: {
    'annotation-1': {
      annotationId: 'annotation-1',
      comments: { '123456': { commentId: '123456', commentText: 'Hello' } },
      metadata: {},
    },
  },
});
// → { success: true, statusCode: 200, data: { saved: true } }
```

**Canonical delete:**

```ts
const svc = await sdk.selfHosting.getComments();
await svc.deleteComment({
  commentAnnotationId: 'annotation-1',
  metadata: { organizationId: 'org-123' },
});
```

Reference: `backend-sdks/node.mdx` (Self-Hosting Backend opening + all 7 service subsections); `api-reference/sdk/models/data-models.mdx` (Node SDK Types → `VeltSelfHostingResponse`, per-method request types)

---

### 3.2 Pass file bytes positionally to saveAttachment; getAttachment is purely positional

**Impact: HIGH (Putting fileData inside the request object silently no-ops the S3 upload; wrapping getAttachment's args in an object returns nothing useful)**

Attachments is the one self-hosting service that mixes a request object with positional file arguments. This trips up everyone the first time.

**`saveAttachment(request, fileBuffer?, fileName?, mimeType?)`** — the request object goes first; the next three are optional positional args. Supply all three when you want the SDK to upload the body to S3; omit them when you're storing only metadata.

Reference: `backend-sdks/node.mdx` (Self-Hosting Backend → Attachments)

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
