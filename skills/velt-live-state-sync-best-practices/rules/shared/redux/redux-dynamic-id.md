---
title: Switch the Redux sync scope with updateLiveStateDataId
impact: HIGH
impactDescription: Actions sync on the current liveStateDataId; forgetting to update it on navigation mixes state across documents or rooms
tags: updateLiveStateDataId, dynamic, room, document, context switch, createLiveStateMiddleware
---

## Switch the Redux sync scope with updateLiveStateDataId

Call the `updateLiveStateDataId(id)` function returned by `createLiveStateMiddleware` whenever the sync scope changes, for example when the user switches rooms. All actions dispatched after the call sync on the new ID path. Set an initial custom `liveStateDataId` in the middleware config first, then change it dynamically.

**Incorrect (never updates the key on room change):**

```jsx
function Room({ roomId }) {
  // BUG: actions from every room keep syncing on the initial key
  return <Canvas />;
}
```

**Correct (React / Next.js):**

```jsx
import { useEffect } from 'react';
import { updateLiveStateDataId } from './store';

function Room({ roomId }) {
  useEffect(() => {
    updateLiveStateDataId(`room-${roomId}`);
  }, [roomId]);

  return <Canvas />;
}
```

**Verification Checklist:**
- [ ] `updateLiveStateDataId` is exported from the store and called when scope changes
- [ ] The middleware config also sets an initial `liveStateDataId`
- [ ] The ID follows a stable convention such as `room-${roomId}`

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/live-state-sync/redux-middleware — "Step 3: Selectively sync actions" (`updateLiveStateDataId`)
