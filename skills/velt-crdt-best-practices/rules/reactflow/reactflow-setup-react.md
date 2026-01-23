---
title: Use useVeltReactFlowCrdtExtension for Collaborative Diagrams
impact: CRITICAL
impactDescription: Required for ReactFlow CRDT
tags: reactflow, react, hook, collaboration
---

## Use useVeltReactFlowCrdtExtension for Collaborative Diagrams

Use `useVeltReactFlowCrdtExtension` to get CRDT-synced `nodes`, `edges`, and handlers for ReactFlow.

**Incorrect (not using CRDT-aware state):**

```tsx
import { ReactFlow, useNodesState, useEdgesState } from '@xyflow/react';

function Diagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Local state only - won't sync with collaborators
  return <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} />;
}
```

**Correct (using CRDT hook):**

```tsx
import { Background, ReactFlow, ReactFlowProvider } from '@xyflow/react';
import { useVeltReactFlowCrdtExtension } from '@veltdev/reactflow-crdt';
import '@xyflow/react/dist/style.css';

const initialNodes = [
  { id: '1', data: { label: 'Start' }, position: { x: 0, y: 0 } }
];
const initialEdges = [];

function CollaborativeDiagram() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useVeltReactFlowCrdtExtension({
      editorId: 'YOUR_EDITOR_ID',
      initialNodes,
      initialEdges,
    });

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
    >
      <Background />
    </ReactFlow>
  );
}

// Wrap with ReactFlowProvider
function App() {
  return (
    <ReactFlowProvider>
      <CollaborativeDiagram />
    </ReactFlowProvider>
  );
}
```

**Hook Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `editorId` | string | Unique identifier for this diagram |
| `initialNodes` | Node[] | Initial nodes array |
| `initialEdges` | Edge[] | Initial edges array |
| `debounceMs` | number (optional) | Debounce time for sync |

**Hook Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `nodes` | Node[] | CRDT-synced nodes |
| `edges` | Edge[] | CRDT-synced edges |
| `onNodesChange` | function | CRDT-aware node change handler |
| `onEdgesChange` | function | CRDT-aware edge change handler |
| `onConnect` | function | CRDT-aware connection handler |
| `setNodes` | function | Imperative node setter |
| `setEdges` | function | Imperative edge setter |
| `store` | Store \| null | Underlying CRDT store |

**Verification:**
- [ ] Using hook's `nodes`/`edges`, not local state
- [ ] All handlers from hook passed to ReactFlow
- [ ] Wrapped in ReactFlowProvider
- [ ] Unique `editorId` provided

**Source Pointer:** `/docs/realtime-collaboration/crdt/setup/reactflow.mdx` (### Step 3: Initialize Velt CRDT Extension)
