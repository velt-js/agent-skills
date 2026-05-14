---
name: velt-crdt-best-practices
description: Velt CRDT (Yjs) collaborative editing best practices for real-time applications. This skill should be used when implementing collaborative features using Velt CRDT stores, integrating with editors like Tiptap, BlockNote, CodeMirror, or ReactFlow, or debugging sync issues. Triggers on tasks involving real-time collaboration, multiplayer editing, CRDT stores, or Velt SDK integration.
license: MIT
metadata:
  author: velt
  version: "2.0.3"
---

# Velt CRDT Best Practices

Comprehensive best practices guide for implementing real-time collaborative editing with Velt CRDT (Yjs), maintained by Velt. Contains 42 rules across 5 categories, prioritized by impact to guide automated code generation and debugging.

## When to Apply

Reference these guidelines when:
- Setting up Velt client and CRDT stores
- Integrating with Tiptap, BlockNote, CodeMirror, or ReactFlow
- Implementing real-time synchronization
- Managing version history and checkpoints
- Debugging collaboration or sync issues
- Testing multi-user collaboration

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Core CRDT | CRITICAL | `core-` |
| 2 | Tiptap Integration | CRITICAL | `tiptap-` |
| 3 | BlockNote Integration | HIGH | `blocknote-` |
| 4 | CodeMirror Integration | HIGH | `codemirror-` |
| 5 | ReactFlow Integration | HIGH | `reactflow-` |

## Quick Reference

### 1. Core CRDT (CRITICAL)

- `core-install` - Install correct CRDT packages for your framework
- `core-velt-init` - Initialize Velt client before creating stores
- `core-store-v2-api` - **v2** Use `useStore<T>` + `useAwareness` React hooks; `createVeltStore` v2 config (`forceResetInitialContent`, `contentKey`, `userId`, `collection`, `logLevel`); reactive status/sync/error
- `core-v1-to-v2-migration` - Migration table: `useVeltCrdtStore` → `useStore` (`id` → `storeId`, new status/sync/error/onError, `useAwareness`)
- `core-store-create-vanilla` - Use createVeltStore for non-React (entry point unchanged in v2)
- `core-store-types` - Choose correct store type (text/array/map/xml/xmltext)
- `core-store-array` - Array store: useStore/createVeltStore with type:'array', Array.isArray() guard, add/remove item patterns
- `core-store-map` - Map store: useStore/createVeltStore with type:'map', object guard, key-level update/delete patterns
- `core-store-text` - Text store: useStore/createVeltStore with type:'text', textarea binding, null coalesce with ?? ''
- `core-store-xml` - XML store: NEVER call update(); mutate via store.getXml() (Y.XmlFragment) + Yjs APIs; requires npm i yjs
- `core-store-subscribe` - Subscribe to store changes for remote updates
- `core-store-update` - Use update() method to modify values
- `core-version-save` - Save named version checkpoints
- `core-encryption` - Use custom encryption provider for sensitive data
- `core-webhooks` - Use webhooks to listen for CRDT data changes
- `core-rest-api` - Use REST API to retrieve CRDT data server-side
- `core-activity-debounce` - Use setActivityDebounceTime() to control how frequently batched CRDT editor activities are flushed
- `core-activity-action-types` - Use CrdtActivityActionTypes constant for type-safe CRDT activity filtering instead of raw strings
- `core-message-stream` - Use CrdtElement message-stream methods (pushMessage, onMessage, getMessages, getSnapshot, saveSnapshot, pruneMessages) for Yjs-backed collaborative editors
- `core-debug-storemap` - Use VeltCrdtStoreMap for runtime debugging
- `core-debug-testing` - Test with multiple browser profiles
- `core-store-create-react` - *(v1 — DEPRECATED)* useVeltCrdtStore for React; see `core-v1-to-v2-migration`

### 2. Tiptap Integration (CRITICAL)

- `tiptap-install` - Install Tiptap CRDT v2 packages
- `tiptap-collaboration-manager` - **v2** Use useCollaboration / createCollaboration + CollaborationManager API
- `tiptap-v1-to-v2-migration` - Migration table: useVeltTiptapCrdtExtension → useCollaboration
- `tiptap-disable-history` - Disable Tiptap history to prevent conflicts
- `tiptap-editor-id` - Use unique editorId per instance
- `tiptap-cursor-css` - Add CSS for collaboration cursors
- `tiptap-initial-content` - Use HTML string format for initialContent
- `tiptap-comments-integration` - Integrate Velt Comments with Tiptap
- `tiptap-nextjs-ssr` - Next.js SSR considerations
- `tiptap-testing` - Test collaboration with multiple users
- `tiptap-setup-react` - *(v1 — DEPRECATED)* useVeltTiptapCrdtExtension for React; see migration rule
- `tiptap-setup-vanilla` - *(v1 — DEPRECATED)* createVeltTipTapStore for non-React; see migration rule

### 3. BlockNote Integration (HIGH)

- `blocknote-install` - Install BlockNote CRDT v2 packages
- `blocknote-collaboration-manager` - **v2** Use useCollaboration / createCollaboration + CollaborationManager API
- `blocknote-v1-to-v2-migration` - Migration table: useVeltBlockNoteCrdtExtension → useCollaboration
- `blocknote-editor-id` - Use unique editorId per instance
- `blocknote-testing` - Test collaboration with multiple users
- `blocknote-setup-react` - *(v1 — DEPRECATED)* useVeltBlockNoteCrdtExtension; see migration rule

### 4. CodeMirror Integration (HIGH)

- `codemirror-install` - Install CodeMirror CRDT v2 packages
- `codemirror-collaboration-manager` - **v2** Use useCollaboration / createCollaboration + CollaborationManager API
- `codemirror-v1-to-v2-migration` - Migration table: useVeltCodeMirrorCrdtExtension → useCollaboration
- `codemirror-ycollab` - Wire yCollab extension with manager.getCollaborationPrimitives()
- `codemirror-editor-id` - Use unique editorId per instance
- `codemirror-testing` - Test collaboration with multiple users
- `codemirror-setup-react` - *(v1 — DEPRECATED)* useVeltCodeMirrorCrdtExtension for React; see migration rule
- `codemirror-setup-vanilla` - *(v1 — DEPRECATED)* createVeltCodeMirrorStore for non-React; see migration rule

### 5. ReactFlow Integration (HIGH)

- `reactflow-install` - Install ReactFlow CRDT package
- `reactflow-setup-react` - Use useVeltReactFlowCrdtExtension
- `reactflow-handlers` - Use CRDT handlers for node/edge changes
- `reactflow-editor-id` - Use unique editorId per instance
- `reactflow-testing` - Test collaboration with multiple users

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/shared/core/core-install.md
rules/shared/tiptap/tiptap-disable-history.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Verification checklist
- Source pointer to Velt documentation

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
