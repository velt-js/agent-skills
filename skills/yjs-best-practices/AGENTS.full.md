# Yjs Best Practices

**Version 1.1.1**  
Velt  
May 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Comprehensive guide for building real-time collaborative applications with Yjs — the high-performance CRDT framework. Covers Y.Doc lifecycle (creation, updates, garbage collection, transactions), shared types (Y.Text, Y.Array, Y.Map, Y.XmlFragment), network and persistence providers (y-websocket, y-webrtc, y-indexeddb, custom providers), editor bindings (TipTap, ProseMirror, CodeMirror, Quill, Monaco), awareness protocol for cursor/presence, UndoManager patterns for shared-type undo/redo, and well-known pitfalls (duplicate Yjs imports, subdocument handling, v2 encoding migration). All guidance is framework-agnostic Yjs best practice; for Velt's wrapped Tiptap integration (`useCollaboration`, CollaborationManager), see velt-crdt-best-practices.

---

## Table of Contents

1. [Core Document Lifecycle](#1-core-document-lifecycle) — **CRITICAL**
   - 1.1 [Configure Garbage Collection Based on Version History Requirements](#11-configure-garbage-collection-based-on-version-history-requirements)
   - 1.2 [Create and Configure Y.Doc Correctly for Shared Editing](#12-create-and-configure-ydoc-correctly-for-shared-editing)
   - 1.3 [Use Document Updates for Efficient Sync and Persistence](#13-use-document-updates-for-efficient-sync-and-persistence)
   - 1.4 [Use Transactions to Bundle Changes Atomically](#14-use-transactions-to-bundle-changes-atomically)

2. [Shared Types](#2-shared-types) — **HIGH**
   - 2.1 [Use Y.Array for Collaborative Ordered Sequences](#21-use-yarray-for-collaborative-ordered-sequences)
   - 2.2 [Use Y.Map for Collaborative Key-Value Storage with Awareness of Tombstone Growth](#22-use-ymap-for-collaborative-key-value-storage-with-awareness-of-tombstone-growth)
   - 2.3 [Use Y.Text for Collaborative Plain and Rich Text Editing](#23-use-ytext-for-collaborative-plain-and-rich-text-editing)
   - 2.4 [Use Y.XmlFragment, Y.XmlElement, and Y.XmlText for Tree-Structured Document Models](#24-use-yxmlfragment-yxmlelement-and-yxmltext-for-tree-structured-document-models)
   - 2.5 [Use YKeyValue from y-utility for Frequently-Updated Key-Value Data](#25-use-ykeyvalue-from-y-utility-for-frequently-updated-key-value-data)

3. [Providers](#3-providers) — **HIGH**
   - 3.1 [Build Custom Providers Using Yjs Update and Sync Protocols](#31-build-custom-providers-using-yjs-update-and-sync-protocols)
   - 3.2 [Use y-indexeddb for Offline Persistence in the Browser](#32-use-y-indexeddb-for-offline-persistence-in-the-browser)
   - 3.3 [Use y-webrtc for Peer-to-Peer Sync Without a Central Server](#33-use-y-webrtc-for-peer-to-peer-sync-without-a-central-server)
   - 3.4 [Use y-websocket for Client-Server Real-Time Sync](#34-use-y-websocket-for-client-server-real-time-sync)

4. [Editor Bindings](#4-editor-bindings) — **HIGH**
   - 4.1 [Integrate Yjs with CodeMirror 6 Using y-codemirror.next](#41-integrate-yjs-with-codemirror-6-using-y-codemirrornext)
   - 4.2 [Integrate Yjs with Monaco Editor Using y-monaco](#42-integrate-yjs-with-monaco-editor-using-y-monaco)
   - 4.3 [Integrate Yjs with ProseMirror Using y-prosemirror Plugins](#43-integrate-yjs-with-prosemirror-using-y-prosemirror-plugins)
   - 4.4 [Integrate Yjs with Quill Using y-quill](#44-integrate-yjs-with-quill-using-y-quill)
   - 4.5 [Integrate Yjs with TipTap Using y-prosemirror Collaboration Extensions](#45-integrate-yjs-with-tiptap-using-y-prosemirror-collaboration-extensions)

5. [Awareness](#5-awareness) — **MEDIUM**
   - 5.1 [Use the Awareness Protocol for Ephemeral Presence State](#51-use-the-awareness-protocol-for-ephemeral-presence-state)

6. [Undo / Redo](#6-undo-redo) — **MEDIUM**
   - 6.1 [Use Y.UndoManager for Collaborative Undo/Redo](#61-use-yundomanager-for-collaborative-undoredo)

7. [Pitfalls](#7-pitfalls) — **MEDIUM**
   - 7.1 [Avoid Duplicate Yjs Imports (CJS/ESM Split)](#71-avoid-duplicate-yjs-imports-cjsesm-split)
   - 7.2 [Prefer Y.Map with Multiple Fragments Over Subdocuments](#72-prefer-ymap-with-multiple-fragments-over-subdocuments)
   - 7.3 [Understand V2 Update Encoding Trade-Offs Before Enabling](#73-understand-v2-update-encoding-trade-offs-before-enabling)

8. [Debugging](#8-debugging) — **LOW-MEDIUM**
   - 8.1 [Debug Yjs Sync Issues with Built-In Inspection Tools](#81-debug-yjs-sync-issues-with-built-in-inspection-tools)

---

## 1. Core Document Lifecycle

**Impact: CRITICAL**

Foundational patterns for Y.Doc instances — creating a doc, applying updates, transaction batching to coalesce multiple mutations into a single observer notification, and explicit garbage collection control. Get these wrong and collaborative state diverges, observers fire spuriously, or memory leaks accumulate.

### 1.1 Configure Garbage Collection Based on Version History Requirements

**Impact: MEDIUM (Incorrect GC settings cause either unbounded document growth or inability to restore past versions)**

The `gc` flag on `Y.Doc` controls whether Yjs discards metadata of deleted content. When `gc: true` (the default), deleted items are permanently cleaned up — the document stays compact but past states cannot be reconstructed. When `gc: false`, all deleted content metadata is retained, enabling version history and time-travel features at the cost of larger document size.

This is a document-level setting that must be consistent across all peers. If one peer uses `gc: true` and another uses `gc: false`, the documents will diverge.

**Correct — default behavior (GC enabled, no version history):**

```js
import * as Y from 'yjs'

// Default: gc is true — deleted content is permanently removed
const ydoc = new Y.Doc()
// Equivalent to: new Y.Doc({ gc: true })

const ytext = ydoc.getText('content')
ydoc.transact(() => {
  ytext.insert(0, 'Hello, world!')
  ytext.delete(0, 5) // "Hello" is permanently removed from CRDT metadata
})
```

**Correct — disabling GC for version history:**

```js
import * as Y from 'yjs'

// Disable GC to retain deleted content metadata
const ydoc = new Y.Doc({ gc: false })

const ytext = ydoc.getText('content')

// Capture a snapshot at a point in time
ydoc.transact(() => {
  ytext.insert(0, 'Version 1 content')
})
const snapshot1 = Y.snapshot(ydoc)

ydoc.transact(() => {
  ytext.delete(0, ytext.length)
  ytext.insert(0, 'Version 2 content')
})
const snapshot2 = Y.snapshot(ydoc)

// Restore content from a previous snapshot
const restoredDoc = Y.createDocFromSnapshot(ydoc, snapshot1)
console.log(restoredDoc.getText('content').toString()) // "Version 1 content"
```

**Correct — checking document size and deciding on GC strategy:**

```js
import * as Y from 'yjs'

// For collaboration-only use cases (chat, whiteboard, editing)
// Keep gc: true to minimize document size
const collabDoc = new Y.Doc({ gc: true })

// For audit-trail or version-history use cases
// Use gc: false and implement periodic compaction on the server
const auditDoc = new Y.Doc({ gc: false })

// Monitor document size
function getDocSize(ydoc) {
  const update = Y.encodeStateAsUpdate(ydoc)
  return update.byteLength
}

console.log('Doc size:', getDocSize(auditDoc), 'bytes')
```

---

### 1.2 Create and Configure Y.Doc Correctly for Shared Editing

**Impact: HIGH (Y.Doc is the root container for all shared types — misconfiguration causes data loss or sync failures)**

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

---

### 1.3 Use Document Updates for Efficient Sync and Persistence

**Impact: HIGH (Correct update encoding and sync protocol prevents data loss and minimizes bandwidth)**

Yjs document updates are compact binary diffs (Uint8Array) that describe changes to a Y.Doc. Updates are **commutative** (order doesn't matter), **associative** (grouping doesn't matter), and **idempotent** (applying the same update twice is safe). This makes the sync protocol robust — updates can arrive out of order, be duplicated, or be merged without corruption.

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

---

### 1.4 Use Transactions to Bundle Changes Atomically

**Impact: HIGH (Transactions ensure observers fire once per batch and enable origin-based filtering for providers)**

`ydoc.transact(fn, origin)` groups multiple changes into a single atomic operation. Without transactions, each mutation triggers its own observer calls and update events. With transactions, all changes are batched — observers fire once after the entire block completes.

The `origin` parameter is critical for provider filtering. Providers use it to distinguish local changes from remote updates, preventing echo loops when syncing.

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

---

## 2. Shared Types

**Impact: HIGH**

Per-type patterns for `Y.Text` (rich-text rope), `Y.Array` (ordered list), `Y.Map` (object-shaped), the YMap-vs-YKeyValue choice, and `Y.XmlFragment` (DOM-shaped, used by editor bindings). Each type has distinct semantics around insertion ordering, conflict resolution, and observer payloads.

### 2.1 Use Y.Array for Collaborative Ordered Sequences

**Impact: HIGH (Y.Array provides CRDT-based ordered lists with conflict-free concurrent insertions)**

`Y.Array` is a shared type for ordered sequences. It supports standard array operations and can hold primitives, objects, or nested shared types. Concurrent insertions at the same index by different users are resolved deterministically — both items are preserved.

A critical rule: **shared types can only exist once in a document.** You cannot insert the same `Y.Map` or `Y.Text` instance into two different `Y.Array` positions. Each nested shared type belongs to exactly one location in the document tree.

**Correct — basic Y.Array operations:**

```js
import * as Y from 'yjs'

const ydoc = new Y.Doc()
const yarray = ydoc.getArray('items')

ydoc.transact(() => {
  // Append items
  yarray.push(['apple', 'banana'])
  yarray.unshift(['grape'])

  // Insert at index
  yarray.insert(1, ['cherry'])

  // Access items
  console.log(yarray.get(0))    // "grape"
  console.log(yarray.length)    // 4
  console.log(yarray.toArray()) // ["grape", "cherry", "apple", "banana"]
  console.log(yarray.toJSON())  // ["grape", "cherry", "apple", "banana"]

  // Delete 1 item at index 2
  yarray.delete(2, 1) // removes "apple"

  // Slice (returns plain array, not a Y.Array)
  const subset = yarray.slice(0, 2) // ["grape", "cherry"]
})
```

**Correct — factory method and iteration:**

```js
const ydoc = new Y.Doc()

// Create a Y.Array from existing data
const yarray = Y.Array.from(['task-1', 'task-2', 'task-3'])
// Note: this creates a detached Y.Array — insert it into a doc to sync

// Iteration methods
const docArray = ydoc.getArray('tasks')
docArray.push(['task-1', 'task-2', 'task-3'])

docArray.forEach((item, index) => {
  console.log(index, item)
})

const mapped = docArray.map((item) => item.toUpperCase())
console.log(mapped) // ["TASK-1", "TASK-2", "TASK-3"]
```

**Correct — nested shared types in Y.Array:**

```js
const ydoc = new Y.Doc()
const yarray = ydoc.getArray('todo-list')

ydoc.transact(() => {
  // Each item is a Y.Map — collaborative sub-documents
  const item1 = new Y.Map()
  item1.set('title', 'Buy groceries')
  item1.set('done', false)

  const item2 = new Y.Map()
  item2.set('title', 'Write report')
  item2.set('done', false)

  // Insert nested shared types
  yarray.push([item1, item2])

  // Modify nested type in place — changes sync automatically
  yarray.get(0).set('done', true)
})
```

**Correct — observing array changes:**

```js
const ydoc = new Y.Doc()
const yarray = ydoc.getArray('observed')

yarray.observe((event, transaction) => {
  // event is a Y.ArrayEvent
  // event.delta uses the same format as Quill Delta
  console.log('Delta:', event.delta)
  // Examples:
  // Insert at start: [{ insert: ["new-item"] }]
  // Delete at index 2: [{ retain: 2 }, { delete: 1 }]
  // Replace: [{ retain: 1 }, { delete: 1 }, { insert: ["replacement"] }]
})

yarray.observeDeep((events) => {
  // Fires for changes in the array AND any nested shared types
  events.forEach((event) => {
    console.log('Change at path:', event.path)
  })
})

yarray.push(['triggers observer'])
```

**Important: shared types can only exist once:**

```js
const ydoc = new Y.Doc()
const array1 = ydoc.getArray('list-a')
const array2 = ydoc.getArray('list-b')

const sharedMap = new Y.Map()
sharedMap.set('key', 'value')

array1.push([sharedMap]) // OK — sharedMap now lives in list-a
// array2.push([sharedMap]) // ERROR — sharedMap already belongs to list-a
// Create a new Y.Map if you need the same data in two places
```

---

### 2.2 Use Y.Map for Collaborative Key-Value Storage with Awareness of Tombstone Growth

**Impact: HIGH (Y.Map retains CRDT tombstones for every historical value per key — frequent updates cause unbounded document growth)**

`Y.Map` is a shared key-value store similar to JavaScript's `Map`. It supports `set`, `get`, `delete`, `has`, and standard iteration methods. Values can be primitives, plain objects, or nested shared types.

**GOTCHA: Y.Map retains all historical values for each key as CRDT tombstones.** If you update the same key 100,000 times, all 100,000 values are stored in the CRDT metadata (even with `gc: true`, since the key still exists). This means Y.Map is unsuitable for frequently-updated keys like counters, cursors, or high-frequency state. For those use cases, use `YKeyValue` from the `y-utility` package instead.

**Correct — basic Y.Map operations:**

```js
import * as Y from 'yjs'

const ydoc = new Y.Doc()
const ymap = ydoc.getMap('state')

ydoc.transact(() => {
  ymap.set('title', 'My Document')
  ymap.set('count', 0)
  ymap.set('tags', ['draft', 'v1'])

  console.log(ymap.get('title'))  // "My Document"
  console.log(ymap.has('count'))  // true
  console.log(ymap.size)          // 3

  ymap.delete('tags')
  console.log(ymap.has('tags'))   // false
})

// Serialization
console.log(ymap.toJSON()) // { title: "My Document", count: 0 }
```

**Correct — iteration methods:**

```js
const ydoc = new Y.Doc()
const ymap = ydoc.getMap('config')

ymap.set('theme', 'dark')
ymap.set('locale', 'en')
ymap.set('fontSize', 14)

// Iterate entries
for (const [key, value] of ymap.entries()) {
  console.log(key, value)
}

// Keys and values
const keys = Array.from(ymap.keys())     // ["theme", "locale", "fontSize"]
const values = Array.from(ymap.values()) // ["dark", "en", 14]

// forEach
ymap.forEach((value, key) => {
  console.log(key, '=', value)
})

// Clone creates a fresh Y.Map with the same content (no shared history)
const clone = ymap.clone()
```

**Correct — nested shared types:**

```js
const ydoc = new Y.Doc()
const ymap = ydoc.getMap('project')

ydoc.transact(() => {
  const metadata = new Y.Map()
  metadata.set('createdAt', Date.now())
  metadata.set('author', 'user-123')

  ymap.set('metadata', metadata)

  // Access nested shared type
  ymap.get('metadata').set('updatedAt', Date.now())
})
```

**Correct — observing map changes:**

```js
const ydoc = new Y.Doc()
const ymap = ydoc.getMap('observed')

ymap.observe((event, transaction) => {
  // event is a Y.MapEvent
  // event.keysChanged is a Set of changed key names
  event.keysChanged.forEach((key) => {
    console.log('Changed key:', key)
  })

  // Detailed change info via event.changes.keys
  event.changes.keys.forEach((change, key) => {
    if (change.action === 'add') {
      console.log(`Added "${key}":`, ymap.get(key))
    } else if (change.action === 'update') {
      console.log(`Updated "${key}": ${change.oldValue} → ${ymap.get(key)}`)
    } else if (change.action === 'delete') {
      console.log(`Deleted "${key}", was:`, change.oldValue)
    }
  })
})

ymap.set('status', 'active') // Triggers observer
```

**Correct — clearing all entries:**

```js
const ydoc = new Y.Doc()
const ymap = ydoc.getMap('clearable')

ymap.set('a', 1)
ymap.set('b', 2)

// clear() removes all entries in one transaction
ydoc.transact(() => {
  ymap.clear()
})
```

**The tombstone problem — why Y.Map grows with frequent updates:**

```js
// AVOID this pattern with Y.Map — each set() retains the old value as a tombstone
const ymap = ydoc.getMap('cursor-position')
setInterval(() => {
  ymap.set('x', Math.random()) // 100k updates = 524KB+ of retained metadata
}, 16)

// INSTEAD: Use YKeyValue from y-utility for frequently-updated keys
// See: types-ymap-ykeyvalue.md
```

---

### 2.3 Use Y.Text for Collaborative Plain and Rich Text Editing

**Impact: HIGH (Y.Text provides CRDT-based text with rich text formatting compatible with Quill Delta format)**

`Y.Text` is a shared type for collaborative text editing. It supports plain text operations (insert, delete) and rich text formatting (bold, italic, etc.) with attributes. The Delta format used by `applyDelta` and `toDelta` is compatible with Quill's Delta format, making Yjs a natural backend for Quill-based editors.

Text positions are index-based. When multiple users edit concurrently, Yjs resolves conflicts automatically using CRDT algorithms — characters inserted at the same position by different users will both appear in a deterministic order.

**Correct — basic Y.Text operations:**

```js
import * as Y from 'yjs'

const ydoc = new Y.Doc()
const ytext = ydoc.getText('editor')

ydoc.transact(() => {
  // Insert plain text at index 0
  ytext.insert(0, 'Hello, world!')

  // Delete 7 characters starting at index 0
  ytext.delete(0, 7)
  // Content is now: "world!"

  // Insert at a specific position
  ytext.insert(0, 'Brave new ')
  // Content is now: "Brave new world!"
})

console.log(ytext.toString()) // "Brave new world!"
console.log(ytext.toJSON())   // "Brave new world!" (same as toString for Y.Text)
console.log(ytext.length)     // 16
```

**Correct — rich text with formatting attributes:**

```js
const ydoc = new Y.Doc()
const ytext = ydoc.getText('rich-editor')

ydoc.transact(() => {
  // Insert with inline formatting
  ytext.insert(0, 'Hello', { bold: true })
  ytext.insert(5, ' world')

  // Format a range after insertion
  ytext.format(6, 5, { italic: true }) // Italicize "world"

  // Remove formatting by setting attribute to null
  ytext.format(0, 5, { bold: null }) // Remove bold from "Hello"
})

// toDelta() returns Quill-compatible Delta format
console.log(ytext.toDelta())
// [
//   { insert: 'Hello ' },
//   { insert: 'world', attributes: { italic: true } }
// ]
```

**Correct — using Delta format for Quill integration:**

```js
const ydoc = new Y.Doc()
const ytext = ydoc.getText('quill-content')

// Apply a Quill-style delta
ytext.applyDelta([
  { insert: 'Title\n', attributes: { bold: true, header: 1 } },
  { insert: 'Body paragraph text.\n' },
])

// Read back as delta
const delta = ytext.toDelta()
```

**Correct — observing text changes:**

```js
const ydoc = new Y.Doc()
const ytext = ydoc.getText('observed')

ytext.observe((event, transaction) => {
  // event is a Y.TextEvent
  console.log('Delta:', event.delta)
  // delta format: [{ retain: N }, { insert: "text" }, { delete: N }]

  // Check what attributes changed
  if (event.keys.size > 0) {
    event.keys.forEach((change, key) => {
      console.log(`Attribute "${key}":`, change)
    })
  }
})

// observeDeep fires for changes in nested shared types (e.g., embedded Y.Map)
ytext.observeDeep((events) => {
  events.forEach((event) => {
    console.log('Deep change path:', event.path)
  })
})

// Trigger observer
ytext.insert(0, 'Change detected!')
```

**Correct — embedded objects in Y.Text:**

```js
const ydoc = new Y.Doc()
const ytext = ydoc.getText('with-embeds')

// Embed a shared type (e.g., an inline image or mention)
const embed = new Y.Map()
embed.set('type', 'image')
embed.set('src', 'https://example.com/photo.png')

ytext.insertEmbed(0, embed, { display: 'inline' })
```

---

### 2.4 Use Y.XmlFragment, Y.XmlElement, and Y.XmlText for Tree-Structured Document Models

**Impact: MEDIUM (XML types power ProseMirror and TipTap bindings — correct usage is essential for rich text editor integration)**

Yjs provides three XML shared types for representing tree-structured documents:

- **Y.XmlFragment** — an ordered collection of child nodes (similar to a DocumentFragment)
- **Y.XmlElement** — a named element with attributes and children (like a DOM element)
- **Y.XmlText** — extends Y.Text with XML-compatible formatting (used for text leaves)

These types are primarily used by editor bindings like `y-prosemirror` and `y-tiptap` to model the document tree. You rarely create them manually when using those bindings, but understanding their API is important for custom integrations, server-side processing, or manual document manipulation.

**Correct — Y.XmlFragment (top-level container):**

```js
import * as Y from 'yjs'

const ydoc = new Y.Doc()
const fragment = ydoc.getXmlFragment('prosemirror')

ydoc.transact(() => {
  // Create and insert child elements
  const paragraph = new Y.XmlElement('paragraph')
  fragment.insert(0, [paragraph])

  const heading = new Y.XmlElement('heading')
  fragment.insert(0, [heading]) // Insert before paragraph

  // Access children
  console.log(fragment.length)      // 2
  console.log(fragment.get(0))      // Y.XmlElement<heading>
  console.log(fragment.toArray())   // [Y.XmlElement<heading>, Y.XmlElement<paragraph>]

  // Delete a child
  fragment.delete(1, 1) // Remove paragraph

  // toString() produces XML string
  console.log(fragment.toString())  // "<heading></heading>"
})
```

**Correct — Y.XmlElement (named node with attributes):**

```js
import * as Y from 'yjs'

const ydoc = new Y.Doc()
const fragment = ydoc.getXmlFragment('doc')

ydoc.transact(() => {
  const heading = new Y.XmlElement('heading')

  // Set attributes
  heading.setAttribute('level', '1')
  heading.setAttribute('id', 'intro')

  // Read attributes
  console.log(heading.getAttribute('level')) // "1"

  // Get all attributes as object
  console.log(heading.getAttributes()) // { level: "1", id: "intro" }

  // Remove an attribute
  heading.removeAttribute('id')

  // Insert text content as Y.XmlText child
  const textNode = new Y.XmlText()
  textNode.insert(0, 'Welcome')
  heading.insert(0, [textNode])

  // Insert nested elements
  const bold = new Y.XmlElement('bold')
  const boldText = new Y.XmlText()
  boldText.insert(0, ' everyone')
  bold.insert(0, [boldText])
  heading.insert(1, [bold])

  fragment.insert(0, [heading])

  console.log(heading.toString()) // "<heading level=\"1\">Welcome<bold> everyone</bold></heading>"
  console.log(heading.nodeName)   // "heading"
})
```

**Correct — Y.XmlText (text leaf with formatting):**

```js
import * as Y from 'yjs'

const ydoc = new Y.Doc()
const fragment = ydoc.getXmlFragment('doc')

ydoc.transact(() => {
  const paragraph = new Y.XmlElement('paragraph')

  // Y.XmlText extends Y.Text — same insert/delete/format API
  const text = new Y.XmlText()
  text.insert(0, 'Hello, ')
  text.insert(7, 'world!', { bold: true })
  text.format(0, 5, { italic: true })

  paragraph.insert(0, [text])
  fragment.insert(0, [paragraph])

  // toDelta works the same as Y.Text
  console.log(text.toDelta())
  // [
  //   { insert: "Hello", attributes: { italic: true } },
  //   { insert: ", " },
  //   { insert: "world!", attributes: { bold: true } }
  // ]
})
```

**Correct — observing XML type changes:**

```js
const ydoc = new Y.Doc()
const fragment = ydoc.getXmlFragment('observed')

fragment.observe((event) => {
  // event.delta describes child insertions/deletions
  console.log('Fragment delta:', event.delta)
})

fragment.observeDeep((events) => {
  // Fires for changes anywhere in the subtree
  events.forEach((event) => {
    console.log('Deep change at path:', event.path)
    if (event.target instanceof Y.XmlElement) {
      console.log('Element changed:', event.target.nodeName)
    }
  })
})
```

---

### 2.5 Use YKeyValue from y-utility for Frequently-Updated Key-Value Data

**Impact: HIGH (YKeyValue reduces document size by 99.95% compared to Y.Map for high-frequency key updates)**

`YKeyValue` from the `y-utility` package is a drop-in alternative to `Y.Map` designed for keys that are updated frequently. It uses a `Y.Array` internally and periodically compacts old entries, eliminating the tombstone growth problem inherent to `Y.Map`.

**Correct — installing and using YKeyValue:**

```js
import * as Y from 'yjs'
import { YKeyValue } from 'y-utility/y-keyvalue'

const ydoc = new Y.Doc()

// YKeyValue wraps a Y.Array (not a Y.Map)
const yarray = ydoc.getArray('kv-store')
const ykv = new YKeyValue(yarray)

// API is similar to Y.Map
ykv.set('cursor-x', 150)
ykv.set('cursor-y', 300)

console.log(ykv.get('cursor-x')) // 150
console.log(ykv.has('cursor-y')) // true

ykv.delete('cursor-y')

// Iterate entries
for (const [key, value] of ykv.entries()) {
  console.log(key, value)
}

// Serialize to plain object
console.log(ykv.toJSON()) // { "cursor-x": 150 }
```

**Correct — high-frequency updates (the primary use case):**

```js
import * as Y from 'yjs'
import { YKeyValue } from 'y-utility/y-keyvalue'

const ydoc = new Y.Doc()
const yarray = ydoc.getArray('presence')
const ykv = new YKeyValue(yarray)

// Safe to update at high frequency — YKeyValue compacts automatically
function onMouseMove(event) {
  ydoc.transact(() => {
    ykv.set('x', event.clientX)
    ykv.set('y', event.clientY)
    ykv.set('timestamp', Date.now())
  })
}

document.addEventListener('mousemove', onMouseMove)
```

**Correct — observing changes:**

```js
import * as Y from 'yjs'
import { YKeyValue } from 'y-utility/y-keyvalue'

const ydoc = new Y.Doc()
const yarray = ydoc.getArray('reactive-state')
const ykv = new YKeyValue(yarray)

// YKeyValue emits change events
ykv.on('change', (changes, transaction) => {
  // changes is a Map<string, { action: 'add'|'update'|'delete', oldValue: any }>
  changes.forEach((change, key) => {
    if (change.action === 'add') {
      console.log(`Added "${key}":`, ykv.get(key))
    } else if (change.action === 'update') {
      console.log(`Updated "${key}": ${change.oldValue} → ${ykv.get(key)}`)
    } else if (change.action === 'delete') {
      console.log(`Deleted "${key}"`)
    }
  })
})

ykv.set('status', 'online') // Triggers change event
```

**Installation:**

```bash
npm install y-utility
```

---

## 3. Providers

**Impact: HIGH**

Network and persistence providers that sync Y.Doc state across clients and to local storage. Covers `y-websocket` (WS protocol + auth), `y-webrtc` (peer-to-peer signaling), `y-indexeddb` (offline persistence), and the contract a custom provider must satisfy.

### 3.1 Build Custom Providers Using Yjs Update and Sync Protocols

**Impact: HIGH (Incorrect custom provider implementation causes data loss, duplicate updates, or failed sync — understanding the update model is essential)**

Yjs updates are commutative, associative, and idempotent. This means you can apply updates in any order, apply the same update multiple times, and still converge to the correct state. This property makes it safe to build custom providers over any transport (HTTP, message queues, databases, etc.).

### Listening for Updates

---

### 3.2 Use y-indexeddb for Offline Persistence in the Browser

**Impact: HIGH (Without IndexedDB persistence, all local document state is lost on page reload, forcing a full re-sync from the server)**

The `y-indexeddb` provider persists a Yjs document to the browser's IndexedDB. When the user reloads the page or returns later, the document loads instantly from local storage instead of waiting for a full network sync. Combine it with a network provider (like y-websocket) for a seamless offline-first experience.

### Install

---

### 3.3 Use y-webrtc for Peer-to-Peer Sync Without a Central Server

**Impact: MEDIUM (WebRTC enables serverless peer-to-peer sync ideal for demos and prototyping but less reliable for production at scale)**

The `y-webrtc` provider synchronizes Yjs documents directly between browsers using WebRTC data channels. No central server is needed to relay document updates — only a lightweight signaling server brokers the initial peer connection. This makes it excellent for demos, prototyping, and scenarios where you want collaboration without deploying infrastructure.

### Install

---

### 3.4 Use y-websocket for Client-Server Real-Time Sync

**Impact: HIGH (WebSocket provides reliable client-server sync with built-in awareness, reconnection, and scalability for production deployments)**

The `y-websocket` provider is the most common way to synchronize Yjs documents across clients. It connects to a central WebSocket server that relays updates between peers, handles reconnection automatically, and includes the awareness protocol for presence features like cursors and user names.

Choose y-websocket when you need a reliable, production-ready sync layer with a central server you control.

### Install

---

## 4. Editor Bindings

**Impact: HIGH**

Binding Yjs shared types into rich-text editors — TipTap, ProseMirror, CodeMirror, Quill, Monaco. Each binding has framework-specific extension/plugin setup and an awareness-cursor integration story.

### 4.1 Integrate Yjs with CodeMirror 6 Using y-codemirror.next

**Impact: HIGH (Using the wrong shared type (XmlFragment instead of Text) or missing the undoManager causes broken sync or broken undo in CodeMirror)**

The `y-codemirror.next` package provides a CodeMirror 6 extension that binds a `Y.Text` shared type to the editor. Unlike ProseMirror-based editors that use `Y.XmlFragment`, CodeMirror works with plain text and uses `Y.Text`. The extension handles sync, remote cursors, and undo in a single `yCollab` call.

### Install

---

### 4.2 Integrate Yjs with Monaco Editor Using y-monaco

**Impact: HIGH (Missing MonacoBinding or incorrect parameter order causes edits to not sync or remote cursors to not render in the Monaco editor)**

The `y-monaco` package binds a `Y.Text` shared type to a Monaco editor instance. Monaco is the editor that powers VS Code, so this binding is ideal for building collaborative code editors. Like CodeMirror, Monaco works with plain text and uses `Y.Text` (not `Y.XmlFragment`).

### Install

---

### 4.3 Integrate Yjs with ProseMirror Using y-prosemirror Plugins

**Impact: HIGH (Incorrect plugin order or missing undo plugin causes broken sync, lost cursor positions, or undo that reverts other users' changes)**

The `y-prosemirror` package provides three ProseMirror plugins that enable collaborative editing. Plugin order matters: sync must come before cursor, and cursor before undo. The sync plugin binds a `Y.XmlFragment` to the ProseMirror document, the cursor plugin renders remote cursors via the awareness protocol, and the undo plugin replaces ProseMirror's default undo with a Yjs-aware version.

### Install

---

### 4.4 Integrate Yjs with Quill Using y-quill

**Impact: HIGH (Missing QuillBinding or incorrect cursor setup causes edits to not sync or remote cursors to not display)**

The `y-quill` package binds a `Y.Text` shared type to a Quill editor instance. Quill's Delta format and Yjs's `Y.Text` are naturally compatible — both represent rich text as a sequence of insert operations with attributes. The `quill-cursors` module is required to display remote cursors.

### Install

---

### 4.5 Integrate Yjs with TipTap Using y-prosemirror Collaboration Extensions

**Impact: CRITICAL (Incorrect TipTap + Yjs integration causes duplicate content, broken undo, or missing cursor sync)**

TipTap is built on ProseMirror, so it uses the `y-prosemirror` package for Yjs integration. TipTap provides convenient `Collaboration` and `CollaborationCursor` extensions that wrap the underlying y-prosemirror plugins. You must disable TipTap's built-in history extension when using Yjs, because Yjs provides its own undo manager that understands collaborative edits.

### Install

---

## 5. Awareness

**Impact: MEDIUM**

The awareness protocol — ephemeral per-client state (cursors, selection, user identity, typing indicators) that is NOT persisted in Y.Doc updates. Covers `awareness.setLocalStateField`, observer wiring, and the heartbeat/cleanup semantics for disconnected clients.

### 5.1 Use the Awareness Protocol for Ephemeral Presence State

**Impact: HIGH (Without awareness, users cannot see each other's cursors, selections, or online status — collaboration feels broken)**

The Awareness protocol is a CRDT for non-persistent, ephemeral state shared across peers. Unlike the Y.Doc which persists document content, awareness state is automatically cleaned up when a peer disconnects. It is used for presence features: cursor positions, user names and colors, online/offline status, and any other transient information.

Most providers (y-websocket, y-webrtc) create an awareness instance automatically, accessible via `provider.awareness`.

### Setting Local State

---

## 6. Undo / Redo

**Impact: MEDIUM**

`Y.UndoManager` patterns — scoping by client-origin, tracking specific shared-type subtrees, and the gotchas around capturing transient state vs. document content. Standard `editor.commands.undo()` does NOT work on Yjs-bound content; UndoManager is the only correct path.

### 6.1 Use Y.UndoManager for Collaborative Undo/Redo

**Impact: CRITICAL (Using the editor's built-in undo instead of Y.UndoManager causes undo to revert other users' changes, breaking the collaborative experience)**

`Y.UndoManager` provides undo/redo that only reverts the local user's changes, even in a collaborative document. Standard editor undo stacks track all operations and will undo other users' edits — this is incorrect for collaboration. The UndoManager is scoped to specific shared types and can be configured with tracked origins, capture timeouts, and metadata for cursor restoration.

### Basic Setup

---

## 7. Pitfalls

**Impact: MEDIUM**

Well-known footguns. **Duplicate Yjs imports** (two copies of yjs in node_modules) silently break sync via instanceof checks. **Subdocument handling** requires explicit load and a different update-application path. **v2 encoding migration** has been the cause of multiple production sync issues — never silently re-encode existing v1 updates.

### 7.1 Avoid Duplicate Yjs Imports (CJS/ESM Split)

**Impact: HIGH (Importing Yjs twice creates two separate Y instances that cannot sync — changes are silently lost)**

One of the most common and hardest-to-diagnose Yjs issues occurs when your bundle includes two separate copies of the `yjs` package. This typically happens when one dependency pulls in the CommonJS build and another pulls in the ESM build. Because each copy has its own internal type registry, shared types created by one copy are unrecognized by the other. Documents appear to work locally but changes never propagate between peers.

Symptoms of duplicate Yjs imports:
- Changes made in one editor do not appear in another, even though the provider reports connected status
- `instanceof` checks fail (e.g., `value instanceof Y.Map` returns `false` for a value that is clearly a Y.Map)
- Errors like "Unexpected case" or "Unknown content type" in the console
- State vectors diverge between clients that should be in sync

The root cause is almost always multiple versions or multiple builds of `yjs` in the dependency tree. Fix this by forcing a single resolution at the package manager level, and optionally with bundler aliases.

**Correct — force single Yjs version via package manager resolutions:**

```jsonc
// package.json — npm (v8.3+) overrides
{
  "overrides": {
    "yjs": "13.6.18"
  }
}
// package.json — yarn resolutions
{
  "resolutions": {
    "yjs": "13.6.18"
  }
}
// package.json — pnpm overrides
{
  "pnpm": {
    "overrides": {
      "yjs": "13.6.18"
    }
  }
}
```

**Correct — bundler aliases to deduplicate at build time:**

```js
// webpack.config.js
const path = require('path')

module.exports = {
  resolve: {
    alias: {
      yjs: path.resolve(__dirname, 'node_modules/yjs')
    }
  }
}
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    dedupe: ['yjs']
  }
})
```

**Correct — diagnosing the problem:**

```bash
# Check how many copies of yjs are installed
npm ls yjs

# If you see multiple versions in the tree, apply overrides above
# After changing overrides, reinstall:
rm -rf node_modules package-lock.json
npm install
```

---

### 7.2 Prefer Y.Map with Multiple Fragments Over Subdocuments

**Impact: MEDIUM (Subdocuments add complexity and are rarely needed — Y.Map with multiple shared types handles most multi-editor use cases)**

Yjs supports subdocuments — nested `Y.Doc` instances embedded inside a parent document. However, subdocuments introduce significant complexity: they require separate provider connections or manual syncing, have their own lifecycle events, and make state management harder to reason about. In most cases, the same goal can be achieved more simply by using a single Y.Doc with a Y.Map containing multiple shared type entries.

The most common reason developers reach for subdocuments is to support multiple independent editors within one collaborative session (e.g., a multi-tab editor or a document with several editable sections). This is better handled by creating multiple `Y.XmlFragment` entries in a top-level `Y.Map` — each fragment syncs automatically through the same provider, with no extra wiring.

Subdocuments ARE appropriate when you have a very large document and want lazy-loading — only loading portions of the document when they are actually needed. For example, a project management tool where each task card is its own subdocument loaded on demand.

**Correct — multiple editors using Y.Map (preferred approach):**

```js
import * as Y from 'yjs'

const ydoc = new Y.Doc()

// Use a Y.Map to hold multiple editor fragments
const editors = ydoc.getMap('editors')

// Each editor section gets its own Y.XmlFragment
// All sync through the same provider — no extra setup needed
ydoc.transact(() => {
  editors.set('editor-main', new Y.XmlFragment())
  editors.set('editor-sidebar', new Y.XmlFragment())
  editors.set('editor-notes', new Y.XmlFragment())
})

// Bind each fragment to a different editor instance
const mainFragment = editors.get('editor-main')
const sidebarFragment = editors.get('editor-sidebar')
// Pass these to y-prosemirror, y-codemirror, etc.
```

**Correct — subdocuments when lazy-loading is genuinely needed:**

```js
import * as Y from 'yjs'

const parentDoc = new Y.Doc()
const ymeta = parentDoc.getMap('documents')

// Create a subdocument
const subdoc = new Y.Doc({ guid: 'task-card-42' })
ymeta.set('task-42', subdoc)

// Listen for subdocument lifecycle events on the parent
parentDoc.on('subdocs', ({ loaded, added, removed }) => {
  // loaded: Set of subdocs that finished loading
  // added: Set of newly added subdocs
  // removed: Set of removed subdocs
  loaded.forEach((doc) => {
    console.log('Subdoc loaded:', doc.guid)
    // Now wire up a provider or apply stored state to this subdoc
  })
})

// Load a subdocument on demand (triggers the 'subdocs' event)
subdoc.load()

// Destroy a subdocument when it's no longer needed
subdoc.destroy()
```

---

### 7.3 Understand V2 Update Encoding Trade-Offs Before Enabling

**Impact: MEDIUM (V2 encoding is ~10x more efficient but experimental and requires all clients to use the same version)**

Yjs supports an experimental V2 update encoding format that produces significantly smaller updates — roughly 10x more efficient than the default V1 encoding. This can meaningfully reduce bandwidth and storage costs for high-traffic collaborative applications. However, V2 encoding is still marked experimental and carries strict compatibility requirements.

The critical constraint: all clients and servers in a collaboration room must use the same encoding version. If one client sends V2-encoded updates to a peer expecting V1, the peer will fail to decode them. This means you cannot incrementally roll out V2 encoding — it must be an all-or-nothing switch across your entire deployment.

V2 encoding also applies to persistence. If you store updates in a database using V2 encoding, you must decode them with V2 APIs. Mixing V1 and V2 stored updates requires explicit conversion.

**Correct — enabling V2 encoding on Y.Doc:**

```js
import * as Y from 'yjs'

// Enable V2 encoding for this document
const ydoc = new Y.Doc()

// Use V2-specific encoding/decoding functions
const update = Y.encodeStateAsUpdateV2(ydoc)
const stateVector = Y.encodeStateVectorV2(ydoc)

// Apply a V2-encoded update
Y.applyUpdateV2(ydoc, remoteUpdate)

// Merge multiple V2 updates
const merged = Y.mergeUpdatesV2([update1, update2, update3])

// Diff using V2 state vectors
const diff = Y.diffUpdateV2(update, stateVector)
```

**Correct — converting between V1 and V2:**

```js
// Convert V1 update to V2
const v2Update = Y.convertUpdateFormatV1ToV2(v1Update)

// Convert V2 update back to V1
const v1Update = Y.convertUpdateFormatV2ToV1(v2Update)
```

**Correct — using V2 with providers (custom provider example):**

```js
const ydoc = new Y.Doc()

// When sending updates, use V2 encoding
ydoc.on('updateV2', (update, origin) => {
  // update is already V2-encoded
  if (origin !== 'remote') {
    sendToServer(update) // Send V2 update to peers
  }
})

// When receiving updates, apply with V2 decoder
function onRemoteUpdate(v2Update) {
  Y.applyUpdateV2(ydoc, v2Update, 'remote')
}
```

---

## 8. Debugging

**Impact: LOW-MEDIUM**

Troubleshooting checklist for common sync failures: clients showing different content despite identical providers, observers firing twice, awareness updates not propagating, undo stack appearing empty.

### 8.1 Debug Yjs Sync Issues with Built-In Inspection Tools

**Impact: MEDIUM (Knowing how to inspect updates, state vectors, and provider status cuts debugging time from hours to minutes)**

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

---

## References

- https://docs.yjs.dev
- https://github.com/yjs/yjs
- https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap
- https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror
- https://docs.velt.dev
