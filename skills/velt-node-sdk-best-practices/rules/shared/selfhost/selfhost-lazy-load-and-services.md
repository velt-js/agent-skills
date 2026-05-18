---
title: Lazy-load self-hosting services and check the flat envelope
impact: HIGH
impactDescription: Forgetting `await` returns a Promise (next call throws "is not a function"); reading the wrong envelope key silently mis-judges every result
tags: sdk.selfHosting, lazy-load, VeltSelfHostingResponse, errorCode, services-reference, mongodb
---

## Lazy-load self-hosting services and check the flat envelope

Self-hosting services are lazy-loaded with `await sdk.selfHosting.getXxx()` — the service instance is cached after the first call. Skip the `await` and you get a Promise object back, then every method on it throws "is not a function".

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
| Users | `await sdk.selfHosting.getUsers()` | `getUsers` |
| Recorder | `await sdk.selfHosting.getRecorder()` | `getRecorderAnnotations`, `saveRecorderAnnotation`, `deleteRecorderAnnotation` |
| Notifications | `await sdk.selfHosting.getNotifications()` | `getNotifications`, `saveNotifications`, `deleteNotification` |
| Activities | `await sdk.selfHosting.getActivities()` | `getActivities`, `saveActivities` (no delete) |

Token is separate — it's a synchronous property `sdk.selfHosting.token`, not a loader. See `pitfalls-token-and-envelopes`.

**Asymmetries worth remembering:**
- Activities has no `deleteActivity` method
- Self-hosting Users only exposes `getUsers` — use `sdk.api.users.*` for write paths
- Recorder's loader is `getRecorder` (singular), not `getRecorders`

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
- [ ] `database` was supplied to `VeltSDK.initialize()` — else these methods throw
- [ ] No `deleteActivity` or self-hosting `saveUsers`/`deleteUsers` — those don't exist

**Source Pointer:** `backend-sdks/node.mdx` (Self-Hosting Backend opening + all 7 service subsections); `api-reference/sdk/models/data-models.mdx` (Node SDK Types → `VeltSelfHostingResponse`, per-method request types)
