---
title: Install ReactFlow CRDT Package
impact: CRITICAL
impactDescription: Required for ReactFlow collaboration
tags: reactflow, installation, packages, npm
---

## Install ReactFlow CRDT Package

Install the Velt ReactFlow CRDT package for collaborative diagram editing.

**Correct:**

```bash
npm install @veltdev/reactflow-crdt @veltdev/react
```

**Package Reference:**

| Package | Purpose |
|---------|---------|
| `@veltdev/reactflow-crdt` | React Flow CRDT integration |
| `@veltdev/react` | Velt React provider |
| `@xyflow/react` | React Flow library |

**Note:** ReactFlow CRDT is React-only. Non-React support is not documented.

**Verification:**
- [ ] Packages in package.json
- [ ] No peer dependency warnings
- [ ] Imports resolve without errors

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/reactflow` (### Step 1: Install Dependencies)
