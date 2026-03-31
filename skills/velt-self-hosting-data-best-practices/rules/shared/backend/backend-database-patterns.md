---
title: Implement Database Storage with Upsert and Proper Indexing
impact: MEDIUM
impactDescription: Idempotent saves and fast queries at scale
tags: database, mongodb, postgresql, upsert, index, schema, storage, bulkWrite
---

## Implement Database Storage with Upsert and Proper Indexing

Use upsert semantics for save operations (handles retries idempotently) and create indexes on annotationId, documentId, and organizationId for query performance.

**Incorrect (INSERT without upsert — fails on retry):**

```js
// Retried saves cause duplicate key errors
await collection.insertOne({ annotationId: id, ...data });
// Error: duplicate key on retry — annotationId already exists
```

**Correct (MongoDB upsert with bulkWrite):**

```js
async function saveAnnotations(collection, annotations, context) {
  const operations = Object.entries(annotations).map(([id, annotation]) => ({
    updateOne: {
      filter: { annotationId: id },
      update: {
        $set: {
          ...annotation,
          annotationId: id,
          documentId: context?.documentId || annotation.documentId,
          organizationId: context?.organizationId || annotation.organizationId,
          updatedAt: new Date(),
        }
      },
      upsert: true  // Insert if not exists, update if exists
    }
  }));

  if (operations.length > 0) {
    await collection.bulkWrite(operations);
  }
}

// Create indexes on collection setup
await collection.createIndex({ annotationId: 1 }, { unique: true });
await collection.createIndex({ documentId: 1 });
await collection.createIndex({ organizationId: 1 });
await collection.createIndex({ documentId: 1, organizationId: 1 });
```

**Correct (PostgreSQL upsert with ON CONFLICT):**

```sql
-- Table schema
CREATE TABLE comment_annotations (
  annotation_id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_doc_id ON comment_annotations(document_id);
CREATE INDEX idx_org_id ON comment_annotations(organization_id);
CREATE INDEX idx_doc_org ON comment_annotations(document_id, organization_id);
```

```js
// Upsert with parameterized queries (prevents SQL injection)
async function saveAnnotations(client, annotations, context) {
  await client.query('BEGIN');
  for (const [id, annotation] of Object.entries(annotations)) {
    const data = { ...annotation, annotationId: id };
    await client.query(
      `INSERT INTO comment_annotations (annotation_id, document_id, organization_id, data, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (annotation_id)
       DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      [id, context?.documentId, context?.organizationId, JSON.stringify(data)]
    );
  }
  await client.query('COMMIT');
}
```

**Required indexes (apply to all annotation collections):**

| Index | Columns | Type | Purpose |
|-------|---------|------|---------|
| Primary | `annotationId` | Unique | Upsert and single lookups |
| Filter | `documentId` | Non-unique | Document-scoped queries |
| Filter | `organizationId` | Non-unique | Org-scoped queries |
| Compound | `documentId + organizationId` | Non-unique | Combined filter queries |

**Key details:**
- Upsert ensures idempotency — retried saves don't create duplicates
- MongoDB `bulkWrite` with `upsert: true` handles multiple annotations efficiently
- PostgreSQL `ON CONFLICT DO UPDATE` achieves the same result
- Always use parameterized queries in PostgreSQL to prevent SQL injection
- The same pattern applies to comments, reactions, and recordings — all use `annotationId` as the primary key
- Store the full annotation as a JSON column in PostgreSQL (JSONB) for flexibility

**Verification:**
- [ ] Save operations use upsert (not plain insert)
- [ ] Unique index exists on annotationId
- [ ] Indexes on documentId and organizationId for query performance
- [ ] Parameterized queries used (no string concatenation in SQL)
- [ ] Transactions used for multi-annotation saves

**Source Pointer:** https://docs.velt.dev/self-host-data/comments - Backend Example (MongoDB, PostgreSQL)
