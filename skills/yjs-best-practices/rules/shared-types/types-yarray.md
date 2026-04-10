---
title: Use Y.Array for Collaborative Ordered Sequences
impact: HIGH
impactDescription: Y.Array provides CRDT-based ordered lists with conflict-free concurrent insertions
tags: Y.Array, array, insert, delete, push, unshift, get, toArray, toJSON, observe, delta, nested
---

## Use Y.Array for Collaborative Ordered Sequences

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

**Verification:**
- [ ] `Y.Array` is retrieved via `ydoc.getArray(name)` for top-level arrays
- [ ] Nested shared types are not inserted into multiple locations
- [ ] `push` and `insert` receive arrays of items, not single items
- [ ] `toArray()` is used when a plain JS array copy is needed
- [ ] Observers are cleaned up with `yarray.unobserve(fn)` on teardown

**Source:** https://docs.yjs.dev/api/shared-types/y.array
