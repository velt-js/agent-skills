---
title: Bind Inline Comments Section Wireframe Slots Using Template Variables
impact: MEDIUM
impactDescription: Drives skeleton-loader state, filter/sort dropdown rendering, per-status filter rows, composer placeholders, and target-element wiring inside the Inline Comments Section wireframe without re-subscribing to annotation state
tags: wireframe, template-variables, velt-data, velt-if, velt-class, defaultCondition, inline-comments-section, inline-comments, filter-dropdown, sort-dropdown, composer
---

## Bind Inline Comments Section Wireframe Slots Using Template Variables

The Inline Comments Section wireframe family (`<velt-inline-comments-section-...-wireframe>` / `<VeltInlineCommentsSectionWireframe.*>`) renders a list of annotations scoped to a target DOM element, plus its filter / sort dropdowns and a per-section composer. It iterates `annotations` and mounts the standard Comment Dialog primitives for each — variables that resolve inside those nested dialog tags are documented in `wireframe-variables-comment-dialog.md`.

Read the wireframe's exposed variables with three directives — `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Use these instead of re-implementing skeleton tracking, filter/sort state, or annotation iteration on top of `useCommentAnnotations`. Variables are mapped — reference them by their short name, except for the four conflicting names that **must** be read via their explicit path.

For the structural catalog of which wireframe tags exist and how they nest, see `ui/ui-wireframes.md`. For the Inline Comments mode itself (setup, target-element wiring, multi-thread layout), see `mode/mode-inline-comments.md`.

**Incorrect (rebuilding section state from `useCommentAnnotations` and conditionally mounting slots):**

```jsx
import { useCommentAnnotations } from '@veltdev/react';
import { VeltInlineCommentsSectionWireframe } from '@veltdev/react';
import { useState } from 'react';

function Section({ targetElementId }) {
  const all = useCommentAnnotations();
  // Reimplements filter + sort + skeleton tracking the wireframe already exposes.
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('createdAt');
  const annotations = all?.filter(a => a.targetElementId === targetElementId);
  if (loading) return <div className="skel" />;
  return (
    <VeltInlineCommentsSectionWireframe>
      <span>{annotations.length} comments</span>
      {annotations.map(a => <div key={a.annotationId}>{a.comments[0]?.commentText}</div>)}
    </VeltInlineCommentsSectionWireframe>
  );
}
```

