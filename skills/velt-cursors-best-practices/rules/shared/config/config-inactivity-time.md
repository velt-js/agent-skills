---
title: Configure Cursor Inactivity Timeout
impact: MEDIUM
impactDescription: Control how long before idle cursors disappear (default 5 minutes)
tags: inactivity, timeout, inactivityTime, idle, cursor-visibility
---

## Configure Inactivity Time for Cursors

Set `inactivityTime` to control how long (in milliseconds) a user's cursor remains visible after they stop moving it. The default is 300000ms (5 minutes). When a user's tab loses focus, their cursor is hidden immediately regardless of this setting.

**Why this matters:**

Stale cursors clutter the canvas and mislead active users into thinking someone is working in an area when they have actually stepped away. Tuning the inactivity timeout balances between showing presence and reducing visual noise.

**React: Set inactivity time**

```jsx
"use client";
import { VeltCursor } from "@veltdev/react";

function Canvas() {
  return (
    <main className="canvas">
      <VeltCursor inactivityTime={300000} />
      {/* 5 minutes (default). Set lower for fast-paced collaboration. */}
    </main>
  );
}
```

**React: Shorter timeout for real-time canvas apps**

```jsx
<VeltCursor inactivityTime={60000} />
{/* 1 minute — good for whiteboards and design tools */}
```

**HTML: Set inactivity time**

```html
<velt-cursor inactivity-time="300000"></velt-cursor>
```

**API: Programmatic configuration**

```jsx
"use client";
import { useCursorUtils } from "@veltdev/react";
import { useEffect } from "react";

function CursorConfig() {
  const cursorElement = useCursorUtils();

  useEffect(() => {
    if (cursorElement) {
      cursorElement.setInactivityTime(60000);
    }
  }, [cursorElement]);

  return null;
}
```

**Vanilla JS:**

```javascript
const cursorElement = client.getCursorElement();
cursorElement.setInactivityTime(60000);
```

**Key points:**

- Default: 300000ms (5 minutes)
- Tab unfocus hides the cursor immediately, regardless of `inactivityTime`
- Value is in milliseconds
- Lower values (30000-60000) work well for fast-paced canvas collaboration
- Higher values (300000+) suit document editing where users read more than they interact
- Setting to `0` keeps cursors visible indefinitely (not recommended)

**Verification:**
- [ ] `inactivityTime` is set to an appropriate value for the use case
- [ ] Idle cursors disappear after the configured duration
- [ ] Tab unfocus hides cursor immediately
- [ ] Active cursors remain visible during interaction

**Source Pointers:**
- `https://docs.velt.dev/cursor/customize-behavior/inactivity-time` - Inactivity time configuration
