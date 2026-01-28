---
title: Test Tiptap Collaboration with Multiple Users
impact: LOW
impactDescription: Validates collaboration works correctly
tags: tiptap, testing, collaboration, debug
---

## Test Tiptap Collaboration with Multiple Users

Test Tiptap collaboration by opening the same page with different authenticated users in separate browser profiles.

**Test Procedure:**

1. Open app in Browser Profile A, login as User A
2. Open same page in Browser Profile B, login as User B
3. Both must have same document context (same URL/editorId)

**What to Verify:**

| Test | Expected |
|------|----------|
| User A types | Text appears for User B |
| User B types | Text appears for User A |
| Both type simultaneously | Text merges correctly |
| Check cursors | User A sees User B's cursor |

**Common Issues & Fixes:**

| Issue | Cause | Fix |
|-------|-------|-----|
| Cursors not appearing | Same user in both profiles | Use different users |
| | Missing cursor CSS | Add collaboration cursor styles |
| Editor not loading | Velt not initialized | Check VeltProvider/API key |
| Content desynced | History not disabled | Set `history: false` |
| Changes not syncing | Different editorId | Verify both use same editorId |

**Debug with Console:**

```js
// Check store state
window.VeltCrdtStoreMap.get('your-editor-id').getValue();

// Monitor changes
window.VeltCrdtStoreMap.get('your-editor-id').subscribe(v => console.log(v));
```

**Verification:**
- [ ] Two different authenticated users
- [ ] Both on same editorId
- [ ] Cursors visible for remote users
- [ ] Text syncs bidirectionally
- [ ] No console errors

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (## Testing and Debugging)
