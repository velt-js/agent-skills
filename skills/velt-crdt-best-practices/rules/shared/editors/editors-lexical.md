---
title: Set Lexical editorState to null and Use the Manager's Yjs Undo
impact: HIGH
impactDescription: A composer editorState or Lexical's HistoryPlugin conflicts with the shared Y.XmlText and produces duplicated or reverted content
tags: crdt, lexical, lexical-crdt, LexicalCollaborationPlugin, useLexicalComposerCollaboration, createCollaboration, editorState, undo, cursorData, yjs
---

## Set Lexical editorState to null and Use the Manager's Yjs Undo

`@veltdev/lexical-crdt-react` and `@veltdev/lexical-crdt` bind Lexical to a shared `Y.XmlText` through the official `@lexical/yjs` binding. Collaboration owns the document state, so the composer must start with `editorState: null`, Lexical's normal history plugin must not be registered, and the manager (not your code) must own the `@lexical/yjs` binding, provider, awareness, and `Y.UndoManager`.

**Incorrect (composer state, HistoryPlugin, manual binding):**

```tsx
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';

const initialConfig = {
  namespace: 'doc',
  editorState: JSON.stringify(savedState), // conflicts with the shared CRDT document
  onError: console.error,
};

<LexicalComposer initialConfig={initialConfig}>
  <HistoryPlugin /> {/* local history that does not understand remote updates */}
  {/* no Velt collaboration plugin; @lexical/yjs wired by hand elsewhere */}
</LexicalComposer>;
```

**Correct (React / Next.js: plugin or composer hook inside LexicalComposer):**

```tsx
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerCollaboration } from '@veltdev/lexical-crdt-react';

const initialConfig = {
  namespace: 'my-collab-editor',
  editorState: null, // collaboration owns the state
  theme: {
    collaboration: {
      cursor: 'lexical-collaboration-cursor',
      cursorName: 'lexical-collaboration-cursor-name',
      selection: 'lexical-collaboration-selection',
      selectionBg: 'lexical-collaboration-selection-bg',
    },
  },
  onError: console.error,
};

function CollaborationBridge() {
  const { isLoading, isSynced, status, error } = useLexicalComposerCollaboration({
    editorId: 'my-lexical-editor',
    cursorData: { name: 'Ada', color: '#7c3aed', awarenessData: { userId: 'ada' } },
  });
  if (error) return <div>Error: {error.message}</div>;
  return <div>{isLoading ? 'loading' : status} {isSynced ? '(synced)' : ''}</div>;
}

export function LexicalEditor() {
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <CollaborationBridge />
      <RichTextPlugin
        contentEditable={<ContentEditable className="lexical-editor" />}
        placeholder={<div>Start typing...</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
    </LexicalComposer>
  );
}
```

Use `<LexicalCollaborationPlugin editorId="..." />` when you do not need reactive state, and `useCollaboration({ editorId, editor })` only when you hold a `LexicalEditor` instance outside the composer.

**Correct (Other Frameworks: create and attach Lexical first):**

```ts
import { createEditor } from 'lexical';
import { HeadingNode, QuoteNode, registerRichText } from '@lexical/rich-text';
import { createCollaboration } from '@veltdev/lexical-crdt';

const editor = createEditor({ namespace: 'my-collab-editor', nodes: [HeadingNode, QuoteNode], onError: console.error });
editor.setRootElement(document.querySelector('#editor'));
const unregisterRichText = registerRichText(editor);

const manager = await createCollaboration({
  editorId: 'my-lexical-editor',
  editor,
  veltClient: client,
  cursorData: { name: 'Ada', color: '#7c3aed' },
  onError: (error) => console.error('Collaboration error:', error),
});

// Collaboration-aware undo/redo
manager.getUndoManager()?.undo();

// Teardown: manager first, then the editor
manager.destroy();
unregisterRichText();
editor.setRootElement(null);
```

### Lexical-specific notes

- `initialContent` is a stringified serialized Lexical editor state (the React wrapper also accepts plain text). It applies only to a brand-new document unless `forceResetInitialContent` is set.
- Remote carets render through the manager-owned cursor overlay; add the `theme.collaboration` classes and CSS for `.lexical-collaboration-cursor`, `.lexical-collaboration-cursor-name`, `.lexical-collaboration-selection`, and `.lexical-collaboration-selection-bg`.
- The React hooks wait for the Lexical root element, Velt initialization, and an authenticated user.
- Limitation: content written through the CRDT REST API is not materialized into the Lexical editor (browser-to-REST reads work, REST-to-browser does not).
- Keep one copy of `lexical`, every `@lexical/*` package, and `yjs` in the bundle.

**Verification Checklist:**
- [ ] `editorState: null` in the composer config
- [ ] No Lexical `HistoryPlugin`; undo/redo uses `manager.getUndoManager()`
- [ ] Collaboration hook or plugin renders inside `<LexicalComposer>`
- [ ] `cursorData` passed and collaboration theme classes styled
- [ ] Other Frameworks: editor root attached before `createCollaboration()`; `manager.destroy()` runs before the editor is discarded
- [ ] Server-side seeding does not rely on REST writes appearing in Lexical

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/lexical - "Step 3: Initialize Collaborative Editor"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/lexical - "Step 8: Style Collaboration Cursors"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/lexical - "Notes" and "Limitations"
