---
title: Use Y.XmlFragment, Y.XmlElement, and Y.XmlText for Tree-Structured Document Models
impact: MEDIUM
impactDescription: XML types power ProseMirror and TipTap bindings — correct usage is essential for rich text editor integration
tags: Y.XmlFragment, Y.XmlElement, Y.XmlText, ProseMirror, TipTap, tree, DOM, rich-text, editor
---

## Use Y.XmlFragment, Y.XmlElement, and Y.XmlText for Tree-Structured Document Models

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

**Key API summary:**

| Type | Key methods |
|---|---|
| Y.XmlFragment | `insert`, `delete`, `get`, `length`, `toArray`, `toString`, `observe`, `observeDeep` |
| Y.XmlElement | All XmlFragment methods + `setAttribute`, `getAttribute`, `getAttributes`, `removeAttribute`, `nodeName` |
| Y.XmlText | All Y.Text methods (`insert`, `delete`, `format`, `toDelta`, `toString`) |

**Verification:**
- [ ] `ydoc.getXmlFragment(name)` is used for the top-level document container
- [ ] `Y.XmlElement` nodes have meaningful `nodeName` values matching the editor schema
- [ ] Attributes are set via `setAttribute` — not by nesting a Y.Map
- [ ] `Y.XmlText` is used for text leaf nodes, with formatting via attributes
- [ ] `observeDeep` is used when monitoring changes across the full document tree

**Source:** https://docs.yjs.dev/api/shared-types/y.xmlfragment
