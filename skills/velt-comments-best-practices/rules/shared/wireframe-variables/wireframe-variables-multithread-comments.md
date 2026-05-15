---
title: Bind Multithread Comments Wireframe Slots Using Template Variables
impact: MEDIUM
impactDescription: Drives thread-count display, empty-state placeholders, minimal filter/sort + bulk-actions dropdown rendering, and anchor-annotation composer gating inside the Multithread Comments wireframe without re-implementing thread iteration
tags: wireframe, template-variables, velt-data, velt-if, velt-class, defaultCondition, multi-thread-comment-dialog, multithread-comments, minimal-filter, minimal-actions
---

## Bind Multithread Comments Wireframe Slots Using Template Variables

The Multithread Comments wireframe family (`<velt-multi-thread-comment-dialog-...-wireframe>` / `<VeltMultiThreadCommentDialogWireframe.*>`) hosts multiple comment threads in a single panel — it iterates `filteredAnnotations` and mounts the standard Comment Dialog primitives for each. Variables that resolve inside those nested dialog tags are documented in `wireframe-variables-comment-dialog.md`.

Read the wireframe's exposed variables with three directives — `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Use these instead of re-implementing thread counts, filter/sort rows, or composer visibility on top of `useCommentAnnotations`. Variables are mapped — reference them by their short name, except for two conflicting names that **must** be read via their explicit path.

For the structural catalog of which wireframe tags exist and how they nest, see `ui/ui-wireframes.md`.

**Incorrect (rebuilding the panel state from `useCommentAnnotations`):**

```jsx
import { useCommentAnnotations } from '@veltdev/react';
import { VeltMultiThreadCommentDialogWireframe } from '@veltdev/react';
import { useState } from 'react';

function Panel() {
  const all = useCommentAnnotations();
  // Reimplements filter + sort + non-draft count the wireframe already exposes.
  const [filter, setFilter] = useState('all');
  const filtered = all?.filter(a => filter === 'all' || (filter === 'unread' && a.unread));
  const count = filtered?.filter(a => !a.draft).length ?? 0;
  return (
    <VeltMultiThreadCommentDialogWireframe>
      <span>{count} threads</span>
      {filtered?.length === 0 && <p>No threads to show.</p>}
      {filtered?.map(a => <div key={a.annotationId}>{a.comments[0]?.commentText}</div>)}
    </VeltMultiThreadCommentDialogWireframe>
  );
}
```

