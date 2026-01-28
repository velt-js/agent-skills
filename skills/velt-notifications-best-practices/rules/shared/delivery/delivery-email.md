---
title: Set Up Email Notifications with SendGrid
impact: MEDIUM
impactDescription: Deliver notifications via email for @mentions and replies
tags: email, sendgrid, delivery, setup, templates
---

## Set Up Email Notifications with SendGrid

Velt uses SendGrid for email notification delivery. Email notifications are triggered by @mentions and comment replies by default.

**Incorrect (expecting automatic email without setup):**

```jsx
// Email notifications won't work without SendGrid configuration
<VeltNotificationsTool />
```

**Correct (configure SendGrid in Velt Console):**

**Setup Steps:**

1. **Get SendGrid API Key**: Create account at [sendgrid.com](https://sendgrid.com) and generate API key
2. **Configure in Velt Console**: Go to [console.velt.dev](https://console.velt.dev) > Settings > Email
3. **Set Sender Email**: Configure verified sender email address
4. **Enable Email Channel**: Ensure email is enabled in notification settings

**Email Trigger Events:**

| Event | Triggers Email |
|-------|---------------|
| @mention in comment | Yes |
| Reply to user's comment | Yes |
| New comment (no mention) | No (unless user has ALL setting) |

**Email Template Data (for customization):**

When customizing email templates, these fields are available:

```javascript
{
  // Comment data
  firstComment: { /* first comment in thread */ },
  latestComment: { /* most recent comment */ },
  prevComment: { /* previous comment in thread */ },

  // User data
  fromUser: { /* user who triggered notification */ },

  // Context
  commentAnnotation: { /* full annotation object */ },
  actionType: 'mention' | 'reply',
  documentMetadata: { /* document info */ }
}
```

**User Email Settings:**

```jsx
// Configure default email behavior for new users
notificationElement.setSettingsInitialConfig([
  {
    id: 'email',
    name: 'Email',
    enable: true,
    default: 'MINE',  // Only email on direct mentions/replies
    values: [
      { id: 'ALL', name: 'All Updates' },
      { id: 'MINE', name: 'Mentions & Replies' },
      { id: 'NONE', name: 'Never' }
    ]
  }
]);
```

**User Can Update Settings:**

```jsx
// Users can change their email preferences
const notificationElement = client.getNotificationElement();
notificationElement.setSettings({
  email: 'NONE'  // Disable email notifications
});
```

**Verification:**
- [ ] SendGrid API key added to Velt Console
- [ ] Sender email verified in SendGrid
- [ ] Email channel enabled in settings config
- [ ] Test email received after @mention

**Source Pointer:** https://docs.velt.dev/async-collaboration/comments/notifications - Email section
