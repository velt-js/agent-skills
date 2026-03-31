---
title: Return Standard Response Format from All Data Provider Handlers
impact: CRITICAL
impactDescription: SDK treats non-standard responses as failures and triggers retries
tags: response, format, success, statusCode, data, contract, resolver
---

## Return Standard Response Format from All Data Provider Handlers

Every data provider handler (endpoint or function) must return `{ data, success, statusCode }`. Missing any of these fields causes the SDK to treat the response as a failure and trigger retries.

**Incorrect (missing required fields):**

```js
// Missing 'success' and 'statusCode' — SDK treats as failure
app.post('/api/velt/comments/get', async (req, res) => {
  const comments = await db.getComments(req.body);
  res.json({ data: comments }); // WRONG: missing success and statusCode
});

// Wrong field name — 'status' instead of 'statusCode'
res.json({ data: comments, success: true, status: 200 }); // WRONG field name
```

**Correct (standard response format):**

```js
// Success response
app.post('/api/velt/comments/get', async (req, res) => {
  try {
    const comments = await db.getComments(req.body);
    res.json({
      data: comments,      // The payload (object, array, or null)
      success: true,       // Boolean — must be true/false, not truthy/falsy
      statusCode: 200      // Number — HTTP-style status code
    });
  } catch (error) {
    res.json({
      data: null,
      success: false,
      statusCode: 500
    });
  }
});
```

**For function-based providers** (same format returned from the resolver):

```jsx
const fetchCommentsFromDB = async (request) => {
  try {
    const response = await fetch('/api/velt/comments/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const result = await response.json();
    return {
      data: result.data,
      success: true,
      statusCode: 200
    };
  } catch (error) {
    return {
      data: null,
      success: false,
      statusCode: 500
    };
  }
};
```

**Response format by operation:**

| Operation | `data` field contains |
|-----------|----------------------|
| get (comments/reactions/recordings) | `Record<string, Annotation>` — keyed by annotationId |
| get (users) | `Record<string, User>` — keyed by userId |
| save | Any (often `undefined` or `null`) |
| delete | Any (often `undefined` or `null`) |
| save (attachments) | `{ url: string }` — the stored file URL |

**Key details:**
- `success` must be a **boolean** (`true` or `false`), not a truthy value
- `statusCode` must be a **number** (200, 400, 500, etc.)
- For endpoint-based providers, the HTTP response body must contain these fields
- For function-based providers, the resolver function must return this object
- When using REST API to add/update comments externally, set `isCommentResolverUsed: true` and `isCommentTextAvailable: true` on the comment data

**Verification:**
- [ ] All handlers return `data`, `success`, and `statusCode` fields
- [ ] `success` is boolean, `statusCode` is number
- [ ] Error responses return `success: false` with appropriate statusCode
- [ ] Get operations return data keyed by annotationId or userId

**Source Pointer:** https://docs.velt.dev/self-host-data/comments; https://docs.velt.dev/self-host-data/attachments; https://docs.velt.dev/self-host-data/reactions
