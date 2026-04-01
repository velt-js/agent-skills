---
title: Configure Reaction and Recording Data Providers
impact: MEDIUM
impactDescription: Self-host reaction emoji data and recording annotation PII
tags: reaction, recording, CRUD, get, save, delete, pattern, data-provider
---

## Configure Reaction and Recording Data Providers

Reaction and recording providers follow the identical pattern as comments: get/save/delete with either endpoint-based or function-based approach. They share the same request/response contract.

**Incorrect (inconsistent response formats across providers):**

```jsx
// Comments return standard format, but reactions return different shape
const reactionDataProvider = {
  get: async (req) => {
    const data = await db.getReactions(req);
    return data; // WRONG: must return { data, success, statusCode }
  }
};
```

**Correct (both providers with consistent pattern):**

```jsx
// Reaction data provider — endpoint-based
const reactionDataProvider = {
  config: {
    getConfig: { url: `${BACKEND_URL}/reactions/get`, headers },
    saveConfig: { url: `${BACKEND_URL}/reactions/save`, headers },
    deleteConfig: { url: `${BACKEND_URL}/reactions/delete`, headers },
    resolveTimeout: 10000,
    getRetryConfig: { retryCount: 3, retryDelay: 1000 },
    saveRetryConfig: { retryCount: 2, retryDelay: 1000 },
    deleteRetryConfig: { retryCount: 2, retryDelay: 1000 },
  }
};

// Recording data provider — endpoint-based
const recordingDataProvider = {
  config: {
    getConfig: { url: `${BACKEND_URL}/recordings/get`, headers },
    saveConfig: { url: `${BACKEND_URL}/recordings/save`, headers },
    deleteConfig: { url: `${BACKEND_URL}/recordings/delete`, headers },
    resolveTimeout: 10000,
    getRetryConfig: { retryCount: 3, retryDelay: 1000 },
    saveRetryConfig: { retryCount: 2, retryDelay: 1000 },
    deleteRetryConfig: { retryCount: 2, retryDelay: 1000 },
  }
};

// Function-based reaction provider with TypeScript types (same pattern as comments)

type ReactionAnnotation = {
  annotationId: string;
  documentId?: string;
  organizationId?: string;
  metadata?: unknown;
  icon?: string;
};

type ReactionGetRequest = {
  organizationId: string;
  reactionAnnotationIds?: string[];
  documentIds?: string[];
  folderId?: string;
  allDocuments?: boolean;
};

type ReactionSaveRequest = {
  reactionAnnotation: Record<string, ReactionAnnotation>;
};

type ReactionDeleteRequest = {
  reactionAnnotationId: string;
  metadata?: unknown;
};

type DataProviderResponse = {
  data?: unknown;
  success: boolean;
  statusCode: number;
};

const REACTIONS_URL = '/api/velt/reactions';

const fetchReactionsFromDB = async (request: ReactionGetRequest): Promise<DataProviderResponse> => {
  try {
    const response = await fetch(`${REACTIONS_URL}/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) return { data: {}, success: false, statusCode: response.status };
    const data = await response.json();
    return { data: data.result || {}, success: true, statusCode: response.status };
  } catch (error) {
    return { data: {}, success: false, statusCode: 500 };
  }
};

const saveReactionsToDB = async (request: ReactionSaveRequest): Promise<DataProviderResponse> => {
  try {
    const response = await fetch(`${REACTIONS_URL}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) return { success: false, statusCode: response.status };
    await response.json();
    return { success: true, statusCode: 200 };
  } catch (error) {
    return { success: false, statusCode: 500 };
  }
};

const deleteReactionFromDB = async (request: ReactionDeleteRequest): Promise<DataProviderResponse> => {
  try {
    const response = await fetch(`${REACTIONS_URL}/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) return { success: false, statusCode: response.status };
    await response.json();
    return { success: true, statusCode: 200 };
  } catch (error) {
    return { success: false, statusCode: 500 };
  }
};

export const reactionDataProvider = {
  get: fetchReactionsFromDB,
  save: saveReactionsToDB,
  delete: deleteReactionFromDB,
  config: { resolveTimeout: 10000 },
};

<VeltProvider apiKey="KEY" dataProviders={{
  comment: commentDataProvider,
  reaction: reactionDataProvider,
  recording: recordingDataProvider,
}} />
```

**What each provider stores:**

| Provider | Data stored on your infrastructure |
|----------|-----------------------------------|
| Reaction | Emoji type, user who reacted, associated comment |
| Recording | Recording transcription, user identity, attachment URLs |

**Backend request shapes** (same pattern as comments):

```js
// Get: { organizationId, documentIds?, reactionAnnotationIds? }
// Save: { annotations: Record<string, Annotation>, context: { documentId, organizationId } }
// Delete: { annotationId, metadata: { documentId, organizationId } }
```

**Key details:**
- Both follow the exact same interface as the comment data provider
- Recording data contains sensitive PII (who recorded, transcription text) making self-hosting valuable for privacy compliance
- Reaction data includes the emoji icon, the user who reacted, and the associated comment annotation ID
- In-app notification content for reactions is auto-generated from the self-hosted reaction data in the frontend
- Backend CRUD operations use the same upsert pattern as comments (see backend-database-patterns rule)

**Verification:**
- [ ] Both providers return `{ data, success, statusCode }` format
- [ ] Get returns data keyed by annotationId
- [ ] All three operations implemented for each provider
- [ ] Backend uses same upsert pattern as comments

**Source Pointer:** https://docs.velt.dev/self-host-data/reactions; https://docs.velt.dev/self-host-data/recordings
