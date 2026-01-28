---
title: Test ReactFlow Collaboration with Multiple Users
impact: LOW
impactDescription: Validates collaboration works correctly
tags: reactflow, testing, collaboration
---

## Test ReactFlow Collaboration with Multiple Users

Test ReactFlow collaboration using different authenticated users in separate browser profiles.

**Test Procedure:**

1. Open app in Browser Profile A, login as User A
2. Open same page in Browser Profile B, login as User B
3. Both must have same editorId

**What to Verify:**

| Test | Expected |
|------|----------|
| User A moves node | Node moves for User B |
| User B creates connection | Edge appears for User A |
| Both edit simultaneously | Changes merge correctly |

**Common Issues:**

| Issue | Fix |
|-------|-----|
| Nodes not syncing | Check editorId matches |
| | Verify Velt client initialized |
| No updates on connect | Use CRDT handlers, not local state |
| Diagram not loading | Check API key and VeltProvider |

**Debug with Console:**

```js
// Check current nodes/edges
window.VeltCrdtStoreMap.get('your-diagram-id').getValue();
```

**Verification:**
- [ ] Two different authenticated users
- [ ] Same editorId on both
- [ ] Node/edge changes sync both directions
- [ ] No console errors

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/reactflow` (## Testing and Debugging)
