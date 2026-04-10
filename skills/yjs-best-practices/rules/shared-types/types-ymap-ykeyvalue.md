---
title: Use YKeyValue from y-utility for Frequently-Updated Key-Value Data
impact: HIGH
impactDescription: YKeyValue reduces document size by 99.95% compared to Y.Map for high-frequency key updates
tags: YKeyValue, y-utility, key-value, compact, Y.Map alternative, tombstone, performance
---

## Use YKeyValue from y-utility for Frequently-Updated Key-Value Data

`YKeyValue` from the `y-utility` package is a drop-in alternative to `Y.Map` designed for keys that are updated frequently. It uses a `Y.Array` internally and periodically compacts old entries, eliminating the tombstone growth problem inherent to `Y.Map`.

**The size difference is dramatic:** 100,000 `set` operations on 10 keys produces ~524KB with `Y.Map` but only ~271 bytes with `YKeyValue`. This makes it the correct choice for cursor positions, presence data, counters, live metrics, and any state that changes rapidly.

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

**Size comparison — Y.Map vs YKeyValue:**

| Scenario (100k operations, 10 keys) | Y.Map | YKeyValue |
|---|---|---|
| Document size | ~524 KB | ~271 bytes |
| Growth pattern | Linear with total operations | Constant (compacts) |
| Suitable for high-frequency updates | No | Yes |

**When to use Y.Map vs YKeyValue:**

| Use case | Recommended type |
|---|---|
| Document metadata (title, author) | Y.Map |
| Configuration / settings | Y.Map |
| Cursor positions / presence | YKeyValue |
| Live counters / metrics | YKeyValue |
| Frequently toggled state | YKeyValue |
| Nested shared types as values | Y.Map |

**Installation:**

```bash
npm install y-utility
```

**Verification:**
- [ ] `y-utility` is installed as a dependency
- [ ] `YKeyValue` wraps a `Y.Array` from the document — not a `Y.Map`
- [ ] High-frequency key updates use `YKeyValue` instead of `Y.Map`
- [ ] Change listeners use `ykv.on('change', fn)` — not `.observe()`
- [ ] `YKeyValue` is not used for nested shared types (use `Y.Map` for those)

**Source:** https://docs.yjs.dev/api/shared-types/y.keyvalue (y-utility package)
