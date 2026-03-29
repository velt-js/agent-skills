---
title: Use REST APIs to Manage CRDT Data Server-Side
impact: HIGH
impactDescription: Access, create, and update collaborative editor data from backend services
tags: rest-api, server-side, get-data, add-data, update-data, backend
---

## Use REST APIs to Manage CRDT Data Server-Side

Use the CRDT REST APIs to get, add, or update editor data from your backend. This enables server-side seeding of initial content, processing, export, indexing, or backup of collaborative content without requiring a client connection.

**Incorrect (client-only data access):**

```typescript
// Can only access CRDT data from client-side
const store = await createVeltStore({ id: 'doc', type: 'text', veltClient });
const value = store.getValue();
// No way to access or seed data from backend
```

**Correct (Get CRDT data via REST API):**

```bash
# Get CRDT data for a specific document/editor
curl -X POST https://api.velt.dev/v2/crdt/get \
  -H "Content-Type: application/json" \
  -H "x-velt-api-key: YOUR_API_KEY" \
  -H "x-velt-auth-token: YOUR_AUTH_TOKEN" \
  -d '{
    "data": {
      "organizationId": "org-id",
      "documentId": "doc-id",
      "editorId": "editor-id"
    }
  }'
```

**Correct (Add new CRDT data via REST API):**

```bash
# Create new CRDT editor data (errors if editorId already exists)
curl -X POST https://api.velt.dev/v2/crdt/add \
  -H "Content-Type: application/json" \
  -H "x-velt-api-key: YOUR_API_KEY" \
  -H "x-velt-auth-token: YOUR_AUTH_TOKEN" \
  -d '{
    "data": {
      "organizationId": "org-id",
      "documentId": "doc-id",
      "editorId": "editor-id",
      "data": "Hello, collaborative world!",
      "type": "text"
    }
  }'
```

**Correct (Update existing CRDT data via REST API):**

```bash
# Replace existing CRDT editor data (generates proper CRDT ops for connected clients)
curl -X POST https://api.velt.dev/v2/crdt/update \
  -H "Content-Type: application/json" \
  -H "x-velt-api-key: YOUR_API_KEY" \
  -H "x-velt-auth-token: YOUR_AUTH_TOKEN" \
  -d '{
    "data": {
      "organizationId": "org-id",
      "documentId": "doc-id",
      "editorId": "editor-id",
      "data": "Updated content!",
      "type": "text"
    }
  }'
```

**REST API Endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v2/crdt/get` | POST | Retrieve CRDT data. Omit `editorId` to get all editors in a document. |
| `/v2/crdt/add` | POST | Create new CRDT data. Errors with `ALREADY_EXISTS` if `editorId` exists. |
| `/v2/crdt/update` | POST | Replace existing CRDT data. Generates CRDT operations so connected clients pick up the change. |

**Add/Update Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `organizationId` | string | Yes | Organization ID |
| `documentId` | string | Yes | Document ID |
| `editorId` | string | Yes | Unique editor instance ID |
| `data` | string / object / array | Yes | Content matching the `type` |
| `type` | string | Yes | `text`, `map`, `array`, or `xml` |
| `contentKey` | string | No | Yjs content key (default: `content`, use `default` for TipTap) |

**Verification Checklist:**
- [ ] API key and auth token configured
- [ ] Correct organizationId, documentId, and editorId provided
- [ ] Use `/v2/crdt/add` for new editors and `/v2/crdt/update` for existing ones
- [ ] `data` field type matches the `type` field (string for text/xml, object for map, array for array)
- [ ] Response parsed according to your data type (text, map, array, xml)

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/crdt/get-crdt-data - Get CRDT Data
- https://docs.velt.dev/api-reference/rest-apis/v2/crdt/add-crdt-data - Add CRDT Data
- https://docs.velt.dev/api-reference/rest-apis/v2/crdt/update-crdt-data - Update CRDT Data
