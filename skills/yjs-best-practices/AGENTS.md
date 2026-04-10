# Yjs Best Practices
|v1.0.0|Velt|April 2026
|IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for any Yjs tasks.
|root: ./rules

## 1. Core (Y.Doc & Updates) — CRITICAL
|core:{core-ydoc-setup.md,core-transactions.md,core-document-updates.md,core-garbage-collection.md}

## 2. Shared Types — CRITICAL
|shared-types:{types-ytext.md,types-yarray.md,types-ymap.md,types-ymap-ykeyvalue.md,types-xml.md}

## 3. Providers — HIGH
|providers:{provider-websocket.md,provider-webrtc.md,provider-indexeddb.md,provider-custom.md}

## 4. Editor Bindings — HIGH
|editor-bindings:{binding-tiptap.md,binding-prosemirror.md,binding-codemirror.md,binding-quill.md,binding-monaco.md}

## 5. Awareness — MEDIUM-HIGH
|awareness:{awareness-protocol.md}

## 6. Undo/Redo — MEDIUM
|undo:{undo-manager.md}

## 7. Pitfalls & Debugging — MEDIUM
|pitfalls:{pitfall-duplicate-imports.md,pitfall-subdocuments.md,pitfall-v2-encoding.md}
|debug:{debug-common-issues.md}
