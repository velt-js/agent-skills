---
title: Use Y.Text for Collaborative Plain and Rich Text Editing
impact: HIGH
impactDescription: Y.Text provides CRDT-based text with rich text formatting compatible with Quill Delta format
tags: Y.Text, text, rich-text, insert, delete, format, delta, Quill, observe, toString, toDelta
---

## Use Y.Text for Collaborative Plain and Rich Text Editing

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

**Verification:**
- [ ] `Y.Text` is retrieved from `ydoc.getText(name)` — not instantiated directly
- [ ] Rich text formatting uses `format()` or insert attributes — not manual markup
- [ ] `toDelta()` is used for serialization with Quill-compatible editors
- [ ] `toString()` is used for plain text extraction (strips formatting)
- [ ] Observers are cleaned up with `ytext.unobserve(fn)` when no longer needed

**Source:** https://docs.yjs.dev/api/shared-types/y.text
