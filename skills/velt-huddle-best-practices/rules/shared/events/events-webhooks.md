---
title: Handle Huddle Webhook Events
impact: MEDIUM
impactDescription: Server-side webhooks fire when huddles are created or users join
tags: huddle, webhooks, events, server, created, joined, huddle.create, huddle.join, HuddlePayload, notificationSource
---

## Huddle Webhook Events

Velt sends a webhook when a user creates a huddle or joins one. The payload shape depends on which webhook service you enabled in the Velt Console: Basic (v1) or Advanced (v2, Enterprise). Handle the shape you actually receive.

**Why this matters:**

Basic webhooks identify huddle events with `notificationSource: "huddle"` and `actionType`. Advanced webhooks use `event` names (`huddle.create`, `huddle.join`) and nest the details under `data`. A handler written for one shape silently ignores the other.

**Incorrect (no source check, reads fields from the wrong level):**

```javascript
app.post("/webhooks/velt", (req, res) => {
  const { actionType, actionUser } = req.body; // undefined for Advanced (v2) payloads
  if (actionType === "created") notifyTeam(actionUser.name); // also fires for comment events
  res.sendStatus(200);
});
```

**Correct (Basic / v1 payload):**

```javascript
app.post("/webhooks/velt", (req, res) => {
  const body = req.body;
  if (body.notificationSource === "huddle") {
    const { actionType, actionUser, metadata } = body;
    // actionType: "created" | "joined" (the Basic Webhooks table lists the join action as "join")
    if (actionType === "created") {
      notifyTeam(`${actionUser.name} started a huddle on ${metadata.clientDocumentId}`);
    } else if (actionType === "joined" || actionType === "join") {
      trackParticipation(actionUser.userId, metadata.clientDocumentId);
    }
  }
  res.sendStatus(200);
});
```

**Correct (Advanced / v2 payload):**

```javascript
app.post("/webhooks/velt", (req, res) => {
  // Verify the signature first (see Advanced Webhooks: "Verifying webhook signatures")
  const { event, data } = req.body; // WebhookV2Payload; data is a HuddlePayload
  switch (event) {
    case "huddle.create":
      notifyTeam(`${data.actionUser?.name} started a huddle`);
      break;
    case "huddle.join":
      trackParticipation(data.actionUser?.userId, data.metadata);
      break;
  }
  res.sendStatus(200);
});
```

**Basic (v1) huddle payload fields:**

| Field | Notes |
|---|---|
| `actionType` | `created` or `joined` |
| `notificationSource` | `"huddle"` |
| `actionUser` | User who created or joined |
| `metadata` | `apiKey`, `clientDocumentId`, `documentId`, `pageInfo`, and `locations` when set |
| `platform` | `"sdk"` |

**Key behaviors:**

- Enable webhooks in the Velt Console (Configurations > Webhook Service) and add your endpoint URL
- Return a 2xx response quickly; Advanced webhooks expect it within 15 seconds
- Basic webhooks can carry an optional auth token in the `Authorization` header (`Basic YOUR_AUTH_TOKEN`); payloads may be Base64-encoded or encrypted if you enabled those options
- Advanced webhook triggers for huddles are controlled by the workspace `triggers.huddle` config (`HuddleTrigger`)

**Verification:**
- [ ] Handler checks `notificationSource === "huddle"` (v1) or `event` starts with `huddle.` (v2)
- [ ] Both create and join events are handled
- [ ] Advanced webhooks verify signatures before processing
- [ ] Endpoint returns 2xx promptly
- [ ] Encoded or encrypted payloads are decoded when those options are enabled

**Source Pointers:**
- https://docs.velt.dev/webhooks/basic#huddle-events - "Huddle Events"
- https://docs.velt.dev/webhooks/advanced#huddle - "Huddle" event types
- https://docs.velt.dev/api-reference/sdk/models/data-models#huddlepayload - `HuddlePayload`
- https://docs.velt.dev/api-reference/sdk/models/data-models#webhookv2payload - `WebhookV2Payload`
