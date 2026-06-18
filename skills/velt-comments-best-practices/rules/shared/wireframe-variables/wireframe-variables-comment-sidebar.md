---
title: Bind Comment Sidebar Wireframe Slots Using Template Variables
impact: MEDIUM
impactDescription: Drives layout-mode styling, filter / list / focused-thread iteration, empty-state and skeleton gating, and nested-dialog scope across the Comment Sidebar wireframe family without re-subscribing to sidebar state
tags: wireframe, template-variables, velt-data, velt-if, velt-class, defaultCondition, comment-sidebar, hybrid-flat-config, focused-thread, filter-panel
---

## Bind Comment Sidebar Wireframe Slots Using Template Variables

The Comment Sidebar wireframe family (`<velt-comments-sidebar-...-wireframe>` / `<velt-comment-sidebar-...-wireframe>` — **both prefixes are used**) is the largest wireframe surface after Comment Dialog. It covers the panel root, wrapper, header, filter panel (and its per-category sub-panels + per-option rows + filter-search tags), the minimal filter/sort + actions dropdowns, the standalone status / location / document dropdowns, the virtual-scroll list (with grouped sections), skeleton + empty-state placeholders, the page-mode composer, and the focused-thread view.

You read the wireframe's exposed variables with three directives — `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Use these instead of re-implementing filter, focused-thread, or unread state on top of `useCommentAnnotations` / `useVeltClient`.

The sidebar uses a **hybrid access pattern**, distinct from Comment Dialog:

- A small set of **mapped** sidebar-specific names resolve via bare short names — `{focusedAnnotation}`, `{selectedMinimalFilterDropdownOption}`, `{appliedFiltersCount}`, `{filteredCommentAnnotationsCount}`, `{unreadCommentAnnotationCount}`.
- Inherited mapped names from Comment Dialog also resolve as short names — `{user}`, `{isUserAdmin}`, `{isKnownUser}`, `{darkMode}`, `{variant}`, `{annotation}`, `{annotations}`, `{allAnnotations}`, `{commentAnnotation}`, `{commentAnnotations}`.
- Everything else is **flat** on `componentConfig` and **must** be referenced via the full path: `{componentConfig.skeletonLoading}`, `{componentConfig.virtualScrollData}`, `{componentConfig.filterConfig.layout}`, …

For the structural catalog of all sidebar tags see `ui/ui-wireframes.md`. For the surface itself see `surface/surface-sidebar.md`. This rule documents the *variable-binding* layer on top.

**Incorrect (rebuilding sidebar state from hooks and gating slots from the host component):**

```jsx
import { useCommentAnnotations, useVeltClient } from '@veltdev/react';
import { VeltCommentsSidebarWireframe } from '@veltdev/react';

function Sidebar() {
  const annotations = useCommentAnnotations();
  // Reimplements filtered count + skeleton + empty + focused-thread state
  // the wireframe already exposes.
  const [filtered, setFiltered] = useState(annotations ?? []);
  const [loading, setLoading] = useState(true);
  const [focused, setFocused] = useState(null);
  useEffect(() => { /* manual subscriptions ... */ }, [annotations]);
  return (
    <VeltCommentsSidebarWireframe>
      {loading ? <Skeleton /> : filtered.length === 0 ? <Empty /> : <List items={filtered} />}
      {focused && <FocusedThread annotation={focused} />}
    </VeltCommentsSidebarWireframe>
  );
}
```

