---
title: Keep live state small and flat, and clean up ephemeral data yourself
impact: MEDIUM
impactDescription: Live state persists indefinitely with no automatic cleanup; stale cursors and selections accumulate unless your code overwrites them
tags: best practices, gotchas, cleanup, persistence, offline, flat, syncDuration, merge, listenToNewChangesOnly
---

## Keep live state small and flat, and clean up ephemeral data yourself

Live state data persists until you remove it; there is no automatic cleanup. This is the most common surprise. Session-scoped data (cursors, selections, typing flags) must be cleared by your code, typically by overwriting the user's entry when they leave.

**Incorrect (per-user ephemeral data that is never cleared):**

```jsx
useEffect(() => {
  liveStateSyncElement.setLiveStateData('cursors', { [userId]: position }, { merge: true });
  // BUG: no cleanup, so this user's cursor stays in shared state after they leave
}, [position]);
```

**Correct (clear the user's entry on unmount):**

```jsx
useEffect(() => {
  liveStateSyncElement.setLiveStateData('cursors', { [userId]: position }, { merge: true });
}, [position]);

useEffect(() => {
  return () => {
    liveStateSyncElement.setLiveStateData('cursors', { [userId]: null }, { merge: true });
  };
}, [liveStateSyncElement, userId]);
```

For entries a client never cleaned up (crashed tabs), overwrite them from your server with the broadcast API (see `api-broadcast`).

**Guidelines from the docs:**
- Keep state structures simple and flat.
- Use meaningful IDs that reflect the purpose of the data.
- Sync only what you need, not the entire component state (keep hover, focus, and animation state local).
- Consider network latency when setting `syncDuration`; raise it to batch rapid updates.
- Use `listenToNewChangesOnly` when existing data is irrelevant.
- If using the element APIs, unsubscribe when components unmount. The hooks clean up on their own.

**Offline:** reads and writes are local-first; writes sync on reconnect. Show a connectivity indicator with `useServerConnectionStateChangeHandler()` or `onServerConnectionStateChange()`.

**Verification Checklist:**
- [ ] Ephemeral per-user data has explicit cleanup on unmount or logout
- [ ] Partial updates use `{ merge: true }` to avoid overwriting other users' keys
- [ ] Element-API subscriptions are unsubscribed
- [ ] `resetLiveState: true` is used only when wiping persisted data is intended

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/live-state-sync/setup — "Best Practices" and the persistence Info under "Set Live Data"
- https://docs.velt.dev/realtime-collaboration/live-state-sync/overview — offline support and conflict resolution
