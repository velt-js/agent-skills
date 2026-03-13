---
title: Integrate with External Services via Webhooks
impact: MEDIUM
impactDescription: Forward notifications to Slack, Linear, or custom services
tags: webhooks, slack, linear, integration, external
---

## Integrate with External Services via Webhooks

Use webhooks to forward Velt notifications to external services like Slack, Linear, or your own backend.

**Incorrect (no webhook integration):**

```jsx
// Notifications only in-app
// No external service integration
```

**Correct (configure webhooks in Velt Console):**

**Setup Steps:**

1. **Go to Velt Console**: [console.velt.dev](https://console.velt.dev) > Settings > Webhooks
2. **Add Webhook URL**: Your endpoint that receives POST requests
3. **Select Events**: Choose which events trigger the webhook
4. **Configure Secret**: Add webhook secret for verification

**Webhook Payload Structure:**

```javascript
// Your webhook endpoint receives:
{
  "event": "notification.created",
  "data": {
    "id": "notification-id",
    "organizationId": "org-id",
    "documentId": "doc-id",
    "actionUser": {
      "userId": "user-123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "displayHeadlineMessageTemplate": "{actionUser} mentioned you",
    "displayBodyMessage": "Check this out!",
    "notifyUsers": ["user-456"],
    "timestamp": 1722409519944,
    "notificationSource": "comment",  // or "custom"
    "notificationSourceData": {
      // Comment annotation or custom data
    },

    // Per-user notification config (added in v5.0.1-beta.4)
    // Exactly ONE of these two fields is present per payload, depending on config scope.
    // Each is a map of userId → NotificationChannelConfig.
    // NotificationChannelConfig: Record<channelId, 'ALL' | 'MINE' | 'NONE'>
    //   e.g. { "inbox": "ALL", "email": "MINE" }

    // Present when an org-level config is active for the notified users:
    "usersOrganizationNotificationsConfig": {
      "user-123": { "inbox": "ALL", "email": "MINE" },
      "user-456": { "inbox": "NONE", "email": "NONE" }
    },

    // — OR — present when a document-level config is active:
    "usersDocumentNotificationsConfig": {
      "user-123": { "inbox": "MINE", "email": "ALL" }
    }
  }
}
```

**Accessing per-user config in your webhook handler:**

```javascript
app.post('/webhooks/velt', async (req, res) => {
  const { event, data } = req.body;

  if (event === 'notification.created') {
    // Exactly one config field is present per payload
    const userConfigs =
      data.usersOrganizationNotificationsConfig ||
      data.usersDocumentNotificationsConfig;

    if (userConfigs) {
      // userConfigs is keyed by userId
      // each value is a map of channel ID → 'ALL' | 'MINE' | 'NONE'
      Object.entries(userConfigs).forEach(([userId, channelPrefs]) => {
        console.log(`User ${userId} email pref: ${channelPrefs.email}`);
      });
    }
  }

  res.status(200).send('OK');
});
```

**Example: Slack Integration**

```javascript
// Your webhook handler
app.post('/webhooks/velt', async (req, res) => {
  const { event, data } = req.body;

  // Verify webhook signature (recommended)
  const signature = req.headers['x-velt-signature'];
  if (!verifySignature(req.body, signature)) {
    return res.status(401).send('Invalid signature');
  }

  if (event === 'notification.created') {
    // Forward to Slack
    await fetch('https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `${data.actionUser.name}: ${data.displayHeadlineMessageTemplate}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${data.actionUser.name}* mentioned someone\n${data.displayBodyMessage}`
            }
          }
        ]
      })
    });
  }

  res.status(200).send('OK');
});
```

**Example: Linear Integration**

```javascript
// Create Linear issue from notification
app.post('/webhooks/velt', async (req, res) => {
  const { event, data } = req.body;

  if (event === 'notification.created' && data.notificationSource === 'comment') {
    await linearClient.issueCreate({
      title: `Comment from ${data.actionUser.name}`,
      description: data.displayBodyMessage,
      teamId: 'your-team-id'
    });
  }

  res.status(200).send('OK');
});
```

**Webhook Events:**

| Event | Description |
|-------|-------------|
| `notification.created` | New notification created |
| `comment.added` | New comment added |
| `comment.updated` | Comment content updated |
| `comment.deleted` | Comment deleted |

**Add Channel to Settings:**

```jsx
// Let users control Slack notifications
notificationElement.setSettingsInitialConfig([
  {
    id: 'slack',
    name: 'Slack',
    enable: true,
    default: 'MINE',
    values: [
      { id: 'ALL', name: 'All Updates' },
      { id: 'MINE', name: 'Mentions Only' },
      { id: 'NONE', name: 'None' }
    ]
  }
]);
```

**Delay and Batching Carve-Out:**

Webhooks and workflow triggers always fire immediately. They are not subject to the opt-in `delayConfig` or `batchConfig` pipeline introduced in v5.0.1-beta.4 — even if those settings are enabled on the workspace, webhook delivery is unaffected.

**Verification:**
- [ ] Webhook URL configured in Console
- [ ] Endpoint handles POST requests
- [ ] Signature verification implemented
- [ ] External service receives notifications
- [ ] Confirmed webhooks fire immediately regardless of workspace delay/batch config
- [ ] Handler checks for `usersOrganizationNotificationsConfig` OR `usersDocumentNotificationsConfig` (exactly one present) when per-user config is active

**Source Pointer:** https://docs.velt.dev/webhooks/basic - Webhook setup
