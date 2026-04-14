---
title: Scope Presence with setDocuments
impact: CRITICAL
impactDescription: Without setDocuments, presence shows users across all documents
tags: documents, setDocuments, scope, useSetDocuments, presence-scope
---

## Scope Presence to the Current Document

You must call `setDocuments` (or use the `useSetDocuments` hook) to scope presence to a specific document. Without it, presence will show every active user across your entire application, regardless of which document they are viewing.

**Why this matters:**

If you skip document scoping, a user editing "Invoice #42" will see avatars of users viewing "Invoice #99" and every other document. This creates confusion, false collaboration signals, and defeats the purpose of presence entirely.

**Important rules:**

- Call `useSetDocuments` in a child component of `VeltProvider`, never in the same component
- Wait until the current user is authenticated before setting documents
- Update the document ID whenever the user navigates to a different document

**React: useSetDocuments with auth check**

```jsx
"use client";
import { useSetDocuments, useCurrentUser } from "@veltdev/react";
import { useEffect } from "react";

function DocumentScope({ documentId }) {
  const currentUser = useCurrentUser();

  useSetDocuments(
    currentUser ? [{ documentId, metadata: {} }] : null
  );

  return null;
}
```

**React: Full layout with document scoping**

```jsx
"use client";
import { VeltProvider } from "@veltdev/react";
import { VeltPresence } from "@veltdev/react";

function App({ documentId, authProvider }) {
  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY} authProvider={authProvider}>
      <DocumentScope documentId={documentId} />
      <header>
        <VeltPresence />
      </header>
      <main>{/* Document content */}</main>
    </VeltProvider>
  );
}
```

**HTML / Vanilla JS:**

```javascript
const client = await Velt.init("YOUR_API_KEY");
// After authentication completes:
client.setDocuments([{ documentId: "invoice-42", metadata: {} }]);
```

**Common mistakes to avoid (do not do these):**

- Calling `useSetDocuments` inside the same component that renders `VeltProvider` — the hook requires `VeltProvider` context to be available as a parent
- Setting the document before the user is authenticated — presence will not register correctly
- Forgetting to update the document ID on route changes — stale document scope causes cross-document presence leaks

**Verification:**
- [ ] `useSetDocuments` is called in a child component of `VeltProvider`
- [ ] Document ID is set only after `useCurrentUser` returns a valid user
- [ ] Document ID updates when the user navigates to a different document
- [ ] Presence avatars only show users viewing the same document
- [ ] No cross-document presence leakage in multi-document apps

**Source Pointers:**
- `https://docs.velt.dev/documents/setup` - Document setup
- `https://docs.velt.dev/presence/setup` - Presence with documents
