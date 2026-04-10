---
title: Use Transactions to Bundle Changes Atomically
impact: HIGH
impactDescription: Transactions ensure observers fire once per batch and enable origin-based filtering for providers
tags: transact, transaction, origin, beforeTransaction, afterTransaction, observers, events
---

## Use Transactions to Bundle Changes Atomically

`ydoc.transact(fn, origin)` groups multiple changes into a single atomic operation. Without transactions, each mutation triggers its own observer calls and update events. With transactions, all changes are batched — observers fire once after the entire block completes.

The `origin` parameter is critical for provider filtering. Providers use it to distinguish local changes from remote updates, preventing echo loops when syncing.

**Event order within a transaction:**

1. `beforeTransaction` — fires before execution
2. Transaction body executes (mutations happen)
3. `beforeObserverCalls` — fires before observers
4. Type-level `observe` callbacks fire
5. `observeDeep` callbacks fire (on parent types)
6. `afterTransaction` — fires after all observers
7. `update` event fires (encoded binary diff)

**Correct — batching changes in a transaction:**

```js
import * as Y from 'yjs'

const ydoc = new Y.Doc()
const ymap = ydoc.getMap('state')
const yarray = ydoc.getArray('items')

// Without transact: each operation fires observers separately
// With transact: observers fire once after all changes
ydoc.transact(() => {
  ymap.set('name', 'Project Alpha')
  ymap.set('status', 'active')
  yarray.push(['task-1', 'task-2', 'task-3'])
})
```

**Correct — using origin to filter provider updates:**

```js
const PROVIDER_ORIGIN = 'my-websocket-provider'

// Provider applies remote updates with an origin tag
function onRemoteUpdate(update) {
  Y.applyUpdate(ydoc, update, PROVIDER_ORIGIN)
}

// Listen for updates, skip those from the provider itself
ydoc.on('update', (update, origin) => {
  if (origin === PROVIDER_ORIGIN) {
    // This update came from the remote — don't re-broadcast
    return
  }
  // Local change — send to remote peers
  sendToServer(update)
})

// Local changes use a different origin (or no origin)
ydoc.transact(() => {
  ymap.set('editedBy', 'user-123')
}, 'local')
```

**Correct — listening to transaction lifecycle events:**

```js
ydoc.on('beforeTransaction', (transaction) => {
  console.log('Transaction starting, origin:', transaction.origin)
})

ydoc.on('afterTransaction', (transaction) => {
  console.log('Transaction complete')
  // transaction.changed contains a Map of all changed types
})

ydoc.on('update', (update, origin, ydoc, transaction) => {
  // update is a Uint8Array — the encoded binary diff
  // This is the standard event for syncing with providers
  persistUpdate(update)
})
```

**Correct — nested transactions are flattened:**

```js
// Nested transact calls are merged into the outermost transaction
ydoc.transact(() => {
  ymap.set('a', 1)
  ydoc.transact(() => {
    ymap.set('b', 2) // Same transaction — observers fire once at the end
  })
  ymap.set('c', 3)
})
// Observers fire once with all three changes
```

**Verification:**
- [ ] Multiple related mutations are wrapped in `ydoc.transact()`
- [ ] `origin` is set when applying remote updates to prevent echo loops
- [ ] Update listeners check `origin` before re-broadcasting
- [ ] Code does not rely on observers firing between individual mutations inside a transaction
- [ ] Transaction lifecycle events are used appropriately (not over-subscribed)

**Source:** https://docs.yjs.dev/api/y.doc#transact
