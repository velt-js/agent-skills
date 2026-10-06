# Sections

This file defines all categories, their ordering, impact levels, and descriptions.
Rules are organized into category folders under `rules/`.

---

## 1. Core CRDT (core/)

**Impact:** CRITICAL
**Description:** Framework-agnostic CRDT fundamentals including Velt initialization, store creation, store types, subscriptions, updates, versioning, encryption, and debugging. Required foundation for all editor integrations.

**Rules:**
- `core-install` - Install correct packages
- `core-velt-init` - Initialize Velt client, set document, authenticate; v6 `featureAllowList` / `preloadCrdt()`
- `core-store-v2-api` - **v2** `useStore<T>` + `useAwareness` React hooks; `createVeltStore` v2 config surface (`forceResetInitialContent`, `contentKey`, `userId`, `collection`, `logLevel`); status/sync/error reactivity
- `core-v1-to-v2-migration` - Migrate from `useVeltCrdtStore` to `useStore` (id → storeId, new status/sync/error/onError, `useAwareness` hook)
- `core-store-create-react` - useVeltCrdtStore hook (React, v1 — deprecated; see `core-v1-to-v2-migration`)
- `core-store-create-vanilla` - createVeltStore (non-React; entry point unchanged in v2 — new optional config fields documented in `core-store-v2-api`)
- `core-store-types` - Choose correct store type
- `core-store-array` - Array store (Y.Array) patterns and `Array.isArray()` guard
- `core-store-map` - Map store (Y.Map) patterns and object guard
- `core-store-text` - Text store (Y.Text) patterns and `?? ''` coalescing
- `core-store-xml` - XML store: never call `update()`; mutate via `store.getXml()` and Yjs APIs
- `core-store-subscribe` - Subscribe to changes
- `core-store-update` - Update store values
- `core-version-save` - Save version checkpoints
- `core-encryption` - Custom encryption provider
- `core-webhooks` - `crdt.update_data` webhook: enableWebhook(), debounce, payload shape
- `core-event-subscription` - Subscribe to CRDT updateData events with Observable pattern
- `core-rest-api` - REST APIs for server-side data access (Get, Add, Update)
- `core-activity-debounce` - Control CRDT activity flush frequency with setActivityDebounceTime()
- `core-activity-action-types` - Type-safe CRDT activity filtering with CrdtActivityActionTypes
- `core-message-stream` - Yjs message stream (pushMessage, onMessage, getMessages, getSnapshot, saveSnapshot, pruneMessages)
- `core-store-lifecycle` - Store lifecycle management, destroy(), and Yjs accessors
- `core-crdt-utils-hooks` - useCrdtUtils() and useCrdtEventCallback() React hooks
- `core-debug-storemap` - VeltCrdtStoreMap debugging
- `core-debug-testing` - Multi-user testing

## 2. Tiptap Integration (tiptap/)

**Impact:** CRITICAL
**Description:** Rich text collaborative editing with Tiptap. Covers installation, setup, history conflict, cursor styling, and testing.

**Rules:**
- `tiptap-install` - Install Tiptap packages (v2: drops `@tiptap/react` & `@tiptap/extension-collaboration*`, adds `yjs` & `@veltdev/types`)
- `tiptap-setup-react` - useVeltTiptapCrdtExtension (React, v1 — deprecated; see `tiptap-v1-to-v2-migration`)
- `tiptap-setup-vanilla` - createVeltTipTapStore (non-React, v1 — deprecated; see `tiptap-v1-to-v2-migration`)
- `tiptap-collaboration-manager` - v2 `useCollaboration` / `createCollaboration` + `CollaborationManager` API (status, sync, versions, Yjs escape hatches)
- `tiptap-v1-to-v2-migration` - Migrate from `useVeltTiptapCrdtExtension` / `createVeltTiptapCrdtExtension` to v2
- `tiptap-disable-history` - Disable Tiptap history
- `tiptap-editor-id` - Unique editorId
- `tiptap-comments-integration` - CRITICAL: Add TiptapVeltComments extension when using comments + CRDT (prevents freeze)
- `tiptap-cursor-css` - Collaboration cursor CSS (y-prosemirror + Tiptap extension classes)
- `tiptap-initial-content` - Use HTML string format for initialContent (not JSON); `forceResetInitialContent` for template resets
- `tiptap-nextjs-ssr` - Load Tiptap with SSR disabled in Next.js
- `tiptap-testing` - Test collaboration

## 3. BlockNote Integration (blocknote/)

**Impact:** HIGH
**Description:** Block-based collaborative editing with BlockNote. v2 adds non-React support and a unified `CollaborationManager` API.

