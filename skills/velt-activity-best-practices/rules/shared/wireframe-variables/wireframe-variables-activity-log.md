---
title: Bind Activity Log Wireframe Slots Using Template Variables
impact: MEDIUM
impactDescription: Drives dynamic content, conditional rendering, and class toggling inside Activity Log wireframe slots without manual subscriptions
tags: wireframe, template-variables, velt-data, velt-if, velt-class, defaultCondition, componentConfigSignal, parentLocalUIState, activity-log
---

## Bind Activity Log Wireframe Slots Using Template Variables

The Activity Log wireframe exposes a fixed set of template variables that you read with three directives — `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Use these instead of re-implementing date grouping, filtering, or actor lookups on top of `useAllActivities`. Variables are mapped — reference them by their short name, **never** as `componentConfig.var`.

**Incorrect (rebuilding feed state from `useAllActivities` and conditionally mounting wireframe slots):**

```jsx
import { useAllActivities } from '@veltdev/react';
import VeltActivityLogWireframe from '@veltdev/react/VeltActivityLogWireframe';

function ActivityRow({ row }) {
  const activities = useAllActivities();
  const isMine = row.user.userId === currentUser.userId;
  // Reimplements actor lookup, formatting, and visibility gating that the
  // wireframe already exposes via {activity}, {user}, and shouldShow.
  if (!activities) return null;
  return (
    <VeltActivityLogWireframe.List.Item className={isMine ? 'mine' : ''}>
      <span>{row.user.name}</span>
      <span>{row.action}</span>
    </VeltActivityLogWireframe.List.Item>
  );
}
```

**Correct (read the slot's injected variables via `velt-data` / `velt-if` / `velt-class`):**

```jsx
import VeltActivityLogWireframe from '@veltdev/react/VeltActivityLogWireframe';

<VeltActivityLogWireframe veltIf="{isEnabled} && {isOpen}">
  <VeltActivityLogWireframe.List>
    <VeltActivityLogWireframe.List.Item
      veltClass="'mine': {activity.user.userId} === {user.userId}"
    >
      <VeltActivityLogWireframe.List.Item.Avatar />
      <VeltActivityLogWireframe.List.Item.Content>
        <VeltActivityLogWireframe.List.Item.Content.User />
        <VeltActivityLogWireframe.List.Item.Content.Action />
        <VeltActivityLogWireframe.List.Item.Content.Target />
      </VeltActivityLogWireframe.List.Item.Content>
      <VeltActivityLogWireframe.List.Item.Time />
    </VeltActivityLogWireframe.List.Item>
    <VeltActivityLogWireframe.List.ShowMore veltIf="{remainingCount} > 0">
      <span>Show <VeltData field="remainingCount" /> more</span>
    </VeltActivityLogWireframe.List.ShowMore>
  </VeltActivityLogWireframe.List>
</VeltActivityLogWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-activity-log-wireframe velt-if="{isEnabled} && {isOpen}">
  <velt-activity-log-list-wireframe>
    <velt-activity-log-list-item-wireframe
      velt-class="'mine': {activity.user.userId} === {user.userId}">
      <velt-data field="activity.user.name"></velt-data>
      <velt-data field="activity.action"></velt-data>
    </velt-activity-log-list-item-wireframe>
    <velt-activity-log-list-show-more-wireframe velt-if="{remainingCount} > 0">
      <span>Show <velt-data field="remainingCount"></velt-data> more</span>
    </velt-activity-log-list-show-more-wireframe>
  </velt-activity-log-list-wireframe>
