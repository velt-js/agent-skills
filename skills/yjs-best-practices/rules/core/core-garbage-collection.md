---
title: Configure Garbage Collection Based on Version History Requirements
impact: MEDIUM
impactDescription: Incorrect GC settings cause either unbounded document growth or inability to restore past versions
tags: gc, garbage-collection, version-history, time-travel, snapshots, document-size
---

## Configure Garbage Collection Based on Version History Requirements

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

**When to disable GC:**

| Use case | gc setting |
|---|---|
| Real-time collaboration (standard) | `true` (default) |
| Version history / time travel | `false` |
| Undo/redo (UndoManager) | `true` (UndoManager handles its own stack) |
| Audit trail / compliance | `false` |
| Large documents with frequent edits | `true` (to control size) |

**Verification:**
- [ ] `gc` setting is consistent across all peers sharing the same document
- [ ] `gc: false` is only used when version history or snapshots are required
- [ ] Document size is monitored when `gc: false` — implement server-side compaction if needed
- [ ] Snapshots are created via `Y.snapshot(ydoc)` only when `gc: false`
- [ ] UndoManager does not require `gc: false` — it maintains its own undo stack

**Source:** https://docs.yjs.dev/api/y.doc
