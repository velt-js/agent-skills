---
title: Initialize Documents with setDocuments API
impact: CRITICAL
impactDescription: SDK will not function without calling setDocuments
tags: setdocuments, setdocument, documentid, initialization, collaboration
---

## Initialize Documents with setDocuments API

The setDocuments method initializes collaborative spaces where users can interact. The SDK will NOT work without calling setDocuments - no comments, presence, or other features will function.

**Incorrect (missing setDocuments):**

```jsx
// Missing setDocuments - Velt features won't work
"use client";
import { VeltProvider, VeltComments } from "@veltdev/react";

export default function App() {
  return (
    <VeltProvider apiKey="YOUR_KEY" authProvider={authProvider}>
      <VeltComments />  {/* Won't work - no document set */}
      <div>My content</div>
    </VeltProvider>
  );
}
```

**Incorrect (setDocuments in same file as VeltProvider):**

```jsx
// Wrong: Don't call setDocuments in the same component as VeltProvider
"use client";
import { VeltProvider, useVeltClient } from "@veltdev/react";

export default function App() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (client) {
      client.setDocuments([{ id: "doc-123" }]);  // Won't work - client not ready
    }
  }, [client]);

  return <VeltProvider apiKey="YOUR_KEY">...</VeltProvider>;
}
```

**Correct (separate component):**

```jsx
// app/page.tsx
"use client";
import { VeltProvider } from "@veltdev/react";
import { VeltInitializeDocument } from "@/components/velt/VeltInitializeDocument";

export default function App() {
  return (
    <VeltProvider apiKey="YOUR_KEY" authProvider={authProvider}>
      <VeltInitializeDocument />
      {/* Your app content */}
    </VeltProvider>
  );
}
```

```jsx
// components/velt/VeltInitializeDocument.tsx
"use client";
import { useEffect } from "react";
import { useSetDocuments, useCurrentUser } from "@veltdev/react";
import { useCurrentDocument } from "@/app/document/useCurrentDocument";
import { useAppUser } from "@/app/userAuth/useAppUser";

export default function VeltInitializeDocument() {
  const { documentId, documentName } = useCurrentDocument();
  const { user } = useAppUser();

  // Get document setter hook
  const { setDocuments } = useSetDocuments();

  // Wait for Velt user to be authenticated before setting document
  const veltUser = useCurrentUser();

  // Set document in Velt. This is the resource where all Velt collaboration data will be scoped.
  useEffect(() => {
    if (!veltUser || !user || !documentId || !documentName) return;
    setDocuments([
      { id: documentId, metadata: { documentName: documentName } },
    ]);
  }, [veltUser, user, setDocuments, documentId, documentName]);

  return null;
}
```

**Using useSetDocument Hook (Alternative):**

```jsx
import { useSetDocument } from "@veltdev/react";

// Single document shorthand
useSetDocument("my-document-id", { documentName: "My Document" });
```

**setDocuments API Reference:**

```typescript
// Method signature
client.setDocuments(documents: Document[], options?: SetDocumentsRequestOptions): Promise<void>;

// Document shape
interface Document {
  id: string;                  // Unique document identifier
  metadata: {                  // Document metadata (documentName shows in Velt UI)
    documentName?: string;
    [key: string]: any;        // Custom metadata fields
  };
}

// Common SetDocumentsRequestOptions
interface SetDocumentsRequestOptions {
  organizationId?: string;     // Organization for the documents
  folderId?: string;           // Subscribe to documents in this folder
  allDocuments?: boolean;      // With folderId: subscribe to all documents in the folder
  locationId?: string;         // Filter to one location
  rootDocumentId?: string;     // Root document when several are subscribed
  context?: SetDocumentsContext; // Filter comments by Access Context fields
  debounceTime?: number;       // Per-call debounce override (ms)
  optimisticPermissions?: boolean; // false = wait for permission validation
}
```

`folderId` is an **option** (second argument), not a field on each document:

```jsx
// Wrong: folderId inside the document object is not part of the Document type
setDocuments([{ id: "doc-1", folderId: "folder-1", metadata: { documentName: "Doc 1" } }]);

// Correct: pass folderId in options
setDocuments(
  [{ id: "doc-1", metadata: { documentName: "Doc 1" } }],
  { folderId: "folder-1" }
);
```

**Behavior to rely on:**
- Up to 30 documents per call. The first document is the root document; cursors, presence, huddle, and live state sync use the root document, while comments, notifications, recorder, and reactions read and write across all subscribed documents.
- Documents the user cannot access are filtered out instead of failing the whole call. With `folderId` + `allDocuments: true`, up to 50 documents are retrieved.
- Since v6.0.5, an identical repeat call (same documents and options) is ignored, so calling `setDocuments()` on every render does not re-initialize documents or refetch comments. An identical repeat also does not refresh permissions. Calling it with a narrower set re-pins to just those documents.

**Folder context in permissions:** when you set `folderId`, Real-Time Permission Provider requests for `document` resources carry `resource.parentFolderId` (from `setDocuments`, `getNotifications`, and `setNotifications`). Only document requests carry it, and the key is omitted when the document has no folder, so check with `'parentFolderId' in resource`. It is context for your endpoint, never an input to Velt's own access decision.

```typescript
// PermissionQuery.resource shape (received by your Permission Provider)
{
  type: PermissionResourceType;
  id: string;
  source: PermissionSource;
  organizationId: string;
  context?: Context;
  parentFolderId?: string;   // only on document requests whose document has a folder
}
```

**Multiple Documents:**

```jsx
// Subscribe to multiple documents at once
setDocuments([
  { id: "doc-1", metadata: { documentName: "Document 1" } },
  { id: "doc-2", metadata: { documentName: "Document 2" } },
  { id: "doc-3", metadata: { documentName: "Document 3" } },
]);
```

**Angular/Vue/HTML Pattern:**

```javascript
// After initVelt() and setVeltAuthProvider()
await client.setDocuments([
  { id: "unique-document-id", metadata: { documentName: "My Document" } }
]);

// Or for HTML
await Velt.setDocuments([
  { id: "unique-document-id", metadata: { documentName: "My Document" } }
]);
```

**Key Rules:**

1. Call setDocuments AFTER user is authenticated (after authProvider / setVeltAuthProvider)
2. Call setDocuments in a child component, not with VeltProvider
3. Document ID must be consistent for all users collaborating
4. Wait for useCurrentUser to return a value before setting document

**Verification:**
- [ ] setDocuments is called after user authentication
- [ ] setDocuments is in a child component of VeltProvider
- [ ] Document ID is consistent across sessions/users
- [ ] VeltComments or other features show content after setup
- [ ] No "document not found" errors in console
- [ ] `folderId` is passed in the options argument, not inside a document object
- [ ] No more than 30 documents per call

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 6: Initialize Document
- `https://docs.velt.dev/key-concepts/overview#subscribe-to-documents` - Subscribe to Documents (options, 30-document limit, root document)
- `https://docs.velt.dev/key-concepts/overview#subscribe-to-a-folder` - Subscribe to a folder
- `https://docs.velt.dev/api-reference/sdk/api/api-methods#setdocuments` - setDocuments() behavior updates
- `https://docs.velt.dev/api-reference/sdk/models/data-models#setdocumentsrequestoptions` - SetDocumentsRequestOptions
- `https://docs.velt.dev/key-concepts/overview#c-real-time-permission-provider` - Folder context on document requests
