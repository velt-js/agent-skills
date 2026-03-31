---
title: Use Folders for Hierarchical Document Organization
impact: MEDIUM
impactDescription: Enables structured document management with inherited permissions
tags: folders, folderId, setDocuments, fetchFolders, organization, hierarchy
---

## Use Folders for Hierarchical Document Organization

Folders group documents hierarchically, like a file system. Folders inherit permissions from their organization, and all folder users get access to all folder resources (subfolders, documents, locations, contacts). Use the `folderId` option in `setDocuments` to subscribe to folder-scoped documents.

**Incorrect (no folder organization - flat document list):**

```jsx
// All documents at the same level, no grouping
setDocuments([
  { id: "project-a-doc-1", metadata: { documentName: "Doc 1" } },
  { id: "project-a-doc-2", metadata: { documentName: "Doc 2" } },
  { id: "project-b-doc-1", metadata: { documentName: "Doc 3" } },
]);
```

**Correct (folder-scoped document subscription):**

```jsx
import { useSetDocuments } from "@veltdev/react";

function FolderDocuments({ folderId }) {
  const { setDocuments } = useSetDocuments();

  useEffect(() => {
    // Subscribe to all documents in a folder (limit: 50)
    setDocuments(
      [{ id: "root-doc", metadata: { documentName: "Root Document" } }],
      { folderId: folderId, allDocuments: true }
    );
  }, [folderId, setDocuments]);

  return null;
}
```

```jsx
// Subscribe to specific documents in a folder (limit: 30)
setDocuments(
  [
    { id: "doc-1", metadata: { documentName: "Document 1" } },
    { id: "doc-2", metadata: { documentName: "Document 2" } },
  ],
  { folderId: "folder1" }
);
```

**Fetching Folder Metadata:**

```jsx
// Get all folders for an organization
const folderMetadata = await client.fetchFolders({
  organizationId: "org-1",
});

// Get a specific folder with its subfolders
const folderMetadata = await client.fetchFolders({
  organizationId: "org-1",
  folderId: "folder1",
});

console.log(folderMetadata);
// { data: { folder1: { ... } }, nextPageToken: '...' }
```

**Non-React Frameworks:**

```javascript
// Subscribe to folder with all documents
await Velt.setDocuments(
  [{ id: "root-doc", metadata: { documentName: "Root Document" } }],
  { folderId: "folder1", allDocuments: true }
);

// Fetch folder metadata
const folderMetadata = await Velt.fetchFolders({
  organizationId: "org-1",
});
```

**Folder REST APIs:**
- Create folder: [Add Folder API](https://docs.velt.dev/api-reference/rest-apis/v2/folders/add-folder)
- Update folder: [Update Folder API](https://docs.velt.dev/api-reference/rest-apis/v2/folders/update-folder)
- Move documents: [Move Documents API](https://docs.velt.dev/api-reference/rest-apis/v2/documents/move-documents)
- Delete folder: [Delete Folder API](https://docs.velt.dev/api-reference/rest-apis/v2/folders/delete-folder)

**Verification:**
- [ ] `folderId` is passed in `setDocuments` options when using folders
- [ ] `allDocuments: true` used when subscribing to all folder docs (max 50)
- [ ] Specific document lists limited to 30 per `setDocuments` call
- [ ] `fetchFolders` used with `organizationId` for folder metadata

**Source Pointers:**
- `https://docs.velt.dev/key-concepts/overview` - Folders
