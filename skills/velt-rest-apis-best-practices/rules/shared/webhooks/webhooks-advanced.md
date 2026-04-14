---
title: Webhook v2 (Enterprise) with Svix
impact: MEDIUM
impactDescription: Enterprise webhooks provide reliability guarantees and debugging tools essential for production integrations
tags: webhooks, svix, enterprise, retries, transformations
---

## Webhook v2 (Enterprise) with Svix

Velt Webhook v2 is an enterprise feature powered by Svix. It provides multiple endpoints, event filtering, retries, transformations, and a testing playground.

### Key Differences from v1

- Multiple endpoint URLs per organization
- Per-endpoint event type filtering
- Automatic retry with exponential backoff
- JavaScript transformation middleware
- Testing playground for debugging

### Event Types (v2 Format)

v2 uses dot-notation event type names:

| Event Type | Description |
|-----------|-------------|
| `comment_annotation.add` | New comment annotation created |
| `comment.add` | Comment added to annotation |
| `comment.update` | Comment text updated |
| `comment.delete` | Comment deleted |
| `comment_annotation.status_change` | Annotation status changed |
| `comment_annotation.priority_change` | Priority changed |
| `comment.reaction_add` | Reaction added |
| `comment.reaction_delete` | Reaction removed |
| `huddle.create` | Huddle session started |
| `huddle.join` | User joined huddle |
| `crdt.update_data` | CRDT data changed (5s debounce) |

### Retry Schedule

Failed deliveries are retried on this schedule:

1. Immediately
2. 5 seconds
3. 5 minutes
4. 30 minutes
5. 2 hours
6. 5 hours
7. 10 hours
8. 10 hours

After all retries are exhausted, the event is marked as failed. Your endpoint must return a 2xx status code within **15 seconds** or the delivery is considered failed.

### Transformations

Transformations are JavaScript functions that modify the webhook payload before delivery. Configure them per endpoint in the Svix dashboard.

```javascript
// Example transformation: flatten payload for a Slack webhook
function handler(webhook) {
  const { actionType, actionUser, metadata } = webhook.payload;

  return {
    text: `[${actionType}] ${actionUser.name} on document ${metadata.documentId}`
  };
}
```

Transformations run as middleware — they receive the original payload and must return the modified payload. Use them to:

- Reshape payloads for third-party services (Slack, PagerDuty, etc.)
- Filter out unwanted fields
- Add computed fields

### Endpoint Configuration

Each endpoint can be configured with:

- **URL** — The destination for webhook deliveries
- **Event types** — Filter which events this endpoint receives
- **Rate limit** — Maximum deliveries per second
- **Channels** — Logical grouping for multi-tenant routing
- **Transformation** — JavaScript function to modify payloads

### Testing

Use the Svix testing playground to:

1. Send test events to your endpoint
2. Inspect request/response details
3. Verify transformation output
4. Debug delivery failures

**Key points:**

- The 15-second timeout is strict — long-running processing should be done asynchronously after acknowledging the webhook.
- Transformations must be pure JavaScript (no external imports).
- Event type filtering reduces noise — subscribe each endpoint only to the events it needs.
- Retries use the same payload — ensure your handler is idempotent.
- Failed events can be manually retried from the Svix dashboard.

**Verification:**
- [ ] Endpoint returns 2xx within 15 seconds
- [ ] Handler logic is idempotent (safe to receive duplicate events)
- [ ] Event type filters are configured per endpoint
- [ ] Transformations return valid JSON
- [ ] Long-running processing is deferred (e.g., queue) after 2xx response

**Source Pointer:** `https://docs.velt.dev/webhooks/webhook-v2` (## Webhooks > ### Webhook v2 Enterprise)
