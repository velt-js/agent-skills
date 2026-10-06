---
title: Show connection state with useServerConnectionStateChangeHandler
impact: HIGH
impactDescription: Users need to know when writes are queued offline; the hook is the reactive source of ServerConnectionState in React
tags: useServerConnectionStateChangeHandler, ServerConnectionState, connection, online, offline, pendingInit, pendingData
---

## Show connection state with useServerConnectionStateChangeHandler

`useServerConnectionStateChangeHandler()` returns the current `ServerConnectionState` and re-renders when it changes. While `'offline'`, reads come from the local cache and writes queue until reconnect, so show an indicator.

| Value | Meaning |
|---|---|
| `'online'` | Connected to Velt servers |
| `'offline'` | Not connected; local reads and queued writes |
| `'pendingInit'` | SDK initialization pending |
| `'pendingData'` | Waiting for data from the server |

**Incorrect (treats every non-online state as an error):**

```jsx
const state = useServerConnectionStateChangeHandler();
if (state !== 'online') return <ErrorScreen />; // BUG: blocks the UI during normal startup states
```

**Correct (React / Next.js):**

```jsx
import { useServerConnectionStateChangeHandler } from '@veltdev/react';

function ConnectionBadge() {
  const connectionState = useServerConnectionStateChangeHandler();
  const label = connectionState === 'offline' ? 'Offline: changes will sync later' : connectionState;
  return <span className={`badge badge-${connectionState}`}>{label}</span>;
}
```

**Other Frameworks:** subscribe to `Velt.getLiveStateSyncElement().onServerConnectionStateChange()` (see `element-connection`). `useLiveState` also returns the state as its third tuple item.

**Verification Checklist:**
- [ ] The UI handles `'pendingInit'` and `'pendingData'` as loading, not failure
- [ ] Offline state is communicated without blocking local edits

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/live-state-sync/setup — "Server Connection State"
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#useserverconnectionstatechangehandler — hook reference
