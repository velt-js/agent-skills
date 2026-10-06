---
title: Configure Inactivity and Offline Timeouts
impact: HIGH
impactDescription: Controls when users appear as away or offline in presence
tags: inactivity, inactivityTime, offlineInactivityTime, offline, idle, away, timeout, presence-config
---

## Configure When Users Show as Away and Offline

Velt moves a user from online to away after `inactivityTime` without mouse or keyboard activity, and to offline after `offlineInactivityTime`. Both values are in **milliseconds**.

**How presence status transitions work:**

| Event | Effect | Default |
|-------|--------|---------|
| No mouse or keyboard activity | `onlineStatus` becomes `'away'`, `isUserIdle` becomes `true` | `inactivityTime`: 300000 ms (5 min) |
| Still inactive, or connection lost | `onlineStatus` becomes `'offline'` | `offlineInactivityTime`: 600000 ms (10 min) |
| Tab loses focus | `onlineStatus` becomes `'away'`, `isTabAway` becomes `true` | Immediate |

**Incorrect (offline threshold shorter than away threshold, or minutes instead of ms):**

```jsx
// offlineInactivityTime < inactivityTime is rejected and ignored
<VeltPresence inactivityTime={600000} offlineInactivityTime={120000} />

// 5 is read as 5 milliseconds, not 5 minutes
<VeltPresence inactivityTime={5} />
```

**Correct (React / Next.js):**

```jsx
import { VeltPresence } from "@veltdev/react";

function Toolbar() {
  return <VeltPresence inactivityTime={30000} offlineInactivityTime={600000} />;
}

// Or via API
const presenceElement = client.getPresenceElement();
presenceElement.setInactivityTime(30000);
```

**Correct (Other Frameworks):**

```html
<velt-presence inactivity-time="30000" offline-inactivity-time="600000"></velt-presence>
```

```js
const presenceElement = Velt.getPresenceElement();
presenceElement.setInactivityTime(30000);
```

**Recommended values by app type:**

| App Type | inactivityTime | offlineInactivityTime |
|----------|---------------|----------------------|
| Real-time canvas/whiteboard | 30000 (30s) | 120000 (2 min) |
| Document editor | 300000 (5 min) | 600000 (10 min) |
| Dashboard/viewer | 600000 (10 min) | 1800000 (30 min) |

**Key details:**

- `offlineInactivityTime` must be greater than or equal to `inactivityTime`; a smaller value is rejected (logged) and ignored
- `setInactivityTime()` is the documented API method; set `offlineInactivityTime` through the prop or attribute
- Tab blur sets `away` immediately, regardless of `inactivityTime`
- Losing the internet connection also marks the user offline

**Verification:**
- [ ] Both values are in milliseconds
- [ ] `offlineInactivityTime` >= `inactivityTime`
- [ ] Away status appears at the expected time when a user stops interacting
- [ ] Switching tabs immediately shows the user as away

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior#inactivitytime - "inactivityTime"
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior#offlineinactivitytime - "offlineInactivityTime"
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - "VeltPresence" prop behavior
