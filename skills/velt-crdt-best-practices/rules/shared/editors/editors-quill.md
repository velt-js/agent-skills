---
title: Register quill-cursors Before new Quill() and Use the Manager's Yjs Undo
impact: HIGH
impactDescription: Registering cursors after construction hides remote cursors; a standalone Quill history stack or a second QuillBinding diverges from the shared Delta
tags: crdt, quill, quill-crdt, QuillCrdtEditor, useCollaboration, createCollaboration, quill-cursors, y-quill, undo, delta
---

## Register quill-cursors Before new Quill() and Use the Manager's Yjs Undo

`@veltdev/quill-crdt` connects Quill 2 to one shared `Y.Text` (Delta operations). The base manager owns the only `y-quill` binding, provider, awareness, and Yjs `UndoManager`; `quill-cursors` renders remote cursors. Register `quill-cursors` before any custom `new Quill()` call, keep Quill history local-only (`userOnly: true`), and expose the manager's `undo()` / `redo()` as the user-facing history controls.

**Incorrect (late cursor registration, own binding, Quill history in the toolbar):**

```ts
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import { QuillBinding } from 'y-quill';

const quill = new Quill('#quill-editor', { theme: 'snow', modules: { cursors: true } });
Quill.register('modules/cursors', QuillCursors); // too late: remote cursors never render

new QuillBinding(ytext, quill, awareness);        // second binding next to the Velt manager
undoButton.onclick = () => quill.history.undo();  // local stack, not collaborative history
```

**Correct (Other Frameworks):**

```ts
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import 'quill/dist/quill.snow.css';
import { createCollaboration } from '@veltdev/quill-crdt';

Quill.register('modules/cursors', QuillCursors); // before new Quill()

const host = document.querySelector('#quill-editor');
const editor = new Quill(host, {
  theme: 'snow',
  modules: {
    cursors: { transformOnTextChange: true },
    history: { userOnly: true },
    toolbar: [['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }]],
  },
});

const manager = await createCollaboration({
  editorId: 'shared-quill-doc',
  veltClient: client,
  editor,                                   // creates the y-quill binding; no attachEditor() too
  initialContent: { ops: [{ insert: 'Collaborative Quill document\n' }] },
  cursorData: { name: 'Ada', color: '#0f766e' },
});

undoButton.onclick = () => manager.undo();
redoButton.onclick = () => manager.redo();

// Teardown
manager.destroy();
host.replaceChildren();
```

**Correct (React / Next.js: drop-in component registers cursors for you):**

```tsx
'use client';
import { QuillCrdtEditor } from '@veltdev/quill-crdt-react';
import 'quill/dist/quill.snow.css';

export function CollaborativeEditor() {
  return (
    <QuillCrdtEditor
      documentId="shared-quill-doc"
      theme="snow"
      modules={{ cursors: { transformOnTextChange: true }, history: { userOnly: true } }}
      cursorData={{ name: 'Ada', color: '#0f766e' }}
      onError={(error) => console.error('Quill collaboration:', error)}
    />
  );
}
```

With `useCollaboration()`, register `quill-cursors` yourself, create Quill in a client-only effect, pass it to `collaboration.editorRef(editor)`, and in cleanup call `collaboration.destroy()` before `collaboration.editorRef(null)` and clearing the host.

### Quill-specific notes

- `initialContent` accepts plain text or a Quill Delta and applies only to a new document; `forceReset()` / `forceResetInitialContent` replace content for everyone and clear collaborative undo history.
- `highlightRange()` writes a persistent Delta background; awareness selections are transient.
- Do not hide `.ql-cursor` or `.ql-cursor-selection` in application CSS.
- Include every used format in Quill's `formats` allowlist or the formatting is dropped.
- Run `npm ls yjs` and deduplicate `yjs`, `@veltdev/crdt`, and `y-quill`.

**Verification Checklist:**
- [ ] `Quill.register('modules/cursors', QuillCursors)` runs before every custom `new Quill()`
- [ ] No application-created `QuillBinding`, Y.Doc, or provider
- [ ] Undo/redo controls call `manager.undo()` / `manager.redo()` (or the hook helpers)
- [ ] SSR routes mark the editor as a client component
- [ ] `manager.destroy()` runs before removing Quill's DOM

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/quill - "Step 2: Load Styles and Register Cursors"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/quill - "Step 5: Initialize Collaboration"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/quill - "Step 10: Configure Collaborative Undo and Redo" and "Notes"
