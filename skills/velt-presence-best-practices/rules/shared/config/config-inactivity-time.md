---
title: Configure Inactivity and Offline Timeouts
impact: HIGH
impactDescription: Controls when users appear as away or offline in presence
tags: inactivity, offline, idle, away, timeout, presence-config
---

## Configure When Users Show as Away and Offline

Velt tracks user activity and automatically transitions presence status based on idle time and tab focus. You can customize these thresholds to match your application's needs.

**How presence status transitions work:**

| Event | Effect | Default Threshold |
|-------|--------|-------------------|
| User stops interacting | `onlineStatus` becomes `'away'`, `isUserIdle` becomes `true` | 300000ms (5 min) |
| User remains idle longer | User goes fully offline, removed from active presence | 600000ms (10 min) |
| Tab loses focus | `isTabAway` becomes `true`, `onlineStatus` becomes `'away'` | Immediate |

**Why this matters:**

Default timeouts may not suit every app. A real-time design tool needs fast away detection (30 seconds), while a document editor can tolerate longer idle periods. Setting these correctly ensures presence indicators accurately reflect who is actively engaged.

**React: Configure on the VeltPresence component**

```jsx
import { VeltPresence } from "@veltdev/react";

function Toolbar() {
  return (
    <VeltPresence
      inactivityTime={30000}
      offlineInactivityTime={600000}
    />
  );
}
```

**HTML: Configure via attributes**

```html
<velt-presence
  inactivity-time="30000"
  offline-inactivity-time="600000"
></velt-presence>
```

**API: Configure programmatically**

```javascript
const presenceElement = client.getPresenceElement();
presenceElement.setInactivityTime(30000);
presenceElement.setOfflineInactivityTime(600000);
```

**Recommended values by app type:**

| App Type | inactivityTime | offlineInactivityTime |
|----------|---------------|----------------------|
| Real-time canvas/whiteboard | 30000 (30s) | 120000 (2 min) |
| Document editor | 300000 (5 min) | 600000 (10 min) |
| Dashboard/viewer | 600000 (10 min) | 1800000 (30 min) |

**Tab focus behavior:**

When a user switches to another browser tab, Velt immediately sets `isTabAway` to `true` and `onlineStatus` to `'away'`, regardless of the `inactivityTime` setting. This gives collaborators instant feedback that someone has shifted their attention.

**Verification:**
- [ ] `inactivityTime` is set to an appropriate value for your app type
- [ ] `offlineInactivityTime` is greater than `inactivityTime`
- [ ] Away status triggers at the expected time when a user stops interacting
- [ ] Tab switching immediately shows the user as away
- [ ] Users fully disappear from presence after the offline timeout

**Source Pointers:**
- `https://docs.velt.dev/presence/customize-behavior/set-inactivity-time` - Inactivity configuration
