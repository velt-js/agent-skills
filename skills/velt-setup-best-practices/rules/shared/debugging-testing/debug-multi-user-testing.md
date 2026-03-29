---
title: Set Up Two-User Testing for Collaboration Features
impact: MEDIUM
impactDescription: Without two-user testing support, presence, cursors, and CRDT features cannot be verified
tags: testing, multi-user, presence, cursors, collaboration, demo
---

## Set Up Two-User Testing for Collaboration Features

Collaboration features (presence, cursors, CRDT sync, comments) require at least two users to test. The generated app must have a built-in mechanism for signing in as different users.

**Common pitfall — auto-login bypasses sign-in screen:**

```tsx
// WRONG: Defaults to user-1, sign-in page never renders
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const uid = params.get("user") || "user-1"; // Always logs in!
  const found = DEMO_USERS[uid];
  if (found) setUser(found);
}, []);

// CORRECT: Only login via explicit URL param or button click
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const uid = params.get("user"); // No default — sign-in page renders
  if (uid) {
    const found = DEMO_USERS[uid];
    if (found) setUser(found);
  }
}, []);
```

**Required sign-in page elements:**

```tsx
if (!isLoggedIn) {
  return (
    <div>
      <h1>Sign In</h1>
      <button onClick={() => login("user-1")}>Sign in as Alice</button>
      <button onClick={() => login("user-2")}>Sign in as Bob</button>
    </div>
  );
}
```

**Two-user testing workflow:**
1. Open `http://localhost:3000` — verify sign-in page renders (no auto-login)
2. Click "Sign in as Alice" — navigate to a document
3. Open a second browser tab at `http://localhost:3000`
4. Click "Sign in as Bob" — navigate to the same document
5. Verify both users' presence avatars are visible
6. Type in one tab — verify text appears in the other (CRDT sync)
7. Move cursor in one tab — verify thin caret appears in the other
8. Alternative shortcut: `http://localhost:3000?user=user-2` to skip sign-in

**URL parameter pattern for quick switching:**
- `?user=user-1` — sign in as Alice
- `?user=user-2` — sign in as Bob
- No param — show sign-in page

**Verification:**
- [ ] Sign-in page renders when no user is selected
- [ ] "Sign in as Alice" button works
- [ ] "Sign in as Bob" button exists and works
- [ ] Both users can see each other's presence avatars on same document
- [ ] Cursors appear as thin carets with name labels
- [ ] CRDT text sync works bidirectionally
- [ ] `?user=user-2` URL param logs in directly

**Source Pointer:** `https://docs.velt.dev/get-started/quickstart`
