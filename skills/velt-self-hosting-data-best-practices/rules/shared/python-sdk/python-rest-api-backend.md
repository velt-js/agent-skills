---
title: Use sdk.api.* for REST API Operations Without a Database
impact: HIGH
impactDescription: sdk.api.* needs only apiKey and authToken, so REST-only Python services skip database and AWS setup entirely
tags: python, rest-api, sdk.api, organizations, documents, users, notifications, workflow, filter_unknown_fields, field_allowlists, generateToken, agent-filters
---

## Use sdk.api.* for REST API Operations Without a Database

The `sdk.api.*` namespace calls Velt's REST APIs from Python with typed `@dataclass` requests and returns the raw response dict. It needs only `apiKey` and `authToken`; install plain `velt-py` (no database extra). Do not call the REST API with `requests` / `httpx` directly.

**Incorrect:**

```python
# WRONG: raw dicts instead of request dataclasses, snake_case method names, and no error check
sdk.api.organizations.add_organizations({'organizations': [...]})
result = sdk.api.documents.getDocuments({'organizationId': 'org-123'})
print(result['result']['data'])  # KeyError when the call failed
```

**Correct:**

```python
from velt_py import VeltSDK
from velt_py.models.organization import AddOrganizationsRequest
from velt_py.models.document import AddDocumentsRequest

sdk = VeltSDK.initialize({'apiKey': 'YOUR_VELT_API_KEY', 'authToken': 'YOUR_VELT_AUTH_TOKEN'})

result = sdk.api.organizations.addOrganizations(
    AddOrganizationsRequest(organizations=[{'organizationId': 'org-123', 'organizationName': 'My Org'}])
)
if 'error' in result:
    print('Failed:', result['error'])
else:
    print('Success:', result['result'])

sdk.api.documents.addDocuments(
    AddDocumentsRequest(organizationId='org-123', documents=[{'documentId': 'doc-1', 'documentName': 'My Doc'}])
)
```

**Documented services** (the docs count 19; `sdk.api.agents` and `sdk.api.memory` are hidden in commented MDX, so do not use or document them as live Python APIs):

| Service | Namespace | Notes |
|---------|-----------|-------|
| Organizations | `sdk.api.organizations` | |
| Folders | `sdk.api.folders` | |
| Documents | `sdk.api.documents` | `getDocumentsCount` |
| Users | `sdk.api.users` | invites: `addUserInvite`, `respondToInvite`, `getInvitedUsers`, `getUserInvitations`, `getInvitedPendingUsersCount`; also `getUsersCount`, `getDocUsers` |
| User Groups | `sdk.api.userGroups` | |
| Notifications | `sdk.api.notifications` | |
| Comment Annotations | `sdk.api.commentAnnotations` | agent filters |
| Activities | `sdk.api.activities` | |
| Access Control | `sdk.api.accessControl` | `generateToken` (see `python-token`) |
| CRDT | `sdk.api.crdt` | `deleteCrdtData` |
| Presence | `sdk.api.presence` | |
| Livestate | `sdk.api.livestate` | |
| Recordings | `sdk.api.recordings` | |
| Rewriter | `sdk.api.rewriter` | |
| GDPR | `sdk.api.gdpr` | |
| Workspace | `sdk.api.workspace` | includes `updateApiKeyMetadata`, domain requests, advanced webhooks |
| Workflow | `sdk.api.workflow` | Approval Engine, `/v2/workflow/*`, 14 methods |

There is no `sdk.api.token` namespace in the current docs. Python method names can differ from Node: Python uses `respondToInvite` / `getInvitedUsers` and `sdk.api.workflow` where Node uses `respondToUserInvite` / `getUserInvites` and `sdk.api.approval`.

**`filter_unknown_fields` (opt-in allowlist).** The add/update methods on `commentAnnotations` and `activities`, and `updateNotifications`, accept `filter_unknown_fields: bool = False` (backed by `velt_py.models.field_allowlists`). When `True`, unknown top-level keys in the request entity collections are dropped before sending; open-typed fields (`context`, `metadata`, `entityData`, user objects) pass through whole. It is fail-open: if filtering errors, the original payload is sent. `addNotifications` is not affected. On `updateNotifications`, `isRead` / `isArchived` are not accepted by the endpoint, so they are dropped when the flag is on.

```python
from velt_py.models.activity_api import AddActivitiesRequest

sdk.api.activities.addActivities(
    AddActivitiesRequest(
        organizationId='org-123', documentId='doc-456',
        activities=[{'featureType': 'comment', 'actionType': 'comment.add',
                     'actionUser': {'userId': 'user-1'}, 'internalTrackingId': 'abc-123'}],
    ),
    filter_unknown_fields=True,  # 'internalTrackingId' is removed before sending
)
```

**Behavior worth remembering:**
- `getCommentAnnotations` accepts agent filters (`agentId`, `executionId`, `agentType`, `agentSource`, `agentSuggestions`, `agentComments`), at most one per request; `deleteCommentAnnotations` accepts `agentId`, `agentUrls`, `agentSuggestions`, which combine. Both need advanced queries on the workspace and fail closed otherwise. Counts do not support agent filters.
- `getDocumentsCount(GetDocumentsCountRequest(...))` accepts `excludeFolderDocs`, `folderId`, or metadata `filters` (max 10); `filters` cannot be combined with `excludeFolderDocs`, and `filtersApplied: False` in the response means `count` is an unfiltered fallback.
- Workflow definitions express routing and loops as edges. Every `human` node needs an outgoing `on: 'reject'` edge. `loops` is deprecated: it is stripped before sending and raises a `DeprecationWarning`; use a reject back-edge with `{'loop': {'maxIterations': 3}}`. The delete-definition request accepts `purge` to hard-delete.
- Import request dataclasses from `velt_py.models.<domain>` (for example `organization`, `document`, `user_api`, `activity_api`, `access_control`, `workspace`, `workflow`).
- `sdk.api.*` and `sdk.selfHosting.*` can share one SDK instance when a `database` block is also configured.

**Verification Checklist:**
- [ ] `VeltSDK.initialize` has `apiKey` and `authToken` (or `VELT_API_KEY` / `VELT_AUTH_TOKEN`) and no `database` block for REST-only services
- [ ] Request dataclasses come from `velt_py.models.<domain>`; method names are camelCase and match the Python docs
- [ ] No `sdk.api.token`, `sdk.api.agents`, or `sdk.api.memory` calls
- [ ] `filter_unknown_fields=True` is passed as a keyword argument, not inside the request
- [ ] Workflow definitions use reject edges, not `loops`
- [ ] The `error` key is checked before reading `result`

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/python#rest-api-backend - "REST API Backend"
- https://docs.velt.dev/backend-sdks/python#workflow - "Workflow"
- https://docs.velt.dev/release-notes/version-5/velt-py-changelog - "v0.1.15", "v0.1.11"
