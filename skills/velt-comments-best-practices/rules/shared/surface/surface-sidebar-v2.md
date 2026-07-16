---
title: Use VeltCommentsSidebarV2 for Primitive-Architecture Sidebar Customization
impact: MEDIUM-HIGH
impactDescription: Full composability of every sidebar UI section via 56+ independently importable primitives, enabling precise customization without forking the entire component
tags: sidebar, veltcommentssidebarv2, primitives, wireframe, filter, virtual-scroll, focused-thread, minimal-filters, sort, declarative-filters, applyCommentSidebarClientFilters, setCommentSidebarFilters, setSystemFiltersOperator, setSidebarButtonCountType, CommentSidebarFilters, location-identity, includeUnset, groupConfig
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
| `filters` | Main Filter bottom-sheet / menu panel | `FilterField[]` defines sections; a `CommentSidebarFilters` object (e.g. `{ status: ['OPEN'] }`) applies active selections directly — included keys replace their values, omitted keys are preserved. Default `[]`. |
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

**Active-selections form (`CommentSidebarFilters`)** — pass an object keyed by field instead of a `FilterField[]` to apply selected values directly. User/location identities are objects, not bare id strings. Included keys replace their current selections; omitted keys are preserved; a present-but-empty array clears one field; `{}` clears all client-provided selections; **Reset** in the Main Filter panel clears them too:

```jsx
<VeltCommentsSidebarV2
  filters={{
    status: ['OPEN'],
    people: [{ userId: '1.1' }, { userId: '2.3' }],
    location: [{ locationName: 'Home' }],
  }}
/>
```

```html
<velt-comments-sidebar-v2></velt-comments-sidebar-v2>
<script>
  const sidebar = document.querySelector('velt-comments-sidebar-v2');
  sidebar.filters = {
    status: ['OPEN'],
    people: [{ userId: '1.1' }, { userId: '2.3' }],
    location: [{ locationName: 'Home' }],
  };
</script>
```

**Incorrect (V1-style bare-id selections):**

```jsx
// Bare id strings for people/location no longer match the CommentSidebarFilters shape
<VeltCommentsSidebarV2
  filters={{ status: ['open'], people: ['1.1', '2.3'] }}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `filters` | `string \| FilterField[] \| CommentSidebarFilters` | `[]` | Main Filter panel sections, OR a `CommentSidebarFilters` object of active selections. Included selection keys replace their values, omitted keys are preserved, and **Reset** clears the client-provided selections. |
| `miniFilters` | `string \| FilterField[]` | `[]` | Single header funnel dropdown. |
| `minimalFilters` | `string \| SidebarMinimalFilterConfig[]` | `[]` | Multiple configurable header dropdowns. Replaces the single mini-filter funnel when present. |
| `filterOperator` | `'and' \| 'or'` | `'and'` | Cross-field combination of active filter selections. Directly configures the V2 filter engine and shares its effective value with the `systemFiltersOperator` input / API. |
| `filterPanelLayout` | `'bottomSheet' \| 'menu'` | `'bottomSheet'` | Main Filter panel layout. |
| `filterOptionLayout` | `'dropdown' \| 'checkbox'` | `'dropdown'` | How options render within a filter section. |
| `filterCount` | boolean | `true` | Per-option facet counts. Counts remain **absolute** within the current page-scoped annotation set and do **not** shrink around selections supplied through `setCommentSidebarFilters()`. Disabling improves performance. |
| `filterGhostCommentsInSidebar` | boolean | `false` | Hide ghost comments from the list. |
| `systemFiltersOperator` | `'and' \| 'or'` | `'and'` (effective) | Combines selections across **different** filter fields; values within one field always use OR. Also applies to client filters set via `setCommentSidebarFilters()` and is mirrored by `applyCommentSidebarClientFilters()`. An explicit `filterOperator` set at init is preserved over the shared operator's default. |
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

### `setCommentSidebarFilters()` — merge / replace / clear semantics (V2)

`setCommentSidebarFilters()` writes into the sidebar's active selections; the values render as checked options in the Main Filter panel and are cleared by **Reset**. Each call is a partial update, not a full overwrite: keys included in the payload replace their current selections, while omitted keys are preserved. A present-but-empty array clears one field, and an empty object clears all client-provided selections.

```typescript
const commentElement = client.getCommentElement();

// Apply / replace selections for specific fields
commentElement.setCommentSidebarFilters({
  status: ['OPEN'],
  involved: [{ userId: 'user-123' }],
  location: [{ locationName: 'Home' }],
});

