# Sections

## 1. Initialization & lifecycle (init)

**Impact:** CRITICAL
**Description:** `VeltSDK.initialize(...)` shape (REST-only vs full self-hosting with `database`), env-var auth (`VELT_API_KEY` / `VELT_AUTH_TOKEN` / `VELT_WORKSPACE_*` / `AWS_*`), peer-dep requirements (`mongodb ^6` for self-hosting, `@aws-sdk/client-s3 ^3` for S3 attachments), Node 18+ runtime, and the `await sdk.close()` shutdown contract that releases the MongoDB pool. Get this wrong and either methods throw at runtime or pools leak across serverless cold starts.

---

## 2. sdk.api.* (REST backend) (api)

**Impact:** HIGH
**Description:** 17 typed services that wrap the Velt REST API v2. Response envelope is `{ result: { status, message, data, ... } }`. Every method requires `organizationId` (write) or `organizationIds` (read). Service instances are available immediately — no async lazy-load.

---

## 3. sdk.selfHosting.* (MongoDB + S3) (selfhost)

**Impact:** HIGH
**Description:** 7 services backed by your own MongoDB (and optionally AWS S3 for attachments). Loader pattern: `const svc = await sdk.selfHosting.getXxx()` — instances cached after first call. Flat response envelope: `{ success, statusCode, data }` on success, `{ success: false, statusCode, error, errorCode }` on failure. Attachment uploads use a hybrid call shape — request object plus optional positional file args.

---

## 4. Data models (models)

**Impact:** HIGH
**Description:** TypeScript shapes for comment annotations and metadata used by both `sdk.api.commentAnnotations` and `sdk.selfHosting` services. Includes `PartialCommentAnnotation` (the update payload), `PartialComment`, `BaseMetadata`, `PartialTargetTextRange`, and round-trip dict helpers. Getting field names or semantics wrong (especially `resolvedByUserId`'s three-state contract) causes silent data corruption.

---

## 5. Cross-cutting pitfalls (pitfalls)

**Impact:** MEDIUM
**Description:** The traps that don't fit cleanly into one backend: `getToken` is positional on both backends; `sdk.selfHosting.token` is a synchronous property (no loader); typed error class discrimination via `instanceof`; envelope-confusion symptoms (`result.success is undefined` etc).
