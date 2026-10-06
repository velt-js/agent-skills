---
title: Create CKEditor First, Keep data Uncontrolled, and Forward onAfterDestroy
impact: HIGH
impactDescription: Controlled data overwrites shared HTML; a missing onAfterDestroy leaves a stale manager bound after a watchdog restart
tags: crdt, ckeditor, ckeditor5, ckeditor-crdt, CKEditorCrdtEditor, useCollaboration, createCollaboration, editorRef, onAfterDestroy, license
---

## Create CKEditor First, Keep data Uncontrolled, and Forward onAfterDestroy

`@veltdev/ckeditor-crdt` stores normalized CKEditor HTML in a Yjs XML fragment. The manager owns content, so the drop-in component must not receive `data` or `onReady`, and a self-rendered `CKEditor` must keep `data=""` and never update it from React state. When you render CKEditor yourself, forward `onAfterDestroy` to `editorRef(null)` so the manager releases a destroyed instance.

**Incorrect (controlled data, no release on destroy):**

```tsx
<CKEditor
  editor={ClassicEditor}
  data={htmlFromState}                // overwrites shared HTML on every render
  config={editorConfig}
  onReady={(editor) => editorRef(editor)}
  // missing onAfterDestroy={() => editorRef(null)}
/>;
```

**Correct (React / Next.js: drop-in component):**

```tsx
import { ClassicEditor, Essentials, Paragraph, Bold, Italic, Undo } from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import { CKEditorCrdtEditor } from '@veltdev/ckeditor-crdt-react';

const editorConfig = {
  licenseKey: 'GPL', // use your commercial key when required
  plugins: [Essentials, Paragraph, Bold, Italic, Undo],
  toolbar: ['undo', 'redo', '|', 'bold', 'italic'],
};

export function CollaborativeEditor() {
  return (
    <CKEditorCrdtEditor
      editor={ClassicEditor}
      editorId="project-brief"
      config={editorConfig}
      initialContent="<p>Start writing here...</p>"
      cursorData={{ name: 'Ada', color: '#0f766e' }}
      onError={(error) => console.error('Collaboration error:', error)}
    />
  );
}
```

With `useCollaboration()`, render `<CKEditor editor={ClassicEditor} data="" config={editorConfig} onReady={(e) => editorRef(e)} onAfterDestroy={() => editorRef(null)} />`.

**Correct (Other Frameworks):**

```ts
import { createCollaboration } from '@veltdev/ckeditor-crdt';

const editor = await ClassicEditor.create(document.querySelector('#editor'), editorConfig);

const manager = await createCollaboration({
  editorId: 'project-brief',
  veltClient: client,          // initialized, authenticated, document already set
  editor,
  initialContent: '<p>Start writing here...</p>',
  cursorsContainer: document.querySelector('#editor-surface'),
});

// Teardown: manager first, then CKEditor
manager.destroy();
await editor.destroy();
```

### CKEditor-specific notes

- The React hook waits for Velt initialization, an authenticated user, the CKEditor instance, and `enabled`. It does not wait for document context, so set the document first.
- Include a CKEditor plugin for every toolbar item and provide the correct license key.
- For custom collaboration-aware undo buttons, use `manager.getUndoManager()`; do not trigger CKEditor's native undo and the Yjs undo from the same action.
- The manager registers its fragment observer before the store initializes. Custom integrations must preserve that order or they miss initial server hydration.
- `cursorsContainer: null` keeps awareness without overlay DOM; the hook also returns reactive `remoteCursors`.
- Deduplicate `ckeditor5`, `yjs`, `y-protocols`, and `lib0` in linked or monorepo builds.

**Verification Checklist:**
- [ ] No `data` / `onReady` on `CKEditorCrdtEditor`; hook path keeps `data=""`
- [ ] `onAfterDestroy` forwards `editorRef(null)` on self-rendered editors
- [ ] Document context set before the editor mounts
- [ ] Other Frameworks: `ClassicEditor.create()` resolves before `createCollaboration()`
- [ ] `manager.destroy()` runs before `editor.destroy()`

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/ckeditor - "Step 3: Configure CKEditor"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/ckeditor - "Step 4: Initialize Collaborative Editor"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/ckeditor - "Step 13: Enable, Disable, and Cleanup" and "Notes"
