---
title: Redux Action Wire Format and Timestamp
impact: MEDIUM
tags: redux, action, timestamp, wire format, id
---

## Redux Action Wire Format

The middleware automatically wraps dispatched Redux actions before syncing them. Understanding this format helps when debugging or building custom middleware on top.

### Wire Format

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

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Auto-generated unique action ID |
| `action.type` | `string` | Original Redux action type |
| `action.payload` | `any` | Original action payload (if present) |
| `timestamp` | `number` | UTC milliseconds — added automatically by the middleware |

### Key Points

- The timestamp is server-assigned for conflict resolution (last-write-wins) — do not set it manually
- Your reducers receive the original unwrapped `{ type, payload }` — the wrapping is transparent
- The `id` field ensures idempotent replay — the same action won't be applied twice even if delivered multiple times
- Use the `allowAction` callback if you need to inspect or filter based on the wrapped structure
