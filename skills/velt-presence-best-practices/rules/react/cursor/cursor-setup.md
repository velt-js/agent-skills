---
title: Set Up VeltCursor for Real-Time Cursor Tracking
impact: HIGH
impactDescription: Real-time cursor sharing for canvas, diagram, and spatial applications
tags: cursor, VeltCursor, tracking, canvas, reactflow, whiteboard, spatial, allowedElementIds
---

## Set Up VeltCursor for Real-Time Cursor Tracking

`VeltCursor` renders the live cursors of other users on the same document and location. It is best suited for canvas, diagram, and spatial applications (ReactFlow, whiteboards, image editors). Mount it once near the app root; Velt positions every remote cursor itself. For full cursor configuration, see the `velt-cursors-best-practices` skill.

**Why this matters:**

In spatial applications, cursor position is the main signal of what a collaborator is focused on. Velt adapts cursors to different screen sizes and content, so you do not position cursors yourself.

**Incorrect (one VeltCursor per container to "scope" cursors):**

```jsx
<div className="canvas-a"><VeltCursor /></div>
<div className="canvas-b"><VeltCursor /></div>
{/* Only the first velt-cursor in the DOM subscribes and renders; the second is inert.
    Placement does not confine cursors to the container. */}
```

**Correct (mount once, confine with allowedElementIds):**

```jsx
"use client";
import { VeltProvider, VeltPresence, VeltCursor } from "@veltdev/react";
import ReactFlow from "reactflow";

function FlowEditor({ nodes, edges, authProvider }) {
  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY} authProvider={authProvider}>
      <VeltCursor allowedElementIds={JSON.stringify(["flow-canvas"])} />
      <header className="toolbar">
        <VeltPresence />
      </header>
      <div id="flow-canvas" style={{ width: "100%", height: "100vh" }}>
        <ReactFlow nodes={nodes} edges={edges} fitView />
      </div>
    </VeltProvider>
  );
}
```

**Other Frameworks:**

```html
<body>
  <velt-cursor allowed-element-ids='["flow-canvas"]'></velt-cursor>
  <div id="flow-canvas"></div>
</body>
```

**When NOT to use VeltCursor:**

- **Text editors (TipTap, Lexical, CodeMirror, BlockNote, etc.):** text carets come from the editor's CRDT collaboration binding, not `VeltCursor`. `VeltCursor` shows mouse pointers, not text carets. See `velt-crdt-best-practices`.
- **Non-spatial UIs:** in forms and lists, mouse cursors add noise without useful information.

**Key patterns:**

- Mount `VeltCursor` once; duplicate instances are inert
- `allowedElementIds` takes a JSON-stringified array on the component; the API method `allowedElementIds([...])` takes a plain array
- Cursors are scoped to the root document set by `setDocuments`
- Cursors show the user's name by default; set `avatarMode={true}` to show avatars
- Your own cursor is not rendered back to you

### Verification Checklist

- [ ] `VeltCursor` is inside `VeltProvider` with a valid `authProvider`
- [ ] `setDocuments` has been called to scope cursors to the correct document
- [ ] Only one `VeltCursor` is mounted
- [ ] `allowedElementIds` is used (stringified) when cursors should be limited to a region
- [ ] For text editors, CRDT bindings are used instead of `VeltCursor`
- [ ] Tested with two browsers and two different users

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/cursors/setup - "Cursors Setup"
- https://docs.velt.dev/realtime-collaboration/cursors/customize-behavior#allowedelementids - "allowedElementIds"
- https://docs.velt.dev/ui-customization/reference/behaviors/presence-reactions - "VeltCursor" default behaviors
