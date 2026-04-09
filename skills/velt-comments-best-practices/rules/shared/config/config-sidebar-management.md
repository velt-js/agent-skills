---
title: Programmatic Sidebar Data, Filtering, and Configuration
impact: MEDIUM
impactDescription: Control sidebar content, filters, and behavior programmatically
tags: setCommentSidebarData, enableSidebarCustomActions, enableSidebarUrlNavigation, setCommentSidebarFilters, commentSidebarDataInit, commentSidebarDataUpdate, filterConfig, groupConfig, sortOrder, sidebar
---

## Programmatic Sidebar Data, Filtering, and Configuration

Control the comments sidebar programmatically — set custom data, manage filters, configure sorting and grouping.

**Sidebar Data Management:**

```tsx
const commentElement = client.getCommentElement();

// Set sidebar data programmatically (for custom grouping/filtering)
commentElement.setCommentSidebarData(sidebarData, options);

// Enable/disable custom action buttons in sidebar
commentElement.enableSidebarCustomActions();
commentElement.disableSidebarCustomActions();

// Enable/disable URL-based navigation on comment click
commentElement.enableSidebarUrlNavigation();
commentElement.disableSidebarUrlNavigation();

// Set filters programmatically
commentElement.setCommentSidebarFilters({
  statusIds: ['open'],
  priority: ['high'],
});
```

**Sidebar Events:**

```tsx
// Listen to sidebar data initialization
commentElement.on('commentSidebarDataInit').subscribe((event) => {
  console.log('Sidebar data loaded:', event);
});

// Listen to sidebar data updates
commentElement.on('commentSidebarDataUpdate').subscribe((event) => {
  console.log('Sidebar data updated:', event);
});

// Navigation button click
<VeltCommentsSidebar onCommentNavigationButtonClick={(event) => {
  router.push(`/page/${event.documentId}#${event.annotationId}`);
}} />
```

**Sidebar Props (V1 + V2):**

| Prop | Type | Description |
|------|------|-------------|
| `filterConfig` | `object` | Advanced filtering (status, priority, type, custom) |
| `groupConfig` | `object` | Grouping configuration |
| `sortOrder` | `'asc' \| 'desc'` | Sort direction |
| `sortBy` | `string` | Sort field (e.g., 'createdAt', 'lastUpdated') |
| `systemFiltersOperator` | `'AND' \| 'OR'` | How filters combine |
| `defaultMinimalFilter` | `string` | Default filter state (e.g., 'reset') |
| `searchPlaceholder` | `string` | Custom search input text |
| `commentPlaceholder` | `string` | Comment composer placeholder |
| `replyPlaceholder` | `string` | Reply composer placeholder |
| `pageModePlaceholder` | `string` | Page mode composer placeholder |
| `sidebarButtonCountType` | `'total' \| 'unread'` | Badge count type |
| `floatingMode` | `boolean` | Floating sidebar |
| `fullScreen` | `boolean` | Fullscreen sidebar |
| `expandOnSelection` | `boolean` | Auto-expand on comment selection |
| `filterPanelLayout` | `string` | Filter panel layout mode |
| `filterOptionLayout` | `string` | Individual filter layout |
| `filterCount` | `boolean` | Show count badge on filter |
| `dialogSelection` | `string` | Dialog selection behavior |
| `currentLocationSuffix` | `string` | Custom location label (e.g., '(this page)') |
| `excludeLocationIdsFromSidebar` | `number[]` | Hide specific locations |
| `filterGhostCommentsInSidebar` | `boolean` | Hide ghost comments |

**Verification:**
- [ ] Sidebar data set before user opens sidebar
- [ ] Custom actions enabled if custom filter UI needed
- [ ] Event subscriptions cleaned up on unmount
- [ ] Props match sidebar version (V1 vs V2)

**Source Pointer:** https://docs.velt.dev/async-collaboration/comments-sidebar/customize-behavior
