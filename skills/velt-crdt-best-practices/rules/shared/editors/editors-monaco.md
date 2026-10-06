---
title: Bind Monaco Once, Keep It Uncontrolled, and Style y-monaco Cursors
impact: HIGH
impactDescription: Controlled value props or a second bindEditor() call desync the shared Y.Text; missing cursor CSS leaves remote carets invisible
tags: crdt, monaco, monaco-crdt, MonacoCrdtEditor, useCollaboration, createCollaboration, bindEditor, y-monaco, yRemoteSelection, ssr, dedupe
---

## Bind Monaco Once, Keep It Uncontrolled, and Style y-monaco Cursors

`@veltdev/monaco-crdt` binds a Monaco model to a shared `Y.Text` through `y-monaco`. The CRDT-backed model owns content, so never pass `value` / `defaultValue` to the React wrapper or seed a direct editor with local text; use `initialContent` instead. Choose exactly one binding path: pass `editor` to `createCollaboration()` (auto-bind) or omit it and call `bindEditor(editor)` once later.

**Incorrect (controlled value and double binding):**

```tsx
// React: value makes Monaco a second content source
<MonacoCrdtEditor editorId="file-1" value={code} onChange={setCode} />;

// Other Frameworks: auto-bound via `editor`, then bound again
const manager = await createCollaboration({ editorId: 'file-1', veltClient: client, editor });
await manager.bindEditor(editor);
```

**Correct (React / Next.js: drop-in component):**

```tsx
import { MonacoCrdtEditor } from '@veltdev/monaco-crdt-react';

export function CollaborativeEditor() {
  return (
    <MonacoCrdtEditor
      editorId="file-1"
      language="typescript"
      height="500px"
      initialContent={'export const greeting = "Hello";\n'}
      cursorData={{ name: 'Ada', color: '#2563eb' }}
      onError={(error) => console.error('Collaboration error:', error)}
    />
  );
}
```

With `useCollaboration()`, render `@monaco-editor/react`'s `Editor` and pass `onMount={(editor) => editorRef(editor)}`.

**Correct (Other Frameworks: auto-bind, then manager-first teardown):**

```ts
import * as monaco from 'monaco-editor';
import { createCollaboration } from '@veltdev/monaco-crdt';

const editor = monaco.editor.create(document.getElementById('editor'), { value: '', language: 'typescript' });

const manager = await createCollaboration({
  editorId: 'file-1',
  veltClient: client,
  editor,                                  // auto-binds; do not call bindEditor() too
  initialContent: '// Start writing here\n',
  cursorData: { name: 'Ada', color: '#2563eb' },
});

// Collaboration-aware history
manager.getUndoManager()?.undo();

// Teardown
manager.destroy();
editor.dispose();
```

**Remote cursor CSS (required for visible carets):**

```css
.yRemoteSelection { background-color: rgba(37, 99, 235, 0.2); }
.yRemoteSelectionHead { border-left: 2px solid #2563eb; min-height: 1.2em; }
```

For per-user colors and name labels, read `manager.getAwareness().getStates()` on `change` and inject `.yRemoteSelection-${clientId}` / `.yRemoteSelectionHead-${clientId}` rules, skipping `manager.getDoc().clientID`. Remove the style element and the `change` listener before destroying the manager.

### Monaco-specific notes

- Monaco needs browser APIs: in Next.js load the editor with `dynamic(() => import('./CollaborativeMonaco'), { ssr: false })` and configure Monaco workers in your bundler.
- Deduplicate `yjs`, `y-protocols`, and `monaco-editor` (for example Vite `resolve.dedupe`). A "Yjs was already imported" warning means two copies are bundled.
- The manager creates a `text` store with content key `content`; the Monaco `language` does not change the shared format.
- `bindEditor(editor, { model, editors, awareness, destroyExisting })` is for shared models across several editor surfaces.

**Verification Checklist:**
- [ ] No `value` / `defaultValue` on the wrapper; direct editors start with `value: ''`
- [ ] Exactly one binding path per manager
- [ ] `.yRemoteSelection` / `.yRemoteSelectionHead` styles present
- [ ] Client-only rendering in SSR frameworks and workers configured
- [ ] `manager.destroy()` runs before `editor.dispose()`

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/monaco - "Step 3: Initialize Collaborative Editor"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/monaco - "Step 7: Style Remote Cursors"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/monaco - "Step 13: Client-only Rendering" and "Notes"
