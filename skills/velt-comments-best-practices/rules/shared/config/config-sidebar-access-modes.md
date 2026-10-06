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

**Custom filter dropdown in wireframe:** If you build a custom privacy filter dropdown inside `<velt-comments-sidebar-wireframe>`, drive `accessModes` through the same `setCommentSidebarFilters()` API, or bind your state to a call that writes the selected values. `setCommentSidebarFilters()` is a partial update: included keys replace their selections, omitted keys are preserved, and **Reset** clears them.

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
| `version` | `[{ id: string }]` | Filter by version |
| `accessModes` | `('public' \| 'private')[]` | Privacy filter |

For V2, `people` / `assigned` / `tagged` / `involved` match by `userId` (falling back to `email`) and `location` matches by `id` (falling back to `locationName`).

**Verification Checklist:**
- [ ] Privacy filtering uses `accessModes`, not a status or custom field
- [ ] Values are `'public'` and/or `'private'` (both legacy `iam.accessMode` and `visibilityConfig.type` of `restricted` / `organizationPrivate` count as private)
- [ ] User and location filter values are objects, not bare id strings

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments-sidebar/v1/customize-behavior#setcommentsidebarfilters - setCommentSidebarFilters (V1)
- https://docs.velt.dev/async-collaboration/comments-sidebar/v2/customize-behavior#setcommentsidebarfilters - setCommentSidebarFilters (V2)
- https://docs.velt.dev/api-reference/sdk/models/data-models#commentsidebarfilters - CommentSidebarFilters
