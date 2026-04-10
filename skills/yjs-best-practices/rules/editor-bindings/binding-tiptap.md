---
title: Integrate Yjs with TipTap Using y-prosemirror Collaboration Extensions
impact: CRITICAL
impactDescription: Incorrect TipTap + Yjs integration causes duplicate content, broken undo, or missing cursor sync
tags: yjs, tiptap, y-prosemirror, collaboration, cursor, undo, editor
---

## Integrate Yjs with TipTap Using y-prosemirror Collaboration Extensions

TipTap is built on ProseMirror, so it uses the `y-prosemirror` package for Yjs integration. TipTap provides convenient `Collaboration` and `CollaborationCursor` extensions that wrap the underlying y-prosemirror plugins. You must disable TipTap's built-in history extension when using Yjs, because Yjs provides its own undo manager that understands collaborative edits.

### Install

```bash
npm install yjs y-prosemirror y-websocket @tiptap/extension-collaboration @tiptap/extension-collaboration-cursor
```

### TipTap Setup with Collaboration

```js
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'

const ydoc = new Y.Doc()
const provider = new WebsocketProvider('ws://localhost:1234', 'my-room', ydoc)

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      // Disable built-in history — Yjs handles undo/redo
      history: false,
    }),
    Collaboration.configure({
      document: ydoc,
      // Optionally specify which Y.XmlFragment to use (defaults to 'default')
      field: 'default',
    }),
    CollaborationCursor.configure({
      provider: provider,
      user: {
        name: 'Alice',
        color: '#ff0000',
      },
    }),
  ],
})
```

### Using y-prosemirror Plugins Directly

```js
import { ySyncPlugin, yCursorPlugin, yUndoPlugin } from 'y-prosemirror'
import { undo, redo } from 'y-prosemirror'
import { keymap } from '@tiptap/pm/keymap'

const yXmlFragment = ydoc.getXmlFragment('prosemirror')

const editor = useEditor({
  extensions: [
    StarterKit.configure({ history: false }),
    // Register y-prosemirror plugins as TipTap extensions
    Extension.create({
      addProseMirrorPlugins() {
        return [
          ySyncPlugin(yXmlFragment),
          yCursorPlugin(provider.awareness),
          yUndoPlugin(),
          keymap({
            'Mod-z': undo,
            'Mod-y': redo,
            'Mod-Shift-z': redo,
          }),
        ]
      },
    }),
  ],
})
```

### Render the Editor

```jsx
function CollaborativeEditor() {
  return <EditorContent editor={editor} />
}
```

### Cleanup

```js
// On unmount
editor.destroy()
provider.destroy()
ydoc.destroy()
```

## Verification Checklist

- [ ] `y-prosemirror`, `yjs`, and TipTap collaboration extensions are installed
- [ ] TipTap's built-in `history` is disabled (`history: false` in StarterKit)
- [ ] `Collaboration` extension is configured with the Y.Doc
- [ ] `CollaborationCursor` extension is configured with the provider and user info
- [ ] Provider, editor, and Y.Doc are destroyed on cleanup
- [ ] Undo/redo works correctly across collaborative sessions

## Source

- https://docs.yjs.dev/ecosystem/editor-bindings/tiptap2
