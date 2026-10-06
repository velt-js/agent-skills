---
title: Programmatic Annotation CRUD — Create, Query, Delete Threads
impact: HIGH
impactDescription: Required for programmatic comment thread management
tags: addCommentAnnotation, deleteCommentAnnotation, getCommentAnnotations, getCommentAnnotationById, getSelectedComments, fetchCommentAnnotations, getElementRefByAnnotationId, addCommentOnSelectedText, addCommentOnElement, deleteSelectedComment, getCommentAnnotationsCount, getUnreadCommentAnnotationCountByLocationId, useAddCommentAnnotation, useDeleteCommentAnnotation, useGetCommentAnnotations, useCommentAnnotationsCount, useCommentAnnotationById, useUnreadCommentAnnotationCountByLocationId
---

## Programmatic Annotation CRUD — Create, Query, Delete Threads

Create, query, and delete comment annotation threads without user interaction. Mutation hooks return an object containing the method (`const { addCommentAnnotation } = useAddCommentAnnotation()`), and subscription APIs emit response objects whose `data` is a map keyed by document ID.

**Incorrect (hook used as a function, flat request, wrong response shape):**

```jsx
const addAnnotation = useAddCommentAnnotation();          // returns { addCommentAnnotation }
await addAnnotation({ targetElementId: 'element-1' });    // request needs { annotation: {...} }

commentElement.getCommentAnnotationsCount().subscribe((count) => {
  console.log(count.total);                               // count lives under response.data[documentId]
});
```

**Correct (create and delete):**

```jsx
const addCommentAnnotationRequest = {
  annotation: {
    comments: [{ commentText: 'This is a comment', commentHtml: '<p>This is a comment</p>' }],
  },
};

// Hook
const { addCommentAnnotation } = useAddCommentAnnotation();
const addEvent = await addCommentAnnotation(addCommentAnnotationRequest);

const { deleteCommentAnnotation } = useDeleteCommentAnnotation();
await deleteCommentAnnotation({ annotationId: 'ANNOTATION_ID' });

// API Method
const commentElement = client.getCommentElement();
await commentElement.addCommentAnnotation(addCommentAnnotationRequest);
await commentElement.deleteCommentAnnotation({ annotationId: 'ANNOTATION_ID' });
commentElement.deleteSelectedComment();

// Comment on an element (or a text occurrence inside it)
commentElement.addCommentOnElement({
  targetElement: { elementId: 'element_id', targetText: 'target_text', occurrence: 1 },
  commentData: [{ commentText: 'This is awesome!', commentHtml: '<p>This is awesome!</p>' }],
});

// Comment on the current text selection (text mode)
commentElement.addCommentOnSelectedText();
```

The `addCommentAnnotation` event payload includes `isAssigneeChanged` (see `events-comment-lifecycle.md`).

**Correct (query):**

```jsx
// Realtime subscription; data is Record<documentId, CommentAnnotation[]>, null while loading
const { data } = useGetCommentAnnotations({ organizationId: 'org1', documentIds: ['doc1'] });

const subscription = commentElement
  .getCommentAnnotations({ documentIds: ['doc1'], statusIds: ['OPEN'] })
  .subscribe((response) => console.log(response?.data));
subscription?.unsubscribe();

// One-off paginated fetch (not realtime)
const { data: byDoc, nextPageToken } = await commentElement.fetchCommentAnnotations({
  organizationId: 'org1',
  documentIds: ['doc1', 'doc2'],
  pageSize: 50,
});

// Single annotation (subscription)
const annotation = useCommentAnnotationById({ annotationId: 'ANNOTATION_ID', documentId: 'doc1' });
commentElement.getCommentAnnotationById({ annotationId: 'ANNOTATION_ID' }).subscribe((a) => console.log(a));

// XPath of the DOM element the comment is attached to
const elementRef = commentElement.getElementRefByAnnotationId('ANNOTATION_ID');

// Currently selected annotations
commentElement.getSelectedComments().subscribe((selected) => console.log(selected));
```

**Correct (counts):**

```jsx
// Hook: data is Record<documentId, { total, unread }>, null while loading
const { data: counts } = useCommentAnnotationsCount({ documentIds: ['doc1', 'doc2'] });

// API Method
commentElement.getCommentAnnotationsCount({ aggregateDocuments: true }).subscribe((response) => {
  console.log(response.data);
});

// Annotations with at least one unread comment at a location
const unread = useUnreadCommentAnnotationCountByLocationId('locationId');
commentElement.getUnreadCommentAnnotationCountByLocationId('locationId').subscribe((c) => console.log(c));
```

With 2+ `documentIds`, count requests are auto-batched (tune with `debounceMs`, default 5000 ms). Set `filterGhostComments: true` to exclude ghost comments.

**CommentRequestQuery (getCommentAnnotations / getCommentAnnotationsCount):**

| Property | Type | Description |
|----------|------|-------------|
| `organizationId` | `string` | Filter by organization |
| `documentIds` | `string[]` | Documents to query (30 at a time for `getCommentAnnotations`) |
| `folderId` / `allDocuments` | `string` / `boolean` | Query a whole folder |
| `locationIds` / `locationId` | `string[]` / `string` | Filter by location |
| `statusIds` | `string[]` | Filter by status |
| `aggregateDocuments` | `boolean` | One combined count across documents |
| `batchedPerDocument` | `boolean` | Batched listener for large document lists |
| `debounceMs` | `number` | Auto-batching delay |
| `filterGhostComments` | `boolean` | Exclude ghost comments |
| `agentFields` | `string[]` | Agent-tagged annotations only (see `data-agent-fields-query.md`) |

`fetchCommentAnnotations()` takes `FetchCommentAnnotationsRequest`, which adds `createdAfter` / `createdBefore` / `updatedAfter` / `updatedBefore`, `order`, `pageSize`, and `pageToken`.

In Other Frameworks, call the same methods on `Velt.getCommentElement()`.

**Verification:**
- [ ] Mutation hooks destructured (`const { addCommentAnnotation } = useAddCommentAnnotation()`)
- [ ] `addCommentAnnotation()` request wraps the thread in `annotation: { comments: [...] }`
- [ ] Subscription responses read from `response.data[documentId]`, handling `null` while loading
- [ ] Subscriptions cleaned up on unmount

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#threads - Threads
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#getcommentannotationscount - getCommentAnnotationsCount
- https://docs.velt.dev/api-reference/sdk/models/data-models#commentrequestquery - CommentRequestQuery
- https://docs.velt.dev/api-reference/sdk/models/data-models#fetchcommentannotationsrequest - FetchCommentAnnotationsRequest
