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

**Using useSetDocument Hook (single document shorthand):**

```jsx
import { useSetDocument } from "@veltdev/react";

// Single document shorthand
useSetDocument("my-document-id", { documentName: "My Document" });
```

**Using useSetDocuments Hook (multi-document with options):**

```jsx
import { useSetDocuments } from "@veltdev/react";

function VeltInitializeDocument() {
  const { setDocuments } = useSetDocuments();

  useEffect(() => {
    // Basic usage
    setDocuments([
      { id: "doc-1", metadata: { documentName: "Document 1" } },
    ]);

    // With folder options
    setDocuments(
      [{ id: "doc-1", metadata: { documentName: "Document 1" } }],
      { folderId: "folder1", allDocuments: true }
    );
  }, [setDocuments]);

  return null;
}
```

**setDocuments API Reference:**

```typescript
// Method signature
client.setDocuments(documents: Document[], options?: SetDocumentsRequestOptions): Promise<void>;

// Document shape
interface Document {
  id: string;              // Required: unique document identifier
  metadata: {              // Document metadata
    documentName?: string;
    [key: string]: any;    // Custom metadata fields
  };
}

// SetDocumentsRequestOptions shape
interface SetDocumentsRequestOptions {
  folderId?: string;         // Folder to scope documents under
  allDocuments?: boolean;    // Subscribe to all docs in folder (limit: 50)
  organizationId?: string;   // Organization scope
  locationId?: string;       // Location scope
  rootDocumentId?: string;   // Root document ID
  context?: Record<string, any>; // Additional context
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

**Document Count Limits:**

| Scenario | Max Documents |
|----------|---------------|
| `setDocuments(docs)` (no folder) | 30 per call |
| `setDocuments(docs, { folderId, allDocuments: true })` | 50 (folder-wide) |

Documents exceeding the limit are silently dropped. When using `allDocuments: true`, inaccessible documents are silently filtered out rather than failing the entire operation.

**Key Rules:**

1. Call setDocuments AFTER user is authenticated (after setVeltAuthProvider)
2. Call setDocuments in a child component, not with VeltProvider
3. Document ID must be consistent for all users collaborating
4. Wait for useCurrentUser to return a value before setting document

**Verification:**
- [ ] setDocuments is called after user authentication
- [ ] setDocuments is in a child component of VeltProvider
- [ ] Document ID is consistent across sessions/users
- [ ] VeltComments or other features show content after setup
- [ ] No "document not found" errors in console

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 6: Initialize Document
