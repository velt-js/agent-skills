---
title: Debug Yjs Sync Issues with Built-In Inspection Tools
impact: MEDIUM
impactDescription: Knowing how to inspect updates, state vectors, and provider status cuts debugging time from hours to minutes
tags: yjs, debug, logUpdate, state vector, sync, troubleshooting, singleton, provider
---

## Debug Yjs Sync Issues with Built-In Inspection Tools

When collaborative editing fails silently — edits disappear, cursors freeze, or documents diverge — Yjs provides built-in tools to inspect what is happening under the hood. The most common debugging workflow involves checking update contents, comparing state vectors between peers, and verifying provider connectivity.

The most frequent root causes of sync failures are:
- Provider not connected (WebSocket URL wrong, server down, or `provider.connect()` never called)
- Different room names between clients that should be syncing
- Multiple Y.Doc instances created for the same document (use a singleton pattern)
- Duplicate Yjs imports (see pitfall-duplicate-imports rule)

**Correct — inspecting update contents:**

```js
import * as Y from 'yjs'

const ydoc = new Y.Doc()

// Log every update to see what changes are being made
ydoc.on('update', (update, origin) => {
  console.log('Update from origin:', origin)
  console.log('Update size (bytes):', update.byteLength)

  // Decode and log the update contents for debugging
  Y.logUpdate(update)
})
```

**Correct — comparing state vectors between peers:**

```js
import * as Y from 'yjs'

// State vector shows the latest clock value for each client
const stateVector = Y.encodeStateVector(ydoc)
console.log('State vector:', stateVector)

// Decode the state vector for human-readable inspection
const decodedSV = Y.decodeStateVector(stateVector)
console.log('Decoded state vector:')
decodedSV.forEach((clock, clientID) => {
  console.log(`  Client ${clientID}: clock = ${clock}`)
})

// Compare two docs by encoding the diff
const remoteStateVector = getRemoteStateVector() // from another peer
const missingUpdates = Y.encodeStateAsUpdate(ydoc, remoteStateVector)
console.log('Missing update size:', missingUpdates.byteLength)
// If byteLength > 0, the remote peer is behind
```

**Correct — singleton Y.Doc pattern to prevent duplicates:**

```js
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

// Singleton map — one Y.Doc per room
const docs = new Map()

function getOrCreateDoc(roomName) {
  if (docs.has(roomName)) {
    return docs.get(roomName)
  }

  const ydoc = new Y.Doc()
  const provider = new WebsocketProvider('ws://localhost:1234', roomName, ydoc)

  // Monitor connection state
  provider.on('status', ({ status }) => {
    console.log(`[${roomName}] Provider status: ${status}`)
  })

  provider.on('sync', (isSynced) => {
    console.log(`[${roomName}] Synced: ${isSynced}`)
  })

  const entry = { ydoc, provider }
  docs.set(roomName, entry)
  return entry
}

function destroyDoc(roomName) {
  const entry = docs.get(roomName)
  if (entry) {
    entry.provider.destroy()
    entry.ydoc.destroy()
    docs.delete(roomName)
  }
}
```

**Correct — verifying sync is working end-to-end:**

```js
// Quick smoke test: open two browser tabs, run this in each console
const ydoc = getOrCreateDoc('test-room').ydoc
const ytext = ydoc.getText('test')

// In tab 1:
ytext.insert(0, 'Hello from tab 1')

// In tab 2 (should appear automatically):
console.log(ytext.toString()) // "Hello from tab 1"
```

**Debugging checklist for sync failures:**

| Check | How |
|---|---|
| Provider connected? | `provider.on('status', ...)` — should log "connected" |
| Same room name? | Log room name on both clients and compare |
| Single Y.Doc per room? | Use singleton pattern above; log `ydoc.clientID` — should differ between tabs |
| Single Yjs import? | Run `npm ls yjs` — should show one version |
| Updates flowing? | Add `ydoc.on('update', ...)` listener and verify it fires |
| State vectors aligned? | Compare `Y.decodeStateVector()` output between peers |

**Verification:**
- [ ] `Y.logUpdate(update)` is used during development to inspect update contents
- [ ] State vectors are decoded and compared when sync issues arise
- [ ] Y.Doc instances use a singleton pattern — one doc per room name
- [ ] Provider status and sync events are monitored with event listeners
- [ ] End-to-end sync is verified by opening two browser tabs and typing in one
- [ ] `npm ls yjs` confirms a single version in the dependency tree

**Source:** https://docs.yjs.dev/api/document-updates
