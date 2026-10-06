---
title: Observe connection state with onServerConnectionStateChange
impact: MEDIUM
impactDescription: The observable form is the only connection-state API outside React and must be unsubscribed
tags: onServerConnectionStateChange, ServerConnectionState, connection, observable, subscribe, unsubscribe
---

## Observe connection state with onServerConnectionStateChange

`liveStateSyncElement.onServerConnectionStateChange()` returns an observable of `ServerConnectionState` (`'online'`, `'offline'`, `'pendingInit'`, `'pendingData'`). It is the non-React equivalent of `useServerConnectionStateChangeHandler()`. Use it outside React, or in React when you need manual subscription control.

**Incorrect (subscription never released):**

```js
Velt.getLiveStateSyncElement().onServerConnectionStateChange().subscribe(updateBadge);
// BUG: no handle kept, so the subscription can never be released
```

**Correct (React / Next.js):**

```jsx
const liveStateSyncElement = useLiveStateSyncUtils();

useEffect(() => {
  if (!liveStateSyncElement) return;
  const subscription = liveStateSyncElement
    .onServerConnectionStateChange()
    .subscribe((state) => setConnection(state));
  return () => subscription?.unsubscribe();
}, [liveStateSyncElement]);
```

**Correct (Other Frameworks):**

```js
const liveStateSyncElement = Velt.getLiveStateSyncElement();
const subscription = liveStateSyncElement
  .onServerConnectionStateChange()
  .subscribe((state) => updateBadge(state));

// When done:
subscription?.unsubscribe();
```

**Verification Checklist:**
- [ ] The subscription handle is kept and unsubscribed on teardown
- [ ] React components that only need the value use `useServerConnectionStateChangeHandler()` instead
- [ ] UI handles all four states

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/live-state-sync/setup — "Server Connection State"
- https://docs.velt.dev/api-reference/sdk/models/data-models#serverconnectionstate — `ServerConnectionState`
