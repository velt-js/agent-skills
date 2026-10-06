---
title: Configure Cursor Inactivity Timeout
impact: MEDIUM
impactDescription: Control how long idle cursors stay visible; set it explicitly because the docs list two different defaults
tags: inactivity, timeout, inactivityTime, setInactivityTime, idle, cursor-visibility
---

## Configure Inactivity Time for Cursors

`inactivityTime` (milliseconds) controls how long a remote user's cursor stays visible after their last movement; after that the cursor is hidden. A user who unfocuses their tab is marked inactive immediately.

**Why this matters:**

Stale cursors mislead collaborators into thinking someone is still working in an area. The cursors feature page states a 5-minute default, while the API and component references list a 2-minute service baseline. Set the value explicitly so behavior does not depend on which default applies.

**Incorrect (relying on the default, or passing minutes):**

```jsx
<VeltCursor />                 {/* default differs between doc pages */}
<VeltCursor inactivityTime={5} /> {/* 5 ms, not 5 minutes */}
```

**Correct (React / Next.js):**

```jsx
<VeltCursor inactivityTime={60000} /> {/* 1 minute, good for whiteboards */}

// Or via API
const cursorElement = client.getCursorElement();
cursorElement.setInactivityTime(60000);
```

**Correct (Other Frameworks):**

```html
<velt-cursor inactivity-time="300000"></velt-cursor>
```

```javascript
const cursorElement = Velt.getCursorElement();
cursorElement.setInactivityTime(300000);
```

**Key points:**

- Value is in milliseconds; non-numeric values are rejected
- Lower values (30000 to 60000) suit fast-paced canvas collaboration
- Higher values (300000+) suit document-style apps where users read more than they move
- Tab unfocus marks the user inactive immediately, regardless of `inactivityTime`

**Verification:**
- [ ] `inactivityTime` is set explicitly, in milliseconds
- [ ] Idle cursors disappear after the configured duration
- [ ] Active cursors remain visible during interaction

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/cursors/customize-behavior#setinactivitytime - "setInactivityTime"
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - `inactivityTime` (cursor service baseline)
- https://docs.velt.dev/ui-customization/reference/apis - `CursorElement.setInactivityTime`
