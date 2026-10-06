---
title: Choose the right Live State Sync API and plan for persistence
impact: CRITICAL
impactDescription: Picking the simplest API avoids manual subscription bugs; live state persists indefinitely, so ephemeral data needs explicit cleanup
tags: overview, setup, useLiveState, useLiveStateData, useSetLiveStateData, useLiveStateSyncUtils, getLiveStateSyncElement, createLiveStateMiddleware, featureAllowList, preloadLiveStateSync
---

## Choose the right Live State Sync API and plan for persistence

Live State Sync shares data across every client on the same document with very low latency (typically no more than 10 ms), optimistic local-first reads and writes, offline support with sync on reconnect, and server-timestamp last-write-wins conflict resolution. Data persists indefinitely until you remove it.

**Incorrect (hand-rolled subscription for simple shared state):**

```jsx
// Works, but useLiveState already does this with automatic cleanup
const el = useLiveStateSyncUtils();
const [count, setCount] = useState(0);
useEffect(() => {
  const sub = el.getLiveStateData('counter').subscribe(setCount);
  return () => sub?.unsubscribe();
}, [el]);
```

**Correct (start with the simplest API):**

```jsx
import { useLiveState } from '@veltdev/react';

const [count, setCount] = useLiveState('counter', 0);
```

| API | Use when | Access |
|---|---|---|
| `useLiveState(id, initialValue, options?)` | One component reads and writes, like `useState` | `@veltdev/react` |
| `useSetLiveStateData` / `useLiveStateData` | Writer and reader are separate, or you need `merge` / `listenToNewChangesOnly` | `@veltdev/react` |
| `LiveStateSyncElement` | Observables, one-shot `fetchLiveStateData()`, non-React code | `useLiveStateSyncUtils()`, `client.getLiveStateSyncElement()`, `Velt.getLiveStateSyncElement()` |
| `createLiveStateMiddleware` | Sync Redux actions across clients | `@veltdev/react` |
| REST / backend SDK broadcast | Server-driven updates | `POST /v2/livestate/broadcast`, `sdk.api.livestate.broadcastEvent` |

**v6 modular SDK:** if you pass `featureAllowList` in the Velt config, include `'liveStateSync'`; otherwise its chunk is not preloaded. `client.preloadLiveStateSync()` loads it ahead of first use, and calling `getLiveStateSyncElement()` auto-enables the feature.

**Verification Checklist:**
- [ ] `VeltProvider` with `authProvider` wraps the app and a document is set (see `core-auth-provider`)
- [ ] The simplest API that fits is used
- [ ] Ephemeral data (cursors, selections, typing flags) has a cleanup plan (see `patterns-best-practices`)
- [ ] `featureAllowList`, when set, includes `'liveStateSync'`

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/live-state-sync/overview — latency, offline support, conflict resolution
- https://docs.velt.dev/realtime-collaboration/live-state-sync/setup — getter and setter methods, `useLiveState`
- https://docs.velt.dev/api-reference/sdk/api/api-methods#preloadlivestatesync — `preloadLiveStateSync()` and `featureAllowList`