**Correct (read the slot's injected variables; let the wireframe iterate / gate for you):**

```jsx
import { VeltCommentsSidebarWireframe } from '@veltdev/react';

<VeltCommentsSidebarWireframe>
  <VeltCommentsSidebarWrapperWireframe>
    <VeltCommentSidebarHeaderWireframe>
      <h2>Comments</h2>
      <VeltCommentsSidebarFilterButtonWireframe
        veltClass="'has-filters': {appliedFiltersCount} > 0">
        Filter
        <VeltIf condition="{appliedFiltersCount} > 0">
          <span><VeltData field="appliedFiltersCount" /></span>
        </VeltIf>
      </VeltCommentsSidebarFilterButtonWireframe>
      <VeltCommentSidebarCloseButtonWireframe />
    </VeltCommentSidebarHeaderWireframe>

    <VeltCommentSidebarSkeletonWireframe />
    <VeltCommentSidebarListWireframe />

    <VeltCommentsSidebarEmptyPlaceholderWireframe
      veltIf="{componentConfig.noCommentsFound} || {componentConfig.noCommentsFoundForAppliedFilters}">
      <p>No comments to show.</p>
      <VeltCommentsSidebarResetFilterButtonWireframe
        veltIf="{appliedFiltersCount} > 0">
        Clear filters
      </VeltCommentsSidebarResetFilterButtonWireframe>
    </VeltCommentsSidebarEmptyPlaceholderWireframe>

    <VeltCommentsSidebarFocusedThreadWireframe>
      <VeltIf condition="{focusedAnnotation}">
        <div className="my-focused">
          <button>Back</button>
          <h3><VeltData field="focusedAnnotation.from.name" /></h3>
          <p><VeltData field="focusedAnnotation.comments.0.commentText" /></p>
        </div>
      </VeltIf>
    </VeltCommentsSidebarFocusedThreadWireframe>
  </VeltCommentsSidebarWrapperWireframe>
</VeltCommentsSidebarWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-comments-sidebar-wireframe>
  <velt-comments-sidebar-wrapper-wireframe>
    <velt-comment-sidebar-header-wireframe>
      <velt-comments-sidebar-filter-button-wireframe
        velt-class="'has-filters': {appliedFiltersCount} > 0">
        Filter
      </velt-comments-sidebar-filter-button-wireframe>
    </velt-comment-sidebar-header-wireframe>
    <velt-comment-sidebar-list-wireframe></velt-comment-sidebar-list-wireframe>
    <velt-comments-sidebar-empty-placeholder-wireframe
      velt-if="{componentConfig.noCommentsFound} || {componentConfig.noCommentsFoundForAppliedFilters}">
    </velt-comments-sidebar-empty-placeholder-wireframe>
  </velt-comments-sidebar-wrapper-wireframe>
</velt-comments-sidebar-wireframe>
```

### Mapped variables (bare short names)

**Sidebar-specific:**

| Variable | Type | Notes |
|---|---|---|
| `focusedAnnotation` | `CommentAnnotation` | Currently-focused annotation in focused-thread view. Only resolves inside `<velt-comments-sidebar-focused-thread-wireframe>` and descendants. |
| `selectedMinimalFilterDropdownOption` | `{ filter: string; sort: string }` | Current option in the minimal filter / sort dropdown. |
| `appliedFiltersCount` | `number` | Number of filters currently applied — drives the badge on the filter button. |
| `filteredCommentAnnotationsCount` | `number` | Count of annotations after filtering. |
| `unreadCommentAnnotationCount` | `number` | Unread-annotation count on the current document (also exposed inside Comment Dialog). |

**Inherited from Comment Dialog** (resolve as short names everywhere):

- App state: `user`, `isUserAdmin`, `isKnownUser`.
- Per-instance UI: `darkMode`, `variant`.
- Comment data: `annotation`, `annotations`, `allAnnotations`, `commentAnnotation`, `commentAnnotations`.

Inside a sidebar wireframe that nests a comment-dialog wireframe (list-item dialogs, focused-thread dialog, page-mode composer), the **full Comment Dialog variable surface** becomes available — see `wireframe-variables-comment-dialog.md`.

### Flat `componentConfig.*` properties (full path required)

The sidebar's underlying shape is flat — these properties sit directly on `componentConfig`, **not** under `appState` / `data` / `uiState` / `featureState`. Grouped by area:

**Layout / mode:**

| Variable | Type | Notes |
|---|---|---|
| `componentConfig.darkMode` | `boolean` | Per-sidebar dark-mode flag. |
| `componentConfig.variant` | `string` | Wireframe variant id (default `'sidebar'`). |
| `componentConfig.fullScreen` | `boolean` | Sidebar rendered full-screen. |
| `componentConfig.embedMode` | `string \| null` | Embedded layout id (e.g. `'figma'`). |
| `componentConfig.floatingMode` | `boolean` | Floating-overlay layout. |
| `componentConfig.pageMode` | `boolean` | Page-mode layout (includes top-level composer). |
| `componentConfig.readOnly` | `boolean` | Read-only mode. |
| `componentConfig.sidebarVisible` | `boolean` | Master visibility toggle (floating mode). |
| `componentConfig.sidebarReadMode` | `boolean` | Read-mode flag. |
| `componentConfig.fullExpanded` | `boolean` | Sidebar fully expanded. |
| `componentConfig.isFirstComponent` | `boolean` | This is the first sidebar instance — gates root `shouldShow`. |

**Loading / empty state:**

| Variable | Type | Notes |
|---|---|---|
| `componentConfig.skeletonLoading` | `boolean` | Skeleton loader active. Gate the skeleton; hide the list. |
| `componentConfig.noCommentsFound` | `boolean` | No annotations exist in scope. |
| `componentConfig.noCommentsFoundForAppliedFilters` | `boolean` | Filters reduced the list to zero. |

**Filter state:**

| Variable | Type | Notes |
|---|---|---|
| `componentConfig.moreFiltersVisible` | `boolean` | Expanded filter panel is open. |
| `componentConfig.filterConfig` | `CommentSidebarFilterConfig` | Filter-panel configuration (`layout`, ordering, …). `layout === 'minimal'` swaps to the compact dropdown. |
| `componentConfig.filters` | `Record<string, any[]>` | Currently-selected values per category. |
| `componentConfig.systemFiltersOperator` | `'AND' \| 'OR'` | How filter categories compose. |

**List data:**

| Variable | Type | Notes |
|---|---|---|
| `componentConfig.virtualScrollData` | `{ type: string; data: any }[]` | Virtual-scroll items (annotations + section dividers). |
| `componentConfig.commentAnnotationsCountByFilters` | `Record<string, Record<string, number>>` | Per-filter-category-and-id annotation count. |

**Callbacks** (wired into custom triggers, not bound with `velt-data`):

- `componentConfig.openMoreFilters` — open the filter panel.
- `componentConfig.toggleMoreFilters` — toggle the filter panel.

### Loop-scope (context-specific) variables

These resolve only inside their owning iteration slot — referencing them outside returns `undefined`.

| Variable | Type | Available in |
|---|---|---|
| `focusedAnnotation` | `CommentAnnotation` | `<velt-comments-sidebar-focused-thread-wireframe>` and descendants. |
| `sidebarRef` | `HTMLElement` | Focused-thread context — DOM reference (internal positioning; rarely read in user wireframes). |
| `filter` | `{ name: string }` | Per-filter-category tags (`<velt-comments-sidebar-filter-name-wireframe>` and friends). |
| `item` | `{ name: string; count: number; selected: boolean }` | Per-option-row tags — filter-item children, status / location / document dropdown content-items. |
| `group` | `{ name: string; count: number; expanded: boolean }` | `<velt-comments-sidebar-list-item-group-wireframe>` and children. |
| `tag` | `{ name: string }` | Filter-search-tag children (`<velt-comments-sidebar-filter-search-tags-item-wireframe>` and friends). |

### Wireframe tags by region

The full tag set runs to ~80 wireframe tags. The structural tree lives in `ui/ui-wireframes.md`; below is a navigable summary.

**Root / wrapper** (4 tags):

| Wireframe tag | Notes |
|---|---|
| `<velt-comments-sidebar-wireframe>` | Root. `shouldShow` = `componentConfig.isFirstComponent \|\| componentConfig.floatingMode \|\| componentConfig.embedMode`; floating mode additionally requires `componentConfig.sidebarVisible`. |
| `<velt-comments-sidebar-wrapper-wireframe>` | Visible-content wrapper. |
| `<velt-comments-sidebar-panel-wireframe>` | Panel container. |
| `<velt-comments-sidebar-page-mode-wireframe>` | Page-mode wrapper variant. Gate with `velt-if="{componentConfig.pageMode}"`. |

**Header** (5 tags — title row + action buttons):

| Wireframe tag | Notes |
|---|---|
| `<velt-comment-sidebar-header-wireframe>` (also `<velt-comments-sidebar-header-wireframe>`) | Header row. |
| `<velt-comments-sidebar-filter-button-wireframe>` | Opens the filter panel. Decorate with `{appliedFiltersCount} > 0`. |
| `<velt-comment-sidebar-close-button-wireframe>` / `<velt-comments-sidebar-close-button-wireframe>` | Close button. |
| `<velt-comment-sidebar-fullscreen-button-wireframe>` / `<velt-comments-sidebar-fullscreen-button-wireframe>` | Fullscreen toggle. |
| `<velt-comment-sidebar-search-wireframe>` / `<velt-comments-sidebar-search-wireframe>` | Search input row. |
| `<velt-comments-sidebar-toggle-button-wireframe>` | Open / close toggle. |

**List** (8 tags — `virtualScrollData` iteration + grouped-section variants):

| Wireframe tag | Loop-scope | Notes |
|---|---|---|
| `<velt-comment-sidebar-list-wireframe>` / `<velt-comments-sidebar-list-wireframe>` | — | Iterates `componentConfig.virtualScrollData`. Renders a nested comment-dialog (sidebar mode) per annotation row. |
| `<velt-comments-sidebar-list-item-wireframe>` | inherits `annotation` | Per-annotation row. |
| `<velt-comments-sidebar-list-item-dialog-container-wireframe>` | inherits `annotation` | Container for the inline comment-dialog inside a list item — all Comment Dialog variables resolve inside. |
| `<velt-comments-sidebar-list-item-group-wireframe>` | injects `group` | Section divider for grouped lists. |
| `<velt-comments-sidebar-list-item-group-name-wireframe>` | inherits `group` | Group name label. |
| `<velt-comments-sidebar-list-item-group-count-wireframe>` | inherits `group` | Count badge. |
| `<velt-comments-sidebar-list-item-group-arrow-wireframe>` | inherits `group` | Expand / collapse chevron — gate with `{group.expanded}`. |

**Empty / skeleton** (2 tags):

| Wireframe tag | `shouldShow` |
|---|---|
| `<velt-comments-sidebar-empty-placeholder-wireframe>` | `componentConfig.noCommentsFound \|\| componentConfig.noCommentsFoundForAppliedFilters` |
| `<velt-comment-sidebar-skeleton-wireframe>` / `<velt-comments-sidebar-skeleton-wireframe>` | `componentConfig.skeletonLoading === true` |

**Focused thread + page-mode composer** (3 tags — both nest a comment-dialog):

| Wireframe tag | Notes |
|---|---|
| `<velt-comments-sidebar-focused-thread-wireframe>` | `shouldShow` = `!componentConfig.skeletonLoading && componentConfig.focusedAnnotation`. Injects `focusedAnnotation` for descendants. |
| `<velt-comments-sidebar-focused-thread-dialog-container-wireframe>` | Container for the focused-thread comment-dialog (full Comment Dialog scope resolves inside). |
| `<velt-comment-sidebar-page-mode-composer-wireframe>` | Page-level "Add comment" composer — delegates to the Comment Dialog composer subtree. |

**Filter panel** (16 tags — category sub-panels + done / reset / view-all + per-category roots):

| Wireframe tag | Notes |
|---|---|
| `<velt-comments-sidebar-filter-wireframe>` | Expanded filter panel root. Gate with `{componentConfig.moreFiltersVisible}`. |
| `<velt-comments-sidebar-filter-title-wireframe>` / `…-close-button-…` / `…-done-button-…` / `…-reset-button-…` / `…-view-all-…` | Panel chrome + actions. The reset button is meaningful only when `{appliedFiltersCount} > 0`. |
| `<velt-comments-sidebar-filter-name-wireframe>` | Category label — bind `{filter.name}` (loop-scope). |
| `<velt-comments-sidebar-filter-status-wireframe>` / `…-priority-…` / `…-people-…` / `…-assigned-…` / `…-tagged-…` / `…-involved-…` / `…-document-…` / `…-location-…` / `…-versions-…` / `…-comment-type-…` / `…-category-…` / `…-custom-…` / `…-group-by-…` | Per-category sub-panel roots. Compose per-option rows below. |

**Filter-item + filter-search** (15 tags — per-option rows + checkbox variants + selected-tag pills):

| Wireframe tag | Notes |
|---|---|
| `<velt-comments-sidebar-filter-item-wireframe>` (+ `-name`, `-count`, `-checkbox` children) | Per-option row. Loop-scope `item` — gate with `{item.selected}`. |
| `<velt-comments-sidebar-filter-item-checkbox-checked-wireframe>` / `…-unchecked-…` | Two-variant checkbox. Gate with `velt-if="{item.selected}"` / `velt-if="!{item.selected}"`. |
| `<velt-comments-sidebar-filter-search-wireframe>` (+ `-input`, `-dropdown-icon`, `-tags`, `-tags-item`, `-tags-item-name`, `-tags-item-close`, `-hidden-count` children) | Filter-search row + selected-tag pills. Loop-scope `tag` inside the tag-item subtree. |

**Standalone filter dropdowns** (status / location / document — 13 tags):

| Wireframe tag | Notes |
|---|---|
| `<velt-comments-sidebar-status-wireframe>` (+ `-dropdown-trigger`, `-dropdown-trigger-name`, `-dropdown-trigger-arrow`, `-dropdown-trigger-indicator`, `-dropdown-content`, `-dropdown-content-item`, `-…-item-name`, `-…-item-icon`, `-…-item-count`, `-…-item-checkbox`(+ checked / unchecked) children) | Standalone status filter, placeable outside the main panel. Per-row loop-scope `item`. |
| `<velt-comments-sidebar-document-filter-dropdown-trigger-wireframe>` (+ `-trigger-label`, `-content`, `-content-item` children) | Standalone document filter. |
| `<velt-comments-sidebar-location-filter-dropdown-wireframe>` (+ trigger / trigger-label / content / content-item children) | Standalone location filter. |

**Minimal filter / actions dropdowns** (15 tags — compact layout):

| Wireframe tag | Notes |
|---|---|
| `<velt-comments-sidebar-minimal-filter-dropdown-trigger-wireframe>` (+ `-content` child) | Compact filter + sort UI. Used when `componentConfig.filterConfig.layout === 'minimal'`. |
| `<velt-comments-sidebar-minimal-filter-dropdown-content-filter-all-wireframe>` / `…-open` / `…-resolved` / `…-read` / `…-unread` / `…-assigned-to-me` / `…-reset-wireframe>` | Per-filter rows. Compare with `{selectedMinimalFilterDropdownOption.filter} === 'open'` etc. |
| `<velt-comments-sidebar-minimal-filter-dropdown-content-selected-icon-wireframe>` | Per-row selected tick. Gate with `{item.selected}`. |
| `<velt-comments-sidebar-minimal-filter-dropdown-content-sort-date-wireframe>` / `…-sort-unread-wireframe>` | Sort rows. Compare `{selectedMinimalFilterDropdownOption.sort}`. |
| `<velt-comments-sidebar-minimal-actions-dropdown-trigger-wireframe>` (+ `-content`, `-content-mark-all-read`, `-content-mark-all-resolved` children) | "⋯" actions dropdown. |

**Auxiliary** (3 tags):

| Wireframe tag | Notes |
|---|---|
| `<velt-comments-sidebar-reset-filter-button-wireframe>` | Reset-filters button (used in empty placeholder). Gate with `{appliedFiltersCount} > 0`. |
| `<velt-comment-sidebar-action-button-wireframe>` / `<velt-comment-sidebar-reset-filter-button-wireframe>` | Generic action / reset primitives used in placeholders. |

### V2 wireframe slots — Search, FilterButton, FilterContainer, FullscreenButton, ListGroupHeader

The V2 sidebar wireframe family (`VeltCommentsSidebarV2Wireframe.*` / `<velt-comments-sidebar-*-v2-wireframe>`) introduces five new bindable slot subtrees on top of the V1 surface above. Each leaf wireframe exposes its own per-slot variables — **bind dynamic data on the leaf, not its container** (signals only update live when bound to the leaf signal).

**Header — Search / FilterButton / FullscreenButton:**

| Wireframe tag | Exposed variables / `shouldShow` | Notes |
|---|---|---|
| `<velt-comments-sidebar-search-v2-wireframe>` (+ `-icon-`, `-input-` leaves) | `placeholder`, `searchable` | Header search row. Bind `placeholder` on `-input-` to customize the search placeholder live. |
| `<velt-comments-sidebar-filter-button-v2-wireframe>` (+ `-applied-icon-` leaf) | `isFilterActive`, `appliedCount` | Opens the Main Filter container. Drive the badge with `appliedCount`; gate the `-applied-icon-` leaf with `velt-if="{isFilterActive}"`. |
| `<velt-comments-sidebar-fullscreen-button-v2-wireframe>` | — | Header fullscreen toggle; emits the `onFullscreenClick` event upstream. |

**FilterContainer (Main Filter bottom-sheet/menu subtree):**

The `FilterContainer` wireframe is the new bottom-sheet/menu surface — distinct from the existing `FilterDropdown` header dropdown. Available variables across these leaves: `value`, `label`, `count`, `mode`, `selected`, `group`, `groupingEnabled`, `groupByOptions`, `chips`, `searchable`, `placeholder`, `isFilterActive`, `appliedCount`.

| Wireframe tag | Exposed variables / `shouldShow` | Notes |
|---|---|---|
| `<velt-comments-sidebar-filter-container-v2-wireframe>` | `isFilterActive`, `appliedCount` | Root container — holds title, group-by, section list, reset/apply/close. |
| `<velt-comments-sidebar-filter-container-v2-title-wireframe>` | `label` | Panel title. |
| `<velt-comments-sidebar-filter-container-v2-group-by-wireframe>` | `groupByOptions`, `groupingEnabled` | Renders only when grouping is enabled. Bind `groupByOptions` for its option list. |
| `<velt-comments-sidebar-filter-container-v2-section-list-wireframe>` → `…-section-wireframe>` (loop) | inherits `section` (one per filter section) | Per-section iteration. |
| `<velt-comments-sidebar-filter-container-v2-section-label-wireframe>` | `label`, `count` | Section header label + count. |
| `<velt-comments-sidebar-filter-container-v2-section-field-wireframe>` | `searchable`, `mode` | Field container; `searchable` toggles the per-section search box. |
| `<velt-comments-sidebar-filter-container-v2-section-control-wireframe>` (+ `-chevron-`, `-value-`, `-chip-list-` → `-chip-`, `-search-` leaves) | `value`, `chips`, `searchable`, `placeholder` | Section control row — chips list and inline search. |
| `<velt-comments-sidebar-filter-container-v2-section-option-list-wireframe>` → `-section-option-wireframe>` (loop) | inherits `option` per row | Per-option iteration. |
| `<velt-comments-sidebar-filter-container-v2-section-option-checkbox-wireframe>` | `selected` | Per-option checkbox state. Gate with `velt-if="{selected}"` (or the unchecked sibling). |
| `<velt-comments-sidebar-filter-container-v2-section-option-name-wireframe>` | `label` | Option label. |
| `<velt-comments-sidebar-filter-container-v2-section-option-count-wireframe>` | `count` | Option facet count. Gate with `velt-if="{componentConfig.filterCount}"` if you want to honor the `filterCount` prop. |
| `<velt-comments-sidebar-filter-container-v2-reset-button-wireframe>` / `…-apply-button-…` / `…-close-button-…` | `appliedCount`, `isFilterActive` | Footer actions. The reset button is meaningful only when `{appliedCount} > 0`. |

**List groups — ListGroupHeader:**

| Wireframe tag | Exposed variables | Notes |
|---|---|---|
| `<velt-comments-sidebar-list-group-header-v2-wireframe>` | injects `group` (one per group when grouping is enabled) | Renders once per group inside `<velt-comments-sidebar-list-v2-wireframe>`. |
| `<velt-comments-sidebar-list-group-header-v2-label-wireframe>` | `group.label` | Group display label. |
| `<velt-comments-sidebar-list-group-header-v2-count-wireframe>` | `group.count` | Group annotation count. |
| `<velt-comments-sidebar-list-group-header-v2-chevron-wireframe>` | inherits `group.isExpanded` | Expand / collapse chevron — drive direction with `velt-class="'collapsed': !{group.isExpanded}"`. |
| `<velt-comments-sidebar-list-group-header-v2-separator-wireframe>` | — | Inter-group separator. |

**FilterDropdown subtree leaves (new this release):**

| Wireframe tag | Exposed variables |
|---|---|
| `<velt-comments-sidebar-filter-dropdown-content-list-item-count-v2-wireframe>` | per-item `count` (new — surfaces per-option facet count alongside the existing indicator + label leaves). |
| `<velt-comments-sidebar-filter-dropdown-content-list-category-label-v2-wireframe>` | category `label` (new — sibling to the existing `Category.Content` leaf). |

> **Breaking change (V2 — current release):** the `velt-comments-sidebar-minimal-actions-dropdown-v2-wireframe` family (Trigger / Content / MarkAllRead / MarkAllResolved) is removed. Mark-all-read and mark-all-resolved are now exposed by the combined `actions` filter-dropdown configured via the `minimalFilters` input on `VeltCommentsSidebarV2` — bind those rows inside the existing `FilterDropdown` subtree (`<velt-comments-sidebar-filter-dropdown-content-list-item-v2-wireframe>` + `…-item-count-v2-wireframe`).

### `defaultCondition` and Common Props

| React Prop | HTML Attribute | Type | Default | Behavior |
|---|---|---|---|---|
| `defaultCondition` | `default-condition` | `boolean \| "true" \| "false"` | `true` | When `false`, bypasses the slot's `shouldShow` for previews. |
| `fullScreen` / `embedMode` / `floatingMode` / `pageMode` / `darkMode` / `readOnly` / `variant` | matching kebab attributes | — | — | Layout flags. Reflected onto `componentConfig.*` (read inside wireframes via the full path). |
| `dialogVariant` / `focusedThreadDialogVariant` / `pageModeComposerVariant` | matching kebab attributes | `string` | — | Variant ids forwarded to nested comment-dialogs. |
| `sortBy` / `sortOrder` / `sortData` / `systemFiltersOperator` / `currentLocationSuffix` / `selection` / `expandOnSelection` / `queryParamsComments` | matching kebab attributes | — | — | Behavioral props (operator default `'AND'`). |

**Signal inputs** (Angular parent-to-child wiring; React/HTML do not require these):

```typescript
// On any <velt-comments-sidebar-...-wireframe> in an Angular template
[componentConfigSignal]="config()"   // shared per-sidebar config signal
```

### Common mistakes — DO NOT

**1. DO NOT drop the `componentConfig.` prefix on flat properties.** The sidebar is hybrid — mapped names (`focusedAnnotation`, `appliedFiltersCount`, `annotation`, `user`, `darkMode`, `variant`, `unreadCommentAnnotationCount`, …) resolve as bare short names; **everything else** lives flat on `componentConfig`. `<velt-data field="skeletonLoading" />` returns nothing — use `<velt-data field="componentConfig.skeletonLoading" />`. Similarly: `componentConfig.virtualScrollData`, `componentConfig.moreFiltersVisible`, `componentConfig.filterConfig.layout`, `componentConfig.noCommentsFound`, …

**2. DO NOT reference `focusedAnnotation` outside the focused-thread subtree.** It's loop-scope — only resolves inside `<velt-comments-sidebar-focused-thread-wireframe>` (and the focused-thread-dialog container). Referencing it from the list or filter panel returns `undefined`.

**3. DO NOT confuse `componentConfig.noCommentsFound` with `componentConfig.noCommentsFoundForAppliedFilters`.** The first is "no annotations exist on the document"; the second is "filters reduced the list to zero". Empty-state copy + the reset-filter button should branch on the second.

**4. DO NOT confuse the two prefixes.** Both `<velt-comments-sidebar-...>` (plural, sidebar-level) and `<velt-comment-sidebar-...>` (singular, header / search / list-level) appear in the catalog. The format guide is consistent inside each subtree — copy the tag name exactly from the docs source; don't infer.

**5. DO NOT bind `componentConfig.openMoreFilters` / `toggleMoreFilters` with `velt-data`.** They are callback functions — wire them into a custom click handler in your host code, not into the template-variable resolver.

**6. DO NOT mix `defaultCondition` with `velt-if` to mean the same thing.** `defaultCondition={false}` disables the slot's internal `shouldShow` (forcing render). `velt-if` adds a new gate on top. Combining them inverts the semantics you probably want.

**7. DO NOT compare `selectedMinimalFilterDropdownOption.filter` directly to a boolean.** It is a string (`'all'`, `'open'`, `'resolved'`, `'read'`, `'unread'`, `'assigned-to-me'`). Compare with `===` inside the per-row gate: `velt-class="'selected': '{selectedMinimalFilterDropdownOption.filter} === \'open\''"`.

**8. DO NOT remount the sidebar to switch between docked / floating / page-mode / embed layouts.** `componentConfig.floatingMode` / `componentConfig.pageMode` / `componentConfig.embedMode` / `componentConfig.fullScreen` are exposed as variables — toggle classes with `velt-class`, don't unmount.

**Verification:**
- [ ] Mapped names (`focusedAnnotation`, `appliedFiltersCount`, `filteredCommentAnnotationsCount`, `unreadCommentAnnotationCount`, `selectedMinimalFilterDropdownOption`, `annotation`, `annotations`, `user`, `darkMode`, `variant`) are referenced as bare short names
- [ ] Every other property uses the full `componentConfig.<name>` path (skeleton / empty / filter / virtual-scroll / mode state)
- [ ] Loop-scope (`focusedAnnotation` inside focused-thread, `filter` / `item` / `group` / `tag` inside their owning iteration, `group` inside `list-group-header-v2`) is used only inside the owning slot
- [ ] Empty-state copy + reset-filter button branch on `noCommentsFoundForAppliedFilters` (not `noCommentsFound`) when filters are applied
- [ ] Skeleton vs. list mutual exclusion uses `{componentConfig.skeletonLoading}` to gate the skeleton — the list does not need an explicit `velt-if` (the wireframe handles it)
- [ ] Nested comment-dialog wireframes (list-item, focused-thread, page-mode composer) use the full Comment Dialog variable surface — see `wireframe-variables-comment-dialog.md`
- [ ] Tag names are copied verbatim — both `velt-comments-sidebar-…` and `velt-comment-sidebar-…` prefixes are valid depending on the subtree
- [ ] Minimal-filter row gating compares `selectedMinimalFilterDropdownOption.filter` / `.sort` with `===`, not boolean coercion
- [ ] V2 FilterContainer leaves bind `value` / `label` / `count` / `selected` / `chips` / `placeholder` on the leaf wireframe (not its container) so signals update live
- [ ] V2 `FilterButton.AppliedIcon` is gated on `{isFilterActive}` and the badge text is driven by `{appliedCount}`
- [ ] V2 `ListGroupHeader.Chevron` is class-toggled on `{group.isExpanded}` (not unmounted) so collapse-state is reversible
- [ ] No references remain to the removed `velt-comments-sidebar-minimal-actions-dropdown-v2-wireframe` family — migrate to the `actions` filter-dropdown configured via `minimalFilters`

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/comment-sidebar/comment-sidebar-wireframe-variables — "Comment Sidebar Wireframe Variables" (full per-slot reference)
- https://docs.velt.dev/ui-customization/features/async/comments/comment-sidebar/comment-sidebar-v2-wireframes — "V2 Sidebar Wireframes" (Search / FilterButton / FilterContainer / FullscreenButton / ListGroupHeader new-slot bindings)
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-wireframes.md` (structural catalog), `surface/surface-sidebar.md` (sidebar surface), `surface/surface-sidebar-v2.md` (V2 primitives + declarative filter model), `wireframe-variables-comment-dialog.md` (variables that resolve inside nested dialog tags rendered by the list / focused-thread / page-mode composer), `wireframe-variables-comment-sidebar-button.md` (the button that opens this sidebar)
