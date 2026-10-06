---
title: Scope Presence with setDocuments
impact: CRITICAL
impactDescription: Without a document set after login, presence has no document to attach to and users on different pages are not separated
tags: documents, setDocuments, useSetDocuments, useSetDocument, root-document, scope, presence-scope
---

## Scope Presence to the Current Document

Call `setDocuments` (React: the `setDocuments` function returned by `useSetDocuments()`) after the user is authenticated, and update it whenever the user navigates to a different document. Presence is scoped to the current document, so users viewing "Invoice #42" never see avatars of users "Invoice #99".

**Why this matters:**

You can subscribe to up to 30 documents at once, but realtime features like presence default to the **root document** (the first entry, or `rootDocumentId` in options). Pass the document the user is actually viewing first, or set `rootDocumentId`.

**Incorrect (wrong document key, set before login, not reactive to navigation):**

```jsx
// The document key is `id`, not `documentId`, and this runs before the user is authenticated.
const { setDocuments } = useSetDocuments();
setDocuments([{ documentId, metadata: {} }]);
```

**Correct (React / Next.js):**

```jsx
"use client";
import { useEffect } from "react";
import { useSetDocuments, useCurrentUser } from "@veltdev/react";

// Render this as a CHILD of VeltProvider, never in the component that renders VeltProvider
function DocumentScope({ documentId, documentName }) {
  const { setDocuments } = useSetDocuments();
  const veltUser = useCurrentUser();

  useEffect(() => {
    if (!veltUser || !documentId) return; // wait for authentication
    setDocuments([{ id: documentId, metadata: { documentName } }]);
  }, [veltUser, documentId, documentName, setDocuments]);

  return null;
}
```

**Correct (Other Frameworks):**

```js
// After Velt.init() and authentication complete
await Velt.setDocuments([
  { id: "invoice-42", metadata: { documentName: "Invoice #42" } },
]);
```

**Common mistakes to avoid:**

- Calling `useSetDocuments` in the same component that renders `VeltProvider` (the hook needs the provider as a parent)
- Using `documentId` as the key inside the document object (the key is `id`)
- Setting the document before the user is authenticated
- Forgetting to update the document on route changes, which leaves presence attached to the previous document
- Passing several documents and expecting presence to span all of them (it uses the root document only)

**Verification:**
- [ ] `setDocuments` is called from a child component of `VeltProvider` (or via `Velt.setDocuments`)
- [ ] Document objects use `{ id, metadata }`
- [ ] The document is set only after `useCurrentUser()` returns a user
- [ ] The document updates when the user navigates
- [ ] With multiple documents, the one the user is viewing is the root document

**Source Pointers:**
- https://docs.velt.dev/key-concepts/overview#subscribe-to-documents - "Subscribe to Documents"
- https://docs.velt.dev/api-reference/sdk/api/react-hooks#usesetdocuments - `useSetDocuments()`
- https://docs.velt.dev/realtime-collaboration/presence/setup - "Presence Setup"