// Clear a single field — other client-provided selections stay
commentElement.setCommentSidebarFilters({ location: [] });

// Clear everything the client has supplied
commentElement.setCommentSidebarFilters({});
```

Normalization used by the sidebar's active selections:

- `location`: matched by `id` (numeric `id` compares to string filter values; `id: 0` is valid), with `locationName` as fallback when `id` is `null` / `undefined` / empty.
- `people` / `assigned` / `tagged` / `involved`: matched by `userId`, with `email` as fallback when `userId` is absent. Email-only records do not create duplicate filter options.
- `status` / `priority` / `category`: matched by the provided ids without further normalization.
- `accessModes`: `'public'` or `'private'` — recognizes both legacy `iam.accessMode` and new `visibilityConfig` (`restricted` / `organizationPrivate` → `'private'`).
- `version`: matched by `id`.
- Custom fields (`[key: string]`): string values or `{ id?, name? }` objects.

A non-empty client selection filters even when its field is not declared in the Main Filter panel; empty undeclared fields are ignored, and declared fields are not duplicated. Facet counts stay absolute — see `filterCount` above.

### `setSystemFiltersOperator()` — cross-field combinator (V2)

Set how selections from **different** sidebar filter fields are combined. Values within one field always use OR.

```typescript
const commentElement = client.getCommentElement();
commentElement.setSystemFiltersOperator('or');   // 'and' | 'or'
```

- Params: `operator: 'and' | 'or'`.
- Returns: `void`.
- Effective default: `'and'`.
- Also applies to client filters set via `setCommentSidebarFilters()`, including any value written before the sidebar initializes.
- An explicit `filterOperator` set at init is preserved over the shared operator's default.

### `setSidebarButtonCountType()` — sidebar-button badge source (V2)

Change what the sidebar button count badge reflects.

```typescript
const commentElement = client.getCommentElement();
commentElement.setSidebarButtonCountType('filter');   // 'default' | 'filter'
```

- `'default'` — count of comments in open and in-progress states.
- `'filter'` — count of the sidebar's currently filtered list, including `0` for an empty result. Updates when comments are deleted. When `filterCommentsOnDom` is enabled, the same filtered list also gates which pins render on the page. The current filtered result is preserved while the sidebar is loading and is cleared when the sidebar is destroyed, so a removed sidebar no longer gates the badge or on-page pins.

### Default status selection (V2)

On first load, the Status field starts with **Open** plus every **In Progress** status selected; the sidebar shows active comments by default. The default selection is skipped when:

- Filter state was restored from `sessionStorage`.
- A caller supplied a status selection through `setCommentSidebarFilters()`.
- The user has already changed the Status selection.

If the status catalog loads after the sidebar renders and the user hasn't touched Status, the default selection refreshes to match the catalog's current Open + In Progress statuses. **Reset** does not re-apply the default statuses — clear the Status field or select **All** to show resolved / terminal comments.

### Priority "Not set" option (`includeUnset`)

The default Priority field includes a **Not set** option for comments without a priority. Opt out by supplying a custom `FilterField` with `includeUnset: false`:

```jsx
<VeltCommentsSidebarV2
  filters={[
    { field: 'status' },
    { field: 'priority', includeUnset: false },
  ]}
