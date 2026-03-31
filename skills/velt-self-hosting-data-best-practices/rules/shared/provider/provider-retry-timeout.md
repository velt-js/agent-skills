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
  additionalFields?: string[];       // Extra fields to include
  fieldsToRemove?: string[];         // PII fields to strip
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
- `additionalFields` adds extra data fields to the request sent to your backend
- `fieldsToRemove` strips specified fields before sending to your backend (PII protection)
- These options work with both endpoint-based and function-based providers

**Verification:**
- [ ] `resolveTimeout` set based on backend p99 latency
- [ ] `retryCount` is low (2-3) to avoid cascade
- [ ] Attachment provider has longer timeout than text-based providers
- [ ] `fieldsToRemove` configured to strip sensitive PII fields

**Source Pointer:** https://docs.velt.dev/self-host-data/comments - Configuration Options; https://docs.velt.dev/self-host-data/attachments - Configuration Options
