---
title: Live State Sync Feature Overview and API Selection
impact: CRITICAL
tags: overview, setup, useLiveState, useLiveStateSyncUtils, imports, choosing
---

## Live State Sync Feature Overview

Velt Live State Sync provides real-time shared state across clients with extremely low latency (≤10ms typical), optimistic local-first reads/writes, full offline support, and automatic sync on reconnect. Conflict resolution uses server-timestamp last-write-wins. Data persists indefinitely until manually removed — there is no automatic cleanup.

### Choosing the Right API

Velt offers three tiers of Live State Sync API. Pick the simplest one that fits your use case:

| API | When to Use | Import |
|-----|-------------|--------|
| `useLiveState` hook | Simple shared state (counters, toggles, selections) — works like `useState` | `import { useLiveState } from '@veltdev/react'` |
| `useSetLiveStateData` / `useLiveStateData` hooks | Separate read/write concerns, merge updates, or listen-to-new-changes-only | `@veltdev/react` (auto-available inside VeltProvider) |
| `useLiveStateSyncUtils()` element API | Observable subscriptions, promise-based fetch, non-React frameworks, or advanced control | `@veltdev/react` or `Velt.getLiveStateSyncElement()` |
| Redux middleware | Sync an entire Redux store (or filtered slices) across clients | `import { createLiveStateMiddleware } from '@veltdev/react'` |

For most React use cases, start with `useLiveState`. Escalate to the element API or Redux middleware only when you need observable subscriptions, one-shot fetches, or full store sync.

### Prerequisites

- `VeltProvider` with `authProvider` must wrap your app (see `core-auth-provider`)
- A `documentId` should be set to scope shared state to a specific document/room
- No additional packages beyond `@veltdev/react` are needed

### Key Characteristics

- **Persistence**: Data persists indefinitely until you manually remove it — plan for cleanup
- **Conflict resolution**: Last-write-wins based on server timestamps
- **Offline**: Reads work from local cache; writes queue and sync on reconnect
- **Latency**: Optimistic local-first — UI updates immediately, server confirms async
