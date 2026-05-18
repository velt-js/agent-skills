---
title: Pass file bytes positionally to saveAttachment; getAttachment is purely positional
impact: HIGH
impactDescription: Putting fileData inside the request object silently no-ops the S3 upload; wrapping getAttachment's args in an object returns nothing useful
tags: attachments, saveAttachment, getAttachment, S3, positional-args, fileBuffer, AWS
---

## Pass file bytes positionally to saveAttachment; getAttachment is purely positional

Attachments is the one self-hosting service that mixes a request object with positional file arguments. This trips up everyone the first time.

**`saveAttachment(request, fileBuffer?, fileName?, mimeType?)`** — the request object goes first; the next three are optional positional args. Supply all three when you want the SDK to upload the body to S3; omit them when you're storing only metadata.

```ts
// CORRECT — upload to S3
const svc = await sdk.selfHosting.getAttachments();
const r = await svc.saveAttachment(
  {
    metadata: { organizationId: 'org-123', documentId: 'doc-1' },
    attachment: { attachmentId: 12345, name: 'document.pdf',
                  mimeType: 'application/pdf', size: 1024 },
  },
  fileBuffer,        // positional, optional
  'document.pdf',    // positional, optional
  'application/pdf'  // positional, optional
);
// → { success: true, statusCode: 200, data: { saved: true, attachmentId: 12345 } }

// CORRECT — metadata-only save
await svc.saveAttachment({
  metadata: { organizationId: 'org-123', documentId: 'doc-1' },
  attachment: { attachmentId: 12345, name: 'document.pdf',
                mimeType: 'application/pdf', size: 1024 },
});

// WRONG — fileData inside the request object is silently ignored
await svc.saveAttachment({
  metadata: { /* ... */ },
  attachment: { /* ... */ },
  fileData: fileBuffer,   // ignored — no S3 upload happens
});
```

**`getAttachment(organizationId, attachmentId)`** — purely positional. `attachmentId` is a number, not a string.

```ts
// CORRECT
const r = await svc.getAttachment('org-123', 12345);

// WRONG
const r = await svc.getAttachment({ organizationId: 'org-123', attachmentId: 12345 });
```

**`deleteAttachment(request)`** — request object, removes the MongoDB row and the S3 object (if present):

```ts
await svc.deleteAttachment({
  attachmentId: 12345,
  metadata: { organizationId: 'org-123' },
});
```

**Prereqs for S3 uploads:**
- `@aws-sdk/client-s3 ^3` installed
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET_NAME` env vars set
- `AWS_S3_ENDPOINT_URL` if using MinIO / custom S3 endpoint

**Verification:**
- [ ] `saveAttachment` calls position the file buffer as the SECOND argument (not inside the request object)
- [ ] `getAttachment` is called with two positional args, attachmentId is numeric
- [ ] AWS env vars are configured wherever a saveAttachment call passes a buffer
- [ ] `@aws-sdk/client-s3` is in `dependencies` if any buffer upload exists

**Source Pointer:** `backend-sdks/node.mdx` (Self-Hosting Backend → Attachments)
