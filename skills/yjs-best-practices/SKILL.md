---
name: yjs-best-practices
description: "Yjs CRDT best practices for building real-time collaborative applications. Use this skill when implementing collaborative editing, real-time sync, shared data structures, or any feature using Yjs (Y.Doc, Y.Text, Y.Array, Y.Map, Y.XmlFragment). Triggers on tasks involving Yjs, CRDTs, collaborative editors, y-websocket, y-webrtc, y-indexeddb, y-prosemirror, y-codemirror, y-quill, y-monaco, awareness/presence, undo/redo with shared types, or any mention of real-time document collaboration — even if the user doesn't explicitly say 'Yjs'."
license: MIT
metadata:
  author: velt
  version: "1.0.0"
---

# Yjs Best Practices

Comprehensive guide for implementing real-time collaborative applications with Yjs — the high-performance CRDT framework. Contains 20 rules across 7 categories covering document lifecycle, shared types, providers, editor bindings, awareness, undo/redo, and common pitfalls.

## When to Apply

Reference these guidelines when:
- Creating or managing Y.Doc instances for collaborative documents
- Using shared types (Y.Text, Y.Array, Y.Map, Y.XmlFragment) for synced data
- Setting up network providers (y-websocket, y-webrtc) or persistence (y-indexeddb)
- Integrating Yjs with editors (TipTap, ProseMirror, CodeMirror, Quill, Monaco)
- Implementing user presence and cursor awareness
- Adding undo/redo to collaborative editing
- Debugging sync issues, state vector mismatches, or update encoding

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Core (Y.Doc & Updates) | CRITICAL | `core-` |
| 2 | Shared Types | CRITICAL | `types-` |
| 3 | Providers | HIGH | `provider-` |
| 4 | Editor Bindings | HIGH | `binding-` |
| 5 | Awareness | MEDIUM-HIGH | `awareness-` |
| 6 | Undo/Redo | MEDIUM | `undo-` |
| 7 | Pitfalls & Debugging | MEDIUM | `pitfall-`, `debug-` |

## Quick Reference

### Core (CRITICAL)
- `core-ydoc-setup` — Y.Doc creation, clientID, gc setting
- `core-transactions` — transact() bundling, origin parameter, event ordering
- `core-document-updates` — encodeStateAsUpdate, applyUpdate, mergeUpdates, state vectors
- `core-garbage-collection` — gc flag, when to disable for version history

### Shared Types (CRITICAL)
- `types-ytext` — Text & RichText, insert/format/delta, Quill compatibility
- `types-yarray` — Ordered sequences, insert/delete/push, nested types
- `types-ymap` — Key-value storage, observe, historical key retention gotcha
- `types-ymap-ykeyvalue` — YKeyValue from y-utility for efficient key-value (524KB → 271B)
- `types-xml` — Y.XmlFragment/Element/Text for structured documents

### Providers (HIGH)
- `provider-websocket` — y-websocket client and server setup
- `provider-webrtc` — y-webrtc peer-to-peer connections
- `provider-indexeddb` — y-indexeddb offline persistence
- `provider-custom` — Building custom providers, update properties

### Editor Bindings (HIGH)
- `binding-tiptap` — y-prosemirror with TipTap
- `binding-prosemirror` — y-prosemirror directly
- `binding-codemirror` — y-codemirror.next
- `binding-quill` — y-quill
- `binding-monaco` — y-monaco

### Awareness (MEDIUM-HIGH)
- `awareness-protocol` — Presence, cursors, setLocalStateField

### Undo/Redo (MEDIUM)
- `undo-manager` — Y.UndoManager, captureTimeout, trackedOrigins, cursor restoration

### Pitfalls & Debugging (MEDIUM)
- `pitfall-duplicate-imports` — CJS/ESM double-import breaks sync
- `pitfall-subdocuments` — When to use vs Y.Map alternatives
- `pitfall-v2-encoding` — useV2Encoding experimental flag
- `debug-common-issues` — logUpdate, state inspection, connection debugging

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/core/core-ydoc-setup.md
rules/shared-types/types-ytext.md
rules/providers/provider-websocket.md
```

Each rule file contains:
- Brief explanation of why it matters
- Correct code example with explanation
- Verification checklist
- Source pointers to official docs

## Compiled Documents

- `AGENTS.md` — Compressed index of all rules with file paths (start here)
- `AGENTS.full.md` — Full verbose guide with all rules expanded inline
