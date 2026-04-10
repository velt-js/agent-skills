---
title: Build Custom Providers Using Yjs Update and Sync Protocols
impact: HIGH
impactDescription: Incorrect custom provider implementation causes data loss, duplicate updates, or failed sync — understanding the update model is essential
tags: yjs, custom-provider, sync-protocol, applyUpdate, state-vector, provider
---

## Build Custom Providers Using Yjs Update and Sync Protocols

Yjs updates are commutative, associative, and idempotent. This means you can apply updates in any order, apply the same update multiple times, and still converge to the correct state. This property makes it safe to build custom providers over any transport (HTTP, message queues, databases, etc.).

### Listening for Updates

```js
import * as Y from 'yjs'

const ydoc = new Y.Doc()

// Listen for document updates and send them to other peers
ydoc.on('update', (update, origin) => {
  // `update` is a Uint8Array containing the incremental change
  // `origin` identifies who made the change (useful for filtering)
  if (origin !== 'remote') {
    sendUpdateToServer(update)
  }
})

// Apply an update received from another peer
function receiveUpdate(update) {
  Y.applyUpdate(ydoc, update, 'remote')
}
```

### Two-Phase Sync Protocol

```js
import * as Y from 'yjs'

// Phase 1: Exchange state vectors
// A state vector summarizes what a peer already knows
const localStateVector = Y.encodeStateVector(ydoc)
sendToRemote(localStateVector)

// Phase 2: Compute and send the diff
// When you receive a remote state vector, compute what they're missing
function handleRemoteStateVector(remoteStateVector) {
  const diff = Y.encodeStateAsUpdate(ydoc, remoteStateVector)
  sendToRemote(diff)
}

// When you receive a diff, apply it
function handleRemoteDiff(diff) {
  Y.applyUpdate(ydoc, diff)
}
```

### Full Custom Provider Pattern

```js
import * as Y from 'yjs'

class CustomProvider {
  constructor(ydoc, connection) {
    this.ydoc = ydoc
    this.connection = connection

    // Forward local updates to the remote
    this.ydoc.on('update', (update, origin) => {
      if (origin !== this) {
        this.connection.send({ type: 'update', data: update })
      }
    })

    // Handle incoming messages
    this.connection.on('message', (msg) => {
      if (msg.type === 'update') {
        Y.applyUpdate(this.ydoc, msg.data, this)
      } else if (msg.type === 'sync-step-1') {
        const diff = Y.encodeStateAsUpdate(this.ydoc, msg.stateVector)
        this.connection.send({ type: 'sync-step-2', data: diff })
        // Also send our state vector so remote sends us what we're missing
        const sv = Y.encodeStateVector(this.ydoc)
        this.connection.send({ type: 'sync-step-1', stateVector: sv })
      } else if (msg.type === 'sync-step-2') {
        Y.applyUpdate(this.ydoc, msg.data)
      }
    })

    // Initiate sync
    const sv = Y.encodeStateVector(this.ydoc)
    this.connection.send({ type: 'sync-step-1', stateVector: sv })
  }

  destroy() {
    this.ydoc.off('update', this._updateHandler)
    this.connection.close()
  }
}
```

### Combining Providers

```js
// Multiple providers can be used simultaneously on the same Y.Doc.
// Each provider independently syncs — Yjs handles merge automatically.
const ydoc = new Y.Doc()
const networkProvider = new WebsocketProvider('ws://server', 'room', ydoc)
const dbProvider = new IndexeddbPersistence('doc-id', ydoc)
const customProvider = new CustomProvider(ydoc, myConnection)
```

## Verification Checklist

- [ ] Updates are applied with `Y.applyUpdate(ydoc, update, origin)`
- [ ] Origin is set to avoid echoing updates back to the sender
- [ ] Two-phase sync is implemented: state vector exchange then diff
- [ ] Updates are treated as opaque `Uint8Array` — never parsed or modified
- [ ] Provider is cleaned up (event listeners removed, connections closed) on destroy
- [ ] Multiple providers on the same Y.Doc are supported without conflicts

## Source

- https://docs.yjs.dev/tutorials/creating-a-custom-provider
