---
title: Webhook v1 Setup and Event Handling
impact: HIGH
impactDescription: Webhooks are the primary way to react to collaboration events server-side — missing events means broken workflows
tags: webhooks, events, comments, huddle, crdt, security
---

## Webhook v1 Setup and Event Handling

Webhooks deliver real-time event notifications from Velt to your server.

### Configuration

Configure webhooks in the Velt Console: **Configurations > Webhook Service**.

1. Enter your webhook endpoint URL.
2. Optionally set an auth token for request verification.
3. Select which event types to receive.

### Comment Events

| Action Type | Trigger |
|------------|---------|
| `newlyAdded` | First comment in a new annotation |
| `added` | Reply added to existing annotation |
| `updated` | Comment text edited |
| `deleted` | Comment deleted |
| `approved` | Comment marked as approved |
| `assigned` | Comment assigned to a user |
| `statusChanged` | Comment status changed (e.g., open to resolved) |
| `priorityChanged` | Comment priority changed |
| `reactionAdded` | Reaction emoji added to a comment |
| `reactionDeleted` | Reaction emoji removed from a comment |

### Huddle Events

| Action Type | Trigger |
|------------|---------|
| `created` | New huddle session started |
| `joined` | User joined an existing huddle |

### CRDT Events

| Action Type | Trigger |
|------------|---------|
| `updateData` | CRDT data changed (5-second debounce) |

### Payload Format

Every webhook POST delivers this structure:

```json
{
  "webhookId": "wh-123",
  "actionType": "added",
  "notificationSource": "comment",
  "actionUser": {
    "userId": "user-1",
    "name": "Alice",
    "email": "alice@example.com"
  },
  "metadata": {
    "organizationId": "org-123",
    "documentId": "doc-456",
    "annotationId": "ann-789"
  }
}
```

### Handling Webhooks (Node.js Example)

```javascript
const express = require("express");
const app = express();
app.use(express.json());

app.post("/velt/webhook", (req, res) => {
  const { actionType, notificationSource, actionUser, metadata } = req.body;

  if (notificationSource === "comment" && actionType === "added") {
    console.log(`${actionUser.name} commented on doc ${metadata.documentId}`);
  }

  res.status(200).send("OK");
});
```

### Security

**Auth token verification** — If configured, Velt sends your auth token in the request. Verify it before processing:

```javascript
app.post("/velt/webhook", (req, res) => {
  const token = req.headers["authorization"];
  if (token !== process.env.VELT_WEBHOOK_TOKEN) {
    return res.status(401).send("Unauthorized");
  }
  // process event...
  res.status(200).send("OK");
});
```

**Encrypted payloads** — Velt supports optional AES-256-CBC encryption with base64 encoding. When enabled, the payload body is encrypted and must be decrypted server-side before parsing:

```javascript
const crypto = require("crypto");

function decryptPayload(encrypted, key, iv) {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(key, "hex"),
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
}
```

**Key points:**

- CRDT `updateData` events are debounced at 5 seconds — you will not receive every keystroke.
- Your endpoint must return a 2xx status code or Velt will consider the delivery failed.
- The `notificationSource` field identifies the feature area: `comment`, `huddle`, or `crdt`.
- Encryption key and IV are configured in the Velt Console alongside the webhook URL.

**Verification:**
- [ ] Webhook URL is configured in Velt Console under Configurations > Webhook Service
- [ ] Endpoint returns 2xx status for all valid requests
- [ ] Auth token is verified if configured
- [ ] CRDT debounce behavior is accounted for in event handling
- [ ] Encrypted payloads are decrypted before parsing if encryption is enabled

**Source Pointer:** `https://docs.velt.dev/webhooks/overview` (## Webhooks > ### Setup & Events)
