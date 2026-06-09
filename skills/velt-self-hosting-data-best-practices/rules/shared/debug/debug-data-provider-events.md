---
title: Monitor Data Provider Events for Troubleshooting
impact: LOW-MEDIUM
impactDescription: Real-time visibility into SDK-to-backend data flow
tags: debug, monitor, subscribe, dataProvider, events, troubleshooting, webhooks
---

## Monitor Data Provider Events for Troubleshooting

Use `client.on('dataProvider').subscribe()` to monitor all data provider interactions in real time. This reveals timeout errors, response format issues, and multipart parsing failures.

**Incorrect (debugging with console.log in every handler):**

```jsx
// Scattered logging in every resolver function — messy and incomplete
const fetchComments = async (request) => {
  console.log('Fetching comments...', request);
  const result = await fetch('/api/comments/get', { /* ... */ });
  console.log('Got comments:', result);
  return result;
};
```

**Correct (centralized data provider monitoring):**

```jsx
import { useVeltClient } from '@veltdev/react';

function DataProviderMonitor() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;

    const subscription = client.on('dataProvider').subscribe((event) => {
      // `moduleName` identifies which module triggered the resolver call —
      // use it to trace which provider/operation any given event belongs to.
      console.log('Data Provider Event:', {
        type: event.type,           // 'get', 'save', 'delete'
        moduleName: event.moduleName, // 'comment', 'attachment', 'recorder', 'notification', 'activity', 'anonymousUser', 'user'
        status: event.status,       // Success or failure details
        data: event.data            // Request/response data
      });
    });

    return () => subscription?.unsubscribe();
  }, [client]);

  return null;
}

// Add to your app during development
<VeltProvider apiKey="KEY" dataProviders={dataProviders}>
  <DataProviderMonitor />
  <YourApp />
</VeltProvider>
```

For non-React frameworks the subscription shape is identical — use the global `Velt` instance:

```javascript
const subscription = Velt.on('dataProvider').subscribe((event) => {
  console.log('Data Provider Event:', event);
  console.log('Module Name:', event.moduleName);
});

// Unsubscribe when done
subscription?.unsubscribe();
```

**Common issues revealed by monitoring:**

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Timeout events | `resolveTimeout` too low | Increase timeout to match backend p99 |
| Response format errors | Missing `success` or `statusCode` | Return standard `{ data, success, statusCode }` |
| Attachment save failures | Backend expecting JSON | Parse `multipart/form-data` for attachment save |
| Data not persisting | Provider set after `identify()` | Move `dataProviders` to VeltProvider prop |
| Get returns empty | Wrong query structure | Check documentId/organizationId extraction |

**Important: email notifications with self-hosted data**

When self-hosting comment data, SendGrid email notifications are not available. Instead:
1. Enable webhooks for comment events (mentions, replies)
2. Webhook payload includes annotation IDs (not content)
3. Query your database for the actual comment content
4. Assemble and send emails via your own email provider

For deeper inspection beyond log output, use the [Velt Chrome DevTools extension](https://chromewebstore.google.com/detail/velt-devtools/nfldoicbagllmegffdapcnohakpamlnl) — it surfaces the same provider events plus internal SDK state.

**Verification:**
- [ ] `dataProvider` subscription active during development
- [ ] Events log `event.moduleName` (so you can tell which provider triggered each call)
- [ ] Events show successful roundtrips for all operations
- [ ] No timeout or format errors in the logs
- [ ] Subscription cleaned up on unmount
- [ ] Webhook-based email notifications set up if needed

**Source Pointer:** https://docs.velt.dev/self-host-data/overview - "Debugging"; https://docs.velt.dev/self-host-data/comments - Debugging, Email Notifications
