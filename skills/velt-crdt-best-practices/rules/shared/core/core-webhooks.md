---
title: Use Webhooks to Listen for CRDT Data Changes
impact: HIGH
impactDescription: Enables server-side reactions to collaborative data changes
tags: webhooks, events, realtime, server-side, debounce
---

## Use Webhooks to Listen for CRDT Data Changes

CRDT stores support webhook notifications for data changes, allowing server-side systems to react to collaborative edits. Webhooks are disabled by default and use a 5-second debounce to batch rapid changes.

**Incorrect (no server-side awareness of CRDT changes):**

```typescript
// Server has no way to know when collaborative data changes
const store = await createVeltStore({ id: 'doc', type: 'text', veltClient });
// Only client-side subscribe() is available
```

**Correct (enabling webhooks for server-side notifications):**

```jsx
import { useVeltClient } from '@veltdev/react';

function CrdtWebhookSetup() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const crdtElement = client.getCrdtElement();

    // Enable webhooks for CRDT data changes
    crdtElement.enableWebhook();

    // Optional: customize debounce time (default 5000ms)
    crdtElement.setWebhookDebounceTime(3000);
  }, [client]);
}
```

**Subscribing to `updateData` Events (Client-Side):**

```jsx
import { useVeltClient } from '@veltdev/react';

function CrdtChangeListener() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const crdtElement = client.getCrdtElement();

    const subscription = crdtElement.on('updateData', (data) => {
      console.log('CRDT data changed:', data);
    });

    return () => subscription.unsubscribe();
  }, [client]);
}
```

**Webhook Methods:**

| Method | Description |
|--------|-------------|
| `enableWebhook()` | Enable webhook notifications for CRDT data changes |
| `disableWebhook()` | Disable webhook notifications |
| `setWebhookDebounceTime(ms)` | Set debounce interval in milliseconds (default: 5000) |

**Verification Checklist:**
- [ ] `enableWebhook()` called after Velt client initialized
- [ ] Webhook endpoint configured in Velt Console
- [ ] Debounce time tuned for your use case
- [ ] `updateData` event subscription cleaned up on unmount

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/core - CRDT Setup
