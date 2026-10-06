---
title: Configure Notification Delay and Batching Pipeline
impact: MEDIUM
impactDescription: Reduce notification noise by holding, suppress-if-seen, and batching before delivery
tags: delay, batching, pipeline, notificationServiceConfig, server-side, workspace
---

## Configure Notification Delay and Batching Pipeline

An opt-in, server-side pipeline lets you hold notifications during a configurable window, suppress delivery if the recipient has already seen the activity, and batch high-activity documents or users. You configure it as the workspace's `notificationServiceConfig`, either in the [Velt Console](https://console.velt.dev/dashboard/config/notification) (API key notification settings) or with the Update Notification Config workspace REST API. It applies to all documents. Webhooks and workflow triggers are never affected; they always fire immediately.

**Incorrect (expecting delay/batching without workspace config):**

```javascript
// No notificationServiceConfig set on the workspace
// Notifications deliver immediately with no delay or batching
```

**Correct (configure notificationServiceConfig on your workspace):**

```javascript
// Server-side; the body is deep-merged with the stored config
await fetch('https://api.velt.dev/v2/workspace/notificationconfig/update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN, // API-key-level auth token
  },
  body: JSON.stringify({
    data: {
      useNotificationService: true,
      notificationServiceConfig: {
        delayConfig: { isEnabled: true, delaySeconds: 30 },
        batchConfig: {
          document: { isEnabled: true, batchWindowSeconds: 300, maxActivities: 20 },
          user: { isEnabled: true, batchWindowSeconds: 300, maxActivities: 20 },
        },
      },
    },
  }),
});
```

**Config Field Reference:**

| Field | Type | Description |
|-------|------|-------------|
| `delayConfig.isEnabled` | boolean | Master toggle for the delay step. |
| `delayConfig.delaySeconds` | number | Seconds to hold a notification. Integer `10` to `15552000` (6 months). |
| `batchConfig.document.isEnabled` | boolean | Toggle document-level batching. |
| `batchConfig.document.batchWindowSeconds` | number | Accumulation window per document. Integer `10` to `604800` (1 week). |
| `batchConfig.document.maxActivities` | number | Flush once this many activities accumulate. Integer `2` to `50`. |
| `batchConfig.user.isEnabled` | boolean | Toggle user-level batching. |
| `batchConfig.user.batchWindowSeconds` | number | Accumulation window per recipient. Integer `10` to `604800`. |
| `batchConfig.user.maxActivities` | number | Flush once this many activities accumulate. Integer `2` to `50`. |

**Pipeline Order:**

When both `delayConfig` and `batchConfig` are enabled, the stages chain in this order:

1. **Delay** — Hold the notification for `delaySeconds`.
2. **Seen check** — If the recipient views the comment during the delay window, suppress the notification (suppress-if-seen semantics).
3. **Batch** — Accumulate surviving notifications within `batchWindowSeconds` or until `maxActivities` is reached.
4. **Deliver** — Send the batched digest to the recipient.

Each stage is independent: you can enable delay only, batching only, or both. Document-level and user-level batching also operate independently of each other.

Out-of-range values are rejected with `INVALID_ARGUMENT`. Enabling the service for the first time (`useNotificationService: true`) seeds the default `comment` and `huddle` triggers but leaves delay and batching off until you set them. Read the current values with the Get Notification Config workspace API.

**Important:** This pipeline is server-side only and opt-in. Webhooks and workflow triggers always fire immediately, regardless of any delay or batch configuration.

**Verification:**
- [ ] `notificationServiceConfig` set at the workspace level (Console or `/v2/workspace/notificationconfig/update`), not per document
- [ ] Numeric fields are integers within the documented ranges
- [ ] `delayConfig.isEnabled` and `batchConfig.*.isEnabled` toggled as needed
- [ ] Pipeline order understood: delay → seen check → batch → deliver
- [ ] Webhook endpoints confirmed as unaffected by this config

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#batching-and-delay-configuration - "Batching and Delay Configuration"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/notificationconfig-update - "Update Notification Config"
- https://docs.velt.dev/api-reference/rest-apis/v2/workspace/notificationconfig-get - "Get Notification Config"
