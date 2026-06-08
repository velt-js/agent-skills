---
title: Monitor Server Connection State
impact: HIGH
tags: useServerConnectionStateChangeHandler, connection, online, offline, pendingInit, pendingData
---

## Monitor Server Connection State

`useServerConnectionStateChangeHandler` returns the current connection status as a reactive value. Use it to show connectivity indicators or disable inputs while offline.

```tsx
function ConnectionBadge() {
  const connectionState = useServerConnectionStateChangeHandler();

  return <span className={`badge badge-${connectionState}`}>{connectionState}</span>;
}
```

### ServerConnectionState Values

| Value | Meaning |
|-------|---------|
| `'online'` | Connected to Velt servers — reads and writes are live |
| `'offline'` | Disconnected — reads use local cache, writes queue for sync |
| `'pendingInit'` | SDK is initializing |
| `'pendingData'` | Connected but waiting for initial data from server |

### Key Points

- The hook is reactive — it re-renders your component whenever the state changes
- During `'offline'`, live state still works locally (optimistic reads/writes) but changes won't reach other clients until reconnection
- For the observable (non-hook) equivalent, use `liveStateSyncElement.onServerConnectionStateChange().subscribe()` (see element rules)
