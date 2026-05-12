---
title: Customize Activity Log Layout with Wireframe Sub-Components
impact: MEDIUM
impactDescription: Full structural control over the Activity Log panel — swap, omit, reorder, or restyle any region without rebuilding the feed pipeline
tags: wireframes, customization, ui, VeltActivityLogWireframe, header, filter, list, date-group, item, show-more, empty, loading
---

## Customize Activity Log Layout with Wireframe Sub-Components

Wrap `VeltActivityLogWireframe` in a `VeltWireframe` block to override the default Activity Log layout. The wireframe is a structural catalog of named slots — each sub-component is a placeholder for a piece of the panel (header title, filter dropdown, list item avatar, empty state, etc.). You compose only the regions you want and the SDK fills them with live data. Without it, you would have to rebuild date grouping, filter dropdowns, and virtualization on top of `useAllActivities` by hand. For the variables and conditional directives (`velt-data`, `velt-if`, `velt-class`) that drive the slots, see `wireframe-variables-activity-log`.

**Incorrect (rendering raw subscription state and skipping the wireframe entirely):**

```jsx
import { useAllActivities } from '@veltdev/react';

function CustomActivityFeed() {
  const activities = useAllActivities();
  // Reimplements date grouping, filtering, empty/loading states, and
  // virtual scrolling that the wireframe slots already provide.
  return (
    <ul>
      {activities?.map(a => <li key={a.id}>{a.displayMessage}</li>)}
    </ul>
  );
}
```

**Correct (compose the wireframe tree inside `VeltWireframe`):**

```jsx
import { VeltWireframe, VeltActivityLog } from '@veltdev/react';
import VeltActivityLogWireframe from '@veltdev/react/VeltActivityLogWireframe';

function CustomActivityLog() {
  return (
    <>
      <VeltWireframe>
        <VeltActivityLogWireframe>
          <VeltActivityLogWireframe.Header />
          <VeltActivityLogWireframe.Loading />
          <VeltActivityLogWireframe.List />
          <VeltActivityLogWireframe.Empty />
        </VeltActivityLogWireframe>
      </VeltWireframe>
      <VeltActivityLog shadowDom={false} />
    </>
  );
}
```

**For HTML / Vanilla JS:**

```html
<velt-wireframe style="display:none;">
  <velt-activity-log-wireframe>
    <velt-activity-log-header-wireframe></velt-activity-log-header-wireframe>
    <velt-activity-log-loading-wireframe></velt-activity-log-loading-wireframe>
    <velt-activity-log-list-wireframe></velt-activity-log-list-wireframe>
    <velt-activity-log-empty-wireframe></velt-activity-log-empty-wireframe>
  </velt-activity-log-wireframe>
</velt-wireframe>
<velt-activity-log></velt-activity-log>
```

### Sub-component catalog (grouped by region)

The wireframe exposes 26 named slots under `VeltActivityLogWireframe`. Group them by region — you almost always override one region at a time rather than the whole tree.

| Region | Slots |
|---|---|
| Root | `VeltActivityLogWireframe` |
| Header | `Header`, `Header.Title`, `Header.CloseButton` |
| Header Filter | `Header.Filter`, `Header.Filter.Trigger`, `Header.Filter.Trigger.Icon`, `Header.Filter.Trigger.Label`, `Header.Filter.Content`, `Header.Filter.Content.Item`, `Header.Filter.Content.Item.Icon`, `Header.Filter.Content.Item.Label` |
| List | `List`, `List.DateGroup`, `List.DateGroup.Label`, `List.Item`, `List.ShowMore` |
| List Item | `List.Item.Icon`, `List.Item.Avatar`, `List.Item.Time`, `List.Item.Content`, `List.Item.Content.User`, `List.Item.Content.Action`, `List.Item.Content.Target`, `List.Item.Content.Detail` |
| States | `Loading`, `Empty` |

### Header region

The header hosts the title, the close button, and the filter dropdown. `Header.Filter.Trigger` is the visible button; `Header.Filter.Content` is the dropdown panel; `Content.Item` is one row inside it (iterated over `availableFilters`).

