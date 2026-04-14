---
title: Troubleshoot Common Cursor Issues
impact: LOW-MEDIUM
impactDescription: Quick fixes for frequent cursor problems
tags: debug, troubleshooting, common-issues, cursor-problems, fixes
---

## Troubleshoot Common Cursor Issues

A checklist of frequent problems and their solutions when working with Velt Cursors.

**Issue 1: Cursors not showing**

Check the following in order:
- `VeltProvider` has valid `apiKey` and `authProvider` props
- `authProvider.getAuthToken` returns a valid JWT
- `useSetDocuments` is called with a document ID in a child of `VeltProvider`
- `VeltCursor` is rendered inside the component tree (within `VeltProvider`)
- For Next.js, ensure `'use client'` directive is present on cursor components
- Domain is safelisted in the Velt Console
- Test with two browser tabs using different users

**Issue 2: Cursors showing from other documents (cross-document leakage)**

- `setDocuments` is not called or is called with a stale document ID
- Ensure document ID updates on route changes
- Verify `useSetDocuments` waits for `useCurrentUser` to return a valid user before setting documents

**Issue 3: Cursors appearing in wrong areas (toolbar, sidebar)**

- Use `allowedElementIds` to restrict cursors to the collaborative content area
- Ensure the target element `id` attributes exist in the DOM
- Remember: the component prop takes a JSON string (`JSON.stringify([...])`) not a plain array

**Issue 4: Cursor disappears too quickly**

- Check `inactivityTime` setting (default is 300000ms / 5 minutes)
- Tab unfocus hides cursors immediately -- this is expected behavior
- Increase `inactivityTime` for document-style apps where users read more than they interact
- Example: `<VeltCursor inactivityTime={600000} />` for 10-minute timeout

**Issue 5: allowedElementIds not working**

- The component prop must receive a JSON string, not a JavaScript array
- Correct: `allowedElementIds={JSON.stringify(["canvas-id"])}`
- The API method accepts a regular array: `cursorElement.allowedElementIds(["canvas-id"])`
- Verify the element IDs match actual DOM `id` attributes (case-sensitive)
- Ensure the elements are rendered in the DOM before cursor initialization

**Debugging checklist:**

```
1. VeltProvider renders with valid apiKey and authProvider
2. authProvider.getAuthToken returns a JWT
3. useSetDocuments called with document ID (in child component)
4. useCurrentUser returns a valid user before setDocuments
5. VeltCursor is rendered inside VeltProvider tree
6. 'use client' directive present (Next.js)
7. Domain safelisted in Velt Console
8. allowedElementIds uses JSON.stringify (if set)
9. Target element IDs exist in DOM
10. Tested with two browser tabs / different users
11. Check browser console for Velt SDK errors
```

**Verification:**
- [ ] All items in the debugging checklist pass
- [ ] Cursors render for multiple users on the same document
- [ ] Cursors are scoped to the correct document
- [ ] Cursors appear only in the intended content area

**Source Pointers:**
- `https://docs.velt.dev/cursor/setup` - Cursor setup
- `https://docs.velt.dev/cursor/customize-behavior/allowed-element-ids` - Allowed elements
- `https://docs.velt.dev/documents/setup` - Document scoping
