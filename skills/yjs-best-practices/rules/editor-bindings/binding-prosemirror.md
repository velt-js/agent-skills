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

`yCursorPlugin` renders remote carets as `.ProseMirror-yjs-cursor` elements (with the user's name in a child label) and remote selections as `.ProseMirror-yjs-selection` decorations. The `.yRemoteSelection*` classes belong to y-monaco and y-codemirror, not y-prosemirror.

```css
/* Remote caret rendered by yCursorPlugin */
.ProseMirror-yjs-cursor {
  position: relative;
  margin-left: -1px;
  margin-right: -1px;
  border-left: 2px solid;
  pointer-events: none;
  word-break: normal;
}

/* Name label inside the caret */
.ProseMirror-yjs-cursor > div {
  position: absolute;
  top: -1.4em;
  left: -1px;
  padding: 0.1rem 0.35rem;
  font-size: 0.65rem;
  color: #fff;
  white-space: nowrap;
  user-select: none;
}

/* Remote selection highlight */
.ProseMirror-yjs-selection {
  background-color: rgba(124, 58, 237, 0.2);
}
```

### Schema Compatibility

All clients must use a compatible ProseMirror schema. Node and mark names are part of the shared document contract: a client that does not know a node or mark type cannot render it. Create the schema once (not per render) and roll out schema changes as explicit migrations while older clients may still be connected.

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
- [ ] Cursor CSS targets `.ProseMirror-yjs-cursor` and `.ProseMirror-yjs-selection`
- [ ] Every client uses the same schema; `yjs`, `y-prosemirror`, and `prosemirror-*` packages resolve to one copy each

## Source

- https://docs.yjs.dev/ecosystem/editor-bindings/prosemirror
- https://docs.velt.dev/realtime-collaboration/crdt/setup/prosemirror - "Step 3: Create a Schema" and "Step 7: Style Remote Cursors" (for Velt-hosted sync, use `@veltdev/prosemirror-crdt`, which re-exports Yjs-aware `undo`/`redo`; see velt-crdt-best-practices)
