---
title: Use VeltCommentsSidebarV2 for Primitive-Architecture Sidebar Customization
impact: MEDIUM-HIGH
impactDescription: Full composability of every sidebar UI section via 56+ independently importable primitives, enabling precise customization without forking the entire component
tags: sidebar, veltcommentssidebarv2, primitives, wireframe, filter, virtual-scroll, focused-thread, minimal-filters, sort, declarative-filters, applyCommentSidebarClientFilters
---

## Use VeltCommentsSidebarV2 for Primitive-Architecture Sidebar Customization

`VeltCommentsSidebarV2` is a complete redesign of the Comments Sidebar built on a flat primitive component architecture. Every section of the UI is an independently importable and composable primitive, so you can replace only the parts you need without reimplementing the whole component. V2 ships with a declarative filter / sort / group model (three filter surfaces — main panel, mini funnel dropdown, multi-dropdown minimal bar), CDK virtual scroll for large comment lists, a focused-thread view, a fullscreen toggle, and a header search.

**Incorrect (customizing V1 sidebar by overriding deeply nested internals):**

```jsx
// V1 sidebar requires shadowing deeply nested internal components
// to change layout or filtering — there is no flat primitive tree
<VeltCommentsSidebar />
```

**Correct (React / Next.js — direct V2 component with primitive composition):**

```jsx
import {
  VeltProvider,
  VeltComments,
  VeltCommentsSidebarV2,
} from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />

      {/* Direct usage — all props are optional */}
      <VeltCommentsSidebarV2
        pageMode={false}
        focusedThreadMode={false}
        readOnly={false}
        position="right"
        variant="sidebar"
        forceClose={true}
        onSidebarOpen={(data) => console.log('sidebar opened', data)}
        onSidebarClose={(data) => console.log('sidebar closed', data)}
        onCommentClick={(data) => console.log('comment clicked', data)}
        onCommentNavigationButtonClick={(data) => console.log('nav button clicked', data)}
      />
    </VeltProvider>
  );
}
```

**Correct (HTML / Other Frameworks — dedicated V2 web-component tag):**

```html
<velt-comments-sidebar-v2
  page-mode="false"
  focused-thread-mode="false"
  read-only="false"
  position="right"
  variant="sidebar"
  force-close="true"
></velt-comments-sidebar-v2>
```

`<velt-comments-sidebar-v2>` / `VeltCommentsSidebarV2` is the only entry point documented by the V2 setup page. The old V1 component prop opt-in is no longer shown in `async-collaboration/comments-sidebar/v2/setup`. Mount the dedicated V2 tag directly; do not pair it with a V1 tag.

**VeltCommentsSidebarV2 Props (core layout / event surface):**

| Prop | Type | Optional | Description |
|------|------|----------|-------------|
| `pageMode` | boolean | Yes | Enable page-level comments mode. |
| `focusedThreadMode` | boolean | Yes | Open individual threads in a focused view inside the sidebar. |
| `readOnly` | boolean | Yes | Render the sidebar in read-only mode. |
| `embedMode` | string \| null | Yes | Embed the sidebar inside a custom container. |
| `floatingMode` | boolean | Yes | Render the sidebar in floating mode. |
| `position` | `'right' \| 'left'` | Yes | Anchor position of the sidebar panel. Narrowed from `string`. |
| `variant` | string | Yes | Display variant (e.g. `"sidebar"`). |
| `forceClose` | boolean | Yes | Force the sidebar to close on outside click, even when opened via API. Default `true`. |
| `onSidebarOpen` | (data: any) => void | Yes | Callback fired when the sidebar opens. |
| `onSidebarClose` | (data: any) => void | Yes | Callback fired when the sidebar closes. |
| `onCommentClick` | (data: any) => void | Yes | Callback fired when a comment item is clicked. |
| `onCommentNavigationButtonClick` | (data: any) => void | Yes | Callback fired when the comment navigation button is clicked. |
| `fullScreen` | boolean | Yes | Add a fullscreen toggle to the header. Default `false`. |
| `onFullscreenClick` | (data: any) => void | Yes | Fires when the fullscreen toggle is clicked. |

