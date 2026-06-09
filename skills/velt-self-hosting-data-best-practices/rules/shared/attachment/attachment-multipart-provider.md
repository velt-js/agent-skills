---
title: Handle Attachment Uploads with multipart/form-data Not JSON
impact: HIGH
impactDescription: Prevents silent upload failures from wrong content type
tags: attachment, multipart, form-data, upload, file, binary, save, delete, S3
---

## Handle Attachment Uploads with multipart/form-data Not JSON

Attachment save operations use `multipart/form-data` encoding — not JSON like all other data providers. This is the most common source of self-hosting integration failures. Attachments only support save and delete (no get).

**Incorrect (expecting JSON for attachment save):**

```js
// Backend expecting JSON — will fail silently on attachment uploads
app.post('/api/velt/attachments/save', express.json(), async (req, res) => {
  const file = req.body.file; // undefined — file sent as multipart, not JSON
});
```

**Correct (endpoint-based attachment provider):**

```jsx
const attachmentDataProvider = {
  config: {
    saveConfig: {
      url: `${BACKEND_URL}/attachments/save`,
      // Do NOT set Content-Type header — browser sets it automatically
      // with correct multipart boundary parameter
      headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
    },
    deleteConfig: {
      url: `${BACKEND_URL}/attachments/delete`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      }
    },
    resolveTimeout: 30000,  // Longer timeout for file uploads
    saveRetryConfig: { retryCount: 3, retryDelay: 2000 },
    deleteRetryConfig: { retryCount: 2, retryDelay: 1000 },
  }
};

<VeltProvider apiKey="KEY" dataProviders={{ attachment: attachmentDataProvider }} />
```

**Correct (function-based attachment provider with TypeScript types):**

For Next.js API routes, use the **base64 approach** (convert File to base64, send as JSON) since Next.js API routes don't natively support multipart parsing without extra libraries:

```tsx
type AttachmentSaveRequest = {
  attachment: {
    attachmentId?: number;
    name?: string;
    url?: string;
    mimeType?: string;
    size?: number;
    base64Data?: string;
    file?: File;
  };
  metadata?: unknown;
};

type AttachmentDeleteRequest = {
  attachmentId: number;
  metadata?: unknown;
};

type DataProviderResponse = {
  data?: unknown;
  success: boolean;
  statusCode: number;
};

const ATTACHMENTS_URL = '/api/velt/attachments';

// Helper: convert File to base64 data URL
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const saveAttachmentToDB = async (request: AttachmentSaveRequest): Promise<DataProviderResponse> => {
  try {
    const { file, ...attachmentWithoutFile } = request.attachment;
    let base64Data = request.attachment.base64Data;

    // Convert File object to base64 if present
    if (file && file instanceof File) {
      base64Data = await fileToBase64(file);
    }

    const payload = {
      attachment: { ...attachmentWithoutFile, base64Data },
      metadata: request.metadata,
    };

    const response = await fetch(`${ATTACHMENTS_URL}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return { success: false, statusCode: response.status };
    const data = await response.json();
    // data.result MUST contain { url } pointing to where the file can be fetched
    return { success: true, statusCode: 200, data: data.result };
  } catch (error) {
    console.error('[Velt Self-Host] Error saving attachment:', error);
    return { success: false, statusCode: 500 };
  }
};

