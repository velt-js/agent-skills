---
title: Integrate Yjs with CodeMirror 6 Using y-codemirror.next
impact: HIGH
impactDescription: Using the wrong shared type (XmlFragment instead of Text) or missing the undoManager causes broken sync or broken undo in CodeMirror
tags: yjs, codemirror, y-codemirror.next, code-editor, collaboration, text
---

## Integrate Yjs with CodeMirror 6 Using y-codemirror.next

The `y-codemirror.next` package provides a CodeMirror 6 extension that binds a `Y.Text` shared type to the editor. Unlike ProseMirror-based editors that use `Y.XmlFragment`, CodeMirror works with plain text and uses `Y.Text`. The extension handles sync, remote cursors, and undo in a single `yCollab` call.

### Install

```bash
npm install yjs y-codemirror.next y-websocket @codemirror/state @codemirror/view
```

### Setup

```js
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { yCollab } from 'y-codemirror.next'
import { EditorState } from '@codemirror/state'
import { EditorView, basicSetup } from 'codemirror'

const ydoc = new Y.Doc()
const provider = new WebsocketProvider('ws://localhost:1234', 'my-room', ydoc)

// Use Y.Text for code editors (not Y.XmlFragment)
const ytext = ydoc.getText('codemirror')

// Create an UndoManager scoped to the Y.Text
const undoManager = new Y.UndoManager(ytext)

// Set user info for remote cursors
provider.awareness.setLocalStateField('user', {
  name: 'Alice',
  color: '#ff0000',
  colorLight: '#ff000033',
})

const state = EditorState.create({
  doc: ytext.toString(),
  extensions: [
    basicSetup,
    yCollab(ytext, provider.awareness, { undoManager }),
  ],
})

const view = new EditorView({
  state,
  parent: document.querySelector('#editor'),
})
```

### Without Awareness (No Cursors)

```js
// If you don't need remote cursors, pass null for awareness
const state = EditorState.create({
  doc: ytext.toString(),
  extensions: [
    basicSetup,
    yCollab(ytext, null, { undoManager }),
  ],
})
```

### Cleanup

```js
view.destroy()
provider.destroy()
ydoc.destroy()
```

## Verification Checklist

- [ ] `y-codemirror.next` and `yjs` are installed
- [ ] `Y.Text` is used (not `Y.XmlFragment`) for CodeMirror content
- [ ] `yCollab` extension is added with ytext, awareness, and undoManager
- [ ] `Y.UndoManager` is created and scoped to the same Y.Text instance
- [ ] User info is set on awareness with `name`, `color`, and `colorLight`
- [ ] Editor view and providers are destroyed on cleanup

## Source

- https://docs.yjs.dev/ecosystem/editor-bindings/codemirror.next
