---
title: Branch on the Per-Item code When Bulk Document Calls Partially Fail
impact: HIGH
impactDescription: Retrying a v2 bulk document 500 on status alone loops forever on not-found or already-exists items
tags: rest, api, documents, partial-failure, retry, code, not-found, already-exists, internal, v1, v2
---

## Branch on the Per-Item code When Bulk Document Calls Partially Fail

The bulk document endpoints (add, update, delete, get with `documentIds`) report each item separately. On **v2**, if any item fails, the whole call returns **HTTP 500 `INTERNAL`** and the per-item breakdown sits in `error.details`, even when nothing broke on the server (for example, the document does not exist). Each failed entry carries a `code`; retry only items whose `code` is `internal`.

**Incorrect (retry on HTTP status):**

```javascript
async function deleteDocs(ids) {
  const res = await veltPost('/v2/organizations/documents/delete', {
    organizationId: 'org-123',
    documentIds: ids
  });
  if (res.status === 500) {
    // Loops forever when one of the IDs simply does not exist ("not-found").
    return deleteDocs(ids);
  }
}
```

**Correct (read `error.details` and retry only `internal` items):**

```javascript
async function deleteDocs(ids, attempt = 0) {
  const res = await fetch('https://api.velt.dev/v2/organizations/documents/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-velt-api-key': process.env.VELT_API_KEY,
      'x-velt-auth-token': process.env.VELT_AUTH_TOKEN
    },
    body: JSON.stringify({ data: { organizationId: 'org-123', documentIds: ids } })
  });
  const json = await res.json();
  if (!json.error) return json.result.data; // every item succeeded

  // v2 add/update/delete: details is a map keyed by the document IDs you sent
  const details = json.error.details ?? {};
  const retryable = Object.entries(details)
    .filter(([, item]) => item.success === false && item.code === 'internal')
    .map(([id]) => id);
  const permanent = Object.entries(details)
    .filter(([, item]) => item.success === false && item.code !== 'internal');

  permanent.forEach(([id, item]) => console.warn(`Skipping ${id}: ${item.code}`));
  if (retryable.length && attempt < 3) return deleteDocs(retryable, attempt + 1);
}
```

### Where the per-item result lives

| Endpoint | v2 (`/v2/organizations/documents/*`) | v1 (`/v1/organizations/documents/*`) |
|----------|--------------------------------------|--------------------------------------|
| `add` | HTTP 500; `error.details` map keyed by document ID | Not documented |
| `update` | HTTP 500; `error.details` map keyed by document ID | HTTP 200; per-item entries in `result.data` |
| `delete` | HTTP 500; `error.details` map keyed by document ID | HTTP 200; per-item entries in `result.data` |
| `get` (with `documentIds`) | HTTP 500; `error.details` **array** in request order | Not documented |

A v2 success response contains only successful items. On v1 update and delete, check `success` on every entry because the HTTP status stays 200.

### Per-item `code` values

| `code` | Endpoints | Meaning | Retry? |
|--------|-----------|---------|--------|
| `already-exists` | add | A document with this ID already exists | No |
| `not-found` | update, delete, get | The document does not exist | No |
| `internal` | all | A genuine server-side failure | Yes |

Because a missing document makes v2 `get` return 500, `get` is not a clean existence check: read the per-item `code` to tell "does not exist" from a real failure.

**Verification Checklist:**
- [ ] Bulk document callers parse `error.details` on v2 instead of treating every 500 as transient
- [ ] `get` with `documentIds` reads `error.details` as an array in request order; add/update/delete read it as a map keyed by document ID
- [ ] Only items with `code: "internal"` are retried, with a bounded attempt count
- [ ] `not-found` and `already-exists` items are logged or reconciled, never retried
- [ ] v1 update/delete callers check `success` on every `result.data` entry even on HTTP 200

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/documents/add-documents - "Partial Failures"
- https://docs.velt.dev/api-reference/rest-apis/v2/documents/update-documents - "Partial Failures"
- https://docs.velt.dev/api-reference/rest-apis/v2/documents/delete-documents - "Partial Failures"
- https://docs.velt.dev/api-reference/rest-apis/v2/documents/get-documents-v2 - "Partial Failures"
- https://docs.velt.dev/api-reference/rest-apis/v1/documents/delete-documents - "Per-Item Failures"
- https://docs.velt.dev/api-reference/rest-apis/v1/documents/update-documents - "Per-Item Failures"