</velt-activity-log-wireframe>
```

### Variable namespaces

The wireframe injects four namespaces at the root of every slot, plus loop-scoped variables inside iteration primitives.

**App State** — globally resolved identity / theme:

| Variable | Type | Use |
|---|---|---|
| `user` | `User` | Currently identified end-user. Compare to `activity.user.userId` to highlight "mine". |
| `darkMode` | `boolean` | Global dark-mode flag. Pair with `velt-class="'theme-dark': {darkMode}"`. |

**Feature State** — SDK-level capability flag:

| Variable | Type | Use |
|---|---|---|
| `isEnabled` | `boolean` | `true` when Activity Log is enabled in the SDK. Gate the root wireframe with `velt-if="{isEnabled}"`. |

**Data State** — the activity pipeline (raw → filtered → grouped → virtualized):

| Variable | Type | Notes |
|---|---|---|
| `allActivities` | `ActivityRecord[] \| null` | `null` while loading — the loading slot uses this to decide visibility. |
| `filteredActivities` | `ActivityRecord[] \| null` | Result of applying `activeFilter`. Empty state checks `filteredActivities.length === 0`. |
| `groupedActivities` | `ActivityDateGroup[]` | Activities bucketed by calendar date. |
| `virtualScrollItems` | `ActivityScrollItem[]` | Flattened union (`'date-header' \| 'activity' \| 'show-more'`) the virtual scroller iterates. |
| `activeFilter` | `'all' \| ActivityFeatureType` | Selected dropdown value. |
| `availableFilters` | `ActivityFilterOption[]` | All filter rows shown in the dropdown. |

**UI State** — per-instance view toggles:

| Variable | Type | Notes |
|---|---|---|
| `isOpen` | `boolean` | Panel open/closed. |
| `darkMode` | `boolean` | Per-instance dark-mode override (host attribute beats global config). |
| `variant` | `string` | Variant tag from the host attribute. |
| `expandedGroups` | `Set<string>` | Date-group keys that have been expanded past the truncation limit. Internal — read indirectly via `isExpanded` inside `show-more`. |
| `defaultVisibleCount` | `number` | Items per date-group before "Show more" appears. Defaults to `5`. |
| `filterDropdownOpen` | `boolean` | Filter dropdown menu open. |

### Loop-scope variables (only valid inside iteration slots)

These are injected by the iterating parent; referencing them outside the listed slot returns `undefined`.

| Variable | Type | Available in |
|---|---|---|
| `dateGroup` | `ActivityDateGroup` | `<velt-activity-log-list-date-group-wireframe>`, its label child, and `<velt-activity-log-list-show-more-wireframe>` |
| `activity` | `ActivityRecord` | `<velt-activity-log-list-item-wireframe>` and all descendants |
| `filter` | `ActivityFilterOption` | `<velt-activity-log-header-filter-content-item-wireframe>`, its icon and label children |
| `isActive` | `boolean` | Same slots as `filter`. `true` when the row matches `activeFilter`. |
| `isExpanded` | `boolean` | `<velt-activity-log-list-show-more-wireframe>` |
| `remainingCount` | `number` | `<velt-activity-log-list-show-more-wireframe>`. Items still hidden in the date-group. |

**Aliases:** `activity` and `activityRecord` resolve to the same record; `filter` and `filterOption` resolve to the same option. Prefer the short form (`activity`, `filter`) — the long form exists for backwards-compatibility.

### Common props and signal inputs

Every Activity Log primitive accepts one cross-cutting prop, plus two Angular signal inputs for parent-driven state:

| React Prop | HTML Attribute | Type | Default | Behavior |
|---|---|---|---|---|
| `defaultCondition` | `default-condition` | `boolean \| "true" \| "false"` | `true` | When `false`, the component renders regardless of its internal `shouldShow` gate. Use to force-show a slot you would otherwise hide. |

**Angular signal inputs** (parent-to-child wiring; React/HTML do not require these):

```typescript
// On any <velt-activity-log-...-wireframe> in an Angular template
[componentConfigSignal]="config()"     // filtered activities, date groups,
                                       // virtual scroll items, available filters
[parentLocalUIState]="localUI()"       // darkMode, variant, isOpen, etc.
```

The root `<velt-activity-log>` element additionally accepts attributes that map onto config and local UI state slots: `dark-mode`, `variant`, `is-open`, …

### `shouldShow` gates worth remembering

Several slots have a built-in visibility predicate. Read them as a reference when debugging "why is nothing rendering":

| Slot | `shouldShow` |
|---|---|
| `activity-log-wireframe` (root) | `isEnabled === true && isOpen === true` |
| `activity-log-loading-wireframe` | `allActivities === null` |
| `activity-log-empty-wireframe` | `filteredActivities !== null && filteredActivities.length === 0` |
| `activity-log-list-show-more-wireframe` | `dateGroup.totalCount > defaultVisibleCount` |

Override any of them with `defaultCondition={false}` (React) / `default-condition="false"` (HTML) when you need the slot to render unconditionally.

### Common mistakes — DO NOT

**1. DO NOT prefix variables with `componentConfig.`** Variables are mapped to short names. `<velt-data field="componentConfig.filteredActivities" />` resolves to nothing — use `<velt-data field="filteredActivities" />`.

**2. DO NOT reference loop-scope variables outside their slot.** `{activity}` is only defined inside `<velt-activity-log-list-item-wireframe>`. Referencing it from the header or the empty slot returns `undefined` silently.

**3. DO NOT mix `defaultCondition` with `velt-if` to mean the same thing.** `defaultCondition={false}` *disables* the slot's internal gate (forcing render). `velt-if` *adds* a new gate on top. Combining them inverts the semantics you probably want.

**Verification:**
- [ ] Wireframe slots reference variables by short name, never `componentConfig.var`
- [ ] Loop-scope variables (`activity`, `dateGroup`, `filter`, `isActive`, `isExpanded`, `remainingCount`) are used only inside their owning iteration slot
- [ ] Root wireframe is gated by `velt-if="{isEnabled}"` (and usually `&& {isOpen}`) — not by remounting
- [ ] `defaultCondition` / `default-condition` is used only to override an unwanted `shouldShow` gate, not as a generic visibility prop
- [ ] Angular usage wires `[componentConfigSignal]` and `[parentLocalUIState]` from the parent — React/HTML usage does not
- [ ] Alias usage (`activity` ↔ `activityRecord`, `filter` ↔ `filterOption`) is consistent across siblings; prefer the short form

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/activity-logs/activity-logs-wireframe-variables — "Activity Logs Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
