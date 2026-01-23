---
title: Use CRDT Handlers for Node and Edge Changes
impact: CRITICAL
impactDescription: Required for changes to sync to collaborators
tags: reactflow, handlers, onNodesChange, onEdgesChange, onConnect
---

## Use CRDT Handlers for Node and Edge Changes

Always use the CRDT-aware handlers from the hook for all changes. Direct state mutations won't sync.

**Incorrect (bypassing CRDT handlers):**

```tsx
const { nodes, onNodesChange } = useVeltReactFlowCrdtExtension({ ... });

// Direct mutation - won't sync
const addNode = () => {
  nodes.push({ id: 'new', data: {}, position: { x: 0, y: 0 } });
};
```

**Correct (using CRDT handlers):**

```tsx
const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
  useVeltReactFlowCrdtExtension({ editorId: 'diagram-1', initialNodes, initialEdges });

// Add node using CRDT handler
const addNode = () => {
  const newNode = {
    id: `node-${Date.now()}`,
    position: { x: 100, y: 100 },
    data: { label: 'New Node' },
  };
  onNodesChange([{ type: 'add', item: newNode }]);
};

// Add edge using CRDT handler
const addEdge = (sourceId: string, targetId: string) => {
  const newEdge = {
    id: `edge-${Date.now()}`,
    source: sourceId,
    target: targetId,
  };
  onEdgesChange([{ type: 'add', item: newEdge }]);
};

// Pass handlers to ReactFlow
return (
  <ReactFlow
    nodes={nodes}
    edges={edges}
    onNodesChange={onNodesChange}
    onEdgesChange={onEdgesChange}
    onConnect={onConnect}
  />
);
```

**Handler Reference:**

| Handler | Purpose | Change Types |
|---------|---------|--------------|
| `onNodesChange` | Node add/update/remove | `add`, `remove`, `position`, `select`, etc. |
| `onEdgesChange` | Edge add/update/remove | `add`, `remove`, `select`, etc. |
| `onConnect` | New connections | Connection object |

**Verification:**
- [ ] All changes go through CRDT handlers
- [ ] No direct mutation of `nodes`/`edges` arrays
- [ ] Changes appear for collaborators

**Source Pointer:** `/docs/realtime-collaboration/crdt/setup/reactflow.mdx` (## Notes > **Use CRDT handlers**)
