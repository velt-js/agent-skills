---
title: Configure CRDT Activity Debounce Time
impact: MEDIUM
impactDescription: Prevent noisy activity feeds by batching CRDT edits into single records
tags: debounce, crdt, setActivityDebounceTime, batching, edits, noise
---

## Configure CRDT Activity Debounce Time

Without debouncing, every CRDT keystroke generates a separate activity record, flooding the activity feed. Use `setActivityDebounceTime()` to batch edits within a time window into a single record.

**Incorrect (no debounce — every keystroke creates an activity record):**

```jsx
// Default behavior: typing "Hello" generates 5 separate activity records
// H → record, e → record, l → record, l → record, o → record
// This floods the activity feed with noise
```

**Correct (debounce CRDT edits into batched records):**

```jsx
import { useVeltClient } from '@veltdev/react';

function EditorSetup() {
  const { client } = useVeltClient();

  useEffect(() => {
    // Batch all CRDT edits within 5-second windows into single records
    const crdtElement = client.getCrdtElement();
    crdtElement.setActivityDebounceTime(5000); // 5000ms = 5 seconds
  }, [client]);

  return <YourEditor />;
}
```

**For non-React frameworks:**

```js
const crdtElement = Velt.getCrdtElement();
crdtElement.setActivityDebounceTime(5000); // 5 seconds
```

**Key details:**
- Parameter is in **milliseconds** (e.g., 5000 = 5 seconds)
- **Default: 10 minutes (600,000ms)** — without setting this, edits are batched every 10 minutes
- **Minimum: 10 seconds (10,000ms)** — values below 10,000ms are ignored
- Called on the **CRDT element** (`getCrdtElement()`), not the activity element
- All edits within the debounce window are batched into a single activity record
- Lower values = more granular records; higher values = less noise

**Verification:**
- [ ] `setActivityDebounceTime()` called with a reasonable value (2000-10000ms)
- [ ] Activity feed shows batched CRDT entries instead of per-keystroke entries
- [ ] Method called on CRDT element, not activity element

**Source Pointer:** https://docs.velt.dev/async-collaboration/activity/overview - CRDT edits, setActivityDebounceTime
