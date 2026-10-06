---
title: Set Up Email Notifications with SendGrid
impact: MEDIUM
impactDescription: Deliver notifications via email for @mentions and replies
tags: email, sendgrid, delivery, setup, templates
---

## Set Up Email Notifications with SendGrid

Velt can send email notifications through your SendGrid account when a user is @mentioned in a comment or someone replies to their comment. For any other email provider, trigger emails yourself from webhooks. A notification for a private comment is only emailed to users who can see that comment.

**Incorrect (expecting automatic email without setup):**

```jsx
// Email notifications won't work without SendGrid configuration
<VeltNotificationsTool />
```

**Correct (configure SendGrid in Velt Console):**

**Setup Steps:**

1. **Get SendGrid credentials**: a SendGrid API key and a SendGrid Email Template ID for the Comments feature
2. **Configure in Velt Console**: open Configurations > [Email Service](https://console.velt.dev/dashboard/config/email) and enter the API key, Template ID, and 'From' email address
3. **Whitelist the sender**: the 'From' address must be whitelisted in your SendGrid account, or sending fails
4. **Enable Email Channel**: keep the `email` channel enabled in notification settings

**Email Trigger Events:**

| Event | Triggers Email |
|-------|---------------|
| @mention in comment | Yes |
| Reply to user's comment | Yes |
| New comment (no mention) | No (unless user has ALL setting) |

**Email Template Data (for customization):**

When customizing email templates, these fields are available:

```javascript
// Fields Velt sends to your SendGrid template
const templateFields = {
  firstComment: {},        // Comment: only commentId, commentText, from
  latestComment: {},       // Comment that prompted the email
  prevComment: {},         // Comment before latestComment
  commentsCount: '1',      // Total comments in the annotation
  commentsCountMoreThanThree: '0',
  fromUser: {},            // Action user (User)
  commentAnnotation: {},   // CommentAnnotation without `comments`
  actionType: 'newlyAdded', // Same values as the basic webhook action types
  documentMetadata: {},    // DocumentMetadata
};
// Older fields (message, messageFromName, name, fromEmail, photoUrl, pageUrl,
// pageTitle, deviceInfo, subject) are still sent but will be deprecated.
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
- [ ] SendGrid API key and Template ID added under Email Service in the Velt Console
- [ ] 'From' email whitelisted in SendGrid
- [ ] Email channel enabled in settings config
- [ ] Test email received after @mention

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/notifications#email-notifications - "Email notifications" (SendGrid Integration, Email Template Data)
- https://docs.velt.dev/async-collaboration/notifications/overview#notifications-for-private-comments - "Notifications for Private Comments"
