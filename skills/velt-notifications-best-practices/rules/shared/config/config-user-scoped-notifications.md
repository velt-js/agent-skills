---
title: Enable User-Scoped Notifications So Unread Items Stay in the For You Tab
impact: MEDIUM
impactDescription: Without it, unread notifications on documents outside the org's 15 most recently active documents vanish from the For You tab and the unread badge
tags: enableUserScopedNotifications, disableUserScopedNotifications, UserScopedNotificationsConfig, enable-user-scoped-notifications, for-you, unread-count, limit
---

## Enable User-Scoped Notifications So Unread Items Stay in the For You Tab

By default the "For You" tab and the unread count are built from the organization's 15 most recently active documents. An unread notification on a document outside that window is not fetched, so it disappears from the tab and the badge until that document becomes active again. Opt in to `enableUserScopedNotifications` to also fetch the signed-in user's newest notifications for the current organization directly, independent of that window.

**Incorrect (relying on the default window in a busy organization):**

```jsx
// Default: For You + unread count come only from the 15 most recently active documents.
// A user with an unread @mention on an older document sees no badge and no row for it.
<VeltNotificationsTool />
```

**Correct (React / Next.js, using props):**

```jsx
import { VeltNotificationsTool } from '@veltdev/react';

// Enable with the default limit of 25
<VeltNotificationsTool enableUserScopedNotifications={true} />

// Or enable with a custom limit (clamped to [1, 200])
<VeltNotificationsTool enableUserScopedNotifications={{ limit: 60 }} />
```

**Correct (React / Next.js, using the API):**

```jsx
import { useEffect } from 'react';
import { useNotificationUtils } from '@veltdev/react';

function UserScopedNotificationsSetup() {
  const notificationElement = useNotificationUtils();

  useEffect(() => {
    if (!notificationElement) return;
    // Safe to call before identify()/setDocument(); it latches until the first full fetch
    notificationElement.enableUserScopedNotifications({ limit: 60 });
  }, [notificationElement]);

  return null;
}

// Turn it back off (keeps the configured limit):
// notificationElement.disableUserScopedNotifications();
```

**Correct (Other Frameworks):**

```html
<!-- Default limit of 25 -->
<velt-notifications-tool enable-user-scoped-notifications="true"></velt-notifications-tool>

<!-- Custom limit as a JSON string -->
<velt-notifications-panel enable-user-scoped-notifications='{"limit":60}'></velt-notifications-panel>

<script>
  const notificationElement = Velt.getNotificationElement();
  notificationElement.enableUserScopedNotifications({ limit: 60 });
  // notificationElement.disableUserScopedNotifications();
</script>
```

**UserScopedNotificationsConfig:**

| Property | Type | Default | Notes |
|----------|------|---------|-------|
| `enabled` | `boolean` | `true` | `false` disables (same as `disableUserScopedNotifications()`) and keeps the configured `limit`. |
| `limit` | `number` | `25` | Max user-scoped notifications fetched. Clamped to `[1, 200]`; non-numeric, non-finite, or values below `1` fall back to `25`. |

Passing `null` or no argument to `enableUserScopedNotifications()` opts in with all defaults. The prop accepts a `boolean`, a `UserScopedNotificationsConfig` object, or a JSON string; the HTML attribute accepts `"true"` / `"false"` or a JSON string.

**Behavior to know:**
- Default is off. The setting is shared: the prop on `VeltNotificationsTool`, the prop on `VeltNotificationsPanel`, and the API all write the same flag, so the last write wins. Drive it from one place.
- The fetch runs on full fetches only and is suppressed under `enableCurrentDocumentOnly()`; the narrower scope wins.
- Results merge into the "For You" store (deduped by `notificationId`) and additively into the "All" tab. In "All", document notifications win on ID collision, and user-scoped notifications outrank cross-organization ones.
- Switching organization or document clears the stores; the next full fetch re-applies the setting, so nothing carries across organizations.
- The first load after opting in at a busy organization can surface previously invisible unread notifications in one batch. The unread count is capped at `limit`.
- Requires matching backend support. Against an older backend it falls back to the windowed behavior instead of failing.
- `enableUserScopedNotifications({ enabled: false })` enabled the feature instead of disabling it before SDK 6.0.9; on older builds call `disableUserScopedNotifications()`. The `enableUserScopedNotifications` prop / attribute requires 6.0.9 or later; the API methods shipped in 6.0.8.

**Verification Checklist:**
- [ ] Enabled from exactly one place (tool prop, panel prop, or API), not several with different values
- [ ] `limit` set to a value in `[1, 200]` if the default of 25 is too small
- [ ] Not combined with `enableCurrentDocumentOnly()` when the goal is an org-wide For You feed
- [ ] Unread badge and For You tab show notifications for documents outside the recently active window
- [ ] Disabling uses `disableUserScopedNotifications()` (or `{ enabled: false }` on 6.0.9+)

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#enableuserscopednotifications - "enableUserScopedNotifications"
- https://docs.velt.dev/async-collaboration/notifications/customize-behavior#disableuserscopednotifications - "disableUserScopedNotifications"
- https://docs.velt.dev/api-reference/sdk/models/data-models#userscopednotificationsconfig - "UserScopedNotificationsConfig"
- https://docs.velt.dev/ui-customization/reference/behaviors/notifications - "enableUserScopedNotifications" (shared service flag, last write wins)
