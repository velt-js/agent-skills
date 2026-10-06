---
title: Pick the Velt Multiplayer Package and Entry Point That Match Your Editor
impact: HIGH
impactDescription: Wiring a raw Yjs binding or the wrong Velt package skips Velt sync, versions, and presence and breaks REST/webhook data shapes
tags: crdt, multiplayer, editors, packages, install, lexical, slate, draftjs, prosemirror, quill, tinymce, ckeditor, superdoc, monaco, ace, apryse, nutrient, spreadjs
---

## Pick the Velt Multiplayer Package and Entry Point That Match Your Editor

Velt ships a dedicated multiplayer package for each supported editor. Each base package (`@veltdev/<editor>-crdt`) exports `createCollaboration()` for any framework; the React package (`@veltdev/<editor>-crdt-react`) adds a hook and, for most editors, a drop-in component. Slate and Draft.js ship a single package that contains both the React hook and the factory. Use the Core store (`@veltdev/crdt`) only when no dedicated integration exists.

**Incorrect (hand-rolled Yjs binding for an editor Velt already supports):**

```ts
import * as Y from 'yjs';
import { QuillBinding } from 'y-quill';

// Bypasses the Velt manager: no Velt sync provider, versions, status, or REST-compatible store
const ydoc = new Y.Doc();
new QuillBinding(ydoc.getText('quill'), quill, someAwareness);
```

**Correct (use the editor's Velt package):**

```ts
import { createCollaboration } from '@veltdev/quill-crdt';

const manager = await createCollaboration({
  editorId: 'shared-quill-doc',
  veltClient: client,
  editor: quill,
});
```

### Package and entry-point matrix

| Editor | React package | Base package | React entry points | Shared data model |
|---|---|---|---|---|
| Lexical | `@veltdev/lexical-crdt-react` | `@veltdev/lexical-crdt` | `LexicalCollaborationPlugin`, `useLexicalComposerCollaboration()`, `useCollaboration()` (explicit editor) | `Y.XmlText` via `@lexical/yjs` |
| Slate | `@veltdev/slate-crdt` (single package) | same | `useCollaboration()` (alias `useSlateCollaboration`) | `Y.XmlText` via `@slate-yjs/core` |
| Draft.js | `@veltdev/draftjs-crdt` (single package) | same | `useCollaboration()` (alias `useDraftJsCollaboration`) | XML store with raw-content snapshots |
| ProseMirror | `@veltdev/prosemirror-crdt-react` | `@veltdev/prosemirror-crdt` | `ProseMirrorCrdtEditor`, `useCollaboration()` | `Y.XmlFragment` (key `prosemirror`) |
| Quill 2 | `@veltdev/quill-crdt-react` | `@veltdev/quill-crdt` | `QuillCrdtEditor`, `useCollaboration()`, `QuillCrdtProvider` | `Y.Text` Delta via `y-quill` |
| TinyMCE | `@veltdev/tinymce-crdt-react` | `@veltdev/tinymce-crdt` | `TinyMceCrdtEditor`, `useCollaboration()` | Normalized HTML in `Y.XmlFragment` |
| CKEditor 5 | `@veltdev/ckeditor-crdt-react` | `@veltdev/ckeditor-crdt` | `CKEditorCrdtEditor`, `useCollaboration()` | Normalized HTML in `Y.XmlFragment` |
| SuperDoc (DOCX) | `@veltdev/superdoc-crdt-react` | `@veltdev/superdoc-crdt` | `useCollaboration()` (alias `useSuperDocCollaboration`) | XML store; `{ ydoc, provider }` handed to SuperDoc |
| Monaco | `@veltdev/monaco-crdt-react` | `@veltdev/monaco-crdt` | `MonacoCrdtEditor`, `useCollaboration()` | `Y.Text` (text store, key `content`) via `y-monaco` |
| Ace | `@veltdev/ace-crdt-react` | `@veltdev/ace-crdt` | `AceCrdtEditor`, `useCollaboration()`, `AceCrdtProvider` | `Y.Text` (text store) |
| Apryse WebViewer | `@veltdev/apryse-crdt-react` | `@veltdev/apryse-crdt` | `useApryseCrdt()` (aliases `useCollaboration`, `useApryseCollaboration`), `ApryseCrdtProvider` | Map store (key `apryse`) of XFDF annotation records |
| Nutrient Web SDK | `@veltdev/nutrient-crdt-react` | `@veltdev/nutrient-crdt` | `NutrientCrdtEditor`, `useCollaboration()`, `NutrientCrdtProvider` | Map store (key `document`) of Instant JSON snapshots |
| SpreadJS | `@veltdev/spreadjs-crdt-react` | `@veltdev/spreadjs-crdt` | `SpreadJSCrdtWorkbook`, `useCollaboration()`, `SpreadJSCrdtProvider` | Map store (key `workbook`) of workbook JSON snapshots |

Tiptap, BlockNote, CodeMirror, and ReactFlow have their own rule categories in this skill.

### Merge granularity differs by package

- **Character-level merges:** Lexical, Slate, ProseMirror, Quill, Monaco, Ace (operation-level Yjs bindings).
- **Snapshot reconciliation:** Draft.js (offline edits to the same old snapshot can supersede each other), SpreadJS (whole-workbook snapshots; no cell-level merge or formula conflict resolution), Nutrient (Instant JSON snapshots).
- **Record-level:** Apryse stores one record per annotation with deletion tombstones; the PDF bytes are not synced.

Choose an editor with an operation-level binding (for example Lexical or Slate) when offline character-level merging matters.

**Verification Checklist:**
- [ ] The installed Velt package matches the editor (React package plus base package, or the single Slate/Draft.js package)
- [ ] No hand-written `y-quill`, `y-monaco`, `y-prosemirror`, `@lexical/yjs`, or `@slate-yjs/core` binding sits alongside the Velt manager
- [ ] Product requirements for concurrent edits match the package's merge granularity
- [ ] Core stores (`useStore` / `createVeltStore`) are used only for data without a dedicated integration

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/crdt/overview - "Packages at a glance"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/draftjs - "Concurrency and Data Model"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/spreadjs - "Step 9: Configure Serialization"
- https://docs.velt.dev/realtime-collaboration/crdt/setup/apryse - "Step 5: Synchronize Annotations and XFDF"
