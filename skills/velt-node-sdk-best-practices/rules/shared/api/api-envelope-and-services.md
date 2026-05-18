---
title: Read the sdk.api.* envelope correctly and use the right service namespace
impact: HIGH
impactDescription: Wrong envelope check silently mis-reads every response; wrong service/method name is a runtime "is not a function"
tags: sdk.api, response-envelope, VeltApiResponse, organizationId, services-reference
---

## Read the sdk.api.* envelope correctly and use the right service namespace

Every `sdk.api.*` method returns the REST envelope and requires `organizationId`. Service instances are available immediately — there is no `await sdk.api.getXxx()` lazy-load (that pattern is `sdk.selfHosting.*` only).

**Envelope** — success returns:

```ts
{ result: { status: 'success', message: '...', data: <payload>, /* pageToken? nextPageToken? */ } }
```

Failures throw `VeltApiError` (catch with try/catch); they do NOT come back as `{ success: false }` — that's the self-hosting envelope. So:

```ts
// CORRECT
const result = await sdk.api.organizations.getOrganizations({ organizationIds: ['org-123'] });
if (result.result.status === 'success') { /* use result.result.data */ }

// WRONG — `result.success` is always undefined for sdk.api.*
if (result.success) { /* never runs */ }
```

**Organization ID** — read methods take `organizationIds` (plural array); write/single-org methods take `organizationId` (singular string) at the root of the request.

**Service-by-service method index** (17 namespaces):

| # | Namespace | Methods |
|---|---|---|
| 1 | `sdk.api.organizations` | `addOrganizations`, `getOrganizations`, `updateOrganizations`, `deleteOrganizations`, `updateOrganizationDisableState` |
| 2 | `sdk.api.folders` | `addFolder`, `getFolders`, `updateFolder`, `deleteFolder`, `updateFolderAccess` |
| 3 | `sdk.api.documents` | `addDocuments`, `getDocuments`, `updateDocuments`, `deleteDocuments`, `moveDocuments`, `updateDocumentAccess`, `updateDocumentDisableState`, `migrateDocuments`, `migrateDocumentsStatus` |
| 4 | `sdk.api.users` | `addUsers`, `getUsers`, `updateUsers`, `deleteUsers` |
| 5 | `sdk.api.userGroups` | `addUserGroups`, `addUsersToGroup`, `deleteUsersFromGroup` |
| 6 | `sdk.api.notifications` | `addNotifications`, `getNotifications`, `updateNotifications`, `deleteNotifications`, `getNotificationConfig`, `setNotificationConfig` |
| 7 | `sdk.api.commentAnnotations` | `addCommentAnnotations`, `getCommentAnnotations`, `getCommentAnnotationsCount`, `updateCommentAnnotations`, `deleteCommentAnnotations`, `addComments`, `getComments`, `updateComments`, `deleteComments` |
| 8 | `sdk.api.activities` | `addActivities`, `getActivities`, `updateActivities`, `deleteActivities` |
| 9 | `sdk.api.accessControl` | `addPermissions`, `getPermissions`, `removePermissions`, `generateSignature`, `generateToken` |
| 10 | `sdk.api.crdt` | `addCrdtData`, `getCrdtData`, `updateCrdtData` |
| 11 | `sdk.api.presence` | `addPresence`, `updatePresence`, `deletePresence` |
| 12 | `sdk.api.livestate` | `broadcastEvent` |
| 13 | `sdk.api.recordings` | `getRecordings` |
| 14 | `sdk.api.rewriter` | `askAi` |
| 15 | `sdk.api.gdpr` | `deleteAllUserData`, `getAllUserData`, `getDeleteUserDataStatus` |
| 16 | `sdk.api.workspace` | `createWorkspace`, `getWorkspace`, `createApiKey`, `updateApiKey`, `getApiKeys`, `getApiKeyMetadata`, `resetAuthToken`, `getAuthTokens`, `addDomains`, `deleteDomains`, `getDomains`, `getEmailStatus`, `sendLoginLink`, `getEmailConfig`, `updateEmailConfig`, `getWebhookConfig`, `updateWebhookConfig` |
| 17 | `sdk.api.token` | `getToken` (positional args — see `pitfalls-token-and-envelopes`) |

**Canonical call**:

```ts
const result = await sdk.api.documents.addDocuments({
  organizationId: 'org-123',
  documents: [{ documentId: 'doc-1', documentName: 'My Document' }],
});
if (result.result.status !== 'success') throw new Error(result.result.message);
```

Workspace and Token methods are workspace-scoped — they use `VELT_WORKSPACE_AUTH_TOKEN` and `VELT_WORKSPACE_ID` when set.

**Verification:**
- [ ] Success checks read `result.result.status === 'success'` (not `result.success`)
- [ ] Every method call carries `organizationId` (or `organizationIds` for read)
- [ ] No `await sdk.api.getXxx()` calls — those are invented
- [ ] Method name + namespace match the table above

**Source Pointer:** `backend-sdks/node.mdx` (REST API Backend → all 17 service subsections); `api-reference/sdk/models/data-models.mdx` (Node SDK Types → `VeltApiResponse`, per-service request/response types)
