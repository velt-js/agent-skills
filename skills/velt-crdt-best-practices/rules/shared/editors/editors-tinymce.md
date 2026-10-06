---
title: Keep TinyMCE Uncontrolled and Destroy the Manager Before tinymce.remove()
impact: HIGH
impactDescription: Controlled content props overwrite shared HTML; removing TinyMCE before manager.destroy() leaves listeners and awareness attached to a dead editor
tags: crdt, tinymce, tinymce-crdt, TinyMceCrdtEditor, useCollaboration, createCollaboration, editorRef, inline, iframe, cursorsContainer
---

## Keep TinyMCE Uncontrolled and Destroy the Manager Before tinymce.remove()

`@veltdev/tinymce-crdt` stores normalized HTML in a Yjs XML fragment and preserves the local selection while applying remote HTML. The CRDT manager is the only content owner: do not pass `value`, `initialValue`, or `onEditorChange`. In Other Frameworks, initialize TinyMCE first, create the manager with the editor instance, and destroy the manager before `tinymce.remove(editor)`.

**Incorrect (controlled TinyMCE with the hook):**

```tsx
import { Editor } from '@tinymce/tinymce-react';
import { useCollaboration } from '@veltdev/tinymce-crdt-react';

const { editorRef } = useCollaboration({ editorId: 'proposal' });

<Editor
  value={html}                 // second content source
  onEditorChange={setHtml}
  onInit={(_e, editor) => editorRef(editor)}
/>;
```

**Correct (React / Next.js: drop-in component or uncontrolled hook):**

```tsx
import { TinyMceCrdtEditor } from '@veltdev/tinymce-crdt-react';

export function CollaborativeEditor() {
  return (
    <TinyMceCrdtEditor
      editorId="proposal"
      initialContent="<p>Start writing here...</p>"
      licenseKey="gpl"
      init={{ height: 500, menubar: false, plugins: 'autolink link lists' }}
      cursorData={{ name: 'Ada', color: '#2563eb' }}
      onError={(error) => console.error('Collaboration error:', error)}
    />
  );
}
```

The component forwards normal `@tinymce/tinymce-react` props except `value`, `initialValue`, `onEditorChange`, and `onInit`. With the hook, render `<Editor licenseKey="gpl" onInit={(_e, editor) => editorRef(editor)} init={...} />` and nothing else that sets content.

**Correct (Other Frameworks):**

```ts
import tinymce from 'tinymce/tinymce';
import { createCollaboration } from '@veltdev/tinymce-crdt';

const [editor] = await tinymce.init({ selector: '#editor', inline: true, license_key: 'gpl', plugins: 'autolink link lists' });

const manager = await createCollaboration({
  editorId: 'proposal',
  veltClient: client,
  editor,
  initialContent: '<p>Start writing here...</p>',
  cursorData: { name: 'Ada', color: '#2563eb' },
  onError: (error) => console.error('Collaboration error:', error),
});

// Teardown: manager first, then TinyMCE
manager.destroy();
tinymce.remove(editor);
```

### TinyMCE-specific notes

- Both inline and iframe modes are supported (omit `inline: true` for iframe mode). Remote cursor overlays work in both.
- Self-hosted builds must import `tinymce/tinymce`, the theme, model, icons, plugins, and skin CSS; otherwise the editor stays blank. Tiny Cloud users pass `apiKey` instead.
- Local edits reach the CRDT after `debounceMs` (default 125 ms).
- `cursorsContainer={null}` keeps awareness active without injected cursor DOM; `manager.onRemoteCursorsChange()` feeds custom cursor UI.
- `manager.getHtml()` / `manager.setHtml(html)` read and replace the shared HTML.

**Verification Checklist:**
- [ ] No `value`, `initialValue`, or `onEditorChange` on any TinyMCE component
- [ ] TinyMCE is initialized before `createCollaboration()`
- [ ] Required self-hosted imports are loaded (or a Tiny Cloud `apiKey` is set)
- [ ] `forceResetInitialContent` is off for normal loads
- [ ] `manager.destroy()` runs before `tinymce.remove(editor)`

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/setup/tinymce - "Step 3: Load TinyMCE"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/tinymce - "Step 4: Initialize Collaborative Editor"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/tinymce - "Step 13: Cleanup" and "Notes"
