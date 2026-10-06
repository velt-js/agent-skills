---
title: Route Every Draft.js Change Through handleChange() with Ref-Backed EditorState
impact: HIGH
impactDescription: Bypassing handleChange() means local edits never reach the CRDT; a closure-captured getEditorState applies remote snapshots to stale state
tags: crdt, draftjs, draft-js, draftjs-crdt, useCollaboration, createCollaboration, handleChange, EditorState, RawDraftContentState, snapshot, onRemoteCursorsChange
---

## Route Every Draft.js Change Through handleChange() with Ref-Backed EditorState

Draft.js is a controlled editor, so `@veltdev/draftjs-crdt` (one package with `useCollaboration()` and `createCollaboration()`) needs `getEditorState` / `setEditorState` accessors from your app. Keep a ref synchronized with the latest `EditorState`, and pass every `onChange` value (including `RichUtils` results) through `handleChange()` before storing it. Bypassing it keeps the change local.

**Incorrect (bypasses handleChange, stale closure):**

```tsx
const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

useCollaboration({
  editorId: 'my-draftjs-editor',
  getEditorState: () => editorState, // captured once: stale after the first change
  setEditorState,
});

<Editor editorState={editorState} onChange={setEditorState} />; // never reaches the CRDT
```

**Correct (React hook):**

```tsx
import { useCallback, useRef, useState } from 'react';
import { Editor, EditorState, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { useCollaboration } from '@veltdev/draftjs-crdt';

export function CollaborativeEditor() {
  const [editorState, setEditorStateValue] = useState(() => EditorState.createEmpty());
  const editorStateRef = useRef(editorState);

  const setEditorState = useCallback((next: EditorState) => {
    editorStateRef.current = next;
    setEditorStateValue(next);
  }, []);
  const getEditorState = useCallback(() => editorStateRef.current, []);

  const { handleChange, manager, isLoading, isSynced, status, error } = useCollaboration({
    editorId: 'my-draftjs-editor',
    getEditorState,
    setEditorState,
    initialContent: 'Hello Draft.js CRDT!',
    cursorData: { name: 'Ada', color: '#2563eb' },
    onError: (err) => console.error('Collaboration error:', err),
  });

  const onEditorChange = useCallback(
    (next: EditorState) => setEditorState(handleChange(next)),
    [handleChange, setEditorState],
  );
  const toggleBold = () => onEditorChange(RichUtils.toggleInlineStyle(editorStateRef.current, 'BOLD'));

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div>Status: {isLoading ? 'loading' : status} | Synced: {isSynced ? 'Yes' : 'No'}</div>
      <button onClick={toggleBold}>Bold</button>
      <Editor
        editorState={editorState}
        onChange={onEditorChange}
        onFocus={() => manager?.sendCursorPosition()}
        onBlur={() => manager?.sendCursorPosition()}
      />
    </div>
  );
}
```

With the imperative `createCollaboration({ editorId, veltClient, getEditorState, setEditorState })`, call `setEditorState(manager.handleChange(next))` and `manager.destroy()` on teardown (safe to call more than once).

### Draft.js-specific notes

- Cursor DOM is application-owned: subscribe with `manager.onRemoteCursorsChange((cursors) => ...)` and render the returned `RemoteDraftCursor` data yourself.
- `initialContent` accepts plain text or `RawDraftContentState`. Migrate existing content with `convertToRaw(editorState.getCurrentContent())`, not through HTML.
- Data model: an XML store (key `draftjs`) holding raw-content snapshots. Online edits sync quickly, but two offline users editing the same old snapshot can supersede each other; choose Lexical or Slate when character-level offline merging matters.
- REST-created content is bridged from the `restContentKey` fragment (default `'document-store'`); send Yjs-compatible XML state through the CRDT REST endpoints.
- Do not disable local editing only because the provider is `connecting`.

**Verification Checklist:**
- [ ] `getEditorState` reads from a ref updated by `setEditorState`
- [ ] Every `onChange` and `RichUtils` result passes through `handleChange()`
- [ ] Remote cursors rendered from `onRemoteCursorsChange()` data
- [ ] `initialContent` is plain text or raw Draft JSON, and `forceResetInitialContent` is off for normal loads
- [ ] Product accepts snapshot reconciliation for offline concurrent edits

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/draftjs - "Step 3: Initialize Collaborative Editor"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/draftjs - "Step 4: Preserve the Controlled Editor Pattern"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/draftjs - "REST API Compatibility" and "Concurrency and Data Model"
