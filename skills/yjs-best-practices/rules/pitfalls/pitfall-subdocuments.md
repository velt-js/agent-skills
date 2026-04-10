---
title: Prefer Y.Map with Multiple Fragments Over Subdocuments
impact: MEDIUM
impactDescription: Subdocuments add complexity and are rarely needed — Y.Map with multiple shared types handles most multi-editor use cases
tags: yjs, subdocuments, subdocs, Y.Map, Y.XmlFragment, lazy-loading, multi-editor
---

## Prefer Y.Map with Multiple Fragments Over Subdocuments

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

**When to use each approach:**

| Scenario | Approach |
|---|---|
| Multiple editor sections in one view | Y.Map + Y.XmlFragment entries |
| Multi-tab editor with shared state | Y.Map + named fragments |
| Very large document with lazy-loaded sections | Subdocuments |
| Independent documents that share nothing | Separate Y.Doc instances (not subdocs) |

**Verification:**
- [ ] Subdocuments are only used when lazy-loading of large document sections is required
- [ ] For multi-editor layouts, Y.Map with multiple Y.XmlFragment entries is used instead
- [ ] If subdocuments are used, `subdocs` event listener is registered on the parent doc
- [ ] Each subdocument has a stable `guid` for consistent identification across peers
- [ ] Subdocument `load()` and `destroy()` are called at appropriate lifecycle points

**Source:** https://docs.yjs.dev/api/subdocuments
