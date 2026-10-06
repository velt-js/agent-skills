---
title: Bind Live Selection Wireframe Slots Using componentConfig Template Variables
impact: MEDIUM
impactDescription: Drives the remote-user selection indicator's dynamic content, conditional rendering, and class toggling without manual subscriptions
tags: wireframe, template-variables, velt-data, velt-if, velt-class, componentConfig, flat-config, live-selection, selection-element-portal
---

## Live Selection Wireframe Variables — Limited Support

Document the Live Selection runtime model and CSS-based customization approach until wireframe-tag support ships.

**Important:** Live Selection does **not** currently expose a `<velt-...-wireframe>` tag. `velt-data` / `velt-if` / `velt-class` interpolation is not yet available on this feature. Until wireframe-tag registration ships, customize Live Selection through CSS targeting `<velt-selection-element-portal>`. The variables below document the runtime model for reference.

The **Live Selection** feature renders a floating "user X is selecting this" indicator anchored to a remote user's current selection range. Once wireframe-tag interpolation ships, Live Selection will use the **flat-config** access pattern — every variable addressed via the explicit `componentConfig.<path>` form, never short names.

- **Wireframe (HTML):** No direct wireframe slot — per-element visual customization is not currently exposed via a dedicated `*-wireframe` tag.
- **Wireframe (React):** No direct wireframe slot.

Use CSS to customize Live Selection appearance until wireframe-tag support ships. Disable the default styling and target the dynamic classes:

```js
const selectionElement = Velt.getSelectionElement(); // React: client.getSelectionElement()
selectionElement.disableDefaultStyling();
```

```css
/* Added to an element while a remote user is on it */
.velt-live-selection-on-element {
  outline: 2px solid var(--velt-color);
  outline-offset: -2px;
}
/* Added to a text node while a remote user has it selected */
.velt-live-selection-on-text {
  background: rgba(255, 200, 0, 0.3);
}
```

### Runtime model variables (reference only, not bindable yet)

| Variable | Type | Use |
|---|---|---|
| `componentConfig.position` | `CursorPosition \| null` | Selection bounding-rect (`top`, `left`, `right`, `bottom`). Internal — used to compute inline style. |
| `componentConfig.userIndicatorPosition` | `UserIndicatorPosition` | Where the indicator is anchored relative to the selection range. |
| `componentConfig.userIndicatorType` | `UserIndicatorType` | What to render: `'avatar'` or `'label'`. |
| `componentConfig.overlayPosition` | `{ originX, originY, overlayX, overlayY }` | CDK overlay anchoring config. Internal. |
| `componentConfig.selections` | `Selection[]` | Active remote selections. Each entry has `user` plus selection-range data. |

### Type Reference

Types referenced by the variables above (see [data-models.mdx](/api-reference/sdk/models/data-models)):

| Type | Shape | Notes |
|---|---|---|
| `UserIndicatorPosition` | `'start' \| 'end'` | Anchor edge of the indicator relative to the selection. Set globally with `setUserIndicatorPosition()`. |
| `UserIndicatorType` | `'avatar' \| 'label'` | What to show in the indicator. Set globally with `setUserIndicatorType()`. |
| `CursorPosition` | `{ top, left, ... }` | Selection position shape, shared with cursor positioning. |
| `Selection` | `{ user, type, targetElement, targetTextRange, pageInfo, timestamp }` | Remote-selection record. `type` is `'focus' \| 'click' \| 'selection'`. |
| `User` | See data-models | Identified end-user (used by `componentConfig.selections.<i>.user`). |

### Subcomponent

| Tag | Public element | Notes |
|---|---|---|
| `<velt-selection-element-portal>` | `<velt-selection-element-portal>` | The floating user-indicator (avatar / name / colour bar). No direct `*-wireframe` tag currently registered. |

### Common mistakes — DO NOT

**1. DO NOT use `<velt-selection-element-portal-wireframe>`.** No wireframe tag is registered for Live Selection. Attempting to use it will have no effect.

**2. DO NOT try to use `velt-data` / `velt-if` / `velt-class` on the selection indicator.** These directives require a registered wireframe tag to inject variables. Use CSS on `<velt-selection-element-portal>` instead.

**3. DO NOT drop the `componentConfig.` prefix** if/when wireframe tag support ships. Live Selection uses flat-config — once available, all variable reads will require the full path.

**Verification:**
- [ ] Live Selection appearance is customized through CSS (`.velt-live-selection-on-element`, `.velt-live-selection-on-text`) after `disableDefaultStyling()` when needed
- [ ] No `<velt-selection-element-portal-wireframe>` usage (tag not registered)
- [ ] `velt-data` / `velt-if` / `velt-class` are NOT used on this feature until wireframe-tag support is confirmed

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/realtime/live-selection-wireframe-variables — "Live Selection Wireframe Variables"
- https://docs.velt.dev/ui-customization/features/realtime/live-selection - "Enable/Disable Default Styling"
- https://docs.velt.dev/api-reference/sdk/models/data-models#userindicatortype - `UserIndicatorPosition`, `UserIndicatorType`, `CursorPosition`, `Selection`
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
