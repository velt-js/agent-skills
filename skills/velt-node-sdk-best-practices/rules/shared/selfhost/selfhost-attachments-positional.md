---
title: Pass file bytes positionally to saveAttachment; getAttachment is purely positional
impact: HIGH
impactDescription: Putting file bytes inside the request object skips the S3 upload, and on 2.x a save with neither a file URL nor file data returns 400
tags: attachments, saveAttachment, getAttachment, deleteAttachment, S3, positional-args, fileData, AWS, closed-field-set
---

## Pass file bytes positionally to saveAttachment; getAttachment is purely positional

Attachments is the one self-hosting service that mixes a request object with positional file arguments, and since `@veltdev/node` 2.0.0 it stores a closed set of fields.

**`saveAttachment(request, fileData?, fileName?, mimeType?)`.** The request object goes first; the next three are optional positional arguments. Pass them when the SDK should upload the body to S3.

**Incorrect:**

```ts
const svc = await sdk.selfHosting.getAttachments();

// WRONG: file bytes inside the request object are not a stored field; nothing is uploaded,
// and with no `file` URL either, 2.x returns 400.
await svc.saveAttachment({
  metadata: { organizationId: 'org-123', documentId: 'doc-1' },
  attachment: { attachmentId: 12345, name: 'document.pdf', mimeType: 'application/pdf' },
  fileData: fileBuffer,
});

// WRONG: object-style getAttachment
await svc.getAttachment({ organizationId: 'org-123', attachmentId: 12345 });
```

**Correct:**

```ts
const svc = await sdk.selfHosting.getAttachments();

const r = await svc.saveAttachment(
  {
    metadata: { organizationId: 'org-123', documentId: 'doc-1' },
    attachment: { attachmentId: 12345, name: 'document.pdf', mimeType: 'application/pdf' },
  },
  fileBuffer,        // positional Buffer, uploaded to S3
  'document.pdf',    // positional
  'application/pdf', // positional
);
// → { success: true, statusCode: 200, data: { url: 'https://s3.amazonaws.com/...' } }

// Purely positional; attachmentId is a number.
const got = await svc.getAttachment('org-123', 12345);
// → data: { attachmentId, file: 'https://...', name, mimeType, metadata: { organizationId, documentId } }

// Request object; removes the stored record and the S3 object, if any.
await svc.deleteAttachment({ attachmentId: 12345, metadata: { organizationId: 'org-123' } });
```

**What 2.x stores (closed set).** `attachmentId`, `file` (the URL), `name`, `mimeType`, and `metadata` with only `organizationId`, `documentId`, `folderId`, `attachmentId`, `commentAnnotationId`, `apiKey`. Any other field (for example `size`), a top-level `url`, and null metadata keys are not stored. A save without a `file` URL or file data returns 400. Read the stored URL from `data.file` on `getAttachment`, not `data.url`.

**Prereqs for S3 uploads:**
- `@aws-sdk/client-s3` ^3 installed
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET_NAME` set
- `AWS_S3_ENDPOINT_URL` when using MinIO or another custom S3 endpoint

**Verification:**
- [ ] `saveAttachment` passes the file buffer as the second argument, never inside the request object
- [ ] Every save supplies either file data or an `attachment.file` URL
- [ ] Code does not rely on extra attachment fields (such as `size`) or a top-level `url` being persisted
- [ ] `getAttachment` is called with two positional args, `attachmentId` numeric, and reads `data.file`
- [ ] AWS env vars and `@aws-sdk/client-s3` are present wherever a buffer upload runs

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/node#attachments - "Attachments" (getAttachment, saveAttachment, deleteAttachment)
- https://docs.velt.dev/backend-sdks/node#installation - "Upgrading from 1.x"
