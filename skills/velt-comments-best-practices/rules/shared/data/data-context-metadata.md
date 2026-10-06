---
title: Add Custom Metadata to Comments with Context
impact: MEDIUM
impactDescription: Attach custom data for filtering, grouping, and processing
tags: context, metadata, custom-data, filtering, grouping
---

## Add Custom Metadata to Comments with Context

Add custom metadata (context) to comments for filtering, grouping, rendering, and notification processing.

**Use Cases:**
- Filter comments by category, status, or custom fields
- Group comments by section, element type, etc.
- Pass data to notification processors
- Store position data for manual comment pins

**Method 1: Via Comment Tool**

```jsx
<VeltCommentTool
  targetElementId="element-id"
  context={{
    category: 'feedback',
    section: 'header',
    priority: 'high',
    customField: 'value'
  }}
/>
```

**Method 2: Via the addCommentAnnotation event (using addContext)**

`addContext()` is available on the `addCommentAnnotation` and `addCommentAnnotationDraft` events. The legacy `onCommentAdd` prop still works but is listed under Legacy Methods.

```jsx
// Hook
const addEvent = useCommentEventCallback('addCommentAnnotation');
useEffect(() => {
  if (addEvent) {
    addEvent.addContext({ timestamp: Date.now(), pageSection: 'main-content' });
  }
}, [addEvent]);

// API Method
const commentElement = client.getCommentElement();
const subscription = commentElement.on('addCommentAnnotation').subscribe((event) => {
  event.addContext({ pageSection: 'main-content' });
});
subscription?.unsubscribe();
```

**Method 3: Via addManualComment API**

```jsx
const { client } = useVeltClient();

const addCommentWithMetadata = () => {
  const commentElement = client.getCommentElement();
  commentElement.addManualComment({
    context: {
      chartId: 'revenue-chart',
      dataPoint: { x: 100, y: 200 },
      seriesName: 'Q1 Revenue'
    }
  });
};
```

**Accessing Context in Annotations:**

```jsx
const commentAnnotations = useCommentAnnotations();

commentAnnotations?.forEach((annotation) => {
  const context = annotation.context;
  console.log(context.category);  // 'feedback'
  console.log(context.section);   // 'header'
});
```

**Filtering by Context:**

```jsx
const commentAnnotations = useCommentAnnotations();

// Filter comments for specific chart
const chartComments = commentAnnotations?.filter(
  (a) => a.context?.chartId === 'revenue-chart'
);

// Filter by custom category
const feedbackComments = commentAnnotations?.filter(
  (a) => a.context?.category === 'feedback'
);
```

**Method 4: Via Global Context Provider (v5.0.0-beta.7+):**

The provider runs whenever a new comment annotation is created and receives `(documentId, location)`.

```jsx
import { useCallback, useEffect } from 'react';
import { useSetContextProvider } from '@veltdev/react';

function AppWithContextProvider() {
  // The hook returns { setContextProvider }; it does not take the provider directly
  const { setContextProvider } = useSetContextProvider();
  const provider = useCallback((documentId, location) => ({
    appVersion: '2.0',
    currentPage: window.location.pathname,
  }), []);

  useEffect(() => {
    if (setContextProvider) setContextProvider(provider);
  }, [setContextProvider, provider]);

  return <VeltComments />;
}

// Or via API
const commentElement = client.getCommentElement();
commentElement.setContextProvider((documentId, location) => ({ appVersion: '2.0' }));
```

**Method 5: Update context on an existing annotation**

```jsx
// Replace (default) or merge the annotation's context
commentElement.updateContext('ANNOTATION_ID', { dashboardName: 'Q3 Revenue' }, { merge: true });
```

With `{ merge: true }`, the `access` object (Access Context) is merged key by key: adding a key keeps the others, passing `null` for a key deletes it, and removing the last key returns the comment to its default context. Updating context keeps the comment's visibility. See `permissions-private-comments-access-context.md`.

**For HTML:**

```html
<velt-comment-tool
  target-element-id="element-id"
  context='{"category": "feedback", "section": "header"}'
></velt-comment-tool>
```

**Verification Checklist:**
- [ ] Context object passed to comment tool or API
- [ ] Context data accessible in annotations
- [ ] Filtering uses correct context keys
- [ ] JSON format correct for HTML attributes
- [ ] `useSetContextProvider()` destructured to `{ setContextProvider }` and called inside an effect
- [ ] `updateContext()` uses `{ merge: true }` when other context keys must survive

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/popover - "Step 4: Add Metadata to the Comment"
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#addcontext - addContext
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#updatecontext - updateContext
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#setcontextprovider - setContextProvider
