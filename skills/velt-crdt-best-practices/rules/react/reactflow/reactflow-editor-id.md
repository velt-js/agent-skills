---
title: Use Unique editorId for Each ReactFlow Diagram
impact: HIGH
impactDescription: Prevents diagram cross-contamination
tags: reactflow, editorId, unique
---

## Use Unique editorId for Each ReactFlow Diagram

Each ReactFlow diagram must have a unique `editorId`. Reusing IDs causes nodes/edges from different diagrams to merge incorrectly.

**Incorrect (same ID for different diagrams):**

```tsx
// Page 1
const hook1 = useVeltReactFlowCrdtExtension({ editorId: 'diagram' });

// Page 2 (different diagram)
const hook2 = useVeltReactFlowCrdtExtension({ editorId: 'diagram' });
// Nodes from both will merge!
```

**Correct (unique ID per diagram):**

```tsx
const { nodes, edges, ...handlers } = useVeltReactFlowCrdtExtension({
  editorId: `diagram-${diagramId}`,  // Unique per diagram
  initialNodes,
  initialEdges,
});
```

**EditorId Strategies:**

| Pattern | Example | Use Case |
|---------|---------|----------|
| Document-based | `diagram-${docId}` | Multiple diagrams |
| Feature-based | `main-flow`, `sidebar-flow` | Single-page app |
| Project-based | `project-${id}-flow` | Project management |

**Verification:**
- [ ] Each diagram has unique `editorId`
- [ ] ID consistent across page reloads
- [ ] Nodes don't appear in wrong diagrams

**Source Pointer:** `/docs/realtime-collaboration/crdt/setup/reactflow.mdx` (## Notes > **Unique editorId**)
