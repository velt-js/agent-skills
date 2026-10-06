---
title: Read the sdk.api.* envelope correctly and use the right service namespace
impact: HIGH
impactDescription: Wrong envelope check silently mis-reads every response; wrong service or method name is a runtime "is not a function"
tags: sdk.api, response-envelope, VeltApiResponse, organizationId, services-reference, approval, agent-filters, getDocumentsCount, skipResourceExistenceValidation
---

## Read the sdk.api.* envelope correctly and use the right service namespace

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
