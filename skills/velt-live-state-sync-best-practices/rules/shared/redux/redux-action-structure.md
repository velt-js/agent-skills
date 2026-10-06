---
title: Understand the synced Redux action shape and its timestamp
impact: MEDIUM
impactDescription: The middleware adds the UTC timestamp itself; setting your own or depending on undocumented fields causes confusion when debugging ordering
tags: redux, action, timestamp, wire format, id, debugging
---

## Understand the synced Redux action shape and its timestamp

The middleware stores each synced action as `{ id, action: { type, payload }, timestamp }`. `timestamp` is the UTC time in milliseconds when the action was dispatched, added automatically by the middleware to help with ordering and debugging across clients.

**Incorrect (adds its own timestamp to every action):**

```js
dispatch({ type: 'canvas/addShape', payload: { shapeId: 'rect-1' }, timestamp: Date.now() });
// Unnecessary: the middleware already records a UTC timestamp for each synced action
```

**Correct:**

```js
dispatch({ type: 'canvas/addShape', payload: { shapeId: 'rect-1', x: 100, y: 200 } });
```

```json
{
  "id": "ACTION_ID",
  "action": {
    "type": "canvas/addShape",
    "payload": { "shapeId": "rect-1", "x": 100, "y": 200 }
  },
  "timestamp": 1759745729823
}
```

**Verification Checklist:**
- [ ] Actions are plain `{ type, payload }` objects
- [ ] Debugging tools read `timestamp` from the stored action record
- [ ] `payload` stays serializable

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/live-state-sync/redux-middleware — "Step 4: Action Data Structure"
