---
title: Work with Comment Annotations Data
impact: MEDIUM
impactDescription: Retrieve and manipulate comment annotation objects
tags: annotations, data, usecommentannotations, getallcommentannotations, api
---

## Work with Comment Annotations Data

Comment Annotations are the data objects representing comments. Access them for custom rendering, filtering, or integration with your application.

**React Hooks:**

```jsx
import { useCommentAnnotations } from '@veltdev/react';

function CommentsList() {
  const commentAnnotations = useCommentAnnotations();

  return (
    <div>
      {commentAnnotations?.map((annotation) => (
        <div key={annotation.annotationId}>
          <p>Comment ID: {annotation.annotationId}</p>
          <p>Document ID: {annotation.documentId}</p>
          <p>Context: {JSON.stringify(annotation.context)}</p>
        </div>
      ))}
    </div>
  );
}
```

**API Method (Non-React):**

```jsx
const { client } = useVeltClient();

useEffect(() => {
  if (client) {
    const commentElement = client.getCommentElement();
    const subscription = commentElement.getAllCommentAnnotations().subscribe(
      (annotations) => {
        console.log('Annotations:', annotations);
      }
    );

    return () => subscription.unsubscribe();
  }
}, [client]);
```

**CommentAnnotation Object Structure:**

```typescript
interface CommentAnnotation {
  annotationId: string;      // Unique identifier
  documentId: string;        // Document this belongs to
  location: object;          // Location data
  targetElementId: string;   // Target DOM element ID
  context: object;           // Custom metadata
  comments: Comment[];       // Array of comment messages
  // ... other fields
}
```

**Get Specific Annotation:**

```jsx
// By annotation ID
const annotation = commentAnnotations?.find(
  (a) => a.annotationId === 'specific-id'
);

// By target element
const elementAnnotations = commentAnnotations?.filter(
  (a) => a.targetElementId === 'my-element-id'
);
```

**Add Comment Annotation Programmatically:**

```jsx
const { client } = useVeltClient();

const addAnnotation = () => {
  const commentElement = client.getCommentElement();
  commentElement.addCommentAnnotation({
    targetElementId: 'element-id',
    context: { custom: 'data' }
  });
};
```

**Batched Annotation Counts (v5.0.0-beta.10+):**

```jsx
const commentElement = client.getCommentElement();

// Get counts across multiple documents efficiently (80% more efficient)
commentElement.getCommentAnnotationsCount({
  documentIds: ['doc-1', 'doc-2', 'doc-3'],
  batchedPerDocument: true
}).subscribe((result) => {
  // result.data: { "doc-1": { total: 10, unread: 2 }, "doc-2": { total: 15, unread: 5 } }
  console.log(result.data);
});
```

**Hooks Available:**

| Hook | Description |
|------|-------------|
| `useCommentAnnotations()` | Get all annotations |
| `useAddCommentAnnotation()` | Add new annotation |
| `useCommentModeState()` | Get comment mode status |

**Verification Checklist:**
- [ ] useCommentAnnotations returns array
- [ ] Annotations have expected structure
- [ ] Subscription cleaned up on unmount
- [ ] Filtering works with annotation properties

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior - "getCommentAnnotations"
- https://docs.velt.dev/api-reference/sdk/api/react-hooks - Hook documentation
