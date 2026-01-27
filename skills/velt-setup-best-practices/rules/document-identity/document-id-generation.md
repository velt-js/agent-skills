---
title: Generate and Manage Document IDs
impact: CRITICAL
impactDescription: Document ID determines which users see the same collaborative content
tags: documentid, generation, url, localstorage, shareable
---

## Generate and Manage Document IDs

The document ID uniquely identifies a collaborative space. All users with the same document ID will see the same comments, presence, and collaboration data. Choose a strategy that makes documents shareable.

**Incorrect (random on every page load):**

```jsx
// Wrong: New ID every time - no collaboration possible
const documentId = Math.random().toString(36);

useSetDocument(documentId);  // Each user gets their own space
```

**Incorrect (hardcoded single value):**

```jsx
// Wrong: All users share one document
const documentId = "my-app-document";

useSetDocument(documentId);  // Everyone collaborates on the same doc
```

**Correct (URL-based with persistence):**

```jsx
// app/document/useCurrentDocument.ts
"use client";
import { useState, useEffect, useRef, useMemo } from "react";

interface CurrentDocument {
  documentId: string | null;
  documentName: string;
}

export function useCurrentDocument(): CurrentDocument {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;

    // 1. Check URL for documentId parameter first (enables sharing)
    const urlParams = new URLSearchParams(window.location.search);
    let docId = urlParams.get("documentId");

    if (docId) {
      // URL has documentId - use it and persist
      setDocumentId(docId);
      localStorage.setItem("app-document-id", docId);
    } else {
      // 2. Check localStorage for existing document
      const stored = localStorage.getItem("app-document-id");
      if (stored) {
        docId = stored;
      } else {
        // 3. Generate new document ID
        docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem("app-document-id", docId);
      }

      // Update URL with documentId for shareability
      const newUrl = `${window.location.pathname}?documentId=${docId}`;
      window.history.replaceState({}, "", newUrl);

      setDocumentId(docId);
    }

    isInitialized.current = true;
  }, []);

  return useMemo(
    () => ({
      documentId,
      documentName: "My Collaborative Document",
    }),
    [documentId]
  );
}
```

**Document ID Strategies:**

| Strategy | Use Case | Example |
|----------|----------|---------|
| URL Parameter | Shareable links | `?documentId=doc-abc123` |
| Route Path | Resource-based | `/projects/123/editor` → doc ID: `project-123` |
| Database Record | Persistent docs | Doc ID from your database |
| User-specific | Personal docs | `user-${userId}-draft` |

**Route-Based Pattern (Next.js):**

```jsx
// app/documents/[docId]/page.tsx
"use client";
import { useParams } from "next/navigation";
import { useSetDocument } from "@veltdev/react";

export default function DocumentPage() {
  const { docId } = useParams();

  // Document ID comes from URL route
  useSetDocument(docId as string, { documentName: `Document ${docId}` });

  return <div>Document content</div>;
}
```

**Database-Backed Pattern:**

```jsx
// When creating a new document in your app
async function createDocument(name: string) {
  // Create document in your database
  const doc = await db.documents.create({ name });

  // Return the database ID to use as Velt documentId
  return doc.id;  // e.g., "clx123abc..."
}

// When loading a document
function DocumentEditor({ documentId }) {
  useSetDocument(documentId);  // Use your database ID

  return <Editor />;
}
```

**Multi-Document Pattern (Different Surfaces):**

```jsx
// Different document IDs for different collaboration surfaces
function Dashboard() {
  const { projectId } = useParams();

  // Main project document
  useSetDocument(`project-${projectId}`, { documentName: "Project" });

  return (
    <div>
      {/* Comments on main content use project-${projectId} */}
      <ProjectContent />

      {/* Separate document for chat sidebar */}
      <ChatSidebar documentId={`project-${projectId}-chat`} />
    </div>
  );
}
```

**Verification:**
- [ ] Document ID is deterministic (same users get same ID)
- [ ] Document ID is shareable via URL
- [ ] Multiple tabs with same URL show same collaboration data
- [ ] Different documents have different IDs
- [ ] Document ID persists across page refreshes

**Source Pointers:**
- `/docs/get-started/quickstart.mdx` - "Step 6: Initialize Document" section
- `/sample-apps/apps/react/comments/tables/tanstack/single-tool/app/document/DocumentContext.tsx` - URL + localStorage pattern for document ID
