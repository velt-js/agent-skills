---
title: Enable the comment and reaction webhook events the bot needs
impact: HIGH
impactDescription: Without comment.add the bot never sees mentions; without the reaction events onReaction never fires
tags: webhook, events, comment.add, comment_annotation.add, comment.reaction_add, comment.reaction_delete, Velt Console, webhookconfig
---

## Enable the comment and reaction webhook events the bot needs

In **Velt Console → Configurations → Webhook Service**, set your endpoint URL and enable these events, then copy the webhook secret (`whsec_...`) into `VELT_WEBHOOK_SECRET`:

| Event | Purpose |
|---|---|
| `comment.add` | New comments, including @-mentions of the bot |
| `comment_annotation.add` | New comment threads |
| `comment.reaction_add` | Reactions added (drives `onReaction`) |
| `comment.reaction_delete` | Reactions removed (drives `onReaction`) |

**Incorrect (mentions only):**

```text
Enabled events: comment_annotation.add
Result: replies inside existing threads never reach the bot, and onReaction never fires.
```

**Correct:**

```text
Endpoint: https://yourapp.com/api/webhooks/velt
Enabled events: comment.add, comment_annotation.add, comment.reaction_add, comment.reaction_delete
Secret: copied into VELT_WEBHOOK_SECRET
```

You can also configure the webhook with `POST /v2/workspace/webhookconfig/update`. Update the endpoint URL whenever you switch between a development tunnel and production.

**Verification Checklist:**
- [ ] All four events above are enabled
- [ ] The endpoint URL points at the deployed webhook route
- [ ] `VELT_WEBHOOK_SECRET` matches the secret shown in the Console

**Source Pointers:**
- https://docs.velt.dev/ai/chat-sdk-adapter — "Set up the Velt webhook"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/webhookconfig-update — webhook config REST API
- https://docs.velt.dev/webhooks/advanced — Velt webhooks
