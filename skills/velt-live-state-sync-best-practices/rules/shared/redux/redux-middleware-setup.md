---
title: Sync Redux actions with createLiveStateMiddleware and explicit filters
impact: HIGH
impactDescription: Without a filter every dispatched action is broadcast, including local UI actions like modal toggles
tags: redux, middleware, createLiveStateMiddleware, configureStore, allowedActionTypes, disabledActionTypes, allowAction, liveStateDataId, LiveStateMiddlewareConfig
---

## Sync Redux actions with createLiveStateMiddleware and explicit filters

`createLiveStateMiddleware(config?)` returns `{ middleware, updateLiveStateDataId }`. Add `middleware` to your store; dispatched actions that pass the filters are synced to other clients on the same document. Set a custom `liveStateDataId` up front (if omitted, data is stored under a default key) and export `updateLiveStateDataId` if you need to change it later.

**Incorrect (no filter, no custom key):**

```js
const { middleware } = createLiveStateMiddleware();
// BUG: every action, including 'ui/openModal', is synced to every client
```

**Correct (React / Next.js, store.js):**

```js
import { configureStore } from '@reduxjs/toolkit';
import { createLiveStateMiddleware } from '@veltdev/react';

const { middleware, updateLiveStateDataId } = createLiveStateMiddleware({
  allowedActionTypes: new Set(['canvas/addShape', 'canvas/moveShape', 'canvas/deleteShape']),
  liveStateDataId: 'canvas-state',
});

export const store = configureStore({
  reducer: { canvas: canvasReducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(middleware),
});

export { updateLiveStateDataId };
```

```typescript
type LiveStateMiddlewareConfig = {
  allowedActionTypes?: Set<string>;        // sync only these types
  disabledActionTypes?: Set<string>;       // never sync these types
  allowAction?: (action: any) => boolean;  // return true to sync, false to skip
  liveStateDataId?: string;                // custom key; default key if omitted
};
```

Use `allowedActionTypes` for a small set of collaborative actions, `disabledActionTypes` when most actions are collaborative, and `allowAction` for payload-based rules.

**Verification Checklist:**
- [ ] At least one filter is configured
- [ ] A custom `liveStateDataId` is set in the config
- [ ] `updateLiveStateDataId` is exported when the scope changes at runtime
- [ ] `VeltProvider` with `authProvider` still wraps the app (see `core-auth-provider`)

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/live-state-sync/redux-middleware — Steps 1 to 3 and "Complete Example"
