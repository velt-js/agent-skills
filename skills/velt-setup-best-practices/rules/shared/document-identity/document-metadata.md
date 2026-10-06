---
title: Attach Metadata to Documents
impact: MEDIUM-HIGH
impactDescription: Metadata enables document names in UI and custom filtering
tags: metadata, documentname, setdocuments, customdata
---

## Attach Metadata to Documents

Document metadata allows you to store additional information like document names, which appear in Velt UI components. Metadata can also be used for filtering and organization.

**Incorrect (no metadata):**

```jsx
// Missing metadata - document name won't appear in UI
setDocuments([{ id: "doc-123" }]);

// In VeltCommentsSidebar, document shows as "doc-123" instead of friendly name
```

**Correct (with metadata):**

```jsx
setDocuments([
  {
    id: "doc-123",
    metadata: {
      documentName: "Q4 Marketing Plan",  // Shown in UI components
    },
  },
]);
```

**Full Metadata Example:**

```jsx
setDocuments([
  {
    id: "project-456",
    metadata: {
      // Standard field - used by Velt UI components
      documentName: "Website Redesign Project",

      // Custom fields - available for filtering/display
      projectType: "design",
      createdBy: "user-123",
      department: "marketing",
      priority: "high",
      createdAt: new Date().toISOString(),
    },
  },
]);
```

**Accessing Metadata:**

```jsx
// React: subscribe via the client (there is no useDocument hook)
import { useEffect, useState } from "react";
import { useVeltClient } from "@veltdev/react";

function DocumentHeader() {
  const { client } = useVeltClient();
  const [documentMetadata, setDocumentMetadata] = useState(null);

  useEffect(() => {
    if (!client) return;
    const subscription = client.getDocumentMetadata().subscribe(setDocumentMetadata);
    return () => subscription?.unsubscribe();
  }, [client]);

  return (
    <div>
      <h1>{documentMetadata?.documentName || "Untitled"}</h1>
      <span>Type: {documentMetadata?.projectType}</span>
    </div>
  );
}
```

```js
// Other frameworks
const subscription = Velt.getDocumentMetadata().subscribe((documentMetadata) => {
  console.log("Current document metadata:", documentMetadata);
});
subscription?.unsubscribe();
```

To read or update metadata for documents that are not currently subscribed, use `fetchDocuments()` and `updateDocuments()`.

**Metadata in Multi-Document Setup:**

```jsx
// Subscribe to multiple documents with different metadata
setDocuments([
  {
    id: "project-main",
    metadata: { documentName: "Main Project", type: "project" },
  },
  {
    id: "project-tasks",
    metadata: { documentName: "Task List", type: "tasks" },
  },
  {
    id: "project-notes",
    metadata: { documentName: "Team Notes", type: "notes" },
  },
]);
```

**Dynamic Metadata from Database:**

```jsx
// Fetch document info from your database
async function loadDocument(docId: string) {
  const doc = await db.documents.findById(docId);

  setDocuments([
    {
      id: docId,
      metadata: {
        documentName: doc.title,
        createdBy: doc.authorId,
        lastModified: doc.updatedAt,
        permissions: doc.permissions,
      },
    },
  ]);
}
```

**Where documentName Appears:**

| Component | Usage |
|-----------|-------|
| VeltCommentsSidebar | Shows document name in header |
| VeltNotificationPanel | References document in notifications |
| Comments API | Included in comment data responses |

**Metadata Best Practices:**

| Practice | Description |
|----------|-------------|
| Always set documentName | Makes UI more user-friendly |
| Use consistent field names | Enables filtering across documents |
| Store only necessary data | Metadata is synced to all users |
| Avoid sensitive information | Metadata is visible to all document users |

**Verification:**
- [ ] documentName is set for all documents
- [ ] Document names appear correctly in Velt UI components
- [ ] Custom metadata fields are readable via `getDocumentMetadata()`
- [ ] Metadata updates reflect in all connected clients

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 6: Initialize Document
- `https://docs.velt.dev/key-concepts/overview#get-document-metadata` - Get Document Metadata
- `https://docs.velt.dev/api-reference/sdk/models/data-models#documentmetadata` - DocumentMetadata
- `https://docs.velt.dev/api-reference/sdk/api/api-methods#updatedocuments` - updateDocuments()
