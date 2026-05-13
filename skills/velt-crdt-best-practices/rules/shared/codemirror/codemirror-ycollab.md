---
title: Wire yCollab Extension with the v2 CollaborationPrimitives
impact: CRITICAL
impactDescription: Required for text sync and collaborative cursors
tags: codemirror, yCollab, yjs, awareness, primitives, useCollaboration, createCollaboration
---

## Wire yCollab Extension with the v2 CollaborationPrimitives

The `yCollab` extension from `y-codemirror.next` connects CodeMirror to Yjs. You MUST pass the Y.Text, Awareness, and UndoManager produced by the Velt CRDT v2 manager — never a separately constructed `Y.Doc`.

In React, `useCollaboration` returns these as `primitives` (`primitives.ytext`, `primitives.awareness`, `primitives.undoManager`). In non-React, call `manager.getCollaborationPrimitives()` to get the same shape.

**Incorrect (missing yCollab):**

```js
const startState = EditorState.create({
  extensions: [basicSetup],  // No CRDT - won't sync
});
```

**Incorrect (constructing a fresh Y.Doc):**

```js
import * as Y from 'yjs';
const ydoc = new Y.Doc();  // Bypasses the manager's sync provider

const startState = EditorState.create({
  extensions: [
    basicSetup,
    yCollab(ydoc.getText(), null, {}),  // Won't sync with Velt
  ],
});
```

**Correct (React — wire `primitives` from `useCollaboration`):**

```tsx
import { useCollaboration } from '@veltdev/codemirror-crdt-react';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { yCollab } from 'y-codemirror.next';

const { primitives } = useCollaboration({ editorId: 'my-codemirror-editor' });

if (primitives?.ytext) {
  const startState = EditorState.create({
    doc: primitives.ytext.toString(),
    extensions: [
      basicSetup,
      yCollab(
        primitives.ytext,        // Y.Text from the manager
        primitives.awareness,    // Awareness (for cursors)
        { undoManager: primitives.undoManager } // collaborative undo
      ),
    ],
  });
}
```

**Correct (non-React — wire primitives from `manager.getCollaborationPrimitives()`):**

```js
import { createCollaboration } from '@veltdev/codemirror-crdt';

const manager = await createCollaboration({
  editorId: 'my-codemirror-editor',
  veltClient: client,
});

const { ytext, awareness, undoManager } = manager.getCollaborationPrimitives();

const startState = EditorState.create({
  doc: ytext.toString(),
  extensions: [
    basicSetup,
    yCollab(ytext, awareness, { undoManager }),
  ],
});
```

**What each primitive provides:**

| Primitive | Source | Purpose |
|---|---|---|
| `ytext` | `primitives.ytext` / `manager.getYText()` | Shared text content (`Y.Text`) bound to the document |
| `awareness` | `primitives.awareness` / `manager.getAwareness()` | Cursor positions, user presence |
| `undoManager` | `primitives.undoManager` / `manager.getUndoManager()` | Collaborative undo/redo (local-only edits) |
| `doc` | `primitives.doc` / `manager.getDoc()` | Underlying `Y.Doc` (advanced) |

**Verification:**
- [ ] `yCollab` in extensions array
- [ ] Uses `primitives.ytext` / `manager.getYText()` — not a freshly constructed `Y.Doc`
- [ ] Awareness passed for cursor support
- [ ] UndoManager passed for collaborative undo

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (### Step 3; ### CollaborationPrimitives)
