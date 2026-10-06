# Sections

## 1. Initialization & lifecycle (init)

**Impact:** CRITICAL
**Description:** `VeltSDK.initialize(...)` shape (REST-only with no `database` block vs self-hosting with `database`), `database.type` (`mongodb` default or `postgresql`), env-var auth (`VELT_API_KEY` / `VELT_AUTH_TOKEN` / `VELT_WORKSPACE_*` / `AWS_*`), optional peer dependencies checked at `initialize()` (`mongodb ^6` or `pg ^8.16`, plus `@aws-sdk/client-s3 ^3` and `jose ^5`), Node 18+ runtime, and the `await sdk.close()` shutdown contract that releases the database pool. Get this wrong and the SDK fails at startup, methods throw at runtime, or pools leak.

---

## 2. sdk.api.* REST backend (api)

**Impact:** HIGH
**Description:** 17 documented typed services that wrap the Velt REST API v2 (`agents` and `memory` stay hidden in the docs). Response envelope is `{ result: { status, message, data, ... } }`. Organization-scoped methods carry `organizationId` (or `organizationIds` on list reads). Service instances are available immediately, with no async lazy-load and no `database` block. The `activities` / `commentAnnotations` / `notifications` add/update methods accept an optional `FieldFilterOptions` second argument (`{ filterUnknownFields: true }`) to drop unknown keys before the write.

---

## 3. sdk.selfHosting.* MongoDB / PostgreSQL + S3 (selfhost)

**Impact:** HIGH
**Description:** 7 services backed by your own MongoDB or PostgreSQL (and optionally AWS S3 for attachments). Loader pattern: `const svc = await sdk.selfHosting.getXxx()`, cached after the first call. Flat response envelope: `{ success, statusCode, data }` on success, `{ success: false, statusCode, error, errorCode }` on failure. Attachment uploads use a hybrid call shape (request object plus optional positional file args). Also covers PostgreSQL TLS and schema management, the `sdk.selfHosting.database` adapter, and `verifyToken` resolver authentication.

---

## 4. Data models (models)

**Impact:** HIGH
**Description:** TypeScript shapes for comment annotation PII and metadata used in `sdk.selfHosting` resolver handlers (not the REST `updateCommentAnnotations` payload, which uses `annotationIds` + `updatedData`). Includes `PartialCommentAnnotation` (the update payload), `PartialComment`, `BaseMetadata`, `PartialTargetTextRange`, and round-trip dict helpers. Getting field names or semantics wrong (especially `resolvedByUserId`'s three-state contract) causes silent data corruption.

---

## 5. Cross-cutting pitfalls (pitfalls)

**Impact:** MEDIUM
**Description:** The traps that don't fit cleanly into one backend: token generation moved to `sdk.api.accessControl.generateToken` (the positional `getToken` is no longer documented); typed error class discrimination via `instanceof`; envelope-confusion symptoms (`result.success is undefined` etc).
