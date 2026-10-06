---
name: velt-live-state-sync-best-practices
description: Velt Live State Sync best practices for React, Next.js, and web apps. Use when adding real-time shared state across clients, syncing a Redux store, or broadcasting state from a server. Triggers on useLiveState, useSetLiveStateData, useLiveStateData, useLiveStateSyncUtils, getLiveStateSyncElement, fetchLiveStateData, useServerConnectionStateChangeHandler, createLiveStateMiddleware, livestate broadcast, or broadcastEvent, even if the user doesn't say 'live state sync'.
license: MIT
metadata:
  author: velt
  version: "1.0.1"
---

# Velt Live State Sync Best Practices

Guide for implementing Velt's Live State Sync: real-time shared state across clients with low latency, local-first offline support, Redux middleware integration, and server-side broadcast. Contains 14 rules across 6 categories.

## When to Apply

Reference these guidelines when:
- Adding real-time shared state (counters, selections, cursors, tool modes) to a collaborative app
- Using `useLiveState` for useState-like shared state
- Using `useSetLiveStateData` / `useLiveStateData` for separated read/write patterns
- Working with the `LiveStateSyncElement` for observable subscriptions or promise-based fetches
- Integrating Redux with `createLiveStateMiddleware`
- Broadcasting state from your server via the REST API or the Node / Python backend SDKs
- Monitoring connection state for offline/online indicators

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Core | CRITICAL | `core-` |
| 2 | Hooks | CRITICAL | `hooks-` |
| 3 | Element | HIGH | `element-` |
| 4 | Redux | HIGH | `redux-` |
| 5 | API | MEDIUM | `api-` |
| 6 | Patterns | MEDIUM | `patterns-` |

## Quick Reference

### 1. Core (CRITICAL)
- `core-auth-provider` - `authProvider` object on `VeltProvider` plus a set document; always show the provider in examples
- `core-setup-overview` - choosing the API tier, persistence, `featureAllowList` key `'liveStateSync'`

### 2. Hooks (CRITICAL)
- `hooks-use-live-state` - `useLiveState(id, initialValue, options)` tuple, null guard, `resetLiveState` caution
- `hooks-set-get-data` - `useSetLiveStateData` with `merge` and `useLiveStateData` with `listenToNewChangesOnly`
- `hooks-connection-state` - `useServerConnectionStateChangeHandler` and the four `ServerConnectionState` values

### 3. Element (HIGH)
- `element-get-set` - `setLiveStateData` / observable `getLiveStateData` with unsubscribe
- `element-fetch` - Promise-based `fetchLiveStateData` for one-shot reads
- `element-connection` - `onServerConnectionStateChange()` observable

### 4. Redux (HIGH)
- `redux-middleware-setup` - `createLiveStateMiddleware` with action filters and a custom `liveStateDataId`
- `redux-dynamic-id` - `updateLiveStateDataId` on scope changes
- `redux-action-structure` - synced action shape and the middleware-added UTC timestamp

### 5. API (MEDIUM)
- `api-broadcast` - `POST /v2/livestate/broadcast` (body wrapped in `data`) and `sdk.api.livestate.broadcastEvent`
- `api-data-models` - `LiveStateData`, `LiveStateDataMap` (`custom` vs `default`), config types

### 6. Patterns (MEDIUM)
- `patterns-best-practices` - cleanup of ephemeral data, flat state, `syncDuration`, offline behavior

## Prerequisites

Live State Sync requires `VeltProvider` with an `authProvider` wrapping your app and a document set to scope state. No packages beyond `@veltdev/react` (or the Velt script for other frameworks) are needed.

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/core/core-setup-overview.md
rules/shared/hooks/hooks-use-live-state.md
rules/shared/redux/redux-middleware-setup.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect and correct code examples
- Verification checklist
- Source pointers to official docs

## Compiled Documents

- `AGENTS.md` - Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` - Full verbose guide with all rules expanded inline
