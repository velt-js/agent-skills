---
title: Self-Host Recording Data and Media Files
impact: MEDIUM
impactDescription: Store recording annotations and media on your own infrastructure
tags: recorder, RecorderAnnotationDataProvider, get, save, delete, uploadChunks, storage, self-hosting
---

## Self-Host Recording Data and Media Files

The recorder data provider handles recording annotations (metadata, transcriptions) and optionally the media files themselves. It supports chunked uploads and a scoped storage provider for media binaries.

**RecorderAnnotationDataProvider interface:**

```typescript
interface RecorderAnnotationDataProvider {
  get?: (request: GetRecorderResolverRequest) => Promise<ResolverResponse<Record<string, PartialRecorderAnnotation>>>;
  save?: (request: SaveRecorderResolverRequest) => Promise<ResolverResponse<SaveRecorderResolverData | undefined>>;
  delete?: (request: DeleteRecorderResolverRequest) => Promise<ResolverResponse<undefined>>;
  config?: ResolverConfig;
  uploadChunks?: boolean;              // Upload recording in chunks (default: false)
  storage?: AttachmentDataProvider;    // Scoped storage for recorder media files
}

interface GetRecorderResolverRequest {
  organizationId: string;
  recorderAnnotationIds?: string[];
  documentIds?: string[];
  folderId?: string;
  allDocuments?: boolean;
}

interface SaveRecorderResolverRequest {
  recorderAnnotations: Record<string, PartialRecorderAnnotation>;
  metadata?: BaseMetadata;
  event?: ResolverActions;
}

interface SaveRecorderResolverData {
  recorderAnnotation: Record<string, PartialRecorderAnnotation>;
}

interface DeleteRecorderResolverRequest {
  recorderAnnotationId: string;
  metadata?: BaseMetadata;
  event?: ResolverActions;
}

interface PartialRecorderAnnotation {
  annotationId: string;
  from?: PartialUser;
  attachment?: ResolverAttachment;
  attachments?: ResolverAttachment[];
  transcription?: string;
  recordingEditVersions?: Record<number, PartialRecorderAnnotationEditVersion>;
}
```

**Function-based example:**

```tsx
const recorderDataProvider: RecorderAnnotationDataProvider = {
  get: async (request) => {
    const response = await fetch('/api/velt/recordings/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const data = await response.json();
    return { data: data.result || {}, success: true, statusCode: 200 };
  },
  save: async (request) => {
    const response = await fetch('/api/velt/recordings/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const data = await response.json();
    return { data: data.result, success: true, statusCode: 200 };
  },
  delete: async (request) => {
    await fetch('/api/velt/recordings/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return { data: undefined, success: true, statusCode: 200 };
  },
  config: {
    resolveTimeout: 30000, // Longer timeout for media
    saveRetryConfig: { retryCount: 3, retryDelay: 2000 },
    deleteRetryConfig: { retryCount: 2, retryDelay: 1000 },
    getRetryConfig: { retryCount: 3, retryDelay: 2000 },
  },
  uploadChunks: false, // Set true for chunked upload (large recordings)
};

// Optional: custom storage for media files (uses AttachmentDataProvider interface)
const recorderStorage: AttachmentDataProvider = {
  save: async (request) => {
    // Upload media to your S3/storage
    const url = await uploadToStorage(request.file);
    return { data: { url }, success: true, statusCode: 200 };
  },
  delete: async (request) => {
    await deleteFromStorage(request.url);
    return { data: undefined, success: true, statusCode: 200 };
  },
};

// Wire both into VeltProvider
<VeltProvider apiKey={KEY} authProvider={auth} dataProviders={{
  recorder: {
    ...recorderDataProvider,
    storage: recorderStorage, // Scoped storage for media files
  },
}}>
```

**Status tracking fields:**
- `isRecorderResolverUsed: boolean` — true while PII is being fetched from resolver
- `isUrlAvailable: boolean` — true once recording media URL has been uploaded

