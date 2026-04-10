---
title: Use Y.Map for Collaborative Key-Value Storage with Awareness of Tombstone Growth
impact: HIGH
impactDescription: Y.Map retains CRDT tombstones for every historical value per key — frequent updates cause unbounded document growth
tags: Y.Map, map, set, get, delete, has, observe, keysChanged, tombstone, document-size
---

## Use Y.Map for Collaborative Key-Value Storage with Awareness of Tombstone Growth

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

**Verification:**
- [ ] Y.Map is used for data with relatively stable keys (config, metadata, named fields)
- [ ] Frequently-updated keys use `YKeyValue` from `y-utility` instead of `Y.Map`
- [ ] Nested shared types are not inserted into multiple locations in the document
- [ ] Observers use `event.keysChanged` or `event.changes.keys` for granular change tracking
- [ ] `ymap.unobserve(fn)` is called when observers are no longer needed

**Source:** https://docs.yjs.dev/api/shared-types/y.map
