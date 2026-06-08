---
name: velt-live-state-sync-best-practices
description: Velt Live State Sync implementation patterns and best practices for React, Next.js, and web applications. Use when adding real-time shared state, syncing data across clients, Redux store synchronization, or live variables. Triggers on any task involving Velt live state, useLiveState, useSetLiveStateData, useLiveStateData, useLiveStateSyncUtils, createLiveStateMiddleware, getLiveStateSyncElement, live state broadcast API, real-time collaborative state, or building shared-state features — even if the user doesn't explicitly say 'live state sync'.
license: MIT
metadata:
  author: velt
  version: "1.0.0"
---

# Velt Live State Sync Best Practices

Comprehensive guide for implementing Velt's Live State Sync API — real-time shared state across clients with sub-10ms latency, offline support, and Redux middleware integration. Contains 14 rules across 6 categories.

## When to Apply

Reference these guidelines when:
- Adding real-time shared state (counters, selections, cursors, tool modes) to a collaborative app
- Using `useLiveState` for useState-like shared state
- Using `useSetLiveStateData` / `useLiveStateData` for separated read/write patterns
- Working with the `LiveStateSyncElement` for observable subscriptions or promise-based fetches
- Integrating Redux with `createLiveStateMiddleware` for full store sync
- Broadcasting state updates from your server via the REST API
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

## Prerequisites

Live State Sync requires `VeltProvider` with `authProvider` wrapping your app and a `documentId` set to scope state. No additional packages beyond `@veltdev/react` are needed.

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
