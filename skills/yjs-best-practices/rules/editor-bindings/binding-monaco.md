---
title: Integrate Yjs with Monaco Editor Using y-monaco
impact: HIGH
impactDescription: Missing MonacoBinding or incorrect parameter order causes edits to not sync or remote cursors to not render in the Monaco editor
tags: yjs, monaco, y-monaco, code-editor, collaboration, text
---

## Integrate Yjs with Monaco Editor Using y-monaco

The `y-monaco` package binds a `Y.Text` shared type to a Monaco editor instance. Monaco is the editor that powers VS Code, so this binding is ideal for building collaborative code editors. Like CodeMirror, Monaco works with plain text and uses `Y.Text` (not `Y.XmlFragment`).

### Install

```bash
npm install yjs y-monaco y-websocket monaco-editor
```

### Setup

```js
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { MonacoBinding } from 'y-monaco'
import * as monaco from 'monaco-editor'

const ydoc = new Y.Doc()
const provider = new WebsocketProvider('ws://localhost:1234', 'my-room', ydoc)

// Use Y.Text for Monaco (plain text shared type)
const ytext = ydoc.getText('monaco')

const editor = monaco.editor.create(document.querySelector('#editor'), {
  value: '',
  language: 'javascript',
  theme: 'vs-dark',
})

const model = editor.getModel()

// Bind Y.Text to Monaco: (ytext, model, editors, awareness)
const binding = new MonacoBinding(
  ytext,
  model,
  new Set([editor]),
  provider.awareness
)

// Set user info for remote cursor display
provider.awareness.setLocalStateField('user', {
  name: 'Alice',
  color: '#ff0000',
})
```

### React Integration

```jsx
import { useEffect, useRef } from 'react'
import * as monaco from 'monaco-editor'

function CollaborativeMonacoEditor({ ydoc, provider }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const ytext = ydoc.getText('monaco')

    const editor = monaco.editor.create(containerRef.current, {
      value: '',
      language: 'javascript',
      theme: 'vs-dark',
      automaticLayout: true,
    })

    const binding = new MonacoBinding(
      ytext,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    )

    return () => {
      binding.destroy()
      editor.dispose()
    }
  }, [ydoc, provider])

  return <div ref={containerRef} style={{ height: '500px' }} />
}
```

### Remote Cursor Styling

`y-monaco` only adds decoration classes; without CSS, remote carets and selections are invisible. Add base styles, then derive per-user colors and labels from awareness using the client-specific classes:

```css
.yRemoteSelection { background-color: rgba(37, 99, 235, 0.2); }
.yRemoteSelectionHead { border-left: 2px solid #2563eb; min-height: 1.2em; }
```

```js
const style = document.createElement('style')
document.head.appendChild(style)

const renderCursorStyles = () => {
  const rules = []
  provider.awareness.getStates().forEach((state, clientId) => {
    if (clientId === ydoc.clientID || !state?.user) return
    const color = state.user.color || '#2563eb'
    rules.push(`
      .yRemoteSelection-${clientId} { background-color: ${color}33; }
      .yRemoteSelectionHead-${clientId} { border-left: 2px solid ${color}; }
    `)
  })
  style.textContent = rules.join('\n')
}

provider.awareness.on('change', renderCursorStyles)
renderCursorStyles()
// On cleanup: provider.awareness.off('change', renderCursorStyles); style.remove()
```

### Bundling and SSR

- Monaco needs browser APIs: in Next.js load the editor with `next/dynamic` and `ssr: false`, and configure Monaco workers in your bundler.
- Deduplicate `yjs`, `y-protocols`, and `monaco-editor` (for example Vite `resolve.dedupe`). A "Yjs was already imported" warning means two copies are bundled.
- Never control Monaco content from a second source (React `value` / `defaultValue`) once the model is bound to `Y.Text`.

### Cleanup

```js
binding.destroy()
editor.dispose()
provider.destroy()
ydoc.destroy()
```

## Verification Checklist

- [ ] `y-monaco`, `yjs`, and `monaco-editor` are installed
- [ ] `Y.Text` is used (not `Y.XmlFragment`) for Monaco content
- [ ] `MonacoBinding` receives (ytext, model, editors Set, awareness) in correct order
- [ ] Editors parameter is a `Set` of editor instances
- [ ] User info is set on awareness for remote cursor display
- [ ] `.yRemoteSelection` / `.yRemoteSelectionHead` (and per-client) styles are defined so remote carets are visible
- [ ] `yjs`, `y-protocols`, and `monaco-editor` resolve to one copy each
- [ ] Binding and editor are destroyed on cleanup

## Source

- https://docs.yjs.dev/ecosystem/editor-bindings/monaco
- https://docs.velt.dev/realtime-collaboration/crdt/setup/monaco - "Step 7: Style Remote Cursors" and "Step 13: Client-only Rendering" (for Velt-hosted sync, use `@veltdev/monaco-crdt` instead of a hand-built provider; see velt-crdt-best-practices)
