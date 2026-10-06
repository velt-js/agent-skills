---
title: Lazy-load self-hosting services and check the flat envelope
impact: HIGH
impactDescription: Forgetting `await` returns a Promise (next call throws "is not a function"); reading the wrong envelope key silently mis-judges every result
tags: sdk.selfHosting, lazy-load, VeltSelfHostingResponse, errorCode, services-reference, mongodb, postgresql, resolveUserIdsByEmail, sdk.selfHosting.database, INVALID_INPUT
---

## Lazy-load self-hosting services and check the flat envelope

Self-hosting services are lazy-loaded with `await sdk.selfHosting.getXxx()`; the service instance is cached after the first call. Skip the `await` and you get a Promise object back, then every method on it throws "is not a function". The same methods run on MongoDB or PostgreSQL (`database.type`).

**Envelope** — flat shape, NOT the nested `{ result: { status, ... } }` of `sdk.api.*`:

```ts
// Success
{ success: true,  statusCode: 200, data: <payload> }
// Failure
{ success: false, statusCode: 4xx|5xx, error: 'message', errorCode: 'INVALID_INPUT' | 'INTERNAL_ERROR' | 'NOT_FOUND' }
```

Check `result.success` (boolean) and read `result.data` on success; read `result.errorCode` on failure.

```ts
// CORRECT
const svc = await sdk.selfHosting.getComments();
const r = await svc.getComments({ organizationId: 'org-123', documentIds: ['doc-1'] });
if (r.success) {
  // r.data is the typed payload
} else {
  console.error(`[${r.errorCode}] ${r.error}`);
}

// WRONG — missing await on the loader
const svc = sdk.selfHosting.getComments();      // Promise<CommentsService>
await svc.getComments({ /* ... */ });            // TypeError: svc.getComments is not a function
```

**Service-by-service method index** (7 services). The loader is plural (e.g., `getAttachments`); methods on the loaded service may be singular (e.g., `getAttachment`). Don't confuse them.

| Service | Loader | Methods |
|---|---|---|
| Comments | `await sdk.selfHosting.getComments()` | `getComments`, `saveComments`, `deleteComment` |
| Reactions | `await sdk.selfHosting.getReactions()` | `getReactions`, `saveReactions`, `deleteReaction` |
| Attachments | `await sdk.selfHosting.getAttachments()` | `getAttachment` (positional), `saveAttachment` (request + positional file args — see `selfhost-attachments-positional`), `deleteAttachment` |
| Users | `await sdk.selfHosting.getUsers()` | `getUsers`, `resolveUserIdsByEmail` |
| Recorder | `await sdk.selfHosting.getRecorder()` | `getRecorderAnnotations`, `saveRecorderAnnotation`, `deleteRecorderAnnotation` |
| Notifications | `await sdk.selfHosting.getNotifications()` | `getNotifications`, `saveNotifications`, `deleteNotification` |
| Activities | `await sdk.selfHosting.getActivities()` | `getActivities`, `saveActivities` (no delete) |

Two members are not loaders: `await sdk.selfHosting.database` resolves to the raw `DatabaseAdapter` (see `selfhost-postgresql-backend`), and `sdk.selfHosting.verifyToken(...)` authenticates resolver requests (see `selfhost-verify-token`). There is no self-hosting token service in the current docs; mint tokens with `sdk.api.accessControl.generateToken` (see `pitfalls-token-and-envelopes`).

**Asymmetries worth remembering:**
- Activities has no `deleteActivity` method
- Self-hosting Users exposes `getUsers` and `resolveUserIdsByEmail` only; use `sdk.api.users.*` or `await sdk.selfHosting.database` to write users
- `resolveUserIdsByEmail({ organizationId, emails })` backs the frontend `anonymousUser` data provider. `data` is a map of email to user ID; unmatched addresses are absent, repeats are de-duplicated, empty entries dropped, and `user_schema` mappings are honored. Like `getUsers`, it does not filter by organization
- On 2.x an empty `organizationId` in `getComments`, `getReactions`, `getRecorderAnnotations`, or `getNotifications` returns 400 with `errorCode: 'INVALID_INPUT'`
- Recorder's loader is `getRecorder` (singular), not `getRecorders`
- `saveReactions` reactionAnnotation entries: only `annotationId` is required; `icon`, `from`, and `metadata` are all optional. The reacting user goes in `from` (a `PartialUser`) — **renamed from `user` in `@veltdev/node` v1.0.5**, matching the frontend `PartialReactionAnnotation.from`. Pre-v1.0.5 code using `user` is silently dropped.

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

**Verification:**
- [ ] Every loader call has `await sdk.selfHosting.getXxx()` prefix
- [ ] Success branches read `result.success` (boolean), not `result.result.status`
- [ ] Loader names match the table (plural for most, `getRecorder` is the exception)
- [ ] `database` was supplied to `VeltSDK.initialize()`; otherwise these methods throw `VeltDatabaseError`
- [ ] Read requests always carry a non-empty `organizationId`
- [ ] No `deleteActivity`, self-hosting `saveUsers`/`deleteUsers`, or `sdk.selfHosting.token` calls; those are not in the current docs
- [ ] `saveReactions` entries use `from` (not `user`) for the reacting user on `@veltdev/node` v1.0.5+

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/node#self-hosting-backend - "Self-Hosting Backend" (all 7 service subsections)
- https://docs.velt.dev/backend-sdks/node#resolveuseridsbyemail - "resolveUserIdsByEmail"
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltselfhostingresponse-node - "VeltSelfHostingResponse (Node)"
