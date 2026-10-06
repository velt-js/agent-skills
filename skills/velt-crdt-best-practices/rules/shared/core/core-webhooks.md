---
title: Use Webhooks to Listen for CRDT Data Changes
impact: HIGH
impactDescription: Enables server-side reactions to collaborative data changes
tags: webhooks, events, realtime, server-side, debounce
---

## Use Webhooks to Listen for CRDT Data Changes

CRDT stores emit the `crdt.update_data` webhook event so server-side systems can react to collaborative edits. Changes are debounced (default and minimum 5 seconds) to batch rapid edits. The docs disagree on the default state (the webhooks reference says enabled by default, the original v4 release note says disabled by default), so call `enableWebhook()` explicitly when your backend depends on these events.

**Incorrect (no server-side awareness of CRDT changes):**

```typescript
// Server has no way to know when collaborative data changes
const store = await createVeltStore({ id: 'doc', type: 'text', veltClient });
// Only client-side subscribe() is available
```

**Correct (enabling webhooks for server-side notifications):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function CrdtWebhookSetup() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const crdtElement = client.getCrdtElement();

    // Enable webhooks for CRDT data changes
    crdtElement.enableWebhook();

    // Optional: customize debounce time (default 5000ms, minimum 5000ms)
    crdtElement.setWebhookDebounceTime(10000);
  }, [client]);
}
```

**Correct (Other Frameworks):**

```js
const crdtElement = Velt.getCrdtElement();
crdtElement.enableWebhook();
crdtElement.setWebhookDebounceTime(10000); // minimum 5000 ms
```

**Subscribing to `updateData` Events (Client-Side):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function CrdtChangeListener() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const crdtElement = client.getCrdtElement();

    // on() returns an Observable — call .subscribe() on it
    const subscription = crdtElement.on("updateData").subscribe((eventData) => {
      console.log('CRDT data changed:', eventData);
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
| `setWebhookDebounceTime(ms)` | Set debounce interval in milliseconds (default: 5000, minimum: 5000) |

**Webhook payload structure (`crdt.update_data`, sent to your webhook URL):**

```json
{
  "event": "crdt.update_data",
  "actionType": "updateData",
  "source": "crdt",
  "platform": "sdk",
  "webhookId": "-OnuSfG_ffGIwNkodE2a",
  "data": {
    "actionUser": { "userId": "michael", "name": "Michael Scott", "organizationId": "org-1" },
    "crdtData": {
      "id": "crdt-array-demo-todos-1",
      "data": [{ "id": "seed-1", "text": "Welcome Todo", "completed": false }],
      "lastUpdatedBy": "michael",
      "sessionId": "tvLupvP0L2jiztlba4P0",
      "lastUpdate": "2026-03-17T06:23:24.514Z"
    },
    "metadata": {
      "apiKey": "YOUR_API_KEY",
      "document": { "documentId": "crdt-array-demo-doc-1", "documentName": "CRDT Array Demo" },
      "organization": { "organizationId": "org-1" }
    }
  }
}
```

`data` follows the `CRDTPayload` model: `crdtData.id` is the editor/store ID and `crdtData.data` is the current value for any store type (array, map, text, xml, or xmltext).

**Verification Checklist:**
- [ ] `enableWebhook()` called after Velt client initialized
- [ ] Webhook endpoint configured in Velt Console
- [ ] Debounce time tuned for your use case (minimum 5000ms)
- [ ] `updateData` event subscription cleaned up on unmount
- [ ] Webhook handler routes on `event === 'crdt.update_data'` and reads `data.crdtData`

**Source Pointers:**
- https://docs.velt.dev/webhooks/advanced#crdt - `crdt.update_data` event and sample payload
- https://docs.velt.dev/api-reference/sdk/models/data-models#crdtpayload - CRDTPayload
- https://docs.velt.dev/api-reference/sdk/api/api-methods#enablewebhook - enableWebhook(), disableWebhook(), setWebhookDebounceTime()