For the complete prop catalog (placeholders, virtual-scroll tuning, URL navigation, deprecated V1 aliases such as `openSidebar` / `sidebarCommentClick` / `onSidebarCommentClick`), see `surface/surface-sidebar.md` — `VeltCommentsSidebarV2` reuses `VeltCommentsSidebarProps`.

### Declarative filter surfaces (V2)

V2 exposes filter / sort / group / search as data. The sidebar renders the matching UI and applies the selections client-side via the new `applyCommentSidebarClientFilters()` API method. Three filter surface props drive three distinct surfaces — they only make sense together, so configure them as one unit:

| Prop | Surface | Shape |
|------|---------|-------|
| `filters` | Main Filter bottom-sheet / menu panel | `FilterField[]` defines sections; an object keyed by field (e.g. `{ status: ['open'] }`) instead applies active selections directly. Default `[]`. |
| `miniFilters` | Single header funnel dropdown | `FilterField[]` — one section per field. Default `[]`. |
| `minimalFilters` | Multiple header dropdowns (replaces the single funnel) | `SidebarMinimalFilterConfig[]` — one dropdown per entry. The entry's `type` (`filter` / `sort` / `quick` / `actions`) decides what the dropdown contains; matching input (`fields` / `sorts` / `actions`) provides its content. Default `[]`. |

```jsx
// React — main filter panel + a multi-dropdown minimal bar
<VeltCommentsSidebarV2
  filters={[
    { field: 'status' },
    { field: 'assigned' },
    { field: 'authorName', label: 'Written By', valuePath: 'from.name' },
  ]}
  minimalFilters={[
    { type: 'filter', fields: [{ field: 'status' }] },
    { type: 'sort', sorts: ['date', 'unread'] },
    { type: 'quick', actions: ['open', 'resolved', { label: 'Mine', path: 'from.userId', value: '1.1' }] },
  ]}
  filterOperator="and"
  filterPanelLayout="bottomSheet"
  filterOptionLayout="dropdown"
  filterCount={true}
  filterGhostCommentsInSidebar={false}
  systemFiltersOperator="and"
  defaultMinimalFilter="open"
/>
```

