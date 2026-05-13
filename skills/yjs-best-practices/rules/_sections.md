# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section prefix (in parentheses) is the folder name used to group rules.

---

## 1. Core Document Lifecycle (core)

**Impact:** CRITICAL
**Description:** Foundational patterns for Y.Doc instances — creating a doc, applying updates, transaction batching to coalesce multiple mutations into a single observer notification, and explicit garbage collection control. Get these wrong and collaborative state diverges, observers fire spuriously, or memory leaks accumulate.

---

## 2. Shared Types (shared-types)

**Impact:** HIGH
**Description:** Per-type patterns for `Y.Text` (rich-text rope), `Y.Array` (ordered list), `Y.Map` (object-shaped), the YMap-vs-YKeyValue choice, and `Y.XmlFragment` (DOM-shaped, used by editor bindings). Each type has distinct semantics around insertion ordering, conflict resolution, and observer payloads.

---

## 3. Providers (providers)

**Impact:** HIGH
**Description:** Network and persistence providers that sync Y.Doc state across clients and to local storage. Covers `y-websocket` (WS protocol + auth), `y-webrtc` (peer-to-peer signaling), `y-indexeddb` (offline persistence), and the contract a custom provider must satisfy.

---

## 4. Editor Bindings (editor-bindings)

**Impact:** HIGH
**Description:** Binding Yjs shared types into rich-text editors — TipTap, ProseMirror, CodeMirror, Quill, Monaco. Each binding has framework-specific extension/plugin setup and an awareness-cursor integration story.

---

## 5. Awareness (awareness)

**Impact:** MEDIUM
**Description:** The awareness protocol — ephemeral per-client state (cursors, selection, user identity, typing indicators) that is NOT persisted in Y.Doc updates. Covers `awareness.setLocalStateField`, observer wiring, and the heartbeat/cleanup semantics for disconnected clients.

---

## 6. Undo / Redo (undo)

**Impact:** MEDIUM
**Description:** `Y.UndoManager` patterns — scoping by client-origin, tracking specific shared-type subtrees, and the gotchas around capturing transient state vs. document content. Standard `editor.commands.undo()` does NOT work on Yjs-bound content; UndoManager is the only correct path.

---

## 7. Pitfalls (pitfalls)

**Impact:** MEDIUM
**Description:** Well-known footguns. **Duplicate Yjs imports** (two copies of yjs in node_modules) silently break sync via instanceof checks. **Subdocument handling** requires explicit load and a different update-application path. **v2 encoding migration** has been the cause of multiple production sync issues — never silently re-encode existing v1 updates.

---

## 8. Debugging (debug)

**Impact:** LOW-MEDIUM
**Description:** Troubleshooting checklist for common sync failures: clients showing different content despite identical providers, observers firing twice, awareness updates not propagating, undo stack appearing empty.
