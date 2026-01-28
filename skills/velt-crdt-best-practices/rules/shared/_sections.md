# Sections

This file defines all categories, their ordering, impact levels, and descriptions.
Rules are organized into category folders under `rules/`.

---

## 1. Core CRDT (core/)

**Impact:** CRITICAL
**Description:** Framework-agnostic CRDT fundamentals including Velt initialization, store creation, store types, subscriptions, updates, versioning, encryption, and debugging. Required foundation for all editor integrations.

**Rules:**
- `core-install` - Install correct packages
- `core-velt-init` - Initialize Velt client
- `core-store-create-react` - useVeltCrdtStore hook (React)
- `core-store-create-vanilla` - createVeltStore (non-React)
- `core-store-types` - Choose correct store type
- `core-store-subscribe` - Subscribe to changes
- `core-store-update` - Update store values
- `core-version-save` - Save version checkpoints
- `core-encryption` - Custom encryption provider
- `core-debug-storemap` - VeltCrdtStoreMap debugging
- `core-debug-testing` - Multi-user testing

## 2. Tiptap Integration (tiptap/)

**Impact:** CRITICAL
**Description:** Rich text collaborative editing with Tiptap. Covers installation, setup, history conflict, cursor styling, and testing.

**Rules:**
- `tiptap-install` - Install Tiptap packages
- `tiptap-setup-react` - useVeltTiptapCrdtExtension (React)
- `tiptap-setup-vanilla` - createVeltTipTapStore (non-React)
- `tiptap-disable-history` - Disable Tiptap history
- `tiptap-editor-id` - Unique editorId
- `tiptap-cursor-css` - Collaboration cursor CSS
- `tiptap-testing` - Test collaboration

## 3. BlockNote Integration (blocknote/)

**Impact:** HIGH
**Description:** Block-based collaborative editing with BlockNote. React-only support currently.

**Rules:**
- `blocknote-install` - Install BlockNote package
- `blocknote-setup-react` - useVeltBlockNoteCrdtExtension (React)
- `blocknote-editor-id` - Unique editorId
- `blocknote-testing` - Test collaboration

## 4. CodeMirror Integration (codemirror/)

**Impact:** HIGH
**Description:** Collaborative code editing with CodeMirror. Covers yCollab wiring and both React and vanilla setups.

**Rules:**
- `codemirror-install` - Install CodeMirror packages
- `codemirror-setup-react` - useVeltCodeMirrorCrdtExtension (React)
- `codemirror-setup-vanilla` - createVeltCodeMirrorStore (non-React)
- `codemirror-ycollab` - Wire yCollab extension
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
