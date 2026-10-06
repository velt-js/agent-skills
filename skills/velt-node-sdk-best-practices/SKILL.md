---
name: velt-node-sdk-best-practices
description: Velt Node SDK (`@veltdev/node` 2.x) patterns for Node.js and TypeScript backends, covering `VeltSDK.initialize` (REST-only or self-hosting), `sdk.api.*` REST services, `sdk.selfHosting.*` on MongoDB or PostgreSQL plus S3, `accessControl.generateToken` for frontend JWTs, `verifyToken` resolver auth, `filterUnknownFields`, and typed errors (`VeltApiError`, `VeltDatabaseError`). Triggers on `@veltdev/node`, `VeltSDK`, `sdk.api`, `sdk.selfHosting`, or server-side Velt Node code.
license: MIT
metadata:
  author: velt
  version: "0.2.4"
---

# Velt Node SDK Best Practices

Implementation guide for `@veltdev/node` 2.x. The SDK has two independent backends that share the same `VeltSDK` instance but differ in initialization requirements, loader patterns, and response shapes. Most bugs come from blurring that line. This skill contains 9 rules across 5 categories.

## When to Apply

- Initializing `VeltSDK.initialize(...)` in a Node service (REST-only, or self-hosting on MongoDB or PostgreSQL)
- Calling any method under `sdk.api.*` or `sdk.selfHosting.*`
- Generating Velt auth tokens server-side for the frontend (`sdk.api.accessControl.generateToken`)
- Verifying the credential the frontend forwards to resolver endpoints (`sdk.selfHosting.verifyToken`)
- Configuring MongoDB, PostgreSQL, or AWS S3 for self-hosting
- Catching and discriminating SDK errors
- Upgrading from `@veltdev/node` 1.x (driver check at `initialize()`, closed attachment fields, removed `getToken`)
- Debugging "result.success is undefined", "is not a function", or "requires 'npm install mongodb'" symptoms

## The two-backend mental model

`sdk.api.*` is a typed wrapper over the Velt REST API. It needs only `apiKey` and `authToken`; service instances are available synchronously after init.

`sdk.selfHosting.*` is a server-side persistence layer that requires a `database` block (MongoDB by default, or `type: 'postgresql'`) and its driver; service instances are lazy-loaded via `await sdk.selfHosting.getXxx()` and cached.

The two return **different response envelopes**:

| Backend | Success envelope | Failure |
|---|---|---|
| `sdk.api.*` | `{ result: { status: 'success', message, data, ... } }` | Throws `VeltApiError` |
| `sdk.selfHosting.*` | `{ success: true, statusCode: 200, data }` | `{ success: false, statusCode, error, errorCode }` (or throws a `VeltSDKError` subclass) |

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|---|---|---|---|
| 1 | Initialization & lifecycle | CRITICAL | `init-` |
| 2 | sdk.api.* (REST backend) | HIGH | `api-` |
| 3 | sdk.selfHosting.* (MongoDB / PostgreSQL + S3) | HIGH | `selfhost-` |
| 4 | Data models | HIGH | `models-` |
| 5 | Cross-cutting pitfalls | MEDIUM | `pitfalls-` |

## Quick Reference

### 1. Initialization & lifecycle
- `init-dual-mode` - REST-only init needs no `database` block; self-hosting needs `database` plus its driver (`mongodb` or `pg`), checked at `initialize()`; wire `await sdk.close()` on shutdown

### 2. sdk.api.* (REST backend)
- `api-envelope-and-services` - Use the `{ result: { status, data } }` envelope; method index for the 17 documented namespaces; agent filters, `getDocumentsCount` filters, approval edges and `purge`
- `api-field-allowlist` - Pass `{ filterUnknownFields: true }` as the second arg to the activities / commentAnnotations / notifications add/update methods to drop unknown keys (opt-in, fail-open); reuse via exported `pickKnownFields` / `filterRequest` / `FilterSpec`

### 3. sdk.selfHosting.* (MongoDB / PostgreSQL + S3)
- `selfhost-lazy-load-and-services` - Lazy-load with `await sdk.selfHosting.getXxx()`; flat envelope with `success` + `errorCode`; per-service method index including `resolveUserIdsByEmail`
- `selfhost-attachments-positional` - `saveAttachment(request, fileData?, fileName?, mimeType?)` mixes a request object with positional file args; 2.x stores a closed field set; `getAttachment(orgId, attachmentId)` is purely positional
- `selfhost-postgresql-backend` - `type: 'postgresql'` with `pg`; set `sslmode: 'verify-full'` for remote databases; `manage_schema: false` + `postgresSchemaSql()` for locked-down roles; `sdk.selfHosting.database` adapter
- `selfhost-verify-token` - Configure `resolverAuth` and branch on `verifyToken(...).verified` in every resolver route; it never throws and never authorizes

### 4. Data models
- `models-comment-annotation` - `PartialCommentAnnotation` / `PartialComment` / `BaseMetadata` shapes, `resolvedByUserId` three-state semantics, round-trip dict helpers

### 5. Cross-cutting pitfalls
- `pitfalls-token-and-envelopes` - Mint tokens with `sdk.api.accessControl.generateToken` (request object, REST envelope), not the removed `getToken`; typed error classes discriminate via `instanceof`; envelope-confusion symptoms

## How to Use

Read the relevant rule for the code you are writing. Start with `init-dual-mode` for any new service, and read `pitfalls-token-and-envelopes` for unfamiliar tasks: it captures the traps that silently do the wrong thing.

```bash
cat rules/shared/init/init-dual-mode.md
cat rules/shared/pitfalls/pitfalls-token-and-envelopes.md
```

## Compiled Documents

- `AGENTS.md` - Compressed index of all rules (start here)
- `AGENTS.full.md` - Full verbose guide
