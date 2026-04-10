---
title: Use Document Updates for Efficient Sync and Persistence
impact: HIGH
impactDescription: Correct update encoding and sync protocol prevents data loss and minimizes bandwidth
tags: encodeStateAsUpdate, applyUpdate, encodeStateVector, mergeUpdates, diffUpdate, sync, persistence
---

## Use Document Updates for Efficient Sync and Persistence

Yjs document updates are compact binary diffs (Uint8Array) that describe changes to a Y.Doc. Updates are **commutative** (order doesn't matter), **associative** (grouping doesn't matter), and **idempotent** (applying the same update twice is safe). This makes the sync protocol robust — updates can arrive out of order, be duplicated, or be merged without corruption.

**Core update functions:**

| Function | Description |
|---|---|
| `Y.encodeStateAsUpdate(ydoc, targetStateVector?)` | Encode full or differential update |
| `Y.applyUpdate(ydoc, update, origin?)` | Apply an update to a document |
| `Y.encodeStateVector(ydoc)` | Get the state vector (clock summary) |
| `Y.mergeUpdates(updates[])` | Merge multiple updates into one |
| `Y.diffUpdate(update, stateVector)` | Compute diff from an update |
| `Y.encodeStateVectorFromUpdate(update)` | Extract state vector without loading Y.Doc |

**Correct — basic update propagation:**

```js
import * as Y from 'yjs'

const ydoc1 = new Y.Doc()
const ydoc2 = new Y.Doc()

// Listen for updates on doc1 and apply to doc2
ydoc1.on('update', (update) => {
  Y.applyUpdate(ydoc2, update)
})

// Listen for updates on doc2 and apply to doc1
ydoc2.on('update', (update) => {
  Y.applyUpdate(ydoc1, update)
})

// Changes now sync bidirectionally
ydoc1.getText('shared').insert(0, 'Hello from doc1')
console.log(ydoc2.getText('shared').toString()) // "Hello from doc1"
```

**Correct — state vector sync protocol (efficient catch-up):**

```js
// Server holds merged updates in a database
async function syncClientWithServer(clientDoc) {
  // Step 1: Client sends its state vector to the server
  const clientStateVector = Y.encodeStateVector(clientDoc)

  // Step 2: Server computes a diff — only changes the client is missing
  const serverUpdate = await fetch('/api/sync', {
    method: 'POST',
    body: clientStateVector,
  }).then(r => r.arrayBuffer()).then(b => new Uint8Array(b))

  // Step 3: Client applies the diff
  Y.applyUpdate(clientDoc, serverUpdate)

  // Step 4: Client sends its changes back to the server
  const serverStateVector = await fetch('/api/state-vector')
    .then(r => r.arrayBuffer()).then(b => new Uint8Array(b))
  const clientUpdate = Y.encodeStateAsUpdate(clientDoc, serverStateVector)
  await fetch('/api/update', { method: 'POST', body: clientUpdate })
}
```

**Correct — merging updates for compaction (persistence layer):**

```js
// Periodically merge stored updates to save space
async function compactUpdates(db) {
  const updates = await db.getAllUpdates()

  // Merge into a single update — safe because updates are associative
  const merged = Y.mergeUpdates(updates)

  await db.replaceAllUpdates(merged)
}
```

**Correct — server-side diff without loading Y.Doc:**

```js
// Extract state vector from a stored update without instantiating Y.Doc
const storedUpdate = await db.getMergedUpdate()
const stateVector = Y.encodeStateVectorFromUpdate(storedUpdate)

// Use this to compute diffs for clients
// This is more memory-efficient on the server
const diff = Y.diffUpdate(storedUpdate, clientStateVector)
```

**Verification:**
- [ ] Updates are applied via `Y.applyUpdate` — never by manually modifying internal state
- [ ] State vector sync protocol is used for initial sync (not full document transfer)
- [ ] `Y.mergeUpdates` is used to compact stored updates periodically
- [ ] `origin` parameter is passed to `applyUpdate` to prevent echo loops in providers
- [ ] `Y.encodeStateVectorFromUpdate` is used server-side to avoid loading full Y.Doc into memory

**Source:** https://docs.yjs.dev/api/document-updates
