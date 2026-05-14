---
title: Use sdk.api.* for REST API Operations Without a Database
impact: HIGH
impactDescription: Using sdk.api.* eliminates the need for MongoDB/AWS setup when calling Velt APIs directly, reducing backend complexity significantly
tags: python, rest-api, sdk.api, organizations, documents, users, notifications
---

## Use sdk.api.* for REST API Operations Without a Database

The `sdk.api.*` namespace provides direct access to Velt's REST APIs from Python. It has feature parity with the Velt Node SDK and requires no MongoDB or AWS configuration — only `apiKey` and `authToken`. Use it when you need to manage Velt data server-side without self-hosting.

Do not call the Velt REST API directly with `requests` or `httpx` — the typed request dataclasses and the `sdk.api.*` namespace handle authentication headers, serialization, and error propagation for you.

**Correct (initialize for REST API use and call services):**

```python
from velt_py import VeltSDK
from velt_py.models.organization import AddOrganizationsRequest, GetOrganizationsRequest
from velt_py.models.document import AddDocumentsRequest

sdk = VeltSDK.initialize({
    'apiKey': 'YOUR_VELT_API_KEY',
    'authToken': 'YOUR_VELT_AUTH_TOKEN'
})

# Add an organization
result = sdk.api.organizations.addOrganizations(
    AddOrganizationsRequest(
        organizations=[{'organizationId': 'org-123', 'organizationName': 'My Org'}]
    )
)
if 'error' in result:
    print('Failed:', result['error'])
else:
    print('Success:', result['result'])

# Add documents to an organization
result = sdk.api.documents.addDocuments(
    AddDocumentsRequest(
        organizationId='org-123',
        documents=[{'documentId': 'doc-1', 'documentName': 'My Doc'}]
    )
)
```

**Available services under `sdk.api.*`:**

| Service | Namespace |
|---------|-----------|
| Organizations | `sdk.api.organizations` |
| Folders | `sdk.api.folders` |
| Documents | `sdk.api.documents` |
| Users | `sdk.api.users` |
| User Groups | `sdk.api.userGroups` |
| Notifications | `sdk.api.notifications` |
| Comment Annotations | `sdk.api.commentAnnotations` |
| Activities | `sdk.api.activities` |
| Access Control | `sdk.api.accessControl` |
| CRDT | `sdk.api.crdt` |
| Presence | `sdk.api.presence` |
| Livestate | `sdk.api.livestate` |
| Recordings | `sdk.api.recordings` |
| Rewriter | `sdk.api.rewriter` |
| GDPR | `sdk.api.gdpr` |
| Workspace | `sdk.api.workspace` |
| Token | `sdk.api.token` |

**Key points:**

- Import request dataclasses from `velt_py.models.<domain>` (e.g., `velt_py.models.organization`, `velt_py.models.document`, `velt_py.models.user_api`).
- All service methods use camelCase names matching the Velt Node SDK (e.g., `addOrganizations`, `getDocuments`, `deleteUsers`).
- Responses are dicts: `result['result']` on success, `result['error']` on failure. Always check for the `error` key before accessing `result`.
- `sdk.api.*` and `sdk.selfHosting.*` are independent — you can use both in the same initialized SDK instance if you also provide `database` config.

**Verification Checklist:**
- [ ] `VeltSDK.initialize` is called with at least `apiKey` and `authToken` (or env vars `VELT_API_KEY` / `VELT_AUTH_TOKEN`)
- [ ] Request dataclasses are imported from `velt_py.models.<domain>`, not constructed as raw dicts
- [ ] Service method names are camelCase (e.g., `addOrganizations`, not `add_organizations`)
- [ ] Response `error` key is checked before accessing `result`

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/python - Velt Python SDK REST API backend overview
