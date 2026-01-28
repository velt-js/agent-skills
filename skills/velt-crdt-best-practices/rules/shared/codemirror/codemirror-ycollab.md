---
title: Wire yCollab Extension with Store's Yjs Objects
impact: CRITICAL
impactDescription: Required for text sync and collaborative cursors
tags: codemirror, yCollab, yjs, awareness
---

## Wire yCollab Extension with Store's Yjs Objects

The `yCollab` extension from `y-codemirror.next` connects CodeMirror to Yjs. You MUST pass the store's YText, Awareness, and UndoManager.

**Incorrect (missing yCollab):**

```js
const startState = EditorState.create({
  extensions: [basicSetup],  // No CRDT - won't sync
});
```

**Incorrect (wrong Yjs objects):**

```js
import * as Y from 'yjs';
const ydoc = new Y.Doc();  // Creating new doc instead of using store's

const startState = EditorState.create({
  extensions: [
    basicSetup,
    yCollab(ydoc.getText(), ...),  // Wrong - won't sync with Velt
  ],
});
```

**Correct (using store's Yjs objects):**

```js
const startState = EditorState.create({
  doc: store.getYText()?.toString() ?? '',
  extensions: [
    basicSetup,
    yCollab(
      store.getYText()!,        // Store's Y.Text
      store.getAwareness(),     // Store's Awareness (for cursors)
      { undoManager: store.getUndoManager() }  // Store's UndoManager
    ),
  ],
});
```

**What each provides:**

| Object | Purpose |
|--------|---------|
| `getYText()` | Shared text content (Y.Text) |
| `getAwareness()` | Cursor positions, user presence |
| `getUndoManager()` | Collaborative undo/redo |

**Verification:**
- [ ] `yCollab` in extensions array
- [ ] Uses store's `getYText()`, not a new Y.Doc
- [ ] Awareness passed for cursor support
- [ ] UndoManager passed for collaborative undo

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (## Notes > **Use yCollab**: Pass the store's Yjs text, awareness, and undo manager)
