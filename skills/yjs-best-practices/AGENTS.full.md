# Yjs Best Practices
|v1.0.0|Velt|April 2026
|IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for any Yjs tasks.

---

## 1. Core (Y.Doc & Updates) — CRITICAL

### 1.1 Y.Doc Setup
**Impact: HIGH** — Y.Doc is the root container for all shared types; misconfiguration causes data loss or sync failures.

`Y.Doc` is the top-level shared document. Each instance gets a unique `clientID`. Shared types are accessed via `ydoc.getMap(name)`, `ydoc.getText(name)`, etc. — same name always returns the same instance. Set `gc: false` only when version history is needed. Always call `ydoc.destroy()` on cleanup.

```js
import * as Y from 'yjs'
const ydoc = new Y.Doc()
const ymap = ydoc.getMap('shared-state')
const ytext = ydoc.getText('editor-content')
ydoc.transact(() => {
  ymap.set('title', 'My Document')
  ytext.insert(0, 'Hello, world!')
})
ydoc.on('update', (update, origin) => { broadcastUpdate(update) })
// Cleanup: ydoc.destroy()
```

**Checklist:** Y.Doc created with appropriate gc setting | shared types accessed by consistent names | `ydoc.destroy()` called on unmount | `clientID` never manually set | update listener registered.

**Source:** https://docs.yjs.dev/api/y.doc

---

### 1.2 Transactions
**Impact: HIGH** — Transactions batch mutations so observers fire once and enable origin-based provider filtering.

`ydoc.transact(fn, origin)` groups changes atomically. The `origin` parameter prevents echo loops — providers use it to distinguish local from remote changes.

```js
ydoc.transact(() => {
  ymap.set('name', 'Project Alpha')
  yarray.push(['task-1', 'task-2'])
})

// Origin filtering for providers
ydoc.on('update', (update, origin) => {
  if (origin === 'my-provider') return // skip remote echo
  sendToServer(update)
})
```

**Event order:** beforeTransaction -> mutations -> beforeObserverCalls -> observe -> observeDeep -> afterTransaction -> update event.

**Checklist:** Related mutations wrapped in `transact()` | origin set when applying remote updates | update listeners check origin before re-broadcasting | nested transactions are flattened.

**Source:** https://docs.yjs.dev/api/y.doc#transact

---

### 1.3 Document Updates
**Impact: HIGH** — Correct update encoding prevents data loss and minimizes bandwidth.

Updates are commutative, associative, and idempotent — safe to apply out of order or duplicate.

```js
// State vector sync protocol
const clientSV = Y.encodeStateVector(clientDoc)
const diff = Y.encodeStateAsUpdate(serverDoc, clientSV)
Y.applyUpdate(clientDoc, diff)

// Merge updates for compaction
const merged = Y.mergeUpdates([update1, update2, update3])

// Server-side diff without loading Y.Doc
const sv = Y.encodeStateVectorFromUpdate(storedUpdate)
const diff = Y.diffUpdate(storedUpdate, clientSV)
```

**Checklist:** `Y.applyUpdate` used (never manual state modification) | state vector sync for initial sync | `Y.mergeUpdates` for periodic compaction | origin passed to `applyUpdate` | `encodeStateVectorFromUpdate` used server-side.

**Source:** https://docs.yjs.dev/api/document-updates

---

### 1.4 Garbage Collection
**Impact: MEDIUM** — Incorrect GC causes unbounded growth or inability to restore versions.

`gc: true` (default) permanently removes deleted content metadata. `gc: false` retains it for version history/snapshots. Must be consistent across all peers.

```js
const ydoc = new Y.Doc({ gc: false }) // for version history
const snapshot = Y.snapshot(ydoc)
const restored = Y.createDocFromSnapshot(ydoc, snapshot)
```

**Checklist:** gc consistent across all peers | `gc: false` only for version history | document size monitored when gc disabled | UndoManager does NOT require `gc: false`.

**Source:** https://docs.yjs.dev/api/y.doc

---

## 2. Shared Types — CRITICAL

### 2.1 Y.Text
**Impact: HIGH** — CRDT-based text with rich formatting compatible with Quill Delta format.

Supports insert, delete, format with attributes. `toDelta()` returns Quill-compatible Delta. `applyDelta()` accepts Quill deltas.

```js
const ytext = ydoc.getText('editor')
ytext.insert(0, 'Hello', { bold: true })
ytext.format(0, 5, { italic: true })
console.log(ytext.toDelta()) // Quill-compatible delta
ytext.observe((event) => { console.log(event.delta) })
```

**Checklist:** Retrieved via `ydoc.getText(name)` | rich text uses `format()` or insert attributes | `toDelta()` for serialization | observers cleaned up with `unobserve`.

**Source:** https://docs.yjs.dev/api/shared-types/y.text