```jsx
<VeltActivityLogWireframe.Header>
  <VeltActivityLogWireframe.Header.Title />
  <VeltActivityLogWireframe.Header.CloseButton />
  <VeltActivityLogWireframe.Header.Filter>
    <VeltActivityLogWireframe.Header.Filter.Trigger>
      <VeltActivityLogWireframe.Header.Filter.Trigger.Icon />
      <VeltActivityLogWireframe.Header.Filter.Trigger.Label />
    </VeltActivityLogWireframe.Header.Filter.Trigger>
    <VeltActivityLogWireframe.Header.Filter.Content>
      <VeltActivityLogWireframe.Header.Filter.Content.Item>
        <VeltActivityLogWireframe.Header.Filter.Content.Item.Icon />
        <VeltActivityLogWireframe.Header.Filter.Content.Item.Label />
      </VeltActivityLogWireframe.Header.Filter.Content.Item>
    </VeltActivityLogWireframe.Header.Filter.Content>
  </VeltActivityLogWireframe.Header.Filter>
</VeltActivityLogWireframe.Header>
```

```html
<velt-activity-log-header-wireframe>
  <velt-activity-log-header-title-wireframe></velt-activity-log-header-title-wireframe>
  <velt-activity-log-header-close-button-wireframe></velt-activity-log-header-close-button-wireframe>
  <velt-activity-log-header-filter-wireframe>
    <velt-activity-log-header-filter-trigger-wireframe>
      <velt-activity-log-header-filter-trigger-icon-wireframe></velt-activity-log-header-filter-trigger-icon-wireframe>
      <velt-activity-log-header-filter-trigger-label-wireframe></velt-activity-log-header-filter-trigger-label-wireframe>
    </velt-activity-log-header-filter-trigger-wireframe>
    <velt-activity-log-header-filter-content-wireframe>
      <velt-activity-log-header-filter-content-item-wireframe>
        <velt-activity-log-header-filter-content-item-icon-wireframe></velt-activity-log-header-filter-content-item-icon-wireframe>
        <velt-activity-log-header-filter-content-item-label-wireframe></velt-activity-log-header-filter-content-item-label-wireframe>
      </velt-activity-log-header-filter-content-item-wireframe>
    </velt-activity-log-header-filter-content-wireframe>
  </velt-activity-log-header-filter-wireframe>
</velt-activity-log-header-wireframe>
```

### List region — date groups, items, show-more

`List` iterates the activity pipeline. `DateGroup` is the per-day bucket; `Item` is one activity record; `ShowMore` is the "Show N more" affordance shown when a date group exceeds `defaultVisibleCount` (default `5`).

```jsx
<VeltActivityLogWireframe.List>
  <VeltActivityLogWireframe.List.DateGroup>
    <VeltActivityLogWireframe.List.DateGroup.Label />
  </VeltActivityLogWireframe.List.DateGroup>
  <VeltActivityLogWireframe.List.Item>
    <VeltActivityLogWireframe.List.Item.Icon />
    <VeltActivityLogWireframe.List.Item.Avatar />
    <VeltActivityLogWireframe.List.Item.Content>
      <VeltActivityLogWireframe.List.Item.Content.User />
      <VeltActivityLogWireframe.List.Item.Content.Action />
      <VeltActivityLogWireframe.List.Item.Content.Target />
      <VeltActivityLogWireframe.List.Item.Content.Detail />
    </VeltActivityLogWireframe.List.Item.Content>
    <VeltActivityLogWireframe.List.Item.Time />
  </VeltActivityLogWireframe.List.Item>
  <VeltActivityLogWireframe.List.ShowMore />
</VeltActivityLogWireframe.List>
```

