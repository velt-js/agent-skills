---
title: Give Ace a Real Range Factory and Use Collaborative Undo
impact: HIGH
impactDescription: Without an Ace Range factory remote markers do not render; mixing Ace local history with Yjs undo diverges from the shared text
tags: crdt, ace, ace-crdt, AceCrdtEditor, useCollaboration, createCollaboration, rangeFactory, attachEditor, undo, markers
---

## Give Ace a Real Range Factory and Use Collaborative Undo

`@veltdev/ace-crdt` stores Ace content in one shared `Y.Text`. Remote cursors, selections, and highlights render as Ace markers, which need a real Ace `Range`, so pass a `rangeFactory` built from `ace.require('ace/range').Range` (the documented factory widens a collapsed cursor by one column so the caret stays visible). The shared text is the source of truth: do not pass `value` / `defaultValue`, and drive undo/redo through the manager's Yjs `UndoManager`.

**Incorrect (controlled value, no range factory, double binding):**

```tsx
<AceCrdtEditor documentId="shared-code-file" value={code} />;

const manager = await createCollaboration({ editorId: 'shared-code-file', veltClient: client, editor });
manager.attachEditor(editor); // already attached by `editor` above
editor.undo();                // Ace local history, not the shared history
```

**Correct (React / Next.js):**

```tsx
import ace from 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-typescript';
import 'ace-builds/src-noconflict/theme-textmate';
import { AceCrdtEditor } from '@veltdev/ace-crdt-react';

const Range = ace.require('ace/range').Range;
const rangeFactory = (start, end) => {
  const visibleEnd = start.row === end.row && start.column === end.column
    ? { row: end.row, column: end.column + 1 }
    : end;
  return new Range(start.row, start.column, visibleEnd.row, visibleEnd.column);
};

export function CollaborativeEditor() {
  return (
    <div className="ace-host">
      <AceCrdtEditor
        documentId="shared-code-file"
        mode="typescript"
        theme="textmate"
        initialContent={'export const greeting = "Hello";\n'}
        cursorData={{ name: 'Ada', color: '#0f766e', colorLight: '#0f766e33' }}
        rangeFactory={rangeFactory}
        onError={(error) => console.error('Ace collaboration:', error)}
      />
    </div>
  );
}
```

**Correct (Other Frameworks):**

```ts
import { createCollaboration } from '@veltdev/ace-crdt';

const manager = await createCollaboration({
  editorId: 'shared-code-file',
  veltClient: client,
  editor,                 // created with ace.edit(host) before this call
  initialContent: '// Start writing here\n',
  cursorData: { name: 'Ada', color: '#0f766e' },
  rangeFactory,
});

const undoManager = manager.getUndoManager();
undoManager?.undo();
manager.flushEditorToStore('undo');

// Teardown: manager, then Ace, then its DOM
manager.destroy();
editor.destroy();
editor.container.remove();
```

### Ace-specific notes

- Import each `ace-builds/src-noconflict` mode and theme before selecting it, and give the host stable dimensions.
- Do not override the injected marker borders with `border: none`; add only shape rules such as `.ace_marker-layer [class*="velt-ace-remote-marker"] { border-radius: 2px; }`.
- In React, `collaboration.undo()` / `collaboration.redo()` are the collaborative history controls. When Ace is created later, call `collaboration.editorRef(editor)` and `collaboration.editorRef(null)` before replacing it.
- Attach-later (`initializeWithoutEditor: true` + `attachEditor(editor, { rangeFactory })`) replaces passing `editor`; never use both.
- Keep one copy of `@veltdev/crdt`, `yjs`, and `y-protocols` in the bundle.

**Verification Checklist:**
- [ ] `rangeFactory` uses Ace's `Range` constructor
- [ ] No `value` / `defaultValue` on `AceCrdtEditor`
- [ ] One binding path per manager
- [ ] Undo/redo goes through the manager or hook helpers, not Ace's local history
- [ ] Teardown order: `manager.destroy()`, `editor.destroy()`, `editor.container.remove()`

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/ace - "Step 4: Initialize Collaboration"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/ace - "Step 9: Configure Collaborative Undo and Redo"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/ace - "Step 14: Clean Up" and "Notes"