**Rules:**
- `blocknote-install` - Install BlockNote packages (v2: adds `@veltdev/blocknote-crdt` core, `@veltdev/types`, `yjs`; non-React now supported)
- `blocknote-collaboration-manager` - v2 `useCollaboration` / `createCollaboration` + `CollaborationManager` API (status, sync, versions, Yjs escape hatches)
- `blocknote-v1-to-v2-migration` - Migrate from `useVeltBlockNoteCrdtExtension` to v2
- `blocknote-setup-react` - useVeltBlockNoteCrdtExtension (React, v1 — deprecated; see `blocknote-v1-to-v2-migration`)
- `blocknote-editor-id` - Unique editorId
- `blocknote-testing` - Test collaboration

## 4. CodeMirror Integration (codemirror/)

**Impact:** HIGH
**Description:** Collaborative code editing with CodeMirror. Covers yCollab wiring and both React and vanilla setups.

**Rules:**
- `codemirror-install` - Install CodeMirror packages (v2: adds `@veltdev/codemirror-crdt` core, `@veltdev/types`, `@codemirror/view`, `yjs`)
- `codemirror-setup-react` - useVeltCodeMirrorCrdtExtension (React, v1 — deprecated; see `codemirror-v1-to-v2-migration`)
- `codemirror-setup-vanilla` - createVeltCodeMirrorStore (non-React, v1 — deprecated; see `codemirror-v1-to-v2-migration`)
- `codemirror-collaboration-manager` - v2 `useCollaboration` / `createCollaboration` + `CollaborationManager` API (status, sync, versions, Yjs escape hatches)
- `codemirror-v1-to-v2-migration` - Migrate from `useVeltCodeMirrorCrdtExtension` / `createVeltCodeMirrorStore` to v2
- `codemirror-ycollab` - Wire yCollab extension with v2 `primitives`
- `codemirror-editor-id` - Unique editorId
- `codemirror-testing` - Test collaboration

## 5. ReactFlow Integration (reactflow/)

**Impact:** HIGH
**Description:** Collaborative diagram editing with ReactFlow. Covers CRDT-aware handlers for nodes and edges.

**Rules:**
- `reactflow-install` - Install ReactFlow package
- `reactflow-setup-react` - useVeltReactFlowCrdtExtension (React)
- `reactflow-handlers` - Use CRDT handlers
- `reactflow-editor-id` - Unique editorId
- `reactflow-testing` - Test collaboration

## 6. Multiplayer Editor Integrations (editors/)

**Impact:** HIGH
**Description:** Velt multiplayer packages for Lexical, Slate, Draft.js, ProseMirror, Quill, TinyMCE, CKEditor 5, SuperDoc, Monaco, Ace, Apryse WebViewer, Nutrient, and SpreadJS. Covers the shared CollaborationManager lifecycle, package selection, and each editor's binding, history, cursor, and teardown pitfalls.

**Rules:**
- `editors-integration-lifecycle` - Shared lifecycle: Velt ready + auth + document, editor first, one manager and one binding path, uncontrolled content, ordered teardown
- `editors-choose-package` - Package and React entry-point matrix, shared data model, and merge granularity per editor
- `editors-lexical` - `editorState: null`, no HistoryPlugin, composer hook/plugin, REST limitation
- `editors-slate` - Create the editor once with `useMemo()`; manager applies withYjs/withYHistory/withCursors; `Descendant[]` seed (React)
- `editors-draftjs` - Route every change through `handleChange()` with ref-backed `EditorState`; snapshot model (React)
- `editors-prosemirror` - `autoInitialize: false`, attach view before `initialize()`, Velt `undo`/`redo`, stable schema
- `editors-quill` - Register `quill-cursors` before `new Quill()`; manager `undo()`/`redo()`
- `editors-tinymce` - Uncontrolled TinyMCE; manager destroyed before `tinymce.remove()`
- `editors-ckeditor` - Create CKEditor first, uncontrolled `data`, forward `onAfterDestroy`
- `editors-superdoc` - Manager first; same `{ ydoc, provider }` in `documents[]` and `modules.collaboration`; one cursor renderer
- `editors-monaco` - One binding path, uncontrolled model, y-monaco cursor CSS, client-only rendering
- `editors-ace` - Ace `Range` factory, collaborative undo, one binding path
- `editors-apryse` - XFDF annotation sync around an app-owned WebViewer
- `editors-nutrient` - `overlayContainer`, Instant JSON flush, unload after `manager.destroy()`
- `editors-spreadjs` - `GC.Spread.Sheets.Events`, snapshot model, manager destroyed before workbook
