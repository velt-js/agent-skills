---
title: Set Up Basic Webhooks and Handle Their Payloads
impact: HIGH
impactDescription: Basic webhooks are the main server-side signal for comments, huddles, and CRDT; wrong action names or decryption code drop events
tags: webhooks, basic, v1, events, comments, huddle, crdt, authorization, encoding, encryption, accessDeniedUsers, visibility
---

## Set Up Basic Webhooks and Handle Their Payloads

Basic webhooks POST a `WebhookV1Payload` to one endpoint URL for Comments, Huddle, and CRDT events. Enable them in the Velt Console (Configurations > Webhook Service) or with `POST /v2/workspace/webhookconfig/update`. Each payload carries `webhookId`, `actionType`, `notificationSource` (`comment`, `huddle`, `crdt`, or `recorder`), and optional `actionUser`, `metadata`, and `platform`.

**Incorrect (wrong auth header check, wrong huddle action, single-key decryption):**

```javascript
app.post('/velt/webhook', (req, res) => {
  if (req.headers.authorization !== process.env.VELT_WEBHOOK_TOKEN) return res.sendStatus(401); // missing "Basic " prefix
  if (req.body.notificationSource === 'huddle' && req.body.actionType === 'joined') { /* never fires */ }
  res.sendStatus(200);
});
```

**Correct (`Basic` token, documented action types, acknowledge fast):**

```javascript
const express = require('express');
const app = express();
app.use(express.json({ limit: '5mb' }));

app.post('/velt/webhook', (req, res) => {
  if (req.headers.authorization !== `Basic ${process.env.VELT_WEBHOOK_TOKEN}`) {
    return res.status(401).send('Unauthorized');
  }
  res.status(200).send('OK'); // acknowledge first, process asynchronously

  const { actionType, notificationSource, metadata, accessDeniedUsers = [] } = req.body;
  if (notificationSource === 'comment' && (actionType === 'newlyAdded' || actionType === 'added')) {
    enqueueCommentFanout(req.body, { skipUserIds: accessDeniedUsers });
  } else if (notificationSource === 'huddle' && actionType === 'join') {
    enqueueHuddleJoin(metadata);
  } else if (notificationSource === 'crdt' && actionType === 'updateData') {
    enqueueCrdtSync(req.body);
  }
});
```

### Action types

**Comments:** `newlyAdded` (first comment in a thread), `added` (later comments), `updated`, `deleted`, `approved`, `accepted`, `rejected` (Moderator Mode), `assigned`, `statusChanged`, `priorityChanged`, `accessModeChanged`, `reactionAdded`, `reactionDeleted`, `subscribed`, `unsubscribed`, `suggestionAccepted`, `suggestionRejected`. The two suggestion events are opt-in and off by default.

**Huddle:** `created`, `join`.

**CRDT:** `updateData`, debounced at 5 seconds.

When notification settings are configured, payloads also include `usersOrganizationNotificationsConfig` or `usersDocumentNotificationsConfig`.

### Enable and configure via REST

```bash
POST https://api.velt.dev/v2/workspace/webhookconfig/update
{ "data": {
    "useWebhookService": true,
    "webhookServiceConfig": {
      "authToken": "webhook_auth_token_here",
      "rawNotificationUrl": "https://example.com/webhooks/raw",
      "processedNotificationUrl": "https://example.com/webhooks/processed"
    }
} }
```

On first enable, default triggers are seeded: standard comment and all huddle triggers on, **CRDT and recorder triggers off**, and the suggestion triggers off until you enable them. Turn on the ones you need through `webhookServiceConfig.triggers`.

### Security: auth token, encoding, encryption

- **Auth token:** when set, Velt sends it in the `Authorization` header as `Basic YOUR_AUTH_TOKEN`.
- **Encoding (optional):** the payload arrives as `{ "encodedPayload": "<base64>" }`; decode with `JSON.parse(Buffer.from(encodedPayload, 'base64').toString('utf-8'))`.
- **Encryption (optional):** the payload arrives as `{ encryptedData, encryptedKey, iv }`. The AES-256-CBC key is itself encrypted with your RSA public key (PKCS1 OAEP, SHA-256). Provide the public key as a base64 string without PEM headers (2048-bit recommended).

```javascript
const crypto = require('crypto');

function decryptVeltWebhook({ encryptedData, encryptedKey, iv }, privateKeyBase64) {
  const symmetricKey = crypto.privateDecrypt(
    {
      key: `-----BEGIN RSA PRIVATE KEY-----\n${privateKeyBase64}\n-----END RSA PRIVATE KEY-----`,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    Buffer.from(encryptedKey, 'base64')
  );
  const decipher = crypto.createDecipheriv('aes-256-cbc', symmetricKey, Buffer.from(iv, 'base64'));
  let json = decipher.update(encryptedData, 'base64', 'utf8');
  json += decipher.final('utf8');
  return JSON.parse(json);
}
```

### Private comments: `visibility` and `accessDeniedUsers`

Notifications for private comments carry a `visibility` object (`type`: `public`, `organizationPrivate`, or `restricted`, plus `userIds` / `organizationIds` / `organizationId`) and an `accessDeniedUsers` list of client user IDs denied by your Permission Provider or by the comment's visibility. Drop those users from your own fan-out. Never use these fields to widen who you forward to. Public comments carry no `visibility` key.

**Verification Checklist:**
- [ ] Webhook is enabled in the Console or via `/v2/workspace/webhookconfig/update`, and CRDT / recorder / suggestion triggers are turned on explicitly if needed
- [ ] The `Authorization` header is compared against `Basic <token>`
- [ ] Handlers branch on `notificationSource` + `actionType` using the documented names (`newlyAdded`, `join`, `updateData`, ...)
- [ ] Encoded payloads are base64-decoded; encrypted payloads decrypt `encryptedKey` with RSA-OAEP (SHA-256) before AES-256-CBC
- [ ] `accessDeniedUsers` are removed from any downstream fan-out
- [ ] The endpoint returns 2xx quickly and processes work asynchronously
- [ ] CRDT handlers expect 5-second debounced updates, not every keystroke

**Source Pointers:**
- https://docs.velt.dev/webhooks/basic - "Basic Webhooks"
- https://docs.velt.dev/webhooks/basic#comment-visibility - "Comment Visibility"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/webhookconfig-update - "Update Webhook Config"
- https://docs.velt.dev/api-reference/sdk/models/data-models#webhookv1payload - "WebhookV1Payload"
