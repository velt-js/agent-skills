---
title: Provision Workspaces and API Keys with Workspace-Level Auth
impact: MEDIUM
impactDescription: Production keys are gated and region choice is fixed at creation; the wrong auth pair or region string fails the call
tags: rest, api, workspace, apikey, production, testing, persistenceDBRegion, region, data-residency, authtokens, apikeyconfig, aiModelApiKey
---

## Provision Workspaces and API Keys with Workspace-Level Auth

`/v2/workspace/create` is public and returns a workspace ID and workspace auth token. API key management (`apikey/create`, `apikey/update`, `apikeys/get`, `authtokens/get`, `authtoken/reset`) uses those as **workspace-level** headers (`x-velt-workspace-id`, `x-velt-workspace-auth-token`). Per-key settings (`apikeyconfig/*`, `domains/*`, `webhookconfig/*`, `emailconfig/*`) then use the **API-key-level** pair.

**Incorrect (API-key headers on a workspace-level endpoint, region on a testing key):**

```bash
curl -X POST https://api.velt.dev/v2/workspace/apikey/create \
  -H 'Content-Type: application/json' \
  -H 'x-velt-api-key: velt_api_key_1' \
  -H 'x-velt-auth-token: your_auth_token' \
  -d '{ "data": { "ownerEmail": "owner@example.com", "type": "testing", "persistenceDBRegion": "eur3" } }'
```

**Correct (workspace-level headers; region only on a production key):**

```bash
curl -X POST https://api.velt.dev/v2/workspace/apikey/create \
  -H 'Content-Type: application/json' \
  -H 'x-velt-workspace-id: workspace_abc123' \
  -H 'x-velt-workspace-auth-token: your_workspace_auth_token' \
  -d '{
    "data": {
      "ownerEmail": "owner@example.com",
      "type": "production",
      "apiKeyName": "EU Production Key",
      "persistenceDBRegion": "eur3",
      "createAuthToken": true
    }
  }'
# -> { "result": { "status": "success", "data": { "apiKey": "your_new_api_key" } } }
```

### Create a workspace (public)

```bash
POST https://api.velt.dev/v2/workspace/create
{ "data": { "ownerEmail": "owner@example.com", "name": "John Doe", "workspaceName": "My Workspace" } }
# -> result.data: { id, name, owner, authToken, apiKeyList: { "velt_api_key_1": { id, apiKeyName, type: "testing" } } }
```

- `apiKeyList` is a keyed object, not an array: read the first key with `Object.keys(result.data.apiKeyList)[0]`.
- Disposable email domains are blocked and the endpoint is IP rate limited. One email can own up to 5 workspaces; additional workspaces require the root workspace to be on a paid plan.
- Read that key's auth token with `/v2/workspace/authtokens/get` (`{ "data": { "apiKey": "velt_api_key_1" } }`) before calling API-key-level endpoints.

### API keys: testing vs. production

| Field | Notes |
|-------|-------|
| `ownerEmail`, `type` | Required. `type` is `"testing"` or `"production"` |
| `persistenceDBRegion` | Production only. Any region from Supported Regions, such as `us-central1`, `europe-west1`, or the multi-regions `eur3` / `nam5`. Omit for the default North America region |
| `createAuthToken` | Recommended `true` |
| `apiKeyName`, `allowedDomains`, `addLocalHostToAllowedDomains` | Optional setup |
| `useEmailService`, `useWebhookService`, `useNotificationService` | Service toggles, with `emailServiceConfig` / `webhookServiceConfig` |
| `setDefaultNotificationTriggers`, `setDefaultEmailTriggers` | Seed default triggers when enabling those services |
| `enablePrivateComments`, `requireAutoOrgUser` | Initial flags |

Production key creation is gated: the workspace must be enabled for self-serve production keys and be on a paid plan. Errors to handle:

| Status | When |
|--------|------|
| `INVALID_ARGUMENT` | Missing or invalid `ownerEmail` / `type`, or an unsupported (or empty-string) region |
| `PERMISSION_DENIED` | Invalid workspace credentials, or the workspace is not allowed to create production keys |
| `FAILED_PRECONDITION` | Production key requested before the workspace is on a paid plan |
| `RESOURCE_EXHAUSTED` | The workspace reached its maximum number of production keys |

Choose the region when you create the production key; persistent data (Comments, Notifications, Recordings, and so on) is stored there.

### Other workspace-level calls

```bash
POST https://api.velt.dev/v2/workspace/apikeys/get     { "data": { "pageSize": 50 } }        # paginate with nextPageToken
POST https://api.velt.dev/v2/workspace/apikey/update   { "data": { "apiKey": "velt_api_key_1", "apiKeyName": "Renamed" } }
POST https://api.velt.dev/v2/workspace/authtokens/get  { "data": { "apiKey": "velt_api_key_1" } }
POST https://api.velt.dev/v2/workspace/authtoken/reset { "data": { "apiKey": "velt_api_key_1" } }   # -> data.newAuthToken
```

### Per-key app config (API-key-level)

```bash
POST https://api.velt.dev/v2/workspace/apikeyconfig/update
{ "data": {
    "requireJwtToken": true,
    "defaultDocumentAccessType": "restricted",
    "aiModelApiKey": [ { "provider": "anthropic", "customerApiKey": "sk-ant-..." } ]
} }
```

- At least one field is required and unknown fields are rejected. Writes merge; nothing is removed.
- `aiModelApiKey[].provider` is `openai`, `anthropic`, or `gemini`. Keys are encrypted at rest and returned only masked under `aiModelsConfig`. Review agents then run model calls on your own provider keys (see `rest-agents-execution`).
- `defaultDocumentAccessType` is `public`, `restricted`, or `organizationPrivate`.

**Verification Checklist:**
- [ ] `apikey/create`, `apikey/update`, `apikeys/get`, `authtokens/get`, `authtoken/reset` use `x-velt-workspace-id` + `x-velt-workspace-auth-token`
- [ ] `apikeyconfig/*`, `domains/*`, `webhookconfig/*`, `emailconfig/*` use `x-velt-api-key` + `x-velt-auth-token`
- [ ] `persistenceDBRegion` is only sent with `type: "production"` and uses a name from Supported Regions
- [ ] Production key errors (`PERMISSION_DENIED`, `FAILED_PRECONDITION`, `RESOURCE_EXHAUSTED`) are surfaced, not retried
- [ ] `apiKeyList` from `/workspace/create` is read as an object, not an array
- [ ] Workspace and API auth tokens are stored server-side only

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/create - "Create Workspace"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/apikey-create - "Create API Key"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/apikeys-get - "Get API Keys"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/apikey-update - "Update API Key"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/authtokens-get - "Get Auth Tokens"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/authtoken-reset - "Reset Auth Token"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/apikeyconfig-update - "Update API Key Config"
- https://docs.velt.dev/security/supported-regions - "Supported Regions"
