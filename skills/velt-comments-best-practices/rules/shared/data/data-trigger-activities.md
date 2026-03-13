---
title: Use triggerActivities to Create Activity Records via REST API
impact: MEDIUM
impactDescription: Ensures comment additions via REST API are reflected in the activity feed when workspace-level activity tracking is enabled
tags: rest-api, activity, trigger, commentannotations, data-model
---

## Use triggerActivities to Create Activity Records via REST API

When adding comments via the `POST /v2/commentannotations/add` REST endpoint, set `triggerActivities: true` on each `CommentData` entry to automatically create an activity record for that comment. Without this flag the comment is persisted but no activity record is generated, even if the workspace has `activityServiceConfig` enabled.

Note: `triggerActivities` creates activity records; `triggerNotification` sends notifications. These are independent flags — one does not imply the other.

**Prerequisite:** The workspace must have `activityServiceConfig` enabled at the workspace level before `triggerActivities` has any effect.

**Incorrect (omitting triggerActivities when activity tracking is required):**

```json
// POST /v2/commentannotations/add — activity record will NOT be created
{
  "commentAnnotations": [
    {
      "commentData": [
        {
          "from": { "userId": "user-1", "email": "user@example.com" },
          "commentText": "This needs review",
          "triggerNotification": true
        }
      ]
    }
  ]
}
```

**Correct (set triggerActivities: true on the CommentData entry):**

```json
// POST /v2/commentannotations/add — activity record is created automatically
{
  "commentAnnotations": [
    {
      "commentData": [
        {
          "from": { "userId": "user-1", "email": "user@example.com" },
          "commentText": "This needs review",
          "triggerNotification": true,
          "triggerActivities": true
        }
      ]
    }
  ]
}
```

**Field Reference — CommentData schema (v5.0.2-beta.7):**

| Field | Type | Default | Description |
|---|---|---|---|
| `triggerActivities` | `boolean` | `false` | When `true`, an activity record is automatically created for this comment addition. Requires workspace `activityServiceConfig` to be enabled. Set at the individual `CommentData` level, not the annotation level. |
| `triggerNotification` | `boolean` | `false` | When `true`, sends a notification to mentioned or subscribed users. Independent of `triggerActivities`. |

**Verification Checklist:**
- [ ] `triggerActivities` is set inside `commentData[]`, not at the `commentAnnotations[]` level
- [ ] Workspace has `activityServiceConfig` enabled before relying on this flag
- [ ] `triggerActivities` and `triggerNotification` are set independently based on requirements
- [ ] Request body uses `commentData` (array) as the key, not `comments`

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-api/commentannotations - POST /v2/commentannotations/add endpoint reference
- https://docs.velt.dev/async-collaboration/activity/overview - Activity Service overview and activityServiceConfig
