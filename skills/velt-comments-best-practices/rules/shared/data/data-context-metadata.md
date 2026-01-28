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

**Method 2: Via onCommentAdd Callback**

```jsx
<VeltComments
  onCommentAdd={(event) => {
    // Add or modify context before comment is created
    return {
      ...event,
      context: {
        ...event.context,
        timestamp: Date.now(),
        pageSection: 'main-content'
      }
    };
  }}
/>
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

**Source Pointers:**
- `/docs/async-collaboration/comments/setup/popover.mdx` - "Step 4: Add Metadata to the Comment"
- `/docs/async-collaboration/comments/customize-behavior.mdx` - Context and metadata
