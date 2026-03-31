---
title: Store and Delete Attachments in S3-Compatible Object Storage
impact: MEDIUM
impactDescription: Proper binary file storage with deterministic object keys
tags: s3, attachment, object-storage, upload, delete, binary, file, aws
---

## Store and Delete Attachments in S3-Compatible Object Storage

Store attachment binary data in S3 or S3-compatible storage (MinIO, Cloudflare R2, GCS). Generate deterministic object keys from metadata and return the stored URL in the standard response format.

**Incorrect (storing binary in database or non-deterministic keys):**

```js
// Storing binary blobs in the database — bloats storage, slow queries
await db.collection('attachments').insertOne({
  data: file.buffer,  // Bad: binary data in document store
  name: file.originalname
});

// Non-deterministic key — can't reconstruct for deletion
const key = `uploads/${Math.random()}.png`;  // Random key — can't delete later
```

**Correct (S3 upload with deterministic key):**

```js
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

// SAVE: parse multipart, upload to S3
async function saveAttachment(file, metadata) {
  const { organizationId, documentId } = metadata;
  // Deterministic key — can reconstruct for deletion
  const key = `attachments/${organizationId}/${documentId}/${Date.now()}-${file.originalname}`;

  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  }));

  const url = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return {
    data: { url },        // URL must be returned for SDK to store reference
    success: true,
    statusCode: 200
  };
}

// DELETE: extract key from URL, delete from S3
async function deleteAttachment(attachmentUrl) {
  const url = new URL(attachmentUrl);
  const key = url.pathname.substring(1); // Remove leading /

  await s3.send(new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  }));

  return { success: true, statusCode: 200 };
}
```

**Object key strategy:**

```
attachments/{organizationId}/{documentId}/{timestamp}-{filename}
```

This key structure:
- Groups files by organization and document for easy management
- Uses timestamp prefix to avoid name collisions
- Is deterministic enough to reconstruct from metadata for deletion
- Supports bucket lifecycle policies per organization

**Key details:**
- The save response **must** include `{ data: { url } }` — the SDK stores this URL reference in the comment annotation on your database
- Use the same key structure for both upload and delete to enable reconstruction
- Consider using pre-signed URLs for private attachments
- Works with any S3-compatible storage: AWS S3, MinIO, Cloudflare R2, Google Cloud Storage, DigitalOcean Spaces
- Keep AWS credentials in environment variables, never in client-side code

**Verification:**
- [ ] Object keys are deterministic and unique
- [ ] Save response includes `{ data: { url } }`
- [ ] Delete extracts the correct key from the stored URL
- [ ] AWS credentials stored in environment variables
- [ ] File content type preserved during upload

**Source Pointer:** https://docs.velt.dev/self-host-data/attachments - Backend Example