```html
<!-- HTML — same shape, kebab-cased attributes; multi-value props as JSON strings -->
<velt-comments-sidebar-v2
  minimal-filters='[{"type":"filter","fields":[{"field":"status"}]},{"type":"sort","sorts":["date","unread"]}]'
  filter-operator="and"
  filter-panel-layout="bottomSheet"
  filter-option-layout="dropdown"
  filter-count="true"
  filter-ghost-comments-in-sidebar="false"
  system-filters-operator="and"
  default-minimal-filter="open"
></velt-comments-sidebar-v2>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `filters` | `string \| FilterField[] \| object` | `[]` | Main Filter panel sections, OR an object of active selections that routes to the V1 `setCommentSidebarFilters` path. |
| `miniFilters` | `string \| FilterField[]` | `[]` | Single header funnel dropdown. |
| `minimalFilters` | `string \| SidebarMinimalFilterConfig[]` | `[]` | Multiple configurable header dropdowns. Replaces the single mini-filter funnel when present. |
| `filterOperator` | `'and' \| 'or'` | `'and'` | Cross-section combination of active filter selections. |
| `filterPanelLayout` | `'bottomSheet' \| 'menu'` | `'bottomSheet'` | Main Filter panel layout. |
| `filterOptionLayout` | `'dropdown' \| 'checkbox'` | `'dropdown'` | How options render within a filter section. |
| `filterCount` | boolean | `true` | Per-option facet counts. Disabling improves performance. |
| `filterGhostCommentsInSidebar` | boolean | `false` | Hide ghost comments from the list. |
| `systemFiltersOperator` | `'and' \| 'or'` | `'and'` | Operator applied to system filters. Mirrored by `applyCommentSidebarClientFilters()`. |
| `defaultMinimalFilter` | `'all' \| 'read' \| 'unread' \| 'resolved' \| 'open' \| 'assignedToMe' \| 'reset'` | — | Default active quick filter applied on load. |

### Default sort and quick-filter (V2)

| Prop | Type | Description |
|------|------|-------------|
| `sortBy` | [`SortBy`](#) | Default sort key — built-in preset (`'date'`, `'unread'`) or a dot-path (e.g. `'comments.createdAt'`). Sets the default sort; does not render a sort dropdown on its own. |
| `sortOrder` | [`SortOrder`](#) — `'asc' \| 'desc'` | Default sort direction. |
| `sortData` | string | Custom-field sort path used when sorting by a custom field. |

```jsx
<VeltCommentsSidebarV2 sortBy="comments.createdAt" sortOrder="desc" defaultMinimalFilter="open" />
```

### `applyCommentSidebarClientFilters()` — programmatic filter pipeline

Apply a `CommentSidebarFilters` payload to an annotation array client-side, honoring the current `systemFiltersOperator`. Backs the V2 declarative filter pipeline; reach for it when filtering annotations outside the sidebar (custom previews, off-screen counts, exports).

```typescript
const commentElement = client.getCommentElement();
const filtered: CommentAnnotation[] = commentElement.applyCommentSidebarClientFilters(
  annotations,
  filters,
);
```

- Params: `annotations: CommentAnnotation[]`, `filters: CommentSidebarFilters`.
- Returns: `CommentAnnotation[]`.
- No React hook — call on `commentElement`.

### V2 type vocabulary

V2-only types that back the declarative pipeline. They are consumed exclusively through V2 props (filter / sort / group / list / facet) — keep them co-located with this surface rule rather than mixing them into the core type reference.

```typescript
// Filter field definition (panel sections + minimal-filter `filter` dropdowns)
interface FilterField {
  field: string;                              // BuiltInFilterFieldId or custom id
  label?: string;
  select?: 'single' | 'multi';
  searchable?: boolean;
  showCounts?: boolean;
  icon?: string;
  valuePath?: string;                         // dot-path for custom fields
  includeUnset?: boolean;
  placeholder?: string;
  groupable?: boolean;
  order?: string[];
  options?: SidebarFilterValue[];
}

// Single selectable option inside a FilterField — { id, label, count?, icon? }
interface SidebarFilterValue { /* id + display + optional count/icon */ }

// One dropdown in the minimalFilters bar
interface SidebarMinimalFilterConfig {
  type?: SidebarFilterDropdownType;           // 'filter' | 'sort' | 'quick' | 'actions'
  label?: string;
  field?: string;
  fields?: FilterField[];                     // for type === 'filter'
  sorts?: (string | SidebarSortConfig)[];     // for type === 'sort' or 'actions'
  actions?: (string | SidebarQuickFilterConfig)[]; // for type === 'quick' or 'actions'
}

// One sort option
interface SidebarSortConfig {
  label?: string;
  preset?: string;                            // 'date' | 'unread' | ...
  path?: string;
  field?: string;
  order?: 'asc' | 'desc';
}

// One quick-filter predicate
interface SidebarQuickFilterConfig {
  label?: string;
  preset?: string;                            // 'open' | 'resolved' | 'unread' | ...
  path?: string;
  field?: string;
  value?: any;
  conditions?: SidebarQuickCondition[];
  operator?: 'and' | 'or';
}

interface SidebarQuickCondition {
  path?: string;
  field?: string;
  value: any;
}

// List grouping + flattened virtual-scroll rows
interface SidebarAnnotationGroup {
  id: string;
  label: string;
  count: number;
  isExpanded: boolean;
  isCurrentPage?: boolean;
  annotations: CommentAnnotation[];
}

type SidebarListRow =
  | { type: 'group'; group: SidebarAnnotationGroup }
  | { type: 'annotation'; annotation: CommentAnnotation; groupId: string };

