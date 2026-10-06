---
title: Use useCrdtUtils() and useCrdtEventCallback() Hooks for CRDT Operations
impact: MEDIUM
impactDescription: Provides React-idiomatic access to CrdtElement methods and CRDT event subscriptions
tags: crdt, react, hooks, utils, events
---

## Use useCrdtUtils() and useCrdtEventCallback() Hooks for CRDT Operations

React apps should use `useCrdtUtils()` for CrdtElement operations (webhooks, activity debounce) and `useCrdtEventCallback()` for subscribing to CRDT events, instead of manually calling `client.getCrdtElement()`.

**Incorrect (manual CrdtElement access in React):**

```tsx
import { useVeltClient } from '@veltdev/react';

function CrdtSetup() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    // Manual access bypasses React lifecycle patterns
    const crdtElement = client.getCrdtElement();
    crdtElement.enableWebhook();
  }, [client]);
}
```

**Correct (useCrdtUtils hook for CrdtElement methods):**

```tsx
import { useCrdtUtils } from "@veltdev/react";
import { useEffect } from "react";

export function CrdtWebhookSetup() {
  const crdtUtils = useCrdtUtils();

  useEffect(() => {
    if (!crdtUtils) return;

    // Enable webhook
    crdtUtils.enableWebhook();

    // Optional: Change webhook debounce time (minimum 5 seconds)
    crdtUtils.setWebhookDebounceTime(10 * 1000); // 10 seconds

    // Set activity debounce
    crdtUtils.setActivityDebounceTime(30000); // 30 seconds
  }, [crdtUtils]);

  return <div>CRDT Configured</div>;
}
```

**Correct (useCrdtEventCallback hook for event subscriptions):**

```tsx
import { useCrdtEventCallback } from "@veltdev/react";
import { useEffect } from "react";

export function CrdtEventListener() {
  // Automatically subscribes to updateData events and cleans up on unmount
  const crdtUpdateData = useCrdtEventCallback("updateData");

  useEffect(() => {
    if (crdtUpdateData) {
      console.log("[CRDT] event on data change: ", crdtUpdateData);
    }
  }, [crdtUpdateData]);

  return <div>Listening for CRDT events</div>;
}
```

**Hook Reference:**

| Hook | Returns | Description |
|------|---------|-------------|
| `useCrdtUtils()` | `CrdtElement \| undefined` | Access CrdtElement methods (enableWebhook, disableWebhook, setWebhookDebounceTime, setActivityDebounceTime, message-stream methods) |
| `useCrdtEventCallback(action)` | `CrdtEventTypesMap[action]` | Latest payload for the event, with automatic cleanup. `"updateData"` yields a `CrdtUpdateDataEvent` (null until the first event). |

**Verification Checklist:**
- [ ] `useCrdtUtils()` used instead of `client.getCrdtElement()` in React components
- [ ] `useCrdtEventCallback("updateData")` used instead of manual `crdtElement.on("updateData").subscribe()`
- [ ] Hook null checks performed before calling methods
- [ ] Hooks called inside components wrapped by `VeltProvider`

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#usecrdtutils - useCrdtUtils() and useCrdtEventCallback()
- https://docs.velt.dev/api-reference/sdk/api/api-methods#usecrdtutils - CRDT utility methods
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core#step-4-event-subscriptions-optional - Event subscriptions
