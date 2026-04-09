---
title: Use useActivityUtils to Create Custom Activity Records
impact: HIGH
impactDescription: Emit custom application events into the unified activity feed from React components
tags: useActivityUtils, createActivity, custom, react, hook, displayMessageTemplate
---

## Use useActivityUtils to Create Custom Activity Records

Use `useActivityUtils()` to access the activity element and call `createActivity()` to push custom events (deployments, status changes, escalations) into the unified activity feed alongside Velt-generated records.

**Incorrect (missing template data for variables):**

```jsx
import { useActivityUtils } from '@veltdev/react';

function DeployButton() {
  const activityElement = useActivityUtils();

  const logDeploy = async () => {
    await activityElement?.createActivity({
      featureType: 'custom',
      actionType: 'custom',
      targetEntityId: 'deploy-123',
      // Template uses {{version}} but no templateData provided — renders raw {{version}}
      displayMessageTemplate: '{{actionUser.name}} deployed {{version}}',
    });
  };

  return <button onClick={logDeploy}>Deploy</button>;
}
```

**Correct (custom activity with template data):**

```jsx
import { useActivityUtils } from '@veltdev/react';

function DeployButton({ version }) {
  const activityElement = useActivityUtils();

  const logDeploy = async () => {
    await activityElement?.createActivity({
      featureType: 'custom',
      actionType: 'custom',
      targetEntityId: 'deploy-123',
      displayMessageTemplate: '{{actionUser.name}} deployed version {{version}}',
      displayMessageTemplateData: {
        version: version  // Must match {{version}} in template
      },
    });
  };

  return <button onClick={logDeploy}>Deploy v{version}</button>;
}
```

**More examples:**

```jsx
// Status change
await activityElement?.createActivity({
  featureType: 'custom',
  actionType: 'custom',
  targetEntityId: 'task-456',
  displayMessageTemplate: '{{actionUser.name}} changed status to {{status}}',
  displayMessageTemplateData: { status: 'In Review' },
});

// User assignment
await activityElement?.createActivity({
  featureType: 'custom',
  actionType: 'custom',
  targetEntityId: 'ticket-789',
  displayMessageTemplate: '{{actionUser.name}} assigned {{assignee}} to this ticket',
  displayMessageTemplateData: { assignee: 'Jane Smith' },
});
```

**CreateActivityData — complete schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `featureType` | `ActivityFeatureType` | Yes | `'comment'` \| `'reaction'` \| `'recorder'` \| `'crdt'` \| `'custom'` |
| `actionType` | `string` | Yes | `'custom'` or a specific action name |
| `targetEntityId` | `string` | Required for `'custom'` | ID of the entity being acted upon |
| `targetSubEntityId` | `string \| null` | No | ID of sub-entity within target (e.g., comment within thread) |
| `displayMessageTemplate` | `string` | No | Template with `{{variable}}` placeholders |
| `displayMessageTemplateData` | `Record<string, unknown>` | No | Key-value pairs for template interpolation |
| `id` | `string` | No | Optional Firestore doc ID — use for idempotent writes (same ID = same record) |
| `eventType` | `string` | No | Sub-event type within the action |
| `changes` | `ActivityChanges` | No | Before/after field changes: `{ [key]: { from, to } }` |
| `entityData` | `unknown` | No | Full entity object snapshot at time of action |
| `entityTargetData` | `unknown` | No | Full target entity object snapshot at time of action |
| `actionIcon` | `string` | No | Icon URL or identifier for custom action |

**Built-in template variables:**
- `{{actionUser.name}}` — automatically populated with the current user's name
- `{{assignee.name}}` — populated if assignee context exists

**Key details:**
- `createActivity()` returns `Promise<void>` — await it for error handling
- Check `activityElement` is not null before calling (use optional chaining `?.`)
- Every `{{variable}}` in the template must have a matching key in `displayMessageTemplateData` (except built-in variables like `{{actionUser.name}}`)
- Custom activities appear with `featureType: 'custom'` and can be filtered accordingly

**Verification:**
- [ ] `activityElement` null-checked before calling createActivity
- [ ] All template variables have matching keys in displayMessageTemplateData
- [ ] featureType and actionType set appropriately
- [ ] targetEntityId identifies the relevant entity

**Source Pointer:** https://docs.velt.dev/async-collaboration/activity/setup - Create a Custom Activity (Using Hook)
