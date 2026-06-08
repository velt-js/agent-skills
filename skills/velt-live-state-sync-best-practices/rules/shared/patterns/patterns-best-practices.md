---
title: Live State Sync Best Practices and Gotchas
impact: MEDIUM
tags: best practices, gotchas, cleanup, offline, flat, syncDuration, persistence
---

## Best Practices and Gotchas

### Data Structure

- **Keep state flat**: Deeply nested objects are harder to merge and increase serialization overhead. Prefer `{ x: 100, y: 200 }` over `{ position: { coordinates: { x: 100, y: 200 } } }`
- **Use meaningful IDs**: `'cursor-position-editor'` is better than `'data-1'` — IDs are shared across all clients and appear in debug tools
- **Sync only what you need**: Don't put your entire component state into live state. Sync the collaborative parts (shared selections, cursors, tool modes) and keep local-only state (hover, focus, animation) in regular React state

### Performance

- **Tune `syncDuration`**: Default 50ms is good for most cases. For rapid input (typing, dragging), increase to 100-200ms to batch updates. For critical real-time state (cursor position), keep at 50ms or lower
- **Use `listenToNewChangesOnly`** when you don't need the initial server value — reduces the initial data payload and avoids stale-data flash
- **Use `merge: true`** for partial object updates instead of reading the full object, modifying locally, and writing back — avoids race conditions where two clients overwrite each other's changes

### Cleanup and Persistence — Data Persists Indefinitely

Live state data is **never automatically cleaned up** — it persists on Velt's servers indefinitely until you explicitly remove it. This is the most common gotcha with Live State Sync. Every implementation that creates temporary or session-scoped state (cursors, selections, typing indicators) must include cleanup logic:

- **Client-side cleanup on unmount**: In your useEffect cleanup, call `setLiveStateData` with `null` or empty data using `merge: true` to remove the leaving user's data
- **Server-side cleanup via cron**: Call the broadcast REST API with empty data on a schedule to clear stale entries
- **`resetLiveState: true`** on `useLiveState` clears persisted data on component mount — useful for ephemeral state that should start fresh each session, but be careful: if two clients mount simultaneously, they may reset each other's writes

```tsx
// Example: Clean up cursor data when user leaves
useEffect(() => {
  return () => {
    liveStateSyncElement.setLiveStateData('cursors', {
      [currentUser.userId]: null,
    }, { merge: true });
  };
}, [liveStateSyncElement, currentUser]);
```

Always mention this persistence behavior when implementing Live State Sync features, especially for ephemeral data like cursors, selections, or presence indicators.

### Subscription Cleanup

- **Always unsubscribe** from `getLiveStateData` and `onServerConnectionStateChange` observables in your cleanup function (useEffect return, componentWillUnmount, or framework equivalent)
- For React hooks (`useLiveState`, `useLiveStateData`, `useSetLiveStateData`), cleanup is automatic — no manual unsubscription needed

### Offline Behavior

- Reads work from local cache when offline — the UI stays responsive
- Writes queue locally and sync automatically when the connection is restored
- Use `useServerConnectionStateChangeHandler` or `onServerConnectionStateChange` to show a connectivity indicator so users know their changes aren't live yet
