---
title: Integrate Yjs with Quill Using y-quill
impact: HIGH
impactDescription: Missing QuillBinding or incorrect cursor setup causes edits to not sync or remote cursors to not display
tags: yjs, quill, y-quill, quill-cursors, collaboration, text, delta
---

## Integrate Yjs with Quill Using y-quill

The `y-quill` package binds a `Y.Text` shared type to a Quill editor instance. Quill's Delta format and Yjs's `Y.Text` are naturally compatible — both represent rich text as a sequence of insert operations with attributes. The `quill-cursors` module is required to display remote cursors.

### Install

```bash
npm install yjs y-quill y-websocket quill quill-cursors
```

### Setup

```js
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { QuillBinding } from 'y-quill'
import Quill from 'quill'
import QuillCursors from 'quill-cursors'

// Register the cursors module with Quill
Quill.register('modules/cursors', QuillCursors)

const ydoc = new Y.Doc()
const provider = new WebsocketProvider('ws://localhost:1234', 'my-room', ydoc)

// Use Y.Text for Quill (same as CodeMirror, not XmlFragment)
const ytext = ydoc.getText('quill')

const quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    cursors: true,    // Enable the cursors module
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'header': [1, 2, 3, false] }],
      ['link', 'image'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ],
    // Do NOT include Quill's built-in history module — Yjs handles undo
    history: {
      userOnly: true, // Only undo local changes, not remote
    },
  },
})

// Bind Y.Text to Quill with awareness for cursors
const binding = new QuillBinding(ytext, quill, provider.awareness)

// Set user info for remote cursor display
provider.awareness.setLocalStateField('user', {
  name: 'Alice',
  color: '#ff0000',
})
```

### React Integration

```jsx
import { useEffect, useRef } from 'react'

function CollaborativeQuillEditor() {
  const editorRef = useRef(null)
  const bindingRef = useRef(null)

  useEffect(() => {
    const ydoc = new Y.Doc()
    const provider = new WebsocketProvider('ws://localhost:1234', 'my-room', ydoc)
    const ytext = ydoc.getText('quill')

    const quill = new Quill(editorRef.current, {
      theme: 'snow',
      modules: { cursors: true },
    })

    bindingRef.current = new QuillBinding(ytext, quill, provider.awareness)

    provider.awareness.setLocalStateField('user', {
      name: 'Alice',
      color: '#ff0000',
    })

    return () => {
      bindingRef.current.destroy()
      provider.destroy()
      ydoc.destroy()
    }
  }, [])

  return <div ref={editorRef} />
}
```

## Verification Checklist

- [ ] `y-quill`, `quill`, and `quill-cursors` are installed
- [ ] `QuillCursors` module is registered with `Quill.register()`
- [ ] `cursors: true` is set in Quill's modules config
- [ ] `QuillBinding` is created with Y.Text, Quill instance, and awareness
- [ ] `Y.Text` is used (not `Y.XmlFragment`) for Quill content
- [ ] Binding, provider, and Y.Doc are destroyed on cleanup

## Source

- https://docs.yjs.dev/ecosystem/editor-bindings/quill