**Correct (read the slot's injected variables; let `List` iterate for you):**

```jsx
import { VeltInlineCommentsSectionWireframe } from '@veltdev/react';

<VeltInlineCommentsSectionWireframe
  veltClass="'dark': {darkMode}, 'readonly': {featureState.readOnly}, 'composer-{composerPosition}': true">
  <VeltInlineCommentsSectionWireframe.Skeleton veltIf="{skeletonLoading}" />

  <header className="my-section__header">
    <VeltInlineCommentsSectionWireframe.CommentCount>
      <VeltData field="annotations.length" /> comments
    </VeltInlineCommentsSectionWireframe.CommentCount>

    <VeltInlineCommentsSectionWireframe.FilterDropdown.Trigger
      veltClass="'open': {filterState.filterDropdownOpen}">
      <span>Filter (<VeltData field="filterState.filters.length" />)</span>
    </VeltInlineCommentsSectionWireframe.FilterDropdown.Trigger>

    <VeltInlineCommentsSectionWireframe.SortingDropdown.Trigger>
      <span>Sort: <VeltData field="sortState.activeSortOption" /></span>
    </VeltInlineCommentsSectionWireframe.SortingDropdown.Trigger>
  </header>

  <VeltInlineCommentsSectionWireframe.List />
  <VeltInlineCommentsSectionWireframe.ComposerContainer />
</VeltInlineCommentsSectionWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-inline-comments-section-wireframe>
  <velt-inline-comments-section-skeleton-wireframe velt-if="{skeletonLoading}"></velt-inline-comments-section-skeleton-wireframe>
  <header class="my-section__header">
    <velt-inline-comments-section-comment-count-wireframe>
      <velt-data field="annotations.length"></velt-data> comments
    </velt-inline-comments-section-comment-count-wireframe>
    <velt-inline-comments-section-filter-dropdown-trigger-wireframe
      velt-class="'open': {filterState.filterDropdownOpen}">
      <span>Filter (<velt-data field="filterState.filters.length"></velt-data>)</span>
    </velt-inline-comments-section-filter-dropdown-trigger-wireframe>
  </header>
  <velt-inline-comments-section-list-wireframe></velt-inline-comments-section-list-wireframe>
  <velt-inline-comments-section-composer-container-wireframe></velt-inline-comments-section-composer-container-wireframe>
</velt-inline-comments-section-wireframe>
```

### Variable namespaces

**App State** — identity:

| Variable | Type | Notes |
|---|---|---|
| `user` | `User` | Currently identified end-user. |

**Data State** — annotations + composer + statuses:

| Variable | Type | Notes |
|---|---|---|
| `annotations` | `CommentAnnotation[]` | Annotations rendered after filter / sort. Drives the count badge and the `List` iteration. |
| `allAnnotations` | `CommentAnnotation[]` | Unfiltered list scoped to the section's target element. |
| `composerCommentAnnotation` | `CommentAnnotation \| undefined` | Draft annotation being composed in this section. Gate the composer with `velt-if="{composerCommentAnnotation}"` when you need to know it exists. |
| `statuses` | `CustomStatus[]` | Available status options for the filter dropdown. |

**UI State — filter/sort, layout, identity wiring:**

| Variable | Type | Notes |
|---|---|---|
| `skeletonLoading` | `boolean` | Skeleton loader is active. Drives `skeleton-wireframe` `shouldShow`. |
| `darkMode` | `boolean` | Dark mode is active. |
| `variant` | `string` | Per-instance variant tag from the host element. |
| `uiState.componentId` | `string` | Unique id of this section instance. Use the full path — `componentId` is conflicting. |
| `filterState` / `filterState.filters` / `filterState.filterDropdownOpen` | `InlineSectionFilterState` | Combined filter state — per-status rows + dropdown-open flag. |
| `sortState` / `sortState.sortBy` / `sortState.sortOrder` / `sortState.activeSortOption` / `sortState.sortingDropdownOpen` | `InlineSectionSortState` | Combined sort state. |
| `isResolvedCommentsOnDomFilterSelected` | `boolean` | "Show resolved" filter is currently selected. |
| `resolvedCommentsOnDom` | `boolean` | Resolved annotations are rendered. |
| `selectedAnnotationsMap` | `SelectedAnnotationsMap` | Map keyed by `annotationId` → selected flag. Use bracket lookup: `{selectedAnnotationsMap[annotation.annotationId]}`. |
| `selectedAnnotationsLocationMap` | `SelectedAnnotationsLocationMap` | Internal selection bookkeeping by location — bracket-lookup individual entries if needed. |
| `parentLocalUIState.shadowDom` | `boolean` | Shadow-DOM rendering is enabled. |
| `dialogVariant` / `composerVariant` | `string` | Variants forwarded to nested comment-dialogs / composer. |
| `composerPosition` | `'top' \| 'bottom'` | Composer placement. |
| `multiThread` | `boolean` | Multi-thread layout is active. |
| `fullExpanded` | `boolean` | Section is fully expanded. |
| `commentPlaceholder` / `replyPlaceholder` / `composerPlaceholder` / `editPlaceholder` / `editCommentPlaceholder` / `editReplyPlaceholder` | `string` | Placeholder strings for each composer surface. |
| `targetElementId` | `string` | DOM target the section is anchored to. |
| `folderId` / `veltFolderId` / `clientDocumentId` / `documentId` / `locationId` | `string` | Folder / document / location wiring. |
| `context` | `Record<string, any>` | Free-form annotation context. Cross-reference `mode/mode-inline-comments.md` for `{context.someProperty}` patterns. |
| `contextOptions` | `ContextOptions` | Context-options config for new annotations. |
| `readOnly` | `boolean` | Per-instance read-only flag. **Prefer `featureState.readOnly`** (see conflicts). |
| `messageTruncation` | `boolean` | Per-instance truncation flag. **Prefer `featureState.messageTruncation`** (see conflicts). |
| `messageTruncationLines` | `number` | Per-instance truncation line count. **Prefer `featureState.messageTruncationLines`** (see conflicts). |

**Feature State** — workspace capability flags:

| Variable | Type | Notes |
|---|---|---|
| `featureState.readOnly` | `boolean` | Section is in read-only mode (workspace-wide). |
| `featureState.anonymousEmail` | `boolean` | Anonymous-email capture is enabled. |
| `featureState.messageTruncation` | `boolean` | Long messages are truncated. |
| `featureState.messageTruncationLines` | `number` | Line count for truncation. |

### Loop-scope (context-specific) variables

These resolve only inside their owning iteration slot — referencing them outside returns `undefined`.

| Variable | Type | Available in |
|---|---|---|
| `filter` / `filter.id` / `filter.isSelected` / `filter.metadata` | `InlineSectionFilterItem<CustomStatus>` | Filter-dropdown list-item / checkbox / label tags. |
| `sortOption` | `InlineSortingCriteria` | Sorting-dropdown content-item / -icon / -tick tags. |
| `sortOptionText` | `string` | Sorting-dropdown content-item / -name tags. |
| `isActive` | `boolean` | Sorting-dropdown content-item (this is the active sort option). |
| `isAscending` | `boolean` | Sorting-dropdown content-item-icon (current sort is ascending). |

Inside the nested `List` and `ComposerContainer` slots, the standard Comment Dialog loop-scope (`comment`, `commentObj`, `commentIndex`, `commentAnnotation`) resolves — see `wireframe-variables-comment-dialog.md`.

### Naming conflicts — use the full path

Four names collide with mappings used elsewhere. Inside an Inline Comments Section wireframe, prefer the explicit path:

| Conflicting name | Use this in Inline Comments Section |
|---|---|
| `readOnly` | `featureState.readOnly` (workspace) **or** `{readOnly}` (per-instance local) |
| `messageTruncation` | `featureState.messageTruncation` |
| `messageTruncationLines` | `featureState.messageTruncationLines` |
| `componentId` | `uiState.componentId` |

### Wireframe tags

The section has a root primitive, a panel container, a skeleton, a count label, a list (iteration), a composer container, and two dropdowns (filter + sort). The full structural tree is catalogued in `ui/ui-wireframes.md`.

**Root + structural:**

| Wireframe tag | React component | Notes |
|---|---|---|
| `<velt-inline-comments-section-wireframe>` | `<VeltInlineCommentsSectionWireframe>` | Root. Always renders when present. |
| `<velt-inline-comments-section-panel-wireframe>` | `<VeltInlineCommentsSectionWireframe.Panel>` | Wrapper container — composes header + list + composer. |
| `<velt-inline-comments-section-skeleton-wireframe>` | `<VeltInlineCommentsSectionWireframe.Skeleton>` | Skeleton loader. `shouldShow` requires `skeletonLoading === true`. |
| `<velt-inline-comments-section-comment-count-wireframe>` | `<VeltInlineCommentsSectionWireframe.CommentCount>` | "N comments" label — bind `<velt-data field="annotations.length" />`. |
| `<velt-inline-comments-section-list-wireframe>` | `<VeltInlineCommentsSectionWireframe.List>` | Iterates `annotations`. Renders Comment Dialog primitives per entry — nested tags resolve dialog variables. |
| `<velt-inline-comments-section-composer-container-wireframe>` | `<VeltInlineCommentsSectionWireframe.ComposerContainer>` | Per-section composer. Nested composer slots resolve Comment Dialog composer variables. |

**Filter dropdown subtree** (per-status rows expose `filter`):

| Wireframe tag | Notes |
|---|---|
| `<velt-inline-comments-section-filter-dropdown-wireframe>` | Root. |
| `<velt-inline-comments-section-filter-dropdown-trigger-wireframe>` (+ `-name`, `-arrow` children) | Trigger pill — bind `{filterState.filters.length}` on `-name`. |
| `<velt-inline-comments-section-filter-dropdown-content-wireframe>` (+ `-list`, `-list-item`, `-list-item-checkbox`, `-list-item-label`, `-apply-button` children) | Open menu. Per-row tags expose `filter`. |

**Sorting dropdown subtree** (per-row tags expose `sortOption` / `sortOptionText` / `isActive` / `isAscending`):

| Wireframe tag | Notes |
|---|---|
| `<velt-inline-comments-section-sorting-dropdown-wireframe>` | Root. |
| `<velt-inline-comments-section-sorting-dropdown-trigger-wireframe>` (+ `-icon`, `-name` children) | Trigger pill. |
| `<velt-inline-comments-section-sorting-dropdown-content-wireframe>` (+ `-item`, `-item-icon`, `-item-name`, `-item-tick` children) | Open menu. Per-row tags carry loop-scope; `-item-tick` is gated by `isActive`. |

### `defaultCondition` and Angular signal inputs

| React Prop | HTML Attribute | Type | Default | Behavior |
|---|---|---|---|---|
| `defaultCondition` | `default-condition` | `boolean \| "true" \| "false"` | `true` | When `false`, the component renders regardless of its internal `shouldShow` gate. Use to force-show the skeleton outside its load window or a sort-tick when `isActive` is false. |

**Angular signal inputs** (parent-to-child wiring; React/HTML do not require these):

```typescript
// On any <velt-inline-comments-section-...-wireframe> in an Angular template
[componentConfigSignal]="config()"   // annotations, statuses, filterState, sortState, ...
[parentLocalUIState]="localUI()"     // darkMode, variant, shadowDom, dialogVariant, ...
```

The root `<velt-inline-comments-section>` element additionally accepts host attributes that map onto config and local UI state: `target-element-id`, `folder-id`, `document-id`, `location-id`, `context`, `dialog-variant`, `composer-variant`, `composer-position`, `comment-placeholder` / `reply-placeholder` / `composer-placeholder` / `edit-placeholder`, `multi-thread`, `full-expanded`, `read-only`, `message-truncation`, `message-truncation-lines`, `dark-mode`, `variant`, `shadow-dom`.

### Common mistakes — DO NOT

**1. DO NOT prefix mapped variables with `componentConfig.`.** Variables are mapped to short names. `<velt-data field="componentConfig.annotations.length" />` resolves to nothing — use `<velt-data field="annotations.length" />`. The exception is the four conflicting names above, which **require** their explicit path.

**2. DO NOT read `readOnly` / `messageTruncation` / `messageTruncationLines` at the short name when you mean the workspace-wide flag.** The short names are the per-instance local copies; the workspace flags live under `featureState.*`. They can disagree.

**3. DO NOT remount the section to switch between filter values.** `filterState.filters`, `sortState.sortBy`, and `sortState.sortOrder` are exposed as variables — toggle classes with `velt-class`, do not unmount.

**4. DO NOT iterate `annotations` yourself.** The `<velt-inline-comments-section-list-wireframe>` iterates and mounts the standard Comment Dialog primitives per annotation, injecting the per-annotation context that nested dialog tags read.

**5. DO NOT compare `selectedAnnotationsMap` to a boolean directly.** It is a map. Bracket-lookup the current annotation: `{selectedAnnotationsMap[annotation.annotationId]}` (inside an iteration where `annotation` is in scope).

**6. DO NOT reference `filter` / `sortOption` / `sortOptionText` / `isActive` / `isAscending` outside their owning dropdown row tag.** They are loop-scoped — referencing them from the header or the list returns `undefined`.

**7. DO NOT mix `defaultCondition` with `velt-if` to mean the same thing.** `defaultCondition={false}` disables the slot's internal `shouldShow` (forcing render). `velt-if` adds a new gate on top. Combining them inverts the semantics you probably want.

**Verification:**
- [ ] Wireframe slots reference mapped variables by short name — `{annotations}`, `{filterState}`, `{sortState}`, `{composerPosition}` — never `componentConfig.<mapped-name>`
- [ ] The four conflicting names use their explicit path: `featureState.readOnly`, `featureState.messageTruncation`, `featureState.messageTruncationLines`, `uiState.componentId`
- [ ] Loop-scope (`filter`, `sortOption`, `sortOptionText`, `isActive`, `isAscending`) is used only inside the owning filter/sort row tag
- [ ] `selectedAnnotationsMap` is bracket-looked-up against `annotation.annotationId`, not coerced to a boolean
- [ ] The list and composer rely on the standard Comment Dialog wireframe variables (see `wireframe-variables-comment-dialog.md`) — do not iterate `annotations` by hand
- [ ] `defaultCondition` / `default-condition` is used only to override an unwanted `shouldShow` gate
- [ ] Angular usage wires `[componentConfigSignal]` and `[parentLocalUIState]` from the parent — React/HTML usage does not

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/inline-comments-section/wireframe-variables — "Inline Comments Section Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-wireframes.md` (structural catalog), `mode/mode-inline-comments.md` (Inline Comments mode setup + `{context.*}` patterns), `wireframe-variables-comment-dialog.md` (variables that resolve inside the nested list / composer dialog tags)
