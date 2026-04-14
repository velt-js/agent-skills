---
title: Handle Huddle Webhook Events
impact: MEDIUM
impactDescription: Server-side webhooks fire when huddles are created or users join
tags: huddle, webhooks, events, server, created, joined
---

## Huddle Webhook Events

Velt fires webhook events when huddle actions occur. Two event types are available: `created` (a new huddle is started) and `joined` (a user joins an existing huddle). Configure webhook endpoints in the Velt Console to receive these events on your server.

**Why this matters:**

Webhooks enable server-side reactions to huddle activity such as logging analytics, sending notifications to offline users, triggering recording pipelines, or updating activity feeds. Without webhooks, huddle events are only available client-side.

**Webhook event types:**

- `created` — Fired when a user starts a new huddle session
- `joined` — Fired when a user joins an existing huddle session

**Webhook payload structure:**

```json
{
  "actionType": "created",
  "actionUser": {
    "email": "user@example.com",
    "name": "Alice",
    "userId": "user-123"
  },
  "metadata": {
    "apiKey": "YOUR_API_KEY",
    "clientDocumentId": "project-alpha",
    "pageInfo": {
      "baseUrl": "https://app.example.com",
      "path": "/projects/alpha",
      "title": "Project Alpha"
    },
    "locations": []
  }
}
```

**Server-side handler example (Node.js/Express):**

```javascript
app.post("/webhooks/velt-huddle", (req, res) => {
  const { actionType, actionUser, metadata } = req.body;

  switch (actionType) {
    case "created":
      console.log(`${actionUser.name} started a huddle on ${metadata.clientDocumentId}`);
      // Log to analytics, notify team, start recording
      break;
    case "joined":
      console.log(`${actionUser.name} joined a huddle on ${metadata.clientDocumentId}`);
      // Update activity feed, track participation
      break;
  }

  res.status(200).json({ received: true });
});
```

**Configuration steps:**

1. Go to the Velt Console (console.velt.dev)
2. Navigate to webhook configuration
3. Add your server endpoint URL
4. Select huddle events to subscribe to
5. Save the configuration

**Key behaviors:**

- Webhooks are sent as HTTP POST requests with JSON payload
- The `actionUser` object contains the user who triggered the event
- The `metadata` object includes document context and page information
- Webhooks fire regardless of client-side event subscriptions

**Verification:**
- [ ] Webhook endpoint is configured in Velt Console
- [ ] Server handles POST requests at the configured endpoint
- [ ] Both `created` and `joined` event types are handled
- [ ] Response returns 200 status to acknowledge receipt
- [ ] Webhook payload is parsed correctly for `actionType`, `actionUser`, and `metadata`

**Source Pointers:**
- `https://docs.velt.dev/huddle/webhook-events` - Huddle webhook events