```html
<velt-activity-log-list-wireframe>
  <velt-activity-log-list-date-group-wireframe>
    <velt-activity-log-list-date-group-label-wireframe></velt-activity-log-list-date-group-label-wireframe>
  </velt-activity-log-list-date-group-wireframe>
  <velt-activity-log-list-item-wireframe>
    <velt-activity-log-list-item-icon-wireframe></velt-activity-log-list-item-icon-wireframe>
    <velt-activity-log-list-item-avatar-wireframe></velt-activity-log-list-item-avatar-wireframe>
    <velt-activity-log-list-item-content-wireframe>
      <velt-activity-log-list-item-content-user-wireframe></velt-activity-log-list-item-content-user-wireframe>
      <velt-activity-log-list-item-content-action-wireframe></velt-activity-log-list-item-content-action-wireframe>
      <velt-activity-log-list-item-content-target-wireframe></velt-activity-log-list-item-content-target-wireframe>
      <velt-activity-log-list-item-content-detail-wireframe></velt-activity-log-list-item-content-detail-wireframe>
    </velt-activity-log-list-item-content-wireframe>
    <velt-activity-log-list-item-time-wireframe></velt-activity-log-list-item-time-wireframe>
  </velt-activity-log-list-item-wireframe>
  <velt-activity-log-list-show-more-wireframe></velt-activity-log-list-show-more-wireframe>
</velt-activity-log-list-wireframe>
```

The four `Content.*` slots are the rendered sentence — `User` "edited" `Action` `Target` ("Page 1") `Detail` ("changed 4 fields"). Override them one-at-a-time when you want to restyle a single word without rebuilding the row.

### Loading and Empty states

`Loading` renders while `allActivities === null`; `Empty` renders when `filteredActivities !== null && filteredActivities.length === 0`. You do not need to gate them yourself — they have built-in `shouldShow` predicates (see `wireframe-variables-activity-log` for the predicate reference).

```jsx
<VeltActivityLogWireframe.Loading />
<VeltActivityLogWireframe.Empty />
```

```html
<velt-activity-log-loading-wireframe></velt-activity-log-loading-wireframe>
<velt-activity-log-empty-wireframe></velt-activity-log-empty-wireframe>
```

### Disable Shadow DOM for CSS access

Wireframe slots render inside the `VeltActivityLog` shadow root by default. To style them with your own CSS, set `shadowDom={false}` on the host:

```jsx
<VeltActivityLog shadowDom={false} />
```

```html
<velt-activity-log shadow-dom="false"></velt-activity-log>
```

### Common Mistakes — DO NOT

**1. DO NOT omit `VeltWireframe`.** Wireframe sub-components must live inside a `<VeltWireframe>` (React) / `<velt-wireframe>` (HTML) block. Rendering `<VeltActivityLogWireframe>` at the top level has no effect — the SDK only scans for slots inside `VeltWireframe`.

**2. DO NOT also render `<VeltActivityLog>` inside the wireframe block.** The wireframe block is the *template*; the host `<VeltActivityLog>` is what actually paints to the screen. Keep them as siblings — the wireframe is hidden (`display:none`) and the host reads its structure.

**3. DO NOT mount and unmount the wireframe on toggle.** The wireframe registers slot definitions with the SDK at mount time; remounting forces re-registration and can blank the live host. Keep it mounted alongside the host (`display:none` toggling is fine for the host, but the wireframe should stay alive).

**4. DO NOT conflate wireframe sub-components with the host's standalone primitives.** `VeltActivityLogHeader` (no `Wireframe` suffix, listed under `core-activity-log-component`) is a standalone web component you can drop into ad-hoc layouts; `VeltActivityLogWireframe.Header` is a *slot definition* the host reads. They share a name family but are not interchangeable.

**Verification:**
- [ ] `VeltWireframe` wraps the `VeltActivityLogWireframe` tree
- [ ] Wireframe block and `VeltActivityLog` host are siblings, both rendered (not one-inside-the-other)
- [ ] Sub-component nesting matches the documented tree (e.g., `List.Item.Content.User` lives inside `List.Item.Content` inside `List.Item` inside `List`)
- [ ] `shadowDom={false}` (React) / `shadow-dom="false"` (HTML) is set on the host when applying custom CSS
- [ ] Slot content uses `velt-data` / `velt-if` / `velt-class` for dynamic bindings, not custom `useAllActivities` re-implementations (see `wireframe-variables-activity-log`)
- [ ] HTML tags use the kebab-case `<velt-activity-log-...-wireframe>` form, not the React dotted form

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/activity-logs/activity-logs-wireframes — "Activity Logs Wireframes"
- https://docs.velt.dev/ui-customization/features/async/activity-logs/activity-logs-wireframe-variables — "Activity Logs Wireframe Variables"
