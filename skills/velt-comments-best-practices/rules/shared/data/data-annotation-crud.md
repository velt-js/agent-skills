---
title: Programmatic Annotation CRUD — Create, Query, Delete Threads
impact: HIGH
impactDescription: Required for programmatic comment thread management
tags: addCommentAnnotation, deleteCommentAnnotation, getCommentAnnotations, getCommentAnnotationById, getSelectedComments, fetchCommentAnnotations, getElementRefByAnnotationId, addCommentOnSelectedText, addCommentOnElement, deleteSelectedComment, getCommentAnnotationsCount, getUnreadCommentAnnotationCountByLocationId, useDeleteCommentAnnotation, useGetCommentAnnotations, useCommentAnnotationsCount, useUnreadCommentAnnotationCountByLocationId
---

## Programmatic Annotation CRUD — Create, Query, Delete Threads

Use these methods to create, query, and delete comment annotation threads programmatically — without requiring user interaction with comment pins or tools.

**React Hooks:**

```tsx
import {
  useAddCommentAnnotation,
  useDeleteCommentAnnotation,
  useGetCommentAnnotations,
  useCommentAnnotationsCount,
  useUnreadCommentAnnotationCountByLocationId,
} from '@veltdev/react';

// Add annotation
const addAnnotation = useAddCommentAnnotation();
await addAnnotation({ targetElementId: 'element-1', context: { key: 'value' } });

// Delete annotation
const deleteAnnotation = useDeleteCommentAnnotation();
await deleteAnnotation({ annotationId: 'ann-123' });

// Query annotations with filters
const { data, loading } = useGetCommentAnnotations({
  documentIds: ['doc-1'],
  locationIds: [1, 2],
  statusIds: ['open'],
  pageSize: 50,
});

// Get annotation counts
const count = useCommentAnnotationsCount({
  organizationId: 'org-1',
  documentIds: ['doc-1'],
  filterGhostComments: true,
});
// Returns: { total: number, unread: number }

// Unread count by location
const unreadByLocation = useUnreadCommentAnnotationCountByLocationId({
  locationId: 1,
});
```

**API Methods (via getCommentElement()):**

```tsx
const commentElement = client.getCommentElement();

// Create annotation on specific element
commentElement.addCommentOnElement(targetElement, commentData, status);

// Create annotation on selected text
commentElement.addCommentOnSelectedText();

// Delete annotation by ID
commentElement.deleteCommentAnnotation({ annotationId: 'ann-123' });

// Delete currently selected comment
commentElement.deleteSelectedComment();

// Get single annotation by ID
const annotation = await commentElement.getCommentAnnotationById('ann-123');

// Get DOM element reference for annotation
const elementRef = commentElement.getElementRefByAnnotationId('ann-123');

// Get selected comments (subscription)
commentElement.getSelectedComments().subscribe((comments) => {
  console.log('Selected:', comments);
});

// Fetch annotations with server query
const result = await commentElement.fetchCommentAnnotations({
  documentIds: ['doc-1'],
  pageSize: 50,
});

// Query annotations (subscription)
commentElement.getCommentAnnotations({
  documentIds: ['doc-1'],
  locationIds: [1],
  statusIds: ['open'],
}).subscribe((annotations) => {
  console.log('Annotations:', annotations);
});

// Get count
commentElement.getCommentAnnotationsCount({
  organizationId: 'org-1',
}).subscribe((count) => {
  // count: { total: number, unread: number }
});

// Unread count by location
commentElement.getUnreadCommentAnnotationCountByLocationId(locationId)
  .subscribe((count) => {
    console.log('Unread at location:', count);
  });
```

**CommentRequestQuery (filter options for getCommentAnnotations/fetchCommentAnnotations):**

| Property | Type | Description |
|----------|------|-------------|
| `documentIds` | `string[]` | Filter by documents |
| `locationIds` | `number[]` | Filter by locations |
| `annotationIds` | `string[]` | Filter by specific annotations |
| `userIds` | `string[]` | Filter by users who created |
| `organizationId` | `string` | Filter by organization |
| `folderId` | `string` | Filter by folder |
| `statusIds` | `string[]` | Filter by status (e.g., 'open', 'resolved') |
| `updatedAfter` | `number` | Timestamp — annotations updated after |
| `updatedBefore` | `number` | Timestamp — annotations updated before |
| `createdAfter` | `number` | Timestamp — annotations created after |
| `createdBefore` | `number` | Timestamp — annotations created before |
| `pageSize` | `number` | Items per page |
| `pageToken` | `string` | Pagination token |
| `aggregateDocuments` | `boolean` | Aggregate across documents |
| `batchedPerDocument` | `boolean` | Batch results per document |
| `debounceMs` | `number` | Debounce subscription updates |

**Verification:**
- [ ] Correct hook imported from `@veltdev/react`
- [ ] Subscriptions cleaned up on unmount
- [ ] Filter options match query requirements
- [ ] Annotation IDs are valid strings

**Source Pointer:** https://docs.velt.dev/async-collaboration/comments/customize-behavior - Threads
