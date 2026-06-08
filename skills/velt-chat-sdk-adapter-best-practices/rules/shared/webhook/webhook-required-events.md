---
title: Required Webhook Events to Enable
impact: HIGH
tags: webhook, events, comment.add, comment_annotation.add, reaction_add, reaction_delete, Velt Console
---

## Required Webhook Events

Enable these events in **Velt Console → Configurations → Webhook Service** for the bot to function:

### Minimum Required Events

| Event | Purpose |
|-------|---------|
| `comment.add` | Detects new comments (including @-mentions of the bot) |
| `comment_annotation.add` | Detects new comment threads being created |

### For Reaction Support

| Event | Purpose |
|-------|---------|
| `comment.reaction_add` | Detects reactions added to comments |
| `comment.reaction_delete` | Detects reactions removed from comments |

### Optional Events for Richer Bots

| Event | Purpose |
|-------|---------|
| `comment.update` | Comment text was edited |
| `comment.delete` | Comment was removed |
| `comment_annotation.status_change` | Thread status changed (open/resolved) |
| `comment_annotation.assign` | Thread assigned to a user |

### Webhook URL

Set the endpoint URL to your deployed webhook route:
- **Production:** `https://yourapp.com/api/webhooks/velt`
- **Local dev:** `https://your-ngrok-url.ngrok.io/api/webhooks/velt`

### Key Points

- At minimum, enable `comment.add` — without it, the bot won't receive any mentions
- The adapter filters events it doesn't recognize, so enabling extra events is safe
- Each enabled event type generates a webhook POST for every occurrence across all documents in the organization
