---
title: Test CodeMirror Collaboration with Multiple Users
impact: LOW
impactDescription: Validates collaboration works correctly
tags: codemirror, testing, collaboration
---

## Test CodeMirror Collaboration with Multiple Users

Test CodeMirror collaboration using different authenticated users in separate browser profiles.

**Test Procedure:**

1. Open app in Browser Profile A, login as User A
2. Open same page in Browser Profile B, login as User B
3. Both must have same editorId

**What to Verify:**

| Test | Expected |
|------|----------|
| User A types code | Code appears for User B |
| Both type simultaneously | Code merges correctly |
| Cursors | Remote user cursors visible |
| Undo | Undoes own changes only |

**Common Issues:**

| Issue | Fix |
|-------|-----|
| Cursors not appearing | Use different authenticated users |
| Editor not loading | Check VeltProvider and API key |
| Content not syncing | Verify same editorId |
| Disconnected session | Check network connectivity |

**Debug with Console:**

```js
window.VeltCrdtStoreMap.get('your-editor-id').getValue();
```

**Verification:**
- [ ] Two different authenticated users
- [ ] Same editorId on both
- [ ] Code syncs both directions
- [ ] Cursors show for remote users

**Source Pointer:** `/docs/realtime-collaboration/crdt/setup/codemirror.mdx` (## Testing and Debugging)
