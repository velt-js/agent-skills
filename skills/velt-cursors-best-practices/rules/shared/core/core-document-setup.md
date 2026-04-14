---
title: Scope Cursors with setDocuments
impact: CRITICAL
impactDescription: Without setDocuments, cursors from ALL documents appear together
tags: documents, setDocuments, scope, useSetDocuments, cursor-scope
---

## Scope Cursors to the Current Document

You must call `setDocuments` (or use the `useSetDocuments` hook) to scope cursors to a specific document. Without it, cursors from every active user across your entire application will appear, regardless of which document they are viewing.

**Why this matters:**

If you skip document scoping, a user editing "Canvas A" will see cursors from users working on "Canvas B" and every other document. This creates visual chaos, confusion about who is working where, and defeats the purpose of collaborative cursor tracking.

**Important rules:**

- Call `useSetDocuments` in a child component of `VeltProvider`, never in the same component
- Wait until the current user is authenticated before setting documents
- Update the document ID whenever the user navigates to a different document

**React: useSetDocuments with auth check**

```jsx
"use client";
import { useSetDocuments, useCurrentUser } from "@veltdev/react";

function DocumentScope({ documentId }) {
  const currentUser = useCurrentUser();

  useSetDocuments(
    currentUser ? [{ documentId, metadata: {} }] : null
  );

  return null;
}
```

**React: Full layout with document scoping and cursors**

```jsx
"use client";
import { VeltProvider, VeltCursor } from "@veltdev/react";

function App({ documentId, authProvider }) {
  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY} authProvider={authProvider}>
      <DocumentScope documentId={documentId} />
      <main className="canvas">
        <VeltCursor />
        {/* Canvas content */}
      </main>
    </VeltProvider>
  );
}
```

**HTML / Vanilla JS:**

```javascript
const client = await Velt.init("YOUR_API_KEY");
// After authentication completes:
client.setDocuments([{ documentId: "canvas-42", metadata: {} }]);
```

**Common mistakes to avoid (do not do these):**

- Calling `useSetDocuments` inside the same component that renders `VeltProvider` -- the hook requires `VeltProvider` context to be available as a parent
- Setting the document before the user is authenticated -- cursors will not register correctly
- Forgetting to update the document ID on route changes -- stale document scope causes cross-document cursor leaks

**Verification:**
- [ ] `useSetDocuments` is called in a child component of `VeltProvider`
- [ ] Document ID is set only after `useCurrentUser` returns a valid user
- [ ] Document ID updates when the user navigates to a different document
- [ ] Cursors only show users viewing the same document
- [ ] No cross-document cursor leakage in multi-document apps

**Source Pointers:**
- `https://docs.velt.dev/documents/setup` - Document setup
- `https://docs.velt.dev/cursor/setup` - Cursor with documents
