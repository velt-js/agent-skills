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

**Verification:**
- [ ] get returns `Record<string, PartialRecorderAnnotation>`
- [ ] save returns `ResolverResponse<SaveRecorderResolverData | undefined>`
- [ ] delete returns `ResolverResponse<undefined>`
- [ ] Longer resolveTimeout set for media operations (20-30s)
- [ ] storage provider configured if media files should be stored on your infrastructure
- [ ] Provider set before identify()

**Source Pointer:** https://docs.velt.dev/self-host-data/recordings
