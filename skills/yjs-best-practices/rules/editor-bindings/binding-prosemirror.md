---
title: Integrate Yjs with ProseMirror Using y-prosemirror Plugins
impact: HIGH
impactDescription: Incorrect plugin order or missing undo plugin causes broken sync, lost cursor positions, or undo that reverts other users' changes
tags: yjs, prosemirror, y-prosemirror, sync, cursor, undo, plugin
---

## Integrate Yjs with ProseMirror Using y-prosemirror Plugins

The `y-prosemirror` package provides three ProseMirror plugins that enable collaborative editing. Plugin order matters: sync must come before cursor, and cursor before undo. The sync plugin binds a `Y.XmlFragment` to the ProseMirror document, the cursor plugin renders remote cursors via the awareness protocol, and the undo plugin replaces ProseMirror's default undo with a Yjs-aware version.

### Install

```bash
npm install yjs y-prosemirror y-websocket prosemirror-state prosemirror-view prosemirror-keymap
```

### Setup

```js
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { ySyncPlugin, yCursorPlugin, yUndoPlugin, undo, redo } from 'y-prosemirror'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { schema } from 'prosemirror-schema-basic'
import { keymap } from 'prosemirror-keymap'

const ydoc = new Y.Doc()
const provider = new WebsocketProvider('ws://localhost:1234', 'my-room', ydoc)

// Use Y.XmlFragment for rich-text editors (ProseMirror, TipTap)
const yXmlFragment = ydoc.getXmlFragment('prosemirror')

const state = EditorState.create({
  schema,
  plugins: [
    // Order matters: sync -> cursor -> undo
    ySyncPlugin(yXmlFragment),
    yCursorPlugin(provider.awareness),
    yUndoPlugin(),
    keymap({
      'Mod-z': undo,
      'Mod-y': redo,
      'Mod-Shift-z': redo,
    }),
  ],
})

const view = new EditorView(document.querySelector('#editor'), { state })
```

### Set User Presence for Cursor Display

```js
// The cursor plugin reads 'user' from awareness to render remote cursors
provider.awareness.setLocalStateField('user', {
  name: 'Alice',
  color: '#ff0000',
  // Optional: colorLight is used for selection highlight
  colorLight: '#ff000033',
})
```

### Cursor Styling

```css
/* Remote cursor line */
.yRemoteSelection {
  background-color: var(--user-color-light, rgba(0, 0, 0, 0.1));
}

/* Remote cursor caret */
.yRemoteSelectionHead::after {
  border-color: var(--user-color, #000);
}
```

### Cleanup

```js
view.destroy()
provider.destroy()
ydoc.destroy()
```

## Verification Checklist

- [ ] `y-prosemirror` and `yjs` are installed
- [ ] Plugin order is correct: `ySyncPlugin` before `yCursorPlugin` before `yUndoPlugin`
- [ ] ProseMirror's default history plugin is NOT included (replaced by `yUndoPlugin`)
- [ ] `Y.XmlFragment` is used (not `Y.Text`) for ProseMirror content
- [ ] Awareness user is set with `name` and `color` for cursor rendering
- [ ] Undo/redo keybindings use `undo`/`redo` from y-prosemirror

## Source

- https://docs.yjs.dev/ecosystem/editor-bindings/prosemirror
