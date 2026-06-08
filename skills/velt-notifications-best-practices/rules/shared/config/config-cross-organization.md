---
title: Configure Cross-Organization Notifications for Multi-Org Users
impact: MEDIUM
impactDescription: Without cross-organization configuration, users who belong to multiple organizations only see notifications from the current org in the "For You" tab
tags: cross-organization, enableCrossOrganization, disableCrossOrganization, CrossOrganizationConfig, multi-org, for-you, notifications
---

## Configure Cross-Organization Notifications for Multi-Org Users

When users belong to multiple organizations, the notification panel's "For You" tab shows only current-org notifications by default. The cross-organization feature merges notifications from other orgs the user belongs to into the "For You" feed.

**Key constraints:**
- This is opt-in — default behavior is unchanged unless explicitly enabled
- Only the "For You" feed is supported. The `'all'` feed value in `CrossOrganizationConfig.feeds` is silently ignored with a warning
- The current organization is always excluded from cross-org results (it's already shown by default)
- Default `maxOrganizations` is `20`

### React: Enable via Props

The `enableCrossOrganization` prop works on both `VeltNotificationsTool` and `VeltNotificationsPanel`. It accepts `boolean`, a `CrossOrganizationConfig` object, or a JSON config string.

```jsx
{/* Enable with defaults — pulls from all orgs the user belongs to */}
<VeltNotificationsTool enableCrossOrganization={true} />
<VeltNotificationsPanel enableCrossOrganization={true} />

{/* Enable with specific org allowlist and limit */}
<VeltNotificationsTool enableCrossOrganization={{
    organizationIds: ['org-1', 'org-2'],
    maxOrganizations: 10,
}} />
<VeltNotificationsPanel enableCrossOrganization={{
    organizationIds: ['org-1', 'org-2'],
    maxOrganizations: 10,
}} />
```

### React: Enable/Disable via API

```jsx
const notificationElement = useNotificationUtils();

// Enable with defaults
notificationElement.enableCrossOrganization();

// Enable with config
notificationElement.enableCrossOrganization({
    organizationIds: ['org-1', 'org-2'],
    maxOrganizations: 10,
});

// Disable (preferred pattern)
notificationElement.enableCrossOrganization({ enabled: false });

// Legacy alternative — equivalent to the above
// notificationElement.disableCrossOrganization();

// Read current config
const config = notificationElement.getCrossOrganizationConfig();

// Subscribe to config changes
const subscription = notificationElement.getCrossOrganizationConfig$().subscribe((config) => {
    console.log('Cross-org config:', config);
});
```

### HTML: Enable via Attributes

```html
<!-- Enable with defaults -->
<velt-notifications-tool enable-cross-organization="true"></velt-notifications-tool>
<velt-notifications-panel enable-cross-organization="true"></velt-notifications-panel>

<!-- Enable with config (JSON string) -->
<velt-notifications-tool enable-cross-organization='{"organizationIds":["org-1","org-2"],"maxOrganizations":10}'>
</velt-notifications-tool>
```

### CrossOrganizationConfig Fields

| Property | Type | Default | Notes |
|----------|------|---------|-------|
| `enabled` | `boolean` | `true` | Set to `false` to disable (equivalent to `disableCrossOrganization()`) |
| `organizationIds` | `string[]` | — | Allowlist; when omitted, all indexed orgs are eligible |
| `excludeOrganizationIds` | `string[]` | — | Additional orgs to exclude. Current org always excluded |
| `maxOrganizations` | `number` | `20` | Upper bound on orgs queried |
| `feeds` | `('forYou' \| 'all')[]` | — | Only `'forYou'` is supported; `'all'` is ignored with a warning |

**Equivalences:** Passing `{ enabled: false }` to `enableCrossOrganization()` is the same as calling `disableCrossOrganization()`. Passing `null` or calling without arguments opts in with all defaults.

### Verification

- [ ] `enableCrossOrganization` is set on both `VeltNotificationsTool` and `VeltNotificationsPanel`
- [ ] "For You" tab shows notifications from other orgs the user belongs to
- [ ] Current org notifications are not duplicated
- [ ] `enableCrossOrganization({ enabled: false })` reverts to single-org behavior

**Source Pointers:**
- `https://docs.velt.dev/async-collaboration/notifications/customize-behavior` — enableCrossOrganization, disableCrossOrganization, getCrossOrganizationConfig
