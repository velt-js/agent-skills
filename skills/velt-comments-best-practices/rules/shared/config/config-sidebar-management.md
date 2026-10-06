---
title: Programmatic Sidebar Data, Filtering, and Configuration
impact: MEDIUM
impactDescription: Control sidebar content, filters, and behavior programmatically
tags: setCommentSidebarData, enableSidebarCustomActions, enableSidebarUrlNavigation, setCommentSidebarFilters, setSystemFiltersOperator, setSidebarButtonCountType, commentSidebarDataInit, commentSidebarDataUpdate, commentClick, commentNavigationButtonClick, sidebarOpen, sidebarClose, filterConfig, groupConfig, sortOrder, sidebar
---

## Programmatic Sidebar Data, Filtering, and Configuration

Control the comments sidebar programmatically: supply custom data, apply filters, and react to sidebar events. Filter keys are field names from `CommentSidebarFilters` (`status`, `priority`, `people`, `location`, ...). Unknown keys such as `statusIds` are ignored.

**Incorrect (unknown filter keys, uppercase operator):**

```jsx
commentElement.setCommentSidebarFilters({ statusIds: ['open'] }); // ignored: not a filter key
<VeltCommentsSidebar systemFiltersOperator="AND" />                // values are 'and' | 'or'
```

**Correct (data, filters, operators):**

```jsx
const commentElement = client.getCommentElement();

// Custom-actions mode: you compute the list and hand it to the sidebar
commentElement.enableSidebarCustomActions();
commentElement.setCommentSidebarData(customFilterData, { grouping: true });

// URL navigation on comment click (default false)
commentElement.enableSidebarUrlNavigation();

// Partial update: included keys replace, omitted keys are preserved
commentElement.setCommentSidebarFilters({
  status: ['OPEN'],
  priority: ['P0'],
  people: [{ userId: 'user-1' }],
});
commentElement.setCommentSidebarFilters({ priority: [] }); // clear one field
commentElement.setCommentSidebarFilters({});              // clear all

commentElement.setSystemFiltersOperator('or');            // 'and' (default) | 'or'
commentElement.setSidebarButtonCountType('filter');       // 'default' | 'filter'
```

**Sidebar events (comment element event bus):**

```jsx
// Hook
const sidebarData = useCommentEventCallback('commentSidebarDataUpdate');
const commentClick = useCommentEventCallback('commentClick');

// API Method
const subscription = commentElement.on('commentNavigationButtonClick').subscribe((event) => {
  // event: { annotation, documentId, location, targetElementId, context }
  router.push(`/page/${event.location?.pageId}`);
});
subscription?.unsubscribe();
```

Other sidebar events: `commentSidebarDataInit`, `sidebarOpen`, `sidebarClose`, `fullscreenClick`. With client-provided data, quick-filter, category-filter, and data changes emit `commentSidebarDataUpdate` with the filtered list. V1 also accepts the `onCommentClick` / `onCommentNavigationButtonClick` component props; V2 uses the event bus.

**Sidebar Props (V1 + V2):**

| Prop | Type | Description |
|------|------|-------------|
| `filterConfig` | `object` | V1 system filter panel config (status, priority, people, location, ...) |
| `groupConfig` | `{ enable?, name?, groupBy? }` | Grouping configuration |
| `sortOrder` | `'asc' \| 'desc'` | Sort direction |
| `sortBy` | `string` | Default sort field |
| `systemFiltersOperator` | `'and' \| 'or'` | How different filter fields combine |
| `defaultMinimalFilter` | `string` | Default quick filter (`'all'`, `'read'`, `'unread'`, `'resolved'`, `'open'`, `'reset'`; V2 also `'assignedToMe'`) |
| `searchPlaceholder` | `string` | Search input placeholder |
| `commentPlaceholder` / `replyPlaceholder` / `pageModePlaceholder` | `string` | Composer placeholders |
| `editPlaceholder` / `editCommentPlaceholder` / `editReplyPlaceholder` | `string` | Edit-composer placeholders (specific variants win over `editPlaceholder`) |
| `sidebarButtonCountType` | `'default' \| 'filter'` | Sidebar button badge source |
| `commentCountType` | `'total' \| 'unread'` | V1 sidebar / sidebar-button count type |
| `floatingMode` | `boolean` | Floating overlay sidebar |
| `fullScreen` | `boolean` | Fullscreen toggle in the header |
| `expandOnSelection` | `boolean` | Auto-expand on comment selection (default `true`) |
| `filterPanelLayout` | `'bottomSheet' \| 'menu'` | Filter panel layout |
| `filterOptionLayout` | `'dropdown' \| 'checkbox'` | Option rendering inside a filter section |
| `filterCount` | `boolean` | Per-option counts (default `true`) |
| `dialogSelection` | `boolean` | `false` emits `commentClick` only, with no inline expansion |
| `currentLocationSuffix` | `boolean` | Adds "(This page)" to the current location's group |
| `excludeLocationIds` | `string[]` | Hide comments from these locations (API: `excludeLocationIdsFromSidebar()`) |
| `filterGhostCommentsInSidebar` | `boolean` | Hide ghost comments |

**Edit Composer Placeholders:**

Props set on the root `VeltComments` propagate to all dialogs. Priority: `editCommentPlaceholder` / `editReplyPlaceholder` > `editPlaceholder` > `commentPlaceholder` / `replyPlaceholder` > SDK defaults.

```jsx
<VeltComments
  editPlaceholder="Edit your message…"
  editCommentPlaceholder="Edit the original comment…"
  editReplyPlaceholder="Edit your reply…"
/>
```

```html
<velt-comments
  edit-placeholder="Edit your message…"
  edit-comment-placeholder="Edit the original comment…"
  edit-reply-placeholder="Edit your reply…"
></velt-comments>
```

**Verification:**
- [ ] Filter payloads use `CommentSidebarFilters` keys with object identities for people and locations
- [ ] Operator values are lowercase `'and'` / `'or'`
- [ ] Custom actions enabled before calling `setCommentSidebarData()`
- [ ] Event subscriptions cleaned up on unmount
- [ ] Props match the sidebar version (V1 `filterConfig` vs V2 `filters` / `minimalFilters`)

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments-sidebar/v1/customize-behavior - V1 customize behavior
- https://docs.velt.dev/async-collaboration/comments-sidebar/v2/customize-behavior#setcommentsidebarfilters - setCommentSidebarFilters
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#event-subscription - Comment event table
- https://docs.velt.dev/api-reference/sdk/api/api-methods#setcommentsidebardata - setCommentSidebarData()