// Operators + dropdown kinds
type FilterFieldOperator = 'and' | 'or';
type SidebarFilterDropdownType = 'filter' | 'sort' | 'quick' | 'actions';

// Built-in field ids — recognized natively by the V2 filter pipeline
const BUILT_IN_FILTER_FIELD_IDS = [
  'status', 'priority', 'category', 'people', 'assigned',
  'tagged', 'involved', 'location', 'version', 'document',
] as const;
type BuiltInFilterFieldId = typeof BUILT_IN_FILTER_FIELD_IDS[number];

// Section header chips + "All" toggle (panel-level controls)
type SectionControlChip = { id: string; label: string; isAll: boolean };
type SectionAllOption = { show: boolean; label: string };

// Helper types for the resolved sort / quick pipelines
type SidebarSortCriterion = unknown;   // resolved from SidebarSortConfig
type SidebarQuickPredicate = unknown;  // resolved from SidebarQuickFilterConfig

// Default sort surface (props sortBy / sortOrder)
type SortBy = string;
type SortOrder = 'asc' | 'desc';

// Custom-field resolver registration
interface FacetContext {
  annotations: CommentAnnotation[];
  field: FilterField;
}

interface FilterFieldResolver {
  id: string;
  optionSource: 'catalog' | 'scan';
  buildOptions: (ctx: FacetContext) => SidebarFilterValue[];
  matches: (annotation: CommentAnnotation, selectedValueIds: string[]) => boolean;
}
```

**Key V2 Differences from V1:**

- **Declarative filter / sort model** — `filters` / `miniFilters` / `minimalFilters` (+ `sortBy` / `sortOrder` / `sortData` / `defaultMinimalFilter`) replace the legacy `minimalFilter` + `advancedFilters` system.
- **CDK virtual scroll** — built-in for large comment lists; tune via `measuredSize` / `minBufferPx` / `maxBufferPx`.
- **Focused-thread view** — when `focusedThreadMode={true}`, clicking a comment opens the thread inline inside the sidebar.
- **Primitive tree** — every section (header, search, filter button, filter container, list group header, fullscreen button, list, thread view, page-mode composer) is an independently importable primitive that accepts `parentLocalUIState` and supports `velt-class` conditional styling. See `ui/ui-v2-primitives.md`.
- **`MinimalActionsDropdown` removed** — replaced by the combined `actions` filter-dropdown configured via `minimalFilters`.

**Verification Checklist:**
- [ ] `VeltCommentsSidebarV2` (or `<velt-comments-sidebar-v2>`) is mounted directly for per-section customization — the V2 setup docs no longer cover the legacy V1 component prop opt-in
- [ ] `focusedThreadMode` is set explicitly when inline thread expansion is needed
- [ ] `forceClose` is driven by state when not using the new default of `true` (V2 default flipped from `false` to `true`)
- [ ] Filter / sort props are configured together (`filters` + `minimalFilters` for visible UI, `sortBy` / `sortOrder` for default ordering)
- [ ] `applyCommentSidebarClientFilters()` is used for off-sidebar filtering instead of reimplementing the predicate pipeline
- [ ] Built-in filter fields are referenced via `BuiltInFilterFieldId` ids; custom fields supply `valuePath` (and a `FilterFieldResolver` when option sourcing is non-trivial)
- [ ] Event callbacks (`onSidebarOpen`, `onSidebarClose`, `onCommentClick`, `onFullscreenClick`) clean up any side effects on unmount

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments-sidebar/v2/setup — "V2 Setup"
- https://docs.velt.dev/async-collaboration/comments-sidebar/v2/customize-behavior — "V2 Customize Behavior" (declarative filters / sort / `applyCommentSidebarClientFilters`)
- https://docs.velt.dev/api-reference/sdk/api/api-methods#applycommentsidebarclientfilters — `applyCommentSidebarClientFilters()`
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltcommentssidebarv2props — V2 props reference (incl. `FilterField`, `SidebarMinimalFilterConfig`, `SortBy` / `SortOrder`)
