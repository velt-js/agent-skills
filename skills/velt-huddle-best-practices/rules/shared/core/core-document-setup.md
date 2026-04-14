---
title: Scope Huddle with setDocuments
impact: CRITICAL
impactDescription: Without setDocuments, huddle is scoped to root document across all pages
tags: documents, setDocuments, scope, useSetDocuments, huddle-scope
---

## Scope Huddle to the Current Document

You must call `setDocuments` (or use the `useSetDocuments` hook) to scope the huddle to a specific document. Without it, the huddle is scoped to the root document, meaning all users across all pages of your application will be in the same huddle context.

**Why this matters:**

If you skip document scoping, starting a huddle on "Project Alpha" will pull in users viewing "Project Beta" and every other page. This creates confusion and defeats per-document collaboration. Huddle sessions should be isolated to the document or page context where they are initiated.

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

**React: Full layout with document scoping and huddle**

```jsx
"use client";
import { VeltProvider, VeltHuddle, VeltHuddleTool, VeltPresence } from "@veltdev/react";

function App({ documentId, authProvider }) {
  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY} authProvider={authProvider}>
      <VeltHuddle />
      <DocumentScope documentId={documentId} />
      <header>
        <VeltPresence />
        <VeltHuddleTool type="all" />
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
client.setDocuments([{ documentId: "project-alpha", metadata: {} }]);
```

**Common mistakes to avoid (do not do these):**

- Calling `useSetDocuments` inside the same component that renders `VeltProvider` — the hook requires `VeltProvider` context to be available as a parent
- Setting the document before the user is authenticated — huddle will not register correctly
- Forgetting to update the document ID on route changes — stale document scope causes cross-document huddle leaks

**Verification:**
- [ ] `useSetDocuments` is called in a child component of `VeltProvider`
- [ ] Document ID is set only after `useCurrentUser` returns a valid user
- [ ] Document ID updates when the user navigates to a different document
- [ ] Huddle sessions are isolated to the current document
- [ ] No cross-document huddle leakage in multi-document apps

**Source Pointers:**
- `https://docs.velt.dev/documents/setup` - Document setup
- `https://docs.velt.dev/huddle/setup` - Huddle setup guide
