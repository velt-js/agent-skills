---
title: Bind Live Selection Wireframe Slots Using componentConfig Template Variables
impact: MEDIUM
impactDescription: Drives the remote-user selection indicator's dynamic content, conditional rendering, and class toggling without manual subscriptions
tags: wireframe, template-variables, velt-data, velt-if, velt-class, componentConfig, flat-config, live-selection, selection-element-portal
---

## Bind Live Selection Wireframe Slots Using componentConfig Template Variables

The **Live Selection** feature renders a floating "user X is selecting this" indicator anchored to a remote user's current selection range. The customizable primitive is `<velt-selection-element-portal-wireframe>` (React: `VeltSelectionElementPortalWireframe`). Like Cursors, Live Selection uses the **flat-config** access pattern — every variable is addressed via the explicit `componentConfig.<path>` form, never short names. Read variables with `<velt-data field="...">` for text, `velt-if="{var}"` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling.

**Incorrect (short-name lookup, no `componentConfig.` prefix):**

```jsx
<VeltSelectionElementPortalWireframe>
  {/* Does NOT resolve — Live Selection is flat-config */}
  <velt-data field="selections.0.user.name" />
</VeltSelectionElementPortalWireframe>
```

**Correct (flat-config `componentConfig.<path>` with gating):**

```jsx
<VeltSelectionElementPortalWireframe
  velt-if="{componentConfig.selections.length} > 0"
  velt-class="'pos-{componentConfig.userIndicatorPosition}': true, 'type-{componentConfig.userIndicatorType}': true">
  <div className="my-selection-indicator">
    <img
      className="my-selection-indicator__avatar"
      velt-if="{componentConfig.userIndicatorType} === 'Avatar'" />
    <span
      className="my-selection-indicator__name"
      velt-if="{componentConfig.userIndicatorType} === 'Name'">
      <velt-data field="componentConfig.selections.0.user.name" />
    </span>
  </div>
</VeltSelectionElementPortalWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-selection-element-portal-wireframe
  velt-if="{componentConfig.selections.length} > 0"
  velt-class="'pos-{componentConfig.userIndicatorPosition}': true">
  <div class="my-selection-indicator">
    <span class="my-selection-indicator__name">
      <velt-data field="componentConfig.selections.0.user.name"></velt-data>
    </span>
  </div>
</velt-selection-element-portal-wireframe>
```

### `<velt-selection-element-portal-wireframe>` variables

| Variable | Type | Use |
|---|---|---|
| `componentConfig.position` | `CursorPosition \| null` | Selection bounding-rect (`top`, `left`, `right`, `bottom`). Internal — used to compute inline style. |
| `componentConfig.userIndicatorPosition` | `UserIndicatorPosition` | Where the indicator is anchored relative to the selection range. |
| `componentConfig.userIndicatorType` | `UserIndicatorType` | What to render — avatar, name label, or both. |
| `componentConfig.overlayPosition` | `{ originX, originY, overlayX, overlayY }` | CDK overlay anchoring config. Internal. |
| `componentConfig.selections` | `Selection[]` | Active remote selections. Each entry has `user` plus selection-range data. |

### Type Reference

Types referenced by the variables above (see [data-models.mdx](/api-reference/sdk/models/data-models)):

| Type | Shape | Notes |
|---|---|---|
| `UserIndicatorPosition` | `'start' \| 'end' \| ...` | Enum — anchor edge of the selection range. New in this release. |
| `UserIndicatorType` | `'Avatar' \| 'Name' \| ...` | Enum — what to show inside the indicator. New in this release. |
| `CursorPosition` | `{ top, left, right, bottom }` | Selection bounding-rect — shared with cursor positioning. |
| `Selection` | `{ user: User, ... }` | Remote-selection record. `user` is the standard `User` type. |
| `User` | See data-models | Identified end-user (used by `componentConfig.selections.<i>.user`). |

### Subcomponent

| Tag | Public element | Notes |
|---|---|---|
| `<velt-selection-element-portal-wireframe>` | `<velt-selection-element-portal>` | The floating user-indicator (avatar / name / colour bar). No `shouldShow` override — render is gated by whether `componentConfig.selections` has any active entries. |

### Common mistakes — DO NOT

**1. DO NOT drop the `componentConfig.` prefix.** Live Selection is flat-config. `<velt-data field="selections.0.user.name" />` resolves to nothing.

**2. DO NOT render the indicator unconditionally.** Gate the wireframe (or its inner content) on `velt-if="{componentConfig.selections.length} > 0"` — otherwise you render an empty floater when no remote user is selecting.

**3. DO NOT branch on `userIndicatorType` without covering all values.** The enum includes more than `'Avatar'` / `'Name'`; use class-toggle (`velt-class="'type-{componentConfig.userIndicatorType}': true"`) to style every variant uniformly.

**Verification:**
- [ ] All variable references use the `componentConfig.<path>` form (flat-config), never short names
- [ ] Indicator render is gated on `{componentConfig.selections.length} > 0`
- [ ] `userIndicatorPosition` / `userIndicatorType` are consumed via `velt-class` or `velt-if`, not parsed manually
- [ ] `componentConfig.position` is treated as internal — used for layout, not for app logic

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/realtime/live-selection-wireframe-variables — "Live Selection Wireframe Variables"
- https://docs.velt.dev/api-reference/sdk/models/data-models — `UserIndicatorPosition`, `UserIndicatorType`, `CursorPosition`, `Selection`
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
