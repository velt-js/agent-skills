---
title: Use accessModes in Sidebar Filters for Privacy-Based Filtering
impact: MEDIUM
impactDescription: Without accessModes, sidebar cannot distinguish public from private comments — custom privacy filters will not work
tags: accessModes, sidebar, filter, setCommentSidebarFilters, private, public, visibility, visibilityConfig, iam.accessMode
---

## Use accessModes in Sidebar Filters for Privacy-Based Filtering

The sidebar system filter `accessModes` lets you filter comments by privacy level. It accepts `'public'` and/or `'private'` and works with both the legacy `iam.accessMode` field and the new `visibilityConfig` field — `restricted` and `organizationPrivate` map to `'private'`; `public` or unset maps to `'public'`.

**Incorrect (trying to filter private comments by status or custom logic):**

```jsx
// Wrong: there is no "private" status — privacy is not a status filter
const filters = { status: ['PRIVATE'] };
commentElement.setCommentSidebarFilters(filters);
```

**Correct (filter sidebar to show only private comments):**

```jsx
const filters = {
  accessModes: ['private'],
};

// Via prop
<VeltCommentsSidebar filters={filters} />

// Via API
const commentElement = client.getCommentElement();
commentElement.setCommentSidebarFilters(filters);
```

**Correct (filter sidebar to show only public comments):**

```jsx
const filters = {
  accessModes: ['public'],
};
commentElement.setCommentSidebarFilters(filters);
```

**Correct (combine accessModes with other filters):**

```jsx
const filters = {
  status: ['OPEN'],
  people: [{ userId: 'user-1' }],
  accessModes: ['private'],
};
commentElement.setCommentSidebarFilters(filters);
```

**Custom filter dropdown in wireframe:** If you build a custom privacy filter dropdown inside `<velt-comments-sidebar-wireframe>`, drive `accessModes` through the same `setCommentSidebarFilters()` API. The filter is resolved server-side by the sidebar pipeline, so your custom UI only needs to write the array.

**Full filter options reference:**

| Filter Key | Value Type | Description |
|-----------|-----------|-------------|
| `location` | `[{ id: string }]` | Filter by location |
| `document` | `[{ id: string }]` | Filter by document |
| `people` | `[{ userId: string }]` | Filter by comment author |
| `involved` | `[{ userId: string }]` | Author, mentioned, or assigned |
| `tagged` | `[{ userId: string }]` | Mentioned users |
| `assigned` | `[{ userId: string }]` | Assigned users |
| `priority` | `string[]` | e.g. `['P0', 'P1']` |
| `category` | `string[]` | e.g. `['bug', 'feedback']` |
| `status` | `string[]` | e.g. `['OPEN', 'IN_PROGRESS']` |
| `accessModes` | `('public' \| 'private')[]` | Privacy filter |