**Key details:**
- `uploadChunks: true` sends recording data in chunks for large files
- `storage` is a scoped `AttachmentDataProvider` just for recorder media (separate from the main attachment provider)
- Recording data includes transcription text, user identity, and media URLs — all sensitive PII
- `RecorderResolverModuleName.GET_RECORDER_ANNOTATIONS` in dataProvider events for debugging

### Recorder strip rules

The recorder splits along a few axes simultaneously — transcript, attachment binaries, chunk URLs, and per-version edit history — and the rules differ for each. Important: the recorder **metadata** resolver and the recorder **file** storage (`recorder.storage`) are independent toggles. Recording files stay on Velt unless you also set `recorder.storage`.

- **`transcription`** — the entire object is **never sent to Velt** when the recorder resolver is active (→ your DB). It is present in Velt's DB **only** when no recorder resolver is set.
- **`attachment`** (deprecated single) — the value is **never sent to Velt** (written as `null` there). The full object goes to your DB.
- **`attachments[]`** — Velt's DB keeps **stubs only**: `{ attachmentId, name, bucketPath }`. `url` and the binary-pointing fields are stripped. `bucketPath` is deliberately preserved so Velt can perform server-side storage cleanup.
- **`chunkUrls`** — the value is **never sent to Velt** (written as `{}` there); the full chunk-URL map goes to your DB.
- **`from`** — **reduced** to `{ userId }` in Velt's DB; the full user object (name / email / `photoUrl`) goes to your DB only.
- **`recordingEditVersions`** — per-version PII is stripped the same way (`from` → `{ userId }`, `attachment` → `null`, `attachments` → stubs, `transcription` never sent). Non-PII per-version fields (`recordedTime`, `waveformData`, `displayName`, `boundedTrimRanges`, `boundedScaleRanges`) are **kept** in Velt's DB.
- **Top-level `displayName` / `waveformData` / `recordedTime`** — sent to Velt verbatim; not part of the `Partial` payload to your DB.
- `isRecorderResolverUsed` is set `true` whenever PII was stripped from a record.

**Incorrect (treating `attachments` as fully redirected to your DB and assuming Velt has no record of the binaries):**

```tsx
const saveRecorder = async (request) => {
  // BUG: Velt still tracks { attachmentId, name, bucketPath } stubs for storage cleanup.
  // If your DB is the only source of truth for attachment IDs, you risk orphaning bucket objects
  // because Velt expects bucketPath to round-trip through the stub.
  for (const partial of Object.values(request.recorderAnnotations)) {
    await db.saveAttachments(partial.attachments); // assumes Velt has nothing — wrong
  }
  return { success: true, statusCode: 200 };
};
```

**Correct (your DB stores the PII-bearing fields; Velt keeps stubs for cleanup; both halves are needed):**

```tsx
const saveRecorder = async (request) => {
  for (const [annotationId, partial] of Object.entries(request.recorderAnnotations)) {
    // partial.transcription          → entire object, your DB only
    // partial.from                   → full User object (PII)
    // partial.attachments[]          → full attachment objects including url
    // partial.chunkUrls              → full map
    // partial.recordingEditVersions  → per-version PII (only versions with ≥1 PII field present)
    await db.upsertRecorderPII(annotationId, partial);
  }
  return { data: undefined, success: true, statusCode: 200 };
};
```

**Verification:**
- [ ] get returns `Record<string, PartialRecorderAnnotation>`
- [ ] save returns `ResolverResponse<SaveRecorderResolverData | undefined>`
- [ ] delete returns `ResolverResponse<undefined>`
- [ ] Longer resolveTimeout set for media operations (20-30s)
- [ ] storage provider configured if media files should be stored on your infrastructure
- [ ] Provider set before identify()
- [ ] `attachments[]` round-trip preserves Velt-side stubs `{ attachmentId, name, bucketPath }` so Velt can clean up storage
- [ ] `recordingEditVersions` per-version PII is treated as optional (versions without PII are absent from the payload)

**Source Pointer:** https://docs.velt.dev/self-host-data/recordings; https://docs.velt.dev/self-host-data/field-inventory - "Recorder strip rules"
