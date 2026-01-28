---
title: Test BlockNote Collaboration with Multiple Users
impact: LOW
impactDescription: Validates collaboration works correctly
tags: blocknote, testing, collaboration
---

## Test BlockNote Collaboration with Multiple Users

Test BlockNote collaboration using different authenticated users in separate browser profiles.

**Test Procedure:**

1. Open app in Browser Profile A, login as User A
2. Open same page in Browser Profile B, login as User B
3. Both must have same editorId

**What to Verify:**

| Test | Expected |
|------|----------|
| User A types | Text appears for User B |
| Both type simultaneously | Content merges correctly |
| Cursors | Remote user cursors visible |

**Common Issues:**

| Issue | Fix |
|-------|-----|
| Cursors not appearing | Use different authenticated users |
| Editor not loading | Check VeltProvider and API key |
| Content not syncing | Verify same editorId |

**Debug with Console:**

```js
window.VeltCrdtStoreMap.get('your-editor-id').getValue();
```

**Verification:**
- [ ] Two different authenticated users
- [ ] Same editorId on both
- [ ] Text syncs both directions
- [ ] No console errors

**Source Pointer:** `/docs/realtime-collaboration/crdt/setup/blocknote.mdx` (## Testing and Debugging)
