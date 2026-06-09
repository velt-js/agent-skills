---
title: Configure Retry Policies and Timeouts Per Data Provider
impact: MEDIUM
impactDescription: Prevents cascading failures and handles transient backend errors
tags: retry, timeout, resolveTimeout, retryCount, retryDelay, config, resilience
---

## Configure Retry Policies and Timeouts Per Data Provider

Each data provider supports `resolveTimeout` and per-operation retry configs. Set these based on your backend's latency and reliability characteristics to prevent cascading failures.

**Incorrect (default timeout with slow backend):**

```jsx
// No timeout or retry config — uses SDK defaults
// Slow backends cause the UI to hang with no feedback
const commentDataProvider = {
  get: fetchComments,
  save: saveComments,
  delete: deleteComments,
  // No config — SDK uses internal defaults
};
```

**Correct (explicit timeout and retry configuration):**

```jsx
const commentDataProvider = {
  get: fetchComments,
  save: saveComments,
  delete: deleteComments,
  config: {
    // Max time to wait for any single operation to complete
    resolveTimeout: 15000,  // 15 seconds — set based on backend p99 latency

    // Per-operation retry settings
    getRetryConfig: {
      retryCount: 3,        // Retry up to 3 times on failure
      retryDelay: 2000      // Wait 2 seconds between retries
    },
    saveRetryConfig: {
      retryCount: 3,
      retryDelay: 2000
    },
    deleteRetryConfig: {
      retryCount: 2,        // Fewer retries for deletes (idempotent)
      retryDelay: 1000
    }
  }
};
```

**Recommended values by provider type:**

| Provider | resolveTimeout | retryCount | retryDelay |
|----------|---------------|------------|------------|
| Comments | 10-20s | 3 | 1-2s |
| Reactions | 5-10s | 2-3 | 1s |
| Recordings | 10-20s | 3 | 2s |
| Users | 5-10s | 3 | 1s |
| Attachments (save) | 20-30s | 3 | 2-3s |
| Attachments (delete) | 5-10s | 2 | 1s |

**Config options available on ALL provider types:**

```typescript
interface DataProviderConfig {
  resolveTimeout?: number;           // Max wait time in milliseconds
  getRetryConfig?: RetryConfig;      // Retry for get operations
  saveRetryConfig?: RetryConfig;     // Retry for save operations
  deleteRetryConfig?: RetryConfig;   // Retry for delete operations
  additionalFields?: string[];       // Custom fields to COPY into your DB (kept in Velt's)
  fieldsToRemove?: string[];         // Custom fields to MOVE into your DB (deleted from Velt's)
}

interface RetryConfig {
  retryCount: number;                // Max retry attempts
  retryDelay: number;                // Delay between retries (ms)
}
```

**Key details:**
- `resolveTimeout` applies to the overall operation including all retries
- Keep `retryCount` low (2-3) to avoid thundering herd on backend failures
- Set longer timeouts for attachment uploads (file transfer takes time)
- These options work with both endpoint-based and function-based providers

## `additionalFields` vs `fieldsToRemove` — copy vs move custom fields

Velt already strips its **built-in PII** automatically (comment text, user info, transcripts, …) — you do not configure that. `additionalFields` and `fieldsToRemove` are exclusively for **your own custom fields** attached to an annotation, and they control whether those custom fields are copied or relocated.

- **`additionalFields` — replication (copy).** Each listed custom field is deep-copied into the payload sent to your backend, **and kept** in Velt's DB. On read there is nothing to merge — the field is already in Velt's record. Use this for analytics or search mirrors where you want a copy without moving the field.
- **`fieldsToRemove` — data sovereignty (move).** Each listed custom field is sent to your backend **and deleted** from Velt's DB. On read, Velt fetches it back from your provider and merges it into the record. Use this when a custom field must not be stored by Velt at all.

```jsx
const commentDataProvider = {
  get: fetchComments,
  save: saveComments,
  delete: deleteComments,
  config: {
    additionalFields: ['teamName'],                // copy: stays in Velt's DB AND sent to you
    fieldsToRemove:   ['internalTicketId'],         // move: deleted from Velt's DB, lives only in yours
  },
};
```

| Aspect | `fieldsToRemove` | `additionalFields` |
|---|---|---|
| Effect on Velt's DB | Removed | Kept |
| Sent to your backend | Yes (moved) | Yes (copied) |
| Merged back on read | Yes (restored from you) | No (already in Velt's DB) |
| Falsy values (`0`, `""`, `false`) | Copied only if truthy | Preserved |
| Processing order | First | Second |
| If a field is in **both** lists | `fieldsToRemove` wins (removed first) | — |

**Where each is supported (per provider):**

| Provider | `fieldsToRemove` | `additionalFields` |
|---|:---:|:---:|
| `comment` | ✅ | ✅ |
| `reaction` | — | ✅ |
| `recorder` | — | ✅ |
| `activity` | ✅ (for `custom` activity types only) | — |
| `notification` | — | — |

> ⚠️ **`fieldsToRemove` is for your own custom fields ONLY.** Never list a field Velt relies on to query, scope, position, sync, or render an annotation. If you remove a structural field, Velt can no longer find or place the annotation, and comments/reactions/recordings will silently fail to load, appear in the wrong place, or break filtering and visibility. In particular, **do not** put any of these in `fieldsToRemove`:
>
> - **`metadata`** and its sub-fields — `apiKey`, `documentId`, `organizationId`, `folderId`, `documentMetadata`
> - **Identifiers / keys** — `annotationId`, `id`, `commentId`, `annotationNumber`, `targetEntityId`, `targetSubEntityId`, `notificationId`, `commentAnnotationId`
> - **Location & positioning** — `location`, `locationId`, `context`, `contextId`, `position`, `positionX`/`positionY`, `targetElement`, `targetElementId`, `targetTextRange`, `pageInfo`
> - **Query / filter / state fields** — `status`, `priority`, `type`, `commentType`, `featureType`, `actionType`, `from`, `assignedTo`, `resolvedByUserId`, `timestamp`, `createdAt`, `lastUpdated`, `forYou`, `notificationSource`, `targetAnnotationId`
> - **Resolver flags** — `isCommentResolverUsed`, `isReactionResolverUsed`, `isRecorderResolverUsed`, `isNotificationResolverUsed`, `isActivityResolverUsed`
>
> If in doubt, prefer `additionalFields` (which keeps the field in Velt's DB) so you never accidentally break querying.

**Verification:**
- [ ] `resolveTimeout` set based on backend p99 latency
- [ ] `retryCount` is low (2-3) to avoid cascade
- [ ] Attachment provider has longer timeout than text-based providers
- [ ] `fieldsToRemove` lists only custom fields — never structural identifiers, metadata, query/filter fields, or resolver flags
- [ ] `additionalFields` used when you only need a mirror copy (no removal from Velt's DB)
- [ ] Provider supports the chosen option (only `comment` supports both; see support matrix above)

**Source Pointer:** https://docs.velt.dev/self-host-data/overview - "Excluding & extending fields"; https://docs.velt.dev/self-host-data/comments - "Configuration Options"
