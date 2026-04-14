---
title: Set Up VeltCursor for Real-Time Cursor Tracking
impact: HIGH
impactDescription: Real-time cursor sharing for canvas, diagram, and spatial applications
tags: cursor, VeltCursor, tracking, canvas, reactflow, whiteboard, spatial
---

## Set Up VeltCursor for Real-Time Cursor Tracking

`VeltCursor` renders real-time cursor positions for all active users in the document. It is best suited for canvas, diagram, and spatial applications where mouse position conveys intent -- such as ReactFlow, whiteboards, and image editors.

**Why this matters:**

In spatial applications, cursor position is the primary indicator of what a collaborator is focused on. Without cursor tracking, users cannot coordinate effectively on shared canvases.

**Basic setup**

```jsx
"use client";
import { VeltCursor } from "@veltdev/react";

function CanvasEditor() {
  return (
    <div className="canvas-container">
      <VeltCursor />
      {/* Your canvas content */}
    </div>
  );
}
```

**Place alongside VeltPresence and VeltComments**

```jsx
"use client";
import { VeltPresence, VeltCursor, VeltComments } from "@veltdev/react";

function CollaborativeCanvas() {
  return (
    <>
      <header className="toolbar">
        <VeltPresence />
      </header>
      <main className="canvas-area">
        <VeltCursor />
        <VeltComments />
        {/* ReactFlow, Konva, Fabric.js, etc. */}
      </main>
    </>
  );
}
```

**ReactFlow integration**

```jsx
"use client";
import { VeltPresence, VeltCursor } from "@veltdev/react";
import ReactFlow from "reactflow";

function FlowEditor({ nodes, edges }) {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <VeltPresence />
      <VeltCursor />
      <ReactFlow nodes={nodes} edges={edges} fitView />
    </div>
  );
}
```

**When NOT to use VeltCursor:**

- **Text editors (TipTap, SlateJS, Lexical, CodeMirror, Quill):** Cursor tracking in text editors is handled by editor-specific CRDT bindings (e.g., Yjs + TipTap collaboration extension), not `VeltCursor`. Using `VeltCursor` in a text editor will show mouse cursors, not text carets.
- **Non-spatial UIs:** If users interact primarily through forms, lists, or other structured UI elements, cursor tracking adds visual noise without conveying useful information.

**Key patterns:**

- `VeltCursor` goes inside the container where you want cursors rendered
- It works alongside `VeltPresence` (avatars) and `VeltComments` (annotations)
- Cursors are scoped to the document set by `setDocuments`
- Each cursor shows the user's name/avatar label by default
- For text editors, use Velt CRDT bindings instead (see `velt-crdt-best-practices`)

### Verification Checklist

- [ ] `VeltCursor` is inside `<VeltProvider>` with valid `authProvider`
- [ ] `setDocuments` has been called to scope cursors to the correct document
- [ ] `VeltCursor` is placed inside the spatial container (not outside it)
- [ ] For text editors, CRDT bindings are used instead of `VeltCursor`
- [ ] Multiple users tested -- open in two browser tabs with different user identities

> **Source:** Velt Cursor Component API -- `VeltCursor`, cursor tracking for spatial applications