---

### 2.2 Y.Array
**Impact: HIGH** — Ordered sequences with conflict-free concurrent insertions.

Shared types can only exist once in a document — cannot insert the same Y.Map into two arrays.

```js
const yarray = ydoc.getArray('items')
yarray.push(['apple', 'banana'])
yarray.insert(1, ['cherry'])
yarray.observe((event) => { console.log(event.delta) })
// Nested types: push Y.Map instances for structured items
```

**Checklist:** `push`/`insert` receive arrays of items | nested shared types not in multiple locations | `toArray()` for plain JS copy | observers cleaned up.

**Source:** https://docs.yjs.dev/api/shared-types/y.array

---

### 2.3 Y.Map
**Impact: HIGH** — Key-value storage, but retains CRDT tombstones for every historical value per key.

GOTCHA: Updating the same key 100k times retains all 100k values. Use `YKeyValue` from `y-utility` for frequently-updated keys.

```js
const ymap = ydoc.getMap('state')
ymap.set('title', 'My Doc')
ymap.observe((event) => {
  event.changes.keys.forEach((change, key) => {
    console.log(change.action, key, ymap.get(key))
  })
})
```

**Checklist:** Used for stable keys only | frequent updates use YKeyValue instead | observers use `event.keysChanged` | `unobserve` on teardown.

**Source:** https://docs.yjs.dev/api/shared-types/y.map

---

### 2.4 YKeyValue (y-utility)
**Impact: MEDIUM** — Efficient key-value without tombstone bloat (524KB -> 271B for 100k updates).

`YKeyValue` from the `y-utility` package wraps Y.Array to provide a key-value interface without the tombstone growth problem of Y.Map. Use it for counters, cursor positions, or any frequently-updated state.

**Source:** https://github.com/yjs/y-utility

---

### 2.5 Y.XmlFragment / Y.XmlElement / Y.XmlText
**Impact: HIGH** — Structured document types used by ProseMirror and TipTap bindings.

`Y.XmlFragment` is the shared type for rich-text editors built on ProseMirror. It represents a document fragment with child elements and text nodes. Access via `ydoc.getXmlFragment('prosemirror')`.

**Source:** https://docs.yjs.dev/api/shared-types/y.xmlfragment

---

## 3. Providers — HIGH

### 3.1 y-websocket
**Impact: HIGH** — Client-server sync with awareness, reconnection, and scalability.

```js
import { WebsocketProvider } from 'y-websocket'
const provider = new WebsocketProvider('ws://localhost:1234', 'my-room', ydoc)
provider.awareness.setLocalStateField('user', { name: 'Alice', color: '#ff0000' })
provider.on('status', (e) => console.log(e.status))
provider.on('sync', (synced) => console.log('Synced:', synced))
// Cleanup: provider.destroy()
```

**Server:** `npx y-websocket` or custom server with `setupWSConnection` from `y-websocket/bin/utils`.

**Checklist:** Provider created with URL + room + ydoc | destroyed on unmount | awareness via `provider.awareness` | connection status monitored.

**Source:** https://docs.yjs.dev/ecosystem/connection-provider/y-websocket

---

### 3.2 y-webrtc
**Impact: MEDIUM** — Peer-to-peer sync without a central server. Best for demos and small groups (<20 peers).

```js
import { WebrtcProvider } from 'y-webrtc'
const provider = new WebrtcProvider('my-room', ydoc, {
  signaling: ['wss://signaling.yjs.dev'],
  password: 'optional-secret'
})
```

**Checklist:** Signaling servers reachable | provider destroyed on cleanup | consider y-websocket for production scale.

**Source:** https://docs.yjs.dev/ecosystem/connection-provider/y-webrtc

---

### 3.3 y-indexeddb
**Impact: HIGH** — Offline persistence; document loads instantly from local storage on reload.

```js
import { IndexeddbPersistence } from 'y-indexeddb'
const persistence = new IndexeddbPersistence('my-doc-id', ydoc)
persistence.on('synced', () => console.log('Loaded from IndexedDB'))
// Combine with y-websocket for offline-first experience
```

**Checklist:** Unique document name per document | `synced` event handled | combined with network provider | destroyed on cleanup.

**Source:** https://docs.yjs.dev/ecosystem/database-provider/y-indexeddb

---

### 3.4 Custom Providers
**Impact: HIGH** — Build providers over any transport using the two-phase sync protocol.

Updates are commutative, associative, idempotent — safe over unreliable transports. Use origin to prevent echo loops. Implement: (1) exchange state vectors, (2) compute and send diffs.

