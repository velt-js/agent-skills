---
title: Element API — onServerConnectionStateChange Observable
impact: MEDIUM
tags: onServerConnectionStateChange, connection, observable, subscribe
---

## Element API — onServerConnectionStateChange

The observable equivalent of `useServerConnectionStateChangeHandler`. Use when you need connection state in a non-React context or want manual subscription control.

```tsx
const liveStateSyncElement = useLiveStateSyncUtils();

useEffect(() => {
  const subscription = liveStateSyncElement
    .onServerConnectionStateChange()
    .subscribe((state) => {
      console.log('Connection state:', state);
      // state is 'online' | 'offline' | 'pendingInit' | 'pendingData'
    });

  return () => subscription?.unsubscribe();
}, [liveStateSyncElement]);
```

### Key Points

- Returns an observable — subscribe and clean up on unmount
- Emits the same `ServerConnectionState` values as the hook: `'online'`, `'offline'`, `'pendingInit'`, `'pendingData'`
- For React components, prefer the `useServerConnectionStateChangeHandler` hook (simpler, no manual subscription)
- Use this API for non-React frameworks or when composing with other observables
