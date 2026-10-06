---
title: Attach the ProseMirror View Before initialize() and Use Velt's Yjs undo/redo
impact: HIGH
impactDescription: Initializing before the view is attached drops remote hydration; prosemirror-history or y-prosemirror commands break collaborative undo
tags: crdt, prosemirror, prosemirror-crdt, autoInitialize, createCollaborationPlugins, attachEditorView, initialize, undo, redo, schema, y-prosemirror
---

## Attach the ProseMirror View Before initialize() and Use Velt's Yjs undo/redo

`@veltdev/prosemirror-crdt` installs Yjs sync, cursor, and undo plugins into a ProseMirror `EditorState`. In direct (Other Frameworks) setups, create the manager with `autoInitialize: false`, build the plugin set, create the state and view, attach the view, and only then call `initialize()`. Otherwise remote updates can arrive before the `EditorView` can receive them.

**Incorrect (auto-initialize, local history, y-prosemirror commands, plugins twice):**

```ts
import { history, undo as pmUndo } from 'prosemirror-history';
import { undo } from 'y-prosemirror';
import { createCollaboration } from '@veltdev/prosemirror-crdt';

const manager = await createCollaboration({ editorId: 'doc', veltClient: client, schema });
// Store already hydrated before any view exists

const pluginsA = manager.createCollaborationPlugins();
const pluginsB = manager.createCollaborationPlugins(); // second plugin set for the same state
const state = EditorState.create({ schema, plugins: [...pluginsA.plugins, history()] });
```

**Correct (Other Frameworks: deferred lifecycle):**

```ts
import { createCollaboration, undo, redo } from '@veltdev/prosemirror-crdt';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';

const manager = await createCollaboration({
  editorId: 'my-prosemirror-doc',
  veltClient: client,
  schema,                       // one schema, created once, compatible across clients
  initialContent: 'Start writing here...',
  autoInitialize: false,        // required for direct setup
});

const collaboration = manager.createCollaborationPlugins({
  plugins: [keymap({ 'Mod-z': undo, 'Mod-y': redo, 'Mod-Shift-z': redo }), keymap(baseKeymap)],
});
const state = EditorState.create({ schema, plugins: collaboration.plugins });
const view = new EditorView(mountElement, { state });

manager.attachEditorView(view);
await manager.initialize(); // last

// Teardown: view first, then the manager
view.destroy();
manager.destroy();
```

**Correct (React / Next.js: drop-in component with module-scope schema):**

```tsx
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import {
  ProseMirrorCrdtEditor,
  createDefaultProseMirrorSchema,
  undo,
  redo,
} from '@veltdev/prosemirror-crdt-react';

const schema = createDefaultProseMirrorSchema(); // never rebuilt per render
const plugins = [keymap({ 'Mod-z': undo, 'Mod-y': redo, 'Mod-Shift-z': redo }), keymap(baseKeymap)];

export function CollaborativeEditor() {
  return (
    <ProseMirrorCrdtEditor
      editorId="my-prosemirror-doc"
      schema={schema}
      plugins={plugins}
      initialContent="Start writing here..."
      cursorData={{ name: 'Ada', color: '#2563eb' }}
      onError={(error) => console.error('Collaboration error:', error)}
    />
  );
}
```

The `useCollaboration()` hook returns `mountRef` and `editorView`; pass `editorView` plus `destroyViewOnUnmount: false` to attach an application-owned view (built with `manager.createCollaborationPlugins()` or `manager.createEditorState()`).

### ProseMirror-specific notes

- Import `undo` / `redo` from the Velt package you use, not from `y-prosemirror`, and never add `prosemirror-history`.
- Schema node and mark names are part of the shared document contract; deploy schema changes as migrations. Invalid JSON in `initialContent` is rejected by the schema.
- `initialContent` accepts plain text or ProseMirror JSON. The shared fragment is stored under the `prosemirror` key.
- Style `.ProseMirror-yjs-cursor` / `.velt-prosemirror-cursor` and their `-label` / selection classes, or pass `disableCursors` to sync without the cursor plugin.
- Deduplicate `yjs`, `y-prosemirror`, and the `prosemirror-*` packages in the bundle.

**Verification Checklist:**
- [ ] Direct setup uses `autoInitialize: false` and calls `initialize()` after `attachEditorView(view)`
- [ ] `createCollaborationPlugins()` is called once per state
- [ ] `undo` / `redo` come from `@veltdev/prosemirror-crdt(-react)`; no `prosemirror-history`
- [ ] Schema created once and compatible across all clients
- [ ] Teardown destroys the `EditorView`, then the manager

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/prosemirror - "Step 4: Initialize Collaborative Editor"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/prosemirror - "Step 5: Add Plugins, Keymaps, and CRDT Undo"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/prosemirror - "Step 3: Create a Schema" and "Notes"
