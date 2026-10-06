---
title: Forward Notifications to External Services via Webhooks
impact: MEDIUM
impactDescription: Correct payload parsing, per-user preference routing, and private-comment filtering when forwarding notifications to Slack, Linear, or your backend
tags: webhooks, basic-webhooks, advanced-webhooks, actionType, event, usersOrganizationNotificationsConfig, usersDocumentNotificationsConfig, accessDeniedUsers, visibility, private-comments, slack
---

## Forward Notifications to External Services via Webhooks

Velt webhooks deliver comment, huddle, CRDT (and, on advanced webhooks, recorder) events to your endpoint so you can fan notifications out to Slack, Linear, email, or custom channels. There is no `notification.created` event. Basic (V1) webhooks send a flat payload keyed by `actionType`; advanced (V2, Enterprise) webhooks send `{ event, source, data }`. When users have notification settings, the payload also carries their per-user channel preferences, and private-comment events carry `visibility` (plus `accessDeniedUsers` on basic webhooks) so you never forward a private comment to someone who cannot see it.

**Incorrect (invented event name, ignoring preferences and visibility):**

```javascript
app.post('/webhooks/velt', async (req, res) => {
  const { event, data } = req.body;
  if (event === 'notification.created') {   // No such event
    await postToSlack(data.notifyUsers);    // Ignores channel prefs and accessDeniedUsers
  }
  res.status(200).send('OK');
});
```

**Correct (basic webhooks: Comments action types):**

```javascript
// Basic webhooks: enable under Configurations > Webhook Service in the Velt Console.
// Optional auth token arrives as "Authorization: Basic YOUR_AUTH_TOKEN".
app.post('/webhooks/velt', async (req, res) => {
  if (req.headers.authorization !== `Basic ${process.env.VELT_WEBHOOK_TOKEN}`) {
    return res.status(401).send('Unauthorized');
  }

  const payload = req.body; // Base64-decode / decrypt first if you enabled encoding or encryption
  const { actionType, notificationSource, commentAnnotation, actionUser, metadata } = payload;

  if (notificationSource === 'comment' && ['newlyAdded', 'added'].includes(actionType)) {
    // Exactly one of these is present when users have notification settings
    const prefs =
      payload.usersOrganizationNotificationsConfig ||
      payload.usersDocumentNotificationsConfig ||
      {};
    // Private comment: drop users who cannot see it
    const denied = new Set(payload.accessDeniedUsers ?? []);

    const recipients = Object.entries(prefs)
      .filter(([userId, channels]) => !denied.has(userId) && channels.slack !== 'NONE')
      .map(([userId]) => userId);

    await notifySlack(recipients, {
      from: actionUser?.name,
      document: metadata?.documentName,
      annotationId: commentAnnotation?.annotationId,
    });
  }

  res.status(200).send('OK');
});
```

**Correct (advanced webhooks: `event` + `data`, signed with Svix-style headers):**

```javascript
// Verify webhook-id, webhook-timestamp, webhook-signature against the raw body first
app.post('/webhooks/velt-advanced', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!verifyVeltSignature(req.headers, req.body)) return res.status(401).end();

  const { event, source, data, usersOrganizationNotificationsConfig } = JSON.parse(req.body);

  if (event === 'comment.add') {
    // Private comments carry data.visibility; treat it as informational only
    const visibility = data.visibility; // undefined for public comments
    await enqueueFanOut({ data, visibility, prefs: usersOrganizationNotificationsConfig });
  }

  res.status(200).end(); // Respond with 2xx within 15 seconds; queue heavy work
});
```

**Event names:**

| Webhook type | Field | Comment values (examples) |
|---|---|---|
| Basic (V1) | `actionType` + `notificationSource` | `newlyAdded`, `added`, `updated`, `deleted`, `assigned`, `statusChanged`, `priorityChanged`, `accessModeChanged`, `reactionAdded`, `subscribed`, ... Huddle: `created`, `join`. CRDT: `updateData`. |
| Advanced (V2) | `event` | `comment_annotation.add`, `comment_annotation.assign`, `comment_annotation.status_change`, `comment.add`, `comment.update`, `comment.delete`, `comment.reaction_add`, `huddle.create`, `huddle.join`, `crdt.update_data`, `recorder.done`, ... |

**Per-user notification preferences:** if you configured notification settings, each payload includes exactly one of `usersOrganizationNotificationsConfig` (org-level settings) or `usersDocumentNotificationsConfig` (document-level settings): a map of `userId` to `{ [channelId]: 'ALL' | 'MINE' | 'NONE' }`. Use it to honor custom channels (Slack, Linear) you added with `setSettingsInitialConfig()`.

**Private comments:**
- Velt sends comment notifications for a private comment only to users who can see it, on every channel, including the delete notification.
- Private-comment payloads carry a `visibility` object: `type` (`'public' | 'organizationPrivate' | 'restricted'`), `userIds`, `organizationIds`, `organizationId`. Public comments and pre-existing notifications have no `visibility` key.
- Basic webhooks also list `accessDeniedUsers` (client user IDs denied by your Permission Provider or by the comment's visibility). Drop those users from your own fan-out.
- Treat `visibility` and `accessDeniedUsers` as informational. Velt re-verifies visibility server-side; never use them to widen who you forward to.

**Delay and batching carve-out:** webhooks and workflow triggers always fire immediately. The opt-in delay and batching pipeline (`delivery-delay-batching`) never holds them.

**Verification:**
- [ ] Handler keys off `actionType` / `notificationSource` (basic) or `event` (advanced); no `notification.created`
- [ ] Basic webhook `Authorization: Basic <token>` checked, or advanced webhook signature verified on the raw body
- [ ] Encoded (Base64) or encrypted payloads decoded before parsing, if enabled
- [ ] Recipients filtered by `usersOrganizationNotificationsConfig` OR `usersDocumentNotificationsConfig` (only one is present)
- [ ] `accessDeniedUsers` removed from fan-out; `visibility` never used to add recipients
- [ ] Endpoint returns 2xx quickly (advanced webhooks fail after 15 seconds)

**Source Pointers:**
- https://docs.velt.dev/webhooks/basic - "Basic Webhooks" (setup, auth token, payload schema, list of action types)
- https://docs.velt.dev/webhooks/basic#comment-visibility - "Comment Visibility" (`visibility`, `accessDeniedUsers`)
- https://docs.velt.dev/webhooks/advanced - "Advanced Webhooks" (events, signature verification)
- https://docs.velt.dev/webhooks/advanced#comment-visibility - "Comment Visibility"
- https://docs.velt.dev/async-collaboration/notifications/overview#notifications-for-private-comments - "Notifications for Private Comments"
