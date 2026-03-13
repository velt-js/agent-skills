---
title: Configure Notification Delay and Batching Pipeline
impact: MEDIUM
impactDescription: Reduce notification noise by holding, suppress-if-seen, and batching before delivery
tags: delay, batching, pipeline, notificationServiceConfig, server-side, workspace
---

## Configure Notification Delay and Batching Pipeline

An opt-in, server-side pipeline lets you hold notifications during a configurable window, suppress delivery if the recipient views the comment before the window expires, and batch high-activity documents or users — all configured in your workspace's `notificationServiceConfig`. Webhooks and workflow triggers are never affected; they always fire immediately.

**Incorrect (expecting delay/batching without workspace config):**

```javascript
// No notificationServiceConfig set on the workspace
// Notifications deliver immediately with no delay or batching
```

**Correct (configure notificationServiceConfig on your workspace):**

```javascript
// Set via Velt REST API or Velt Console on your workspace object
{
  "notificationServiceConfig": {
    "delayConfig": {
      "isEnabled": true,
      "delaySeconds": 30
    },
    "batchConfig": {
      "document": {
        "isEnabled": true,
        "batchWindowSeconds": 300,
        "maxActivities": 20
      },
      "user": {
        "isEnabled": true,
        "batchWindowSeconds": 300,
        "maxActivities": 20
      }
    }
  }
}
```

**Config Field Reference:**

| Field | Type | Description |
|-------|------|-------------|
| `delayConfig.isEnabled` | boolean | Master toggle for the delay step. |
| `delayConfig.delaySeconds` | number | Seconds to hold a notification before proceeding. |
| `batchConfig.document.isEnabled` | boolean | Toggle document-level batching. |
| `batchConfig.document.batchWindowSeconds` | number | Accumulation window in seconds for a single document. |
| `batchConfig.document.maxActivities` | number | Early-flush threshold per document (default: 20). |
| `batchConfig.user.isEnabled` | boolean | Toggle user-level batching. |
| `batchConfig.user.batchWindowSeconds` | number | Accumulation window in seconds per recipient user. |
| `batchConfig.user.maxActivities` | number | Early-flush threshold per user (default: 20). |

**Pipeline Order:**

When both `delayConfig` and `batchConfig` are enabled, the stages chain in this order:

1. **Delay** — Hold the notification for `delaySeconds`.
2. **Seen check** — If the recipient views the comment during the delay window, suppress the notification (suppress-if-seen semantics).
3. **Batch** — Accumulate surviving notifications within `batchWindowSeconds` or until `maxActivities` is reached.
4. **Deliver** — Send the batched digest to the recipient.

Each stage is independent: you can enable delay only, batching only, or both. Document-level and user-level batching also operate independently of each other.

**Important:** This pipeline is server-side only and opt-in. Webhooks and workflow triggers always fire immediately, regardless of any delay or batch configuration.

**Verification:**
- [ ] `notificationServiceConfig` set at the workspace level (not per-document)
- [ ] `delayConfig.isEnabled` and `batchConfig.*.isEnabled` toggled as needed
- [ ] Pipeline order understood: delay → seen check → batch → deliver
- [ ] Webhook endpoints confirmed as unaffected by this config

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/overview - Notifications overview
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior - Notification delivery configuration
