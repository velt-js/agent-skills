---
title: useLiveState Hook — useState-like Shared State
impact: CRITICAL
tags: useLiveState, hook, useState, syncDuration, resetLiveState, connectionState
---

## useLiveState Hook

`useLiveState` is the simplest API for shared state — it works like React's `useState` but syncs across all clients viewing the same document.

```tsx
import { useLiveState } from '@veltdev/react';

function Counter() {
  const [counter, setCounter, serverConnectionState] = useLiveState<number>(
    'counter',
    0,
    { syncDuration: 100 }
  );

  return (
    <div>
      <button onClick={() => setCounter((counter || 0) - 1)}>-</button>
      <span>Counter: {counter}</span>
      <button onClick={() => setCounter((counter || 0) + 1)}>+</button>
    </div>
  );
}
```

### Signature

```typescript
const [value, setValue, connectionState] = useLiveState<T>(id, initialValue, options?)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Unique identifier — all clients with same `id` share this state |
| `initialValue` | `T` | Initial value before server data arrives |
| `options.syncDuration` | `number` | Debounce delay in ms before syncing to server (default: 50ms) |
| `options.resetLiveState` | `boolean` | Reset server state to `initialValue` on init (default: false) |
| `options.listenToNewChangesOnly` | `boolean` | Only receive changes made after subscribing (default: false) |

### Return Tuple

| Index | Type | Description |
|-------|------|-------------|
| `[0]` value | `T` | Current state value (updates reactively) |
| `[1]` setValue | `(value: T) => void` | Setter — updates local state immediately, syncs after `syncDuration` |
| `[2]` connectionState | `ServerConnectionState` | `'online'` \| `'offline'` \| `'pendingInit'` \| `'pendingData'` |

### Key Points

- The `id` string scopes the state — use meaningful names like `'editor-theme'` or `'selected-row'`
- `syncDuration` controls the debounce: lower = more responsive but more network traffic; higher = batches rapid changes
- Guard against null: use `(counter || 0)` since the value can be `null` before server data arrives
- `resetLiveState: true` clears any previously persisted value — use only when you intentionally want a fresh start
