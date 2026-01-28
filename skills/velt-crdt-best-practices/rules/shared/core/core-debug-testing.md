---
title: Test Collaboration with Multiple Browser Profiles
impact: LOW
impactDescription: Catches sync issues before production
tags: testing, collaboration, multi-user, debugging
---

## Test Collaboration with Multiple Browser Profiles

Real-time collaboration must be tested with multiple authenticated users. Use different browser profiles to test with separate user identities on the same machine.

**Test Setup:**

1. Open app in Browser Profile A, authenticate as User A
2. Open same app/page in Browser Profile B, authenticate as User B
3. Both users must have the same document context

**What to Verify:**

| Behavior | Expected Result |
|----------|-----------------|
| User A edits | Changes appear for User B |
| User B edits | Changes appear for User A |
| Concurrent edits | Merge without data loss |
| Offline then online | Changes sync on reconnect |

**Incorrect (same user in multiple tabs):**

```
// This doesn't test true multi-user collaboration
Tab 1: User A on document-1
Tab 2: User A on document-1  // Same session, not a real test
```

**Correct (different users in different profiles):**

```
Profile 1 (Chrome): User A (alice@example.com) on document-1
Profile 2 (Chrome Guest): User B (bob@example.com) on document-1
```

**Common Testing Issues:**

| Issue | Cause | Fix |
|-------|-------|-----|
| Cursors not appearing | Same user in both profiles | Use different authenticated users |
| Changes not syncing | Different documentId | Verify both use same document context |
| Editor not loading | API key invalid | Check console for Velt errors |
| Content desynced | Editor history conflict | Disable editor's built-in history |

**Verification:**
- [ ] Two different users authenticated in separate browser profiles
- [ ] Both users see the same document/editorId
- [ ] Edits from User A appear for User B within expected latency
- [ ] Collaboration cursors/carets show correct user info
- [ ] No console errors related to sync

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (## Testing and Debugging)
