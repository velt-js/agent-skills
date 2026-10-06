---
title: Use useLiveState for useState-like shared state
impact: CRITICAL
impactDescription: The simplest shared-state API; the value can be null before server data arrives, and resetLiveState wipes persisted data on init
tags: useLiveState, hook, useState, syncDuration, resetLiveState, listenToNewChangesOnly, serverConnectionState
---

## Use useLiveState for useState-like shared state

`useLiveState(id, initialValue, options?)` works like React's `useState`, but every client on the same document with the same `id` shares the value. It returns `[value, setValue, serverConnectionState]`.

| Option | Default | Effect |
|---|---|---|
| `syncDuration` | `50` (ms) | Debounce before syncing |
| `resetLiveState` | `false` | Reset server state to `initialValue` when the hook initializes |
| `listenToNewChangesOnly` | `false` | Ignore existing data; only receive changes after subscribing |

**Incorrect (no null guard, unintended reset):**

```jsx
const [counter, setCounter] = useLiveState('counter', 0, { resetLiveState: true });
// BUG 1: resetLiveState wipes the shared counter every time any client mounts
// BUG 2: counter can be null before data arrives, so counter + 1 yields 1 instead of the real value
<button onClick={() => setCounter(counter + 1)}>+</button>;
```

**Correct (React / Next.js):**

```jsx
import { useLiveState } from '@veltdev/react';
import { useEffect } from 'react';

export function Counter() {
  const [counter, setCounter, serverConnectionState] = useLiveState('counter', 0, {
    syncDuration: 100,
  });

  useEffect(() => {
    console.log('serverConnectionState:', serverConnectionState);
  }, [serverConnectionState]);

  return (
    <div>
      <button onClick={() => setCounter((counter || 0) - 1)}>-</button>
      <span>Counter: {counter}</span>
      <button onClick={() => setCounter((counter || 0) + 1)}>+</button>
    </div>
  );
}
```

**Other Frameworks:** there is no `useLiveState` equivalent; use `setLiveStateData` / `getLiveStateData` on `Velt.getLiveStateSyncElement()` (see `element-get-set`).

**Verification Checklist:**
- [ ] The `id` is a meaningful, shared string (`'editor-theme'`, `'selected-row'`)
- [ ] Reads guard against `null` before data arrives
- [ ] `resetLiveState: true` is used only when wiping persisted state on init is intended
- [ ] `syncDuration` is tuned for the update rate

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/live-state-sync/setup — "Alternative: useLiveState()"
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#uselivestate — `useLiveState()`
