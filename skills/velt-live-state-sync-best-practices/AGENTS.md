# Velt Live State Sync Best Practices — Agent Quick Reference

> IMPORTANT: Authentication MUST use the `authProvider` callback on `<VeltProvider>`:
> ```jsx
> <VeltProvider apiKey="YOUR_API_KEY" authProvider={authProvider}>
> ```
> The `useIdentify` hook and `client.identify()` are **deprecated and must never be used**.

14 rules across 6 categories. Read the rule file for full details.

## 1. Core (CRITICAL)

| Rule | File | Summary |
|------|------|---------|
| Auth Provider | `rules/shared/core/core-auth-provider.md` | Use `authProvider` on VeltProvider — never `useIdentify`/`client.identify()` |
| Setup Overview | `rules/shared/core/core-setup-overview.md` | Feature overview, API selection guide (useLiveState → hooks → element → Redux), prerequisites, key characteristics (persistence, offline, conflict resolution) |

## 2. Hooks (CRITICAL)

| Rule | File | Summary |
|------|------|---------|
| useLiveState | `rules/shared/hooks/hooks-use-live-state.md` | `const [val, setVal, connState] = useLiveState(id, init, opts)` — useState-like shared state with syncDuration, resetLiveState, listenToNewChangesOnly |
| Set/Get Data | `rules/shared/hooks/hooks-set-get-data.md` | `useSetLiveStateData(id, data, {merge})` + `useLiveStateData(id, {listenToNewChangesOnly})` — separated read/write hooks |
| Connection State | `rules/shared/hooks/hooks-connection-state.md` | `useServerConnectionStateChangeHandler()` returns reactive `'online'|'offline'|'pendingInit'|'pendingData'` |

## 3. Element API (HIGH)

| Rule | File | Summary |
|------|------|---------|
| Get/Set Data | `rules/shared/element/element-get-set.md` | `useLiveStateSyncUtils()` → `.setLiveStateData()` / `.getLiveStateData().subscribe()` — observable pattern, must unsubscribe |
| Fetch Data | `rules/shared/element/element-fetch.md` | `.fetchLiveStateData({liveStateDataId})` — Promise-based one-shot read, SSR-safe |
| Connection | `rules/shared/element/element-connection.md` | `.onServerConnectionStateChange().subscribe()` — observable connection monitoring |

## 4. Redux (HIGH)

| Rule | File | Summary |
|------|------|---------|
| Middleware Setup | `rules/shared/redux/redux-middleware-setup.md` | `createLiveStateMiddleware({allowedActionTypes, liveStateDataId})` → configureStore middleware chain |
| Dynamic ID | `rules/shared/redux/redux-dynamic-id.md` | `updateLiveStateDataId(newId)` to switch sync scope at runtime (document/room navigation) |
| Action Structure | `rules/shared/redux/redux-action-structure.md` | Wire format: `{id, action: {type, payload}, timestamp}` — auto-wrapped, idempotent replay |

## 5. API (MEDIUM)

| Rule | File | Summary |
|------|------|---------|
| Broadcast | `rules/shared/api/api-broadcast.md` | `POST /v1/livestate/broadcast` — server-side state update with `x-velt-api-key`/`x-velt-auth-token` headers |
| Data Models | `rules/shared/api/api-data-models.md` | `LiveStateData`, `LiveStateDataMap`, `SetLiveStateDataConfig`, `FetchLiveStateDataRequest` types |

## 6. Patterns (MEDIUM)

| Rule | File | Summary |
|------|------|---------|
| Best Practices | `rules/shared/patterns/patterns-best-practices.md` | Flat data, meaningful IDs, syncDuration tuning, merge for partial updates, cleanup (data persists forever), subscription unsubscribe, offline behavior |