```js
class CustomProvider {
  constructor(ydoc, connection) {
    this.ydoc = ydoc
    this.ydoc.on('update', (update, origin) => {
      if (origin !== this) connection.send({ type: 'update', data: update })
    })
    connection.on('message', (msg) => {
      if (msg.type === 'update') Y.applyUpdate(this.ydoc, msg.data, this)
    })
    // Initiate sync
    connection.send({ type: 'sync-step-1', stateVector: Y.encodeStateVector(ydoc) })
  }
}
```

**Checklist:** Origin set on `applyUpdate` | two-phase sync implemented | updates treated as opaque Uint8Array | cleanup removes listeners.

**Source:** https://docs.yjs.dev/tutorials/creating-a-custom-provider

---

## 4. Editor Bindings — HIGH

### 4.1 TipTap
**Impact: CRITICAL** — Uses y-prosemirror under the hood. MUST disable built-in history.

```js
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
const editor = useEditor({
  extensions: [
    StarterKit.configure({ history: false }), // CRITICAL
    Collaboration.configure({ document: ydoc }),
    CollaborationCursor.configure({ provider, user: { name: 'Alice', color: '#f00' } }),
  ],
})
```

**Checklist:** history: false in StarterKit | Collaboration configured with ydoc | CollaborationCursor with provider + user | all destroyed on cleanup.

**Source:** https://docs.yjs.dev/ecosystem/editor-bindings/tiptap2

---

### 4.2 ProseMirror
**Impact: HIGH** — Plugin order matters: ySyncPlugin -> yCursorPlugin -> yUndoPlugin.

```js
import { ySyncPlugin, yCursorPlugin, yUndoPlugin, undo, redo } from 'y-prosemirror'
const yXmlFragment = ydoc.getXmlFragment('prosemirror')
// Plugins in order: ySyncPlugin(yXmlFragment), yCursorPlugin(awareness), yUndoPlugin()
```

Uses `Y.XmlFragment` (not Y.Text). Default history plugin must NOT be included.

**Checklist:** Correct plugin order | Y.XmlFragment used | awareness user set with name+color | undo/redo keybindings from y-prosemirror.

**Source:** https://docs.yjs.dev/ecosystem/editor-bindings/prosemirror

---

### 4.3 CodeMirror 6
**Impact: HIGH** — Uses `Y.Text` (not Y.XmlFragment). Single `yCollab` extension handles sync, cursors, undo.

```js
import { yCollab } from 'y-codemirror.next'
const ytext = ydoc.getText('codemirror')
const undoManager = new Y.UndoManager(ytext)
// Extension: yCollab(ytext, provider.awareness, { undoManager })
```

**Checklist:** Y.Text used | yCollab added with ytext + awareness + undoManager | UndoManager scoped to same Y.Text | cleanup destroys view and providers.

**Source:** https://docs.yjs.dev/ecosystem/editor-bindings/codemirror.next

---

### 4.4 Quill
**Impact: HIGH** — Y.Text + QuillBinding + quill-cursors module.

```js
import { QuillBinding } from 'y-quill'
Quill.register('modules/cursors', QuillCursors)
const ytext = ydoc.getText('quill')
const binding = new QuillBinding(ytext, quill, provider.awareness)
```

**Checklist:** QuillCursors registered | cursors: true in modules | Y.Text used | binding destroyed on cleanup.

**Source:** https://docs.yjs.dev/ecosystem/editor-bindings/quill

---

### 4.5 Monaco
**Impact: HIGH** — Y.Text + MonacoBinding. Editors parameter is a Set.

```js
import { MonacoBinding } from 'y-monaco'
const ytext = ydoc.getText('monaco')
const binding = new MonacoBinding(ytext, editor.getModel(), new Set([editor]), provider.awareness)
```

**Checklist:** Y.Text used | MonacoBinding receives (ytext, model, Set of editors, awareness) | binding and editor destroyed on cleanup.

**Source:** https://docs.yjs.dev/ecosystem/editor-bindings/monaco

---

## 5. Awareness — MEDIUM-HIGH

### 5.1 Awareness Protocol
**Impact: MEDIUM-HIGH** — Ephemeral presence data (cursors, user info) that auto-expires.

Awareness is accessed via `provider.awareness`. Each client has a local state that is broadcast to all peers. States expire automatically when a client disconnects (default timeout ~30s). Use `setLocalStateField` for partial updates.

```js
const awareness = provider.awareness
awareness.setLocalStateField('user', { name: 'Alice', color: '#ff0000' })
awareness.setLocalStateField('cursor', { x: 100, y: 200 })
awareness.on('change', ({ added, updated, removed }) => {
  const states = awareness.getStates() // Map<clientID, state>
})
// Set local state to null to indicate "offline"
awareness.setLocalState(null)
```

**Checklist:** Awareness from `provider.awareness` (not created separately) | `setLocalStateField` for partial updates | change listener for rendering remote cursors | state auto-expires on disconnect.

**Source:** https://docs.yjs.dev/api/about-awareness

---