**Correct (read the slot's injected variables; let `List` iterate for you):**

```jsx
import { VeltMultiThreadCommentDialogPanelWireframe, VeltMultiThreadCommentDialogWireframe } from '@veltdev/react';

<VeltMultiThreadCommentDialogPanelWireframe
  veltClass="'dark': {darkMode}, 'readonly': {readOnly}, 'inbox': {inboxMode}, 'filter-{minimalFilter}': true">
  <header className="my-mt__header">
    <VeltMultiThreadCommentDialogWireframe.CommentCount>
      <VeltData field="nonDraftCommentsCount" /> threads
    </VeltMultiThreadCommentDialogWireframe.CommentCount>
    <VeltMultiThreadCommentDialogWireframe.MinimalFilterDropdown.Trigger
      veltClass="'open': {minimalFilterDropdownOpen}">
      <span><VeltData field="minimalFilter" /></span>
    </VeltMultiThreadCommentDialogWireframe.MinimalFilterDropdown.Trigger>
  </header>

  <VeltMultiThreadCommentDialogWireframe.List />

  <VeltMultiThreadCommentDialogWireframe.EmptyPlaceholder
    veltIf="{noCommentsFound} || {noCommentsFoundForAppliedFilters}">
    <p>No threads to show.</p>
    <VeltMultiThreadCommentDialogWireframe.ResetFilterButton />
  </VeltMultiThreadCommentDialogWireframe.EmptyPlaceholder>

  <VeltMultiThreadCommentDialogWireframe.ComposerContainer
    veltIf="!{hideMultiThreadAnnotationComposer}" />
</VeltMultiThreadCommentDialogPanelWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-multi-thread-comment-dialog-panel-wireframe>
  <header class="my-mt__header">
    <velt-multi-thread-comment-dialog-comment-count-wireframe>
      <velt-data field="nonDraftCommentsCount"></velt-data> threads
    </velt-multi-thread-comment-dialog-comment-count-wireframe>
    <velt-multi-thread-comment-dialog-minimal-filter-dropdown-trigger-wireframe
      velt-class="'open': {minimalFilterDropdownOpen}">
      <span><velt-data field="minimalFilter"></velt-data></span>
    </velt-multi-thread-comment-dialog-minimal-filter-dropdown-trigger-wireframe>
  </header>
  <velt-multi-thread-comment-dialog-list-wireframe></velt-multi-thread-comment-dialog-list-wireframe>
  <velt-multi-thread-comment-dialog-empty-placeholder-wireframe
    velt-if="{noCommentsFound} || {noCommentsFoundForAppliedFilters}">
    <p>No threads to show.</p>
    <velt-multi-thread-comment-dialog-reset-filter-button-wireframe></velt-multi-thread-comment-dialog-reset-filter-button-wireframe>
  </velt-multi-thread-comment-dialog-empty-placeholder-wireframe>
  <velt-multi-thread-comment-dialog-composer-container-wireframe
    velt-if="!{hideMultiThreadAnnotationComposer}"></velt-multi-thread-comment-dialog-composer-container-wireframe>
</velt-multi-thread-comment-dialog-panel-wireframe>
```

### Variable namespaces

**Data State** — annotation list + focus + host wiring:

| Variable | Type | Notes |
|---|---|---|
| `annotation` / `annotation.annotationId` | `CommentAnnotation \| null` | Currently focused annotation. Gate with `velt-if="{annotation}"`. |
| `annotations` | `CommentAnnotation[]` | All annotations in scope. |
| `filteredAnnotations` | `CommentAnnotation[]` | Annotations after filter / sort. Drives the `List` iteration. |
| `multiThreadAnnotationId` | `string \| null` | Id of the multi-thread anchor annotation. |
| `multiThreadCommentAnnotation` | `CommentAnnotation` | Anchor annotation object. |
| `nonDraftCommentsCount` | `number` | Count of non-draft threads — drives the count label. |
| `data.user` | `User \| null` | Currently identified end-user. Use the explicit `data.user` path — `user` is a conflicting name. |
| `containerComponentId` | `string \| null` | Owning container id (host wiring). |
| `context` | `any` | Free-form annotation context. |
| `data.contextId` | `string \| null` | Context id linking this dialog to a host context. |

**UI State — layout + filter/sort + empty-state:**

| Variable | Type | Notes |
|---|---|---|
| `commentPinSelected` | `boolean` | Pin associated with the focused annotation is selected. |
| `commentPinType` | `string \| null` | Pin shape (`'pin'`, `'bubble'`, etc.). |
| `inboxMode` | `boolean` | Inbox-style layout is active. |
| `readOnly` | `boolean` | Dialog is in read-only mode. |
| `hideMultiThreadAnnotationComposer` | `boolean` | Anchor-annotation composer should be hidden. Drives `composer-container-wireframe` `shouldShow` via `!hideMultiThreadAnnotationComposer`. |
| `dialogVariant` | `string` | Variant forwarded to nested comment-dialogs. |
| `minimalFilter` | `'all' \| 'read' \| 'unread' \| 'resolved'` | Currently selected filter row. |
| `selectedMinimalFilterDropdownOption.sorting` | `SidebarSortingCriteria` | Currently selected sort row. |
| `selectedMinimalFilterDropdownOption.filter` | `'all' \| 'read' \| 'unread' \| 'resolved'` | Selected filter — mirrors `minimalFilter`. |
| `minimalFilterDropdownOpen` | `boolean` | Filter+sort dropdown menu is open. |
| `minimalActionsDropdownOpen` | `boolean` | Bulk-actions dropdown menu is open. |
| `noCommentsFoundForAppliedFilters` | `boolean` | Filters reduced the list to zero. |
| `noCommentsFound` | `boolean` | No annotations exist in scope (unfiltered). |
| `darkMode` | `boolean` | Dark mode is active. |
| `variant` | `string \| null` | Per-instance variant tag from the host element. |
| `uiState.shadowDom` | `boolean` | Shadow-DOM rendering is enabled (per-instance). Use the full path — `shadowDom` is conflicting. |
| `parentLocalUIState.darkMode` / `parentLocalUIState.variant` / `parentLocalUIState.shadowDom` | `boolean` / `string` / `boolean` | Per-render aliases for `darkMode` / `variant` / `shadowDom`. Set via host attributes. |

### Loop-scope (context-specific) variables

These resolve only inside their owning iteration slot — referencing them outside returns `undefined`.

| Variable | Type | Available in |
|---|---|---|
| `isSelected` | `boolean` | All six `*-minimal-filter-dropdown-content-{filter,sort}-*` row tags. |

Inside the `List` and `ComposerContainer`, the standard Comment Dialog loop-scope (`comment`, `commentObj`, `commentIndex`, `commentAnnotation`) resolves — see `wireframe-variables-comment-dialog.md`.

### Naming conflicts — use the full path

Two names collide with mappings used by Comment Dialog. Inside a Multithread Comments wireframe, prefer the explicit path:

| Conflicting name | Use this in Multithread Comments |
|---|---|
| `user` | `data.user` |
| `shadowDom` | `parentLocalUIState.shadowDom` (per-render) **or** `uiState.shadowDom` (per-instance) |

### Wireframe tags

**Root + structural:**

| Wireframe tag | React component | Notes |
|---|---|---|
| `<velt-multi-thread-comment-dialog-wireframe>` | `<VeltMultiThreadCommentDialogWireframe>` | Outer wireframe — wraps the entire panel. |
| `<velt-multi-thread-comment-dialog-panel-wireframe>` | `<VeltMultiThreadCommentDialogPanelWireframe>` | Visible container. |
| `<velt-multi-thread-comment-dialog-list-wireframe>` | `<VeltMultiThreadCommentDialogWireframe.List>` | Iterates `filteredAnnotations`. Renders Comment Dialog primitives per entry — nested tags resolve dialog variables. |
| `<velt-multi-thread-comment-dialog-comment-count-wireframe>` | `<VeltMultiThreadCommentDialogWireframe.CommentCount>` | Count label — bind `<velt-data field="nonDraftCommentsCount" />`. |
| `<velt-multi-thread-comment-dialog-empty-placeholder-wireframe>` | `<VeltMultiThreadCommentDialogWireframe.EmptyPlaceholder>` | Empty-state. `shouldShow` requires `noCommentsFound || noCommentsFoundForAppliedFilters`. |
| `<velt-multi-thread-comment-dialog-close-button-wireframe>` | `<VeltMultiThreadCommentDialogWireframe.CloseButton>` | Close button. |
| `<velt-multi-thread-comment-dialog-new-thread-button-wireframe>` | `<VeltMultiThreadCommentDialogWireframe.NewThreadButton>` | Add-thread button. |
| `<velt-multi-thread-comment-dialog-reset-filter-button-wireframe>` | `<VeltMultiThreadCommentDialogWireframe.ResetFilterButton>` | Inside the empty placeholder. `shouldShow` requires `noCommentsFoundForAppliedFilters`. |
| `<velt-multi-thread-comment-dialog-composer-container-wireframe>` | `<VeltMultiThreadCommentDialogWireframe.ComposerContainer>` | New-thread composer. `shouldShow` requires `!hideMultiThreadAnnotationComposer`. Nested composer slots resolve Comment Dialog composer variables. |

**Minimal filter dropdown subtree** (per-row tags expose `isSelected`):

| Wireframe tag | Notes |
|---|---|
| `<velt-multi-thread-comment-dialog-minimal-filter-dropdown-wireframe>` | Root. |
| `<velt-multi-thread-comment-dialog-minimal-filter-dropdown-trigger-wireframe>` | Trigger pill. |
| `<velt-multi-thread-comment-dialog-minimal-filter-dropdown-content-wireframe>` | Open menu — gate with `{minimalFilterDropdownOpen}`. |
| `…-content-filter-all-wireframe` / `…-filter-read-wireframe` / `…-filter-unread-wireframe` / `…-filter-resolved-wireframe` | Per-filter rows. Each exposes `isSelected`. |
| `…-content-selected-icon-wireframe` | Per-row selected tick — gate with `velt-if="{isSelected}"`. |
| `…-content-sort-date-wireframe` / `…-sort-unread-wireframe` | Per-sort rows. Each exposes `isSelected`. |

**Minimal actions dropdown subtree** (bulk-actions):

| Wireframe tag | Notes |
|---|---|
| `<velt-multi-thread-comment-dialog-minimal-actions-dropdown-wireframe>` | Root. |
| `<velt-multi-thread-comment-dialog-minimal-actions-dropdown-trigger-wireframe>` | Trigger ("⋯"). |
| `<velt-multi-thread-comment-dialog-minimal-actions-dropdown-content-wireframe>` | Open menu — gate with `{minimalActionsDropdownOpen}`. |
| `…-content-mark-all-read-wireframe` / `…-mark-all-resolved-wireframe` | Action rows. |

### `defaultCondition` and Angular signal inputs

| React Prop | HTML Attribute | Type | Default | Behavior |
|---|---|---|---|---|
| `defaultCondition` | `default-condition` | `boolean \| "true" \| "false"` | `true` | When `false`, the component renders regardless of its internal `shouldShow` gate. Use to force-show the empty placeholder, the reset-filter button, or the composer container outside their normal gates. |

**Angular signal inputs** (parent-to-child wiring; React/HTML do not require these):

```typescript
// On any <velt-multi-thread-comment-dialog-...-wireframe> in an Angular template
[componentConfigSignal]="config()"   // annotations, filteredAnnotations, minimalFilter, ...
[parentLocalUIState]="localUI()"     // darkMode, variant, shadowDom
```

### `shouldShow` gates worth remembering

| Slot | `shouldShow` |
|---|---|
| `empty-placeholder-wireframe` | `noCommentsFound \|\| noCommentsFoundForAppliedFilters` |
| `reset-filter-button-wireframe` | `noCommentsFoundForAppliedFilters` |
| `composer-container-wireframe` | `!hideMultiThreadAnnotationComposer` |

Override any of them with `defaultCondition={false}` (React) / `default-condition="false"` (HTML).

### Common mistakes — DO NOT

**1. DO NOT prefix mapped variables with `componentConfig.`.** Variables are mapped to short names. `<velt-data field="componentConfig.nonDraftCommentsCount" />` resolves to nothing — use `<velt-data field="nonDraftCommentsCount" />`. The exception is the two conflicting names above, which **require** their explicit path (`data.user`, `parentLocalUIState.shadowDom` / `uiState.shadowDom`).

**2. DO NOT read `user` directly inside a Multithread Comments wireframe.** `user` is a conflicting name — use `data.user` (and `data.user.name`, `data.user.photoUrl`).

**3. DO NOT compute the thread count from `annotations.length` or `filteredAnnotations.length`.** The display value is `nonDraftCommentsCount` — it excludes in-progress drafts and matches what the default UI shows.

**4. DO NOT show the empty placeholder with only `velt-if="{noCommentsFound}"`.** It must also cover the filtered case: `velt-if="{noCommentsFound} || {noCommentsFoundForAppliedFilters}"`. Otherwise the placeholder disappears as soon as the user applies a filter that yields zero results.

**5. DO NOT show the reset-filter button outside the filtered-empty case.** Its `shouldShow` is specifically `noCommentsFoundForAppliedFilters` — `noCommentsFound` (truly empty) should not offer "reset filter" since no filter is to blame.

**6. DO NOT reference `isSelected` outside a filter / sort row tag.** It is loop-scoped — referencing it from the panel root or trigger returns `undefined`.

**7. DO NOT iterate `filteredAnnotations` yourself.** The `<velt-multi-thread-comment-dialog-list-wireframe>` iterates and mounts the standard Comment Dialog primitives per annotation, injecting the per-annotation context that nested dialog tags read.

**8. DO NOT mix `defaultCondition` with `velt-if` to mean the same thing.** `defaultCondition={false}` disables the slot's internal `shouldShow` (forcing render). `velt-if` adds a new gate on top. Combining them inverts the semantics you probably want.

**Verification:**
- [ ] Wireframe slots reference mapped variables by short name — `{nonDraftCommentsCount}`, `{minimalFilter}`, `{filteredAnnotations}` — never `componentConfig.<mapped-name>`
- [ ] The two conflicting names use their explicit path: `data.user`, `parentLocalUIState.shadowDom` (per-render) or `uiState.shadowDom` (per-instance)
- [ ] Thread count comes from `{nonDraftCommentsCount}`, not `{annotations.length}` or `{filteredAnnotations.length}`
- [ ] Empty placeholder gates on `{noCommentsFound} || {noCommentsFoundForAppliedFilters}`
- [ ] Reset-filter button gates on `{noCommentsFoundForAppliedFilters}` only
- [ ] Loop-scope (`isSelected`) is used only inside the owning filter / sort row tag
- [ ] The list and composer rely on the standard Comment Dialog wireframe variables (see `wireframe-variables-comment-dialog.md`) — do not iterate `filteredAnnotations` by hand
- [ ] `defaultCondition` / `default-condition` is used only to override an unwanted `shouldShow` gate
- [ ] Angular usage wires `[componentConfigSignal]` and `[parentLocalUIState]` from the parent — React/HTML usage does not

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/multithread-comments/wireframe-variables — "Multithread Comments Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-wireframes.md` (structural catalog), `wireframe-variables-comment-dialog.md` (variables that resolve inside the nested list / composer dialog tags), sibling rules `wireframe-variables-comment-bubble.md` / `wireframe-variables-comment-tool.md` / `wireframe-variables-inline-comments-section.md`
