---
title: Follow the Shared Lifecycle for Velt Multiplayer Editor Integrations
impact: CRITICAL
impactDescription: Wrong init or teardown order causes missed initial hydration, duplicate bindings, overwritten shared content, and leaked editor listeners
tags: crdt, multiplayer, editors, createCollaboration, useCollaboration, CollaborationManager, lifecycle, cleanup, forceResetInitialContent, editorId, yjs
---

## Follow the Shared Lifecycle for Velt Multiplayer Editor Integrations

Every Velt multiplayer editor package (`@veltdev/<editor>-crdt` plus an optional `@veltdev/<editor>-crdt-react` wrapper) follows one lifecycle: initialize Velt, authenticate the user, set a stable document context, create the editor, create exactly one `CollaborationManager`, and tear down in a defined order. The manager owns the Y.Doc, sync provider, awareness, binding, and Yjs undo manager, so the application must not create its own copies or feed content into the editor from a second source.

**Incorrect (second Y.Doc, controlled content, double binding, wrong teardown):**

```ts
import * as Y from 'yjs';
import { createCollaboration } from '@veltdev/monaco-crdt';

// Created before Velt is ready and before a user is identified
const manager = await createCollaboration({ editorId: 'doc', veltClient: client, editor });

// A second binding path for the same editor: never combine with `editor` above
await manager.bindEditor(editor);

// A separate Y.Doc bypasses Velt sync entirely
const ydoc = new Y.Doc();

// Disposing the editor first leaves the manager holding dead listeners
editor.dispose();
manager.destroy();
```

**Correct (Other Frameworks: ready, authenticated, editor first, one manager, ordered teardown):**

```ts
import { initVelt } from '@veltdev/client';
import { createCollaboration } from '@veltdev/monaco-crdt';

const DOCUMENT_ID = 'shared-file-1';
const client = await initVelt('YOUR_API_KEY');
await client.setDocument(DOCUMENT_ID, { documentName: 'Shared file' });
await client.identify({ userId: 'ada', name: 'Ada', email: 'ada@example.com', organizationId: 'org-1' });

let manager = null;
const initSubscription = client.getVeltInitState().subscribe(async (isReady) => {
  if (!isReady || manager) return;
  const editor = createMyEditor(); // the application creates the editor first
  manager = await createCollaboration({
    editorId: DOCUMENT_ID,          // same editorId + document for every collaborator
    veltClient: client,
    editor,                         // binds once during initialization
    initialContent: '// seed for a brand-new document only\n',
    onError: (error) => console.error('Collaboration error:', error),
  });
});

// Teardown: unsubscribe, destroy the manager, then dispose the editor
function teardown(editor) {
  initSubscription.unsubscribe();
  manager?.destroy();
  editor.dispose();
}
```

**Correct (React / Next.js: authenticated provider, document set before the editor mounts):**

```tsx
import { useEffect, useState } from 'react';
import { VeltProvider, useCurrentUser, useSetDocuments } from '@veltdev/react';

function CollaborationScope() {
  const user = useCurrentUser();
  const { setDocuments } = useSetDocuments();
  const [documentReady, setDocumentReady] = useState(false);

  useEffect(() => {
    if (!user) {
      setDocumentReady(false);
      return;
    }
    setDocuments([{ id: 'shared-file-1', metadata: { documentName: 'Shared file' } }]);
    setDocumentReady(true);
  }, [user, setDocuments]);

  // Mount the editor component (which calls the package's useCollaboration hook) only when ready
  return user && documentReady ? <CollaborativeEditor /> : <p>Preparing collaboration...</p>;
}

<VeltProvider apiKey="YOUR_API_KEY" authProvider={authProvider}>
  <CollaborationScope />
</VeltProvider>;
```

### Rules that apply to every editor package

| Concern | Rule |
|---|---|
| Readiness | Create the manager after Velt is initialized and a user is authenticated. Several React hooks (CKEditor, Apryse, Nutrient, Quill) do not wait for document context, so set the document before mounting the editor. |
| Identity | Every collaborator must share the same Velt document and `editorId`. Use different `editorId` values for independent editors. |
| Editor ownership | Create the editor or viewer first (exceptions: SuperDoc creates the manager first; ProseMirror direct setup creates the manager with `autoInitialize: false`). |
| One binding | Passing `editor` / `instance` / `workbook` to the factory or hook binds it. Use `bindEditor()`, `attachEditor()`, `attachInstance()`, or `attachWorkbook()` only on the attach-later path, never both. |
| Uncontrolled content | Do not pass `value`, `defaultValue`, `initialValue`, `data`, or `onEditorChange` style props. The shared Yjs state owns content. |
| Initial content | `initialContent` seeds only a brand-new shared document. `forceResetInitialContent: true` (or `forceReset()`) replaces shared content for every collaborator; use it only for deliberate reset or template flows. |
| History | Use the manager's Yjs-aware undo/redo (`getUndoManager()`, `undo()`/`redo()` helpers, or the package's exported commands). Do not add the editor's native history alongside it. |
| Yjs ownership | Never create a second Y.Doc, provider, or awareness. Use `getDoc()`, `getProvider()`, `getAwareness()`, `getStore()` only as escape hatches. |
| Dependencies | Resolve one copy of `yjs` (and `y-protocols` plus the editor package) in the bundle. |
| Presence | Cursors and selections are awareness state: transient, not persisted, not part of versions. |
| Cleanup (React) | Hooks and drop-in components destroy the manager on unmount; hooks also return `destroy()` and accept `enabled: false` for early teardown. |
| Cleanup (Other Frameworks) | Unsubscribe callbacks, call `manager.destroy()`, then dispose the editor. Exceptions: SuperDoc (destroy SuperDoc, then the manager) and ProseMirror (destroy the `EditorView`, then the manager). |

**Verification Checklist:**
- [ ] Manager is created only after Velt init state is ready and the user is authenticated
- [ ] Document context is set before the collaborative editor mounts
- [ ] Exactly one binding path is used per manager
- [ ] No controlled content props and no extra `Y.Doc` / provider in application code
- [ ] `forceResetInitialContent` is off for normal page loads
- [ ] Every `on*` subscription is unsubscribed and teardown order matches the editor's guide
- [ ] Tested with two different authenticated users in separate browser profiles

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/overview - "Out of box support" editor list and packages
- https://docs.velt.dev/realtime-collaboration/crdt/setup/tinymce - "Step 2: Setup Velt" and "Step 13: Cleanup"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/monaco - "Step 3: Initialize Collaborative Editor" (one binding path)
- https://docs.velt.dev/realtime-collaboration/crdt/setup/superdoc - "Step 12: Cleanup" (inverse teardown order)
- https://docs.velt.dev/realtime-collaboration/crdt/setup/prosemirror - "Step 15: Enable, Disable, and Cleanup"
