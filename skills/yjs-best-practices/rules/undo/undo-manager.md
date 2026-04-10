---
title: Use Y.UndoManager for Collaborative Undo/Redo
impact: CRITICAL
impactDescription: Using the editor's built-in undo instead of Y.UndoManager causes undo to revert other users' changes, breaking the collaborative experience
tags: yjs, undo, redo, UndoManager, trackedOrigins, captureTimeout, meta
---

## Use Y.UndoManager for Collaborative Undo/Redo

`Y.UndoManager` provides undo/redo that only reverts the local user's changes, even in a collaborative document. Standard editor undo stacks track all operations and will undo other users' edits — this is incorrect for collaboration. The UndoManager is scoped to specific shared types and can be configured with tracked origins, capture timeouts, and metadata for cursor restoration.

### Basic Setup

```js
import * as Y from 'yjs'

const ydoc = new Y.Doc()
const ytext = ydoc.getText('editor')

// Create an UndoManager scoped to ytext
const undoManager = new Y.UndoManager(ytext)

// Undo and redo
undoManager.undo()
undoManager.redo()
```

### Configuration Options

```js
const ytext = ydoc.getText('editor')
const ymap = ydoc.getMap('metadata')

// Scope to multiple shared types
const undoManager = new Y.UndoManager([ytext, ymap], {
  // Time in ms to group consecutive changes into one undo step (default: 500)
  captureTimeout: 500,

  // Only track changes from these transaction origins.
  // null origin means direct local edits (the default).
  trackedOrigins: new Set([null]),

  // Filter which deleted items should be restored on undo
  deleteFilter: (item) => true,
})
```

### Stop Capturing (Force New Undo Step)

```js
// By default, rapid edits within captureTimeout are grouped.
// Call stopCapturing() to force the next edit into a new undo step.
undoManager.stopCapturing()
```

### Tracked Origins

```js
// Only undo changes made with specific transaction origins
const undoManager = new Y.UndoManager(ytext, {
  trackedOrigins: new Set(['user-input']),
})

// This change will be tracked (origin matches)
ydoc.transact(() => {
  ytext.insert(0, 'Hello')
}, 'user-input')

// This change will NOT be tracked (origin doesn't match)
ydoc.transact(() => {
  ytext.insert(0, 'System: ')
}, 'system')

// undoManager.undo() only reverts the 'Hello' insert
```

### Meta Pattern for Cursor Restoration

```js
// Use stack item metadata to save/restore cursor positions on undo/redo
undoManager.on('stack-item-added', (event) => {
  // Save the current cursor position when a change is recorded
  event.stackItem.meta.set('cursor-position', getCursorPosition())
})

undoManager.on('stack-item-popped', (event) => {
  // Restore cursor position when undoing/redoing
  const savedPosition = event.stackItem.meta.get('cursor-position')
  if (savedPosition != null) {
    restoreCursorPosition(savedPosition)
  }
})
```

### Events

```js
// Fired when a new undo step is added to the stack
undoManager.on('stack-item-added', (event) => {
  // event.stackItem — the new stack item
  // event.origin — transaction origin
  // event.type — 'undo' or 'redo'
  // event.changedParentTypes — Map of changed Y types
})

// Fired when an undo or redo is performed
undoManager.on('stack-item-popped', (event) => {
  // Same properties as stack-item-added
})

// Fired when an existing stack item is updated (merged with new changes)
undoManager.on('stack-item-updated', (event) => {
  // Same properties as stack-item-added
})
```

### Clear the Stacks

```js
// Clear both undo and redo stacks
undoManager.clear()

// Check stack sizes
console.log('Can undo:', undoManager.undoStack.length > 0)
console.log('Can redo:', undoManager.redoStack.length > 0)
```

### Integration with Editor Bindings

```js
// y-prosemirror / TipTap: use yUndoPlugin() — it creates an UndoManager internally
import { yUndoPlugin, undo, redo } from 'y-prosemirror'

// y-codemirror.next: pass undoManager to yCollab
import { yCollab } from 'y-codemirror.next'
const undoManager = new Y.UndoManager(ytext)
const ext = yCollab(ytext, awareness, { undoManager })
```

## Verification Checklist

- [ ] `Y.UndoManager` is used instead of the editor's built-in undo
- [ ] UndoManager is scoped to the correct shared type(s)
- [ ] `trackedOrigins` is configured if you need to filter which changes are undoable
- [ ] `captureTimeout` is tuned for your use case (default 500ms)
- [ ] `stopCapturing()` is called before semantically distinct operations
- [ ] Cursor position is saved/restored via the meta pattern if needed
- [ ] Editor's built-in history is disabled when using Yjs undo

## Source

- https://docs.yjs.dev/api/undo-manager
