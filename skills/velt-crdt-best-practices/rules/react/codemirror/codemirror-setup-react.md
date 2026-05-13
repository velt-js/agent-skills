---
title: Use useVeltCodeMirrorCrdtExtension for React CodeMirror (v1 — DEPRECATED)
impact: LOW
impactDescription: v1 API retained for backwards-compatibility only. New integrations must use the v2 useCollaboration hook (see codemirror-collaboration-manager.md and codemirror-v1-to-v2-migration.md).
tags: codemirror, react, hook, useVeltCodeMirrorCrdtExtension, deprecated, v1
---

## Use useVeltCodeMirrorCrdtExtension for React CodeMirror (v1 — DEPRECATED)

> **DEPRECATED:** This rule documents the v1 React CodeMirror CRDT API and is retained for backwards-compatibility reference only. **New integrations must use `useCollaboration` from `@veltdev/codemirror-crdt-react`** — see `rules/shared/codemirror/codemirror-collaboration-manager.md` for the canonical v2 pattern and `rules/shared/codemirror/codemirror-v1-to-v2-migration.md` for the migration table.

Use `useVeltCodeMirrorCrdtExtension` to get the store, then wire it into CodeMirror with `yCollab`.

**Correct (React implementation):**

```tsx
import { useVeltCodeMirrorCrdtExtension } from '@veltdev/codemirror-crdt-react';
import { yCollab } from 'y-codemirror.next';
import { EditorState } from '@codemirror/state';
import { basicSetup, EditorView } from 'codemirror';
import { useEffect, useRef } from 'react';

function CollaborativeCodeEditor({ editorId }: { editorId: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const { store, isLoading } = useVeltCodeMirrorCrdtExtension({ editorId });

  useEffect(() => {
    if (!store || !editorRef.current) return;

    // Clean up existing view
    viewRef.current?.destroy();

    const startState = EditorState.create({
      doc: store.getYText()?.toString() ?? '',
      extensions: [
        basicSetup,
        yCollab(
          store.getYText()!,
          store.getAwareness(),
          { undoManager: store.getUndoManager() }
        ),
      ],
    });

    viewRef.current = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, [store]);

  return (
    <div>
      <div ref={editorRef} />
      <div>{isLoading ? 'Connecting...' : 'Connected'}</div>
    </div>
  );
}
```

**Hook Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `store` | CodeMirrorStore \| null | CRDT store with Yjs access |
| `isLoading` | boolean | True until store is ready |

**Store Methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `getYText()` | Y.Text \| null | Yjs text for document |
| `getAwareness()` | Awareness | Yjs awareness for cursors |
| `getUndoManager()` | Y.UndoManager | Yjs undo manager |
| `destroy()` | void | Cleanup resources |

**Verification:**
- [ ] `store` used after `isLoading` is false
- [ ] `yCollab` receives store's YText, Awareness, UndoManager
- [ ] EditorView destroyed on cleanup

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/codemirror` (## Legacy API (v1) > React: useVeltCodeMirrorCrdtExtension() (deprecated))