## 6. Undo/Redo — MEDIUM

### 6.1 UndoManager
**Impact: MEDIUM** — Collaborative undo that only reverts the local user's changes.

`Y.UndoManager` tracks changes to specified shared types and supports undo/redo scoped to the current user. Use `trackedOrigins` to control which changes are tracked. Use `captureTimeout` to group rapid edits into single undo steps.

```js
const ytext = ydoc.getText('editor')
const undoManager = new Y.UndoManager(ytext, {
  captureTimeout: 500, // Group edits within 500ms into one undo step
  trackedOrigins: new Set([null, 'local']), // Only track local changes
})
undoManager.undo()
undoManager.redo()
undoManager.on('stack-item-added', (event) => { /* update UI */ })
undoManager.on('stack-item-popped', (event) => { /* update UI */ })
// Cleanup: undoManager.destroy()
```

**Checklist:** UndoManager scoped to the shared types being edited | `captureTimeout` set for UX | `trackedOrigins` excludes remote origins | destroyed on cleanup | editor-specific undo (ProseMirror history) is disabled.

**Source:** https://docs.yjs.dev/api/undo-manager

---

## 7. Pitfalls & Debugging — MEDIUM

### 7.1 Duplicate Imports (CJS/ESM Split)
**Impact: HIGH** — Importing Yjs twice creates two Y instances that cannot sync. Changes silently lost.

Symptoms: changes don't propagate, `instanceof` checks fail, "Unexpected case" errors. Fix with package manager resolutions and bundler aliases.

```jsonc
// package.json — npm overrides
{ "overrides": { "yjs": "13.6.18" } }
// yarn: "resolutions", pnpm: "pnpm.overrides"
```

```js
// vite.config.js
export default defineConfig({ resolve: { dedupe: ['yjs'] } })
```

**Checklist:** `npm ls yjs` shows one copy | overrides/resolutions pin single version | bundler dedupe configured | no "Unexpected case" errors.

**Source:** https://docs.yjs.dev/tutorials/pitfalls#yjs-is-imported-twice

---

### 7.2 Subdocuments
**Impact: MEDIUM** — Rarely needed. Use Y.Map with multiple Y.XmlFragment entries instead.

Subdocuments add complexity (separate providers, lifecycle events). Only use for lazy-loading very large documents.

```js
// Preferred: multiple editors via Y.Map
const editors = ydoc.getMap('editors')
editors.set('editor1', new Y.XmlFragment())
editors.set('editor2', new Y.XmlFragment())

// Subdocs only when lazy-loading is needed
const subdoc = new Y.Doc({ guid: 'task-42' })
parentDoc.getMap('docs').set('task-42', subdoc)
parentDoc.on('subdocs', ({ loaded, added, removed }) => { /* handle */ })
subdoc.load()
```

**Checklist:** Subdocs only for lazy-loading | multi-editor uses Y.Map + fragments | subdocs have stable guid | load/destroy called at lifecycle points.

**Source:** https://docs.yjs.dev/api/subdocuments

---

### 7.3 V2 Update Encoding
**Impact: MEDIUM** — ~10x more efficient but experimental; ALL clients must use same encoding version.

```js
const update = Y.encodeStateAsUpdateV2(ydoc)
Y.applyUpdateV2(ydoc, remoteUpdate)
const merged = Y.mergeUpdatesV2([u1, u2])
// Convert: Y.convertUpdateFormatV1ToV2(v1Update)
```

**Checklist:** All clients and servers use V2 if any do | persistence uses V2 functions | tested in staging | rollback plan exists.

**Source:** https://docs.yjs.dev/api/document-updates#update-v2-api

---

### 7.4 Debugging Common Issues
**Impact: MEDIUM** — Built-in inspection tools cut debugging time significantly.

```js
// Inspect updates
ydoc.on('update', (update) => { Y.logUpdate(update) })

// Compare state vectors
const sv = Y.decodeStateVector(Y.encodeStateVector(ydoc))
sv.forEach((clock, clientID) => console.log(`Client ${clientID}: ${clock}`))

// Singleton pattern — one Y.Doc per room
const docs = new Map()
function getOrCreateDoc(room) {
  if (!docs.has(room)) {
    const ydoc = new Y.Doc()
    const provider = new WebsocketProvider('ws://localhost:1234', room, ydoc)
    docs.set(room, { ydoc, provider })
  }
  return docs.get(room)
}
```

Common causes: provider not connected | different room names | multiple Y.Doc instances | duplicate Yjs imports.

**Verification:** Open two browser tabs, type in one, verify sync in the other.

**Checklist:** `Y.logUpdate` used during development | state vectors compared when sync fails | singleton Y.Doc pattern | provider status monitored | `npm ls yjs` confirms single version.

**Source:** https://docs.yjs.dev/api/document-updates
