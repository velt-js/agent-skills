---
title: Subscribe to CRDT updateData Events with Observable Pattern
impact: HIGH
impactDescription: Enables real-time reactions to CRDT data changes on the client side
tags: crdt, events, subscription, updateData, observable
---

## Subscribe to CRDT updateData Events with Observable Pattern

`CrdtElement.on("updateData")` returns an Observable that emits a `CrdtUpdateDataEvent` whenever CRDT data changes. Use `.subscribe()` on the returned Observable and clean up the subscription on unmount to avoid memory leaks.

**Incorrect (callback-style pattern that does not exist):**

```typescript
// Wrong: on() does not accept a callback as the second argument
const crdtElement = client.getCrdtElement();
crdtElement.on('updateData', (data) => {
  console.log(data);
});
```

**Correct (React / Next.js using useCrdtEventCallback hook):**

```jsx
import { useCrdtEventCallback } from "@veltdev/react";
import { useEffect } from "react";

export function CrdtChangeListener() {
  // Hook: automatically subscribes and cleans up
  const crdtUpdateData = useCrdtEventCallback("updateData");

  useEffect(() => {
    console.log("[CRDT] event on data change: ", crdtUpdateData);
  }, [crdtUpdateData]);

  return <div>Listening for changes</div>;
}
```

**Correct (React / Next.js using API with Observable):**

```jsx
import { useVeltClient } from "@veltdev/react";
import { useEffect } from "react";

export function CrdtChangeListener() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;

    const crdtElement = client.getCrdtElement();

    // on() returns an Observable — call .subscribe() on it
    const subscription = crdtElement.on("updateData").subscribe((eventData) => {
      console.log("[CRDT] event on data change: ", eventData);
      // eventData structure:
      // {
      //   methodName: string,
      //   uniqueId: string,
      //   timestamp: number,
      //   source: string,
      //   payload: {
      //     id: string,
      //     data: unknown,
      //     lastUpdatedBy: string,
      //     sessionId: string | null,
      //     lastUpdate: string
      //   }
      // }
    });

    return () => subscription.unsubscribe();
  }, [client]);

  return <div>Listening for changes</div>;
}
```

**Correct (Other Frameworks — Observable pattern):**

```html
<script>
const crdtElement = Velt.getCrdtElement();

// on() returns an Observable — call .subscribe()
crdtElement.on("updateData").subscribe((eventData) => {
  console.log("[CRDT] event on data change: ", eventData);
});
</script>
```

**Event types:**

```typescript
interface CrdtUpdateDataEvent {
  methodName: string;              // Method that triggered the update
  uniqueId: string;                // Unique event ID
  timestamp: number;               // Unix timestamp
  source: string;                  // Source identifier
  payload: CrdtUpdateDataPayload;  // Update data
}

interface CrdtUpdateDataPayload {
  id: string;                      // Editor/store ID
  data: unknown;                   // Updated content
  lastUpdatedBy: string;           // User ID of last editor
  sessionId: string | null;        // Session ID
  lastUpdate: string;              // ISO timestamp of last update
}
```

**Verification Checklist:**
- [ ] Use `.subscribe()` on the Observable returned by `on("updateData")` (not a callback argument)
- [ ] Subscription is cleaned up on component unmount via `subscription.unsubscribe()`
- [ ] Or use `useCrdtEventCallback("updateData")` hook for automatic lifecycle management

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core - on("updateData") event subscription
