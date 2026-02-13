---
title: Use REST API to Retrieve CRDT Data Server-Side
impact: HIGH
impactDescription: Access collaborative editor data from backend services
tags: rest-api, server-side, get-data, backend
---

## Use REST API to Retrieve CRDT Data Server-Side

Use the CRDT REST API to retrieve editor data from your backend. This enables server-side processing, export, indexing, or backup of collaborative content without requiring a client connection.

**Incorrect (client-only data access):**

```typescript
// Can only access CRDT data from client-side
const store = await createVeltStore({ id: 'doc', type: 'text', veltClient });
const value = store.getValue();
// No way to access from backend
```

**Correct (REST API for server-side access):**

```bash
# Get CRDT data for a specific document/editor
curl -X POST https://api.velt.dev/v2/crdt/data \
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

<!-- TODO (v4.7.1-beta.4): Verify exact response structure for Get CRDT Data REST API. Release note text: "Added Get CRDT Data REST API to retrieve editor data" but exact response format not specified in release notes. -->

**Verification Checklist:**
- [ ] API key and auth token configured
- [ ] Correct organizationId, documentId, and editorId provided
- [ ] Response parsed according to your data type (text, map, array, xml)

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/crdt/get-crdt-data - Get CRDT Data
