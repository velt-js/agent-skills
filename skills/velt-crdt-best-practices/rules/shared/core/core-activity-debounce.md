---
title: Use setActivityDebounceTime() to Control CRDT Activity Flush Frequency
impact: MEDIUM
impactDescription: Prevents excessive activity records from batched editor keystrokes
tags: activity, debounce, crdt-element, editor-edit, performance
---

## Use setActivityDebounceTime() to Control CRDT Activity Flush Frequency

By default, Velt batches CRDT editor keystrokes into a single activity log record over a 10-minute batching window before flushing to the activity log feed. Call `setActivityDebounceTime()` on `CrdtElement` to tune the batching window duration — use a shorter window for near-real-time audit trails, or a longer one to reduce write volume.

**Incorrect (relying on the 10-minute default when a different cadence is needed):**

```typescript
// Default batching window is 600,000 ms (10 minutes) — too long for audit trail use cases
const crdtElement = client.getCrdtElement();
// No debounce configuration; activity records are batched for a full 10-minute window
```

**Correct (React / Next.js — 30-second batching window):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function CrdtActivityDebounceSetup() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const crdtElement = client.getCrdtElement();

    // Batch CRDT editor edit activities over a 30-second window before flushing
    // Default: 600000 (10 minutes) | Minimum enforced: 10000 (10 seconds)
    crdtElement.setActivityDebounceTime(30000);
  }, [client]);
}
```

**Correct (Other Frameworks — Angular, Vue, Vanilla JS):**

```typescript
// Obtain CrdtElement after Velt client is initialized
const crdtElement = client.getCrdtElement();

// Batch CRDT editor edit activities over a 30-second window before flushing
crdtElement.setActivityDebounceTime(30000);
```

**Parameter Reference:**

| Parameter | Type | Default | Minimum | Description |
|-----------|------|---------|---------|-------------|
| `time` | `number` | `600000` (10 min) | `10000` (10 sec) | Batching window duration in milliseconds |

Values below 10,000 ms (10 seconds) are silently clamped to the enforced minimum.

**Verification Checklist:**
- [ ] `setActivityDebounceTime()` called after Velt client is initialized
- [ ] `time` value is at or above the enforced minimum of 10,000 ms
- [ ] Batching window chosen to match audit trail / write-volume requirements
- [ ] Call placed inside a `useEffect` with `[client]` dependency (React)

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core - CRDT Setup and CrdtElement methods
- https://docs.velt.dev/api-reference/sdk/models/data-models#activitysubscribeconfig - ActivitySubscribeConfig
