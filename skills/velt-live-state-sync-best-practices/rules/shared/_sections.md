# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the filename prefix used to group rules.

---

## 1. Core (core)

**Impact:** CRITICAL
**Description:** `VeltProvider` with the `authProvider` object and a set document, choosing between `useLiveState`, the read/write hooks, the `LiveStateSyncElement`, Redux middleware, and server broadcast, plus the v6 `featureAllowList` key `'liveStateSync'`.

---

## 2. Hooks (hooks)

**Impact:** CRITICAL
**Description:** React hooks: `useLiveState` (useState-like with `syncDuration`, `resetLiveState`, `listenToNewChangesOnly`), `useSetLiveStateData` / `useLiveStateData` with `merge`, and `useServerConnectionStateChangeHandler`.

---

## 3. Element (element)

**Impact:** HIGH
**Description:** The `LiveStateSyncElement` API: `setLiveStateData`, observable `getLiveStateData` with unsubscribe, Promise-based `fetchLiveStateData`, and `onServerConnectionStateChange`.

---

## 4. Redux (redux)

**Impact:** HIGH
**Description:** `createLiveStateMiddleware` setup and action filters, switching scope with `updateLiveStateDataId`, and the synced action shape with its middleware-added UTC timestamp.

---

## 5. API (api)

**Impact:** MEDIUM
**Description:** Server-side broadcast via `POST /v2/livestate/broadcast` and the `sdk.api.livestate.broadcastEvent` backend SDK methods, plus the `LiveStateData` / `LiveStateDataMap` / config types.

---

## 6. Patterns (patterns)

**Impact:** MEDIUM
**Description:** Persistence and cleanup of ephemeral data, flat state, scoped syncing, `syncDuration` tuning, and offline behavior.
