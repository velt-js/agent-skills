# Velt Node Sdk Best Practices

**Version 0.2.4**  
Velt  
October 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Implementation guide for the Velt Node SDK (@veltdev/node 2.x) covering its two backends: sdk.api.* (REST API services) and sdk.selfHosting.* (self-hosted storage on MongoDB or PostgreSQL with S3 attachments). Emphasizes REST-only vs database initialization, response envelopes, token generation via sdk.api.accessControl.generateToken, resolver auth with verifyToken, the lazy-load pattern for self-hosting services, positional-arg surprises on getAttachment/saveAttachment, the typed error class hierarchy, field allowlists, and data models (PartialCommentAnnotation, BaseMetadata, resolvedByUserId three-state semantics).

---

## Table of Contents

1. [Initialization & lifecycle](#1-initialization-lifecycle) — **CRITICAL**
   - 1.1 [Initialize VeltSDK in the right mode and wire shutdown](#11-initialize-veltsdk-in-the-right-mode-and-wire-shutdown)

2. [sdk.api.* REST backend](#2-sdkapi-rest-backend) — **HIGH**
   - 2.1 [Drop unknown fields from REST writes with the FieldFilterOptions allowlist](#21-drop-unknown-fields-from-rest-writes-with-the-fieldfilteroptions-allowlist)
   - 2.2 [Read the sdk.api.* envelope correctly and use the right service namespace](#22-read-the-sdkapi-envelope-correctly-and-use-the-right-service-namespace)

3. [sdk.selfHosting.* MongoDB / PostgreSQL + S3](#3-sdkselfhosting-mongodb-postgresql-s3) — **HIGH**
   - 3.1 [Authenticate resolver requests with sdk.selfHosting.verifyToken](#31-authenticate-resolver-requests-with-sdkselfhostingverifytoken)
   - 3.2 [Configure the PostgreSQL self-hosting backend safely](#32-configure-the-postgresql-self-hosting-backend-safely)
   - 3.3 [Lazy-load self-hosting services and check the flat envelope](#33-lazy-load-self-hosting-services-and-check-the-flat-envelope)
   - 3.4 [Pass file bytes positionally to saveAttachment; getAttachment is purely positional](#34-pass-file-bytes-positionally-to-saveattachment-getattachment-is-purely-positional)

4. [Data models](#4-data-models) — **HIGH**
   - 4.1 [Use Correct PartialCommentAnnotation and BaseMetadata Shapes in Self-Hosting Handlers](#41-use-correct-partialcommentannotation-and-basemetadata-shapes-in-self-hosting-handlers)

5. [Cross-cutting pitfalls](#5-cross-cutting-pitfalls) — **MEDIUM**
   - 5.1 [Generate tokens with accessControl.generateToken, check the right envelope, and catch typed errors](#51-generate-tokens-with-accesscontrolgeneratetoken-check-the-right-envelope-and-catch-typed-errors)

---

## 1. Initialization & lifecycle

**Impact: CRITICAL**

`VeltSDK.initialize(...)` shape (REST-only with no `database` block vs self-hosting with `database`), `database.type` (`mongodb` default or `postgresql`), env-var auth (`VELT_API_KEY` / `VELT_AUTH_TOKEN` / `VELT_WORKSPACE_*` / `AWS_*`), optional peer dependencies checked at `initialize()` (`mongodb ^6` or `pg ^8.16`, plus `@aws-sdk/client-s3 ^3` and `jose ^5`), Node 18+ runtime, and the `await sdk.close()` shutdown contract that releases the database pool. Get this wrong and the SDK fails at startup, methods throw at runtime, or pools leak.

### 1.1 Initialize VeltSDK in the right mode and wire shutdown

**Impact: CRITICAL (A database block without its driver fails at initialize(); no database block makes every sdk.selfHosting.* call throw; missing shutdown leaks the connection pool)**

`VeltSDK.initialize()` has two valid shapes. Since `@veltdev/node` 2.0.0 the `database` block is optional, and the SDK checks its driver at startup, so picking the wrong shape fails either at `initialize()` or at the first `sdk.selfHosting.*` call.

**Install.** The core package carries no database driver. `mongodb` and `pg` are optional peer dependencies; install only the one you self-host on. Node.js 18+.

```bash
npm install @veltdev/node                 # REST API backend only
npm install @veltdev/node mongodb         # + self-hosting on MongoDB (MongoDB 6+, mongodb ^6)
npm install @veltdev/node pg              # + self-hosting on PostgreSQL (PostgreSQL 14+, pg ^8.16)
npm install @aws-sdk/client-s3            # only if attachments go to S3
npm install jose@^5                       # only for the built-in JWT/JWKS verifyToken path
```

**Incorrect (1.x habits that break on 2.x):**

```ts
// WRONG: a placeholder database block "just to satisfy initialize()" when you only call sdk.api.*.
// On 2.x the driver is checked at initialize(): without `mongodb` installed this throws
// "MongoDB support requires 'npm install mongodb'".
const sdk = VeltSDK.initialize({
  database: { host: 'localhost:27017', database_name: 'unused' },
  apiKey: process.env.VELT_API_KEY!,
  authToken: process.env.VELT_AUTH_TOKEN!,
});

// WRONG: a database type the SDK does not know. Throws at initialize().
VeltSDK.initialize({ database: { type: 'mysql', connection_string: '...' } });
```

**Correct (REST-only, no database block):**

```ts
import { VeltSDK } from '@veltdev/node';

const sdk = VeltSDK.initialize({
  apiKey: process.env.VELT_API_KEY!,
  authToken: process.env.VELT_AUTH_TOKEN!,
});

const result = await sdk.api.organizations.getOrganizations({ organizationIds: ['org-123'] });
```

On an SDK initialized without `database`, every `sdk.selfHosting.*` method throws a `VeltDatabaseError` saying a `database` block is required.

**Correct (self-hosting on MongoDB or PostgreSQL):**

```ts
const sdk = VeltSDK.initialize({
  database: {
    // MongoDB is the default type. A connection string alone is enough;
    // the database name comes from its path.
    connection_string: 'mongodb+srv://user:pass@cluster.mongodb.net/velt-db',

    // PostgreSQL instead:
    // type: 'postgresql',
    // connection_string: 'postgresql://user:pass@host:5432/velt',
  },
  apiKey: process.env.VELT_API_KEY!,
  authToken: process.env.VELT_AUTH_TOKEN!,
});
```

- `type` is `'mongodb'` (default) or `'postgresql'`. Every `sdk.selfHosting.*` method behaves the same on both. See `selfhost-postgresql-backend` for PostgreSQL-only options.
- MongoDB also accepts individual fields (`host`, `username`, `password`, `auth_database`, `database_name`, optional `use_srv`). `database_name` overrides the database named in `connection_string` on both backends.
- `pool_min_size` (default 1) and `pool_max_size` (default 5) apply to both backends and are validated at `initialize()`.

**Environment variables.** `VELT_API_KEY` and `VELT_AUTH_TOKEN` can replace `apiKey` / `authToken` in the config object. `VELT_WORKSPACE_ID` and `VELT_WORKSPACE_AUTH_TOKEN` scope workspace operations. `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET_NAME`, and `AWS_S3_ENDPOINT_URL` (MinIO or another custom endpoint) configure S3 attachments. Prefer env vars in production.

**Shutdown.** Call `await sdk.close()` when the process exits to release the database connection pool. Initialize the SDK once at module scope, not per request. A second SDK instance pointed at a different database throws at its first `sdk.selfHosting.*` call unless the first instance was closed with `await sdk.close()`.

```ts
process.on('SIGTERM', async () => {
  await sdk.close();
  process.exit(0);
});
```

Both ES module (`import { VeltSDK } from '@veltdev/node'`) and CommonJS (`require('@veltdev/node')`) entry points ship; on 2.0.0 the ESM import loads on every supported Node version, including Node 18 and Node 20 before 20.19.

**Verification:**
- [ ] REST-only services initialize without a `database` block (no placeholder config)
- [ ] `database` is present whenever any `sdk.selfHosting.*` call exists, and its driver (`mongodb` or `pg`) is in `dependencies`
- [ ] `database.type` is omitted (MongoDB) or exactly `'postgresql'`
- [ ] `apiKey` and `authToken` come from env vars or a secret store in production
- [ ] `await sdk.close()` runs on shutdown, and only one SDK instance per database is kept alive
- [ ] `@aws-sdk/client-s3` is installed if any attachment upload goes to S3

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/node#installation - "Installation" and "Upgrading from 1.x"
- https://docs.velt.dev/backend-sdks/node#quick-start - "Initialize the SDK", "Shutdown"
- https://docs.velt.dev/backend-sdks/node#self-hosting-configuration - "Database"
- https://docs.velt.dev/release-notes/version-5/velt-node-changelog - "2.0.0"

---

## 2. sdk.api.* REST backend

**Impact: HIGH**

17 documented typed services that wrap the Velt REST API v2 (`agents` and `memory` stay hidden in the docs). Response envelope is `{ result: { status, message, data, ... } }`. Organization-scoped methods carry `organizationId` (or `organizationIds` on list reads). Service instances are available immediately, with no async lazy-load and no `database` block. The `activities` / `commentAnnotations` / `notifications` add/update methods accept an optional `FieldFilterOptions` second argument (`{ filterUnknownFields: true }`) to drop unknown keys before the write.

### 2.1 Drop unknown fields from REST writes with the FieldFilterOptions allowlist

**Impact: MEDIUM (Opt-in payload narrowing keeps custom/unknown keys out of Velt REST writes; fail-open so a write is never blocked)**

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

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/node#field-allowlist - "Field Allowlist" (FieldFilterOptions, exported `pickKnownFields` / `filterRequest` / `FilterSpec`, per-endpoint specs)

---

### 2.2 Read the sdk.api.* envelope correctly and use the right service namespace

**Impact: HIGH (Wrong envelope check silently mis-reads every response; wrong service or method name is a runtime "is not a function")**

Every `sdk.api.*` method takes a typed request object and returns the raw Velt REST envelope. Service instances are available immediately after `VeltSDK.initialize({ apiKey, authToken })`; there is no `await sdk.api.getXxx()` loader (that pattern is `sdk.selfHosting.*` only), and no `database` block is needed.

**Envelope.** Success returns:

```ts
{ result: { status: 'success', message: '...', data: <payload>, /* pageToken? */ } }
```

Failures throw `VeltApiError`; they do not come back as `{ success: false }` (that is the self-hosting envelope).

**Incorrect:**

```ts
const result = await sdk.api.organizations.getOrganizations({ organizationIds: ['org-123'] });
if (result.success) { /* never runs: `success` is undefined on sdk.api.* responses */ }

await sdk.api.getDocuments({ organizationId: 'org-123' }); // invented loader-style call
```

**Correct:**

```ts
const result = await sdk.api.documents.addDocuments({
  organizationId: 'org-123',
  documents: [{ documentId: 'doc-1', documentName: 'My Document' }],
});
if (result.result.status !== 'success') throw new Error(result.result.message);
```

**Organization ID.** Velt isolates data per organization server-side. Organization-scoped methods carry `organizationId` (string) at the root of the request, or `organizationIds` (array) on list reads such as `getOrganizations`. Workspace methods use `VELT_WORKSPACE_ID` / `VELT_WORKSPACE_AUTH_TOKEN` when set.

**Documented namespaces** (the docs count 19 services; `sdk.api.agents` and `sdk.api.memory` are hidden in commented MDX, so do not use or document them as live APIs until they appear in the published Node SDK reference):

| # | Namespace | Methods |
|---|---|---|
| 1 | `sdk.api.organizations` | `addOrganizations`, `getOrganizations`, `updateOrganizations`, `deleteOrganizations`, `updateOrganizationDisableState` |
| 2 | `sdk.api.folders` | `addFolder`, `getFolders`, `updateFolder`, `deleteFolder`, `updateFolderAccess` |
| 3 | `sdk.api.documents` | `addDocuments`, `getDocuments`, `updateDocuments`, `deleteDocuments`, `moveDocuments`, `updateDocumentAccess`, `updateDocumentDisableState`, `migrateDocuments`, `migrateDocumentsStatus`, `getDocumentsCount` |
| 4 | `sdk.api.users` | `addUsers`, `getUsers`, `updateUsers`, `deleteUsers`, `getUsersCount`, `getDocUsers`, `addUserInvite`, `respondToUserInvite`, `getUserInvites`, `getUserInvitations`, `getInvitedPendingUsersCount` |
| 5 | `sdk.api.userGroups` | `addUserGroups`, `addUsersToGroup`, `deleteUsersFromGroup` |
| 6 | `sdk.api.notifications` | `addNotifications`, `getNotifications`, `updateNotifications`, `deleteNotifications`, `getNotificationConfig`, `setNotificationConfig` |
| 7 | `sdk.api.commentAnnotations` | `addCommentAnnotations`, `getCommentAnnotations`, `getCommentAnnotationsCount`, `updateCommentAnnotations`, `deleteCommentAnnotations`, `addComments`, `getComments`, `updateComments`, `deleteComments` |
| 8 | `sdk.api.activities` | `addActivities`, `getActivities`, `updateActivities`, `deleteActivities` |
| 9 | `sdk.api.accessControl` | `addPermissions`, `getPermissions`, `removePermissions`, `generateSignature`, `generateToken` |
| 10 | `sdk.api.crdt` | `addCrdtData`, `getCrdtData`, `updateCrdtData`, `deleteCrdtData` |
| 11 | `sdk.api.presence` | `addPresence`, `updatePresence`, `deletePresence` |
| 12 | `sdk.api.livestate` | `broadcastEvent` |
| 13 | `sdk.api.recordings` | `getRecordings` |
| 14 | `sdk.api.rewriter` | `askAi` |
| 15 | `sdk.api.gdpr` | `deleteAllUserData`, `getAllUserData`, `getDeleteUserDataStatus` |
| 16 | `sdk.api.workspace` | `createWorkspace`, `getWorkspace`, `createApiKey`, `updateApiKey`, `getApiKeys`, `getApiKeyMetadata`, `resetAuthToken`, `getAuthTokens`, `addDomains`, `deleteDomains`, `getDomains`, `getRequestedDomains`, `acceptRejectAdditionalUrlRequest`, `createDomainRequest`, `getEmailStatus`, `sendLoginLink`, `getEmailConfig`, `updateEmailConfig`, `copyApiKey`, `updateApiKeyConfig`, `getNotificationConfig`, `updateNotificationConfig`, `getPermissionProviderConfig`, `updatePermissionProviderConfig`, `getActivityConfig`, `updateActivityConfig`, `ensureWorkspaceAuthToken`, `getWebhookConfig`, `updateWebhookConfig`, `getAdvancedWebhookConfig`, `updateAdvancedWebhookConfig`, `getAdvancedWebhookEndpoints`, `createAdvancedWebhookEndpoint`, `updateAdvancedWebhookEndpoint`, `deleteAdvancedWebhookEndpoint`, `getAdvancedWebhookEndpointSecret` |
| 17 | `sdk.api.approval` | `createDefinition`, `updateDefinition`, `deleteDefinition`, `getDefinition`, `listDefinitions`, `dispatchExecution`, `cancelExecution`, `getExecution`, `getExecutionEvents`, `listExecutions`, `cancelStep`, `resolveStep`, `recordAgentResolution`, `recordReviewerDecision` |

There is no `sdk.api.token` namespace in the current docs; mint tokens with `sdk.api.accessControl.generateToken` (see `pitfalls-token-and-envelopes`).

**Behavior worth remembering:**
- `commentAnnotations.getCommentAnnotations()` accepts agent filters `agentId`, `executionId`, `agentType`, `agentSource`, `agentSuggestions`, `agentComments`. Supply at most one per request. They require advanced queries on the workspace; otherwise the API fails closed.
- `commentAnnotations.getCommentAnnotationsCount()` does not support agent filters and ignores them without an error, returning unfiltered totals. To count an agent-scoped subset, list with a filter and count the result.
- `commentAnnotations.deleteCommentAnnotations()` accepts `agentSuggestions`, `agentId`, and `agentUrls` (OR-matched pages); they combine. Without advanced queries, or when no `agentUrls` resolve, the delete fails closed and deletes nothing.
- `documents.getDocumentsCount()` accepts optional `folderId`, `excludeFolderDocs`, or metadata `filters` (same shape as `getDocuments`, max 10). `filters` cannot be combined with `excludeFolderDocs`. When filters are sent, check `data.filtersApplied`: `false` means `count` is an unfiltered fallback.
- `accessControl.getPermissions()` errors if any supplied folder or document ID does not resolve, unless you pass `skipResourceExistenceValidation: true`. On `addPermissions` / `removePermissions`, resources go under `permissions.resources` (the old top-level `resources` field was removed in 1.0.9).
- `gdpr.getAllUserData()` accepts `veltUserIds`, `veltAllOrganizations`, and a `uniqueId` correlation value.
- `crdt.deleteCrdtData()` deletes CRDT data for all editors in the document when `editorIds` is omitted.
- `notifications.getNotifications()` results respect comment visibility: a notification for a private comment is returned only to users who can see that comment.
- `approval.*` maps to `/v2/workflow/*`. Routing and loops are edges only: each edge has an `on` role (`'approve'`, `'reject'`, `'custom'` with a `when` predicate, `'exhausted'`, or the default `'always'`), and a rework loop is an `on: 'reject'` back-edge with `loop: { maxIterations }`. The `loops` array and per-node `onReject` were removed in 1.0.8. `deleteDefinition({ definitionId, purge: true })` hard-deletes the definition and its version snapshots. For workflow design guidance, see the Approval Engine skill.

**Verification:**
- [ ] Success checks read `result.result.status === 'success'` (not `result.success`)
- [ ] Organization-scoped requests carry `organizationId` (or `organizationIds` for list reads)
- [ ] No `await sdk.api.getXxx()` loaders, no `sdk.api.token`, no `sdk.api.agents` / `sdk.api.memory` calls
- [ ] Method name and namespace match the table above
- [ ] Agent-filtered counts are computed by listing, not by `getCommentAnnotationsCount`

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/node#rest-api-backend - "REST API Backend" (all service subsections)
- https://docs.velt.dev/backend-sdks/node#comment-annotations - "Comment Annotations" (agent filters)
- https://docs.velt.dev/backend-sdks/node#approval-workflows - "Approval Workflows" (Routing and loops, Triggers)
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltapiresponse-node - "VeltApiResponse (Node)"

---

## 3. sdk.selfHosting.* MongoDB / PostgreSQL + S3

**Impact: HIGH**

7 services backed by your own MongoDB or PostgreSQL (and optionally AWS S3 for attachments). Loader pattern: `const svc = await sdk.selfHosting.getXxx()`, cached after the first call. Flat response envelope: `{ success, statusCode, data }` on success, `{ success: false, statusCode, error, errorCode }` on failure. Attachment uploads use a hybrid call shape (request object plus optional positional file args). Also covers PostgreSQL TLS and schema management, the `sdk.selfHosting.database` adapter, and `verifyToken` resolver authentication.

### 3.1 Authenticate resolver requests with sdk.selfHosting.verifyToken

**Impact: HIGH (Resolver endpoints that skip verification accept any caller; treating verifyToken as authorization leaks data across tenants)**

Endpoint-based data providers (`getConfig` / `saveConfig` / `deleteConfig`) call your backend from the browser. `sdk.selfHosting.verifyToken` verifies the credential the Velt frontend forwards on those calls. It never opens or queries the database, never throws for a verification outcome (every failure returns `{ verified: false }`), and is authentication only: it returns claims verbatim and makes no authorization decision.

**Incorrect (trusting the request body, or wrapping verifyToken in try/catch as if it throws):**

```ts
app.post('/api/velt/comments/save', async (req, res) => {
  // WRONG: no credential check; anyone can write to any organization.
  const svc = await sdk.selfHosting.getComments();
  res.json(await svc.saveComments(req.body));
});

app.post('/api/velt/comments/get', async (req, res) => {
  try {
    await sdk.selfHosting.verifyToken({ headers: req.headers }); // WRONG: result ignored
  } catch {
    return res.status(401).end(); // never reached: verifyToken does not throw on failure
  }
  // ...
});
```

**Correct (configure resolverAuth once, branch on result.verified, then authorize yourself):**

```ts
const sdk = VeltSDK.initialize({
  database: { connection_string: process.env.VELT_DB_URL! },
  apiKey: process.env.VELT_API_KEY!,
  authToken: process.env.VELT_AUTH_TOKEN!,
  resolverAuth: {
    jwt: {
      algorithms: ['RS256'],   // required allowlist
      jwksUrl: 'https://your-idp.example.com/.well-known/jwks.json', // or publicKey (PEM) or secret (HS*)
      issuer: 'https://your-idp.example.com/',
      audience: 'your-api-audience',
      leeway: 5,
      require: ['exp'],
    },
    // or: verify: async (token, headers) => claims  (custom callback; takes priority over jwt)
    header: 'Authorization',   // default
    scheme: 'Bearer',          // default
  },
});

app.post('/api/velt/comments/save', async (req, res) => {
  const auth = await sdk.selfHosting.verifyToken({ headers: req.headers });
  if (!auth.verified) {
    return res.status(401).json({ error: auth.error, code: auth.errorCode });
  }
  // Authorization is your job: compare claims with the payload's organization.
  if (auth.claims?.org !== req.body.metadata?.organizationId) {
    return res.status(403).end();
  }
  const svc = await sdk.selfHosting.getComments();
  res.json(await svc.saveComments(req.body));
});
```

Per-call options override `resolverAuth` (the `jwt` block is deep-merged): `verifyToken({ token: rawToken })` or `verifyToken({ headers, jwt: { leeway: 30 } })`.

**Key details:**
- `npm install jose@^5` for the built-in JWT/JWKS path (pinned to v5 for Node 18). Without it, the JWT path returns `errorCode: 'DEPENDENCY_MISSING'`; the custom `verify` callback needs no dependency.
- Error codes (`RESOLVER_AUTH_ERROR_CODES`): `NOT_CONFIGURED`, `MISSING_TOKEN`, `EXPIRED`, `INVALID_SIGNATURE`, `CLAIM_MISMATCH`, `ALGORITHM_NOT_ALLOWED`, `KEY_RESOLUTION_FAILED`, `DEPENDENCY_MISSING`, `VERIFICATION_FAILED`.
- `alg=none` is always rejected; mixed symmetric and asymmetric allowlists are refused; a PEM in `jwt.secret` is refused; JWKS is fetched over HTTPS only and cached per URL for 5 minutes.
- `result.error` is generic and never contains the token or secret, so it is safe to return to the client.
- On the frontend, send the credential with the endpoint config's `headers` (static object or an async function resolved per request).

**Verification:**
- [ ] Every resolver route calls `verifyToken` and returns 401 when `result.verified` is false
- [ ] No try/catch is used as the failure signal; the code branches on `result.verified`
- [ ] `jwt.algorithms` is set explicitly; `jose@^5` is installed for the JWT path
- [ ] Tenant or user authorization is checked against `result.claims` after verification

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/node#verifytoken - "verifyToken" (Configuration, Usage, Error codes, Security guarantees)
- https://docs.velt.dev/self-hosting/partial/overview#async-headers-and-credentials - "Async headers and credentials"

---

### 3.2 Configure the PostgreSQL self-hosting backend safely

**Impact: HIGH (The default sslmode connects without TLS in Node, and a locked-down role without CREATE fails schema setup at first connection)**

`@veltdev/node` 2.0.0 added PostgreSQL as a second self-hosting backend. Set `database.type: 'postgresql'` and install `pg`; every `sdk.selfHosting.*` method then behaves as it does on MongoDB. The traps are TLS defaults, schema permissions, and per-process pools.

**Incorrect (remote database with defaults, app role without CREATE):**

```ts
const sdk = VeltSDK.initialize({
  database: {
    type: 'postgresql',
    connection_string: 'postgresql://app:secret@db.example.com:5432/velt',
    // sslmode defaults to 'prefer', which in Node connects WITHOUT TLS,
    // because node-postgres cannot fall back from TLS to plaintext.
    // manage_schema defaults to true: the first connection runs CREATE statements,
    // which fails if the role has no CREATE privilege on the schema.
  },
});
```

**Correct (verified TLS; schema applied by a migration role):**

```ts
import { VeltSDK, Config, postgresSchemaSql } from '@veltdev/node';

const database = {
  type: 'postgresql' as const,
  connection_string: 'postgresql://app:secret@db.example.com:5432/velt',
  sslmode: 'verify-full',          // libpq names: disable | allow | prefer | require | verify-ca | verify-full
  sslrootcert: '/etc/ssl/velt-ca.pem',
  schema: 'velt',                  // PostgreSQL schema that holds the tables (default 'public')
  manage_schema: false,            // the app role cannot create tables
  pool_max_size: 10,
  pool_timeout: 10,                // seconds a query waits for a pooled connection
};

// One-off, in a migration job: print the DDL for this exact config and run it as a migration role.
console.log(postgresSchemaSql(new Config({ database })));

// Application:
const sdk = VeltSDK.initialize({
  database,
  apiKey: process.env.VELT_API_KEY!,
  authToken: process.env.VELT_AUTH_TOKEN!,
});
```

**How storage works:**
- One table per collection (`comment_annotations`, `reaction_annotations`, `recorder_annotations`, `notifications`, `activities`, `attachments`, `users`), each with a single JSONB `data` column plus expression indexes on the fields the SDK queries. The `collections` option renames these tables.
- With `manage_schema: true` (default) the SDK creates the schema, tables, and indexes on first connection; the role needs `CREATE` on the schema. Concurrent starts coordinate through a per-schema advisory lock; a process that waits more than 60 seconds skips setup and logs a warning.
- `schema` is unrelated to `user_schema` (which maps user fields).
- `require` encrypts without verifying the certificate (it verifies the CA when `sslrootcert` is set); `verify-ca` and `verify-full` verify it. An unknown `sslmode` fails at `initialize()`.
- Each process opens its own pool, so Node `cluster`, PM2, or several containers open one pool per worker. Size `pool_max_size` against the server's connection limit.
- The SDK does not migrate data between MongoDB and PostgreSQL.

**Direct database access.** `await sdk.selfHosting.database` resolves to the connected `DatabaseAdapter` (`MongoDBAdapter` or `PostgresAdapter`) with `find`, `findOne`, `insertOne`, `updateOne`, `updateMany`, `deleteOne`, and `deleteMany`. Use it for a readiness check or to seed data the resolvers do not write, such as users. Pass collection names as configured in `collections`. On PostgreSQL the adapter supports only the operators the SDK uses: equality, `$in`, `$nin`, `$eq`, `$ne`, `$exists`, and top-level `$and` / `$or`.

```ts
const db = await sdk.selfHosting.database;
await db.insertOne('users', { userId: 'user-1', name: 'John Doe', email: 'john@example.com' });
```

**Verification:**
- [ ] `pg` is installed and `database.type` is `'postgresql'`
- [ ] Any database not on the same host uses `sslmode: 'verify-full'` with `sslrootcert`
- [ ] Either the role has `CREATE` on the schema, or `manage_schema: false` and the `postgresSchemaSql()` output was applied by a migration role
- [ ] `pool_max_size` times the number of worker processes fits the server's connection limit
- [ ] `sdk.selfHosting.database` queries on PostgreSQL use only the supported operators

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/node#self-hosting-configuration - "Database" (PostgreSQL tab, "How PostgreSQL storage works")
- https://docs.velt.dev/backend-sdks/node#self-hosting-backend - "`sdk.selfHosting.database`"
- https://docs.velt.dev/release-notes/version-5/velt-node-changelog - "2.0.0"

---

### 3.3 Lazy-load self-hosting services and check the flat envelope

**Impact: HIGH (Forgetting `await` returns a Promise (next call throws "is not a function"); reading the wrong envelope key silently mis-judges every result)**

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

---

### 3.4 Pass file bytes positionally to saveAttachment; getAttachment is purely positional

**Impact: HIGH (Putting file bytes inside the request object skips the S3 upload, and on 2.x a save with neither a file URL nor file data returns 400)**

Attachments is the one self-hosting service that mixes a request object with positional file arguments, and since `@veltdev/node` 2.0.0 it stores a closed set of fields.

**`saveAttachment(request, fileData?, fileName?, mimeType?)`.** The request object goes first; the next three are optional positional arguments. Pass them when the SDK should upload the body to S3.

**Incorrect:**

```ts
const svc = await sdk.selfHosting.getAttachments();

// WRONG: file bytes inside the request object are not a stored field; nothing is uploaded,
// and with no `file` URL either, 2.x returns 400.
await svc.saveAttachment({
  metadata: { organizationId: 'org-123', documentId: 'doc-1' },
  attachment: { attachmentId: 12345, name: 'document.pdf', mimeType: 'application/pdf' },
  fileData: fileBuffer,
});

// WRONG: object-style getAttachment
await svc.getAttachment({ organizationId: 'org-123', attachmentId: 12345 });
```

**Correct:**

```ts
const svc = await sdk.selfHosting.getAttachments();

const r = await svc.saveAttachment(
  {
    metadata: { organizationId: 'org-123', documentId: 'doc-1' },
    attachment: { attachmentId: 12345, name: 'document.pdf', mimeType: 'application/pdf' },
  },
  fileBuffer,        // positional Buffer, uploaded to S3
  'document.pdf',    // positional
  'application/pdf', // positional
);
// → { success: true, statusCode: 200, data: { url: 'https://s3.amazonaws.com/...' } }

// Purely positional; attachmentId is a number.
const got = await svc.getAttachment('org-123', 12345);
// → data: { attachmentId, file: 'https://...', name, mimeType, metadata: { organizationId, documentId } }

// Request object; removes the stored record and the S3 object, if any.
await svc.deleteAttachment({ attachmentId: 12345, metadata: { organizationId: 'org-123' } });
```

**What 2.x stores (closed set).** `attachmentId`, `file` (the URL), `name`, `mimeType`, and `metadata` with only `organizationId`, `documentId`, `folderId`, `attachmentId`, `commentAnnotationId`, `apiKey`. Any other field (for example `size`), a top-level `url`, and null metadata keys are not stored. A save without a `file` URL or file data returns 400. Read the stored URL from `data.file` on `getAttachment`, not `data.url`.

**Prereqs for S3 uploads:**
- `@aws-sdk/client-s3` ^3 installed
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET_NAME` set
- `AWS_S3_ENDPOINT_URL` when using MinIO or another custom S3 endpoint

**Verification:**
- [ ] `saveAttachment` passes the file buffer as the second argument, never inside the request object
- [ ] Every save supplies either file data or an `attachment.file` URL
- [ ] Code does not rely on extra attachment fields (such as `size`) or a top-level `url` being persisted
- [ ] `getAttachment` is called with two positional args, `attachmentId` numeric, and reads `data.file`
- [ ] AWS env vars and `@aws-sdk/client-s3` are present wherever a buffer upload runs

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/node#attachments - "Attachments" (getAttachment, saveAttachment, deleteAttachment)
- https://docs.velt.dev/backend-sdks/node#installation - "Upgrading from 1.x"

---

## 4. Data models

**Impact: HIGH**

TypeScript shapes for comment annotation PII and metadata used in `sdk.selfHosting` resolver handlers (not the REST `updateCommentAnnotations` payload, which uses `annotationIds` + `updatedData`). Includes `PartialCommentAnnotation` (the update payload), `PartialComment`, `BaseMetadata`, `PartialTargetTextRange`, and round-trip dict helpers. Getting field names or semantics wrong (especially `resolvedByUserId`'s three-state contract) causes silent data corruption.

### 4.1 Use Correct PartialCommentAnnotation and BaseMetadata Shapes in Self-Hosting Handlers

**Impact: HIGH (Wrong field names or resolvedByUserId semantics cause silent data corruption when persisting resolver payloads)**

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

---

## 5. Cross-cutting pitfalls

**Impact: MEDIUM**

The traps that don't fit cleanly into one backend: token generation moved to `sdk.api.accessControl.generateToken` (the positional `getToken` is no longer documented); typed error class discrimination via `instanceof`; envelope-confusion symptoms (`result.success is undefined` etc).

### 5.1 Generate tokens with accessControl.generateToken, check the right envelope, and catch typed errors

**Impact: MEDIUM-HIGH (Calling the removed getToken is a runtime "is not a function"; wrong envelope checks silently misread results; untyped catches lose structured error info)**

Three cross-cutting traps that come up across both backends.

#### 1. Mint frontend tokens with `sdk.api.accessControl.generateToken`

The Node SDK docs no longer document `sdk.api.token.getToken` or `sdk.selfHosting.token.getToken`. Token generation is `sdk.api.accessControl.generateToken`, which calls `POST /v2/auth/generate_token`. It takes a request object like every other `sdk.api.*` method, works on a REST-only SDK (no `database` block), and returns the REST envelope.

**Incorrect (positional getToken from older docs):**

```ts
// WRONG: removed from the docs; positional args; flat { success, data } envelope.
const r = await sdk.api.token.getToken('org-123', 'user-1', 'a@b.com', false);
const r2 = await sdk.selfHosting.token.getToken('org-123', 'user-1');
```

**Correct:**

```ts
const r = await sdk.api.accessControl.generateToken({
  userId: 'user-1',
  userProperties: { name: 'John Doe', email: 'john@example.com', isAdmin: false },
  permissions: {
    resources: [
      { type: 'organization', id: 'org-123', accessRole: 'viewer' },
      { type: 'document', id: 'doc-1', organizationId: 'org-123', accessRole: 'editor' },
    ],
  },
});
const token = r.result.data.token; // { result: { status, message, data: { token } } }
```

Return the token to the frontend auth provider (`authProvider.generateToken`). Never ship `apiKey` / `authToken` to the browser.

#### 2. Typed error classes: discriminate with `instanceof`

Five exports form a hierarchy: `VeltSDKError` (base) with subclasses `VeltDatabaseError` (database connection or query failures, including calling `sdk.selfHosting.*` without a `database` block), `VeltValidationError`, `VeltTokenError`, and `VeltApiError` (REST call failures). Check `instanceof`, not `err.name` or `err.message`, and order specific-to-general:

```ts
import {
  VeltDatabaseError, VeltValidationError, VeltTokenError, VeltApiError, VeltSDKError,
} from '@veltdev/node';

try {
  await sdk.api.organizations.getOrganizations({ organizationIds: ['org-123'] });
} catch (err) {
  if (err instanceof VeltValidationError) { /* fix the request */ }
  else if (err instanceof VeltDatabaseError) { /* database down or not configured */ }
  else if (err instanceof VeltApiError) { /* REST call failed */ }
  else if (err instanceof VeltTokenError) { /* token generation failed */ }
  else if (err instanceof VeltSDKError) { /* catch-all for other SDK errors */ }
  else throw err;
}
```

#### 3. `sdk.selfHosting.*` failures can come back as values

Self-hosting methods also return failures in the envelope instead of throwing. Check `success` before reading `data`:

```ts
const svc = await sdk.selfHosting.getComments();
const r = await svc.getComments({ organizationId: '', documentIds: ['doc-1'] });
if (!r.success) {
  switch (r.errorCode) {
    case 'INVALID_INPUT': /* e.g. empty organizationId returns 400 on 2.x */ break;
    case 'NOT_FOUND': /* surface 404 */ break;
    case 'INTERNAL_ERROR': /* retry or log */ break;
  }
}
```

#### Envelope cheat sheet

| Backend | Success | Failure |
|---|---|---|
| `sdk.api.*` | `{ result: { status: 'success', message, data, ... } }` | Throws `VeltApiError` (or another `VeltSDKError` subclass) |
| `sdk.selfHosting.*` | `{ success: true, statusCode: 200, data }` | Returns `{ success: false, statusCode, error, errorCode }` or throws a `VeltSDKError` subclass |

Symptom: `result.success is undefined` on an `sdk.api.*` call means you wrote the self-hosting check. `result.result is undefined` on an `sdk.selfHosting.*` call means you wrote the REST check.

**Verification:**
- [ ] No `getToken(...)` calls and no `sdk.api.token` / `sdk.selfHosting.token` references remain
- [ ] Tokens come from `sdk.api.accessControl.generateToken({ userId, userProperties, permissions })` and are read from `result.result.data.token`
- [ ] `instanceof` chains go specific-to-general, with `VeltSDKError` last
- [ ] `sdk.selfHosting.*` callers check `result.success` before reading `result.data`

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/node#generatetoken - "Access Control > generateToken"
- https://docs.velt.dev/backend-sdks/node#error-handling - "Error Handling"
- https://docs.velt.dev/api-reference/rest-apis/v2/auth/generate-token - "Generate Token"

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/backend-sdks/node
- https://docs.velt.dev/api-reference/sdk/models/data-models
- https://www.npmjs.com/package/@veltdev/node
- https://docs.velt.dev/release-notes/version-5/velt-node-changelog
- https://docs.velt.dev/api-reference/rest-apis/v2/auth/generate-token
