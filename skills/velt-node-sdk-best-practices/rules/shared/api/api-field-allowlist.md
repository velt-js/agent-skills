---
title: Drop unknown fields from REST writes with the FieldFilterOptions allowlist
impact: MEDIUM
impactDescription: Opt-in payload narrowing keeps custom/unknown keys out of Velt REST writes; fail-open so a write is never blocked
tags: FieldFilterOptions, filterUnknownFields, pickKnownFields, filterRequest, FilterSpec, allowlist, ADD_NOTIFICATIONS_SPEC, UPDATE_NOTIFICATIONS_SPEC
---

## Drop unknown fields from REST writes with the FieldFilterOptions allowlist

The `sdk.api.*` add/update methods on `activities`, `commentAnnotations`, and `notifications` accept an optional **second** argument, `FieldFilterOptions`. Pass `{ filterUnknownFields: true }` to narrow the request to exactly the fields the target Velt backend endpoint accepts, dropping unknown/custom keys before the request is sent. It is **opt-in** (defaults to `false`) and **fail-open**: if filtering throws, the original payload is sent, so enabling it never blocks a write.

The eight methods that accept the option: `addActivities`, `updateActivities`, `addCommentAnnotations`, `updateCommentAnnotations`, `addComments`, `updateComments`, `addNotifications`, `updateNotifications`.

```ts
interface FieldFilterOptions {
  // When true, narrow the request to only the fields the Velt backend endpoint
  // accepts, silently dropping unknown keys. Fail-open. Defaults to false.
  filterUnknownFields?: boolean;
}
```

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
```

Open-typed objects (`actionUser`, `context`, `metadata`, `from`, `entityData`, and user objects) pass through whole — their nested contents are never filtered.

**Exported utilities** — the field-allowlist module is exported from `@veltdev/node` so advanced callers can reuse the same logic:

```ts
pickKnownFields<T extends object>(data: T, keys: readonly string[]): Partial<T>;
filterRequest<T extends object>(request: T, spec: FilterSpec): T;

interface FilterSpec {
  keys: readonly string[];              // allowed top-level keys (everything else dropped)
  arrays?: Record<string, FilterSpec>;  // array-of-object fields, filtered per item
  objects?: Record<string, FilterSpec>; // single-object fields, filtered recursively
}
```

- `pickKnownFields(data, keys)` — keeps only own-enumerable keys present in `keys`; values kept by reference (no recursion); non-object/array/null inputs returned unchanged.
- `filterRequest(request, spec)` — applies a `FilterSpec` recursively; never mutates input; fail-open (returns the original request on any error).
- Eight per-method specs are exported: `ADD_ACTIVITIES_SPEC`, `UPDATE_ACTIVITIES_SPEC`, `ADD_COMMENT_ANNOTATIONS_SPEC`, `UPDATE_COMMENT_ANNOTATIONS_SPEC`, `ADD_COMMENTS_SPEC`, `UPDATE_COMMENTS_SPEC`, `ADD_NOTIFICATIONS_SPEC`, `UPDATE_NOTIFICATIONS_SPEC`. See the docs for the full per-endpoint allowlisted-key tables.

**Note:** `UPDATE_NOTIFICATIONS_SPEC` intentionally excludes `isRead`/`isArchived` — they are absent from the backend `UpdateNotificationsSchemaV2` and unsupported by `/v2/notifications/update`, so they are dropped when filtering is on.

**Verification:**
- [ ] `filterUnknownFields: true` passed as the **second** argument (not nested in the request object)
- [ ] Only used on the 8 add/update methods of `activities` / `commentAnnotations` / `notifications`
- [ ] Not relied on to apply `isRead`/`isArchived` via `updateNotifications` — those are unsupported by the endpoint
- [ ] Aware filtering is fail-open: a malformed spec does not block the write, it sends the original payload

**Source Pointer:** `backend-sdks/node.mdx` — "Field Allowlist" (FieldFilterOptions, exported `pickKnownFields`/`filterRequest`/`FilterSpec`, per-endpoint specs)
