---
title: Filter and Group Comments
impact: MEDIUM
impactDescription: Organize comments by context, location, or custom criteria
tags: filtering, grouping, aggregation, context, sidebar
---

## Filter and Group Comments

Filter and group comments based on context, location, or custom criteria for better organization and display.

**Filter by Context:**

```jsx
const commentAnnotations = useCommentAnnotations();

// Filter by chart ID
const chartComments = commentAnnotations?.filter(
  (a) => a.context?.chartId === 'my-chart'
);

// Filter by category
const bugComments = commentAnnotations?.filter(
  (a) => a.context?.category === 'bug'
);

// Filter by status
const openComments = commentAnnotations?.filter(
  (a) => a.context?.status === 'open'
);
```

**Filter by Target Element:**

```jsx
// Comments on specific element
const elementComments = commentAnnotations?.filter(
  (a) => a.targetElementId === 'element-id'
);
```

**Filter by Location:**

```jsx
// Comments at specific video timestamp
const frameComments = commentAnnotations?.filter(
  (a) => a.location?.currentMediaPosition === 120
);
```

**Sidebar Grouping Configuration:**

```jsx
// Disable grouping
<VeltCommentsSidebar
  groupConfig={{ enable: false }}
/>

// Enable grouping (default)
<VeltCommentsSidebar
  groupConfig={{ enable: true }}
/>
```

**Group Comments Manually:**

```jsx
const commentAnnotations = useCommentAnnotations();

// Group by section
const groupedBySection = commentAnnotations?.reduce((groups, annotation) => {
  const section = annotation.context?.section || 'uncategorized';
  if (!groups[section]) groups[section] = [];
  groups[section].push(annotation);
  return groups;
}, {});

// Render grouped
Object.entries(groupedBySection).map(([section, comments]) => (
  <div key={section}>
    <h3>{section}</h3>
    {comments.map((a) => (
      <CommentItem key={a.annotationId} annotation={a} />
    ))}
  </div>
));
```

**Comment Aggregation Pattern (Tables):**

When multiple comments can exist on the same element:

```jsx
<VeltComments
  popoverMode={true}
  groupMatchedComments={true}  // Group comments on same element
/>
```

**Verification Checklist:**
- [ ] Filter criteria matches context structure
- [ ] Grouped data structure matches UI needs
- [ ] Sidebar groupConfig set appropriately
- [ ] Empty groups handled gracefully

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior - "Aggregation"
