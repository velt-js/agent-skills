---
title: Create and Configure Y.Doc Correctly for Shared Editing
impact: HIGH
impactDescription: Y.Doc is the root container for all shared types — misconfiguration causes data loss or sync failures
tags: Y.Doc, ydoc, clientID, gc, getMap, getText, getArray, destroy, setup
---

## Create and Configure Y.Doc Correctly for Shared Editing

`Y.Doc` is the top-level shared document that holds all collaborative data. Each `Y.Doc` instance gets a unique `clientID` (random, readonly) that identifies the editing session. Shared types are accessed via `ydoc.getMap(name)`, `ydoc.getText(name)`, `ydoc.getArray(name)`, etc. — calling these with the same name always returns the same shared type instance.

The `gc` (garbage collection) property defaults to `true`. Set it to `false` when you need version history or time-travel features, since GC permanently removes deleted content metadata.

Always call `ydoc.destroy()` when the document is no longer needed to free memory and unsubscribe internal listeners.

**Correct — creating and using a Y.Doc:**

```js
import * as Y from 'yjs'

// Create a new document (gc defaults to true)
const ydoc = new Y.Doc()

// For version history / time travel, disable garbage collection
const versionedDoc = new Y.Doc({ gc: false })

// Access top-level shared types by name
// These are lazy — created on first access, same instance on subsequent calls
const ymap = ydoc.getMap('shared-state')
const ytext = ydoc.getText('editor-content')
const yarray = ydoc.getArray('todo-items')
const yxmlFragment = ydoc.getXmlFragment('prosemirror')

// clientID is readonly and unique per session
console.log('Client ID:', ydoc.clientID)

// Bundle changes in a transaction
ydoc.transact(() => {
  ymap.set('title', 'My Document')
  ytext.insert(0, 'Hello, world!')
  yarray.push(['item-1'])
})

// Listen for updates to sync with other peers
ydoc.on('update', (update, origin) => {
  // Send update to other clients or persistence layer
  broadcastUpdate(update)
})

// Cleanup when done
function cleanup() {
  ydoc.destroy()
}
```

**Correct — loading a document from a stored update:**

```js
import * as Y from 'yjs'

const ydoc = new Y.Doc()

// Apply a previously stored update (e.g., from a database)
const storedUpdate = await fetchStoredUpdate()
Y.applyUpdate(ydoc, storedUpdate)

// Now shared types contain the restored state
const ytext = ydoc.getText('editor-content')
console.log(ytext.toString()) // Restored content
```

**Key properties and methods on Y.Doc:**

| Property / Method | Description |
|---|---|
| `ydoc.clientID` | Readonly unique integer for this session |
| `ydoc.gc` | Whether garbage collection is enabled |
| `ydoc.getMap(name)` | Get or create a top-level Y.Map |
| `ydoc.getText(name)` | Get or create a top-level Y.Text |
| `ydoc.getArray(name)` | Get or create a top-level Y.Array |
| `ydoc.getXmlFragment(name)` | Get or create a top-level Y.XmlFragment |
| `ydoc.transact(fn, origin)` | Execute changes atomically |
| `ydoc.destroy()` | Free resources and unsubscribe listeners |
| `ydoc.on('update', fn)` | Listen for document updates |

**Verification:**
- [ ] `Y.Doc` is created with `gc: false` only when version history is needed
- [ ] Shared types are accessed via `ydoc.getMap/getText/getArray` with consistent names
- [ ] `ydoc.destroy()` is called on unmount or when the document is no longer needed
- [ ] `clientID` is not manually set — it is readonly and auto-generated
- [ ] Update listener is registered to propagate changes to other peers

**Source:** https://docs.yjs.dev/api/y.doc
