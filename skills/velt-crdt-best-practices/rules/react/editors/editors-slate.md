---
title: Create the Slate Editor Once and Let the Manager Apply the Slate-Yjs Plugins
impact: HIGH
impactDescription: Recreating the editor every render tears down collaboration; wrapping withYjs yourself or passing HTML initial content breaks sync and hydration
tags: crdt, slate, slate-crdt, slate-yjs, useCollaboration, createCollaboration, withYjs, withYHistory, withCursors, useDecorateRemoteCursors, Descendant
---

## Create the Slate Editor Once and Let the Manager Apply the Slate-Yjs Plugins

`@veltdev/slate-crdt` (one package with both `useCollaboration()` and `createCollaboration()`) enhances a consumer-owned Slate editor. The manager applies `withYjs`, `withYHistory`, and (unless `enableCursors: false`) `withCursors` before remote data hydrates, backed by a shared `Y.XmlText`. Create the editor once with `useMemo()`, pass Slate `Descendant[]` nodes as `initialContent`, and publish selection changes so remote cursors render.

**Incorrect (editor recreated each render, manual plugins, HTML seed):**

```tsx
import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import { withYjs } from '@slate-yjs/core';
import { useCollaboration } from '@veltdev/slate-crdt';

function Editor() {
  const editor = withYjs(withReact(createEditor()), sharedType); // new editor every render, manual binding
  useCollaboration({
    editorId: 'my-slate-editor',
    editor,
    initialContent: '<p>Hello</p>', // Slate expects Descendant[] nodes, not HTML
  });
}
```

**Correct (React hook):**

```tsx
import { useMemo } from 'react';
import { createEditor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import { useDecorateRemoteCursors } from '@slate-yjs/react';
import { useCollaboration } from '@veltdev/slate-crdt';

const INITIAL_CONTENT = [{ type: 'paragraph', children: [{ text: 'Start writing...' }] }];

function CursorEditable({ readOnly }: { readOnly: boolean }) {
  const decorate = useDecorateRemoteCursors({ carets: true });
  return <Editable readOnly={readOnly} decorate={decorate} placeholder="Start typing..." />;
}

export function CollaborativeEditor() {
  const rawEditor = useMemo(() => withReact(createEditor()), []);

  const { manager, isLoading, isSynced, status, error } = useCollaboration({
    editorId: 'my-slate-editor',
    editor: rawEditor,
    initialContent: INITIAL_CONTENT,
    cursorData: { name: 'Ada', color: '#2563eb', colorLight: 'rgba(37, 99, 235, 0.2)' },
    onError: (err) => console.error('Collaboration error:', err),
  });

  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <div>Status: {status} | Synced: {isSynced ? 'Yes' : 'No'}</div>
      <Slate
        editor={rawEditor}
        initialValue={INITIAL_CONTENT}
        onChange={() => manager?.sendCursorPosition(rawEditor.selection)}
      >
        <CursorEditable readOnly={isLoading} />
      </Slate>
    </>
  );
}
```

**Correct (imperative API, lifecycle managed by your code):**

```tsx
import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import { createCollaboration } from '@veltdev/slate-crdt';

const editor = withReact(createEditor());
const manager = await createCollaboration({
  editorId: 'my-slate-editor',
  editor,
  veltClient: client, // initialized, user identified, document set
  initialContent: [{ type: 'paragraph', children: [{ text: 'Start writing...' }] }],
});

const enhancedEditor = manager.getEditor(); // editor with YjsEditor, YHistoryEditor, CursorEditor applied

// Cleanup
manager.destroy();
```

### Slate-specific notes

- `manager.updateCursorData()`, `manager.sendCursorPosition(selection)`, and `manager.getCursorStates()` manage awareness-backed cursors.
- Option passthroughs: `yjsOptions` (to `withYjs`), `undoManagerOptions` (to `withYHistory`), `cursorOptions` (to `withCursors`); `autoConnect: false` leaves the Yjs editor disconnected after initialization.
- The hook destroys the manager on unmount or when `editorId`, editor, or Velt client change, and returns `destroy()` for early teardown.
- `forceResetInitialContent: true` clears shared Slate content for every user; reserve it for deliberate resets.

**Verification Checklist:**
- [ ] `withReact(createEditor())` wrapped in `useMemo()` (created once)
- [ ] No manual `withYjs` / `withYHistory` / `withCursors` wrapping
- [ ] `initialContent` is a valid `Descendant[]`
- [ ] `onChange` publishes `sendCursorPosition(editor.selection)` and `Editable` uses `useDecorateRemoteCursors()`
- [ ] Imperative usage calls `manager.destroy()` on teardown

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/slate - "Step 3: Initialize Collaborative Editor"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/slate - "Step 7: Configure Remote Cursors (Optional)"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/slate - "Notes" and "APIs"