const deleteAttachmentFromDB = async (request: AttachmentDeleteRequest): Promise<DataProviderResponse> => {
  try {
    const response = await fetch(`${ATTACHMENTS_URL}/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) return { success: false, statusCode: response.status };
    await response.json();
    return { success: true, statusCode: 200 };
  } catch (error) {
    console.error('[Velt Self-Host] Error deleting attachment:', error);
    return { success: false, statusCode: 500 };
  }
};

export const attachmentDataProvider = {
  save: saveAttachmentToDB,
  delete: deleteAttachmentFromDB,
  config: {
    resolveTimeout: 30000,
    saveRetryConfig: { retryCount: 3, retryDelay: 2000 },
    deleteRetryConfig: { retryCount: 2, retryDelay: 1000 },
  },
};
```

The backend attachment GET route must also exist to serve stored files:

```tsx
// app/api/velt/attachments/get/[attachmentId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAttachment } from '../../../store';

export async function GET(request: NextRequest, { params }: { params: { attachmentId: string } }) {
  const attachment = await getAttachment(Number(params.attachmentId));
  if (!attachment?.base64Data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  // Decode base64 data URL and serve as binary
  const [header, base64] = attachment.base64Data.split(',');
  const mimeType = header.match(/data:(.*?);/)?.[1] || 'application/octet-stream';
  const buffer = Buffer.from(base64, 'base64');
  return new NextResponse(buffer, {
    headers: { 'Content-Type': mimeType, 'Content-Length': String(buffer.length) },
  });
}
```

**Backend handling (multipart parsing):**

```js
// Using multer (Express) or equivalent multipart parser
app.post('/api/velt/attachments/save', upload.single('file'), async (req, res) => {
  const file = req.file;                              // Binary file from multipart
  const metadata = JSON.parse(req.body.request);      // JSON metadata string

  // Upload to your storage (S3, GCS, etc.)
  const url = await uploadToStorage(file);

  // Save response MUST include the stored URL
  res.json({
    data: { url },     // URL where the file can be accessed
    success: true,
    statusCode: 200
  });
});
```

**Key differences from other providers:**

| Aspect | Attachments | Comments/Reactions/Recordings/Users |
|--------|-------------|-------------------------------------|
| Save format | `multipart/form-data` | `application/json` |
| Content-Type header | Auto-set by browser | Must set explicitly |
| Get operation | Not supported | Supported |
| Save response | Must include `{ url }` | Can be empty |

**Two storage scopes — keep them separate:**

`AttachmentDataProvider` is used in two distinct positions on the `VeltDataProvider` object, and they route to independent destinations. Wire each scope you need; do not consolidate them.

| Scope | Configured via | Used for |
|---|---|---|
| Comment attachments | `dataProviders.attachment` | Files attached to comments |
| Recording files | `dataProviders.recorder.storage` | Video/audio recording binaries |

```ts
await Velt.setDataProviders({
  // Comment attachments — your S3/GCS/Azure bucket A
  attachment: {
    async save({ file, name, metadata }) {
      const url = await commentBucket.put(file, name);
      return { data: { url }, success: true, statusCode: 200 };
    },
    async delete({ attachmentId, metadata }) {
      await commentBucket.remove(attachmentId);
      return { success: true, statusCode: 200 };
    },
  },

  // Recording metadata → your DB; recording binaries → bucket B (can be the same bucket)
  recorder: {
    async get(req)    { /* … */ },
    async save(req)   { /* … */ },
    async delete(req) { /* … */ },
    storage: {
      async save({ file, name }) {
        const url = await recordingBucket.put(file, name);
        return { data: { url }, success: true, statusCode: 200 };
      },
      async delete({ attachmentId }) {
        await recordingBucket.remove(attachmentId);
        return { success: true, statusCode: 200 };
      },
    },
  },
});
```

When `recorder.storage` is set, Velt uploads the entire recording to your bucket once (after the recording stops and the annotation is saved), patches the returned `url` onto the annotation, and skips its own server-side encoding/transcription post-processing — you own those files end to end. Deletes for both scopes receive the minimized metadata `{ apiKey, documentId, organizationId, folderId? }` plus the `attachmentId`.

**Key details:**
- Do **NOT** set `Content-Type` header for save requests — the browser sets it automatically with the correct multipart boundary
- The save response **must** include `{ data: { url: string } }` — the URL where the attachment can be accessed
- Delete operations use standard JSON like other providers
- Set a longer `resolveTimeout` (15-30s) for file uploads
- Attachment data is stored alongside comment data — when a comment has attachments, the URLs are embedded in the comment annotation stored on your database

**Delete handler metadata contract (v5.0.2-beta.11+):**

As of v5.0.2-beta.11, the `metadata` field passed to the attachment delete handler contains only client-facing metadata — internal Velt fields are stripped before the call. Do not rely on internal Velt fields (such as `commentAnnotationId` or `attachmentId`) being present in `metadata`; use the top-level `attachmentId` field on the request object instead.

```tsx
// BEFORE v5.0.2-beta.11: metadata may have included internal Velt fields
const deleteAttachmentFromDB = async (request: AttachmentDeleteRequest) => {
  // Do NOT rely on internal fields in request.metadata
};

// AFTER v5.0.2-beta.11: metadata contains only client-set fields
const deleteAttachmentFromDB = async (request: AttachmentDeleteRequest) => {
  // Use top-level request.attachmentId — always present
  const { attachmentId } = request;
  await db.deleteAttachment(attachmentId);
  return { success: true, statusCode: 200 };
};
```

### Upload payload field inventory

The attachment provider sits **outside** the `Partial<X>` strip model used by every other provider. There is no `get` and no `Partial<Attachment>` — attachments are binary files. When Velt hands a save call to your storage provider, the payload is a fixed shape:

```typescript
interface SaveAttachmentResolverRequest {
  file: File;                                            // raw binary; multipart `file` part in URL mode, provider.save arg in function mode
  attachment: {
    attachmentId: number;                                // required (random 6-digit id, also at metadata.attachmentId)
    name?: string;                                       // original file name (optional)
    mimeType?: string;                                   // MIME type (optional)
  };
  metadata: AttachmentResolverMetadata;
  event?: ResolverActions;                               // e.g. ATTACHMENT_ADD ("attachment.add") on save
}

interface AttachmentResolverMetadata {
  organizationId: string | null;                         // org scope
  documentId: string | null;                             // document scope
  folderId?: string | null;                              // folder scope; on delete only when truthy
  attachmentId: number | null;                           // mirror of top-level attachmentId
  commentAnnotationId: string | null;                    // owning comment annotation; dropped on delete
  apiKey: string | null;                                 // Velt public API key
}

// Required return shape
interface SaveAttachmentResolverData { url: string; }   // persisted back onto Attachment.url
```

The JSON `request` body in URL (endpoint) mode is exactly `{ attachment: { attachmentId, name, mimeType }, metadata, event }` — the `File` is destructured out and sent as a separate multipart binary part to your storage, **never to Velt**. On delete, Velt sends `{ attachmentId, metadata: { apiKey, documentId, organizationId, folderId? }, event }` where `event` is `ATTACHMENT_DELETE` (`"attachment.delete"`).

What persists on Velt's side after a successful save (everything except the binary bytes): `attachmentId` (PK), `name`, `bucketPath`, `size`, `type`, `url` (the URL **your** storage returned), `thumbnail`, `thumbnailWithPlayIconUrl`, `metadata` (arbitrary), `mimeType`, `previewImages`, and the `isAttachmentResolverUsed` flag. The `url` is the only field that comes from your `save` response; the rest are structural.

**Incorrect (assuming `request.attachment` is a full `Attachment` object — only three sub-fields are guaranteed):**

```tsx
const saveAttachment = async (request: SaveAttachmentResolverRequest) => {
  // BUG: `bucketPath`, `size`, `thumbnail`, `previewImages` are not in `request.attachment`.
  // Velt computes those on its side from the `{ url }` you return plus the binary it just handed you.
  const { attachmentId, name, mimeType, bucketPath, size } = request.attachment as any;
  const url = await storage.put(request.file, { bucketPath }); // `bucketPath` is undefined
  return { data: { url }, success: true, statusCode: 200 };
};
```

**Correct (only `attachmentId` / `name` / `mimeType` are in the request; choose your own bucket path):**

```tsx
const saveAttachment = async (request: SaveAttachmentResolverRequest) => {
  const { attachmentId, name = 'untitled', mimeType } = request.attachment;
  const { organizationId, documentId, folderId } = request.metadata;
  const key = `attachments/${organizationId}/${documentId}/${attachmentId}-${name}`;
  const url = await storage.put(request.file, key, { contentType: mimeType });
  return { data: { url }, success: true, statusCode: 200 };
};
```

**Verification:**
- [ ] Backend parses multipart/form-data (not JSON) for save
- [ ] Content-Type header NOT manually set for save requests
- [ ] Save response includes `{ data: { url } }`
- [ ] Delete uses standard JSON format
- [ ] Timeout is longer than for other providers (file upload latency)
- [ ] Delete handler reads `attachmentId` from the top-level request field, not from `metadata`
- [ ] Comment attachments wired on `dataProviders.attachment`; recording files wired on `dataProviders.recorder.storage` — separate scopes, never collapsed
- [ ] Save handler only reads `attachmentId`, `name`, `mimeType` from `request.attachment` — does not assume `bucketPath` / `size` / `thumbnail` etc. are present (Velt populates those from the returned `url` and the binary)
- [ ] `event` is treated as one of `ResolverActions` (`ATTACHMENT_ADD` / `ATTACHMENT_DELETE`); handlers gate side effects on it rather than HTTP method alone

**Source Pointer:** https://docs.velt.dev/self-host-data/attachments - Endpoint-Based, Function-Based; https://docs.velt.dev/self-host-data/overview - "Attachment & recording storage"; https://docs.velt.dev/self-host-data/field-inventory - "Attachments"
