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

**Incorrect (expecting other orgs' notifications without opting in):**

```jsx
// Default: For You only shows notifications from the current organization
<VeltNotificationsTool />
```

**Correct (opt in once, from one place):**

```jsx
<VeltNotificationsTool enableCrossOrganization={true} />
```

### React: Enable via Props

The `enableCrossOrganization` prop works on both `VeltNotificationsTool` and `VeltNotificationsPanel`. It accepts `boolean`, a `CrossOrganizationConfig` object, or a JSON config string.

```jsx
{/* Enable with defaults — pulls from all orgs the user belongs to */}
<VeltNotificationsTool enableCrossOrganization={true} />
<VeltNotificationsPanel enableCrossOrganization={true} />

{/* Enable with specific org allowlist */}
<VeltNotificationsTool enableCrossOrganization={{
    organizationIds: ['org-1', 'org-2'],
}} />
<VeltNotificationsPanel enableCrossOrganization={{
    organizationIds: ['org-1', 'org-2'],
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
});

// Disable
notificationElement.disableCrossOrganization();

// Equivalent: passing { enabled: false } routes to disable
// notificationElement.enableCrossOrganization({ enabled: false });

// Read current config
const config = notificationElement.getCrossOrganizationConfig();

// Subscribe to config changes
const subscription = notificationElement.getCrossOrganizationConfig$().subscribe((config) => {
    console.log('Cross-org config:', config);
});

// Clean up when done
subscription?.unsubscribe();
```

### HTML: Enable via Attributes

```html
<!-- Enable with defaults -->
<velt-notifications-tool enable-cross-organization="true"></velt-notifications-tool>
<velt-notifications-panel enable-cross-organization="true"></velt-notifications-panel>

<!-- Enable with config (JSON string) -->
<velt-notifications-tool enable-cross-organization='{"organizationIds":["org-1","org-2"]}'>
</velt-notifications-tool>
```

### CrossOrganizationConfig Fields

| Property | Type | Default | Notes |
|----------|------|---------|-------|
| `enabled` | `boolean` | `true` | Set to `false` to disable (equivalent to `disableCrossOrganization()`) |
| `organizationIds` | `string[]` | None | Allowlist; when omitted, all indexed orgs are eligible |
| `excludeOrganizationIds` | `string[]` | None | Additional orgs to exclude. Current org always excluded |
| `feeds` | `('forYou' \| 'all')[]` | None | Only `'forYou'` is supported; `'all'` is ignored with a warning |

**Equivalences:** Passing `{ enabled: false }` to `enableCrossOrganization()` is the same as calling `disableCrossOrganization()`. Passing `null` or calling without arguments opts in with all defaults.

**Shared setting:** `enableCrossOrganization` is a shared notification-service flag. Setting it on `VeltNotificationsTool`, on `VeltNotificationsPanel`, or through the API changes the feed for both components, and the last write wins. Configure it in one place.

**Interaction with user-scoped notifications:** If you also enable `enableUserScopedNotifications`, user-scoped notifications outrank cross-organization ones on ID collision in the "All" tab. Cross-organization "For You" behavior is otherwise unchanged (see `config-user-scoped-notifications`).

### Verification

- [ ] `enableCrossOrganization` is configured from one place (tool prop, panel prop, or API), since it is a shared flag
- [ ] "For You" tab shows notifications from other orgs the user belongs to
- [ ] Current org notifications are not duplicated
- [ ] `enableCrossOrganization({ enabled: false })` reverts to single-org behavior

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#enablecrossorganization - "enableCrossOrganization"
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#getcrossorganizationconfig - "getCrossOrganizationConfig"
- https://docs.velt.dev/api-reference/sdk/models/data-models#crossorganizationconfig - "CrossOrganizationConfig"
- https://docs.velt.dev/ui-customization/reference/behaviors/notifications - "enableCrossOrganization" (global via the shared service)
