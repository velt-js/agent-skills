# Yjs Best Practices
|v1.1.1|Velt|May 2026
|IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for any Velt tasks.
|root: ./rules

## 1. Core Document Lifecycle — CRITICAL
|shared/core:{core-garbage-collection.md,core-ydoc-setup.md,core-document-updates.md,core-transactions.md}

## 2. Shared Types — HIGH
|shared/shared-types:{types-yarray.md,types-ymap.md,types-ytext.md,types-xml.md,types-ymap-ykeyvalue.md}

## 3. Providers — HIGH
|shared/providers:{provider-custom.md,provider-indexeddb.md,provider-webrtc.md,provider-websocket.md}

## 4. Editor Bindings — HIGH
|shared/editor-bindings:{binding-codemirror.md,binding-monaco.md,binding-prosemirror.md,binding-quill.md,binding-tiptap.md}

## 5. Awareness — MEDIUM
|shared/awareness:{awareness-protocol.md}

## 6. Undo / Redo — MEDIUM
|shared/undo:{undo-manager.md}

## 7. Pitfalls — MEDIUM
|shared/pitfalls:{pitfall-duplicate-imports.md,pitfall-subdocuments.md,pitfall-v2-encoding.md}

## 8. Debugging — LOW-MEDIUM
|shared/debug:{debug-common-issues.md}
