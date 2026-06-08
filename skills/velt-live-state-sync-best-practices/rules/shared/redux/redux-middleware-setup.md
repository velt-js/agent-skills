---
title: Redux Middleware Setup — createLiveStateMiddleware
impact: HIGH
tags: redux, middleware, createLiveStateMiddleware, configureStore, allowedActionTypes, disabledActionTypes, allowAction
---

## Redux Middleware Setup

`createLiveStateMiddleware` syncs your Redux store across clients. Every dispatched action (that passes the filter) is broadcast to all connected clients, who replay it through their own reducers.

```tsx
import { createLiveStateMiddleware } from '@veltdev/react';
import { configureStore } from '@reduxjs/toolkit';

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

### Configuration

```typescript
type LiveStateMiddlewareConfig = {
  allowedActionTypes?: Set<string>;       // Whitelist — only sync these action types
  disabledActionTypes?: Set<string>;      // Blacklist — sync everything except these
  allowAction?: (action: any) => boolean; // Dynamic filter callback
  liveStateDataId?: string;               // Scope key for the synced state (recommended)
};
```

### Action Filtering

You have three complementary filters — use the simplest one that fits:

1. **`allowedActionTypes`** (whitelist): Only actions with `type` in this Set are synced. Best when you have a small, known set of collaborative actions.
2. **`disabledActionTypes`** (blacklist): All actions sync except these. Best when most actions are collaborative but a few are local-only (e.g., UI state).
3. **`allowAction`** callback: Dynamic filter with full action access. Use for complex rules (e.g., only sync if payload meets a condition).

If none are provided, **all** dispatched actions are synced — this is rarely what you want. Always configure at least one filter to avoid syncing local-only UI state (like modal open/close, hover states).

### Key Points

- Set `liveStateDataId` upfront to scope the synced state — it can be changed later with `updateLiveStateDataId`
- The middleware wraps each action in `{ id, action: { type, payload }, timestamp }` before syncing (see `redux-action-structure`)
- Filters are evaluated locally before broadcast — non-matching actions dispatch normally but are not sent to other clients
