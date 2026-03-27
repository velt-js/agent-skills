---
title: Use Config-Based URL Endpoints Instead of Placeholder Callbacks in CommentAnnotationDataProvider
impact: MEDIUM
impactDescription: Eliminates boilerplate callback stubs when using URL-based data provider endpoints, reducing integration errors
tags: data-provider, comment-annotation, config, resolver, backend, rest-api
---

## Use Config-Based URL Endpoints Instead of Placeholder Callbacks in CommentAnnotationDataProvider

As of v5.0.2-beta.8, the `get`, `save`, and `delete` methods on `CommentAnnotationDataProvider` (and the parallel `ReactionAnnotationDataProvider` and `AttachmentDataProvider`) are optional. When using config-based URL endpoints (`config.getConfig`, `config.saveConfig`, `config.deleteConfig`), you no longer need to supply empty placeholder callbacks alongside them. `ResolverConfig` accepts `additionalFields?: string[]` to copy custom fields to your resolver endpoint payload while retaining them in Velt's storage, and `fieldsToRemove?: string[]` to strip fields from Velt's DB entirely before storage (e.g. for PII removal). Both can coexist on the same config object.

**Incorrect (supplying unnecessary placeholder callbacks alongside config-based endpoints):**

```tsx
// Before v5.0.2-beta.8: developers had to supply stub callbacks
// even when using config-based URL endpoints — now redundant
client.setDataProviders({
  comment: {
    get: async (request) => ({ data: null }), // unnecessary stub
    save: async (request) => ({ data: null }), // unnecessary stub
    delete: async (request) => ({ data: null }), // unnecessary stub
    config: {
      getConfig:    { url: 'https://api.yourapp.com/comments/get' },
      saveConfig:   { url: 'https://api.yourapp.com/comments/save' },
      deleteConfig: { url: 'https://api.yourapp.com/comments/delete' },
    },
  },
});
```

**Correct (config-based endpoints with no placeholder callbacks required):**

```tsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function DataProviderSetup() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;

    // Config-based URL endpoints — get/save/delete callbacks are optional
    client.setDataProviders({
      comment: {
        config: {
          getConfig:        { url: 'https://api.yourapp.com/comments/get' },
          saveConfig:       { url: 'https://api.yourapp.com/comments/save' },
          deleteConfig:     { url: 'https://api.yourapp.com/comments/delete' },
          // Copied to resolver payload but kept in Velt's storage
          additionalFields: ['tenantId', 'projectId'],
          // Stripped from Velt's DB before storage (PII removal)
          fieldsToRemove: ['sensitiveField'],
        },
      },
    });
  }, [client]);
}

// Callback-based form is still valid when you need custom logic
function DataProviderSetupCallbackBased() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;

    client.setDataProviders({
      comment: {
        get:    async (request) => { /* fetch from your backend */ return { data: null }; },
        save:   async (request) => { /* persist to your backend */ return { data: null }; },
        delete: async (request) => { /* delete from your backend */ return { data: null }; },
      },
    });
  }, [client]);
}
```

**CommentAnnotationDataProvider interface (v5.0.2-beta.8):**

| Field | Type | Optional | Description |
|-------|------|----------|-------------|
| `get` | `(request: CommentAnnotationGetRequest) => Promise<ResolverResponse<CommentAnnotation>>` | Yes | Callback to fetch an annotation from your backend. Optional when `config.getConfig` is provided. |
| `save` | `(request: CommentAnnotationSaveRequest) => Promise<ResolverResponse<void>>` | Yes | Callback to persist an annotation. Optional when `config.saveConfig` is provided. |
| `delete` | `(request: CommentAnnotationDeleteRequest) => Promise<ResolverResponse<void>>` | Yes | Callback to delete an annotation. Optional when `config.deleteConfig` is provided. |
| `config.getConfig` | `{ url: string }` | Yes | URL endpoint for fetch operations. |
| `config.saveConfig` | `{ url: string }` | Yes | URL endpoint for save operations. |
| `config.deleteConfig` | `{ url: string }` | Yes | URL endpoint for delete operations. |
| `config.additionalFields` | `string[]` | Yes | Fields copied to your resolver endpoint payload but **retained** in Velt's storage. Use for data replication without removal. |
| `config.fieldsToRemove` | `string[]` | Yes | Fields **stripped from Velt's DB** before storage. Use for PII removal. Can coexist with `additionalFields` on the same config object. |

The same `get?`, `save?`, `delete?` optionality applies to `ReactionAnnotationDataProvider` and `AttachmentDataProvider`.

**Verification Checklist:**
- [ ] Config-based registrations omit placeholder `get`/`save`/`delete` stub callbacks
- [ ] `additionalFields` lists only field names that exist in your comment data model and are safe to replicate
- [ ] `fieldsToRemove` lists PII or sensitive fields that must not be persisted in Velt's storage
- [ ] Callback-based and config-based forms are not mixed on the same provider entry
- [ ] `setDataProviders` is called after the Velt client is initialized

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior/data/overview - Data Providers overview
- https://docs.velt.dev/api-reference/sdk/velt-client - setDataProviders API reference
