---
title: Structure Backend API Routes for Data Provider Endpoints
impact: MEDIUM
impactDescription: Consistent route structure for all data provider operations
tags: api, routes, backend, REST, endpoint, structure
---

## Structure Backend API Routes for Data Provider Endpoints

Use a consistent route pattern `/api/velt/{provider}/{operation}` for all data provider endpoints. Each route must extract context metadata (documentId, organizationId) and return the standard response format.

**Incorrect (catch-all route with no structure):**

```js
// Single catch-all — hard to maintain and debug
app.post('/api/velt', async (req, res) => {
  const { type, operation, data } = req.body;
  // Complex routing logic in one handler
});
```

**Correct (structured route pattern):**

```
/api/velt/
├── comments/
│   ├── get      (POST)
│   ├── save     (POST)
│   └── delete   (POST)
├── reactions/
│   ├── get      (POST)
│   ├── save     (POST)
│   └── delete   (POST)
├── attachments/
│   ├── save     (POST, multipart/form-data)
│   └── delete   (POST, application/json)
├── recordings/
│   ├── get      (POST)
│   ├── save     (POST)
│   └── delete   (POST)
└── users/
    └── get      (POST)
```

**Generic route handler pattern:**

```js
// GET handler (comments, reactions, recordings)
async function handleGet(req, res, collection) {
  try {
    const { organizationId, documentIds, annotationIds } = req.body;
    const query = {};
    if (annotationIds?.length) query.annotationId = { $in: annotationIds };
    if (documentIds?.length) query.documentId = { $in: documentIds };
    if (organizationId) query.organizationId = organizationId;

    const items = await collection.find(query);
    const result = {};
    for (const item of items) {
      result[item.annotationId] = item;
    }

    res.json({ data: result, success: true, statusCode: 200 });
  } catch (error) {
    res.json({ data: null, success: false, statusCode: 500 });
  }
}

// SAVE handler (comments, reactions, recordings)
async function handleSave(req, res, collection) {
  try {
    const { annotations, context } = req.body;
    for (const [id, annotation] of Object.entries(annotations)) {
      await collection.upsert(
        { annotationId: id },
        { ...annotation, annotationId: id,
          documentId: context?.documentId,
          organizationId: context?.organizationId }
      );
    }
    res.json({ success: true, statusCode: 200 });
  } catch (error) {
    res.json({ data: null, success: false, statusCode: 500 });
  }
}

// DELETE handler (comments, reactions, recordings)
async function handleDelete(req, res, collection) {
  try {
    const { annotationId } = req.body;
    await collection.deleteOne({ annotationId });
    res.json({ success: true, statusCode: 200 });
  } catch (error) {
    res.json({ data: null, success: false, statusCode: 500 });
  }
}
```

**Key details:**
- All operations use POST method (not GET/PUT/DELETE) because the SDK sends JSON request bodies
- Attachment save is the exception — uses `multipart/form-data` (see attachment-multipart-provider rule)
- User endpoint only has `get` (no save/delete)
- Every response must include `{ data, success, statusCode }`
- Extract `documentId` and `organizationId` from request body or context for proper data scoping
- When using REST API to add/update comments externally, set `isCommentResolverUsed: true` and `isCommentTextAvailable: true`

**Verification:**
- [ ] Consistent route pattern across all providers
- [ ] All operations use POST method
- [ ] Context metadata (documentId, organizationId) extracted and stored
- [ ] Error responses return `success: false`
- [ ] Attachment save parses multipart/form-data

**Source Pointer:** https://docs.velt.dev/self-host-data/comments - Backend Example; https://docs.velt.dev/self-host-data/reactions - Backend Example