/>
```

### Location identity + people filter identity (V2)

The sidebar identifies a location by its `id`, falling back to `locationName` when `id` is `null`, `undefined`, or an empty string. `id: 0` is valid, numeric annotation ids compare with equivalent string filter values, and `id` takes precedence when both fields are present. This identity is used consistently by grouping, location filter options and matching, page mode, and client filters (`setCommentSidebarFilters()`). Comments without any location context appear in the **Others** group.

People / Involved / Assigned / Tagged options are keyed by `userId` with the user's display name as the label and email as fallback. Records containing only an email do not create filter options — this prevents duplicate options when another record for the same person contains a `userId`.

### Grouping expansion defaults (V2)

- **Location grouping** — the current + additional-location groups start expanded; other location groups start collapsed.
- **Document grouping** — the current document starts expanded; other documents start collapsed.
- **Status / priority / custom-field grouping** — all groups start expanded.
- Precedence: explicit expand > explicit collapse > grouping default. Both overrides persist in `sessionStorage`.
- A real location change resets overrides so the new current group expands. The initial location emitted during a reload preserves restored overrides.

`CommentSidebarGroup.isExpanded` is no longer just a boolean default: an omitted value is resolved from the user's overrides plus the current grouping default per the precedence above.

### `pageMode` uses location identity (V2)

The page-mode composer list is scoped by the current location identity, so a location supplied with only `locationName` behaves like an id-based location.

### Virtual-scroll row clipping (V2)

Rows wider than the sidebar viewport are clipped to sidebar width rather than producing a horizontal scrollbar. Tune the virtual-scroll window via `measuredSize` / `minBufferPx` / `maxBufferPx` (defaults `220` / `1000` / `2000`).

### V2 type vocabulary

V2-only types that back the declarative pipeline. They are consumed exclusively through V2 props (filter / sort / group / list / facet) — keep them co-located with this surface rule rather than mixing them into the core type reference.

```typescript
// Active-selection payload consumed by `filters={...}`, setCommentSidebarFilters(),
// and applyCommentSidebarClientFilters(). Included keys REPLACE; omitted keys are preserved.
interface CommentSidebarFilters {
  location?:   { id?: string | number; locationName?: string }[];
  document?:   { id: string }[];
  people?:     { userId?: string; email?: string }[];
  tagged?:     { userId?: string; email?: string }[];
  assigned?:   { userId?: string; email?: string }[];
  involved?:   { userId?: string; email?: string }[];
  priority?:   string[];
  status?:     string[];
  category?:   string[];
  version?:    { id: string }[];
  accessModes?: CommentAccessMode[];             // 'public' | 'private'
  // Custom fields — string values or { id?, name? } objects
  [key: string]: string[] | { id?: string; name?: string }[] | undefined;
}

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

// List grouping + flattened virtual-scroll rows.
// `isExpanded` in V2 is resolved from user overrides (persisted in sessionStorage)
// combined with the current grouping default — not a plain "default true" flag.
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
- [ ] Active-selection payloads use the `CommentSidebarFilters` shape — `people`/`involved`/`assigned`/`tagged` are `{ userId?, email? }[]`, `location` is `{ id?, locationName? }[]`; do **not** pass bare id strings
- [ ] `setCommentSidebarFilters()` calls are treated as partial updates (included keys replace, omitted keys preserved); use `{ field: [] }` to clear one field and `{}` to clear all
- [ ] `systemFiltersOperator` is set explicitly when the sidebar needs `'or'` combination across fields (effective default is `'and'`); `setSystemFiltersOperator()` is used for runtime changes
- [ ] `filterOperator` is set explicitly at init when it must differ from the shared `systemFiltersOperator` default
- [ ] Sidebar button badge source is chosen via `sidebarButtonCountType` / `setSidebarButtonCountType('default' | 'filter')`; `filterCommentsOnDom` coupling is understood when `'filter'` is used
- [ ] `applyCommentSidebarClientFilters()` is used for off-sidebar filtering instead of reimplementing the predicate pipeline
- [ ] Built-in filter fields are referenced via `BuiltInFilterFieldId` ids; custom fields supply `valuePath` (and a `FilterFieldResolver` when option sourcing is non-trivial)
- [ ] Priority field opts out of the **Not set** option via `includeUnset: false` on its `FilterField` when unset priorities should be hidden
- [ ] Grouping code does not assume `CommentSidebarGroup.isExpanded` is a plain "default true" — expansion resolves from user overrides (persisted in `sessionStorage`) combined with the current grouping default
- [ ] Event callbacks (`onSidebarOpen`, `onSidebarClose`, `onCommentClick`, `onFullscreenClick`) clean up any side effects on unmount

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments-sidebar/v2/setup — "V2 Setup"
- https://docs.velt.dev/async-collaboration/comments-sidebar/v2/customize-behavior — "V2 Customize Behavior" (declarative filters / sort / `applyCommentSidebarClientFilters` / `setCommentSidebarFilters` / grouping defaults / location + people identity / virtual-scroll clipping)
- https://docs.velt.dev/api-reference/sdk/api/api-methods#applycommentsidebarclientfilters — `applyCommentSidebarClientFilters()`
- https://docs.velt.dev/api-reference/sdk/api/api-methods#setcommentsidebarfilters — `setCommentSidebarFilters()` (V2 merge/replace semantics)
- https://docs.velt.dev/api-reference/sdk/api/api-methods#setsystemfiltersoperator — `setSystemFiltersOperator()`
- https://docs.velt.dev/api-reference/sdk/api/api-methods#setsidebarbuttoncounttype — `setSidebarButtonCountType()`
- https://docs.velt.dev/api-reference/sdk/models/data-models#commentsidebarfilters — `CommentSidebarFilters` payload shape
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltcommentssidebarv2props — V2 props reference (incl. `FilterField`, `SidebarMinimalFilterConfig`, `SortBy` / `SortOrder`)
